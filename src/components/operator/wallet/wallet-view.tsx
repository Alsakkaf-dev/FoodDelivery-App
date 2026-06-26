'use client';
import { useState } from 'react';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import { formatMYR } from '@/lib/utils/money';
import {
  Card,
  EmptyState,
  FilledInput,
  IconChip,
  PrimaryButton,
  SuccessScreen,
} from '@/components/ui';

// SCR-O — Operator Wallet / Withdraw (new screen; design "Payment Withdraw
// Successful"). HONEST FRONT-END-ONLY PREVIEW: the app has no payout/wallet
// backend (the frozen domain layer is session/menu/orders/zones/addresses/
// notify/rider only) and feature engineers may not add API/domain code. So the
// balance is sourced from the read-only `endOfDay()` revenue (today's earnings,
// passed from the server page) and the withdraw action does NOT move money — it
// shows the success state and is clearly labelled a preview via
// `t.payouts_preview_note`. No fake API, no fabricated transaction history.
//
// Composes shared #02 primitives (Card / FilledInput / PrimaryButton /
// SuccessScreen / IconChip / EmptyState) + #01 tokens; copy via the dictionary
// (#03); RTL-safe via logical props; light theme only.
