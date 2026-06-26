'use client';
import Link from 'next/link';
import { useOrderStatus } from '@/lib/realtime/hooks';
import { Timeline, OrderStatusChip } from '@/components/ui';
import { Icon } from '@/components/icons';
import { formatMYR } from '@/lib/utils/money';
import { formatMyt } from '@/lib/utils/time';
import { TrackMap } from './track-map';
import type { Order, PaymentStatus } from '@/types/db';

export type OrderLine = { key: string; name: string; qty: number; unitPrice: number };

type Props = {
  initial: Order;
  lines: OrderLine[];
  lang: 'en' | 'ar';
  labels: {
    track: string;
    items: string;
    total: string;
    paymentStatus: string;
    method: string;
    pay: Record<PaymentStatus, string>;
    // Optional new copy (provided by the page from the dictionary). All have inline
    // fallbacks so the existing unit test's labels object still type-checks + renders.
    shopName?: string;
    placedAt?: string;
    placed?: string;
    typeLabel?: string;
    back?: string;
    mapAlt?: string;
    contactRider?: string;
    contactHref?: string;
  };
};

// SCR-C-06 — order confirmation + live tracking island (US-018 / US-021, FR-C-10/11).
// The server passes the initial order + resolved lines; `useOrderStatus` keeps `status`,
// `payment_status` and `total` live over the order:{id} channel so an operator/rider
// advance reflects within 2s without a refresh (NFR-P-01). For a delivery the screen is
// an immersive map (floating dark header + TrackMap + persistent summary sheet); for a
// pickup it falls back to a no-map confirmation layout. Early statuses read as a placed
// confirmation; later statuses grow the tracking emphasis (route fills, rider contact
// appears). The Timeline + OrderStatusChip re-render from the live status.
