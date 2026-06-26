'use client';
import {
  useEffect, useId, useRef, useState,
  type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes,
} from 'react';
import { Icon, type IconName } from '@/components/icons';
import { cx } from './cx';

// Plan 02 — Form inputs. Token-driven, ≥44px tap, RTL via logical props (label
// text-start, trailing affordance pinned to `end-0`). All copy is caller-supplied;
// the only inline strings are English fallbacks for the password-reveal aria-label
// (overridable), matching the existing ErrorState fallback pattern.

const FIELD =
  'w-full min-h-tap rounded-md bg-surface-input px-4 py-3.5 text-body text-ink placeholder:text-muted outline-none transition focus:ring-2 focus:ring-brand/30';

type FilledInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: string;
  hint?: string;
  error?: string;
  trailingIcon?: IconName;
  multiline?: boolean;
  rows?: number;
  containerClassName?: string;
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
};

/** FilledInput — gray filled field, uppercase label above, optional trailing icon /
 *  password eye-toggle, and a `multiline` textarea variant. */
export function FilledInput({
  label, hint, error, trailingIcon, multiline, rows = 4,
  id, className, containerClassName, type = 'text',
  showPasswordLabel = 'Show password', hidePasswordLabel = 'Hide password',
  ...rest
}: FilledInputProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const [reveal, setReveal] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (reveal ? 'text' : 'password') : type;
  const hasTrailing = isPassword || !!trailingIcon;
  const descId = error || hint ? `${fieldId}-desc` : undefined;

  return (
    <div className={cx('w-full', containerClassName)}>
      {label ? (
        <label htmlFor={fieldId} className="mb-2 block text-label font-semibold uppercase tracking-wide text-muted">{label}</label>
      ) : null}
      <div className="relative">
        {multiline ? (
          <textarea
            id={fieldId}
            rows={rows}
            aria-invalid={!!error || undefined}
            aria-describedby={descId}
            className={cx(FIELD, 'resize-none', error && 'ring-2 ring-danger/50', className)}
            {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            id={fieldId}
            type={inputType}
            aria-invalid={!!error || undefined}
            aria-describedby={descId}
            className={cx(FIELD, hasTrailing && 'pe-12', error && 'ring-2 ring-danger/50', className)}
            {...rest}
          />
        )}
        {isPassword ? (
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            aria-label={reveal ? hidePasswordLabel : showPasswordLabel}
            aria-pressed={reveal}
            className="absolute inset-y-0 end-0 flex min-w-tap items-center justify-center pe-3 text-muted hover:text-ink"
          >
            <Icon name={reveal ? 'eye-off' : 'eye'} className="h-5 w-5" aria-hidden />
          </button>
        ) : trailingIcon ? (
          <span className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-4 text-muted" aria-hidden>
            <Icon name={trailingIcon} className="h-5 w-5" />
          </span>
        ) : null}
      </div>
      {error ? (
        <p id={descId} className="mt-1.5 text-caption text-danger">{error}</p>
      ) : hint ? (
        <p id={descId} className="mt-1.5 text-caption text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

/** OtpInput — N rounded cells bound to a single string value + a Resend countdown. */
