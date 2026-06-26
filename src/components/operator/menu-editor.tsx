'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MenuItem } from '@/types/db';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { ApiResult } from '@/lib/utils/api';
import { menuUpsertSchema } from '@/lib/utils/schemas';
import { formatMYR } from '@/lib/utils/money';
import { createClient } from '@/lib/supabase/client';
import { Icon } from '@/components/icons';
import { FoodImage } from '@/components/ui/food-image';
import {
  cx,
  EmptyState,
  FilledInput,
  PrimaryButton,
  TextAction,
  UnderlineTabs,
  UploadTile,
  type TabItem,
} from '@/components/ui';

// SCR-O-05 — Menu manager / "My Food List" (US-031, FR-O-08). The operator
// adds/edits/hides items, sets the MYR price, toggles availability and uploads a
// photo. Saves go through `upsertMenuItem` (operator-only) + `setAvailability`;
// after each save we `router.refresh()` so the customer menu reflects the change
// within seconds. Re-skinned to the new design language — shared #02 primitives
// (FilledInput / UploadTile / PrimaryButton / UnderlineTabs), #05 FoodImage + line
// icons, #01 tokens — while preserving every frozen contract: menuUpsertSchema +
// draftToInput, the `menu-photos` Storage upload pipeline, the `data-can-save`
// hook and the role="switch"/aria-checked availability toggle.
//
// SCHEMA-FAITHFUL: the reference "Add New Items"/"My Food List" show ingredient
// chips, Pick-up/Delivery toggles, ★ratings and meal-time categories, but the
// frozen `menuUpsertSchema` + `MenuItem` store none of these — so they are NOT
// rendered as controls that can't persist. The meal-time tabs render for visual
// parity but, with no category column, "All" is the only functional view.

const BUCKET = 'menu-photos';
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

export type MenuUpsertAction = (input: unknown) => Promise<ApiResult<MenuItem>>;
export type AvailabilityAction = (id: string, available: boolean) => Promise<ApiResult<true>>;

