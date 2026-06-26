'use client';
import { useState } from 'react';
import { ChatBubble, Composer } from '@/components/ui';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import { chatSeed, localize } from './seed';

// Customer chat thread (stretch screen) — composes the shared #02 ChatBubble +
// Composer so the rider lane (#17) can reuse the exact same composition. There is
// no messaging backend yet (see TEAM_STATUS.md), so messages come from the seed
// and the Composer does an optimistic local echo only. When the backend + a
// realtime channel land, swap the seed for the live thread and wire onSend to the
// send action; this component's shape stays the same.
export function ChatThread({ t, locale, threadId }: { t: Dictionary; locale: Locale; threadId: string }) {
  const [messages, setMessages] = useState(() => chatSeed(threadId));
  const [draft, setDraft] = useState('');

  function onSend() {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: `out-${prev.length}`, side: 'out', text: { en: text, ar: text }, time: '', receipt: 'sent' }]);
    setDraft('');
  }

  return (
    <div className="flex min-h-[60dvh] flex-col">
      <div className="flex-1 space-y-3 py-2">
        {messages.map((m) => (
          <ChatBubble key={m.id} side={m.side} text={localize(locale, m.text)} time={m.time || undefined} receipt={m.receipt} />
        ))}
      </div>
      <div className="sticky bottom-0 -mx-4 bg-surface px-4 pb-2 pt-3">
        <Composer value={draft} onChange={setDraft} onSend={onSend} placeholder={t.type_a_message} sendLabel={t.send} />
      </div>
    </div>
  );
}
