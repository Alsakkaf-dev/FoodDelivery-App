import Link from 'next/link';
import { FoodImage } from '@/components/ui/food-image';
import { StatusBadge, QtyCounter } from '@/components/ui/status';
import { MetaStat } from '@/components/ui';
import { Icon } from '@/components/icons';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { ShopStatus } from '@/types/db';

// SCR-C-01 — Open-Restaurants hero (Home V). The single Fahman vendor rendered as
// the canonical restaurant card: hero photo + name + live status + MetaStat row.
// Presentational only — `status-hero.tsx` owns the live useShopStatus wiring and
// feeds the live values down (seed shapes preserved). The card pattern is reused
// by #08 (Search/Categories). Live-data first: the design's ★ rating slot carries
// the real shop status instead of a fabricated number (no ratings in the schema).
type Props = {
  status: ShopStatus;
  qtyRemaining: number;
  qtyTotal: number;
  deliveryWindow: string | null;
  photoUrl?: string | null;
  lang: 'en' | 'ar';
  t: Dictionary;
};

