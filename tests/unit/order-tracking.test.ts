import { describe, it, expect, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Timeline } from '@/components/ui/timeline';
import { formatMyt } from '@/lib/utils/time';
import type { Order } from '@/types/db';

// The tracking island reads the live order from useOrderStatus; stub the realtime
// hook so it echoes the server-passed order (no socket) and we can assert the
// Timeline re-renders from whatever status it yields.
vi.mock('@/lib/realtime/hooks', () => ({
  useOrderStatus: (_id: string, initial: Order) => initial,
}));
import { OrderTracker } from '@/components/customer/order-tracker';

const html = (el: ReturnType<typeof createElement>): string => renderToStaticMarkup(el);

const baseOrder: Order = {
  id: 'o1', order_no: 'A-104', session_id: 's1', customer_id: 'c1',
  zone_id: null, address_id: null, type: 'delivery', status: 'ready',
  payment_method: 'cod', payment_status: 'pending', proof_url: null,
  item_count: 3, total: 36, cancel_reason: null,
  created_at: '2026-06-18T05:40:00Z', updated_at: '2026-06-18T05:40:00Z',
};
const labels = {
  track: 'Track order', items: 'Items', total: 'Total', paymentStatus: 'Payment status',
  method: 'Cash on Delivery',
  pay: { pending: 'Pending', submitted: 'Submitted', verified: 'Verified', rejected: 'Rejected' },
};
const lines = [
  { key: 'l1', name: 'Chicken Shawarma', qty: 2, unitPrice: 11 },
  { key: 'l2', name: 'Beef Plate', qty: 1, unitPrice: 14 },
];

describe('Timeline: lists all lifecycle states and highlights the current one (US-018)', () => {
  it('marks every state up to and including the current as done', () => {
    const out = html(createElement(Timeline, { status: 'ready', lang: 'en' }));
    // new, confirmed, preparing, ready => 4 completed ticks; on the way + delivered pending.
    expect((out.match(/✓/g) ?? []).length).toBe(4);
    expect(out).toContain('Ready');
    expect(out).toContain('On the way'); // a later, not-yet-reached state still listed
  });

  it('advancing the status lights up one more step (live re-render)', () => {
    const before = (html(createElement(Timeline, { status: 'preparing', lang: 'en' })).match(/✓/g) ?? []).length;
    const after = (html(createElement(Timeline, { status: 'out_for_delivery', lang: 'en' })).match(/✓/g) ?? []).length;
    expect(after).toBeGreaterThan(before);
  });

  it('renders the cancelled branch separately, not the normal flow', () => {
    const out = html(createElement(Timeline, { status: 'cancelled', lang: 'en' }));
    expect(out).toContain('Cancelled');
    expect(out).not.toContain('Delivered');
    expect(html(createElement(Timeline, { status: 'cancelled', lang: 'ar' }))).toContain('ملغى');
  });
});

describe('OrderTracker: confirmation island renders lines, total, payment + live status', () => {
  it('shows the current status, order lines and the MYR total', () => {
    const out = html(createElement(OrderTracker, { initial: baseOrder, lines, lang: 'en', labels }));
    expect(out).toContain('Track order');
    expect(out).toContain('Ready'); // current status, from the live order
    expect(out).toContain('Chicken Shawarma');
    expect(out).toContain('Beef Plate');
    expect(out).toContain('Total');
    expect(out).toMatch(/RM\s*36\.00/); // formatMYR(order.total) — Intl uses a non-breaking space
    expect(out).toContain('Cash on Delivery');
    expect(out).toContain('Pending'); // payment status label
  });

  it('renders the cancelled branch and the cancel reason when cancelled', () => {
    const cancelled: Order = { ...baseOrder, status: 'cancelled', cancel_reason: 'Out of stock' };
    const out = html(createElement(OrderTracker, { initial: cancelled, lines, lang: 'en', labels }));
    expect(out).toContain('Cancelled');
    expect(out).toContain('Out of stock');
  });
});

describe('formatMyt: localized MYT date for history rows (US-020)', () => {
  it('formats an ISO timestamp in Asia/Kuala_Lumpur', () => {
    // 05:40Z == 13:40 MYT on 18 Jun.
    const out = formatMyt('2026-06-18T05:40:00Z', 'en');
    expect(out).toMatch(/18/);
    expect(out).toMatch(/Jun/i);
  });
});
