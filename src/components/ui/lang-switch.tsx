'use client';
import { useTransition } from 'react';
import { type Locale } from '@/lib/i18n/config';

// Native language names. These match the `language` key convention in
// messages/*.json (en.json's "العربية" is the AR target label; ar.json's
// "English" is the EN target label) — keep them in sync.
const NATIVE_NAME: Record<Locale, string> = { en: 'English', ar: 'العربية' };
// Locale-stable English names for the (screen-reader) action label.
const ENGLISH_NAME: Record<Locale, string> = { en: 'English', ar: 'Arabic' };

/**
 * The single NEXT_LOCALE cookie mechanism shared by every language control
 * (`LangToggle` and `LangSwitch`). Persists the choice for a year on path '/'
 * so it survives reopening the app; the caller then reloads so SSR re-renders
 * in the new locale and `layout.tsx` flips `<html lang dir>` (US-012 / FR-C-14).
 * Keep this the ONLY place that writes the cookie — never inline a second copy.
 */
export function setLocaleCookie(next: Locale) {
  document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000`;
}

/**
 * CMP-U — labelled language switcher for headers/menus (US-012). The richer,
 * clearer sibling of `LangToggle`: it names the current language and the one it
 * will switch TO, so the choice is unambiguous. >=44px tap target; flips the
 * whole app LTR<->RTL. Mount it in role shells/headers; `LangToggle` stays the
 * compact chip for tight toolbars. Both write the same cookie via
 * `setLocaleCookie`, so there is one source of truth.
 */
export function LangSwitch({ current, className = '' }: { current: Locale; className?: string }) {
  const [pending, start] = useTransition();
  const next: Locale = current === 'en' ? 'ar' : 'en';

  function switchTo() {
    setLocaleCookie(next);
    start(() => window.location.reload());
  }

  return (
    <button
      type="button"
      onClick={switchTo}
      disabled={pending}
      // Stable English label so the action is announced regardless of UI language.
      aria-label={`Switch language to ${ENGLISH_NAME[next]}`}
      className={`inline-flex min-h-tap min-w-tap items-center justify-center gap-2 rounded-control border border-line px-3 text-sm font-semibold text-slate disabled:opacity-50 ${className}`}
    >
      <span aria-hidden>🌐</span>
      <span className="inline-flex items-center gap-1.5">
        <span className="text-muted" lang={current} dir={current === 'ar' ? 'rtl' : 'ltr'}>
          {NATIVE_NAME[current]}
        </span>
        <span aria-hidden className="text-muted">→</span>
        <span lang={next} dir={next === 'ar' ? 'rtl' : 'ltr'}>{NATIVE_NAME[next]}</span>
      </span>
    </button>
  );
}
