import { listMenu } from '@/lib/domain/menu';
import { getI18n } from '@/lib/i18n/server';
import { MenuCard } from '@/components/customer/menu-card';
import { EmptyState, ErrorState } from '@/components/ui/states';

// SCR-C-02 — bilingual menu list (FR-C-04). Public; no auth required.
export const dynamic = 'force-dynamic';

export default async function MenuPage() {
  const { locale, t } = getI18n();
  const res = await listMenu();

  return (
    // The (customer) group layout owns the shell `main` frame + bottom nav.
    <>
      <header>
        <h1 className="text-h1 text-ink">{t.menu}</h1>
      </header>

      {!res.ok ? (
        <ErrorState message={t.error_generic} />
      ) : res.data.length === 0 ? (
        <EmptyState title={t.no_items} hint={t.no_items_hint} />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {res.data.map((item) => (
            <MenuCard key={item.id} item={item} lang={locale} />
          ))}
        </div>
      )}
    </>
  );
}
