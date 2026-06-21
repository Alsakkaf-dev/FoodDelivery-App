import Link from 'next/link';
import type { RiderDelivery } from '@/lib/domain/rider';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import { OrderStatusChip } from '@/components/ui/status';
import { formatMYR } from '@/lib/utils/money';

/**
 * Build a Google Maps deep-link from a saved pin or address (FR-R-04; no paid API).
 * Computed inline so the card needs no server round-trip (mirrors lib mapsLink).
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
 * Big tap targets and minimal text for a rider on a motorbike.
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
    <article className="card space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Link href={`/rider/${order.id}`} className="text-lg font-bold text-rust">
          #{order.order_no}
        </Link>
        <OrderStatusChip status={order.status} lang={locale} />
      </div>

      {address_line ? (
        <p className="text-base font-semibold text-slate">{address_line}</p>
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
        <span className="tabular-nums text-slate">{formatMYR(order.total, locale)}</span>
      </div>

      <div className="flex gap-2">
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary flex-1"
        >
          🗺️ {t.open_map}
        </a>
        {customer_phone ? (
          <a href={`tel:${customer_phone}`} className="btn-secondary flex-1">
            📞 {customer_phone}
          </a>
        ) : null}
      </div>

      <Link href={`/rider/${order.id}`} className="btn-primary w-full">
        {t.track_order}
      </Link>
    </article>
  );
}
