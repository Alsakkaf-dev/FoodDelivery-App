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

describe('PaymentSection: payment method + place gate (US-016/017)', () => {
  it('COD places without a proof upload (open shop)', () => {
    const html = render({ initialMethod: 'cod' });
    expect(html).toContain(en.cod);
    expect(canPlace(html)).toBe(true);
    expect(html).not.toContain(en.proof_required);
    expect(html).toContain(en.place_order);
  });

  it('DuitNow QR blocks placing until a proof image is attached', () => {
    const html = render({ initialMethod: 'duitnow_qr' });
    expect(html).toContain(en.duitnow);
    expect(html).toContain(en.scan_to_pay);
    expect(html).toContain(en.upload_proof); // the picker is shown
    expect(html).toContain(en.proof_required); // and the blocking hint
    expect(canPlace(html)).toBe(false);
  });

  it('blocks ordering when the shop is Closed, with a clear reason', () => {
    const html = render({ initialStatus: { status: 'closed', qty_remaining: 5 } });
    expect(html).toContain(en.shop_closed_msg);
    expect(canPlace(html)).toBe(false);
  });

  it('blocks ordering when Sold-Out (status or zero remaining)', () => {
    const byStatus = render({ initialStatus: { status: 'sold_out', qty_remaining: 0 } });
    expect(byStatus).toContain(en.sold_out_msg);
    expect(canPlace(byStatus)).toBe(false);

    const byQty = render({ initialStatus: { status: 'open', qty_remaining: 0 } });
    expect(byQty).toContain(en.sold_out_msg);
    expect(canPlace(byQty)).toBe(false);
  });

  it('blocks past the cut-off time', () => {
    // 00:00 is in the past for every minute of the MYT day except midnight itself.
    const html = render({ cutoffTime: '00:00' });
    expect(html).toContain(en.err_past_cutoff);
    expect(canPlace(html)).toBe(false);
  });

  it('blocks a delivery order missing its zone/address', () => {
    const html = render({ draft: { type: 'delivery', zone_id: null, address_id: null } });
    expect(html).toContain(en.err_delivery_requires_address);
    expect(canPlace(html)).toBe(false);
  });

  it('shows the empty-cart state when there are no items', () => {
    const html = render({ items: [] });
    expect(html).toContain(en.empty_cart);
  });

  it('renders bilingual (Arabic place-order label)', () => {
    const html = render({ lang: 'ar', initialMethod: 'cod' });
    expect(html).toContain(ar.place_order);
    expect(html).toContain(ar.cod);
  });
});
