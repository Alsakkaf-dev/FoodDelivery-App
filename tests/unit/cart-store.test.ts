import { describe, it, expect } from 'vitest';
import { cartReducer, itemCount, total, emptyCart, MAX_QTY } from '@/lib/cart/store';
import type { MenuItem } from '@/types/db';

// US-013 / FR-C-05 — the cart reducer + selectors are the source of truth for the
// live item count and MYR total. These pure functions are tested without React or
// localStorage so the acceptance criterion ("count + total update on every change")
// is locked independently of the UI.

const item = (over: Partial<MenuItem> = {}): MenuItem => ({
  id: 'm1',
  name_en: 'Beef Shawarma',
  name_ar: 'شاورما لحم',
  description_en: null,
  description_ar: null,
  price: 8.5,
  photo_url: null,
  available: true,
  sort_order: 1,
  ...over,
});

describe('cartReducer: add / increment / decrement / remove / clear', () => {
  it('add inserts a new line at qty 1 mapped from the menu item', () => {
    const s = cartReducer(emptyCart, { type: 'add', item: item() });
    expect(s.lines).toHaveLength(1);
    expect(s.lines[0]).toEqual({
      menu_item_id: 'm1',
      name_en: 'Beef Shawarma',
      name_ar: 'شاورما لحم',
      unit_price: 8.5,
      qty: 1,
    });
  });

  it('adding the same item again increments its qty instead of duplicating the line', () => {
    let s = cartReducer(emptyCart, { type: 'add', item: item() });
    s = cartReducer(s, { type: 'add', item: item() });
    expect(s.lines).toHaveLength(1);
    expect(s.lines[0]?.qty).toBe(2);
  });

  it('increment and decrement adjust the matching line qty', () => {
    let s = cartReducer(emptyCart, { type: 'add', item: item() });
    s = cartReducer(s, { type: 'increment', id: 'm1' });
    expect(s.lines[0]?.qty).toBe(2);
    s = cartReducer(s, { type: 'decrement', id: 'm1' });
    expect(s.lines[0]?.qty).toBe(1);
  });

  it('decrement at qty 1 removes the line', () => {
    let s = cartReducer(emptyCart, { type: 'add', item: item() });
    s = cartReducer(s, { type: 'decrement', id: 'm1' });
    expect(s.lines).toHaveLength(0);
  });

  it('remove deletes one line and leaves the others; clear empties the cart', () => {
    let s = cartReducer(emptyCart, { type: 'add', item: item() });
    s = cartReducer(s, { type: 'add', item: item({ id: 'm2', name_en: 'Fries', name_ar: 'بطاطس', price: 4 }) });
    s = cartReducer(s, { type: 'remove', id: 'm1' });
    expect(s.lines.map((l) => l.menu_item_id)).toEqual(['m2']);
    s = cartReducer(s, { type: 'clear' });
    expect(s.lines).toHaveLength(0);
  });

  it('caps qty at MAX_QTY on repeated increments', () => {
    let s = cartReducer(emptyCart, { type: 'add', item: item() });
    for (let i = 0; i < MAX_QTY + 10; i++) s = cartReducer(s, { type: 'increment', id: 'm1' });
    expect(s.lines[0]?.qty).toBe(MAX_QTY);
  });

  it('does not mutate the previous state (immutability)', () => {
    const before = cartReducer(emptyCart, { type: 'add', item: item() });
    const after = cartReducer(before, { type: 'increment', id: 'm1' });
    expect(before.lines[0]?.qty).toBe(1);
    expect(after).not.toBe(before);
  });
});

describe('selectors: itemCount + total recompute on every change', () => {
  it('itemCount sums quantities and total sums qty * unit_price', () => {
    let s = cartReducer(emptyCart, { type: 'add', item: item({ price: 8.5 }) }); // m1 x1
    s = cartReducer(s, { type: 'add', item: item({ id: 'm2', name_en: 'Fries', name_ar: 'بطاطس', price: 4 }) });
    s = cartReducer(s, { type: 'increment', id: 'm2' }); // m2 x2
    expect(itemCount(s.lines)).toBe(3);
    expect(total(s.lines)).toBeCloseTo(8.5 + 4 * 2, 2); // 16.5
  });

  it('an empty cart has count 0 and total 0', () => {
    expect(itemCount(emptyCart.lines)).toBe(0);
    expect(total(emptyCart.lines)).toBe(0);
  });
});
