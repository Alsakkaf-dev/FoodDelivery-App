'use client';
import { ProductCard } from '@/components/ui';
import { useCart } from '@/lib/cart/store';
import { formatMYR } from '@/lib/utils/money';
import type { MenuItem } from '@/types/db';

// 2-column product grid shared by the Search "Popular" section and the Category
// listing. Composes the shared ProductCard primitive (photo-top + name + price +
// floating orange "+"). Add-to-cart goes through the frozen cart store via the
// card's `onAdd`; the count is mirrored back through `qty`. Price is pre-formatted
// to the locale here so the primitive stays copy-agnostic. The "+" is disabled
// until the cart has hydrated (avoids clobbering a not-yet-loaded persisted cart)
// and for unavailable items.
export function ProductGrid({
  items,
  lang,
  subtitleFor,
}: {
  items: MenuItem[];
  lang: 'en' | 'ar';
  subtitleFor?: (item: MenuItem) => string | undefined;
}) {
  const { lines, hydrated, add } = useCart();
  const qtyOf = (id: string) => lines.find((l) => l.menu_item_id === id)?.qty ?? 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((m) => {
        const name = lang === 'ar' ? m.name_ar : m.name_en;
        return (
          <ProductCard
            key={m.id}
            item={{ name, price: formatMYR(m.price, lang), photoUrl: m.photo_url ?? undefined }}
            subtitle={subtitleFor?.(m)}
            href={m.available ? `/menu/${m.id}` : undefined}
            qty={qtyOf(m.id)}
            onAdd={m.available && hydrated ? () => add(m) : undefined}
            disabled={!m.available}
          />
        );
      })}
    </div>
  );
}
