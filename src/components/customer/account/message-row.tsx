import Link from 'next/link';
import { Avatar, Badge } from '@/components/ui';

// Messages inbox row: avatar with presence dot + sender + last-message preview
// (truncated) + timestamp and an unread count Badge at the logical end. The whole
// row links to the chat thread. Presentational; copy localized by the page. Demo
// content for now (no messaging backend — see TEAM_STATUS.md).
export function MessageRow({
  href,
  person,
  preview,
  time,
  unread,
  presence,
  unreadLabel,
}: {
  href: string;
  person: string;
  preview: string;
  time: string;
  unread: number;
  presence: 'online' | 'offline';
  unreadLabel: string;
}) {
  return (
    <Link href={href} className="flex min-h-tap items-center gap-3 py-3 active:scale-[.99]">
      <Avatar name={person} size="md" presence={presence} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-title font-bold text-ink">{person}</p>
        <p className={`mt-0.5 truncate text-body ${unread > 0 ? 'font-medium text-body' : 'text-muted'}`}>{preview}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-caption text-muted">{time}</span>
        {unread > 0 ? <Badge count={unread} aria-label={unreadLabel} /> : null}
      </div>
    </Link>
  );
}
