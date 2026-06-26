// Small presentational bits shared across the auth/onboarding screens (#06).
// Pure (no hooks/state) so they compose safely inside server OR client trees.
// Token-driven only — no hardcoded hex/radii/shadow (consumes #01 tokens).
import type { ReactNode } from 'react';

/** Inline error alert (matches the legacy login error block, restyled). */
export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-md bg-danger/10 p-3 text-center text-caption text-danger">
      {children}
    </p>
  );
}

/** Honest "this is preview-only / coming soon" status notice (no fake success). */
export function PreviewNote({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="rounded-md bg-brand-faint p-3 text-center text-caption text-body">
      {children}
    </p>
  );
}

/** Hairline "Or" divider between the primary CTA and the social row. */
export function Divider({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-caption text-muted">
      <span className="h-px flex-1 bg-line" aria-hidden />
      {label ? <span>{label}</span> : null}
      <span className="h-px flex-1 bg-line" aria-hidden />
    </div>
  );
}
