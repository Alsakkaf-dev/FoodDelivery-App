import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks for the createOrder domain path (orders.ts is `'use server'`) ──────
vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({
  cookies: () => ({ get: () => undefined, getAll: () => [], set: () => {} }),
}));

const { holder, requireRole, dispatchSpy } = vi.hoisted(() => ({
  holder: { rpc: { data: undefined as unknown, error: null as unknown } },
  requireRole: vi.fn(async () => ({ id: 'c1', phone: '+60', lang: 'en', name: 'A' })),
  dispatchSpy: vi.fn(async () => ({ ok: true })),
}));

vi.mock('@/lib/supabase/server', () => ({ createClient: () => ({ rpc: async () => holder.rpc }) }));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => ({}) }));
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
vi.mock('@/lib/notifications/dispatch', () => ({ dispatchOrderEvent: dispatchSpy, dispatchBroadcast: vi.fn() }));

import { createOrder } from '@/lib/domain/orders';

const VALID = {
  type: 'pickup' as const,
  payment_method: 'cod' as const,
  items: [{ menu_item_id: '11111111-1111-1111-1111-111111111111', qty: 1 }],
  idempotency_key: 'idem-12345678',
};

beforeEach(() => {
  requireRole.mockClear();
  dispatchSpy.mockClear();
});

describe('createOrder — surfaces the race-safe place_order RPC outcome (US-045/046/047)', () => {
  it('accepts an order and reports it is not sold out', async () => {
    holder.rpc = { data: [{ order_id: 'o1', order_no: 'A-001', sold_out: false }], error: null };
    const res = await createOrder(VALID);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data.sold_out).toBe(false);
    expect(dispatchSpy).toHaveBeenCalledTimes(1); // EVT-01 order_received fires once
  });

  it('flags sold-out when the last portion is taken (US-047)', async () => {
    holder.rpc = { data: [{ order_id: 'o2', order_no: 'A-002', sold_out: true }], error: null };
    const res = await createOrder(VALID);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data.sold_out).toBe(true);
  });

  it('rejects the loser of a concurrent last-portion race (US-046)', async () => {
    holder.rpc = { data: null, error: { message: 'sold_out_or_insufficient' } };
    const res = await createOrder(VALID);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe('sold_out_or_insufficient');
    expect(dispatchSpy).not.toHaveBeenCalled();
  });
});

// ── Inventory invariants — models the SQL atomic guard + restock trigger ──────
// place_order: UPDATE ... SET qty_remaining = qty_remaining - k WHERE qty_remaining >= k
//   → status sold_out when remaining hits 0.  restock_after_cancel: least(total, remaining+k).
function reserve(remaining: number, k: number): { ok: boolean; remaining?: number; sold_out?: boolean } {
  if (k > remaining) return { ok: false }; // atomic guard: never goes below zero
  const next = remaining - k;
  return { ok: true, remaining: next, sold_out: next === 0 };
}
const restock = (remaining: number, total: number, k: number) => Math.min(total, remaining + k);

describe('inventory invariants', () => {
  it('decrements remaining by k (US-045)', () => {
    expect(reserve(5, 2)).toEqual({ ok: true, remaining: 3, sold_out: false });
  });

  it('flips to sold-out exactly at zero (US-047)', () => {
    expect(reserve(1, 1)).toEqual({ ok: true, remaining: 0, sold_out: true });
  });

  it('never lets remaining go below zero (US-046)', () => {
    expect(reserve(1, 2).ok).toBe(false);
    expect(reserve(0, 1).ok).toBe(false);
  });

  it('only one of two concurrent orders for the last portion succeeds (US-046)', () => {
    let remaining = 1;
    const a = reserve(remaining, 1);
    if (a.ok) remaining = a.remaining!;
    const b = reserve(remaining, 1);
    expect(a.ok).toBe(true);
    expect(b.ok).toBe(false);
    expect(remaining).toBe(0); // never negative
  });

  it('restocks reserved units on cancel, capped at the day total (SDD §4.1)', () => {
    expect(restock(0, 40, 2)).toBe(2);
    expect(restock(39, 40, 5)).toBe(40); // capped at qty_total
  });
});
