'use client';
import Link from 'next/link';
import { Stepper } from '@/components/ui/controls';
import { useCart } from '@/lib/cart/store';
import type { MenuItem } from '@/types/db';
import type { Dictionary } from '@/lib/i18n/dictionaries';

// Wires the menu item detail Add control (task-2-1) into the cart store
// (US-013). Before the item is in the cart it shows a single Add button; once
// added it becomes a qty stepper + a link to the cart, so the count/total on
// the cart screen update immediately. Decrementing to 0 removes the line and
// flips back to the Add button. `disabled until hydrated` avoids clobbering a
// not-yet-loaded persisted cart on a fast first tap.
export function AddToCart({ item, lang, t }: { item: MenuItem; lang: 'en' | 'ar'; t: Dictionary }) {
  const { lines, hydrated, add, increment, decrement } = useCart();
  const qty = lines.find((l) => l.menu_item_id === item.id)?.qty ?? 0;

  if (qty === 0) {
    return (
      <button
        type="button"
        className="btn-primary block w-full text-center"
        onClick={() => add(item)}
        disabled={!hydrated}
      >
        {t.add_to_cart}
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <Stepper
        value={qty}
        min={0}
        max={50}
        onChange={(v) => (v > qty ? increment(item.id) : decrement(item.id))}
      />
      <Link href="/cart" className="btn-primary flex-1 text-center">
        {t.view_cart}
      </Link>
    </div>
  );
}
