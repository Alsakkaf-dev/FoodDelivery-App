'use client';
import type { Order, OrderStatus } from '@/types/db';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { useOrderBoard } from '@/lib/realtime/hooks';
import { EmptyState } from '@/components/ui/states';
import { BoardColumn } from './board-column';
import type { AdvanceAction, DispatchAction } from './order-chip';

// SCR-O-03 — the live order board (US-032/033/034). Client wrapper: `useOrderBoard`
// streams INSERT/UPDATE over the board:orders channel so a newly placed order
// lands in the New column within ~2s without a refresh; active orders are grouped
// into the six lifecycle columns (cancelled/refused orders drop off the board).
// The operator (operator) layout owns the header chrome, OfflineBanner + nav.
const COLUMNS: OrderStatus[] = ['new', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];

export function OrderBoard({
  initial,
  lang,
  t,
  advance,
  dispatch,
}: {
  initial: Order[];
  lang: 'en' | 'ar';
  t: Dictionary;
  advance: AdvanceAction;
  dispatch: DispatchAction;
}) {
  const orders = useOrderBoard(initial);
  const hasAny = orders.some((o) => COLUMNS.includes(o.status));

  return (
    <div className="space-y-4">
      <p className="text-caption text-muted" role="status">
        {t.board_hint}
      </p>
      {!hasAny ? (
        <EmptyState title={t.no_orders} hint={t.board_hint} icon="🧾" />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {COLUMNS.map((s) => (
            <BoardColumn
              key={s}
              status={s}
              orders={orders.filter((o) => o.status === s)}
              lang={lang}
              t={t}
              advance={advance}
              dispatch={dispatch}
            />
          ))}
        </div>
      )}
    </div>
  );
}
