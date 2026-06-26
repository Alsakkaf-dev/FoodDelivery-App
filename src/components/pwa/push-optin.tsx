'use client';
import { useEffect, useState } from 'react';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { PrimaryButton, TextAction, IconChip } from '@/components/ui';

// Web Push opt-in (FR-S-11 / FR-C-13). On tap: request Notification permission,
// subscribe via pushManager with the VAPID public key, and POST the subscription
// to /api/push/subscribe (the task-4-1 fallback channel). Hidden once enabled or
// where push is unsupported. Bilingual + ≥44px. The permission/subscribe flow and
// the /api/push/subscribe payload are a FROZEN behavior contract — restyle only.

/** Convert a base64url VAPID public key to the Uint8Array pushManager expects. */
export function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}

export function PushOptIn({ lang }: { lang: 'en' | 'ar' }) {
  const t = getDictionary(lang);
  const [state, setState] = useState<'hidden' | 'idle' | 'busy'>('hidden');

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    if (!supported) return; // stays hidden
    if (Notification.permission === 'default') setState('idle');
  }, []);

  if (state === 'hidden') return null;

  async function enable() {
    const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!key) return;
    setState('busy');
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        setState('idle');
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key) as unknown as BufferSource,
      });
      const json = sub.toJSON();
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: json.endpoint, keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth } }),
      });
      setState('hidden'); // subscribed — nothing more to show
    } catch {
      setState('idle');
    }
  }

  // Permission-card, pinned above the floating BottomNav. z-40 per the z-stack
  // (BottomNav/PushOptIn 40 < OfflineBanner 50 < InstallPrompt 60). The bottom
  // offset clears the nav; #04 to publish the exact nav height (see ledger).
  return (
    <div
      className="fixed inset-x-0 bottom-[6.5rem] z-40 mx-auto max-w-md px-4"
      role="dialog"
      aria-label={t.enable_notifications}
    >
      <div className="rounded-2xl bg-surface p-4 shadow-card">
        <div className="flex items-start gap-3">
          <IconChip icon="bell" tone="brand" />
          <div className="min-w-0 flex-1">
            <p className="text-title text-ink">{t.enable_notifications}</p>
            <p className="mt-0.5 text-body">{t.notifications_hint}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <PrimaryButton fullWidth loading={state === 'busy'} onClick={enable}>
            {t.enable_notifications}
          </PrimaryButton>
          <div className="flex justify-center">
            <TextAction tone="brand" onClick={() => setState('hidden')}>
              {t.dismiss}
            </TextAction>
          </div>
        </div>
      </div>
    </div>
  );
}
