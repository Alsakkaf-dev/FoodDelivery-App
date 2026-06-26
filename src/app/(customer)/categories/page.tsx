import { listMenu } from '@/lib/domain/menu';
import { getI18n } from '@/lib/i18n/server';
import { EmptyState, ErrorState } from '@/components/ui';
import { CategoryExperience } from '@/components/customer/search/category-experience';

// SCR-C — Category listing (Engineer #8). Public; `?c=<slug>` selects the curated
// brand bucket (defaults to "all"). Single-shop menu, honest name-derived buckets.
export const dynamic = 'force-dynamic';

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: { c?: string };
}) {
  const { locale, t } = getI18n();
  const res = await listMenu();

  if (!res.ok) return <ErrorState message={t.error_generic} />;
  if (res.data.length === 0) return <EmptyState title={t.no_results} hint={t.browse_menu} />;

  return (
    <CategoryExperience
      items={res.data}
      initialCategory={searchParams.c ?? 'all'}
      lang={locale}
      t={t}
    />
  );
}
