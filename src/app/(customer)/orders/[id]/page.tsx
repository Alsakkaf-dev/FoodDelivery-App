import { notFound } from 'next/navigation';
import { getOrder } from '@/lib/domain/orders';
import { listMenu } from '@/lib/domain/menu';
import { getI18n } from '@/lib/i18n/server';
import { translate } from '@/lib/i18n/dictionaries';
import { formatMyt } from '@/lib/utils/time';
import { ErrorState } from '@/components/ui';
import { OrderTracker, type OrderLine } from '@/components/customer/order-tracker';
import type { MenuItem } from '@/types/db';

// SCR-C-06 — order confirmation + live tracking (US-018 / US-021, FR-C-10/11).
// Server Component: fetches the order + items via getOrder(id) and resolves the
// bilingual line names from the menu, then hydrates the OrderTracker island which
// subscribes over order:{id} for sub-2s live status updates. RLS restricts who
// can read the order; a missing/unauthorized order renders the not-found page.
export const dynamic = 'force-dynamic';

export default async function OrderPage({ params }: { params: { id: string } }) {
  const { locale, t } = getI18n();
  const ar = locale === 'ar';

  const res = await getOrder(params.id);
  if (!res.ok) {
    if (res.error.code === 'not_found') notFound();
    return <ErrorState message={ar ? 'تعذّر تحميل الطلب. حاول مرة أخرى.' : 'Couldn’t load this order. Please try again.'} />;
  }
  const { order, items } = res.data;

  // Resolve bilingual line names from the menu (reuses listMenu — no N+1 per line).
  const menuRes = await listMenu();
  const menu = new Map<string, MenuItem>();
  if (menuRes.ok) menuRes.data.forEach((m) => menu.set(m.id, m));
  const lines: OrderLine[] = items.map((it) => {
    const m = menu.get(it.menu_item_id);
    return {
      key: it.id,
      name: m ? (ar ? m.name_ar : m.name_en) : ar ? 'صنف' : 'Item',
      qty: it.qty,
      unitPrice: it.unit_price,
    };
  });

  const labels = {
    track: t.track_order,
    items: t.items,
    total: t.order_total,
    paymentStatus: t.payment_status,
    method: order.payment_method === 'cod' ? t.cod : t.duitnow,
    pay: {
      pending: t.pay_pending,
      submitted: t.pay_submitted,
      verified: t.pay_verified,
      rejected: t.pay_rejected,
    },
    shopName: t.shop_name,
    placedAt: translate(t, 'ordered_at', { time: formatMyt(order.created_at, locale) }),
    placed: t.order_placed,
    typeLabel: order.type === 'delivery' ? t.delivery : t.pickup,
    back: t.back,
    mapAlt: t.track_map_alt,
    contactRider: t.contact_rider,
    contactHref: '/messages',
  };

  // The (customer) group layout owns the shell `main` frame + bottom nav; the
  // OrderTracker renders its own header/chrome (the map bleeds to the frame edges).
  return <OrderTracker initial={order} lines={lines} lang={locale} labels={labels} />;
}
