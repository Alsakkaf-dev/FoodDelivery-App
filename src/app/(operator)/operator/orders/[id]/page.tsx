import { notFound } from 'next/navigation';
import { getI18n } from '@/lib/i18n/server';
import { getOrder, verifyPayment, refuseOrder } from '@/lib/domain/orders';
import { listMenu } from '@/lib/domain/menu';
import { formatMYR } from '@/lib/utils/money';
import { OrderStatusChip } from '@/components/ui/status';
import { ErrorState } from '@/components/ui/states';
import { PaymentActions } from '@/components/operator/payment-actions';
import type { MenuItem, PaymentStatus } from '@/types/db';

// SCR-O-04 — operator order detail (US-035/036, FR-O-14/15). Server Component:
// loads the order + lines via getOrder(id), resolves bilingual line names from the
// menu, shows totals + payment method/status and (for DuitNow) the proof image,
// then mounts the verify/reject + cancel/refuse island. The (operator) layout owns
// the shell; operator RLS restricts who can read the order.
export const dynamic = 'force-dynamic';

export default async function OperatorOrderDetail({ params }: { params: { id: string } }) {
  const { locale, t } = getI18n();
  const ar = locale === 'ar';

  const [orderRes, menuRes] = await Promise.all([getOrder(params.id), listMenu()]);
  if (!orderRes.ok) {
    if (orderRes.error.code === 'not_found') notFound();
    return <ErrorState message={t.error_generic} />;
  }
  const { order, items } = orderRes.data;

  const menu = new Map<string, MenuItem>();
  if (menuRes.ok) menuRes.data.forEach((m) => menu.set(m.id, m));
  const nameFor = (id: string) => {
    const m = menu.get(id);
    return m ? (ar ? m.name_ar : m.name_en) : ar ? 'صنف' : 'Item';
  };

  const payLabel: Record<PaymentStatus, string> = {
    pending: t.pay_pending,
    submitted: t.pay_submitted,
    verified: t.pay_verified,
    rejected: t.pay_rejected,
  };

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-h1 font-bold text-slate">{t.order_detail}</h1>
          <p className="text-sm tabular-nums text-muted">
            {t.order_no} {order.order_no} · {order.type === 'pickup' ? t.pickup : t.delivery}
          </p>
        </div>
        <OrderStatusChip status={order.status} lang={locale} />
      </header>

      {order.status === 'cancelled' && order.cancel_reason ? (
        <p className="rounded-control bg-soldout/10 p-3 text-sm text-soldout">{order.cancel_reason}</p>
      ) : null}

      {/* Items + total */}
      <div className="card space-y-2">
        <h2 className="font-semibold text-slate">{t.items}</h2>
        <ul className="divide-y divide-line">
          {items.map((it) => (
            <li key={it.id} className="flex items-center justify-between gap-3 py-2">
              <span className="text-slate">
                <span className="font-semibold">{it.qty}×</span> {nameFor(it.menu_item_id)}
              </span>
              <span className="shrink-0 tabular-nums text-muted">{formatMYR(it.qty * it.unit_price, locale)}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-line pt-2 font-bold text-slate">
          <span>{t.order_total}</span>
          <span className="text-rust">{formatMYR(order.total, locale)}</span>
        </div>
      </div>

      {/* Payment method + status */}
      <div className="card flex items-center justify-between text-sm">
        <span className="text-muted">{t.payment}</span>
        <span className="font-semibold text-slate">
          {order.payment_method === 'cod' ? t.cod : t.duitnow} · {payLabel[order.payment_status]}
        </span>
      </div>

      {/* DuitNow proof image */}
      {order.payment_method === 'duitnow_qr' && order.proof_url ? (
        <div className="card space-y-2">
          <h2 className="font-semibold text-slate">{t.payment_proof}</h2>
          <div
            className="h-56 w-full rounded-control border border-line bg-cream bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${order.proof_url})` }}
            role="img"
            aria-label={t.payment_proof}
          />
        </div>
      ) : null}

      <PaymentActions
        orderId={order.id}
        paymentMethod={order.payment_method}
        paymentStatus={order.payment_status}
        status={order.status}
        t={t}
        verify={verifyPayment}
        refuse={refuseOrder}
      />
    </section>
  );
}
