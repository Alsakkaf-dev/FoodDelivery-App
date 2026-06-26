'use client';
import { useState } from 'react';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { BottomSheet, FilledInput, PrimaryButton } from '@/components/ui';

// SCR-C-05 — "Add Card" (front-end only). The order API is frozen to cod|duitnow_qr,
// so this NEVER places a card order and NEVER persists a full PAN: it captures a card
// for display only and returns `{brand,last4}` to the payment screen's local vault.
export type SavedCard = { brand: string; last4: string };

