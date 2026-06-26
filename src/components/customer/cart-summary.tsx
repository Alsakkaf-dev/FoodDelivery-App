'use client';
import Link from 'next/link';
import { useState } from 'react';
import { BottomSheet, TextAction } from '@/components/ui';
import { formatMYR } from '@/lib/utils/money';
import type { CartLine } from '@/lib/cart/store';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';

// SCR-C-04 — the white order-summary sheet pinned over the immersive dark cart.
// It is fully controlled + store-agnostic (props only) so it stays trivially
// testable. The delivery-address block is a NAVIGATIONAL entry into the checkout
// flow (#11 owns address/zone selection + the fahman.checkout.draft) — the cart
// never fetches or sets the real address. "Breakdown" opens a sheet listing the
// per-line subtotals the cart legitimately knows; the delivery fee depends on the
// zone chosen at checkout, hence the note. PLACE ORDER enters the same flow.
export function CartSummary({
  total,
  lines,
  lang,
  t,
}: {
  total: number;
  lines: CartLine[];
  lang: Locale;
  t: Dictionary;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="sticky bottom-20 z-30 -mx-4 mt-4 rounded-t-2xl bg-surface px-5 pb-5 pt-4 shadow-sheet">
      {/* Delivery address — entry point into the checkout flow (#11). */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-label uppercase text-muted">{t.delivery_address}</p>
        <TextAction tone="brand" href="/checkout">
          {t.edit}
        </TextAction>
      </div>
      <Link
        href="/checkout"
        className="mt-2 flex min-h-tap items-center rounded-md bg-surface-input px-4 text-body text-muted"
      >
        {t.choose_address}
      </Link>

      {/* Live items total + breakdown drawer. */}
      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-label uppercase text-muted">{t.cart_total}</p>
          <p className="text-display font-extrabold text-ink">{formatMYR(total, lang)}</p>
        </div>
        <TextAction tone="brand" trailingIcon="chevron-right" onClick={() => setOpen(true)}>
          {t.breakdown}
        </TextAction>
      </div>

      {/* Enters the checkout / address / payment flow (#11) where the order is placed. */}
      <Link href="/checkout" className="btn-primary mt-4 block w-full text-center">
        {t.place_order}
      </Link>

      <BottomSheet open={open} onClose={() => setOpen(false)} title={t.breakdown} closeLabel={t.dismiss}>
        <ul className="space-y-3">
          {lines.map((line) => {
            const name = lang === 'ar' ? line.name_ar : line.name_en;
            return (
              <li
                key={line.menu_item_id}
                className="flex items-center justify-between gap-3 text-body"
              >
                <span className="min-w-0 flex-1 truncate text-ink">
                  {name} <span className="text-muted">× {line.qty}</span>
                </span>
                <span className="shrink-0 font-semibold text-ink">
                  {formatMYR(line.qty * line.unit_price, lang)}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
          <span className="text-label uppercase text-muted">{t.items_total}</span>
          <span className="text-title font-bold text-ink">{formatMYR(total, lang)}</span>
        </div>
        <p className="mt-3 text-caption text-muted">{t.breakdown_note}</p>
      </BottomSheet>
    </section>
  );
}
