import Link from 'next/link';
import { listMyOrders } from '@/lib/domain/orders';
import { getI18n } from '@/lib/i18n/server';
import type { Order, OrderStatus } from '@/types/db';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { Icon } from '@/components/icons';
import { OrdersTabs } from '@/components/customer/order-list/orders-tabs';
import { OrderCard } from '@/components/customer/order-list/order-card';

// SCR-C-07 — My Orders (Engineer #13). Splits the former redirect-only /orders into a
// real surface: Ongoing / History underline tabs over the same listMyOrders() result.
// Server Component, URL-driven (?tab=ongoing default | history) so it stays SSR and
// shareable. Each row links to live tracking /orders/[id]. The (customer) group owns
// the shell `main` + the frozen bottom nav; /history redirects here (ruling R-4).
export const dynamic = 'force-dynamic';

// Ongoing vs History derived from the frozen OrderStatus union (no domain change).
const ONGOING: OrderStatus[] = ['new', 'confirmed', 'preparing', 'ready', 'out_for_delivery'];

export default async function OrdersPage({ searchParams }: { searchParams: { tab?: string } }) {
  const { locale, t } = getI18n();
  const tab: 'ongoing' | 'history' = searchParams?.tab === 'history' ? 'history' : 'ongoing';
  const res = await listMyOrders();

  return (
    <>
      <header className="flex items-center justify-between gap-3">
        <Link
          href="/"
          aria-label={t.back}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-pill bg-surface-alt text-ink"
        >
          <Icon name="chevron-start" />
        </Link>
        <h1 className="text-h1 font-bold text-ink">{t.my_orders}</h1>
        <Link
          href="/reviews"
          aria-label={t.reviews}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-pill bg-surface-alt text-ink"
        >
          <Icon name="star" />
        </Link>
      </header>

      <OrdersTabs active={tab} ongoingLabel={t.tab_ongoing} historyLabel={t.tab_history} />

      {!res.ok ? (
        <ErrorState message={t.error_generic} />
      ) : (
        <OrdersList orders={res.data} tab={tab} locale={locale} t={t} />
      )}
    </>
  );
}

