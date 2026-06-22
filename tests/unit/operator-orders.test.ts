import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import en from '../../messages/en.json';
import ar from '../../messages/ar.json';
import { PaymentActions } from '@/components/operator/payment-actions';
import { BroadcastForm } from '@/components/operator/broadcast-form';

// ── Mocks (orders.ts / notify.ts are `'use server'`) ────────────────────────
vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({
  cookies: () => ({ get: () => undefined, getAll: () => [], set: () => {} }),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: () => {} }) }));

const { holder, requireRole, dispatchSpy, broadcastSpy } = vi.hoisted(() => ({
  holder: { db: undefined as unknown, admin: undefined as unknown },
  requireRole: vi.fn(async () => ({ id: 'op', phone: '+60', lang: 'en', name: 'Op' })),
  dispatchSpy: vi.fn(async (_opts: { event: string; vars: Record<string, string> }) => ({ ok: true })),
  broadcastSpy: vi.fn(async (_en: string, _ar: string) => ({ count: 3 })),
}));

vi.mock('@/lib/supabase/server', () => ({ createClient: () => holder.db }));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => holder.admin }));
vi.mock('@/lib/auth/roles', () => ({
  requireRole,
  getProfile: vi.fn(),
  RoleError: class RoleError extends Error {
    code: string;
    constructor(code: string) {
      super(code);
      this.code = code;
    }
  },
}));
vi.mock('@/lib/notifications/dispatch', () => ({
  dispatchOrderEvent: dispatchSpy,
  dispatchBroadcast: broadcastSpy,
}));

import { verifyPayment, refuseOrder, endOfDay } from '@/lib/domain/orders';
import { broadcast } from '@/lib/domain/notify';

const ORDER_ID = '11111111-1111-1111-1111-111111111111';

// Thenable Supabase recorder: terminal awaits + maybeSingle/single resolve `resolved`.
function makeClient(resolved: Record<string, unknown>) {
  const calls = { updates: [] as { table: string; payload: Record<string, unknown> }[] };
  function from(table: string) {
    let payload: Record<string, unknown> = {};
    const b = {
      select: () => b,
      eq: () => b,
      gte: () => b,
      neq: () => b,
      not: () => b,
      order: () => b,
      update: (p: Record<string, unknown>) => {
        payload = p;
        calls.updates.push({ table, payload: p });
        return b;
      },
      insert: () => b,
      maybeSingle: async () => resolved,
      single: async () => resolved,
      then: (res: (v: unknown) => unknown, rej?: (e: unknown) => unknown) => Promise.resolve(resolved).then(res, rej),
    };
    return b;
  }
  return { client: { from }, calls };
}

const ADMIN_ROWS: Record<string, unknown> = {
  orders: { order_no: 'A-001', customer_id: 'cust-1', session_id: 'sess-1' },
  users: { phone: '+60123', lang: 'en', name: 'Aisha' },
  daily_session: { delivery_window: '2–7 PM' },
};
function makeAdmin() {
  function from(table: string) {
    const b = { select: () => b, eq: () => b, single: async () => ({ data: ADMIN_ROWS[table], error: null }) };
    return b;
  }
  return { from };
}

beforeEach(() => {
  requireRole.mockClear();
  dispatchSpy.mockClear();
  broadcastSpy.mockClear();
  holder.admin = makeAdmin();
});

describe('verifyPayment — verdicts notify the customer (US-035)', () => {
  it('marks verified and fires one payment notification', async () => {
    const c = makeClient({ error: null });
    holder.db = c.client;
    const res = await verifyPayment(ORDER_ID, 'verified');
    expect(requireRole).toHaveBeenCalledWith('operator');
    expect(res.ok).toBe(true);
    expect(c.calls.updates).toContainEqual({ table: 'orders', payload: { payment_status: 'verified' } });
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
  });

  it('marks rejected and notifies the customer', async () => {
    holder.db = makeClient({ error: null }).client;
    const res = await verifyPayment(ORDER_ID, 'rejected');
    expect(res.ok).toBe(true);
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    const arg = dispatchSpy.mock.calls[0]?.[0];
    expect(arg?.event).toBe('payment_status');
    expect(arg?.vars.status).toBe('rejected');
  });
});

