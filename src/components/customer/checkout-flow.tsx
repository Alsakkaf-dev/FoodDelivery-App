'use client';
import { useState } from 'react';
import type { Address, OrderType, Zone } from '@/types/db';
import { deliveryReady } from '@/lib/utils/schemas';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { PrimaryButton } from '@/components/ui';
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
  const t = getDictionary(lang);
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
    return `min-h-tap flex-1 rounded-pill px-4 text-button font-bold uppercase tracking-wide transition ${
      active ? 'bg-surface text-brand shadow-card' : 'text-muted'
    }`;
  }

  return (
    <div className="space-y-6">
      {/* Fulfilment-type toggle (US-014 / FR-C-06) — chosen type drives the order. */}
      <div>
        <p className="mb-2 text-title font-bold text-ink">{t.fulfilment_question}</p>
        <div
          className="flex w-full gap-1 rounded-pill border border-line bg-surface-alt p-1"
          role="tablist"
          aria-label={t.fulfilment_question}
        >
          <button type="button" role="tab" aria-selected={type === 'delivery'} onClick={() => setType('delivery')} className={segClass(type === 'delivery')}>
            {t.delivery}
          </button>
          <button type="button" role="tab" aria-selected={type === 'pickup'} onClick={() => setType('pickup')} className={segClass(type === 'pickup')}>
            {t.pickup}
          </button>
        </div>
      </div>

      {/* Delivery-only fields appear only for Delivery. */}
      {type === 'delivery' ? (
        <div className="space-y-6">
          <ZonePicker zones={zones} value={zoneId} onChange={setZoneId} lang={lang} />
          {zones.length > 0 ? (
            <AddressForm addresses={addresses} zoneId={zoneId} value={addressId} onChange={setAddressId} lang={lang} />
          ) : null}
        </div>
      ) : (
        <p className="rounded-lg border border-line bg-surface-alt p-4 text-sm text-body">
          {t.pickup_info}
        </p>
      )}

      {/* Gate prompt — clear, bilingual, blocks delivery without zone + address. */}
      {!ready ? (
        <p className="text-sm text-muted" role="status">
          {t.gate_need_zone_address}
        </p>
      ) : null}

      <PrimaryButton fullWidth disabled={!ready} onClick={continueToPayment}>
        {t.continue_to_payment}
      </PrimaryButton>
    </div>
  );
}
