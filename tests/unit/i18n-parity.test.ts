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

