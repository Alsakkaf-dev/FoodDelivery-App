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

export function AddressCard({
  kind,
  label,
  line1,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: {
  kind: AddressKind;
  label: string;
  line1: string;
  editLabel: string;
  deleteLabel: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const style = KIND_STYLE[kind];
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-surface-alt p-4">
      <IconChip icon={style.icon} tone={style.tone} />
      <div className="min-w-0 flex-1">
        <p className="text-title font-bold uppercase text-ink">{label}</p>
        <p className="mt-1 text-body text-muted">{line1}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <IconButton variant="nav" icon="edit" aria-label={editLabel} onClick={onEdit} className="text-brand" />
        <IconButton variant="nav" icon="trash" aria-label={deleteLabel} onClick={onDelete} className="text-danger" />
      </div>
    </div>
  );
}
