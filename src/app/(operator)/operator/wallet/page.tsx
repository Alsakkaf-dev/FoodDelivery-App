import { getI18n } from '@/lib/i18n/server';
import { endOfDay } from '@/lib/domain/orders';
import { WalletView } from '@/components/operator/wallet/wallet-view';

// SCR-O — Operator Wallet / Withdraw (NEW additive route; design "Payment
// Withdraw Successful"). Server Component: reads today's revenue from the
// read-only `endOfDay()` domain action and hands it to the client wallet view
// as the available balance. There is no payout/wallet backend, so the withdraw
// flow is a clearly-labelled front-end-only PREVIEW (see wallet-view.tsx). The
// (operator) layout owns the header chrome + BottomNav. Reached via direct URL /
// an operator-dashboard quick-link until #04/#15 add a secondary nav entry
// (operatorNav is frozen at 4 slots — request filed in TEAM_STATUS.md).
export const dynamic = 'force-dynamic';

export default async function WalletPage() {
  const { locale, t } = getI18n();
  const res = await endOfDay();
  const balance = res.ok ? res.data.revenue : 0;

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-h1 font-bold text-ink">{t.wallet}</h1>
        <p className="text-body text-muted">{t.payouts_preview_note}</p>
      </header>
      <WalletView balance={balance} t={t} lang={locale} />
    </section>
  );
}
