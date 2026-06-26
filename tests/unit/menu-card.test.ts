import { describe, it, expect, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { MenuCard } from '@/components/customer/menu-card';
import type { MenuItem } from '@/types/db';

// MenuCard wraps available items in a Next <Link>; stub it so the card renders standalone.
vi.mock('next/link', () => ({ default: 'a' }));

const html = (el: ReturnType<typeof createElement>): string => renderToStaticMarkup(el);

const base: MenuItem = {
  id: 'm1',
  name_en: 'Chicken Shawarma',
  name_ar: 'شاورما دجاج',
  description_en: 'Grilled chicken, garlic sauce',
  description_ar: 'دجاج مشوي مع ثوم',
  price: 8.5,
  photo_url: null,
  available: true,
  sort_order: 1,
};

// US-011 / FR-C-04 — available items show name + MYR price and are tappable to add.
describe('MenuCard: available item (FR-C-04)', () => {
  it('shows the EN name, MYR price and links to the detail screen', () => {
    const out = html(createElement(MenuCard, { item: base, lang: 'en' }));
    expect(out).toContain('Chicken Shawarma');
    expect(out).toContain('8.50'); // formatMYR(8.5, 'en') => "RM 8.50"
    expect(out).toContain('href="/menu/m1"'); // tappable → detail / add
    expect(out).not.toContain('opacity-60'); // not dimmed
    expect(out).not.toContain('Unavailable');
  });

  it('shows the AR name and price when locale is ar', () => {
    const out = html(createElement(MenuCard, { item: base, lang: 'ar' }));
    expect(out).toContain('شاورما دجاج');
    expect(out).toContain('8.50'); // formatMYR(8.5, 'ar') => "‏8.50 MYR"
    expect(out).toContain('href="/menu/m1"');
  });

  it('is a full-card tappable target on the link wrapper (EP-13)', () => {
    const out = html(createElement(MenuCard, { item: base, lang: 'en' }));
    // #09 delegates to the shared #02 ProductCard (compose, don't fork): the whole
    // card is the <a> link — a block-level `.card` (p-4 + content) is an inherently
    // >=44px tap target. Lockstep with #09's ProductCard delegation. (QA-011 tracks a
    // recommendation that ProductCard also carry an explicit min-h-tap, routed to #02.)
    expect(out).toContain('href="/menu/m1"');
    expect(out).toContain('card block');
  });
});

// Unavailable items must be visibly marked and NOT addable.
describe('MenuCard: unavailable item is clearly marked and not tappable', () => {
  const soldOut: MenuItem = { ...base, available: false };

  it('marks the card Unavailable and renders it non-interactive (EN)', () => {
    const out = html(createElement(MenuCard, { item: soldOut, lang: 'en' }));
    expect(out).toContain('Unavailable'); // clearly labelled (ProductCard subtitle = t.unavailable)
    expect(out).not.toContain('href="/menu/m1"'); // not tappable when unavailable
    // NOTE: ProductCard does not yet visually DIM a disabled card — tracked as QA-012 (-> #02).
  });

  it('shows the AR unavailable badge', () => {
    const out = html(createElement(MenuCard, { item: soldOut, lang: 'ar' }));
    expect(out).toContain('غير متوفر');
  });

  it('does not link to the detail screen (cannot be tapped to add)', () => {
    const out = html(createElement(MenuCard, { item: soldOut, lang: 'en' }));
    expect(out).not.toContain('href="/menu/m1"');
  });
});
