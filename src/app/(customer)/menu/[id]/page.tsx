import { notFound } from 'next/navigation';
import { listMenu } from '@/lib/domain/menu';
import { getI18n } from '@/lib/i18n/server';
import { DetailsHeader } from '@/components/customer/food-details/details-header';
import { FavoriteButton } from '@/components/customer/food-details/favorite-button';
import { FoodHero } from '@/components/customer/food-details/food-hero';
import { VendorPill } from '@/components/customer/food-details/vendor-pill';
import { MetaRow } from '@/components/customer/food-details/meta-row';
import { SizeSelector } from '@/components/customer/food-details/size-selector';
import { IngredientsRow } from '@/components/customer/food-details/ingredients-row';
import { StickyAddBar } from '@/components/customer/food-details/sticky-add-bar';

// SCR-C-03 — menu item detail (FR-C-04). Add-to-cart is wired into the client cart
// store (task-2-2) via StickyAddBar -> AddToCart. Public; no auth required. The
// listMenu().find single-item lookup + notFound() pattern is preserved.
export const dynamic = 'force-dynamic';

export default async function ItemPage({ params }: { params: { id: string } }) {
  const { locale, t } = getI18n();
  const ar = locale === 'ar';
  const res = await listMenu();
  const item = res.ok ? res.data.find((m) => m.id === params.id) : null;
  if (!item) notFound();

  const name = ar ? item.name_ar : item.name_en;
  const desc = ar ? item.description_ar : item.description_en;

  return (
    // The (customer) group layout owns the shell `main` frame + bottom nav.
    <div className="space-y-5">
      <DetailsHeader t={t} backHref="/menu" action={<FavoriteButton t={t} />} />
      <FoodHero item={item} alt={name} />
      <VendorPill t={t} />
      <h1 className="text-h1 text-ink">{name}</h1>
      {desc ? <p className="text-body">{desc}</p> : null}
      <MetaRow t={t} />
      <SizeSelector t={t} />
      <IngredientsRow t={t} />
      <StickyAddBar item={item} lang={locale} t={t} />
    </div>
  );
}
