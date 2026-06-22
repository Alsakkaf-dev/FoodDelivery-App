'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShopStatus } from '@/lib/realtime/hooks';
import { useCart } from '@/lib/cart/store';
import { pastCutoff } from '@/lib/utils/time';
import { getDictionary, type Dictionary } from '@/lib/i18n/dictionaries';
import { StatusBadge } from '@/components/ui/status';
import { EmptyState, ErrorState, Loading } from '@/components/ui/states';
import { ProofUpload } from './proof-upload';
import type { PaymentMethod, ShopStatus } from '@/types/db';

// SCR-C-05 part 2 — payment method, the ordering gate, and place-order
// (US-016/017, FR-C-08/09/10). The order itself is placed by the race-safe
// `createOrder` RPC via POST /api/orders — never decremented client-side; this
// island only builds the request, gates it, and reacts to the result.

export type CheckoutDraft = {
  type: 'delivery' | 'pickup';
  zone_id: string | null;
  address_id: string | null;
};
type OrderLine = { menu_item_id: string; qty: number };
type StatusSeed = { status: ShopStatus; qty_remaining: number };

const DRAFT_KEY = 'fahman.checkout.draft'; // written by task-2-3 CheckoutFlow

// createOrder error code (SDD §5.1) → bilingual message key.
const ERR_KEY: Record<string, keyof Dictionary> = {
  shop_not_open: 'err_shop_not_open',
  past_cutoff: 'err_past_cutoff',
  sold_out_or_insufficient: 'err_sold_out',
  delivery_requires_zone_address: 'err_delivery_requires_address',
  item_unavailable: 'err_item_unavailable',
  empty_cart: 'empty_cart',
};

type CoreProps = {
  items: OrderLine[];
  draft: CheckoutDraft;
  initialStatus: StatusSeed;
  cutoffTime: string | null;
  lang: 'en' | 'ar';
  initialMethod?: PaymentMethod;
  onPlaced: (orderId: string) => void;
};

/**
 * The presentational + logic core — fully prop-driven so it is unit-testable and
 * reusable. `CheckoutPayment` below wires it to the live cart + draft.
 */
export function PaymentSection({
  items,
  draft,
  initialStatus,
  cutoffTime,
  lang,
  initialMethod = 'cod',
  onPlaced,
}: CoreProps) {
  const t = getDictionary(lang);
  const ar = lang === 'ar';
  const live = useShopStatus(initialStatus) ?? initialStatus;
  const [method, setMethod] = useState<PaymentMethod>(initialMethod);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Ordering gate (US-016 / FR-C-08): Open + before cut-off + not Sold-Out,
  // plus delivery needs a zone+address (mirrors createOrderSchema.refine). Each
  // failure shows one clear bilingual reason and disables Place-order.
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
  const emptyCart = items.length === 0;
  const soldOut = live.status === 'sold_out' || live.qty_remaining <= 0;
  const closed = live.status === 'closed';
  const cutoffPassed = pastCutoff(cutoffTime);
  const needsAddress = draft.type === 'delivery' && (!draft.zone_id || !draft.address_id);

  let blockedReason: string | null = null;
  if (offline) blockedReason = t.offline;
  else if (closed) blockedReason = t.shop_closed_msg;
  else if (soldOut) blockedReason = t.sold_out_msg;
  else if (cutoffPassed) blockedReason = t.err_past_cutoff;
  else if (needsAddress) blockedReason = t.err_delivery_requires_address;

  const needsProof = method === 'duitnow_qr' && !proofUrl;
  const canPlace = blockedReason === null && !needsProof && !submitting;

  async function place() {
    if (!canPlace) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // The route reads this header and injects it into createOrder.
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({
          type: draft.type,
          zone_id: draft.zone_id,
          address_id: draft.address_id,
          payment_method: method,
          proof_url: method === 'duitnow_qr' ? proofUrl : null,
          items,
        }),
      });
      const json: unknown = await res.json();
      const body = json as { ok?: boolean; data?: { order_id?: string }; error?: { code?: string } };
      if (res.ok && body.ok && body.data?.order_id) {
        onPlaced(body.data.order_id);
        return;
      }
      const code = body.error?.code;
      const key = code ? ERR_KEY[code] : undefined;
      setError(key ? t[key] : t.err_order_generic);
    } catch {
      setError(t.err_order_generic);
    } finally {
      setSubmitting(false);
    }
  }

  if (emptyCart) {
    return (
      <EmptyState
        title={t.empty_cart}
        hint={ar ? 'أضف أصنافاً من القائمة لتطلب.' : 'Add items from the menu to order.'}
        icon="🛒"
      />
    );
  }

  return (
    <section className="space-y-4" aria-label={t.payment}>
      <div className="flex items-center justify-between">
        <h2 className="text-h2 font-bold text-slate">{t.payment}</h2>
        <StatusBadge status={live.status} lang={lang} />
      </div>

      {/* Method picker (US-017 / FR-C-09). */}
      <fieldset className="space-y-2">
        <legend className="mb-1 font-semibold text-slate">{t.payment_method}</legend>
        <MethodOption id="cod" current={method} onSelect={setMethod} title={t.cod} note={t.cod_note} />
        <MethodOption id="duitnow_qr" current={method} onSelect={setMethod} title={t.duitnow} note={t.duitnow_note} />
      </fieldset>

      {/* DuitNow QR — show the static QR + require a proof image before placing. */}
      {method === 'duitnow_qr' ? (
        <div className="card space-y-3">
          <div
            className="mx-auto h-44 w-44 rounded-control border border-line bg-white bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/duitnow-qr.png)' }}
            role="img"
            aria-label={t.scan_to_pay}
          />
          <p className="text-center text-sm font-semibold text-slate">{t.scan_to_pay}</p>
          <ProofUpload lang={lang} value={proofUrl} onChange={setProofUrl} />
          {needsProof ? (
            <p className="text-sm text-muted" role="status">
              {t.proof_required}
            </p>
          ) : null}
        </div>
      ) : null}

      {/* Ordering-gate reason (closed / sold-out / past cut-off / needs address / offline). */}
      {blockedReason ? (
        <p className="rounded-card border border-line bg-cream p-3 text-sm font-semibold text-soldout" role="status">
          {blockedReason}
        </p>
      ) : null}

      {/* Rejected-placement error. */}
      {error ? <ErrorState message={error} onRetry={() => setError(null)} /> : null}

      <button
        type="button"
        className="btn-primary w-full"
        disabled={!canPlace}
        data-can-place={canPlace ? 'yes' : 'no'}
        aria-busy={submitting}
        onClick={place}
      >
        {submitting ? t.placing_order : t.place_order}
      </button>
    </section>
  );
}

