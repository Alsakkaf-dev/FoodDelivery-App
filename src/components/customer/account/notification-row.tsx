import { Avatar } from '@/components/ui';
import { FoodImage } from '@/components/ui/food-image';

// Notification feed row: actor avatar + "<name> <action>" (name bold, action
// muted) + relative timestamp, with a trailing food thumbnail. Presentational;
// all strings arrive localized from the page. Demo content for now (no customer
// notifications-feed backend — see TEAM_STATUS.md); the row is backend-shaped so
// a live read can replace the seed without touching this component.
export function NotificationRow({
  person,
  action,
  time,
}: {
  person: string;
  action: string;
  time: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <Avatar name={person} size="md" />
      <div className="min-w-0 flex-1">
        <p className="text-body leading-snug">
          <span className="font-bold text-ink">{person}</span> <span className="text-muted">{action}</span>
        </p>
        <p className="mt-1 text-caption text-muted">{time}</p>
      </div>
      <FoodImage alt="" shape="rounded" fallbackIcon="utensils" className="h-14 w-14 shrink-0" />
    </div>
  );
}
