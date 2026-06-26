'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from '@/lib/cart/store';
import { CartLine } from '@/components/customer/cart-line';
import { CartSummary } from '@/components/customer/cart-summary';
import { IconButton, TextAction, EmptyState, ErrorState, Loading } from '@/components/ui';
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

// SCR-C-04 — cart (US-013 / FR-C-05). The immersive dark surface (Cart screens):
// dark product rows over a white order-summary sheet. The four UI states are
// preserved — loading (hydration), error (corrupt storage), empty, populated —
// with the dark surface reserved for a cart that actually has items (the
// light-themed Loading/Empty/Error read with proper contrast on the shell).
// The single OfflineBanner now comes from the customer layout (the page used to
// render a duplicate); this resolves the double-banner.
export default function CartPage() {
  const locale = useLocale();
  const t = getDictionary(locale);
  const router = useRouter();
  const { lines, itemCount, total, hydrated, error, increment, decrement, remove, clear } =
    useCart();
  const [editing, setEditing] = useState(false);

  // Leaving the populated state (last line removed via × / cleared) must drop
  // edit mode, so re-entering a cart later doesn't resurrect a stale DONE header.
  useEffect(() => {
    if (lines.length === 0 && editing) setEditing(false);
  }, [lines.length, editing]);

  if (!hydrated) {
    return (
      <>
        <h1 className="text-h1 font-bold text-ink">{t.cart}</h1>
        <Loading label={t.loading} />
      </>
    );
  }

  if (error) {
    return (
      <>
        <h1 className="text-h1 font-bold text-ink">{t.cart}</h1>
        <ErrorState message={t.error_generic} onRetry={clear} />
      </>
    );
  }

  if (lines.length === 0) {
    return (
      <>
        <h1 className="text-h1 font-bold text-ink">{t.cart}</h1>
        <EmptyState title={t.empty_cart} hint={t.browse_menu} />
        <Link href="/menu" className="btn-primary block text-center">
          {t.browse_menu}
        </Link>
      </>
    );
  }

  // Populated → immersive dark surface. Full-width breakout from the shell's p-4
  // (the customer layout is owned by #04 and is not edited here).
  return (
    <div className="-mx-4 -mt-4 flex min-h-dvh flex-col bg-bg-dark px-4 pt-4">
      <header className="flex items-center justify-between gap-3 pb-2">
        <IconButton variant="dark" icon="chevron-left" aria-label={t.back} onClick={() => router.back()} />
        <h1 className="text-headerTitle font-semibold text-onColor">
          {t.cart}
          <span className="ms-2 text-caption font-normal text-muted">
            {translate(t, 'cart_count', { n: String(itemCount) })}
          </span>
        </h1>
        <TextAction
          tone={editing ? 'success' : 'brand'}
          onClick={() => setEditing((v) => !v)}
          aria-pressed={editing}
        >
          {editing ? t.done : t.edit_items}
        </TextAction>
      </header>

      <div className="flex-1">
        {lines.map((line) => (
          <CartLine
            key={line.menu_item_id}
            line={line}
            lang={locale}
            t={t}
            editing={editing}
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

      <CartSummary total={total} lines={lines} lang={locale} t={t} />
    </div>
  );
}
