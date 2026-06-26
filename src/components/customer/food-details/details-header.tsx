import type { ReactNode } from 'react';
import { IconButton } from '@/components/ui';
import { Icon } from '@/components/icons';
import type { Dictionary } from '@/lib/i18n/dictionaries';

// Food-details header — back affordance (auto-mirroring chevron under RTL), centered
// "Details" title, and an optional trailing action slot (the favourite heart). Server
// component: the back control is a plain navigation link; only the favourite is client.
export function DetailsHeader({
  t,
  backHref,
  action,
}: {
  t: Dictionary;
  backHref: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex items-center justify-between gap-3">
      <IconButton variant="nav" href={backHref} aria-label={t.back}>
        <Icon name="chevron-start" />
      </IconButton>
      <h1 className="text-headerTitle text-ink">{t.details}</h1>
      {action ?? <span className="min-h-tap min-w-tap inline-block" aria-hidden />}
    </header>
  );
}