function MethodOption({
  id,
  current,
  onSelect,
  title,
  note,
}: {
  id: PaymentMethod;
  current: PaymentMethod;
  onSelect: (m: PaymentMethod) => void;
  title: string;
  note: string;
}) {
  const active = current === id;
  return (
    <label
      className={`flex min-h-tap cursor-pointer items-start gap-3 rounded-card border p-3 ${
        active ? 'border-rust bg-rust-soft' : 'border-line bg-white'
      }`}
    >
      <input
        type="radio"
        name="payment_method"
        value={id}
        checked={active}
        onChange={() => onSelect(id)}
        className="mt-1 h-5 w-5 accent-rust"
      />
      <span className="min-w-0">
        <span className="block font-semibold text-slate">{title}</span>
        <span className="block text-sm text-muted">{note}</span>
      </span>
    </label>
  );
}

/**
 * Page wrapper — sources the cart lines + the task-2-3 fulfilment draft, then
 * renders the core. Clears the cart and routes to /orders/[id] on success.
 */
export function CheckoutPayment({
  initialStatus,
  cutoffTime,
  lang,
}: {
  initialStatus: StatusSeed;
  cutoffTime: string | null;
  lang: 'en' | 'ar';
}) {
  const t = getDictionary(lang);
  const router = useRouter();
  const cart = useCart();
  const [draft, setDraft] = useState<CheckoutDraft>({ type: 'delivery', zone_id: null, address_id: null });

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as Partial<CheckoutDraft>;
        if (d.type === 'delivery' || d.type === 'pickup') {
          setDraft({ type: d.type, zone_id: d.zone_id ?? null, address_id: d.address_id ?? null });
        }
      }
    } catch {
      // No readable draft — the gate will ask for the missing selections.
    }
  }, []);

  // The cart streams in post-mount (SSR-safe); show loading until it hydrates.
  if (!cart.hydrated) return <Loading label={t.loading} />;

  const items = cart.lines.map((l) => ({ menu_item_id: l.menu_item_id, qty: l.qty }));

  return (
    <PaymentSection
      items={items}
      draft={draft}
      initialStatus={initialStatus}
      cutoffTime={cutoffTime}
      lang={lang}
      onPlaced={(id) => {
        cart.clear();
        router.push(`/orders/${id}`);
      }}
    />
  );
}
