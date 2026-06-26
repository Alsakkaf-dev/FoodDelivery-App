'use client';
import Link from 'next/link';
import { useOrderStatus } from '@/lib/realtime/hooks';
import { Timeline, OrderStatusChip } from '@/components/ui';
import { Icon } from '@/components/icons';
import { formatMYR } from '@/lib/utils/money';
import { formatMyt } from '@/lib/utils/time';
import { TrackMap } from './track-map';
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
    // Optional new copy (provided by the page from the dictionary). All have inline
    // fallbacks so the existing unit test's labels object still type-checks + renders.
    shopName?: string;
    placedAt?: string;
    placed?: string;
    typeLabel?: string;
    back?: string;
    mapAlt?: string;
    contactRider?: string;
    contactHref?: string;
  };
};

// SCR-C-06 — order confirmation + live tracking island (US-018 / US-021, FR-C-10/11).
// The server passes the initial order + resolved lines; `useOrderStatus` keeps `status`,
// `payment_status` and `total` live over the order:{id} channel so an operator/rider
// advance reflects within 2s without a refresh (NFR-P-01). For a delivery the screen is
// an immersive map (floating dark header + TrackMap + persistent summary sheet); for a
// pickup it falls back to a no-map confirmation layout. Early statuses read as a placed
// confirmation; later statuses grow the tracking emphasis (route fills, rider contact
// appears). The Timeline + OrderStatusChip re-render from the live status.
export function OrderTracker({ initial, lines, lang, labels }: Props) {
  const order = useOrderStatus(initial.id, initial);
  const cancelled = order.status === 'cancelled';
  const isEarly = order.status === 'new' || order.status === 'confirmed';
  const showContact = order.type === 'delivery' && order.status === 'out_for_delivery';

  const shopName = labels.shopName ?? 'Fahman Orders';
  const back = labels.back ?? (lang === 'ar' ? 'رجوع' : 'Back');
  const contactHref = labels.contactHref ?? '/messages';

  const backButton = (
    <Link
      href="/orders"
      aria-label={back}
      className="inline-flex min-h-tap min-w-tap items-center justify-center rounded-full bg-dark-cta text-onColor shadow-card transition active:scale-95 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
    >
      <Icon name="chevron-start" className="h-5 w-5" />
    </Link>
  );

  // Shared order-summary content (used by both the map and no-map layouts). The
  // aria-live region announces a live status advance politely.
  const summary = (
    <div className="space-y-4" aria-live="polite">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-tint text-brand">
          <Icon name="store" className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-title font-bold text-ink">{shopName}</p>
          <p className="truncate text-caption text-muted">
            #{order.order_no} · {labels.placedAt ?? formatMyt(order.created_at, lang)}
          </p>
        </div>
        <OrderStatusChip status={order.status} lang={lang} />
      </div>

      {isEarly && !cancelled ? (
        <p className="flex items-center gap-2 text-sm font-semibold text-success">
          <Icon name="check-circle" className="h-5 w-5" />
          {labels.placed ?? (lang === 'ar' ? 'تم استلام الطلب' : 'Order placed')}
        </p>
      ) : null}

      {cancelled && order.cancel_reason ? (
        <p className="rounded-md bg-danger/10 p-3 text-sm text-danger">{order.cancel_reason}</p>
      ) : null}

      <Timeline status={order.status} lang={lang} />

      {lines.length > 0 ? (
        <div className="card space-y-2">
          <h2 className="text-h2 font-bold text-ink">{labels.items}</h2>
          <ul className="divide-y divide-line">
            {lines.map((l) => (
              <li key={l.key} className="flex items-center justify-between gap-3 py-2">
                <span className="text-body text-ink">
                  <span className="font-bold">{l.qty}×</span> {l.name}
                </span>
                <span className="shrink-0 tabular-nums text-muted">{formatMYR(l.qty * l.unitPrice, lang)}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-line pt-2 text-title font-bold text-ink">
            <span>{labels.total}</span>
            <span className="text-brand">{formatMYR(order.total, lang)}</span>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-muted">{labels.paymentStatus}</span>
        <span className="font-semibold text-ink">
          {labels.method} · {labels.pay[order.payment_status]}
        </span>
      </div>

      {showContact ? (
        <Link href={contactHref} className="btn-secondary flex w-full items-center justify-center gap-2">
          <Icon name="message" className="h-5 w-5" />
          {labels.contactRider ?? (lang === 'ar' ? 'تواصل مع السائق' : 'Contact rider')}
        </Link>
      ) : null}
    </div>
  );

  // Pickup (or any non-delivery) — no map; a confirmation-first layout.
  if (order.type !== 'delivery') {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          {backButton}
          <h1 className="text-headerTitle font-semibold text-ink">{labels.track}</h1>
          {labels.typeLabel ? <span className="badge ms-auto bg-brand-tint text-brand">{labels.typeLabel}</span> : null}
        </div>
        {summary}
      </section>
    );
  }

  // Delivery — immersive map with a floating header and a persistent summary sheet.
  // `-mx-4 -mt-4` bleeds to the shell frame edges (the (customer) layout pads `p-4`).
  return (
    <section className="-mx-4 -mt-4">
      <div className="relative">
        <div className="h-[56vh] max-h-[30rem] min-h-[18rem] w-full overflow-hidden bg-surface-alt">
          <TrackMap status={order.status} lang={lang} label={labels.mapAlt} />
        </div>
        <div className="absolute inset-x-0 top-0 flex items-center gap-3 p-4">
          {backButton}
          <h1 className="text-headerTitle font-semibold text-ink">{labels.track}</h1>
        </div>
      </div>

      <div className="relative -mt-6 rounded-t-3xl bg-surface px-4 pb-6 pt-3 shadow-sheet">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-pill bg-line" aria-hidden />
        {summary}
      </div>
    </section>
  );
}
