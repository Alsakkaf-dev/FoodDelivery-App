import type { ReactNode } from 'react';
import { Icon } from '@/components/icons';
import { cx } from './cx';

// Plan 02 — RatingRow. Read-only by default (renders an img-role star row); becomes an
// interactive radiogroup when `onChange` is provided (each star a ≥44px tap target).
// Filled stars use the `star` token, empties `star-off`. Token-driven, RTL-safe.

const DIM = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-7 w-7' } as const;

export function RatingRow({
  value, max = 5, onChange, size = 'md', label, className,
}: {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  label?: ReactNode;
  className?: string;
}) {
  const interactive = !!onChange;
  const dim = DIM[size];
  return (
    <div
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={typeof label === 'string' ? label : `rating ${value} of ${max}`}
      className={cx('inline-flex items-center gap-1', className)}
    >
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.round(value);
        const star = (
          <Icon name={filled ? 'star-filled' : 'star'} className={cx(dim, filled ? 'text-star' : 'text-star-off')} aria-hidden />
        );
        if (interactive) {
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={i + 1 === Math.round(value)}
              aria-label={`${i + 1}`}
              onClick={() => onChange?.(i + 1)}
              className="flex min-h-tap min-w-tap items-center justify-center"
            >
              {star}
            </button>
          );
        }
        return <span key={i}>{star}</span>;
      })}
    </div>
  );
}
