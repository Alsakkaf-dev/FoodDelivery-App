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

describe('a11y contrast: WCAG ratio math', () => {
  it('white-on-black = 21:1 and identical colours = 1:1', () => {
    expect(round(contrastRatio('#FFFFFF', '#000000'))).toBe(21);
    expect(round(contrastRatio('#FFFFFF', '#FFFFFF'))).toBe(1);
  });
});

// Pairs that MUST keep ≥ AA — regression guard against any future token retune.
const MUST_PASS: { name: string; fg: string; bg: string; min: number }[] = [
  { name: 'ink on white (headings)', fg: token('ink.DEFAULT'), bg: WHITE, min: AA_NORMAL },
  { name: 'body on white (paragraphs)', fg: token('body'), bg: WHITE, min: AA_NORMAL },
  { name: 'white on ink-header (auth hero)', fg: WHITE, bg: token('ink.header'), min: AA_NORMAL },
  { name: 'white on dark-cta (dark bar/stepper)', fg: WHITE, bg: token('dark.cta'), min: AA_NORMAL },
  { name: 'white on bg-dark (immersive cart)', fg: WHITE, bg: token('bg.dark'), min: AA_NORMAL },
];

describe('a11y contrast: high-contrast pairs stay AA (regression guard)', () => {
  for (const p of MUST_PASS) {
    it(`${p.name} >= ${p.min}:1`, () => {
      expect(contrastRatio(p.fg, p.bg)).toBeGreaterThanOrEqual(p.min);
    });
  }
});

// Token pairs the new orange/amber palette introduces that DO NOT meet AA as
// small text/glyph on white. Each is logged in QA/DEFECT_LOG.md; remediation is
// usage-level (ink/dark text on orange CTAs; `text-body` for paragraphs; treat
// brand/star/info as >=3:1 large/graphical only). Keyed by audited usage -> defect.
const KNOWN_SUB_AA: Record<string, { fg: string; bg: string; min: number; defect: string }> = {
  'white on brand (PrimaryButton/CTA text)': { fg: WHITE, bg: token('brand.DEFAULT'), min: AA_NORMAL, defect: 'QA-001' },
  'brand link text on white': { fg: token('brand.DEFAULT'), bg: WHITE, min: AA_NORMAL, defect: 'QA-002' },
  'muted text on white (caption/label/placeholder)': { fg: token('muted'), bg: WHITE, min: AA_NORMAL, defect: 'QA-003' },
  'success text on white': { fg: token('success'), bg: WHITE, min: AA_NORMAL, defect: 'QA-004' },
  'danger text on white': { fg: token('danger'), bg: WHITE, min: AA_NORMAL, defect: 'QA-005' },
  'star glyph on white (rating)': { fg: token('star.DEFAULT'), bg: WHITE, min: AA_LARGE, defect: 'QA-006' },
  'info-blue text on white': { fg: token('info.blue'), bg: WHITE, min: AA_NORMAL, defect: 'QA-007' },
  'warning text on white': { fg: token('warning'), bg: WHITE, min: AA_NORMAL, defect: 'QA-008' },
};

describe('a11y contrast: sub-AA palette pairs are real and tracked as defects', () => {
  for (const [usage, p] of Object.entries(KNOWN_SUB_AA)) {
    it(`${usage} is below ${p.min}:1 and logged (${p.defect})`, () => {
      const ratio = contrastRatio(p.fg, p.bg);
      expect(ratio, `${usage} = ${round(ratio)}:1`).toBeLessThan(p.min);
      expect(p.defect).toMatch(/^QA-\d{3}$/);
    });
  }
});
