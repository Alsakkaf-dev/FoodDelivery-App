import Link from 'next/link';
import { listZones } from '@/lib/domain/zones';
import { listAddresses } from '@/lib/domain/addresses';
import { getLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { ErrorState } from '@/components/ui/states';
import { Icon } from '@/components/icons';
import { CheckoutFlow } from '@/components/customer/checkout-flow';
import type { Address } from '@/types/db';

// SCR-C-05 — Checkout, part 1: fulfilment type + zone + address (US-014/US-015).
// Server Component: fetches active zones + the customer's saved addresses, then
// hands them to the client island for interaction. Placing the order is task-2-4.
// Auth-gated by middleware. The (customer) layout owns the shell + OfflineBanner
// (offline state) and `loading.tsx` owns the loading state.
export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const locale = getLocale();
  const t = getDictionary(locale);

  const zonesRes = await listZones(true);
  // Saved addresses are best-effort (requires a session); fall back to none.
  const addrRes = await listAddresses();
  const addresses: Address[] = addrRes.ok ? addrRes.data : [];

  return (
    <>
      <header className="mb-6 flex items-center gap-3">
        <Link
          href="/cart"
          aria-label={t.back}
          className="inline-flex min-h-tap min-w-tap items-center justify-center rounded-md bg-surface-alt text-ink transition hover:bg-surface-input active:scale-95"
        >
          <Icon name="chevron-left" className="h-5 w-5" aria-hidden />
        </Link>
        <h1 className="text-headerTitle font-bold text-ink">{t.checkout}</h1>
      </header>

      {zonesRes.ok ? (
        <CheckoutFlow zones={zonesRes.data} addresses={addresses} lang={locale} />
      ) : (
        <ErrorState message={t.error_generic} />
      )}
    </>
  );
}
