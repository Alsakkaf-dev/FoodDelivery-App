'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { OrderStatus, PaymentMethod, PaymentStatus } from '@/types/db';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { ApiResult } from '@/lib/utils/api';

// SCR-O-04 — operator payment + cancel actions (US-035/036, FR-O-14/15).
// Verify/Reject a DuitNow proof (→ verifyPayment, which notifies the customer of
// the verdict) and Cancel/Refuse with a required reason (→ refuseOrder, which the
// DB restock trigger uses to return reserved units and notifies the customer).
// Only New/Confirmed orders are refusable. Prop-driven (actions arrive as props)
// so it carries no server-only imports.

export type VerifyAction = (id: string, decision: 'verified' | 'rejected') => Promise<ApiResult<true>>;
export type RefuseAction = (id: string, reason: string) => Promise<ApiResult<true>>;

// Exported (additive — value/semantics unchanged) so the board chip can single-source
// the same refusable rule instead of duplicating it. Frozen contract per the brief.
export const REFUSABLE: OrderStatus[] = ['new', 'confirmed'];

