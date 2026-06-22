import { describe, it, expect } from 'vitest';
import { mergeOrder, mergeRiderFeed, isDroppedStatus } from '@/lib/realtime/hooks';
import type { Order } from '@/types/db';

const order = (id: string, status: Order['status'] = 'new'): Order =>
  ({ id, status, type: 'delivery', order_no: id } as Order);

describe('mergeOrder — board insert/update with dedupe (US-032)', () => {
  it('prepends a genuinely new INSERT', () => {
    const next = mergeOrder([order('a')], order('b'), 'INSERT');
    expect(next.map((o) => o.id)).toEqual(['b', 'a']);
  });

  it('does not duplicate a re-delivered INSERT (guards by id)', () => {
    const next = mergeOrder([order('a', 'new')], order('a', 'confirmed'), 'INSERT');
    expect(next).toHaveLength(1);
    expect(next[0]?.status).toBe('confirmed'); // updated in place
  });

  it('UPDATE replaces the matching row only', () => {
    const next = mergeOrder([order('a', 'new'), order('b', 'new')], order('b', 'ready'), 'UPDATE');
    expect(next.find((o) => o.id === 'b')?.status).toBe('ready');
    expect(next.find((o) => o.id === 'a')?.status).toBe('new');
  });

  it('ignores other event types', () => {
    const prev = [order('a')];
    expect(mergeOrder(prev, order('a'), 'DELETE')).toBe(prev);
  });
});

describe('mergeRiderFeed — only active deliveries, no dup (US-044)', () => {
  it('adds a newly Ready order to the front', () => {
    const next = mergeRiderFeed([order('a', 'ready')], order('b', 'ready'));
    expect(next.map((o) => o.id)).toEqual(['b', 'a']);
  });

  it('keeps out_for_delivery and moves it to the front (no dup)', () => {
    const next = mergeRiderFeed([order('a', 'ready'), order('b', 'ready')], order('a', 'out_for_delivery'));
    expect(next).toHaveLength(2);
    expect(next[0]?.id).toBe('a');
    expect(next[0]?.status).toBe('out_for_delivery');
  });

  it('removes an order once delivered/cancelled', () => {
    expect(mergeRiderFeed([order('a', 'ready')], order('a', 'delivered'))).toHaveLength(0);
    expect(mergeRiderFeed([order('a', 'ready')], order('a', 'cancelled'))).toHaveLength(0);
  });
});

describe('isDroppedStatus — reconnect/poll trigger (NFR-R-04)', () => {
  it('treats error/timeout/closed as dropped, subscribed as healthy', () => {
    expect(isDroppedStatus('CHANNEL_ERROR')).toBe(true);
    expect(isDroppedStatus('TIMED_OUT')).toBe(true);
    expect(isDroppedStatus('CLOSED')).toBe(true);
    expect(isDroppedStatus('SUBSCRIBED')).toBe(false);
  });
});
