import Link from 'next/link';
import { riderDeliveries, type RiderDelivery } from '@/lib/domain/rider';
import { getI18n } from '@/lib/i18n/server';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { OrderStatusChip } from '@/components/ui/status';
import { EmptyIllustration } from '@/components/brand';
import { Icon } from '@/components/icons';
import { formatMYR } from '@/lib/utils/money';
import { buildMapsLink } from '@/components/rider/delivery-card';
import { RiderActions } from '@/components/rider/rider-actions';
import type { PaymentStatus } from '@/types/db';

// SCR-R-02 — Delivery detail with the pickup / deliver actions (FR-R-05/06). BODY ONLY
// (ruling R-5): the chrome (offline banner, max-w-md <main>, LangSwitch, BottomNav) comes
// from (rider)/layout.tsx. There is no single-delivery server fn, so we reuse
// riderDeliveries() and locate the order in the grouped result (kept simple, per the brief).
export const dynamic = 'force-dynamic';

