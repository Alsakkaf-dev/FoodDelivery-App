'use client';
import { useRouter } from 'next/navigation';
import { IconButton } from '@/components/ui';

// Shared back-header for the account / addresses / notifications / messages
// screens: a circular back button (RTL-mirroring chevron, baked into #05's
// `chevron-start` glyph) + centered-weight title + an optional trailing action
// (e.g. the "EDIT" TextAction on Personal Info). Title + labels arrive as
// already-localized strings from the server page; this stays copy-agnostic.
export function PageHeader({
  title,
  backLabel,
  action,
}: {
  title: string;
  backLabel: string;
  action?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <header className="flex items-center gap-3">
      <IconButton variant="nav" icon="chevron-start" aria-label={backLabel} onClick={() => router.back()} />
      <h1 className="min-w-0 flex-1 truncate text-headerTitle font-bold text-ink">{title}</h1>
      {action ? <div className="ms-auto shrink-0">{action}</div> : null}
    </header>
  );
}
