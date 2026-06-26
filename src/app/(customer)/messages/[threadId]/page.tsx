import { getI18n } from '@/lib/i18n/server';
import { PageHeader } from '@/components/customer/account/page-header';
import { ChatThread } from '@/components/customer/account/chat-thread';
import { findConversation } from '@/components/customer/account/seed';

// SCR-C — Chat thread (stretch). Composes the shared #02 ChatBubble + Composer
// (rider lane #17 reuses this composition). Demo conversation + optimistic local
// echo only — no messaging backend yet (see TEAM_STATUS.md).
export const dynamic = 'force-dynamic';

export default function ChatThreadPage({ params }: { params: { threadId: string } }) {
  const { locale, t } = getI18n();
  const convo = findConversation(params.threadId);

  return (
    <div className="space-y-3">
      <PageHeader title={convo?.person ?? t.messages} backLabel={t.back} />
      <ChatThread t={t} locale={locale} threadId={params.threadId} />
    </div>
  );
}
