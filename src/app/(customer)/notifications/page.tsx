import { getI18n } from '@/lib/i18n/server';
import { EmptyState } from '@/components/ui';
import { PageHeader } from '@/components/customer/account/page-header';
import { TabHeader } from '@/components/customer/account/tab-header';
import { NotificationRow } from '@/components/customer/account/notification-row';
import { NOTIFICATIONS_SEED, TOTAL_UNREAD, localize, relTime } from '@/components/customer/account/seed';

// SCR-C — Notifications (tab 1 of the Notifications/Messages feed). Demo content
// for now (the notifications table is a dispatch/delivery log, not a customer
// feed — backend request in TEAM_STATUS.md); rows are backend-shaped so a live
// read drops in later. The (customer) layout owns the shell frame + bottom nav.
export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const { locale, t } = getI18n();
  const items = NOTIFICATIONS_SEED;

  return (
    <div className="space-y-4">
      <PageHeader title={t.notifications} backLabel={t.back} />
      <TabHeader notificationsLabel={t.notifications} messagesLabel={`${t.messages} (${TOTAL_UNREAD})`} active="notifications" />

      {items.length === 0 ? (
        <EmptyState icon="bell" title={t.no_notifications} hint={t.no_notifications_hint} />
      ) : (
        <ul className="divide-y divide-line">
          {items.map((n) => (
            <li key={n.id}>
              <NotificationRow person={n.person} action={localize(locale, n.action)} time={relTime(t, n.minsAgo)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
