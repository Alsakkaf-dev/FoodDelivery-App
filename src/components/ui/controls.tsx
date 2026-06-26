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
