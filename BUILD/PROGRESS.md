# Build Progress

Each scheduled task ticks its box here and appends a short note (its own commit).
Status: ☐ not started · ◐ in progress · ✅ done · ⚠ blocked (see note).

## LOCAL RUN — bring a fresh clone up (one page)
Prereqs: Node ≥ 18.18, npm, and the Supabase CLI (`npm i -g supabase`) for db tasks.
1. **Install:** `npm install`
2. **Env:** `cp .env.example .env.local` and fill Supabase URL + keys (and optionally WhatsApp/VAPID).
   The app boots without Supabase env for UI work — auth/db calls just no-op/redirect.
   Keys needed: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
3. **DB schema:** either `npm run db:migrate` (applies `supabase/migrations/000{1,2,3}_*.sql` via
   `supabase db push`) **or** paste `supabase/setup.sql` into the Supabase SQL editor (combined schema+seed).
4. **Seed:** `npm run db:seed` (idempotent — zones, sample menu, today's closed session).
5. **Dev:** `npm run dev` → http://localhost:3000  (Customer `/`, Menu `/menu`, Rider `/rider`, Login `/login`).
6. **Verify green:** `npm run typecheck` · `npm run lint` · `npm run test:unit`.
Auth setup (free, no paid SMS): see `BUILD/AUTH_SETUP.md` — Email OTP works locally now; WhatsApp OTP is deploy-gated.

## Baseline green (task 1-1) — verified 2026-06-22
- [x] `npm install` · `npm run typecheck` · `npm run lint` · `npm run test:unit` all green.
- [x] Auth loads: `api/auth/otp/{request,verify}` import cleanly; verify writes `consent_at` (US-007)
      and returns `{ role, lang }`; request maps rate errors → HTTP 429 (US-006).
- [x] Middleware guards `/operator` `/rider` `/checkout` `/history`; unauth → `/login?next=`,
      wrong-role → `/`; `requireRole`/`homeForRole`/`RoleError` exported by `src/lib/auth/roles.ts` (US-003/004).
- [x] Single active session in DB: `daily_session.session_date … unique` + partial unique index
      `one_open_session … where status='open'` in `0001_init.sql` (US-030 / FR-S-06).
- [x] i18n loads: `getI18n()`/`getLocale()` read `NEXT_LOCALE` cookie; `messages/en.json` + `ar.json`
      parse and AR mirrors EN exactly (58 keys, asserted in the smoke test).
- [x] Dev seed runs idempotently (`supabase/seed.sql`); `.env.example` covers every `process.env` key used in `src`.
- Smoke test: `tests/unit/foundation.test.ts` (10 assertions — i18n config/dictionaries, AR↔EN mirror, role helpers).

## Foundation
- ✅ Seed scaffold committed one-file-per-commit (77 commits) and pushed to `main`.
- ✅ `npm install` + `npm run typecheck` green (fixed Supabase cookie typings).

## Day 1 — 2026-06-22
- ✅ 1-1 Foundation audit & green baseline
- ✅ 1-2 Design tokens + shared UI + 4 states + RTL
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
- (21 Jun · interactive session) AUTH = two free channels, no paid SMS provider — keep this design: (a) **Email OTP** (`/api/auth/email/{request,verify}`, Supabase built-in, works now); (b) **WhatsApp OTP** via Supabase **Send-SMS hook** → `/api/auth/sms-hook` delivers the code over WhatsApp (phone `signInWithOtp`/`verifyOtp` flow UNCHANGED; Supabase owns the session — do NOT switch to a custom session/JWT). Login page has a Phone/Email toggle. Full steps in `BUILD/AUTH_SETUP.md`. WhatsApp is deploy-gated (Supabase can't reach localhost).
- (22 Jun · task 1-2) Design system locked: audited tokens vs Fig.16-2 — added the D-15 **type scale** (`text-h1/h2/title/body/caption`) and the **teal #2E8B7B** status accent to `tailwind.config.ts`; added `.btn-ghost` to `globals.css` (Primary/Secondary/Ghost/Rider buttons now complete — Rider keeps `.btn-open` green). Added **Skeleton** loader to `states.tsx` (Fig.16-4 shows skeleton ≠ spinner). Fixed **Stepper** tap targets 36→44px (`min-h-tap min-w-tap`). RTL audit: no hard left/right in `src/components/ui/*` (all flex/logical), `html[dir='rtl']` font swap intact — primitives mirror via auto-flip (US-012). New unit test `tests/unit/ui-primitives.test.ts` (11 tests) renders every primitive in en+ar and asserts 44px tap classes; needed `esbuild:{jsx:'automatic'}` in `vitest.config.ts` so JSX components render (they use Next's runtime, no `import React`). typecheck/lint/test:unit all green (21 tests). Follow-ups (out of scope here, for the screens that need them): Segmented control, Toggle, Radio, Zone chip primitives (shown in Fig.16-1, used by checkout/payment 2-3/2-4) — build inline there or extract then. Notes: `cream` = Fig's "Zebra" #F4F1EE (same hex, kept name); radius 10/14 from Fig left out (only card 12 / control 8 in use).
- (22 Jun · task 1-1) Foundation audited green: typecheck/lint/test:unit all pass. Fixed 2 `eqeqeq` lint errors (`!= null` → `!== null` on `number|null` params in `rider/delivery-card.tsx` + `lib/domain/rider.ts` — semantics unchanged). Added `tests/unit/foundation.test.ts` (10 assertions) so `vitest run` has a file and is green; it locks the AR↔EN mirror (58 keys) + role-home routing. Verified auth/middleware/RLS-intent/daily-session invariant/i18n/seed/env per the brief (see Baseline checklist + LOCAL RUN above). Follow-ups for later tasks: (5-3) bump Next off 14.2.15 advisory; (5-1/5-2) widen unit + add Playwright e2e — this smoke test is intentionally import-safe (mocks `server-only`/`next/headers`), not a full auth/db test; owner still needs to run `setup.sql` + configure an OTP channel before live auth works.
