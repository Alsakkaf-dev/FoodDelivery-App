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
