import { getI18n } from '@/lib/i18n/server';
import { endOfDay } from '@/lib/domain/orders';
import { formatMYR } from '@/lib/utils/money';
import { ErrorState, EmptyState } from '@/components/ui/states';

// SCR-O-07 — end-of-day summary (US-037, FR-O-13). Server Component: totals over
// delivered orders only (count, items sold, MYR revenue) from `endOfDay()`.
export const dynamic = 'force-dynamic';

export default async function EndOfDayPage() {
  const { locale, t } = getI18n();
  const res = await endOfDay();

  if (!res.ok) {
    return (
      <section className="space-y-4">
        <header>
          <h1 className="text-h1 font-bold text-slate">{t.end_of_day}</h1>
        </header>
        <ErrorState message={t.error_generic} />
      </section>
    );
  }

  const { orders, items_sold, revenue } = res.data;
  const stats = [
    { label: t.completed_orders, value: String(orders) },
    { label: t.items_sold, value: String(items_sold) },
    { label: t.revenue, value: formatMYR(revenue, locale) },
  ];

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-h1 font-bold text-slate">{t.end_of_day}</h1>
        <p className="text-sm text-muted">{t.eod_hint}</p>
      </header>

      {orders === 0 ? (
        <EmptyState title={t.eod_empty} icon="📊" />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="card text-center">
              <p className="text-2xl font-bold tabular-nums text-rust">{s.value}</p>
              <p className="text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
