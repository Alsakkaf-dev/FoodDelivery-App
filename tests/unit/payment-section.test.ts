import { describe, it, expect, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { PaymentSection, type CheckoutDraft } from '@/components/customer/payment-section';
import en from '../../messages/en.json';
import ar from '../../messages/ar.json';

// PaymentSection reaches the cart store / router only through the CheckoutPayment
// wrapper, but the module imports next/navigation at top level — stub it so the
// module loads under vitest's node env. We render the prop-driven core directly.
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: () => {} }) }));

const pickup: CheckoutDraft = { type: 'pickup', zone_id: null, address_id: null };
const items = [{ menu_item_id: '11111111-1111-1111-1111-111111111111', qty: 2 }];

// renderToStaticMarkup runs a single pass: useShopStatus returns its seed and no
// effects/clicks fire, so the gate + method props fully decide the markup.
function render(props: Partial<Parameters<typeof PaymentSection>[0]> = {}) {
  return renderToStaticMarkup(
    createElement(PaymentSection, {
      items,
      draft: pickup,
      initialStatus: { status: 'open', qty_remaining: 5 },
      cutoffTime: null,
      lang: 'en',
      onPlaced: () => {},
      ...props,
    }),
  );
}

// Marks whether Place-order is enabled without depending on disabled-attr position.
const canPlace = (html: string) => /data-can-place="yes"/.test(html);

// renderToStaticMarkup HTML-escapes text, so a label with `&` ("Pay & confirm")
// appears as "Pay &amp; confirm" — compare against the escaped form.
const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

