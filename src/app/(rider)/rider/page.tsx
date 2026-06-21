import { riderDeliveries } from '@/lib/domain/rider';
import { getI18n } from '@/lib/i18n/server';
import { EmptyState, ErrorState, OfflineBanner } from '@/components/ui/states';
import { LangToggle } from '@/components/ui/controls';
import { BottomNav } from '@/components/ui/nav';
import { DeliveryCard } from '@/components/rider/delivery-card';
import { RiderFeedSeed } from '@/components/rider/rider-feed-seed';

// SCR-R-01 — Today's deliveries, grouped by zone (FR-R-02/03/04/07).
// Server component: fetch on the server, hydrate interactive bits as client islands.
export const dynamic = 'force-dynamic';

export default async function RiderDeliveriesPage() {
  const { locale, t } = getI18n();
  const res = await riderDeliveries();

  const nav = (
    <BottomNav items={[{ href: '/rider', label: t.deliveries, icon: '🛵' }]} />
  );

  const header = (
    <header className="flex items-center justify-between">
      <h1 className="text-xl font-bold text-rust">{t.deliveries}</h1>
      <LangToggle current={locale} />
    </header>
  );

  if (!res.ok) {
    return (
      <>
        <OfflineBanner label={t.offline} />
        <main className="mx-auto min-h-dvh max-w-md space-y-4 p-4 pb-24">
          {header}
          <ErrorState message={t.error_generic} />
        </main>
        {nav}
      </>
    );
  }

  const grouped = res.data;
  const zones = Object.entries(grouped);
  const allDeliveries = Object.values(grouped).flat();
  const total = allDeliveries.length;
  const seedOrders = allDeliveries.map((d) => d.order);

  return (
    <>
      <OfflineBanner label={t.offline} />
      <main className="mx-auto min-h-dvh max-w-md space-y-4 p-4 pb-24">
        {header}

        <RiderFeedSeed initial={seedOrders} refreshLabel={t.deliveries} />

        {total === 0 ? (
          <EmptyState title={t.deliveries} hint={t.sold_out_msg} icon="🛵" />
        ) : (
          zones.map(([zoneName, deliveries]) => (
            <section key={zoneName} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wide text-muted">
                  {zoneName}
                </h2>
                <span className="badge bg-cream text-slate">{deliveries.length}</span>
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
      </main>
      {nav}
    </>
  );
}
