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

/** Whether the current MYT time is inside trading hours. */
export function withinTradingHours(): boolean {
  const { hour } = nowMyt();
  return hour >= OPEN_HOUR && hour < CLOSE_HOUR;
}

/** True if `hhmm` (e.g. "18:00") cut-off has passed in MYT. */
export function pastCutoff(cutoff: string | null): boolean {
  if (!cutoff) return false;
  const { time } = nowMyt();
  return time > cutoff.slice(0, 5);
}
