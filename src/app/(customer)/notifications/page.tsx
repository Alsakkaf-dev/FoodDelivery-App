import { getI18n } from '@/lib/i18n/server';
import { EmptyState } from '@/components/ui';
import { PageHeader } from '@/components/customer/account/page-header';
import { TabHeader } from '@/components/customer/account/tab-header';
import { NotificationRow } from '@/components/customer/account/notification-row';
import { TOTAL_UNREAD, relTime } from '@/components/customer/account/seed';
import { listMyNotifications } from '@/lib/domain/notifications';

// SCR-C — Notifications (tab 1 of the Notifications/Messages feed). Real per-user
// read (RLS-scoped to the signed-in user); each row is an order-status event
// rendered to a short localized label. Messages stays demo (no messages backend).
export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const { locale, t } = getI18n();
  const res = await listMyNotifications(locale);
  const items = res.ok ? res.data : [];

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
              <NotificationRow person={t.app_name} action={n.label} time={relTime(t, n.minsAgo)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
