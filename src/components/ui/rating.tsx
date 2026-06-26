import type { ReactNode } from 'react';
import { Icon } from '@/components/icons';
import { cx } from './cx';

// Plan 02 — RatingRow. Read-only by default (renders an img-role star row); becomes an
// interactive radiogroup when `onChange` is provided (each star a ≥44px tap target).
// Filled stars use the `star` token, empties `star-off`. Token-driven, RTL-safe.

const DIM = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-7 w-7' } as const;

