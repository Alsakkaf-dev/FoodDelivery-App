export const LOCALES = ['en', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale =
  (process.env.NEXT_PUBLIC_DEFAULT_LOCALE as Locale) || 'en';

/** Text direction for a locale (Arabic is RTL — FR-C-14, NFR-L). */
export function dir(locale: Locale): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export function isLocale(value: string | undefined): value is Locale {
  return value === 'en' || value === 'ar';
}
