import { Avatar, MetaStat } from '@/components/ui';
import type { IconName } from '@/components/icons';

// Account-hub identity hero — warm amber→orange gradient panel (the brand's
// canonical hero treatment) carrying the customer's avatar, name + phone and a
// compact stat strip (real counts: orders, saved addresses). We deliberately
// show identity + real stats rather than a fabricated wallet balance (no wallet
// backend exists — see TEAM_STATUS.md backend request). When a wallet lands, a
// balance line can be added here without touching consumers.
//
// Presentational only; all strings arrive localized from the server page. On the
// orange surface everything is `text-onColor`; MetaStat icons inherit currentColor.
export interface HeroStat {
  icon: IconName;
  label: string;
}

export function ProfileHero({
  name,
  phone,
  stats,
}: {
  name: string;
  phone: string;
  stats: HeroStat[];
}) {
  return (
    <section className="overflow-hidden rounded-2xl bg-hero-gradient p-5 text-onColor shadow-card">
      <div className="flex items-center gap-4">
        <Avatar name={name} size="lg" backdrop />
        <div className="min-w-0">
          <p className="truncate text-h2 font-bold text-onColor">{name}</p>
          <p dir="ltr" className="truncate text-body text-onColor/80 text-start">
            {phone}
          </p>
        </div>
      </div>
      {stats.length > 0 ? (
        <div className="mt-4 border-t border-white/20 pt-3">
          <MetaStat items={stats} />
        </div>
      ) : null}
    </section>
  );
}
