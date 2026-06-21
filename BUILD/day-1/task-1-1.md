# task-1-1 — Foundation audit & green baseline
> Day 1 · Sprint S0 · Scheduled: 2026-06-22T09:10:00+08:00 (Asia/Kuala_Lumpur, UTC+8)

## Goal
Prove the inherited ~50% scaffold actually loads and is green: install, typecheck, lint and unit tests all pass; auth/OTP, middleware RBAC, the single-active-session invariant, RLS intent and i18n wiring are verified to load; a dev seed runs and a LOCAL RUN note exists. End state: a fresh clone can be brought up locally from one page of instructions.

## Scope — build exactly this
- Run `npm install`, `npm run typecheck`, `npm run lint`, `npm run test:unit`; fix any red (small fixes only — do NOT re-architect).
- Verify the auth path loads: `src/app/api/auth/otp/request/route.ts` and `.../verify/route.ts` import cleanly; confirm verify writes `consent_at` (US-007) and returns role+lang.
- Verify `src/middleware.ts` guards `/operator`, `/rider`, `/checkout`, `/history` and redirects by role; confirm `requireRole`/`homeForRole` in `src/lib/auth/roles.ts`.
- Confirm the single-active-session invariant exists in DB: `daily_session.session_date ... unique` and the partial unique index `one_open_session` in `supabase/migrations/0001_init.sql` (US-030, FR-S-06). Add a short unit/integration assertion or a documented manual check.
- Confirm i18n loads: `getI18n()`/`getLocale()` resolve `NEXT_LOCALE` cookie; `messages/en.json` + `ar.json` parse.
- Add/confirm a working dev seed (`supabase/seed.sql` via `npm run db:seed`) and write a LOCAL RUN section into `BUILD/PROGRESS.md` (create if missing).
- Confirm `.env.example` covers every referenced key (Supabase, WhatsApp, VAPID, OTP/broadcast limits, TZ, default locale).

## Requirements & user stories covered
- US-001 (FR-C-01) — Customer phone-OTP sign-up/sign-in; session within 60s; invalid/expired code refused bilingually, no session.
- US-002 (FR-R-01) — Rider OTP sign-in lands on deliveries only.
- US-003 (FR-S-12) — Operator role unlocks admin; non-operator direct route is denied.
- US-004 (FR-S-12) — RBAC authorizes every request by role; cross-role blocked + logged, in-role proceeds.
- US-005 (FR-S-13) — Row-level isolation: customer cannot read another's order; rider sees only assigned.
- US-006 (FR-S-14) — OTP rate-limiting per number/IP; excess blocked with retry-after.
- US-007 (NFR-C-01) — Consent required and recorded (timestamp + version) at signup.
- US-030 (FR-S-06) — Exactly one active daily session; a second active session for the same day is refused.

## Design references (read these first)
- Shawarma/diagrams/sdd-fig-1-erd.png (entities + the daily_session uniqueness)
- Shawarma/Documents/pdf format files/Design Phase/Fahman_Orders_SDD.pdf (§ schema, RLS, auth, state machines)

## Files to CREATE
- BUILD/PROGRESS.md — LOCAL RUN note (install, env, db:migrate, db:seed, dev) + a baseline checklist of what is green.
- (optional) tests/unit/foundation.test.ts — assert i18n dictionaries parse and roles helpers export, if a quick smoke test helps the green baseline.

## Files to REUSE / MODIFY (already exist — do not rebuild)
- src/middleware.ts — confirm role redirects; no rewrite.
- src/lib/auth/roles.ts — `requireRole`, `getProfile`, `homeForRole`, `RoleError`.
- src/lib/supabase/{client,server,admin,middleware}.ts — confirm they construct without throwing.
- supabase/migrations/0001_init.sql, 0002_rls.sql, 0003_functions.sql — read; do not edit unless a load error.
- supabase/seed.sql — used by `npm run db:seed`.
- src/app/api/auth/otp/request/route.ts, .../verify/route.ts — confirm consent + role return.
- .env.example — add any missing key referenced in code.

## Acceptance criteria (Given/When/Then)
- US-001: Given an unregistered visitor; When a valid MY phone + received OTP is submitted; Then an authenticated Customer session is created within 60s and a profile is provisioned with phone + default language. Given a wrong/expired code; Then sign-in is refused with a clear bilingual message and no session is created.
- US-004: Given a caller in one role; When they invoke an endpoint reserved for another role; Then it is rejected with an authorization error and logged. Given the correct role; Then the action proceeds.
- US-005: Given two customers with orders; When A requests B's order by id; Then the row is not returned. Given dispatched vs not; When the rider lists deliveries; Then only assigned/ready are returned.
- US-006: Given an OTP limit per number/IP per window; When requests exceed it; Then further requests are blocked with retry-after and the event is recorded.
- US-007: Given signup; When the user proceeds without opting in; Then signup cannot complete and the consent timestamp + version are stored.
- US-030: Given an active session exists for today; When a second active session is attempted for the same day; Then it is refused and the existing session remains the single source.

## Definition of Done
typecheck + lint clean; `npm run test:unit` green; any added foundation test passes; bilingual AR/EN dictionaries parse (AR mirrors EN); `.env.example` complete; BUILD/PROGRESS.md LOCAL RUN note committed; committed ONE FILE PER COMMIT authored as the user; pushed to origin/main.

## Dependencies
- First task of Day 1; relies only on the existing scaffold (supabase/*, src/lib/*, src/middleware.ts, src/app/api/auth/*). Unblocks task-1-2 through task-1-5.
