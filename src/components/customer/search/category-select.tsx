'use client';
import { useState } from 'react';
import { BottomSheet, Chip } from '@/components/ui';
import { Icon } from '@/components/icons';
import { CATEGORIES } from './filters';
import type { Dictionary } from '@/lib/i18n/dictionaries';

// The "BURGER ▾" header selector from the category listing. Fahman has no
// `category` column, so the options are the curated brand buckets (cat_* keys);
// picking one re-filters the grid by name match. Opens a small BottomSheet (the
// app's standard overlay) of selectable Chips. `chevron-down` does not mirror.
