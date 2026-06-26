import Link from 'next/link';
import { getStatus, openShop, closeShop, setSoldOut } from '@/lib/domain/session';
import { boardList, endOfDay } from '@/lib/domain/orders';
import { getI18n } from '@/lib/i18n/server';
import { formatMYR } from '@/lib/utils/money';
import { ErrorState } from '@/components/ui/states';
import { StateControls } from '@/components/operator/state-controls';
import { AnalyticsChart, type ChartPoint } from '@/components/operator/analytics-chart';
import type { Order, OrderStatus } from '@/types/db';

// SCR-O-01 — Operator dashboard: the live day snapshot (KPI stat cards + revenue
// analytics chart), the one-tap Open / Close / Sold-Out controls (US-023/024/025,
// FR-O-01/02/03), plus honest Reviews / Popular-Items placeholders where no frozen
// data source exists yet. Server component: fetch on the server, hydrate the live
// badge/qty + controls + chart range as client islands. The (operator) layout owns
// the shell (OfflineBanner, LangSwitch header, BottomNav).
export const dynamic = 'force-dynamic';

// Active = still "running" on the board (delivered/cancelled drop off).
const ACTIVE: OrderStatus[] = ['new', 'confirmed', 'preparing', 'ready', 'out_for_delivery'];

function hourLabel(h: number) {
  const period = h < 12 ? 'AM' : 'PM';
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}${period}`;
}

// Real daily revenue spline: today's orders bucketed by the hour of created_at,
// summing order totals. No fabricated data — empty in, empty out.
function dailyRevenue(orders: Order[], locale: 'en' | 'ar'): ChartPoint[] {
  const byHour = new Map<number, number>();
  for (const o of orders) {
    const h = new Date(o.created_at).getHours();
    byHour.set(h, (byHour.get(h) ?? 0) + o.total);
  }
  return [...byHour.keys()]
    .sort((a, b) => a - b)
    .map((h) => {
      const v = byHour.get(h)!;
      return { label: hourLabel(h), value: v, display: formatMYR(v, locale) };
    });
}

export default async function OperatorDashboardPage() {
  const { locale, t } = getI18n();
  const [statusRes, boardRes, eodRes] = await Promise.all([getStatus(), boardList(), endOfDay()]);

  const header = <h1 className="text-h1 font-bold text-ink">{t.operator_dashboard}</h1>;

  // Error state — the live status snapshot could not be read.
  if (!statusRes.ok) {
    return (
      <>
        {header}
        <ErrorState message={t.error_generic} />
      </>
    );
  }

  const s = statusRes.data;
  const orders = boardRes.ok ? boardRes.data.orders : [];
  const running = orders.filter((o) => ACTIVE.includes(o.status)).length;
  const requests = orders.filter((o) => o.status === 'new').length;
  const revenue = eodRes.ok ? eodRes.data.revenue : 0;
  const needsSetup = s.qty_total <= 0;
  const twoDigit = (n: number) => String(n).padStart(2, '0');

  return (
    <>
      {header}

      {/* KPI stat cards — live counts from the board (real data). */}
      <section className="grid grid-cols-2 gap-3">
        <Link href="/operator/board" className="card flex flex-col gap-1">
          <span className="text-display font-extrabold tabular-nums text-ink">{twoDigit(running)}</span>
          <span className="text-label uppercase tracking-wide text-muted">{t.running_orders}</span>
        </Link>
        <Link href="/operator/board" className="card flex flex-col gap-1">
          <span className="text-display font-extrabold tabular-nums text-ink">{twoDigit(requests)}</span>
          <span className="text-label uppercase tracking-wide text-muted">{t.order_requests}</span>
        </Link>
      </section>

      {/* Revenue analytics — today's total (endOfDay) + a real hourly spline. */}
      <AnalyticsChart
        title={t.total_revenue}
        total={formatMYR(revenue, locale)}
        points={dailyRevenue(orders, locale)}
        rangeLabels={{ daily: t.range_daily, weekly: t.range_weekly, monthly: t.range_monthly }}
        emptyLabel={t.no_revenue_data}
        detailsHref="/operator/end-of-day"
        detailsLabel={t.see_details}
      />

      {/* Reviews — no operator-reviews source exists yet → honest empty state. */}
      <section className="card space-y-1">
        <h2 className="text-h2 font-bold text-ink">{t.reviews}</h2>
        <p className="text-body">{t.no_reviews}</p>
        <p className="text-caption text-muted">{t.no_reviews_hint}</p>
      </section>

      {/* Popular items — no per-item sales ranking source yet → honest empty state. */}
      <section className="card space-y-1">
        <h2 className="text-h2 font-bold text-ink">{t.popular_items}</h2>
        <p className="text-body">{t.no_popular_items}</p>
        <p className="text-caption text-muted">{t.no_popular_items_hint}</p>
      </section>

      {/* Needs-setup nudge: openShop guards qty_total > 0, so guide to Daily setup. */}
      {needsSetup ? (
        <div className="card flex items-center justify-between gap-3 border-warning/40 bg-warning/5">
          <p className="text-body">
            {locale === 'ar'
              ? 'حدّد كمية اليوم قبل فتح المتجر.'
              : 'Set today’s quantity before opening the shop.'}
          </p>
          <Link href="/operator/setup" className="btn-secondary shrink-0">
            {t.daily_setup}
          </Link>
        </div>
      ) : null}

      <StateControls
        initial={{ status: s.status, qty_remaining: s.qty_remaining }}
        qtyTotal={s.qty_total}
        lang={locale}
        labels={{
          open: t.open_shop,
          close: t.close_shop,
          soldOut: t.set_sold_out,
          error: t.error_generic,
        }}
        onOpen={openShop}
        onClose={closeShop}
        onSoldOut={setSoldOut}
      />
    </>
  );
}