describe('refuseOrder — notify + restock (US-036)', () => {
  it('cancels a New/Confirmed order with a reason and notifies (restock fires via DB trigger)', async () => {
    const c = makeClient({ data: { status: 'new' }, error: null });
    holder.db = c.client;
    const res = await refuseOrder(ORDER_ID, 'Out of bread');
    expect(res.ok).toBe(true);
    expect(c.calls.updates).toContainEqual({
      table: 'orders',
      payload: { status: 'cancelled', cancel_reason: 'Out of bread' },
    });
    expect(dispatchSpy).toHaveBeenCalledTimes(1); // order_cancelled
  });

  it('refuses to cancel an order already being prepared', async () => {
    const c = makeClient({ data: { status: 'preparing' }, error: null });
    holder.db = c.client;
    const res = await refuseOrder(ORDER_ID, 'too late');
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe('conflict');
    expect(c.calls.updates).toHaveLength(0);
    expect(dispatchSpy).not.toHaveBeenCalled();
  });
});

describe('broadcast — fan-out + daily throttle (US-038)', () => {
  it('sends when under the daily cap and returns the count', async () => {
    holder.admin = makeClient({ count: 0 }).client;
    const res = await broadcast({ message_en: 'We are open!', message_ar: 'نحن مفتوحون!' });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data.count).toBe(3);
    expect(broadcastSpy).toHaveBeenCalledWith('We are open!', 'نحن مفتوحون!');
  });

  it('is rate_limited once the daily cap is reached', async () => {
    holder.admin = makeClient({ count: 999 }).client;
    const res = await broadcast({ message_en: 'Hi', message_ar: 'مرحبا' });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe('rate_limited');
    expect(broadcastSpy).not.toHaveBeenCalled();
  });

  it('rejects an empty message', async () => {
    holder.admin = makeClient({ count: 0 }).client;
    const res = await broadcast({ message_en: '', message_ar: '' });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe('validation_error');
  });
});

describe('endOfDay — delivered-only totals (US-037)', () => {
  it('counts delivered orders, items sold and MYR revenue', async () => {
    const rows = [
      { item_count: 2, total: 24, status: 'delivered' },
      { item_count: 3, total: 36, status: 'delivered' },
      { item_count: 1, total: 12, status: 'cancelled' },
      { item_count: 5, total: 60, status: 'new' },
    ];
    holder.db = makeClient({ data: rows }).client;
    const res = await endOfDay();
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.orders).toBe(2);
      expect(res.data.items_sold).toBe(5);
      expect(res.data.revenue).toBe(60);
    }
  });
});

// ── Island render ───────────────────────────────────────────────────────────
const noopVerify = async () => ({ ok: true as const, data: true as const });
const noopRefuse = async () => ({ ok: true as const, data: true as const });
const noopSend = async () => ({ ok: true as const, data: { count: 1 } });

describe('PaymentActions render', () => {
  it('shows verify/reject for a DuitNow order and a refuse control for New', () => {
    const html = renderToStaticMarkup(
      createElement(PaymentActions, {
        orderId: ORDER_ID,
        paymentMethod: 'duitnow_qr',
        paymentStatus: 'submitted',
        status: 'new',
        t: en,
        verify: noopVerify,
        refuse: noopRefuse,
      }),
    );
    expect(html).toContain('data-verdict="verified"');
    expect(html).toContain('data-verdict="rejected"');
    expect(html).toContain('data-refusable="yes"');
    expect(html).toContain(en.reason);
    expect(html).toContain('min-h-tap');
  });

  it('hides the refuse form once the order is no longer refusable', () => {
    const html = renderToStaticMarkup(
      createElement(PaymentActions, {
        orderId: ORDER_ID,
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        status: 'preparing',
        t: en,
        verify: noopVerify,
        refuse: noopRefuse,
      }),
    );
    expect(html).toContain('data-refusable="no"');
    expect(html).toContain(en.not_refusable);
    expect(html).not.toContain('data-verdict'); // no QR proof actions for COD
  });

  it('renders bilingual (Arabic refuse label)', () => {
    const html = renderToStaticMarkup(
      createElement(PaymentActions, {
        orderId: ORDER_ID,
        paymentMethod: 'duitnow_qr',
        paymentStatus: 'submitted',
        status: 'new',
        t: ar as typeof en,
        verify: noopVerify,
        refuse: noopRefuse,
      }),
    );
    expect(html).toContain(ar.refuse);
  });
});

describe('BroadcastForm render', () => {
  it('renders both message fields and the send action (disabled until valid)', () => {
    const html = renderToStaticMarkup(createElement(BroadcastForm, { t: en, send: noopSend }));
    expect(html).toContain(en.message_en);
    expect(html).toContain(en.message_ar);
    expect(html).toContain(en.send_broadcast);
    expect(html).toContain('data-can-send="no"');
  });

  it('renders bilingual (Arabic labels)', () => {
    const html = renderToStaticMarkup(createElement(BroadcastForm, { t: ar as typeof en, send: noopSend }));
    expect(html).toContain(ar.send_broadcast);
    expect(html).toContain(ar.message_ar);
  });
});
