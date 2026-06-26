import { describe, it, expect } from 'vitest';
import config from '../../tailwind.config';

/**
 * WCAG 2.x contrast audit — Engineer #20 (Visual QA / A11y).
 *
 * Source of truth: the REAL token hexes #01 shipped in `tailwind.config.ts`
 * (no hardcoded palette here — if #01 retunes a token, this test re-reads it).
 *
 * This is the automated half of the contrast sweep. It (a) proves the contrast
 * math, (b) locks the high-contrast pairs that MUST stay AA (regression guard),
 * and (c) asserts every token pair that falls below AA is tracked as a logged
 * defect (QA-00x in QA/DEFECT_LOG.md). A NEW sub-AA usage that isn't enumerated
 * here fails the suite until triaged; the known brand-level findings stay green.
 */

const colors = (config.theme?.extend?.colors ?? {}) as Record<string, unknown>;
function token(path: string): string {
  const [key, sub] = path.split('.') as [string, string?];
  const group = colors[key];
  const value = sub == null ? group : (group as Record<string, unknown> | undefined)?.[sub];
  if (typeof value !== 'string') throw new Error(`token "${path}" missing from tailwind.config.ts`);
  return value;
}

// ── WCAG relative luminance + contrast ratio ───────────────────────────────
function luminance(hexColor: string): number {
  const hex = hexColor.replace('#', '');
  const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
  const channel = (offset: number): number => {
    const v = parseInt(full.slice(offset, offset + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}
export function contrastRatio(a: string, b: string): number {
  const lumA = luminance(a);
  const lumB = luminance(b);
  const hi = Math.max(lumA, lumB);
  const lo = Math.min(lumA, lumB);
  return (hi + 0.05) / (lo + 0.05);
}

const WHITE = '#FFFFFF';
const round = (n: number): number => Math.round(n * 100) / 100;

// AA thresholds: 4.5 normal text · 3.0 large/bold text & graphical objects.
const AA_NORMAL = 4.5;
const AA_LARGE = 3.0;

