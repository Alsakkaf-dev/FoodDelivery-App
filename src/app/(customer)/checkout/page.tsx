import Link from 'next/link';
import { listZones } from '@/lib/domain/zones';
import { listAddresses } from '@/lib/domain/addresses';
import { getLocale } from '@/lib/i18n/server';
import { ErrorState } from '@/components/ui/states';
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
  const ar = locale === 'ar';

  const zonesRes = await listZones(true);
  // Saved addresses are best-effort (requires a session); fall back to none.
  const addrRes = await listAddresses();
  const addresses: Address[] = addrRes.ok ? addrRes.data : [];

  return (
    <>
      <header className="flex items-center justify-between gap-2">
        <Link href="/cart" className="inline-block text-sm text-muted">
          {ar ? '→ السلة' : '← Cart'}
        </Link>
        <h1 className="text-2xl font-bold text-slate">{ar ? 'إتمام الطلب' : 'Checkout'}</h1>
      </header>

      {zonesRes.ok ? (
        <CheckoutFlow zones={zonesRes.data} addresses={addresses} lang={locale} />
      ) : (
        <ErrorState message={ar ? 'حدث خطأ ما. حاول مرة أخرى.' : 'Something went wrong. Please try again.'} />
      )}
    </>
  );
}
