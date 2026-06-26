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

export type MenuDraft = {
  id?: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  price: string; // text field; parsed to a number on submit
  photo_url: string | null;
  sort_order: number;
  available: boolean;
};

/** A fresh empty draft for the "add item" form. */
export function blankDraft(sort_order = 0): MenuDraft {
  return {
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    price: '',
    photo_url: null,
    sort_order,
    available: true,
  };
}

/** Map the form draft onto the `menuUpsertSchema` shape (id present ⇒ update). */
export function draftToInput(d: MenuDraft) {
  return {
    ...(d.id ? { id: d.id } : {}),
    name_en: d.name_en.trim(),
    name_ar: d.name_ar.trim(),
    description_en: d.description_en.trim() || null,
    description_ar: d.description_ar.trim() || null,
    price: Number(d.price),
    photo_url: d.photo_url || null,
    available: d.available,
    sort_order: Number(d.sort_order) || 0,
  };
}

function toDraft(item: MenuItem): MenuDraft {
  return {
    id: item.id,
    name_en: item.name_en,
    name_ar: item.name_ar,
    description_en: item.description_en ?? '',
    description_ar: item.description_ar ?? '',
    price: String(item.price),
    photo_url: item.photo_url,
    sort_order: item.sort_order,
    available: item.available,
  };
}

