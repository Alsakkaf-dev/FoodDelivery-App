import { describe, it, expect } from 'vitest';
import { sumLines, formatMYR } from '@/lib/utils/money';

describe('sumLines', () => {
  it('sums qty × unit_price across lines', () => {
    expect(sumLines([{ qty: 2, unit_price: 5 }, { qty: 1, unit_price: 3.5 }])).toBe(13.5);
  });
  it('is 0 for an empty cart', () => {
    expect(sumLines([])).toBe(0);
  });
});

describe('formatMYR', () => {
  it('formats two decimals for en', () => {
    const s = formatMYR(12.5, 'en');
    expect(s).toMatch(/12\.50/);
    expect(s).toMatch(/RM|MYR/);
  });
  it('returns a non-empty localized string for ar', () => {
    const s = formatMYR(12.5, 'ar');
    expect(typeof s).toBe('string');
    expect(s.length).toBeGreaterThan(0);
  });
  it('defaults to en when no locale is given', () => {
    expect(formatMYR(0)).toMatch(/0\.00/);
  });
});
