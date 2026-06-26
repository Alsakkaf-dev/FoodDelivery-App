import type { ReactNode } from 'react';
import { Icon } from '@/components/icons';
import { cx } from './cx';

// Plan 02 — SuccessScreen (R-3: #11 payment success, #16 withdraw). Two tiers:
//  • rich  — full-bleed illustration slot (#05 supplies wallet+confetti art) + display title.
//  • lite  — compact check-circle + title (inline confirmations).
// Copy-agnostic (title/subtitle/action via props). Token-driven; the illustration carries
// any confetti, so motion/celebration stays with #05/#18. No dark mode.

export function SuccessScreen({
  title, subtitle, action, illustration, tier = 'rich', className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  illustration?: ReactNode;
  tier?: 'rich' | 'lite';
  className?: string;
}) {
  if (tier === 'lite') {
    return (
      <div className={cx('flex flex-col items-center justify-center gap-3 py-12 text-center', className)}>
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success" aria-hidden>
          <Icon name="check-circle" className="h-9 w-9" />
        </span>
        <h1 className="text-h1 font-extrabold text-ink">{title}</h1>
        {subtitle ? <p className="max-w-xs text-sm text-muted">{subtitle}</p> : null}
        {action ? <div className="mt-4 w-full max-w-sm">{action}</div> : null}
      </div>
    );
  }
  return (
    <div className={cx('flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center', className)}>
      {illustration ? <div className="mb-2" aria-hidden>{illustration}</div> : null}
      <h1 className="text-display font-extrabold text-ink">{title}</h1>
      {subtitle ? <p className="max-w-xs text-body text-muted">{subtitle}</p> : null}
      {action ? <div className="mt-6 w-full max-w-sm">{action}</div> : null}
    </div>
  );
}
