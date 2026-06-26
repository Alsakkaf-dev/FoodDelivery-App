import { ListRow, IconChip } from '@/components/ui';
import type { IconName } from '@/components/icons';

// Account-hub settings list — color-coded IconChip + title + chevron rows,
// composed from #02's ListRow + IconChip primitives (never forked). These are the
// in-app entry points to the account sub-screens (and to /notifications,
// /messages) because the bottom nav hrefs are frozen (R-4 — no /account slot).
// Language is intentionally NOT duplicated here: the shared LangSwitch stays
// mounted in the (customer) layout (R-4). Copy arrives localized from the page.
export type SettingsTone = 'brand' | 'info.blue' | 'info.purple' | 'success' | 'danger';

export interface SettingsItem {
  key: string;
  icon: IconName;
  tone: SettingsTone;
  title: string;
  href: string;
}

export function SettingsList({ items }: { items: SettingsItem[] }) {
  return (
    <nav className="overflow-hidden rounded-2xl bg-surface-alt">
      <ul className="divide-y divide-line">
        {items.map((it) => (
          <li key={it.key}>
            <ListRow leading={<IconChip icon={it.icon} tone={it.tone} />} title={it.title} href={it.href} chevron />
          </li>
        ))}
      </ul>
    </nav>
  );
}
