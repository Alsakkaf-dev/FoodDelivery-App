import Link from 'next/link';
import { getStatus } from '@/lib/domain/session';
import { listMenu } from '@/lib/domain/menu';
import { getI18n } from '@/lib/i18n/server';
import { nowMyt } from '@/lib/utils/time';
import { Icon } from '@/components/icons';
import { StatusHero } from '@/components/customer/status-hero';
import { HomeHeader } from '@/components/customer/home/home-header';
import { SearchEntry } from '@/components/customer/home/search-entry';
import { CategoryRow, type HomeCategory } from '@/components/customer/home/category-row';

// SCR-C-01 — Customer home / discovery surface (FR-C-02/03). Public; no auth.
export const dynamic = 'force-dynamic';

function SectionHeader({ title, seeAll, href }: { title: string; seeAll: string; href: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-h2 text-ink">{title}</h2>
      <Link href={href} aria-label={seeAll} className="flex items-center gap-1 text-link text-brand">
        {seeAll}
        <Icon name="chevron-right" aria-hidden />
      </Link>
    </div>
  );
}

export default async function HomePage() {
  const { locale, t } = getI18n();
  const { hour } = nowMyt();

  const res = await getStatus();
  const s = res.ok
    ? res.data
    : { status: 'closed' as const, qty_remaining: 0, qty_total: 0, delivery_window: null };

  // A real food photo for the hero plate when the menu has one (graceful → null).
  const menu = await listMenu();
  const featuredPhoto = menu.ok ? menu.data.find((m) => m.photo_url)?.photo_url ?? null : null;

  // Curated, dictionary-backed category set — honest to a single shawarma vendor
  // (no category column exists). "All" is active → full menu; the rest route to the
  // Search surface filtered by key (#08). Reusable pattern consumed by #08.
  const categories: HomeCategory[] = [
    { key: 'all', label: t.cat_all, href: '/menu', icon: 'utensils', active: true },
    { key: 'shawarma', label: t.cat_shawarma, href: '/search?cat=shawarma', icon: 'drumstick' },
    { key: 'wraps', label: t.cat_wraps, href: '/search?cat=wraps', icon: 'wrap' },
    { key: 'sides', label: t.cat_sides, href: '/search?cat=sides', icon: 'fries' },
    { key: 'drinks', label: t.cat_drinks, href: '/search?cat=drinks', icon: 'drink' },
  ];

  return (
    // The (customer) group layout owns the shell `main` frame + bottom nav.
    <div className="space-y-6">
      <HomeHeader t={t} hour={hour} />
      <SearchEntry t={t} />

      <section className="space-y-3">
        <SectionHeader title={t.home_all_categories} seeAll={t.home_see_all} href="/categories" />
        <CategoryRow categories={categories} variant="chip" />
      </section>

      <section className="space-y-3">
        <SectionHeader title={t.home_open_restaurants} seeAll={t.home_see_all} href="/menu" />
        <StatusHero
          initial={{ status: s.status, qty_remaining: s.qty_remaining }}
          qtyTotal={s.qty_total}
          deliveryWindow={s.delivery_window}
          photoUrl={featuredPhoto}
          lang={locale}
          t={t}
        />
      </section>
    </div>
  );
}
