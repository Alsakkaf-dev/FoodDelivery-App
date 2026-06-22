'use client';
import { Stepper } from '@/components/ui/controls';
import { formatMYR } from '@/lib/utils/money';
import type { CartLine as CartLineModel } from '@/lib/cart/store';
import type { Dictionary } from '@/lib/i18n/dictionaries';

// One editable cart row (US-013): bilingual name, unit price, qty stepper,
// remove button, and the live line subtotal. All controls are >=44px (EP-13).
// The stepper emits an absolute qty; the parent maps the +/- delta onto the
// store's increment/decrement actions (no separate "set" action needed).
export function CartLine({
  line,
  lang,
  t,
  onQty,
  onRemove,
}: {
  line: CartLineModel;
  lang: 'en' | 'ar';
  t: Dictionary;
  onQty: (qty: number) => void;
  onRemove: () => void;
}) {
  const name = lang === 'ar' ? line.name_ar : line.name_en;
  const subtotal = line.qty * line.unit_price;

  return (
    <div className="card flex items-start gap-3">
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-slate">{name}</h3>
        <p className="text-sm text-muted">{formatMYR(line.unit_price, lang)}</p>
        <p className="mt-1 text-sm font-medium text-slate">
          {t.subtotal}: <span className="font-bold text-rust">{formatMYR(subtotal, lang)}</span>
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <Stepper value={line.qty} min={1} max={50} onChange={onQty} />
        <button
          type="button"
          className="chip border-line text-rust"
          onClick={onRemove}
          aria-label={`${t.remove} — ${name}`}
        >
          {t.remove}
        </button>
      </div>
    </div>
  );
}
