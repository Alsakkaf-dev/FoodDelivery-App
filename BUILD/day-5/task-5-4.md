# task-5-4 — Deploy-prep — env, CI, config, README
> Day 5 · Sprint S4 · Scheduled: 2026-06-26T16:40:00+08:00 (Asia/Kuala_Lumpur, UTC+8)

## Goal
Make the repo deployable by a non-author: complete `.env.example`, document Vercel + Supabase config, ensure the CI workflow runs green (lint/typecheck/unit/build, e2e), verify DB migration + seed, and finalize the README plus a GO-LIVE checklist enumerating the accounts/secrets the owner must supply.

## Scope — build exactly this
- `.env.example` completeness: confirm every var the code reads is present (Supabase URL/anon/service-role/DB URL; WhatsApp token/phone-id/verify/app-secret; VAPID public/private/subject; `NEXT_PUBLIC_DEFAULT_LOCALE`, `NEXT_PUBLIC_APP_URL`, `OTP_RATE_LIMIT_PER_HOUR`, `BROADCAST_RATE_LIMIT_PER_DAY`, `TZ`). Add any missing key and a one-line comment for each; mark which are `NEXT_PUBLIC_` (browser) vs server-only.
- CI: confirm `.github/workflows/ci.yml` `quality` job (lint → typecheck → unit → build with placeholder envs) and `e2e` job pass; add Playwright browser caching if flaky; ensure `npm ci` works against `package-lock.json`.
- DB verification: document and dry-run `npm run db:migrate` (supabase db push of 0001_init → 0002_rls → 0003_functions, plus any 0004 from task-5-3) and `npm run db:seed` (`supabase/seed.sql` — zones, bilingual menu, operator). Note the order and the race-safe `place_order` RPC dependency.
- README finalize: setup, env, migrate+seed, run, test, deploy-to-Vercel-Singapore steps; link the GO-LIVE checklist.
- `BUILD/GO_LIVE_CHECKLIST.md`: an actionable list of human-supplied items — create Supabase project (Singapore), set env vars in Vercel, provision WhatsApp Cloud API number + permanent token + webhook verify, generate VAPID keys, create operator + rider accounts, set trading config, smoke-test all three roles.

## Requirements & user stories covered
- Deploy readiness (S4 hardening / NFR operability) — reproducible setup, green CI, verified migrations, documented go-live.

## Design references (read these first)
- Shawarma/diagrams/figure-4-order-lifecycle.png (lifecycle the smoke-test must exercise)
- Shawarma/diagrams/srs-fig-4-deployment-architecture.png (Vercel Singapore + Supabase topology)
- Shawarma/Documents/pdf format files/Design Phase/Fahman_Orders_SDD.pdf (§ deployment, CI pipeline, rate limits)

## Files to CREATE
- BUILD/GO_LIVE_CHECKLIST.md — human accounts/secrets + smoke-test steps before flipping to prod

## Files to REUSE / MODIFY (already exist — do not rebuild)
- .github/workflows/ci.yml — keep two jobs (quality, e2e); ensure green, add caching if needed.
- .env.example — fill any gaps; keep comments and NEXT_PUBLIC_ markers.
- README.md — finalize setup/run/test/deploy sections; link checklist.
- supabase/migrations/0001_init.sql, 0002_rls.sql, 0003_functions.sql, supabase/seed.sql, supabase/config.toml — verify migrate + seed order.
- package.json scripts — `db:migrate`, `db:seed`, `test:unit`, `test:e2e` referenced in docs.

## Acceptance criteria (Given/When/Then)
- Deploy readiness — Given a clean clone with `.env.local` filled from `.env.example`, When a new engineer runs install → migrate → seed → build → start, Then the app boots and all three role areas load.
- CI — Given a push/PR to main, When the workflow runs, Then lint, typecheck, unit, build, and e2e all pass.
- Go-live — Given the GO_LIVE_CHECKLIST, When the owner completes every item, Then nothing else is needed to serve real customers (only their secrets/accounts).

## Definition of Done
`.env.example` complete with comments; CI green (quality + e2e); migrate + seed verified and documented; README finalized; GO_LIVE_CHECKLIST.md created; no secrets committed; typecheck + lint clean; committed ONE FILE PER COMMIT authored as the user; pushed to origin/main.

## Dependencies
- Runs after task-5-1/5-2/5-3 (tests + dependency bump feed CI); relies on existing `.github/workflows/ci.yml`, `.env.example`, `supabase/*`, and package scripts.
