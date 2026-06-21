'use client';
import { useEffect, useState } from 'react';

// The four mandatory UI states for every screen (D-15 §5).

export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted" role="status" aria-live="polite">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-rust" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ title, hint, icon = '🍽️' }: { title: string; hint?: string; icon?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <div className="text-4xl" aria-hidden>{icon}</div>
      <p className="font-semibold text-slate">{title}</p>
      {hint ? <p className="max-w-xs text-sm text-muted">{hint}</p> : null}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center" role="alert">
      <div className="text-4xl" aria-hidden>⚠️</div>
      <p className="max-w-xs text-slate">{message}</p>
      {onRetry ? (
        <button className="btn-secondary" onClick={onRetry}>Try again</button>
      ) : null}
    </div>
  );
}

export function OfflineBanner({ label = 'You are offline. Showing the last known status.' }: { label?: string }) {
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const up = () => setOffline(!navigator.onLine);
    up();
    window.addEventListener('online', up);
    window.addEventListener('offline', up);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', up);
    };
  }, []);
  if (!offline) return null;
  return (
    <div className="sticky top-0 z-50 bg-soldout px-4 py-2 text-center text-sm font-semibold text-white">
      {label}
    </div>
  );
}
