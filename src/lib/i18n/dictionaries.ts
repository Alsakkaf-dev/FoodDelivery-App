import type { Locale } from './config';
import en from '../../../messages/en.json';
import ar from '../../../messages/ar.json';

export type Dictionary = typeof en;
const dictionaries: Record<Locale, Dictionary> = { en, ar: ar as Dictionary };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}

/** Tiny translate helper with {{var}} interpolation. */
export function translate(dict: Dictionary, key: keyof Dictionary, vars?: Record<string, string>): string {
  let s = (dict[key] as unknown as string) ?? (key as string);
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{{${k}}}`, v);
  return s;
}
