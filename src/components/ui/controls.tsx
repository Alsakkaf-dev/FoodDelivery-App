'use client';
import { useTransition } from 'react';
import { cx } from './cx';
import { setLocaleCookie } from './lang-switch';

// Inline ± glyphs — no #05 icon dependency so the Stepper stays test-green standalone.
function MinusGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
      <path d="M5 12h14" />
    </svg>
  );
}
function PlusGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

// CMP-U-08 — QuantityStepper (quantity ±). Re-skinned to the dark rounded pill from the
// new design (works on light surfaces e.g. Food Details and the dark Cart surface).
// Contract preserved: {value,onChange,min,max}, aria-label decrease/increase,
// min-h-tap/min-w-tap tap targets, disabled at bounds. Numerals are independent of
// dir so the −/+ keep their visual roles; flex mirrors the row under RTL automatically.
export function Stepper({
  value, onChange, min = 0, max = 50,
}: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  const btn =
    'flex min-h-tap min-w-tap items-center justify-center rounded-full text-onColor transition active:scale-95 disabled:opacity-40';
  const disc = 'flex h-9 w-9 items-center justify-center rounded-full bg-white/10';
  return (
    <div className="inline-flex items-center gap-1 rounded-pill bg-dark-cta p-1">
      <button
        type="button"
        className={btn}
        aria-label="decrease"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        <span className={disc}><MinusGlyph /></span>
      </button>
      <span className="min-w-[2ch] text-center font-bold tabular-nums text-onColor">{value}</span>
      <button
        type="button"
        className={btn}
        aria-label="increase"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        <span className={disc}><PlusGlyph /></span>
      </button>
    </div>
  );
}

// Language toggle — compact chip variant. Flips the NEXT_LOCALE cookie and
// reloads (FR-C-14) via the shared `setLocaleCookie` (the single cookie
// mechanism, defined in lang-switch.tsx — Plan 04 owns it; we only consume it).
// `LangSwitch` is the labelled variant.
export function LangToggle({ current }: { current: 'en' | 'ar' }) {
  const [pending, start] = useTransition();
  const next = current === 'en' ? 'ar' : 'en';
  function switchLang() {
    setLocaleCookie(next);
    start(() => window.location.reload());
  }
  return (
    <button className={cx('chip border-line', pending && 'opacity-50')} onClick={switchLang} disabled={pending} aria-label="switch language">
      {next === 'ar' ? 'العربية' : 'English'}
    </button>
  );
}
