import Link from 'next/link';
import type { RiderDelivery } from '@/lib/domain/rider';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import { OrderStatusChip } from '@/components/ui/status';
import { Icon } from '@/components/icons';
import { formatMYR } from '@/lib/utils/money';

/**
 * Build a Google Maps deep-link from a saved pin or address (FR-R-04; no paid API).
 * Computed inline so the card needs no server round-trip (mirrors lib mapsLink).
 * FROZEN shared helper — imported by rider/[id]/page.tsx. Signature + body unchanged.
 */
export function buildMapsLink(
  lat: number | null,
  lng: number | null,
  address: string | null,
): string {
  if (lat !== null && lng !== null) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address ?? '')}`;
}

/**
 * CMP-R-01 — A single delivery card (FR-R-03/04/07).
 * Large rounded card + dark CTA pill; big tap targets for a rider on a motorbike.
 */
