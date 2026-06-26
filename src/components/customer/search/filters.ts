// SCR-C — Search/Category filter model (Engineer #8).
// Fahman is a SINGLE shawarma shop with a flat menu (no category/rating/restaurant
// fields — frozen data contract). So we bind the reference's multi-restaurant
// filter UI to the REAL menu honestly: ONLY `pricing` actually filters (mapped to
// price terciles computed from the live menu). `offers`, `deliverTime` and `rating`
// are collected UI state with no single-shop backing data — applied as no-ops and
// flagged to the Manager. Categories are name-derived buckets over the curated
// brand set (cat_* dictionary keys), since there is no `category` column yet.
import type { MenuItem } from '@/types/db';
import type { Dictionary } from '@/lib/i18n/dictionaries';

export type PriceTier = 1 | 2 | 3;
export type DeliverTime = '10-15' | '20' | '30';

export interface Filters {
  offers: string[]; // collected-only (no per-item data)
  deliverTime: DeliverTime | null; // collected-only
  pricing: PriceTier | null; // WIRED to real price
  rating: number; // collected-only (0 = none)
}

export const EMPTY_FILTERS: Filters = { offers: [], deliverTime: null, pricing: null, rating: 0 };

export const OFFER_IDS = ['delivery', 'pickup', 'offer', 'online_payment'] as const;
export const DELIVER_TIMES: DeliverTime[] = ['10-15', '20', '30'];
export const PRICE_TIERS: PriceTier[] = [1, 2, 3];
export const PRICE_SYMBOL: Record<PriceTier, string> = { 1: '$', 2: '$$', 3: '$$$' };

// Curated brand categories (shawarma shop). No `category` column exists, so each
// bucket is matched best-effort against the bilingual item name. Labels come from
// the §4 cat_* dictionary keys.
export interface CategoryDef {
  id: string;
  key: keyof Dictionary;
  match?: RegExp;
}

export const CATEGORIES: CategoryDef[] = [
  { id: 'all', key: 'cat_all' },
  { id: 'shawarma', key: 'cat_shawarma', match: /shawarma|شاورما/i },
  { id: 'wraps', key: 'cat_wraps', match: /wrap|roll|لفّ|لف|عرب/i },
  { id: 'sides', key: 'cat_sides', match: /side|fries|salad|بطاط|مقبّ|مقبلات|سلطة/i },
  { id: 'drinks', key: 'cat_drinks', match: /drink|juice|cola|soda|water|عصير|مشروب|ماء/i },
];

export function matchesCategory(item: MenuItem, id: string): boolean {
  if (id === 'all') return true;
  const def = CATEGORIES.find((c) => c.id === id);
  if (!def?.match) return true;
  return def.match.test(item.name_en) || def.match.test(item.name_ar);
}

// Map $/$$/$$$ to even thirds of the live menu's price range.
function priceBounds(items: MenuItem[]): [number, number] {
  const prices = items.map((i) => i.price).filter((p) => p > 0);
  if (prices.length === 0) return [0, 0];
  return [Math.min(...prices), Math.max(...prices)];
}

export function matchesPricing(item: MenuItem, tier: PriceTier, items: MenuItem[]): boolean {
  const [min, max] = priceBounds(items);
  if (max <= min) return true;
  const third = (max - min) / 3;
  const lo = min + third * (tier - 1);
  const hi = tier === 3 ? Infinity : min + third * tier;
  return item.price >= lo && item.price <= hi;
}

// Only `pricing` narrows the real menu; the other dimensions are intentional no-ops.
export function applyFilters(items: MenuItem[], f: Filters): MenuItem[] {
  if (!f.pricing) return items;
  return items.filter((i) => matchesPricing(i, f.pricing as PriceTier, items));
}

export function activeFilterCount(f: Filters): number {
  return f.offers.length + (f.deliverTime ? 1 : 0) + (f.pricing ? 1 : 0) + (f.rating > 0 ? 1 : 0);
}
