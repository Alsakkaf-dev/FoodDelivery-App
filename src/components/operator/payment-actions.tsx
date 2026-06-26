'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { OrderStatus, PaymentMethod, PaymentStatus } from '@/types/db';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { ApiResult } from '@/lib/utils/api';

// SCR-O-04 — operator payment + cancel actions (US-035/036, FR-O-14/15).
// Verify/Reject a DuitNow proof (→ verifyPayment, which notifies the customer of
// the verdict) and Cancel/Refuse with a required reason (→ refuseOrder, which the
// DB restock trigger uses to return reserved units and notifies the customer).
// Only New/Confirmed orders are refusable. Prop-driven (actions arrive as props)
// so it carries no server-only imports.

export type VerifyAction = (id: string, decision: 'verified' | 'rejected') => Promise<ApiResult<true>>;
export type RefuseAction = (id: string, reason: string) => Promise<ApiResult<true>>;

// Exported (additive — value/semantics unchanged) so the board chip can single-source
// the same refusable rule instead of duplicating it. Frozen contract per the brief.
export const REFUSABLE: OrderStatus[] = ['new', 'confirmed'];

export function PaymentActions({
  orderId,
  paymentMethod,
  paymentStatus,
  status,
  t,
  verify,
  refuse,
}: {
  orderId: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  t: Dictionary;
  verify: VerifyAction;
  refuse: RefuseAction;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [reason, setReason] = useState('');
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const refusable = REFUSABLE.includes(status);
  const isQR = paymentMethod === 'duitnow_qr';

  function run(fn: () => Promise<ApiResult<true>>, okText: string) {
    setMsg(null);
    start(async () => {
      const res = await fn();
      if (res.ok) {
        setMsg({ kind: 'ok', text: okText });
        router.refresh();
      } else {
        setMsg({ kind: 'err', text: t.error_generic });
      }
    });
  }

  return (
    <div className="space-y-4" data-refusable={refusable ? 'yes' : 'no'}>
      {msg ? (
        <p
          className={`rounded-lg px-3 py-2 text-body font-semibold ${
            msg.kind === 'ok' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
          }`}
          role={msg.kind === 'ok' ? 'status' : 'alert'}
        >
          {msg.text}
        </p>
      ) : null}

      {/* Verify / reject the DuitNow proof (US-035) — green = confirm, red = destructive. */}
      {isQR ? (
        <section className="card space-y-3">
          <h2 className="text-title font-bold text-ink">{t.payment_proof}</h2>
          <div className="flex gap-3">
            <button
              type="button"
              className="btn-open min-h-tap flex-1"
              disabled={pending || paymentStatus === 'verified'}
              onClick={() => run(() => verify(orderId, 'verified'), t.verdict_saved)}
              data-verdict="verified"
            >
              ✓ {t.verify}
            </button>
            <button
              type="button"
              className="btn min-h-tap flex-1 bg-danger text-onColor"
              disabled={pending || paymentStatus === 'rejected'}
              onClick={() => run(() => verify(orderId, 'rejected'), t.verdict_saved)}
              data-verdict="rejected"
            >
              {t.reject}
            </button>
          </div>
        </section>
      ) : null}

      {/* Cancel / refuse with a required reason (US-036) */}
      <section className="card space-y-3">
        <h2 className="text-title font-bold text-ink">{t.refuse_order}</h2>
        {refusable ? (
          <>
            <label className="block">
              <span className="mb-1 block text-label uppercase tracking-wide text-muted">{t.reason}</span>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={200}
                rows={2}
                className="field"
                placeholder={t.reason}
              />
            </label>
            <p className="text-caption text-muted">{t.refuse_hint}</p>
            <button
              type="button"
              className="btn min-h-tap w-full bg-danger text-onColor"
              disabled={pending || reason.trim().length === 0}
              onClick={() => run(() => refuse(orderId, reason.trim()), t.order_refused)}
              data-action="refuse"
            >
              {t.refuse}
            </button>
          </>
        ) : (
          <p className="text-body text-muted" role="status">
            {t.not_refusable}
          </p>
        )}
      </section>
    </div>
  );
}
