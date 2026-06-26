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
