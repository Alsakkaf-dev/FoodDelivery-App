import type { Locale } from '@/lib/i18n/config';
import { translate, type Dictionary } from '@/lib/i18n/dictionaries';

// ─────────────────────────────────────────────────────────────────────────────
// DEMO VIEW-MODELS (preview only — NOT the frozen db.ts types).
//
// The customer notifications-feed, the messages inbox and chat threads have NO
// backend yet (the `notifications` table is a dispatch/delivery-tracking log, and
// there is no messages/conversations table or realtime channel — see the
// consolidated backend request in TEAM_STATUS.md). To ship a deploy-ready demo
// these screens render from the clearly-labeled seed below. Profile + addresses
// use the REAL reads (getProfile / listAddresses). When the backend lands, swap
// these arrays for the live read; the row components stay unchanged.
//
// Row CONTENT (people, message text) is data, so it carries its own en/ar (kept
// out of the dictionary, which is for UI chrome). Screen chrome uses t.<key>.
// ─────────────────────────────────────────────────────────────────────────────

/** A bilingual demo string — picked by the active locale. */
export interface Localized {
  en: string;
  ar: string;
}

export function localize(locale: Locale, v: Localized): string {
  return locale === 'ar' ? v.ar : v.en;
}

/** Relative timestamp from "minutes ago" using the shared dictionary keys. */
export function relTime(t: Dictionary, minsAgo: number): string {
  if (minsAgo < 60) return translate(t, 'time_min_ago', { n: String(minsAgo) });
  return translate(t, 'time_hr_ago', { n: String(Math.floor(minsAgo / 60)) });
}

export interface NotificationVM {
  id: string;
  person: string;
  action: Localized;
  minsAgo: number;
}

export interface MessageVM {
  id: string;
  threadId: string;
  person: string;
  preview: Localized;
  at: string; // wall-clock label, e.g. "19:37"
  unread: number; // 0 = read
  presence: 'online' | 'offline';
}
