import Link from 'next/link';
import { riderDeliveries, type RiderDelivery } from '@/lib/domain/rider';
import { getI18n } from '@/lib/i18n/server';
import { EmptyState, ErrorState, OfflineBanner } from '@/components/ui/states';
import { LangToggle } from '@/components/ui/controls';
import { OrderStatusChip } from '@/components/ui/status';
import { formatMYR } from '@/lib/utils/money';
import { buildMapsLink } from '@/components/rider/delivery-card';
import { RiderActions } from '@/components/rider/rider-actions';

// SCR-R-02 — Delivery detail with the pickup / deliver actions (FR-R-05/06).
// There is no single-delivery server fn, so we reuse riderDeliveries() and locate
// the order in the grouped result (kept simple, per the build brief).
export const dynamic = 'force-dynamic';

export default async function RiderDeliveryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { locale, t } = getI18n();
  const res = await riderDeliveries();

  const header = (
    <header className="flex items-center justify-between">
      <Link href="/rider" className="text-rust" aria-label="back">
        ← {t.deliveries}
      </Link>
      <LangToggle current={locale} />
    </header>
  );

  if (!res.ok) {
    return (
      <>
        <OfflineBanner label={t.offline} />
        <main className="mx-auto min-h-dvh max-w-md space-y-4 p-4">
          {header}
          <ErrorState message={t.error_generic} />
        </main>
      </>
    );
  }

  const delivery: RiderDelivery | undefined = Object.values(res.data)
    .flat()
    .find((d) => d.order.id === params.id);

  if (!delivery) {
    return (
      <>
        <OfflineBanner label={t.offline} />
        <main className="mx-auto min-h-dvh max-w-md space-y-4 p-4">
          {header}
          <EmptyState title={t.error_generic} hint={t.deliveries} icon="🛵" />
        </main>
      </>
    );
  }

  const { order, zone_name, address_line, pin_lat, pin_lng, customer_phone, items } = delivery;
  const mapsHref = buildMapsLink(pin_lat, pin_lng, address_line);

  return (
    <>
      <OfflineBanner label={t.offline} />
      <main className="mx-auto min-h-dvh max-w-md space-y-4 p-4 pb-8">
        {header}

        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-bold text-rust">#{order.order_no}</h1>
          <OrderStatusChip status={order.status} lang={locale} />
        </div>

        <section className="card space-y-2">
          {zone_name ? (
            <p className="text-sm font-bold uppercase tracking-wide text-muted">{zone_name}</p>
          ) : null}
          <p className="text-lg font-semibold text-slate">
            {address_line ?? t.address}
          </p>
          <a
            href={mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary w-full"
          >
            🗺️ {t.open_map}
          </a>
          {customer_phone ? (
            <a href={`tel:${customer_phone}`} className="btn-secondary w-full">
              📞 {customer_phone}
            </a>
          ) : null}
        </section>

        <section className="card space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted">{t.cart}</h2>
          <ul className="space-y-1">
            {items.map((it, i) => (
              <li key={i} className="flex justify-between gap-2 text-slate">
                <span>{locale === 'ar' ? it.name_ar : it.name_en}</span>
                <span className="font-semibold tabular-nums">×{it.qty}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-line pt-2 font-bold">
            <span className="text-muted">{order.item_count}</span>
            <span className="tabular-nums text-slate">{formatMYR(order.total, locale)}</span>
          </div>
        </section>

        <RiderActions
          orderId={order.id}
          status={order.status}
          pickedUpLabel={t.picked_up}
          deliveredLabel={t.delivered}
          errorLabel={t.error_generic}
        />
      </main>
    </>
  );
}
