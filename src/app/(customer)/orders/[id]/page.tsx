import { notFound } from 'next/navigation';
import { getOrder } from '@/lib/domain/orders';
import { listMenu } from '@/lib/domain/menu';
import { getI18n } from '@/lib/i18n/server';
import { translate } from '@/lib/i18n/dictionaries';
import { formatMyt } from '@/lib/utils/time';
import { ErrorState } from '@/components/ui';
import { OrderTracker, type OrderLine } from '@/components/customer/order-tracker';
import type { MenuItem } from '@/types/db';

// SCR-C-06 — order confirmation + live tracking (US-018 / US-021, FR-C-10/11).
// Server Component: fetches the order + items via getOrder(id) and resolves the
// bilingual line names from the menu, then hydrates the OrderTracker island which
// subscribes over order:{id} for sub-2s live status updates. RLS restricts who
// can read the order; a missing/unauthorized order renders the not-found page.
export const dynamic = 'force-dynamic';

