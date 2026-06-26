'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useShopStatus } from '@/lib/realtime/hooks';
import { useCart } from '@/lib/cart/store';
import { pastCutoff } from '@/lib/utils/time';
import { formatMYR } from '@/lib/utils/money';
import { getDictionary, type Dictionary } from '@/lib/i18n/dictionaries';
import { CreditCardIllustration, SuccessWallet } from '@/components/brand';
import { IconChip, OutlineButton, PrimaryButton, SelectTile, SuccessScreen } from '@/components/ui';
import { StatusBadge } from '@/components/ui/status';
import { EmptyState, ErrorState, Loading } from '@/components/ui/states';
import { ProofUpload } from './proof-upload';
import { AddCard, type SavedCard } from './add-card';
import type { PaymentMethod, ShopStatus } from '@/types/db';

// SCR-C-05 part 2 — payment method, the ordering gate, and place-order
// (US-016/017, FR-C-08/09/10). The order itself is placed by the race-safe
// `createOrder` RPC via POST /api/orders — never decremented client-side; this
// island only builds the request, gates it, and reacts to the result.

export type CheckoutDraft = {
  type: 'delivery' | 'pickup';
  zone_id: string | null;
  address_id: string | null;
};
type OrderLine = { menu_item_id: string; qty: number };
type StatusSeed = { status: ShopStatus; qty_remaining: number };

// UI-only superset of the FROZEN payment_method enum. Only `cod`/`duitnow_qr` are
// real, orderable methods (the /api/orders contract accepts only those two);
// `card`/`paypal` are visual tiles that gate the order — they never reach the API.
type UiMethod = PaymentMethod | 'card' | 'paypal';

const DRAFT_KEY = 'fahman.checkout.draft'; // written by task-2-3 CheckoutFlow

// createOrder error code (SDD §5.1) → bilingual message key.
const ERR_KEY: Record<string, keyof Dictionary> = {
  shop_not_open: 'err_shop_not_open',
  past_cutoff: 'err_past_cutoff',
  sold_out_or_insufficient: 'err_sold_out',
  delivery_requires_zone_address: 'err_delivery_requires_address',
  item_unavailable: 'err_item_unavailable',
  empty_cart: 'empty_cart',
};

type CoreProps = {
  items: OrderLine[];
  draft: CheckoutDraft;
  initialStatus: StatusSeed;
  cutoffTime: string | null;
  lang: 'en' | 'ar';
  itemTotal?: number;
  initialMethod?: UiMethod;
  onPlaced: (orderId: string) => void;
};

/**
 * The presentational + logic core — fully prop-driven so it is unit-testable and
 * reusable. `CheckoutPayment` below wires it to the live cart + draft.
 */
