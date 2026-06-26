'use client';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import type { Order, OrderStatus } from '@/types/db';
import { ORDER_TRANSITIONS } from '@/types/db';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { ApiResult } from '@/lib/utils/api';
import { formatMYR } from '@/lib/utils/money';
import { OrderStatusChip } from '@/components/ui/status';
import { REFUSABLE } from './payment-actions';

// SCR-O-03 — one order chip on the live board (US-033/034, FR-O-10/11).
// The Advance button only offers the legal next status computed from
// ORDER_TRANSITIONS (never hard-coded); the action re-validates and rejects an
// illegal move with `invalid_transition`. A Ready delivery order shows Dispatch
// (→ out_for_delivery), which surfaces it on the rider feed grouped by zone.

export type AdvanceAction = (input: { id: string; to_status: OrderStatus }) => Promise<ApiResult<Order>>;
export type DispatchAction = (id: string) => Promise<ApiResult<Order>>;

/** The single legal forward status for the Advance button (cancel excluded). */
export function forwardStatus(order: Order): OrderStatus | null {
  const opts = ORDER_TRANSITIONS[order.status].filter((s) => s !== 'cancelled');
  if (opts.length === 0) return null;
  // Ready can go two ways: a delivery order is dispatched to the rider
  // (out_for_delivery, via the Dispatch button); a pickup order is completed.
  if (order.status === 'ready') return order.type === 'pickup' ? 'delivered' : 'out_for_delivery';
  return opts[0]!;
}

/** A Ready delivery order can be dispatched to the rider (US-034). */
export function canDispatch(order: Order): boolean {
  return order.status === 'ready' && order.type === 'delivery';
}

export function OrderChip({
  order,
  lang,
  t,
  advance,
  dispatch,
}: {
  order: Order;
  lang: 'en' | 'ar';
  t: Dictionary;
  advance: AdvanceAction;
  dispatch: DispatchAction;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const next = forwardStatus(order);
  const dispatchable = canDispatch(order);
  // Cancel is offered only when the order is still refusable (new/confirmed); it routes
  // to the order-detail refuse section, which owns the required-reason refuseOrder flow.
  const refusable = REFUSABLE.includes(order.status);
  const hasActions = dispatchable || Boolean(next) || refusable;

  function run(fn: () => Promise<ApiResult<Order>>) {
    setError(null);
    start(async () => {
      const res = await fn();
      // On success the board:orders UPDATE stream moves the chip to its new
      // column within ~2s — no manual refresh. On failure show the reason.
      if (!res.ok) {
        setError(res.error.code === 'invalid_transition' ? t.err_invalid_transition : t.error_generic);
      }
    });
  }

  return (
    <article className="card space-y-3" data-order-status={order.status}>
      <div className="flex items-center justify-between gap-2">
        <Link
          href={`/operator/orders/${order.id}`}
          className="text-title font-bold tabular-nums text-ink underline-offset-2 hover:text-brand hover:underline"
        >
          {order.order_no}
        </Link>
        <OrderStatusChip status={order.status} lang={lang} />
      </div>
      <div className="flex items-center justify-between text-caption text-muted">
        <span>{order.type === 'pickup' ? t.pickup : t.delivery}</span>
        <span className="tabular-nums text-body">
          {t.items_count.replace('{{n}}', String(order.item_count))} · {formatMYR(order.total, lang)}
        </span>
      </div>

      {hasActions ? (
        <div className="flex gap-2">
          {dispatchable ? (
            <button
              type="button"
              className="btn-primary min-h-tap flex-1"
              disabled={pending}
              onClick={() => run(() => dispatch(order.id))}
              data-action="dispatch"
            >
              {t.dispatch}
            </button>
          ) : next ? (
            <button
              type="button"
              className="btn-primary min-h-tap flex-1"
              disabled={pending}
              onClick={() => run(() => advance({ id: order.id, to_status: next }))}
              data-action="advance"
              data-advance-to={next}
            >
              {t.advance}
            </button>
          ) : null}

          {refusable ? (
            <Link
              href={`/operator/orders/${order.id}`}
              className="btn min-h-tap flex-1 border border-danger text-danger"
            >
              {t.cancel}
            </Link>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p className="text-caption text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </article>
  );
}
