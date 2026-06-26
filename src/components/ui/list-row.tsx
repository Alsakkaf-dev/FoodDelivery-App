import type { ReactNode } from 'react';
import { Icon } from '@/components/icons';
import { cx } from './cx';

// Plan 02 — ListRow / SettingsRow: leading IconChip slot + title/subtitle + trailing
// value/chevron. Renders as <a>, <button> or <div> depending on props. The chevron uses
// the directional `chevron-right` icon which auto-mirrors under RTL. Optional selectable
// mode (orange-faint + check). Token-driven, ≥44px tap.

