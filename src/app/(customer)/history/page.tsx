import Link from 'next/link';
import { listMyOrders } from '@/lib/domain/orders';
import { getI18n } from '@/lib/i18n/server';
import { translate } from '@/lib/i18n/dictionaries';
import { formatMYR } from '@/lib/utils/money';
import { formatMyt } from '@/lib/utils/time';
import { OrderStatusChip } from '@/components/ui/status';
import { EmptyState, ErrorState } from '@/components/ui/states';

// SCR-C-07 — order history (US-020, FR-C-12). Server Component lists my orders
// (newest first) as rows: order no., MYT date, item count, MYR total and the
// final status chip — each row links to the live tracking screen /orders/[id].
// The (customer) group already guards offline (banner) + loading (loading.tsx).
export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const { locale, t } = getI18n();
  const ar = locale === 'ar';
  const res = await listMyOrders();

  return (
    // The (customer) group layout owns the shell `main` frame + bottom nav.
    <>
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-rust">{t.order_history}</h1>
        <Link href="/" className="text-sm text-muted">
          {t.home}
        </Link>
      </header>

      {!res.ok ? (
        <ErrorState message={ar ? 'تعذّر تحميل سجل الطلبات. حاول مرة أخرى.' : 'Couldn’t load your orders. Please try again.'} />
      ) : res.data.length === 0 ? (
        <EmptyState title={t.no_orders} hint={t.no_orders_hint} icon="🧾" />
      ) : (
        <ul className="space-y-3">
          {res.data.map((o) => (
            <li key={o.id}>
              <Link
                href={`/orders/${o.id}`}
                className="card flex min-h-tap items-center justify-between gap-3 active:scale-[.99]"
              >
                <div className="space-y-1">
                  <p className="font-bold text-rust">{o.order_no}</p>
                  <p className="text-sm text-muted">{formatMyt(o.created_at, locale)}</p>
                  <p className="text-sm text-slate">{translate(t, 'items_count', { n: String(o.item_count) })}</p>
                  <p className="font-semibold text-slate">{formatMYR(o.total, locale)}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="sr-only">{t.final_status}</span>
                  <OrderStatusChip status={o.status} lang={locale} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
