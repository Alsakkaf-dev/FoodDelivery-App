import { IconChip } from '@/components/ui';
import type { IconName } from '@/components/icons';
import type { SettingsTone } from './settings-list';

// Personal-Info read card — a soft surface-alt panel of label/value rows, each
// led by a color-coded IconChip (person=brand, email=info.blue, phone=info.blue
// per the spec). Stacked layout: small uppercase label above the value (matches
// the reference). Presentational; values arrive from the server page (name +
// phone are real from getProfile; email/bio are presentational — no DB column,
// see TEAM_STATUS.md backend request). Empty values render an em dash.
export interface IdentityRow {
  key: string;
  icon: IconName;
  tone: SettingsTone;
  label: string;
  value?: string | null;
  dir?: 'ltr' | 'rtl';
}

export function IdentityCard({ rows }: { rows: IdentityRow[] }) {
  return (
    <ul className="space-y-1 rounded-2xl bg-surface-alt p-2">
      {rows.map((r) => (
        <li key={r.key} className="flex items-center gap-3 rounded-xl p-3">
          <IconChip icon={r.icon} tone={r.tone} />
          <div className="min-w-0">
            <p className="text-label uppercase text-muted">{r.label}</p>
            <p dir={r.dir} className="truncate text-body text-ink text-start">
              {r.value ? r.value : '—'}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
