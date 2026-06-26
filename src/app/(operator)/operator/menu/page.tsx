import { getI18n } from '@/lib/i18n/server';
import { listMenu, upsertMenuItem, setAvailability } from '@/lib/domain/menu';
import { ErrorState } from '@/components/ui/states';
import { MenuEditor } from '@/components/operator/menu-editor';

// SCR-O-05 — Menu manager (US-031, FR-O-08). Server component: loads the menu
// (already sorted by sort_order) and hands it to the client editor along with the
// operator-only server actions. The (operator) layout owns the header chrome +
// BottomNav + OfflineBanner, so this renders its content into that frame.
export const dynamic = 'force-dynamic';

export default async function MenuManagerPage() {
  const { locale, t } = getI18n();
  const itemsRes = await listMenu();

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-h1 font-bold text-ink">{t.my_food_list}</h1>
        <p className="text-body text-muted">{t.menu_manager}</p>
      </header>

      {itemsRes.ok ? (
        <MenuEditor
          items={itemsRes.data}
          t={t}
          lang={locale}
          upsert={upsertMenuItem}
          setAvailable={setAvailability}
        />
      ) : (
        <ErrorState message={t.error_generic} />
      )}
    </section>
  );
}
