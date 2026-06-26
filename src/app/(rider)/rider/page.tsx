import { riderDeliveries } from '@/lib/domain/rider';
import { getI18n } from '@/lib/i18n/server';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { EmptyIllustration } from '@/components/brand';
import { DeliveryCard } from '@/components/rider/delivery-card';
import { RiderFeedSeed } from '@/components/rider/rider-feed-seed';

// SCR-R-01 — Today's deliveries, grouped by zone (FR-R-02/03/04/07).
// BODY ONLY (ruling R-5): the (rider)/layout.tsx shell (Plan 04) provides the
// OfflineBanner, the max-w-md <main> frame, the LangSwitch and the rider BottomNav, so
// this page renders just the feed content. Server component; the live-feed refresh is a
// client island.
export const dynamic = 'force-dynamic';

