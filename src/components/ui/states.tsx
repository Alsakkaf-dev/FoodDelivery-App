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
