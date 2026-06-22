import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import en from '../../messages/en.json';
import ar from '../../messages/ar.json';
import type { Order } from '@/types/db';
import { OrderBoard } from '@/components/operator/order-board';
import { forwardStatus, canDispatch } from '@/components/operator/order-chip';

// ── Domain mocks (orders.ts is `'use server'`; stub Supabase + auth + notify) ──
vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({
  cookies: () => ({ get: () => undefined, getAll: () => [], set: () => {} }),
}));

const { holder, requireRole, dispatchSpy } = vi.hoisted(() => ({
  holder: { db: undefined as unknown, admin: undefined as unknown },
  requireRole: vi.fn(async () => ({ id: 'op-1', phone: '+60', lang: 'en', name: 'Op' })),
  dispatchSpy: vi.fn(async () => ({ ok: true })),
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
  dispatchBroadcast: vi.fn(),
}));

import { advanceOrder } from '@/lib/domain/orders';

const ORDER_ID = '11111111-1111-1111-1111-111111111111';

// Server client recorder: maybeSingle → current order; update→select→single → updated.
function makeServer(current: Record<string, unknown>) {
  const updates: Record<string, unknown>[] = [];
  function from() {
    let payload: Record<string, unknown> = {};
    const b = {
      select: () => b,
      eq: () => b,
      update: (p: Record<string, unknown>) => {
        payload = p;
        updates.push(p);
        return b;
      },
      maybeSingle: async () => ({ data: current, error: null }),
      single: async () => ({ data: { ...current, ...payload }, error: null }),
    };
    return b;
  }
  return { client: { from }, updates };
}

// Admin recorder for fireStatusEvent's order/user/session lookups.
const ADMIN_ROWS: Record<string, unknown> = {
  orders: { order_no: 'A-001', customer_id: 'cust-1', session_id: 'sess-1' },
  users: { phone: '+60123', lang: 'en', name: 'Aisha' },
  daily_session: { delivery_window: '2–7 PM' },
};
function makeAdmin() {
  function from(table: string) {
    const b = {
      select: () => b,
      eq: () => b,
      single: async () => ({ data: ADMIN_ROWS[table], error: null }),
    };
    return b;
  }
  return { from };
}

describe('forwardStatus / canDispatch — legal next step (US-033/034)', () => {
  const mk = (status: Order['status'], type: Order['type'] = 'delivery'): Order =>
    ({ id: ORDER_ID, status, type } as Order);

  it('computes the single forward status per lifecycle stage', () => {
    expect(forwardStatus(mk('new'))).toBe('confirmed');
    expect(forwardStatus(mk('confirmed'))).toBe('preparing');
    expect(forwardStatus(mk('preparing'))).toBe('ready');
    expect(forwardStatus(mk('ready', 'delivery'))).toBe('out_for_delivery');
    expect(forwardStatus(mk('ready', 'pickup'))).toBe('delivered');
    expect(forwardStatus(mk('out_for_delivery'))).toBe('delivered');
    expect(forwardStatus(mk('delivered'))).toBeNull();
    expect(forwardStatus(mk('cancelled'))).toBeNull();
  });

  it('only a Ready delivery order is dispatchable', () => {
    expect(canDispatch(mk('ready', 'delivery'))).toBe(true);
    expect(canDispatch(mk('ready', 'pickup'))).toBe(false);
    expect(canDispatch(mk('preparing', 'delivery'))).toBe(false);
  });
});

describe('advanceOrder — legal vs illegal transition (FR-O-10)', () => {
  beforeEach(() => {
    requireRole.mockClear();
    dispatchSpy.mockClear();
    holder.admin = makeAdmin();
  });

  it('advances a legal step, updates status, and fires exactly one notification', async () => {
    const srv = makeServer({ id: ORDER_ID, status: 'new', type: 'delivery' });
    holder.db = srv.client;
    const res = await advanceOrder({ id: ORDER_ID, to_status: 'confirmed' });
    expect(requireRole).toHaveBeenCalledWith('operator');
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data.status).toBe('confirmed');
    expect(srv.updates).toContainEqual({ status: 'confirmed' });
    expect(dispatchSpy).toHaveBeenCalledTimes(1); // exactly one notification
  });

  it('rejects an illegal transition and leaves state unchanged', async () => {
    const srv = makeServer({ id: ORDER_ID, status: 'new', type: 'delivery' });
    holder.db = srv.client;
    const res = await advanceOrder({ id: ORDER_ID, to_status: 'delivered' }); // new→delivered is illegal
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe('invalid_transition');
    expect(srv.updates).toHaveLength(0); // no write
    expect(dispatchSpy).not.toHaveBeenCalled(); // no notification
  });
});

// ── OrderBoard render / states ──────────────────────────────────────────────
const order = (over: Partial<Order>): Order =>
  ({
    id: Math.random().toString(36).slice(2),
    order_no: 'A-001',
    session_id: 's',
    customer_id: 'c',
    zone_id: null,
    address_id: null,
    type: 'delivery',
    status: 'new',
    payment_method: 'cod',
    payment_status: 'pending',
    proof_url: null,
    item_count: 2,
    total: 24,
    cancel_reason: null,
    created_at: '2026-06-24T00:00:00Z',
    updated_at: '2026-06-24T00:00:00Z',
    ...over,
  }) as Order;

const noopAdvance = async () => ({ ok: true as const, data: order({}) });
const noopDispatch = async () => ({ ok: true as const, data: order({}) });

function render(orders: Order[], lang: 'en' | 'ar' = 'en', t = en) {
  return renderToStaticMarkup(
    createElement(OrderBoard, { initial: orders, lang, t, advance: noopAdvance, dispatch: noopDispatch }),
  );
}

describe('OrderBoard: columns, actions, 4 states', () => {
  it('groups orders into their status columns', () => {
    const html = render([order({ order_no: 'A-001', status: 'new' }), order({ order_no: 'A-002', status: 'preparing' })]);
    expect(html).toContain('data-column="new"');
    expect(html).toContain('data-column="preparing"');
    expect(html).toContain('A-001');
    expect(html).toContain('A-002');
  });

  it('shows Dispatch for a Ready delivery order and Advance otherwise', () => {
    const html = render([order({ order_no: 'A-003', status: 'ready', type: 'delivery' })]);
    expect(html).toContain('data-action="dispatch"');
    const html2 = render([order({ order_no: 'A-004', status: 'new' })]);
    expect(html2).toContain('data-action="advance"');
    expect(html2).toContain('data-advance-to="confirmed"');
  });

  it('renders the empty state when no active orders', () => {
    expect(render([])).toContain(en.no_orders);
  });

  it('carries >=44px tap targets on action buttons', () => {
    expect(render([order({ status: 'new' })])).toContain('min-h-tap');
  });

  it('renders bilingual (Arabic board hint + advance label)', () => {
    const html = render([order({ status: 'new' })], 'ar', ar as typeof en);
    expect(html).toContain(ar.advance);
    expect(html).toContain(ar.board_hint);
  });
});
