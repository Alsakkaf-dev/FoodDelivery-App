'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChatBubble, Composer } from '@/components/ui';
import { EmptyState } from '@/components/ui/states';
import { Icon } from '@/components/icons';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';

type Msg = { id: number; side: 'in' | 'out'; text: string };

/**
 * Delivery Man — Message screen (presentational).
 * No chat backend / messages table exists (frozen domain), so there is NO invented data
 * contract: the thread starts empty and the composer echoes the rider's own outgoing
 * bubbles locally. Full-screen immersive surface: `fixed inset-0 z-[45]` (modal band —
 * BottomNav 40 < 45 < OfflineBanner 50, z-stack order preserved). Close → delivery detail.
 */
export function MessageScreen({
  orderId,
  locale,
}: {
  orderId: string;
  locale: Locale;
}) {
  const router = useRouter();
  const t = getDictionary(locale);
  const [draft, setDraft] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);

  function send() {
    const text = draft.trim();
    if (!text) return;
    setMsgs((prev) => [...prev, { id: prev.length, side: 'out', text }]);
    setDraft('');
  }

  return (
    <div className="fixed inset-0 z-[45] flex flex-col bg-surface-alt">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-line bg-surface p-4">
          <button
            type="button"
            onClick={() => router.push(`/rider/${orderId}`)}
            aria-label={t.back}
            className="btn-secondary inline-flex h-11 w-11 items-center justify-center rounded-pill p-0"
          >
            <Icon name="close" className="h-5 w-5" aria-hidden />
          </button>
          <h1 className="text-headerTitle font-bold text-ink">{t.customer}</h1>
        </header>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          {msgs.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState
                title={t.no_messages}
                hint={t.no_messages_hint}
                icon={<Icon name="message" className="h-12 w-12 text-muted" aria-hidden />}
              />
            </div>
          ) : (
            msgs.map((m) => (
              <ChatBubble
                key={m.id}
                side={m.side}
                text={m.text}
                receipt={m.side === 'out' ? 'sent' : undefined}
              />
            ))
          )}
        </div>

        <div className="border-t border-line bg-surface p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
          <Composer
            value={draft}
            onChange={setDraft}
            onSend={send}
            placeholder={t.write_message}
            sendLabel={t.send}
          />
        </div>
      </div>
    </div>
  );
}
