'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useShopStatus } from '@/lib/realtime/hooks';
import { useCart } from '@/lib/cart/store';
import { pastCutoff } from '@/lib/utils/time';
import { formatMYR } from '@/lib/utils/money';
import { getDictionary, type Dictionary } from '@/lib/i18n/dictionaries';
import { CreditCardIllustration, SuccessWallet } from '@/components/brand';
import { IconChip, OutlineButton, PrimaryButton, SelectTile, SuccessScreen } from '@/components/ui';
import { StatusBadge } from '@/components/ui/status';
import { EmptyState, ErrorState, Loading } from '@/components/ui/states';
import { ProofUpload } from './proof-upload';
import { AddCard, type SavedCard } from './add-card';
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

// UI-only superset of the FROZEN payment_method enum. Only `cod`/`duitnow_qr` are
// real, orderable methods (the /api/orders contract accepts only those two);
// `card`/`paypal` are visual tiles that gate the order — they never reach the API.
type UiMethod = PaymentMethod | 'card' | 'paypal';

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
  itemTotal?: number;
  initialMethod?: UiMethod;
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
  itemTotal,
  initialMethod = 'cod',
  onPlaced,
}: CoreProps) {
  const t = getDictionary(lang);
  const live = useShopStatus(initialStatus) ?? initialStatus;
  const [method, setMethod] = useState<UiMethod>(initialMethod);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [savedCard, setSavedCard] = useState<SavedCard | null>(null);
  const [cardOpen, setCardOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The real method actually sent to /api/orders — only ever cod | duitnow_qr.
  const apiMethod: PaymentMethod | null = method === 'cod' || method === 'duitnow_qr' ? method : null;
  const cardSelected = method === 'card' || method === 'paypal';

  // ── Ordering gate (US-016 / FR-C-08): Open + before cut-off + not Sold-Out,
  // plus delivery needs a zone+address (mirrors createOrderSchema.refine). Each
  // failure shows one clear bilingual reason and disables Place-order. Card/PayPal
  // tiles add an additive "coming soon" reason (no broken order is ever submitted).
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
  else if (cardSelected) blockedReason = t.card_coming_soon;

  const needsProof = method === 'duitnow_qr' && !proofUrl;
  const canPlace = blockedReason === null && !needsProof && !submitting;

  async function place() {
    if (!canPlace || !apiMethod) return;
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
          payment_method: apiMethod,
          proof_url: apiMethod === 'duitnow_qr' ? proofUrl : null,
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
    return <EmptyState title={t.empty_cart} hint={t.empty_cart_hint} />;
  }

  const methods: Array<{ id: UiMethod; title: string; subtitle?: string; leading: ReactNode }> = [
    { id: 'cod', title: t.cod, subtitle: t.cod_note, leading: <IconChip icon="wallet" tone="success" /> },
    { id: 'duitnow_qr', title: t.duitnow, subtitle: t.duitnow_note, leading: <DuitNowMark /> },
    { id: 'card', title: t.pay_card, subtitle: t.no_card_hint, leading: <IconChip icon="credit-card" tone="info.blue" /> },
    { id: 'paypal', title: t.pay_paypal, subtitle: t.card_coming_soon, leading: <IconChip icon="credit-card" tone="info.purple" /> },
  ];

  return (
    <section className="space-y-5" aria-label={t.payment}>
      <div className="flex items-center justify-between">
        <h2 className="text-h2 font-bold text-ink">{t.payment_method}</h2>
        <StatusBadge status={live.status} lang={lang} />
      </div>

      {/* Method picker (US-017 / FR-C-09). */}
      <div className="space-y-2" role="radiogroup" aria-label={t.payment_method}>
        {methods.map((m) => (
          <SelectTile
            key={m.id}
            selected={method === m.id}
            onSelect={() => setMethod(m.id)}
            title={m.title}
            subtitle={m.subtitle}
            leading={m.leading}
          />
        ))}
      </div>

      {/* DuitNow QR — show the static QR + require a proof image before placing. */}
      {method === 'duitnow_qr' ? (
        <div className="space-y-3 rounded-lg border border-line bg-surface p-4 shadow-card">
          <div
            className="mx-auto h-44 w-44 rounded-md border border-line bg-white bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/duitnow-qr.png)' }}
            role="img"
            aria-label={t.scan_to_pay}
          />
          <p className="text-center text-sm font-semibold text-ink">{t.scan_to_pay}</p>
          <ProofUpload lang={lang} value={proofUrl} onChange={setProofUrl} />
          {needsProof ? (
            <p className="text-sm text-muted" role="status">
              {t.proof_required}
            </p>
          ) : null}
        </div>
      ) : null}

      {/* Card — front-end-only saved-card / empty + Add-Card modal (no real order). */}
      {method === 'card' ? (
        <div className="space-y-3 rounded-lg border border-line bg-surface p-4 shadow-card">
          {savedCard ? (
            <div className="flex items-center gap-3 rounded-md bg-surface-input p-3">
              <IconChip icon="credit-card" tone="info.blue" />
              <span className="flex-1 font-semibold text-ink" dir="ltr">
                •••• {savedCard.last4}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-2 text-center">
              <CreditCardIllustration className="h-20" />
              <p className="text-title font-bold text-ink">{t.no_card_added}</p>
              <p className="text-caption text-muted">{t.no_card_hint}</p>
            </div>
          )}
          <OutlineButton dashed fullWidth leadingIcon="plus" onClick={() => setCardOpen(true)}>
            {t.add_new}
          </OutlineButton>
        </div>
      ) : null}

      {/* Ordering-gate reason (closed / sold-out / cut-off / address / offline / card). */}
      {blockedReason ? (
        <p className="rounded-md border border-line bg-surface-alt p-3 text-sm font-semibold text-warning" role="status">
          {blockedReason}
        </p>
      ) : null}

      {/* Rejected-placement error. */}
      {error ? <ErrorState message={error} onRetry={() => setError(null)} /> : null}

      {/* Total + place. */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-label font-semibold uppercase tracking-wide text-muted">{t.total_label}</span>
        <span className="text-display font-extrabold text-ink" dir="ltr">
          {formatMYR(itemTotal ?? 0, lang)}
        </span>
      </div>

      <PrimaryButton
        fullWidth
        disabled={!canPlace}
        data-can-place={canPlace ? 'yes' : 'no'}
        aria-busy={submitting}
        onClick={place}
      >
        {submitting ? t.placing_order : t.pay_and_confirm}
      </PrimaryButton>

      <AddCard
        lang={lang}
        open={cardOpen}
        onClose={() => setCardOpen(false)}
        onSaved={(card) => {
          setSavedCard(card);
          setCardOpen(false);
        }}
      />
    </section>
  );
}

/** Small DuitNow tile glyph — reuses the static QR asset (no extra icon dep). */
function DuitNowMark() {
  return (
    <span
      className="inline-flex h-10 w-10 shrink-0 rounded-full bg-white bg-contain bg-center bg-no-repeat ring-1 ring-line"
      style={{ backgroundImage: 'url(/duitnow-qr.png)' }}
      aria-hidden
    />
  );
}

/**
 * Page wrapper — sources the cart lines + the task-2-3 fulfilment draft, then
 * renders the core. On success it clears the cart and shows the Payment-Successful
 * STATE; TRACK ORDER then routes to /orders/[id] (the existing #12 handshake).
 */
