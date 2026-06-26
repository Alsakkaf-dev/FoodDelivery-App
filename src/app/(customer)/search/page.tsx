import { listMenu } from '@/lib/domain/menu';
import { getI18n } from '@/lib/i18n/server';
import { EmptyState, ErrorState } from '@/components/ui';
import { SearchExperience } from '@/components/customer/search/search-experience';

// SCR-C — Search (Engineer #8). Public; live menu data drives client-side search.
// The (customer) group layout owns the shell frame + bottom nav + LangSwitch.
export const dynamic = 'force-dynamic';

export default async function SearchPage() {
  const { locale, t } = getI18n();
  const res = await listMenu();

  if (!res.ok) return <ErrorState message={t.error_generic} />;
  if (res.data.length === 0) return <EmptyState title={t.no_results} hint={t.browse_menu} />;

  return <SearchExperience items={res.data} lang={locale} t={t} />;
}
