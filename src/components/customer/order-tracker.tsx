'use client';
import { useOrderStatus } from '@/lib/realtime/hooks';
import { Timeline } from '@/components/ui/timeline';
import { OrderStatusChip } from '@/components/ui/status';
import { formatMYR } from '@/lib/utils/money';
import type { Order, PaymentStatus } from '@/types/db';

export type OrderLine = { key: string; name: string; qty: number; unitPrice: number };

type Props = {
  initial: Order;
  lines: OrderLine[];
  lang: 'en' | 'ar';
  labels: {
    track: string;
    items: string;
    total: string;
    paymentStatus: string;
    method: string;
    pay: Record<PaymentStatus, string>;
  };
};

// SCR-C-06 — live order tracking island (US-018 / US-021, FR-C-10/11). The server
// passes the initial order + resolved lines; `useOrderStatus` keeps `status`,
// `payment_status` and `total` live over the order:{id} channel so an operator/
// rider advance reflects within 2s without a refresh (NFR-P-01). The Timeline
// re-renders from the live status; cancelled shows the timeline's cancelled branch.
export function OrderTracker({ initial, lines, lang, labels }: Props) {
  const order = useOrderStatus(initial.id, initial);
  const cancelled = order.status === 'cancelled';

  return (
    <div className="space-y-4">
      {/* Current state, highlighted — announced politely so a live advance is heard. */}
      <div
        className={`card flex items-center justify-between gap-3 ${cancelled ? 'border-soldout/40 bg-soldout/5' : 'border-teal/40 bg-teal/5'}`}
        aria-live="polite"
      >
        <span className="font-semibold text-slate">{labels.track}</span>
        <OrderStatusChip status={order.status} lang={lang} />
      </div>

      {cancelled && order.cancel_reason ? (
        <p className="rounded-control bg-soldout/10 p-3 text-sm text-soldout">{order.cancel_reason}</p>
      ) : null}

      {/* Lifecycle timeline — lists all states and highlights the current one (CMP-U-13). */}
      <Timeline status={order.status} lang={lang} />

      {lines.length > 0 ? (
        <div className="card space-y-2">
          <h2 className="font-semibold text-slate">{labels.items}</h2>
          <ul className="divide-y divide-line">
            {lines.map((l) => (
              <li key={l.key} className="flex items-center justify-between gap-3 py-2">
                <span className="text-slate">
                  <span className="font-semibold">{l.qty}×</span> {l.name}
                </span>
                <span className="shrink-0 text-muted">{formatMYR(l.qty * l.unitPrice, lang)}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-line pt-2 font-bold text-slate">
            <span>{labels.total}</span>
            <span className="text-rust">{formatMYR(order.total, lang)}</span>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3 text-sm text-muted">
        <span>{labels.paymentStatus}</span>
        <span className="font-semibold text-slate">
          {labels.method} · {labels.pay[order.payment_status]}
        </span>
      </div>
    </div>
  );
}
