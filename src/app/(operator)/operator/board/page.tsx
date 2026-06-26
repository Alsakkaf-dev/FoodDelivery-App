import { getI18n } from '@/lib/i18n/server';
import { boardList, advanceOrder, dispatchOrder } from '@/lib/domain/orders';
import { ErrorState } from '@/components/ui/states';
import { OrderBoard } from '@/components/operator/order-board';

// SCR-O-03 — Live order board (US-032/033/034, FR-O-09/10/11). Server component:
// seeds today's orders via `boardList()` and hands them + the operator-only
// advance/dispatch actions to the client board, which streams updates live.
export const dynamic = 'force-dynamic';

export default async function BoardPage() {
  const { locale, t } = getI18n();
  const res = await boardList();

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-h1 font-bold text-ink">{t.order_board}</h1>
      </header>

      {res.ok ? (
        <OrderBoard
          initial={res.data.orders}
          lang={locale}
          t={t}
          advance={advanceOrder}
          dispatch={dispatchOrder}
        />
      ) : (
        <ErrorState message={t.error_generic} />
      )}
    </section>
  );
}
