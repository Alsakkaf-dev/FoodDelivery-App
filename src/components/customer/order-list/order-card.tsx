import Link from 'next/link';
import type { Order } from '@/types/db';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { translate } from '@/lib/i18n/dictionaries';
import { formatMYR } from '@/lib/utils/money';
import { formatMyt } from '@/lib/utils/time';
import { OrderStatusChip } from '@/components/ui/status';
import { Icon } from '@/components/icons';
import { OrderActions, type OrderActionLabels } from './order-actions';

// Engineer #13 — one order row (Server Component) for the My Orders surface.
// Single-vendor app: an order carries no shop name / category / photo, so the
// "shop" slot binds to the contracted `shop_name` dict value and the thumbnail is a
// branded tile whose icon encodes the order type (scooter = delivery, store =
// pickup) — no extra fetch, the frozen listMyOrders item_count contract is untouched.
// Status is the frozen `OrderStatusChip` (consumed, never forked). The interactive
// actions live in the OrderActions client island.

type Props = {
  order: Order;
  variant: 'ongoing' | 'history';
  locale: 'en' | 'ar';
  t: Dictionary;
};

export function OrderCard({ order, variant, locale, t }: Props) {
  const isHistory = variant === 'history';
  const delivery = order.type === 'delivery';

  const labels: OrderActionLabels = {
    track: t.track_order,
    cancel: t.cancel,
    rate: t.rate,
    reorder: t.reorder,
    confirmTitle: t.cancel_order_confirm,
    keep: t.keep_order,
    confirmCancel: t.confirm_cancel,
    tooLate: t.cancel_too_late,
    error: t.error_generic,
    composer: {
      title: t.write_review,
      ratingLabel: t.your_rating,
      reviewLabel: t.your_review,
      submit: t.submit_review,
      thanks: t.review_thanks,
      close: t.back,
    },
  };

  return (
    <article className="card space-y-3">
      <div className="flex items-start gap-3">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-md bg-brand-tint" aria-hidden>
          <Icon name={delivery ? 'scooter' : 'store'} className="text-brand" />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-title font-bold text-ink">{t.shop_name}</h3>
            <Link href={`/orders/${order.id}`} className="shrink-0 text-link font-bold text-brand underline">
              #{order.order_no}
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-2 text-caption">
            <span className="text-title font-bold text-ink">{formatMYR(order.total, locale)}</span>
            <span className="text-muted" aria-hidden>
              |
            </span>
            {isHistory ? (
              <>
                <span className="text-muted">{formatMyt(order.created_at, locale)}</span>
                <span className="text-muted" aria-hidden>
                  •
                </span>
              </>
            ) : null}
            <span className="text-muted">{translate(t, 'items_count', { n: String(order.item_count) })}</span>
          </div>

          <div>
            <span className="sr-only">{t.final_status}</span>
            <OrderStatusChip status={order.status} lang={locale} />
          </div>
        </div>
      </div>

      <OrderActions
        orderId={order.id}
        orderNo={order.order_no}
        status={order.status}
        variant={variant}
        shopName={t.shop_name}
        labels={labels}
      />
    </article>
  );
}
