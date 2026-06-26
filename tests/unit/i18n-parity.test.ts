import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import en from '../../messages/en.json';
import ar from '../../messages/ar.json';
import { LangSwitch, setLocaleCookie } from '@/components/ui/lang-switch';

// US-012 / FR-C-14 — bilingual parity guard. The two catalogs must stay an exact
// key-for-key mirror (AR translated, not copied) so no string ships in only one
// language. This locks the invariant for every future task that adds keys.

type Catalog = Record<string, string>;
const EN = en as Catalog;
const AR = ar as Catalog;

// Proper nouns / product names that are intentionally identical across locales.
// `pay_paypal` = "PayPal" (brand name kept in Latin in AR too, like `duitnow`) — added
// in lockstep with #03's checkout/payment keys (FOUNDATION_CONTRACTS §4).
const SHARED_VALUES = new Set(['duitnow', 'pay_paypal']);

const enKeys = Object.keys(EN).sort();
const arKeys = Object.keys(AR).sort();
const tokens = (s: string) => (s.match(/\{\{(\w+)\}\}/g) ?? []).sort();

describe('i18n parity: en.json <-> ar.json key sets are identical', () => {
  it('AR has exactly the EN key set (no missing, no stray keys)', () => {
    expect(arKeys).toEqual(enKeys);
  });

  it('has a non-empty string value for every key in both languages', () => {
    for (const k of enKeys) {
      expect(typeof EN[k]).toBe('string');
      expect((EN[k] ?? '').trim().length).toBeGreaterThan(0);
      expect(typeof AR[k]).toBe('string');
      expect((AR[k] ?? '').trim().length).toBeGreaterThan(0);
    }
  });

  it('translates AR values rather than copying EN (except shared product names)', () => {
    for (const k of enKeys) {
      if (SHARED_VALUES.has(k)) continue;
      expect(AR[k], `key "${k}" should be translated to Arabic, not copied from EN`).not.toBe(EN[k]);
    }
  });

  it('keeps the same {{var}} interpolation tokens in both languages', () => {
    for (const k of enKeys) {
      expect(tokens(AR[k] ?? ''), `key "${k}" interpolation tokens must match`).toEqual(tokens(EN[k] ?? ''));
    }
  });
});

describe('LangSwitch: accessible >=44px switcher with current-vs-target labels', () => {
  const render = (current: 'en' | 'ar') => renderToStaticMarkup(createElement(LangSwitch, { current }));

  it('names both the current and the target language (en -> العربية, ar -> English)', () => {
    const fromEn = render('en');
    expect(fromEn).toContain('English'); // current
    expect(fromEn).toContain('العربية'); // target
    const fromAr = render('ar');
    expect(fromAr).toContain('العربية'); // current
    expect(fromAr).toContain('English'); // target
  });

  it('carries the 44px tap-target utilities (EP-13)', () => {
    expect(render('en')).toContain('min-h-tap');
    expect(render('en')).toContain('min-w-tap');
  });

  it('is a real button with a stable switch-language accessible label', () => {
    const out = render('en');
    expect(out).toContain('type="button"');
    expect(out.toLowerCase()).toContain('switch language');
  });

  it('exposes the shared cookie mechanism (single source of truth)', () => {
    expect(typeof setLocaleCookie).toBe('function');
  });
});
