'use client';
import { Stepper, IconButton } from '@/components/ui';
import { FoodImage } from '@/components/ui/food-image';
import { formatMYR } from '@/lib/utils/money';
import type { CartLine as CartLineModel } from '@/lib/cart/store';
import type { Dictionary } from '@/lib/i18n/dictionaries';

// One editable cart row on the immersive dark surface (US-013): a branded
// thumbnail (the cart line is a price-snapshot with no photo, so FoodImage shows
// its plate fallback), the bilingual name (2-line wrap), the unit price + live
// line subtotal, the dark quantity stepper, and — only in edit mode — a red
// circular × remove. All controls are >=44px (EP-13).
//
// The stepper emits an ABSOLUTE qty; the parent maps the +/- delta onto the
// store's increment/decrement actions (no separate "set" action). That contract
// is preserved here untouched — this component never talks to the store.
