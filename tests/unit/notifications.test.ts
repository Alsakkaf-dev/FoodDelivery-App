import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'node:crypto';
import receipt from '../fixtures/whatsapp-receipt.json';

// ── Mocks ───────────────────────────────────────────────────────────────────
vi.mock('server-only', () => ({}));

const { holder, waSpy, pushSpy } = vi.hoisted(() => ({
  holder: { admin: undefined as unknown },
  waSpy: vi.fn(async (_to: string, _body: string) => ({ ok: true, id: 'wamid.X' }) as { ok: boolean; id?: string; reason?: string }),
  pushSpy: vi.fn(async () => ({ ok: true }) as { ok: boolean; reason?: string }),
}));

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => holder.admin }));
// Keep the real verifyWebhookSignature (HMAC); only stub the network sender.
vi.mock('@/lib/notifications/whatsapp', async (orig) => ({
  ...(await orig<typeof import('@/lib/notifications/whatsapp')>()),
  sendWhatsApp: waSpy,
}));
vi.mock('@/lib/notifications/webpush', () => ({ sendWebPush: pushSpy }));

import { dispatchOrderEvent, dispatchBroadcast } from '@/lib/notifications/dispatch';

// Admin recorder: insert resolves {error}; selects resolve table-specific data;
// update records its payload. Terminal awaits go through `then`.
function makeAdmin(cfg: { insertError?: unknown; subs?: unknown[]; users?: unknown[] } = {}) {
  const rec = { inserts: [] as { table: string; payload: unknown }[], updates: [] as { table: string; payload: unknown }[] };
  function from(table: string) {
    const b = {
      insert: (payload: unknown) => {
        rec.inserts.push({ table, payload });
        return Promise.resolve({ error: table === 'notifications' ? (cfg.insertError ?? null) : null });
      },
      update: (payload: unknown) => {
        rec.updates.push({ table, payload });
        return b;
      },
      select: () => b,
      eq: () => b,
      not: () => b,
      then: (res: (v: unknown) => unknown, rej?: (e: unknown) => unknown) => {
        const data = table === 'push_subscriptions' ? (cfg.subs ?? []) : table === 'users' ? (cfg.users ?? []) : [];
        return Promise.resolve({ data, error: null }).then(res, rej);
      },
    };
    return b;
  }
  return { client: { from }, rec };
}

const baseEvent = {
  orderId: 'o-1',
  userId: 'u-1',
  phone: '+60123',
  lang: 'en' as const,
  event: 'order_confirmed' as const,
  vars: { order_no: 'A-001', window: '2–7 PM' },
};

beforeEach(() => {
  waSpy.mockClear();
  waSpy.mockResolvedValue({ ok: true, id: 'wamid.X' });
  pushSpy.mockClear();
  pushSpy.mockResolvedValue({ ok: true });
});

describe('dispatchOrderEvent — exactly once + fallback (US-022)', () => {
  it('sends WhatsApp once and records the provider message id', async () => {
    const a = makeAdmin();
    holder.admin = a.client;
    const res = await dispatchOrderEvent(baseEvent);
    expect(res).toMatchObject({ ok: true, channel: 'whatsapp' });
    expect(waSpy).toHaveBeenCalledTimes(1);
    expect(a.rec.updates).toContainEqual(
      expect.objectContaining({ table: 'notifications', payload: expect.objectContaining({ status: 'sent', provider_message_id: 'wamid.X' }) }),
    );
  });

  it('dedupes: a second dispatch for the same (order_id, event) is a no-op', async () => {
    holder.admin = makeAdmin({ insertError: { code: '23505', message: 'duplicate key' } }).client;
    const res = await dispatchOrderEvent(baseEvent);
    expect(res).toMatchObject({ deduped: true });
    expect(waSpy).not.toHaveBeenCalled(); // never re-sent
  });

  it('falls back to Web Push when WhatsApp is unavailable', async () => {
    waSpy.mockResolvedValueOnce({ ok: false, reason: 'not_configured' });
    const a = makeAdmin({ subs: [{ endpoint: 'https://push/1', p256dh: 'p', auth: 'a' }] });
    holder.admin = a.client;
    const res = await dispatchOrderEvent(baseEvent);
    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(res).toMatchObject({ ok: true, channel: 'web_push' });
  });
});

describe('dispatchBroadcast — once per opted-in customer in their language (US-038)', () => {
  it('sends each opted-in user one message in their preferred language', async () => {
    holder.admin = makeAdmin({
      users: [
        { id: 'u1', phone: '+601', lang: 'en' },
        { id: 'u2', phone: '+602', lang: 'ar' },
      ],
    }).client;
    const res = await dispatchBroadcast('Open now!', 'مفتوح الآن!');
    expect(res.count).toBe(2);
    expect(waSpy).toHaveBeenCalledTimes(2);
    expect(waSpy).toHaveBeenCalledWith('+601', 'Open now!');
    expect(waSpy).toHaveBeenCalledWith('+602', 'مفتوح الآن!');
  });
});

describe('WhatsApp webhook — handshake + signed receipts', () => {
  it('verifies the X-Hub-Signature-256 HMAC (valid vs tampered)', async () => {
    process.env.WHATSAPP_APP_SECRET = 'test-secret';
    const { verifyWebhookSignature } = await import('@/lib/notifications/whatsapp');
    const raw = JSON.stringify(receipt);
    const good = 'sha256=' + crypto.createHmac('sha256', 'test-secret').update(raw).digest('hex');
    expect(verifyWebhookSignature(raw, good)).toBe(true);
    expect(verifyWebhookSignature(raw, 'sha256=deadbeef')).toBe(false);
    expect(verifyWebhookSignature(raw, null)).toBe(false);
  });

  it('GET echoes the challenge on a matching verify token, else 403', async () => {
    process.env.WHATSAPP_VERIFY_TOKEN = 'verify-me';
    const { GET } = await import('@/app/api/webhooks/whatsapp/route');
    const { NextRequest } = await import('next/server');
    const ok = await GET(
      new NextRequest('https://x/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=verify-me&hub.challenge=PING'),
    );
    expect(ok.status).toBe(200);
    expect(await ok.text()).toBe('PING');
    const bad = await GET(new NextRequest('https://x/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=wrong'));
    expect(bad.status).toBe(403);
  });

  it('POST maps a signed receipt to its notification by message id, rejects a bad signature', async () => {
    process.env.WHATSAPP_APP_SECRET = 'test-secret';
    const a = makeAdmin();
    holder.admin = a.client;
    const { POST } = await import('@/app/api/webhooks/whatsapp/route');
    const { NextRequest } = await import('next/server');
    const raw = JSON.stringify(receipt);
    const sig = 'sha256=' + crypto.createHmac('sha256', 'test-secret').update(raw).digest('hex');

    const good = await POST(
      new NextRequest('https://x/api/webhooks/whatsapp', { method: 'POST', body: raw, headers: { 'x-hub-signature-256': sig } }),
    );
    expect(good.status).toBe(200);
    expect(a.rec.updates).toContainEqual(
      expect.objectContaining({ table: 'notifications', payload: { status: 'delivered' } }),
    );

    const bad = await POST(
      new NextRequest('https://x/api/webhooks/whatsapp', { method: 'POST', body: raw, headers: { 'x-hub-signature-256': 'sha256=bad' } }),
    );
    expect(bad.status).toBe(401);
  });
});
