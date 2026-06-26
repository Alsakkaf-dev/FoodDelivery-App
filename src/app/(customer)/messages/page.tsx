import { getI18n } from '@/lib/i18n/server';
import { EmptyState } from '@/components/ui';
import { PageHeader } from '@/components/customer/account/page-header';
import { TabHeader } from '@/components/customer/account/tab-header';
import { MessageRow } from '@/components/customer/account/message-row';
import { MESSAGES_SEED, TOTAL_UNREAD, localize } from '@/components/customer/account/seed';

// SCR-C — Messages (tab 2 of the feed). Conversation inbox; tapping a row opens
// the chat thread. Demo content for now (no messaging backend — backend request
// in TEAM_STATUS.md). Rider lane (#17) reuses the ChatBubble/Composer composition
// from the thread screen.
export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  const { locale, t } = getI18n();
  const items = MESSAGES_SEED;

  return (
    <div className="space-y-4">
      <PageHeader title={t.messages} backLabel={t.back} />
      <TabHeader notificationsLabel={t.notifications} messagesLabel={`${t.messages} (${TOTAL_UNREAD})`} active="messages" />

      {items.length === 0 ? (
        <EmptyState icon="message" title={t.no_messages} hint={t.no_messages_hint} />
      ) : (
        <ul className="divide-y divide-line">
          {items.map((m) => (
            <li key={m.id}>
              <MessageRow
                href={`/messages/${m.threadId}`}
                person={m.person}
                preview={localize(locale, m.preview)}
                time={m.at}
                unread={m.unread}
                presence={m.presence}
                unreadLabel={t.messages}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
