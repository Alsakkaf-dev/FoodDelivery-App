'use client';
import { useTransition } from 'react';

// CMP-U-08 — Stepper (quantity ±).
export function Stepper({
  value, onChange, min = 0, max = 50,
}: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div className="inline-flex items-center gap-2">
      <button className="btn-secondary h-9 w-9 !p-0" aria-label="decrease" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>−</button>
      <span className="min-w-[2ch] text-center font-semibold tabular-nums">{value}</span>
      <button className="btn-secondary h-9 w-9 !p-0" aria-label="increase" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>+</button>
    </div>
  );
}

// Language toggle — flips the NEXT_LOCALE cookie and reloads (FR-C-14).
export function LangToggle({ current }: { current: 'en' | 'ar' }) {
  const [pending, start] = useTransition();
  const next = current === 'en' ? 'ar' : 'en';
  function switchLang() {
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000`;
    start(() => window.location.reload());
  }
  return (
    <button className="chip border-line" onClick={switchLang} disabled={pending} aria-label="switch language">
      {next === 'ar' ? 'العربية' : 'English'}
    </button>
  );
}
