import { riderDeliveries } from '@/lib/domain/rider';
import { getI18n } from '@/lib/i18n/server';
import { ErrorState } from '@/components/ui/states';
import { CallScreen } from '@/components/rider/call-screen';

// Additive rider route hosting the presentational Call screen (rider → customer contact).
// Reuses the frozen riderDeliveries() read to resolve the customer phone for this order.
export const dynamic = 'force-dynamic';

export default async function RiderCallPage({ params }: { params: { id: string } }) {
  const { locale, t } = getI18n();
  const res = await riderDeliveries();
  const delivery = res.ok
    ? Object.values(res.data)
        .flat()
        .find((d) => d.order.id === params.id)
    : undefined;

  if (!delivery) {
    return <ErrorState message={t.error_generic} />;
  }

  return (
    <CallScreen orderId={delivery.order.id} phone={delivery.customer_phone} locale={locale} />
  );
}
