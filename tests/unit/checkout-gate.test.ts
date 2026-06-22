import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { deliveryReady } from '@/lib/utils/schemas';
import { ZonePicker } from '@/components/customer/zone-picker';
import type { Zone } from '@/types/db';

// SCR-C-05 step 1 — the fulfilment gate + active-zone picker (US-014 / US-015).
const html = (el: ReturnType<typeof createElement>): string => renderToStaticMarkup(el);
const zone = (id: string, name: string): Zone => ({ id, name, active: true, sort_order: 0 });

describe('deliveryReady — fulfilment + zone + address gate (mirrors createOrderSchema.refine)', () => {
  it('pickup is always ready — no zone or address required (US-014)', () => {
    expect(deliveryReady('pickup', null, null)).toBe(true);
    expect(deliveryReady('pickup', 'z1', 'a1')).toBe(true);
  });

  it('delivery is blocked until BOTH an active zone and an address are chosen (US-015)', () => {
    expect(deliveryReady('delivery', null, null)).toBe(false);
    expect(deliveryReady('delivery', 'z1', null)).toBe(false);
    expect(deliveryReady('delivery', null, 'a1')).toBe(false);
    expect(deliveryReady('delivery', 'z1', 'a1')).toBe(true);
  });
});

describe('ZonePicker — active-zone selector (FR-C-07)', () => {
  const zones = [zone('z1', 'Pulai Spring'), zone('z2', 'Taman Universiti')];

  it('lists each active zone as a selectable, ≥44px radio', () => {
    const out = html(createElement(ZonePicker, { zones, value: null, onChange: () => undefined, lang: 'en' }));
    expect(out).toContain('Pulai Spring');
    expect(out).toContain('Taman Universiti');
    expect(out).toContain('role="radio"');
    expect(out).toContain('min-h-tap');
  });

  it('marks the selected zone with aria-checked', () => {
    const out = html(createElement(ZonePicker, { zones, value: 'z1', onChange: () => undefined, lang: 'en' }));
    expect(out).toContain('aria-checked="true"');
  });

  it('shows a bilingual empty/closed state when no zones are active', () => {
    const en = html(createElement(ZonePicker, { zones: [], value: null, onChange: () => undefined, lang: 'en' }));
    expect(en).toContain('Delivery is closed right now');
    const ar = html(createElement(ZonePicker, { zones: [], value: null, onChange: () => undefined, lang: 'ar' }));
    expect(ar).toContain('التوصيل مغلق');
  });
});
