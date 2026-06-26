'use client';
import { useState } from 'react';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import { formatMYR } from '@/lib/utils/money';
import {
  Card,
  EmptyState,
  FilledInput,
  IconChip,
  PrimaryButton,
  SuccessScreen,
} from '@/components/ui';

// SCR-O — Operator Wallet / Withdraw (new screen; design "Payment Withdraw
// Successful"). HONEST FRONT-END-ONLY PREVIEW: the app has no payout/wallet
// backend (the frozen domain layer is session/menu/orders/zones/addresses/
// notify/rider only) and feature engineers may not add API/domain code. So the
// balance is sourced from the read-only `endOfDay()` revenue (today's earnings,
// passed from the server page) and the withdraw action does NOT move money — it
// shows the success state and is clearly labelled a preview via
// `t.payouts_preview_note`. No fake API, no fabricated transaction history.
//
// Composes shared #02 primitives (Card / FilledInput / PrimaryButton /
// SuccessScreen / IconChip / EmptyState) + #01 tokens; copy via the dictionary
// (#03); RTL-safe via logical props; light theme only.
export function WalletView({
  balance,
  t,
  lang,
}: {
  balance: number;
  t: Dictionary;
  lang: Locale;
}) {
  const [amount, setAmount] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const n = Number(amount);
  const valid = amount.trim() !== '' && Number.isFinite(n) && n > 0 && n <= balance;

  function submit() {
    if (Number.isFinite(n) && n > balance) {
      setError(t.insufficient_balance);
      return;
    }
    if (!valid) return;
    setError(null);
    setDone(true); // front-end-only preview — no payout backend
  }

  if (done) {
    return (
      <SuccessScreen
        tier="lite"
        title={t.withdraw_successful}
        subtitle={t.payouts_preview_note}
        action={
          <PrimaryButton
            fullWidth
            onClick={() => {
              setDone(false);
              setAmount('');
            }}
          >
            {t.ok}
          </PrimaryButton>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Available-balance hero */}
      <Card className="bg-hero-gradient text-onColor">
        <div className="flex items-center justify-between">
          <span className="text-label font-semibold uppercase tracking-wide text-onColor/80">
            {t.available_balance}
          </span>
          <IconChip icon="wallet" tone="brand" />
        </div>
        <p className="mt-2 text-display font-extrabold tabular-nums">{formatMYR(balance, lang)}</p>
        <p className="mt-1 text-caption text-onColor/80">{t.todays_earnings}</p>
      </Card>

      {/* Withdraw form (preview) */}
      <form
        className="card space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <h2 className="text-h2 font-bold text-ink">{t.withdraw}</h2>
        <FilledInput
          label={t.withdraw_amount}
          type="number"
          inputMode="decimal"
          min={0}
          step="0.5"
          placeholder={t.amount}
          className="tabular-nums"
          value={amount}
          error={error ?? undefined}
          onChange={(e) => {
            setError(null);
            setAmount(e.target.value);
          }}
        />
        <p className="text-caption text-muted">{t.payouts_preview_note}</p>
        <PrimaryButton type="submit" fullWidth disabled={!valid}>
          {t.withdraw}
        </PrimaryButton>
      </form>

      {/* Transactions — honest empty state (no real payout history) */}
      <section className="space-y-3">
        <h2 className="text-h2 font-bold text-ink">{t.transactions}</h2>
        <EmptyState title={t.no_transactions} />
      </section>
    </div>
  );
}
