import Link from 'next/link';
import type { RiderDelivery } from '@/lib/domain/rider';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import { OrderStatusChip } from '@/components/ui/status';
import { Icon } from '@/components/icons';
import { formatMYR } from '@/lib/utils/money';

/**
 * Build a Google Maps deep-link from a saved pin or address (FR-R-04; no paid API).
 * Computed inline so the card needs no server round-trip (mirrors lib mapsLink).
 * FROZEN shared helper — imported by rider/[id]/page.tsx. Signature + body unchanged.
 */
export function buildMapsLink(
  lat: number | null,
  lng: number | null,
  address: string | null,
): string {
  if (lat !== null && lng !== null) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address ?? '')}`;
}

/**
 * CMP-R-01 — A single delivery card (FR-R-03/04/07).
 * Large rounded card + dark CTA pill; big tap targets for a rider on a motorbike.
 */
export function DeliveryCard({
  delivery,
  locale,
  t,
}: {
  delivery: RiderDelivery;
  locale: Locale;
  t: Dictionary;
}) {
  const { order, address_line, pin_lat, pin_lng, customer_phone, items } = delivery;
  const mapsHref = buildMapsLink(pin_lat, pin_lng, address_line);

  return (
    <article className="space-y-3 rounded-2xl bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <Link href={`/rider/${order.id}`} className="text-title font-bold text-ink">
          #{order.order_no}
        </Link>
        <OrderStatusChip status={order.status} lang={locale} />
      </div>

      {address_line ? (
        <p className="flex items-start gap-2 text-body font-semibold text-ink">
          <Icon name="map-pin" className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
          <span>{address_line}</span>
        </p>
      ) : null}

      <ul className="space-y-0.5 text-sm text-muted">
        {items.map((it, i) => (
          <li key={i} className="flex justify-between gap-2">
            <span>{locale === 'ar' ? it.name_ar : it.name_en}</span>
            <span className="font-semibold tabular-nums">×{it.qty}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-line pt-2 text-sm font-semibold">
        <span className="text-muted">{order.item_count}</span>
        <span className="tabular-nums text-ink">{formatMYR(order.total, locale)}</span>
      </div>

      <div className="flex gap-2">
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary inline-flex flex-1 items-center justify-center gap-2"
        >
          <Icon name="map-pin" className="h-4 w-4" aria-hidden />
          {t.open_map}
        </a>
        {customer_phone ? (
          <a
            href={`tel:${customer_phone}`}
            className="btn-secondary inline-flex flex-1 items-center justify-center gap-2"
          >
            <Icon name="phone" className="h-4 w-4" aria-hidden />
            {customer_phone}
          </a>
        ) : null}
      </div>

      <Link
        href={`/rider/${order.id}`}
        className="btn-dark inline-flex w-full items-center justify-center gap-2"
      >
        {t.track_order}
        <Icon name="chevron-right" className="h-4 w-4" aria-hidden />
      </Link>
    </article>
  );
}
