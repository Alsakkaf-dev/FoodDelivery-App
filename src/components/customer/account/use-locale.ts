'use client';
import { useEffect, useState } from 'react';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/i18n/config';

// Client-side locale reader for the account/notifications/messages client
// components (mirrors the helper inlined in (customer)/cart/page.tsx — the
// blessed pattern). Server components use getI18n() instead. Starts at the
// default locale so SSR + first client paint match (no hydration flip), then
// upgrades to the NEXT_LOCALE cookie once mounted. `dir`/font are already set on
// <html> by the root layout, so this only drives copy + logical-side choices.
export function useLocale(): Locale {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  useEffect(() => {
    const v = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/)?.[1];
    if (isLocale(v)) setLocale(v);
  }, []);
  return locale;
}
