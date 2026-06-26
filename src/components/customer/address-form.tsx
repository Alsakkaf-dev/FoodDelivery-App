'use client';
import { useState } from 'react';
import type { Address } from '@/types/db';
import { addressSchema } from '@/lib/utils/schemas';
import { createAddress } from '@/lib/domain/addresses';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { Icon, type IconName } from '@/components/icons';
import { MapIllustration } from '@/components/brand';
import { Chip, FilledInput, IconChip, ListRow, OutlineButton, PrimaryButton, TextAction } from '@/components/ui';

// SCR-C-05 step 1 — delivery address entry/save + saved-address reuse
// (US-015 / FR-C-07). Saving goes through the `createAddress` server action,
// which re-validates with `addressSchema` (the only write path). The structured
// fields (address/street/postcode/apartment) are composed into the single frozen
// `line1` (the DB stores only line1 + label + pin). An optional map pin can be
// filled from `navigator.geolocation` — no paid map API.

// Free-text `label` → display glyph (display-only; never alters the stored value).
function labelGlyph(label: string | null): { icon: IconName; tone: 'info.blue' | 'info.purple' | 'brand' } {
  const l = (label ?? '').toLowerCase();
  if (/home|house|منزل|بيت/.test(l)) return { icon: 'home-address', tone: 'info.blue' };
  if (/work|office|عمل|مكتب|دوام/.test(l)) return { icon: 'briefcase', tone: 'info.purple' };
  return { icon: 'map-pin', tone: 'brand' };
}

const LABELS: Array<{ value: string; key: 'label_home' | 'label_work' | 'label_other' }> = [
  { value: 'Home', key: 'label_home' },
  { value: 'Work', key: 'label_work' },
  { value: 'Other', key: 'label_other' },
];

