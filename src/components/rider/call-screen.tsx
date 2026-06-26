'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CallControls } from '@/components/ui';
import { Icon } from '@/components/icons';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';

/**
 * Delivery Man — Call screen (presentational).
 * There is no telephony backend, so mute/speaker/end are visual-only states; a REAL
 * `tel:` link preserves the actual call affordance (no broken/fake flow, AUTH_DISABLED).
 * Full-screen immersive surface: `fixed inset-0 z-[45]` sits in the modal band
 * (BottomNav 40 < 45 < OfflineBanner 50) so it overlays the (rider) shell chrome while
 * keeping the existing z-stack order intact. `bg-ink-header` is a sanctioned immersive
 * dark surface (NOT dark mode). End-call routes back to the delivery detail.
 */
export function CallScreen({
  orderId,
  phone,
  locale,
}: {
  orderId: string;
  phone: string | null;
  locale: Locale;
}) {
  const router = useRouter();
  const t = getDictionary(locale);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const back = () => router.push(`/rider/${orderId}`);

  return (
    <div className="fixed inset-0 z-[45] flex flex-col bg-ink-header text-onColor">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-between p-6">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <span className="flex h-28 w-28 items-center justify-center rounded-full bg-white/10">
            <Icon name="user" className="h-14 w-14" aria-hidden />
          </span>
          <h1 className="text-h1 font-bold">{t.customer}</h1>
          {phone ? <p className="text-body text-onColor/70">{phone}</p> : null}
          <p className="text-caption uppercase tracking-wide text-onColor/60">{t.connecting}</p>
        </div>

        <div className="flex w-full flex-col items-center gap-6">
          {phone ? (
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-2 text-link font-bold uppercase tracking-wide text-onColor underline underline-offset-2"
            >
              <Icon name="phone" className="h-4 w-4" aria-hidden />
              {t.call}
            </a>
          ) : null}
          <CallControls
            muted={muted}
            onToggleMute={() => setMuted((m) => !m)}
            speaker={speaker}
            onToggleSpeaker={() => setSpeaker((s) => !s)}
            onEnd={back}
            muteLabel={muted ? t.unmute : t.mute}
            speakerLabel={t.speaker}
            endLabel={t.end_call}
          />
        </div>
      </div>
    </div>
  );
}
