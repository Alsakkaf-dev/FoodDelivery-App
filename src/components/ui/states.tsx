'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { cx } from './cx';

// The four mandatory UI states for every screen (D-15 §5). Re-skinned to the new
// palette (Plan 02). All copy is caller-supplied (feature engineers pass t.<key>);
// the only inline string is ErrorState's localized retry fallback (kept from the
// existing pattern). ui-primitives.test.ts assertions are all preserved.

export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted" role="status" aria-live="polite">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-brand" />
      <span>{label}</span>
    </div>
  );
}

// Skeleton — content-shaped loading placeholder (D-15 §5, Fig. 16-4 loading state).
// Renders exactly `lines` shimmer bars (ui-primitives.test.ts counts animate-pulse == lines).
export function Skeleton({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={cx('space-y-3', className)} role="status" aria-busy="true" aria-live="polite">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-5 w-full animate-pulse rounded-md bg-surface-input" aria-hidden />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

// EmptyState — illustration/icon + title + hint + optional action (new design adds the
// `illustration` + `action` slots). `title` + `hint` kept as the asserted contract;
// `icon` widened to ReactNode (string emoji stays valid) for back-compat.
export function EmptyState({
  title, hint, icon = '🍽️', illustration, action,
}: { title: string; hint?: string; icon?: ReactNode; illustration?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      {illustration ? (
        <div className="mb-2" aria-hidden>{illustration}</div>
      ) : (
        <div className="text-5xl" aria-hidden>{icon}</div>
      )}
      <p className="text-title font-bold text-ink">{title}</p>
      {hint ? <p className="max-w-xs text-sm text-muted">{hint}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

function AlertGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 9v4M12 17h.01M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z" />
    </svg>
  );
}

export function ErrorState({ message, onRetry, retryLabel }: { message: string; onRetry?: () => void; retryLabel?: string }) {
  // Localise the retry label (the only user-facing string this primitive owns) so
  // AR users don't see English on every error. Read <html lang> set by the root
  // layout, post-mount to avoid a hydration mismatch; callers may pass `retryLabel`
  // to override. Matches the inline AR/EN pattern used across the customer screens.
  const [retry, setRetry] = useState(retryLabel ?? 'Try again');
  useEffect(() => {
    if (retryLabel) return;
    setRetry(document.documentElement.lang === 'ar' ? 'حاول مرة أخرى' : 'Try again');
  }, [retryLabel]);
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center" role="alert">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger" aria-hidden>
        <AlertGlyph />
      </span>
      <p className="max-w-xs text-ink">{message}</p>
      {onRetry ? (
        <button className="btn-secondary" onClick={onRetry}>{retry}</button>
      ) : null}
    </div>
  );
}

