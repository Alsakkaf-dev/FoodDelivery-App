import { IconButton, IconChip } from '@/components/ui';
import type { IconName } from '@/components/icons';
import type { SettingsTone } from './settings-list';

// Saved-address card: color-coded IconChip (HOME=info.blue home, WORK=info.purple
// briefcase, OTHER=brand pin) + uppercase label + address line, with trailing
// edit (brand) and delete (danger) icon buttons clustered at the logical end so
// they mirror under RTL. Presentational — handlers come from the client list.

export type AddressKind = 'home' | 'work' | 'other';

const KIND_STYLE: Record<AddressKind, { icon: IconName; tone: SettingsTone }> = {
  home: { icon: 'home-address', tone: 'info.blue' },
  work: { icon: 'briefcase', tone: 'info.purple' },
  other: { icon: 'map-pin', tone: 'brand' },
};

/** Best-effort classification of a free-text label into a styled kind. */
export function addressKind(label: string | null): AddressKind {
  const v = (label ?? '').trim().toLowerCase();
  if (!v) return 'other';
  if (v.includes('home') || v.includes('منزل') || v.includes('البيت')) return 'home';
  if (v.includes('work') || v.includes('office') || v.includes('عمل') || v.includes('مكتب')) return 'work';
  return 'other';
}

