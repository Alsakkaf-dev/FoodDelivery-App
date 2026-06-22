import { describe, it, expect } from 'vitest';
import { canTransition, ORDER_TRANSITIONS } from '@/types/db';

// Order state machine (SDD §5). Locks the legal transition set so a regression in
// the lifecycle is caught before it ships.
describe('canTransition — legal edges', () => {
  it('allows every forward step and the new/confirmed→cancelled edges', () => {
    expect(canTransition('new', 'confirmed')).toBe(true);
    expect(canTransition('confirmed', 'preparing')).toBe(true);
    expect(canTransition('preparing', 'ready')).toBe(true);
    expect(canTransition('ready', 'out_for_delivery')).toBe(true);
    expect(canTransition('ready', 'delivered')).toBe(true);
    expect(canTransition('out_for_delivery', 'delivered')).toBe(true);
    expect(canTransition('new', 'cancelled')).toBe(true);
    expect(canTransition('confirmed', 'cancelled')).toBe(true);
  });
});

describe('canTransition — illegal edges', () => {
  it('rejects skips, back-steps and late cancels', () => {
    expect(canTransition('new', 'delivered')).toBe(false);
    expect(canTransition('new', 'preparing')).toBe(false);
    expect(canTransition('delivered', 'preparing')).toBe(false);
    expect(canTransition('ready', 'new')).toBe(false);
    expect(canTransition('preparing', 'cancelled')).toBe(false); // too late to cancel
    expect(canTransition('out_for_delivery', 'cancelled')).toBe(false);
  });
});

describe('ORDER_TRANSITIONS — terminal states', () => {
  it('delivered and cancelled have no exits', () => {
    expect(ORDER_TRANSITIONS.delivered).toEqual([]);
    expect(ORDER_TRANSITIONS.cancelled).toEqual([]);
  });
});
