'use client';
import { useState } from 'react';
import { FloatingIconButton } from '@/components/ui';
import type { Dictionary } from '@/lib/i18n/dictionaries';

// Favourite heart — a LOCAL, non-persisted visual affordance. The data model has no
// favourites table, so this toggles in-memory state only; it never writes anywhere and
// never implies persistence we don't have. Honest, on-brand delight.
export function FavoriteButton({ t }: { t: Dictionary }) {
  const [fav, setFav] = useState(false);
  return (
    <FloatingIconButton
      aria-label={t.favorite}
      aria-pressed={fav}
      icon={fav ? 'heart-filled' : 'heart'}
      active={fav}
      onClick={() => setFav((v) => !v)}
    />
  );
}
