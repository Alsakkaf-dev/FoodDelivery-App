'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/icons';
import { IconButton, EmptyState } from '@/components/ui';
import { CartBadge } from '@/components/ui/cart-badge';
import { SearchBar } from './search-bar';
import { RecentKeywords } from './recent-keywords';
import { SuggestedList } from './suggested-list';
import { ProductGrid } from './product-grid';
import { useRecentSearches } from './use-recent-searches';
import type { MenuItem } from '@/types/db';
import type { Dictionary } from '@/lib/i18n/dictionaries';

// Search screen orchestrator. Header (back · "Search" · cart-with-count) + the
// search field. While typing it live-filters the REAL menu by bilingual name;
// when empty it shows recent keywords + suggested rows + a popular grid. The cart
// affordance is #04's shared inline CartBadge (hydration-safe, hidden at 0); #04
// hides the shell's floating instance on /search so they don't double up.
// `arrow-left` auto-mirrors under dir=rtl.
const POPULAR_LIMIT = 6;
const SUGGESTED_LIMIT = 3;

