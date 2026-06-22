import { describe, it, expect, vi, afterEach } from 'vitest';
import { withinTradingHours, pastCutoff, nowMyt, OPEN_HOUR, CLOSE_HOUR } from '@/lib/utils/time';

// MYT (UTC+8) trading window 13:00–19:00. Mock the clock to test boundaries
// deterministically; nowMyt() converts the fixed instant to MYT wall-clock.
afterEach(() => vi.useRealTimers());
function atUtc(iso: string) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(iso));
}

describe('trading-hours constants', () => {
  it('open 13:00, close 19:00', () => {
    expect(OPEN_HOUR).toBe(13);
    expect(CLOSE_HOUR).toBe(19);
  });
});

describe('nowMyt + withinTradingHours (real clock path)', () => {
  it('reports MYT 14:00 as within trading hours', () => {
    atUtc('2026-06-26T06:00:00Z'); // 14:00 MYT
    expect(nowMyt().hour).toBe(14);
    expect(withinTradingHours()).toBe(true);
  });
  it('is closed before open (12:30 MYT) and at/after close (19:00, 20:00 MYT)', () => {
    atUtc('2026-06-26T04:30:00Z'); // 12:30 MYT
    expect(withinTradingHours()).toBe(false);
    atUtc('2026-06-26T11:00:00Z'); // 19:00 MYT — closed at the boundary
    expect(nowMyt().hour).toBe(19);
    expect(withinTradingHours()).toBe(false);
    atUtc('2026-06-26T12:00:00Z'); // 20:00 MYT
    expect(withinTradingHours()).toBe(false);
  });
});

describe('pastCutoff (HH:MM compare)', () => {
  it('passes only after the cut-off, and null never blocks', () => {
    atUtc('2026-06-26T10:30:00Z'); // 18:30 MYT
    expect(pastCutoff('18:00')).toBe(true);
    expect(pastCutoff('19:00')).toBe(false);
    expect(pastCutoff(null)).toBe(false);
  });
});
