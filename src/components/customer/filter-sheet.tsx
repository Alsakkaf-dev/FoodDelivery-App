'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { BottomSheet, Chip, SelectChip, RatingRow, PrimaryButton, TextAction } from '@/components/ui';
import { translate, type Dictionary } from '@/lib/i18n/dictionaries';
import {
  EMPTY_FILTERS,
  OFFER_IDS,
  DELIVER_TIMES,
  PRICE_TIERS,
  PRICE_SYMBOL,
  type Filters,
} from './search/filters';

// "Filter your search" bottom-sheet (reused by Search + Category listing). Builds
// all four reference dimensions from the shared toggle primitives — no fork:
//   OFFERS         multi-select Chips      (collected-only — no per-item data)
//   DELIVER TIME   single-select Chips     (collected-only)
//   PRICING        single-select SelectChip (WIRED → real price terciles)
//   RATING         interactive RatingRow    (collected-only)
// Edits a local draft; FILTER applies it to the parent list and closes; RESET
// clears. The draft re-syncs to the applied value each time the sheet opens.
function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-label text-muted">{label}</p>
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  );
}

