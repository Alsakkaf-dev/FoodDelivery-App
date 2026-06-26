'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { cancelOrder } from '@/lib/domain/orders';
import type { OrderStatus } from '@/types/db';
import { BottomSheet } from '@/components/ui';
import { ReviewComposer, type ReviewComposerLabels } from './review-composer';

// Engineer #13 — the interactive row actions for an order (client island).
// Ongoing → Track (Link → live tracking) + Cancel (server action, confirm sheet).
// History → Rate (optimistic review composer) + Re-Order (→ /menu, v1).
// Buttons use the contracted `.btn-*` classes (FOUNDATION_CONTRACTS §1e, re-skinned
// by #01) on the semantically-correct element; structural pieces (BottomSheet,
// RatingRow) come from the #02 primitive library. No frozen contract is touched —
// cancelOrder lives in the 'use server' domain module and is consumed read-only.

export type OrderActionLabels = {
  track: string;
  cancel: string;
  rate: string;
  reorder: string;
  confirmTitle: string;
  keep: string;
  confirmCancel: string;
  tooLate: string;
  error: string;
  composer: ReviewComposerLabels;
};

// Only these states may be cancelled by the customer (mirrors the domain guard in
// cancelOrder); for every other ongoing state we hide Cancel and let Track span.
const CANCELLABLE: OrderStatus[] = ['new', 'confirmed'];

type Props = {
  orderId: string;
  orderNo: string;
  status: OrderStatus;
  variant: 'ongoing' | 'history';
  shopName: string;
  labels: OrderActionLabels;
};

