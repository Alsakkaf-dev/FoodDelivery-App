# Build Progress

Each scheduled task ticks its box here and appends a short note (its own commit).
Status: ☐ not started · ◐ in progress · ✅ done · ⚠ blocked (see note).

## Foundation
- ✅ Seed scaffold committed one-file-per-commit (77 commits) and pushed to `main`.
- ✅ `npm install` + `npm run typecheck` green (fixed Supabase cookie typings).

## Day 1 — 2026-06-22
- ☐ 1-1 Foundation audit & green baseline
- ☐ 1-2 Design tokens + shared UI + 4 states + RTL
- ☐ 1-3 App shell & role layouts + bottom nav
- ☐ 1-4 i18n completeness + language switcher
- ✅ 1-5 Customer Home / Live Status — built early (interactive session); verify & polish only, do NOT rebuild

## Day 2 — 2026-06-23
- ✅ 2-1 Menu list + item detail — built early (interactive session); verify & polish only, do NOT rebuild
- ☐ 2-2 Cart
- ☐ 2-3 Checkout: fulfilment + zone + address
- ☐ 2-4 Checkout: payment + gate + place order
- ☐ 2-5 Confirmation + tracking + history

## Day 3 — 2026-06-24
- ☐ 3-1 Dashboard + one-tap Open/Close/Sold-Out
- ☐ 3-2 Daily setup (qty/cutoff/window/zones)
- ☐ 3-3 Menu manager
- ☐ 3-4 Live order board
- ☐ 3-5 Order detail / verify / refuse / broadcast / EOD

## Day 4 — 2026-06-25
- ☐ 4-1 Notifications end-to-end
- ☐ 4-2 Realtime correctness
- ☐ 4-3 Rider flow completion & polish
- ☐ 4-4 Automation & inventory integrity
- ☐ 4-5 PWA shell / offline / install / push

## Day 5 — 2026-06-26
- ☐ 5-1 Unit tests (Vitest)
- ☐ 5-2 E2E tests (Playwright)
- ☐ 5-3 Security + a11y + PDPA hardening
- ☐ 5-4 Deploy-prep (env/CI/config/README)
- ☐ 5-5 Final integration + handover + release tag

---
## Notes log
- (foundation) Base green on Node; Next 14.2.15 has a flagged security advisory — bump to patched 14.2.x in task 5-3.
- (21 Jun · interactive session) Built early & pushed — verify/polish only, do NOT rebuild: middleware env-guard (app boots without Supabase env); login phone normalize (strips spaces/dashes); Customer Home `/` (SCR-C-01) + `customer/status-hero`; Menu `/menu` + `/menu/[id]` (SCR-C-02/03) + `customer/menu-card`. Added `supabase/setup.sql` (combined schema+seed). `.env.local` exists locally with real Supabase (new `sb_publishable`/`sb_secret` keys mapped onto NEXT_PUBLIC_SUPABASE_* / SUPABASE_SERVICE_ROLE_KEY — keep this mapping; do NOT switch to @supabase/server). Pending owner action: run setup.sql in Supabase SQL editor; configure a phone provider/test number for OTP.
