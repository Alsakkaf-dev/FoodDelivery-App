'use client';
import { useEffect, useState } from 'react';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { PrimaryButton, IconButton } from '@/components/ui';

// A2HS install prompt (EP-13). Captures `beforeinstallprompt`, then shows a
// dismissible bilingual bottom-sheet with an Install button that calls prompt().
// Logic (capture + install) is a FROZEN behavior contract — restyle only.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export function InstallPrompt({ lang }: { lang: 'en' | 'ar' }) {
  const t = getDictionary(lang);
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault(); // suppress the mini-infobar; we present our own UI
      setEvt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!evt || dismissed) return null;

  async function install() {
    if (!evt) return;
    await evt.prompt();
    setEvt(null);
  }

  // z-[60] (top of the stack: BottomNav/PushOptIn 40 < OfflineBanner 50 < InstallPrompt 60).
  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] mx-auto max-w-md" role="dialog" aria-label={t.install_app}>
      <div className="rounded-t-3xl bg-surface px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-sheet">
        <div className="flex items-start gap-3">
          {/* App mark — the real PWA icon (brand). Decorative; the title carries meaning. */}
          <img src="/icons/icon-192.png" alt="" aria-hidden className="h-12 w-12 shrink-0 rounded-2xl" />
          <div className="min-w-0 flex-1">
            <p className="text-title text-ink">{t.install_app}</p>
            <p className="mt-0.5 text-caption text-muted">{t.install_hint}</p>
          </div>
          <IconButton variant="nav" icon="close" aria-label={t.dismiss} onClick={() => setDismissed(true)} />
        </div>
        <div className="mt-4">
          <PrimaryButton fullWidth onClick={install}>{t.install_app}</PrimaryButton>
        </div>
      </div>
    </div>
  );
}
