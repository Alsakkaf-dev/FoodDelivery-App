import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Icon, type IconName } from '@/components/icons';
import { cx } from './cx';

// Plan 02 — Button family. All token-driven (no hardcoded hex/px-radii/shadow),
// ≥44px tap targets, RTL via logical props (directional icons auto-mirror inside
// <Icon/>). Copy is caller-supplied. Press feedback is CSS-only + motion-safe.

type Variant = 'primary' | 'outline' | 'ghostOnColor';

interface BaseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
  loading?: boolean;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  children?: ReactNode;
}

const SIZING = 'inline-flex h-14 items-center justify-center gap-2 rounded-lg px-6 text-button font-bold uppercase tracking-wide transition active:scale-[.98] disabled:opacity-50 disabled:pointer-events-none motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40';

const VARIANT: Record<Variant, string> = {
  primary: 'bg-brand text-onColor hover:bg-brand-deep',
  outline: 'border border-brand bg-transparent text-brand hover:bg-brand-faint',
  ghostOnColor: 'border border-onColor/70 bg-transparent text-onColor hover:bg-white/10',
};

function Spinner() {
  return <span className="h-5 w-5 animate-spin rounded-full border-2 border-current/30 border-t-current" aria-hidden />;
}

function makeButton(variant: Variant, displayName: string, extra?: string) {
  const Cmp = forwardRef<HTMLButtonElement, BaseProps>(function Btn(
    { fullWidth, loading, leadingIcon, trailingIcon, className, children, disabled, type = 'button', ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cx(SIZING, VARIANT[variant], extra, fullWidth && 'w-full', className)}
        {...rest}
      >
        {loading ? <Spinner /> : leadingIcon ? <Icon name={leadingIcon} className="h-5 w-5" aria-hidden /> : null}
        {children}
        {!loading && trailingIcon ? <Icon name={trailingIcon} className="h-5 w-5" aria-hidden /> : null}
      </button>
    );
  });
  Cmp.displayName = displayName;
  return Cmp;
}

/** Primary orange CTA (uppercase, 56px, lg radius). */
export const PrimaryButton = makeButton('primary', 'PrimaryButton');
/** Outline button (orange border + label). Pass `dashed` for the "+ ADD NEW" variant. */
export const OutlineButton = forwardRef<HTMLButtonElement, BaseProps & { dashed?: boolean }>(
  function OutlineButton({ dashed, className, ...rest }, ref) {
    return <ButtonOutlineInner ref={ref} className={cx(dashed && 'border-dashed', className)} {...rest} />;
  },
);
const ButtonOutlineInner = makeButton('outline', 'OutlineButtonInner');
/** Transparent button with white border/text — for orange/gradient surfaces. */
export const GhostOnColor = makeButton('ghostOnColor', 'GhostOnColor');

/**
 * TextAction — uppercase orange/green link action (e.g. "EDIT", "SIGN UP", "DONE").
 * Renders an <a> when `href` is set, else a <button>. Trailing icon auto-mirrors (RTL).
 */
