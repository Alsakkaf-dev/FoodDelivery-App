// All trading logic is in MYT (UTC+8). Trading hours 13:00–19:00 (locked fact §4).
export const TZ = 'Asia/Kuala_Lumpur';
export const OPEN_HOUR = 13; // 1 PM
export const CLOSE_HOUR = 19; // 7 PM

/** Current wall-clock parts in MYT, independent of server TZ. */
export function nowMyt(): { date: string; hour: number; minute: number; time: string } {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(new Date()).map((p) => [p.type, p.value]));
  const hour = Number(parts.hour);
  const minute = Number(parts.minute);
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour,
    minute,
    time: `${parts.hour}:${parts.minute}`,
  };
}

/** Whether the given (default: current) MYT time is inside trading hours. */
export function withinTradingHours(now: { hour: number } = nowMyt()): boolean {
  return now.hour >= OPEN_HOUR && now.hour < CLOSE_HOUR;
}

/** True if `hhmm` (e.g. "18:00") cut-off has passed at the given (default: now) MYT time. */
export function pastCutoff(cutoff: string | null, now: { time: string } = nowMyt()): boolean {
  if (!cutoff) return false;
  return now.time > cutoff.slice(0, 5);
}

/** Short localized MYT date + time for order rows, e.g. "18 Jun, 1:40 PM". */
export function formatMyt(iso: string, locale: 'en' | 'ar' = 'en'): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-MY' : 'en-MY', {
    timeZone: TZ,
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso));
}
