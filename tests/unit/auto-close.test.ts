import { describe, it, expect, vi } from 'vitest';
import { withinTradingHours, pastCutoff, OPEN_HOUR, CLOSE_HOUR } from '@/lib/utils/time';

// ── Trading-window + cut-off boundaries (US-048/049, FR-S-04/05) ─────────────
describe('withinTradingHours — 13:00–19:00 MYT boundary', () => {
  it('is closed before open, open during, closed at/after 19:00', () => {
    expect(withinTradingHours({ hour: OPEN_HOUR - 1 })).toBe(false); // 12:xx
    expect(withinTradingHours({ hour: OPEN_HOUR })).toBe(true); // 13:xx
    expect(withinTradingHours({ hour: 18 })).toBe(true);
    expect(withinTradingHours({ hour: CLOSE_HOUR })).toBe(false); // 19:xx — closed
    expect(withinTradingHours({ hour: 20 })).toBe(false);
  });
});

describe('pastCutoff — order cut-off boundary', () => {
  it('passes only strictly after the cut-off time', () => {
    expect(pastCutoff('18:00', { time: '17:59' })).toBe(false);
    expect(pastCutoff('18:00', { time: '18:00' })).toBe(false); // exactly at cut-off still open
    expect(pastCutoff('18:00', { time: '18:01' })).toBe(true);
  });

  it('no cut-off set never blocks', () => {
    expect(pastCutoff(null, { time: '23:59' })).toBe(false);
  });
});

// ── Auto-close route — secret-guarded RPC trigger (FR-S-04/05) ────────────────
const { rpcSpy } = vi.hoisted(() => ({ rpcSpy: vi.fn(async () => ({ error: null })) }));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => ({ rpc: rpcSpy }) }));

describe('POST /api/admin/auto-close', () => {
  it('runs the RPC when the shared secret matches', async () => {
    process.env.AUTO_CLOSE_SECRET = 's3cret';
    rpcSpy.mockClear();
    const { POST } = await import('@/app/api/admin/auto-close/route');
    const { NextRequest } = await import('next/server');
    const res = await POST(
      new NextRequest('https://x/api/admin/auto-close', { method: 'POST', headers: { 'x-auto-close-secret': 's3cret' } }),
    );
    expect(res.status).toBe(200);
    expect(rpcSpy).toHaveBeenCalledWith('auto_close_expired_sessions');
  });

  it('rejects a missing/wrong secret with 401 and does not run the RPC', async () => {
    process.env.AUTO_CLOSE_SECRET = 's3cret';
    rpcSpy.mockClear();
    const { POST } = await import('@/app/api/admin/auto-close/route');
    const { NextRequest } = await import('next/server');
    const res = await POST(
      new NextRequest('https://x/api/admin/auto-close', { method: 'POST', headers: { 'x-auto-close-secret': 'nope' } }),
    );
    expect(res.status).toBe(401);
    expect(rpcSpy).not.toHaveBeenCalled();
  });
});
