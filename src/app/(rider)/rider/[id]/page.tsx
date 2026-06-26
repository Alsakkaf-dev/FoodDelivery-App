import Link from 'next/link';
import { riderDeliveries, type RiderDelivery } from '@/lib/domain/rider';
import { getI18n } from '@/lib/i18n/server';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { OrderStatusChip } from '@/components/ui/status';
import { EmptyIllustration } from '@/components/brand';
import { Icon } from '@/components/icons';
import { formatMYR } from '@/lib/utils/money';
import { buildMapsLink } from '@/components/rider/delivery-card';
import { buildDirectionsLink } from '@/lib/maps/links';
import { RiderActions } from '@/components/rider/rider-actions';
import type { PaymentStatus } from '@/types/db';

// SCR-R-02 — Delivery detail with the pickup / deliver actions (FR-R-05/06). BODY ONLY
// (ruling R-5): the chrome (offline banner, max-w-md <main>, LangSwitch, BottomNav) comes
// from (rider)/layout.tsx. There is no single-delivery server fn, so we reuse
// riderDeliveries() and locate the order in the grouped result (kept simple, per the brief).
export const dynamic = 'force-dynamic';

export default async function RiderDeliveryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { locale, t } = getI18n();
  const res = await riderDeliveries();

  const header = (
    <div className="flex items-center gap-3">
      <Link
        href="/rider"
        aria-label={t.back}
        className="btn-secondary inline-flex h-11 w-11 items-center justify-center rounded-pill p-0"
      >
        <Icon name="chevron-start" className="h-5 w-5" aria-hidden />
      </Link>
      <h1 className="text-headerTitle font-bold text-ink">{t.details}</h1>
    </div>
  );

  if (!res.ok) {
    return (
      <div className="space-y-4">
        {header}
        <ErrorState message={t.error_generic} />
      </div>
    );
  }

  const delivery: RiderDelivery | undefined = Object.values(res.data)
    .flat()
    .find((d) => d.order.id === params.id);

  if (!delivery) {
    return (
      <div className="space-y-4">
        {header}
        <EmptyState
          title={t.error_generic}
          hint={t.no_deliveries_hint}
          illustration={<EmptyIllustration variant="generic" />}
        />
      </div>
    );
  }

  const { order, zone_name, address_line, pin_lat, pin_lng, customer_phone, items } = delivery;
  const mapsHref = buildMapsLink(pin_lat, pin_lng, address_line);
  const navHref = buildDirectionsLink(pin_lat, pin_lng, address_line);
  const payLabel: Record<PaymentStatus, string> = {
    pending: t.pay_pending,
    submitted: t.pay_submitted,
    verified: t.pay_verified,
    rejected: t.pay_rejected,
  };

  return (
    <div className="space-y-4">
      {header}

      <div className="flex items-center justify-between gap-2">
        <h2 className="text-h1 font-bold text-ink">#{order.order_no}</h2>
        <OrderStatusChip status={order.status} lang={locale} />
      </div>

      <section className="space-y-3 rounded-2xl bg-surface p-4 shadow-card">
        {zone_name ? (
          <p className="text-label uppercase tracking-wide text-muted">{zone_name}</p>
        ) : null}
        <p className="flex items-start gap-2 text-body font-semibold text-ink">
          <Icon name="map-pin" className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />
          <span>{address_line ?? t.address}</span>
        </p>
        <div className="flex gap-2">
          <a
            href={navHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-dark inline-flex flex-1 items-center justify-center gap-2"
          >
            <Icon name="navigation" className="h-4 w-4" aria-hidden />
            {t.navigate}
          </a>
          <a
            href={mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary inline-flex flex-1 items-center justify-center gap-2"
          >
            <Icon name="map-pin" className="h-4 w-4" aria-hidden />
            {t.open_map}
          </a>
        </div>
        {customer_phone ? (
          <div className="flex gap-2">
            <Link
              href={`/rider/${order.id}/call`}
              className="btn-secondary inline-flex flex-1 items-center justify-center gap-2"
            >
              <Icon name="phone" className="h-4 w-4" aria-hidden />
              {t.call}
            </Link>
            <Link
              href={`/rider/${order.id}/message`}
              className="btn-secondary inline-flex flex-1 items-center justify-center gap-2"
            >
              <Icon name="message" className="h-4 w-4" aria-hidden />
              {t.message}
            </Link>
          </div>
        ) : (
          <Link
            href={`/rider/${order.id}/message`}
            className="btn-secondary inline-flex w-full items-center justify-center gap-2"
          >
            <Icon name="message" className="h-4 w-4" aria-hidden />
            {t.message}
          </Link>
        )}
      </section>

      <section className="space-y-2 rounded-2xl bg-surface p-4 shadow-card">
        <h3 className="text-label uppercase tracking-wide text-muted">{t.cart}</h3>
        <ul className="space-y-1">
          {items.map((it, i) => (
            <li key={i} className="flex justify-between gap-2 text-body text-ink">
              <span>{locale === 'ar' ? it.name_ar : it.name_en}</span>
              <span className="font-semibold tabular-nums">×{it.qty}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-line pt-2 font-bold">
          <span className="text-muted">{order.item_count}</span>
          <span className="tabular-nums text-ink">{formatMYR(order.total, locale)}</span>
        </div>
      </section>

      {/* Payment method + status (US-040) — the rider must know if cash is due. */}
      <section
        className="flex items-center justify-between rounded-2xl bg-surface p-4 text-sm shadow-card"
        data-payment={order.payment_method}
      >
        <span className="flex items-center gap-2 text-muted">
          <Icon
            name={order.payment_method === 'cod' ? 'wallet' : 'credit-card'}
            className="h-4 w-4"
            aria-hidden
          />
          {t.payment}
        </span>
        <span className="font-semibold text-ink">
          {order.payment_method === 'cod' ? t.cod : t.duitnow} · {payLabel[order.payment_status]}
        </span>
      </section>

      <RiderActions
        orderId={order.id}
        status={order.status}
        pickedUpLabel={t.picked_up}
        deliveredLabel={t.delivered}
        errorLabel={t.error_generic}
      />
    </div>
  );
}
