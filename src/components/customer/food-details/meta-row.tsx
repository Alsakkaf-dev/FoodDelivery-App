import { MetaStat } from '@/components/ui';
import type { IconName } from '@/components/icons';
import type { Dictionary } from '@/lib/i18n/dictionaries';

// Meta row — honest single-vendor brand attributes only. The data model has no rating,
// delivery fee, or ETA, so we never fabricate a star number / "free" / "20 min". Instead
// we show truthful brand chips (Halal · Fresh · Fast) from the dictionary. MetaStat
// renders nothing for an empty array, so this degrades cleanly if the keys are dropped.
export function MetaRow({ t }: { t: Dictionary }) {
  const items: { icon: IconName; label: string }[] = [
    { icon: 'check-circle', label: t.meta_halal },
    { icon: 'utensils', label: t.meta_fresh },
    { icon: 'clock', label: t.meta_fast },
  ];
  return <MetaStat items={items} />;
}
