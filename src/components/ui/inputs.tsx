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
export function OtpInput({
  length = 4,
  value,
  onChange,
  onResend,
  resendLabel = 'Resend',
  resendSeconds = 30,
  formatResendIn = (s) => `Resend in ${s}s`,
  autoFocus,
  inputMode = 'numeric',
}: {
  length?: number;
  value: string;
  onChange: (v: string) => void;
  onResend?: () => void;
  resendLabel?: string;
  resendSeconds?: number;
  formatResendIn?: (s: number) => string;
  autoFocus?: boolean;
  inputMode?: 'numeric' | 'text';
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const [left, setLeft] = useState(resendSeconds);

  useEffect(() => {
    if (left <= 0) return;
    const t = setInterval(() => setLeft((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, [left]);

  function setAt(i: number, ch: string) {
    const next = value.split('');
    next[i] = ch;
    onChange(next.join('').slice(0, length));
    if (ch && i < length - 1) refs.current[i + 1]?.focus();
  }

  return (
    <div>
      {/* dir=ltr keeps cell order stable; the row still sits within an RTL layout. */}
      <div className="flex justify-center gap-3" dir="ltr">
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            autoFocus={autoFocus && i === 0}
            inputMode={inputMode}
            maxLength={1}
            aria-label={`digit ${i + 1}`}
            value={value[i] ?? ''}
            onChange={(e) => setAt(i, e.target.value.replace(/\D/g, '').slice(-1))}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus();
            }}
            className="h-14 w-12 rounded-md bg-surface-input text-center text-h2 font-bold text-ink outline-none transition focus:ring-2 focus:ring-brand/40"
          />
        ))}
      </div>
      <div className="mt-4 text-center">
        {left > 0 ? (
          <span className="text-sm text-muted">{formatResendIn(left)}</span>
        ) : (
          <button
            type="button"
            onClick={() => { onResend?.(); setLeft(resendSeconds); }}
            className="min-h-tap text-link font-bold uppercase tracking-wide text-brand underline underline-offset-2"
          >
            {resendLabel}
          </button>
        )}
      </div>
    </div>
  );
}

/** Checkbox — rounded-square with an orange fill + white check when selected. */
export function Checkbox({
  checked, onChange, label, disabled, id, className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
}) {
  const autoId = useId();
  return (
    <label htmlFor={id ?? autoId} className={cx('inline-flex min-h-tap cursor-pointer select-none items-center gap-2.5', disabled && 'opacity-50', className)}>
      <input
        id={id ?? autoId}
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        className={cx(
          'flex h-5 w-5 items-center justify-center rounded-sm border-2 transition peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40',
          checked ? 'border-brand bg-brand text-onColor' : 'border-line bg-white',
        )}
        aria-hidden
      >
        {checked ? <Icon name="check" className="h-3.5 w-3.5" /> : null}
      </span>
      {label ? <span className="text-sm text-body">{label}</span> : null}
    </label>
  );
}

/** UploadTile — dashed drop tile wrapping a hidden file input (proof #11, photo #16). */
