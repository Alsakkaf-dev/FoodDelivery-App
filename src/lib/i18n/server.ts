import { cookies } from 'next/headers';
import { DEFAULT_LOCALE, isLocale, type Locale } from './config';
import { getDictionary } from './dictionaries';

/** Current locale from the NEXT_LOCALE cookie (server components). */
export function getLocale(): Locale {
  const v = cookies().get('NEXT_LOCALE')?.value;
  return isLocale(v) ? v : DEFAULT_LOCALE;
}

/** Convenience: locale + its dictionary for a server component. */
export function getI18n() {
  const locale = getLocale();
  return { locale, t: getDictionary(locale) };
}
