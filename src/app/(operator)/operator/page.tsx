import Link from 'next/link';
import { getStatus, openShop, closeShop, setSoldOut } from '@/lib/domain/session';
import { boardList, endOfDay } from '@/lib/domain/orders';
import { getI18n } from '@/lib/i18n/server';
import { formatMYR } from '@/lib/utils/money';
import { ErrorState } from '@/components/ui/states';
import { StateControls } from '@/components/operator/state-controls';
import { AnalyticsChart, type ChartPoint } from '@/components/operator/analytics-chart';
import type { Order, OrderStatus } from '@/types/db';

// SCR-O-01 — Operator dashboard: the live day snapshot (KPI stat cards + revenue
// analytics chart), the one-tap Open / Close / Sold-Out controls (US-023/024/025,
// FR-O-01/02/03), plus honest Reviews / Popular-Items placeholders where no frozen
// data source exists yet. Server component: fetch on the server, hydrate the live
// badge/qty + controls + chart range as client islands. The (operator) layout owns
// the shell (OfflineBanner, LangSwitch header, BottomNav).
export const dynamic = 'force-dynamic';

// Active = still "running" on the board (delivered/cancelled drop off).
const ACTIVE: OrderStatus[] = ['new', 'confirmed', 'preparing', 'ready', 'out_for_delivery'];

function hourLabel(h: number) {
  const period = h < 12 ? 'AM' : 'PM';
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}${period}`;
}

// Real daily revenue spline: today's orders bucketed by the hour of created_at,
// summing order totals. No fabricated data — empty in, empty out.
function dailyRevenue(orders: Order[], locale: 'en' | 'ar'): ChartPoint[] {
  const byHour = new Map<number, number>();
  for (const o of orders) {
    const h = new Date(o.created_at).getHours();
    byHour.set(h, (byHour.get(h) ?? 0) + o.total);
  }
  return [...byHour.keys()]
    .sort((a, b) => a - b)
    .map((h) => {
      const v = byHour.get(h)!;
      return { label: hourLabel(h), value: v, display: formatMYR(v, locale) };
    });
}

