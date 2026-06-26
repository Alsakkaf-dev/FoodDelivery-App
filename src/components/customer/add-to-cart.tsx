'use client';
import { Stepper } from '@/components/ui/controls';
import { PrimaryButton } from '@/components/ui';
import { useCart } from '@/lib/cart/store';
import type { MenuItem } from '@/types/db';
import type { Dictionary } from '@/lib/i18n/dictionaries';

// Wires the menu item detail Add control (task-2-1) into the cart store (US-013).
// Before the item is in the cart it shows a single Add button; once added it becomes
// a dark qty stepper + a link to the cart, so the count/total on the cart screen
// update immediately. Decrementing to 0 removes the line and flips back to the Add
// button. `disabled until hydrated` avoids clobbering a not-yet-loaded persisted cart
// on a fast first tap. The useCart contract here is FROZEN — only the chrome is
// restyled (PrimaryButton + dark Stepper); `className` is an additive layout hook for
// the sticky add-bar.
export function AddToCart({
  item,
  lang,
  t,
  className = '',
}: {
  item: MenuItem;
  lang: 'en' | 'ar';
  t: Dictionary;
  className?: string;
}) {
  const { lines, hydrated, add, increment, decrement } = useCart();
  const qty = lines.find((l) => l.menu_item_id === item.id)?.qty ?? 0;

  if (qty === 0) {
    return (
      <PrimaryButton className={className} onClick={() => add(item)} disabled={!hydrated}>
        {t.add_to_cart}
      </PrimaryButton>
    );
  }

  return (
    <div className={`flex items-center justify-end gap-3 ${className}`}>
      <Stepper
        value={qty}
        min={0}
        max={50}
        onChange={(v) => (v > qty ? increment(item.id) : decrement(item.id))}
      />
      <PrimaryButton href="/cart">{t.view_cart}</PrimaryButton>
    </div>
  );
}
