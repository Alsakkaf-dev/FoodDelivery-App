'use client';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import type { Order, OrderStatus } from '@/types/db';
import { ORDER_TRANSITIONS } from '@/types/db';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { ApiResult } from '@/lib/utils/api';
import { formatMYR } from '@/lib/utils/money';
import { OrderStatusChip } from '@/components/ui/status';
import { REFUSABLE } from './payment-actions';

// SCR-O-03 — one order chip on the live board (US-033/034, FR-O-10/11).
// The Advance button only offers the legal next status computed from
// ORDER_TRANSITIONS (never hard-coded); the action re-validates and rejects an
// illegal move with `invalid_transition`. A Ready delivery order shows Dispatch
// (→ out_for_delivery), which surfaces it on the rider feed grouped by zone.

export type AdvanceAction = (input: { id: string; to_status: OrderStatus }) => Promise<ApiResult<Order>>;
export type DispatchAction = (id: string) => Promise<ApiResult<Order>>;

/** The single legal forward status for the Advance button (cancel excluded). */
export function forwardStatus(order: Order): OrderStatus | null {
  const opts = ORDER_TRANSITIONS[order.status].filter((s) => s !== 'cancelled');
  if (opts.length === 0) return null;
  // Ready can go two ways: a delivery order is dispatched to the rider
  // (out_for_delivery, via the Dispatch button); a pickup order is completed.
  if (order.status === 'ready') return order.type === 'pickup' ? 'delivered' : 'out_for_delivery';
  return opts[0]!;
}

/** A Ready delivery order can be dispatched to the rider (US-034). */
export function canDispatch(order: Order): boolean {
  return order.status === 'ready' && order.type === 'delivery';
}

