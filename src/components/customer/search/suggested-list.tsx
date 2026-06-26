import Link from 'next/link';
import { Icon } from '@/components/icons';
import { FoodImage } from '@/components/ui/food-image';
import { formatMYR } from '@/lib/utils/money';
import type { MenuItem } from '@/types/db';
import type { Dictionary } from '@/lib/i18n/dictionaries';

// "Suggested" rows. The reference shows multi-restaurant rows with a ★ rating, but
// Fahman is single-shop with no rating data — so we render the real menu items as
// rows (thumbnail + name + real price) instead of fabricating ratings. Each row
// links to the existing item detail. `chevron-right` is in the auto-mirroring
// directional set, so it flips under dir=rtl on its own.
export function SuggestedList({
  items,
  lang,
  t,
}: {
  items: MenuItem[];
  lang: 'en' | 'ar';
  t: Dictionary;
}) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="suggested-h" className="space-y-3">
      <h2 id="suggested-h" className="text-h2 font-bold text-ink">
        {t.suggested}
      </h2>
      <ul className="divide-y divide-line">
        {items.map((m) => {
          const name = lang === 'ar' ? m.name_ar : m.name_en;
          return (
            <li key={m.id}>
              <Link href={`/menu/${m.id}`} className="flex min-h-tap items-center gap-3 py-3">
                <FoodImage
                  src={m.photo_url ?? undefined}
                  alt=""
                  shape="rounded"
                  className="h-12 w-12 shrink-0"
                />
                <span className="min-w-0 flex-1 truncate text-title font-bold text-ink">{name}</span>
                <span className="shrink-0 text-title font-bold text-brand">
                  {formatMYR(m.price, lang)}
                </span>
                <Icon name="chevron-right" className="shrink-0 text-muted" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
