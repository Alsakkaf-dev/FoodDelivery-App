'use client';
import { Stepper, IconButton } from '@/components/ui';
import { FoodImage } from '@/components/ui/food-image';
import { formatMYR } from '@/lib/utils/money';
import type { CartLine as CartLineModel } from '@/lib/cart/store';
import type { Dictionary } from '@/lib/i18n/dictionaries';

// One editable cart row on the immersive dark surface (US-013): a branded
// thumbnail (the cart line is a price-snapshot with no photo, so FoodImage shows
// its plate fallback), the bilingual name (2-line wrap), the unit price + live
// line subtotal, the dark quantity stepper, and — only in edit mode — a red
// circular × remove. All controls are >=44px (EP-13).
//
// The stepper emits an ABSOLUTE qty; the parent maps the +/- delta onto the
// store's increment/decrement actions (no separate "set" action). That contract
// is preserved here untouched — this component never talks to the store.
export function CartLine({
  line,
  lang,
  t,
  editing,
  onQty,
  onRemove,
}: {
  line: CartLineModel;
  lang: 'en' | 'ar';
  t: Dictionary;
  editing: boolean;
  onQty: (qty: number) => void;
  onRemove: () => void;
}) {
  const name = lang === 'ar' ? line.name_ar : line.name_en;
  const subtotal = line.qty * line.unit_price;

  return (
    <div className="relative flex items-start gap-3 py-4">
      <FoodImage shape="rounded" alt="" className="h-20 w-20 shrink-0 rounded-md" />

      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-title font-bold text-onColor">{name}</h3>
        <p className="mt-1 text-body font-bold text-onColor">{formatMYR(line.unit_price, lang)}</p>
        <p className="mt-1 text-caption text-muted">
          {t.subtotal}:{' '}
          <span className="font-semibold text-onColor">{formatMYR(subtotal, lang)}</span>
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-3">
        {editing ? (
          <IconButton
            variant="dark"
            icon="close"
            className="!bg-danger"
            aria-label={`${t.remove} — ${name}`}
            onClick={onRemove}
          />
        ) : null}
        <Stepper value={line.qty} min={1} max={50} onChange={onQty} />
      </div>
    </div>
  );
}
