'use client';
import { useState } from 'react';
import type { Address, OrderType, Zone } from '@/types/db';
import { deliveryReady } from '@/lib/utils/schemas';
import { ZonePicker } from './zone-picker';
import { AddressForm } from './address-form';

// Where step 1 hands the chosen fulfilment type / zone / address to task-2-4
// (payment + place order). Kept in sessionStorage so the payment step can read
// it without a server round-trip.
const DRAFT_KEY = 'fahman.checkout.draft';

// SCR-C-05 step 1 — the interactive checkout island (US-014 / FR-C-06 +
// US-015 / FR-C-07). Holds the draft (type, zone_id, address_id); delivery-only
// fields render only for Delivery; "Continue to payment" stays blocked until the
// gate (active zone + address for delivery; nothing for pickup) is satisfied.
export function CheckoutFlow({
  zones,
  addresses,
  lang,
}: {
  zones: Zone[];
  addresses: Address[];
  lang: 'en' | 'ar';
}) {
  const ar = lang === 'ar';
  const [type, setType] = useState<OrderType>('delivery');
  const [zoneId, setZoneId] = useState<string | null>(null);
  const [addressId, setAddressId] = useState<string | null>(null);

  const ready = deliveryReady(type, zoneId, addressId);

  function continueToPayment() {
    if (!ready) return;
    try {
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          type,
          zone_id: type === 'delivery' ? zoneId : null,
          address_id: type === 'delivery' ? addressId : null,
        }),
      );
    } catch {
      // sessionStorage unavailable — the payment step re-collects the selections.
    }
    window.location.assign('/checkout/payment');
  }

  function segClass(active: boolean) {
    return `min-h-tap flex-1 rounded-[6px] px-3 py-2 text-center font-semibold transition ${
      active ? 'bg-white text-rust shadow-sm' : 'text-muted'
    }`;
  }

  return (
    <div className="space-y-5">
      {/* Fulfilment-type toggle (US-014 / FR-C-06) — chosen type drives the order. */}
      <div>
        <p className="mb-2 font-semibold text-slate">{ar ? 'كيف تريد استلام طلبك؟' : 'How would you like your order?'}</p>
        <div className="flex w-full rounded-control border border-line bg-cream p-1" role="tablist" aria-label={ar ? 'نوع الطلب' : 'Fulfilment type'}>
          <button type="button" role="tab" aria-selected={type === 'delivery'} onClick={() => setType('delivery')} className={segClass(type === 'delivery')}>
            {ar ? 'توصيل' : 'Delivery'}
          </button>
          <button type="button" role="tab" aria-selected={type === 'pickup'} onClick={() => setType('pickup')} className={segClass(type === 'pickup')}>
            {ar ? 'استلام من المحل' : 'Walk-in / Pickup'}
          </button>
        </div>
      </div>

      {/* Delivery-only fields appear only for Delivery. */}
      {type === 'delivery' ? (
        <div className="space-y-5">
          <ZonePicker zones={zones} value={zoneId} onChange={setZoneId} lang={lang} />
          {zones.length > 0 ? (
            <AddressForm addresses={addresses} zoneId={zoneId} value={addressId} onChange={setAddressId} lang={lang} />
          ) : null}
        </div>
      ) : (
        <p className="rounded-card border border-line bg-cream p-3 text-sm text-muted">
          {ar ? 'استلم طلبك من المحل خلال فترة العمل ١–٧ مساءً.' : 'Collect your order at the shop during trading hours, 1–7 PM.'}
        </p>
      )}

      {/* Gate prompt — clear, bilingual, blocks delivery without zone + address. */}
      {!ready ? (
        <p className="text-sm text-muted" role="status">
          {ar ? 'اختر منطقة مفعّلة وأضف عنوان توصيل للمتابعة.' : 'Choose an active zone and add a delivery address to continue.'}
        </p>
      ) : null}

      <button type="button" className="btn-primary w-full" disabled={!ready} onClick={continueToPayment}>
        {ar ? 'المتابعة إلى الدفع' : 'Continue to payment'}
      </button>
    </div>
  );
}
