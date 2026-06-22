'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from '@/lib/cart/store';
import { CartLine } from '@/components/customer/cart-line';
import { EmptyState, ErrorState, Loading, OfflineBanner } from '@/components/ui/states';
import { formatMYR } from '@/lib/utils/money';
import { getDictionary, translate } from '@/lib/i18n/dictionaries';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/i18n/config';

// The cart lives in the client store, so this screen is a client component and
// reads the locale from the NEXT_LOCALE cookie (the server sets <html dir/lang>;
// this only picks the right dictionary). Default locale on the first paint, then
// the real one after mount — same one-frame settle as the cart hydration below.
function useLocale(): Locale {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  useEffect(() => {
    const v = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/)?.[1];
    if (isLocale(v)) setLocale(v);
  }, []);
  return locale;
}

// SCR-C-04 — cart (US-013 / FR-C-05). Lists editable lines with a live item
// count + MYR total and a sticky checkout CTA. Implements the four UI states:
// loading (hydration), error (corrupt storage), empty, and offline.
export default function CartPage() {
  const locale = useLocale();
  const t = getDictionary(locale);
  const { lines, itemCount, total, hydrated, error, increment, decrement, remove, clear } = useCart();

  return (
    <>
      <OfflineBanner label={t.offline} />

      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-rust">{t.cart}</h1>
        {hydrated && lines.length > 0 ? (
          <span className="text-sm text-muted">{translate(t, 'cart_count', { n: String(itemCount) })}</span>
        ) : null}
      </header>

      {!hydrated ? (
        <Loading label={t.loading} />
      ) : error ? (
        <ErrorState message={t.error_generic} onRetry={clear} />
      ) : lines.length === 0 ? (
        <EmptyState title={t.empty_cart} hint={t.browse_menu} icon="🛒" />
      ) : (
        <>
          <div className="space-y-3">
            {lines.map((line) => (
              <CartLine
                key={line.menu_item_id}
                line={line}
                lang={locale}
                t={t}
                onQty={(v) =>
                  v > line.qty
                    ? increment(line.menu_item_id)
                    : v < line.qty
                      ? decrement(line.menu_item_id)
                      : undefined
                }
                onRemove={() => remove(line.menu_item_id)}
              />
            ))}
          </div>

          <div className="sticky bottom-20 z-30 mt-2">
            <div className="card flex items-center justify-between gap-3 shadow-md">
              <div>
                <p className="text-sm text-muted">{t.cart_total}</p>
                <p className="text-xl font-bold text-rust">{formatMYR(total, locale)}</p>
              </div>
              <Link href="/checkout" className="btn-primary">
                {t.checkout}
              </Link>
            </div>
          </div>
        </>
      )}

      {hydrated && lines.length === 0 && !error ? (
        <Link href="/menu" className="btn-secondary block text-center">
          {t.browse_menu}
        </Link>
      ) : null}
    </>
  );
}
