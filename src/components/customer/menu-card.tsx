import { formatMYR } from '@/lib/utils/money';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { ProductCard } from '@/components/ui';
import type { MenuItem } from '@/types/db';

// CMP — customer menu card (FR-C-04). Photo-top ProductCard on the warm menu grid;
// the whole card links to the item detail, so there is NO client island here and
// the card stays fully server-renderable. The photo/name/price + the floating "+"
// affordance are rendered by the shared ProductCard primitive (CSS background-image
// via the FoodImage helper it composes; SVG fallback replaces the old emoji).
export function MenuCard({ item, lang }: { item: MenuItem; lang: 'en' | 'ar' }) {
  const ar = lang === 'ar';
  const t = getDictionary(lang);
  const name = ar ? item.name_ar : item.name_en;
  const desc = ar ? item.description_ar : item.description_en;

  return (
    <ProductCard
      item={{ name, price: formatMYR(item.price, lang), photoUrl: item.photo_url ?? undefined }}
      href={item.available ? `/menu/${item.id}` : undefined}
      subtitle={item.available ? desc ?? undefined : t.unavailable}
      disabled={!item.available}
    />
  );
}
