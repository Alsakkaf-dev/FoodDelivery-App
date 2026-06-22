import Link from 'next/link';
import { getStatus, openShop, closeShop, setSoldOut } from '@/lib/domain/session';
import { boardList } from '@/lib/domain/orders';
import { getI18n } from '@/lib/i18n/server';
import { ErrorState } from '@/components/ui/states';
import { StateControls } from '@/components/operator/state-controls';

// SCR-O-01 — Operator dashboard: the live day snapshot + one-tap
// Open / Close / Sold-Out (US-023/024/025, FR-O-01/02/03).
// Server component: fetch on the server, hydrate the live badge/qty + controls
// as the `state-controls` client island. The (operator) layout owns the shell
// (OfflineBanner, LangSwitch header, BottomNav), so this renders the dashboard
// content into that frame rather than re-declaring it.
export const dynamic = 'force-dynamic';

export default async function OperatorDashboardPage() {
  const { locale, t } = getI18n();
  const [statusRes, boardRes] = await Promise.all([getStatus(), boardList()]);

  const header = (
    <header className="flex items-center justify-between">
      <h1 className="text-h1 font-bold text-rust">{t.operator_dashboard}</h1>
    </header>
  );

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
  const ordersCount = boardRes.ok ? boardRes.data.orders.length : 0;
  const needsSetup = s.qty_total <= 0;

  return (
    <>
      {header}

      {/* Orders-count stat (live order board lands in task 3-4). */}
      <section className="card flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-3xl font-bold tabular-nums text-rust">{ordersCount}</span>
          <span className="text-sm text-muted">{t.orders}</span>
        </div>
        <Link href="/operator/board" className="btn-secondary shrink-0">
          {t.order_board}
        </Link>
      </section>

      {/* Empty / needs-setup state: the shop cannot open until a quantity is set
          (openShop guards qty_total > 0), so guide the operator to Daily setup. */}
      {needsSetup ? (
        <div className="card flex items-center justify-between gap-3 border-soldout/40 bg-soldout/5">
          <p className="text-sm text-slate">
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
