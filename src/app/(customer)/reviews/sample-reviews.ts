// Engineer #13 — PLACEHOLDER sample reviews for the Reviews screen.
//
// ⚠️ There is NO reviews backend yet: no `reviews` table, no domain action, and the
// domain layer is frozen to me. So the Reviews surface renders from this typed sample
// module purely to deliver the screen's look (overlapping-avatar cards + star rows).
// A request to add a real `reviews` table + domain read is on the TEAM_STATUS ledger;
// when it lands, replace this module with a server fetch and delete the seed.
//
// Bilingual title/body so RTL + Arabic render correctly. Avatars are intentionally
// omitted (no real photos) — the Avatar primitive shows its peach fallback.

export type Review = {
  id: string;
  author: string;
  avatarUrl?: string;
  date: string;
  rating: number;
  title_en: string;
  title_ar: string;
  body_en: string;
  body_ar: string;
};

