import type { Locale } from './config';
import en from '../../../messages/en.json';
import ar from '../../../messages/ar.json';

export type Dictionary = typeof en;

// Compile-time AR-parity guard (Plan #03). Every English key MUST exist in Arabic with a
// string value, or `tsc --noEmit` fails right here — turning silent dictionary drift into a
// build error. This is the static counterpart to scripts/i18n-parity.mjs (which also checks
// the reverse direction + {{placeholder}} symmetry at runtime/CI). The target type only
// requires string values, so it flags a MISSING Arabic key without forcing AR text to equal
// EN text (robust to JSON literal-type widening). en.json stays the source-of-truth shape.
const _arParity: Record<keyof Dictionary, string> = ar;
void _arParity;

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
