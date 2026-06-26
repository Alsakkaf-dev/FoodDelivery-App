'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/icons';
import { IconButton, EmptyState } from '@/components/ui';
import { ProductGrid } from './product-grid';
import { CategorySelect } from './category-select';
import { FilterSheet } from '../filter-sheet';
import { EMPTY_FILTERS, applyFilters, matchesCategory, type Filters } from './filters';
import type { MenuItem } from '@/types/db';
import type { Dictionary } from '@/lib/i18n/dictionaries';

// Category listing ("Food - Burgers"): header (back · category selector · search ·
// filter) + a 2-col product grid filtered by the selected brand bucket and the
// filter sheet. Single-shop honest binding — see ./filters. Search is a navigation
// anchor (dark circle), back/filter are real buttons. `arrow-left` auto-mirrors.
