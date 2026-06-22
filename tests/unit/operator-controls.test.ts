import { describe, it, expect, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { StateControls, ACTION_RESULT } from '@/components/operator/state-controls';
import en from '../../messages/en.json';
import ar from '../../messages/ar.json';

// StateControls calls useRouter() during render; stub it so the module renders
// under vitest's node env (mirrors payment-section.test.ts). The static render is
// a single pass: useShopStatus returns its seed and no effects/clicks fire, so
// the seed status + props fully decide the markup.
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: () => {} }) }));

const noop = async () => ({ ok: true as const });

function render(props: Partial<Parameters<typeof StateControls>[0]> = {}) {
  return renderToStaticMarkup(
    createElement(StateControls, {
      initial: { status: 'closed', qty_remaining: 8 },
      qtyTotal: 20,
      lang: 'en',
      labels: {
        open: en.open_shop,
        close: en.close_shop,
        soldOut: en.set_sold_out,
        error: en.error_generic,
      },
      onOpen: noop,
      onClose: noop,
      onSoldOut: noop,
      ...props,
    }),
  );
}

const disabledCount = (html: string) => (html.match(/disabled=""/g) ?? []).length;

describe('operator one-tap Open/Close/Sold-Out (US-023/024/025)', () => {
  it('maps each tap to the shop status it sets (FR-O-01/02/03)', () => {
    expect(ACTION_RESULT.open).toBe('open'); // US-023 — Open
    expect(ACTION_RESULT.close).toBe('closed'); // US-024 — Close
    expect(ACTION_RESULT.sold_out).toBe('sold_out'); // US-025 — Sold-Out
  });

  it('renders all three large (>=44px) action buttons', () => {
    const html = render();
    expect(html).toContain(en.open_shop);
    expect(html).toContain(en.close_shop);
    expect(html).toContain(en.set_sold_out);
    expect(html).toContain('h-16'); // 64px tap target, well above the 44px floor
  });

  it('shows the live status badge + remaining counter from the seed', () => {
    const html = render({ initial: { status: 'open', qty_remaining: 5 } });
    expect(html).toContain('data-shop-status="open"');
    expect(html).toContain('Open'); // StatusBadge (EN)
    expect(html).toContain('5 portions left'); // QtyCounter (EN)
  });

  it('disables only the button for the current status (no redundant tap)', () => {
    const closed = render({ initial: { status: 'closed', qty_remaining: 0 } });
    expect(closed).toContain('data-shop-status="closed"');
    expect(disabledCount(closed)).toBe(1); // Close is disabled; Open + Sold-Out are not

    const open = render({ initial: { status: 'open', qty_remaining: 5 } });
    expect(disabledCount(open)).toBe(1); // Open is disabled; the others are not
  });

  it('hides the remaining counter before a quantity is set (qtyTotal = 0)', () => {
    const html = render({ qtyTotal: 0, initial: { status: 'closed', qty_remaining: 0 } });
    expect(html).not.toContain('portions left');
  });

  it('renders bilingual Arabic (lang-driven UI + dictionary labels)', () => {
    // The page sources the labels from the locale dictionary, so AR mode pairs
    // `lang: 'ar'` with the AR strings.
    const html = render({
      lang: 'ar',
      initial: { status: 'open', qty_remaining: 5 },
      labels: {
        open: ar.open_shop,
        close: ar.close_shop,
        soldOut: ar.set_sold_out,
        error: ar.error_generic,
      },
    });
    expect(html).toContain(ar.open_shop); // dictionary-supplied button label
    expect(html).toContain(ar.close_shop);
    expect(html).toContain(ar.set_sold_out);
    expect(html).toContain('مفتوح'); // StatusBadge driven by lang
    expect(html).toContain('بقي 5 حصة'); // QtyCounter driven by lang
  });
});
