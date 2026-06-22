import type { Order, OrderStatus } from '@/types/db';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { OrderStatusChip } from '@/components/ui/status';
import { OrderChip, type AdvanceAction, type DispatchAction } from './order-chip';

// SCR-O-03 — one status column on the live board: a localized status header, a
// live count badge, and the order chips in that status. Rendered by the client
// board wrapper; carries no state of its own.
export function BoardColumn({
  status,
  orders,
  lang,
  t,
  advance,
  dispatch,
}: {
  status: OrderStatus;
  orders: Order[];
  lang: 'en' | 'ar';
  t: Dictionary;
  advance: AdvanceAction;
  dispatch: DispatchAction;
}) {
  return (
    <section className="w-64 shrink-0 space-y-3" data-column={status}>
      <header className="flex items-center justify-between">
        <OrderStatusChip status={status} lang={lang} />
        <span className="badge bg-cream tabular-nums text-slate" aria-label={`${orders.length}`} data-count={orders.length}>
          {orders.length}
        </span>
      </header>
      {orders.length === 0 ? (
        <p className="rounded-control border border-dashed border-line py-6 text-center text-caption text-muted" aria-hidden>
          —
        </p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id}>
              <OrderChip order={o} lang={lang} t={t} advance={advance} dispatch={dispatch} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
