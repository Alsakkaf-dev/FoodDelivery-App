import { riderDeliveries } from '@/lib/domain/rider';
import { getI18n } from '@/lib/i18n/server';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { EmptyIllustration } from '@/components/brand';
import { DeliveryCard } from '@/components/rider/delivery-card';
import { RiderFeedSeed } from '@/components/rider/rider-feed-seed';

// SCR-R-01 — Today's deliveries, grouped by zone (FR-R-02/03/04/07).
// BODY ONLY (ruling R-5): the (rider)/layout.tsx shell (Plan 04) provides the
// OfflineBanner, the max-w-md <main> frame, the LangSwitch and the rider BottomNav, so
// this page renders just the feed content. Server component; the live-feed refresh is a
// client island.
export const dynamic = 'force-dynamic';

export default async function RiderDeliveriesPage() {
  const { locale, t } = getI18n();
  const res = await riderDeliveries();

  const header = <h1 className="text-h1 font-bold text-ink">{t.deliveries}</h1>;

  if (!res.ok) {
    return (
      <div className="space-y-4">
        {header}
        <ErrorState message={t.error_generic} />
      </div>
    );
  }

  const grouped = res.data;
  const zones = Object.entries(grouped);
  const allDeliveries = Object.values(grouped).flat();
  const total = allDeliveries.length;
  const seedOrders = allDeliveries.map((d) => d.order);

  return (
    <div className="space-y-4">
      {header}

      <RiderFeedSeed initial={seedOrders} refreshLabel={t.new_deliveries} />

      {total === 0 ? (
        <EmptyState
          title={t.no_deliveries}
          hint={t.no_deliveries_hint}
          illustration={<EmptyIllustration variant="orders" />}
        />
      ) : (
        zones.map(([zoneName, deliveries]) => (
          <section key={zoneName} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-label uppercase tracking-wide text-muted">{zoneName}</h2>
              <span className="rounded-pill bg-brand-tint px-2.5 py-0.5 text-caption font-bold text-brand">
                {deliveries.length}
              </span>
            </div>
            {deliveries.map((delivery) => (
              <DeliveryCard
                key={delivery.order.id}
                delivery={delivery}
                locale={locale}
                t={t}
              />
            ))}
          </section>
        ))
      )}
    </div>
  );
}
