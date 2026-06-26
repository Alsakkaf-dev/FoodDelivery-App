import type { ReactNode } from 'react';
import { Icon } from '@/components/icons';
import { cx } from './cx';

// Plan 02 — Avatar: photo (CSS background-image, per spec — no remote next/image) or
// initials fallback, with optional peach backdrop, presence dot, and an edit-FAB slot.
// Presence dot / edit-FAB sit at the logical bottom-end so they mirror under RTL.

const SIZE = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-14 w-14 text-base',
  lg: 'h-20 w-20 text-h2',
  xl: 'h-28 w-28 text-h1',
} as const;

function initialsOf(name?: string) {
  if (!name) return '';
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

