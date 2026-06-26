import { getI18n } from '@/lib/i18n/server';
import { endOfDay } from '@/lib/domain/orders';
import { formatMYR } from '@/lib/utils/money';
import { ErrorState, EmptyState } from '@/components/ui/states';

// SCR-O-07 — end-of-day summary (US-037, FR-O-13). Server Component: totals over
// delivered orders only (count, items sold, MYR revenue) from `endOfDay()`.
export const dynamic = 'force-dynamic';

