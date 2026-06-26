'use client';
import Link from 'next/link';
import { useState } from 'react';
import { BottomSheet, TextAction } from '@/components/ui';
import { formatMYR } from '@/lib/utils/money';
import type { CartLine } from '@/lib/cart/store';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';

// SCR-C-04 — the white order-summary sheet pinned over the immersive dark cart.
// It is fully controlled + store-agnostic (props only) so it stays trivially
// testable. The delivery-address block is a NAVIGATIONAL entry into the checkout
// flow (#11 owns address/zone selection + the fahman.checkout.draft) — the cart
// never fetches or sets the real address. "Breakdown" opens a sheet listing the
// per-line subtotals the cart legitimately knows; the delivery fee depends on the
// zone chosen at checkout, hence the note. PLACE ORDER enters the same flow.
