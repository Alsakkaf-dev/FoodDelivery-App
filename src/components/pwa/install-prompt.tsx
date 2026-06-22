'use client';
import { useEffect, useState } from 'react';
import { getDictionary } from '@/lib/i18n/dictionaries';

// A2HS install prompt (EP-13). Captures `beforeinstallprompt`, then shows a
// dismissible bilingual banner with an Install button that calls prompt().
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

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] mx-auto max-w-md p-3" role="dialog" aria-label={t.install_app}>
      <div className="card flex items-center gap-3 shadow-lg">
        <span className="text-2xl" aria-hidden>
          🌯
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate">{t.install_app}</p>
          <p className="text-caption text-muted">{t.install_hint}</p>
        </div>
        <button type="button" className="btn-primary min-h-tap" onClick={install}>
          {t.install_app}
        </button>
        <button type="button" className="btn-ghost min-h-tap min-w-tap !p-0" aria-label={t.dismiss} onClick={() => setDismissed(true)}>
          ✕
        </button>
      </div>
    </div>
  );
}
