'use client';
import { useShopStatus } from '@/lib/realtime/hooks';
import { RestaurantHeroCard } from './home/restaurant-hero-card';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { DailySession } from '@/types/db';

type Props = {
  initial: Pick<DailySession, 'status' | 'qty_remaining'>;
  qtyTotal: number;
  deliveryWindow: string | null;
  photoUrl?: string | null;
  lang: 'en' | 'ar';
  t: Dictionary;
};

// SCR-C-01 — live status engine (FR-C-02/03). Server passes the initial status;
// useShopStatus keeps it live over the shop:status realtime channel (seed shape
// {status,qty_remaining} UNCHANGED). Presentation is delegated to the
// Open-Restaurants hero card — this component owns only the live wiring.
export function StatusHero({ initial, qtyTotal, deliveryWindow, photoUrl, lang, t }: Props) {
  const live = useShopStatus(initial) ?? initial;
  return (
    <RestaurantHeroCard
      status={live.status}
      qtyRemaining={live.qty_remaining}
      qtyTotal={qtyTotal}
      deliveryWindow={deliveryWindow}
      photoUrl={photoUrl}
      lang={lang}
      t={t}
    />
  );
}
