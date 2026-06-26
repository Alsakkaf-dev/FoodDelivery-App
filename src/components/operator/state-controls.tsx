'use client';
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useShopStatus } from '@/lib/realtime/hooks';
import { StatusBadge, QtyCounter } from '@/components/ui/status';
import type { DailySession, ShopStatus } from '@/types/db';

/**
 * One tap = one shop transition (US-023 Open / US-024 Close / US-025 Sold-Out,
 * FR-O-01/02/03). Kept module-level + pure so the three transitions are
 * unit-testable without rendering the component.
 */
export type ShopActionKey = 'open' | 'close' | 'sold_out';
export const ACTION_RESULT: Record<ShopActionKey, ShopStatus> = {
  open: 'open',
  close: 'closed',
  sold_out: 'sold_out',
};

/** A server action invoked on tap; only its `ok` flag drives the UI. */
type ShopAction = () => Promise<{ ok: boolean }>;
type Labels = { open: string; close: string; soldOut: string; error: string };

/**
 * SCR-O-01 — one-tap Open / Close / Sold-Out island.
 * Optimistic: the tapped status shows immediately, then the server action runs;
 * on failure we roll back to the live status and surface an inline error.
 * `useShopStatus` keeps the badge + remaining counter live over the shop:status
 * channel, so the change propagates to every client (and back here) within ~2s
 * with no manual refresh (NFR-P-01). The server actions arrive as props so this
 * island stays free of server-only imports and is directly unit-testable.
 */
