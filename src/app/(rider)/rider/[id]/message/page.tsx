import { riderDeliveries } from '@/lib/domain/rider';
import { getI18n } from '@/lib/i18n/server';
import { ErrorState } from '@/components/ui/states';
import { MessageScreen } from '@/components/rider/message-screen';

// Additive rider route hosting the presentational Message screen (rider → customer chat).
// Reuses the frozen riderDeliveries() read to validate the order before opening the thread.
export const dynamic = 'force-dynamic';

export default async function RiderMessagePage({ params }: { params: { id: string } }) {
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

  return <MessageScreen orderId={delivery.order.id} locale={locale} />;
}
