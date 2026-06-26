import Link from 'next/link';
import { getStatus } from '@/lib/domain/session';
import { getLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { Icon } from '@/components/icons';
import { CheckoutPayment } from '@/components/customer/payment-section';

// SCR-C-05 part 2 — Payment + ordering gate + place order (US-016/017, FR-C-08/09/10).
// Server Component: seeds the live shop status + cut-off for the gate, then hands
// off to the client island (which sources the cart + the step-1 draft). Reached
// from /checkout (task-2-3) and guarded by middleware (auth required to order).
// The (customer) layout owns the shell + OfflineBanner; loading.tsx owns loading.
export const dynamic = 'force-dynamic';

export default async function CheckoutPaymentPage() {
  const locale = getLocale();
  const t = getDictionary(locale);
  const res = await getStatus();
  const s = res.ok
    ? res.data
    : { status: 'closed' as const, qty_remaining: 0, qty_total: 0, delivery_window: null, cutoff_time: null };

  return (
    <>
      <header className="mb-6 flex items-center gap-3">
        <Link
          href="/checkout"
          aria-label={t.back}
          className="inline-flex min-h-tap min-w-tap items-center justify-center rounded-md bg-surface-alt text-ink transition hover:bg-surface-input active:scale-95"
        >
          <Icon name="chevron-left" className="h-5 w-5" aria-hidden />
        </Link>
        <h1 className="text-headerTitle font-bold text-ink">{t.payment}</h1>
      </header>

      <CheckoutPayment
        initialStatus={{ status: s.status, qty_remaining: s.qty_remaining }}
        cutoffTime={s.cutoff_time}
        lang={locale}
      />
    </>
  );
}
