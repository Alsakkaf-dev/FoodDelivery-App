# Fahman Orders

> Mobile-first, bilingual (Arabic RTL / English) **PWA** that replaces a solo home-based shawarma seller's manual *WhatsApp group + Google Form* workflow with one real-time ordering and home-delivery system — for a real business in **Johor, Malaysia**, built by a single student-developer at **zero ongoing cost** (free tiers only).

![Status](https://img.shields.io/badge/status-MVP%20build-C0451F)
![Stack](https://img.shields.io/badge/stack-Next.js%20%2B%20Supabase-1F2933)
![Cost](https://img.shields.io/badge/hosting-free%20tier-2F8F4F)
![i18n](https://img.shields.io/badge/i18n-AR%20(RTL)%20%2B%20EN-C9821F)

Three roles from one installable web app (no app store): **Customer** (browse + order), **Operator/Admin** (run the trading day), **Rider** (deliver).

---

## Table of contents

1. [What it does](#what-it-does)
2. [Architecture](#architecture)
3. [Tech stack & versions](#tech-stack--versions)
4. [Prerequisites & local setup](#prerequisites--local-setup)
5. [Environment variables](#environment-variables)
6. [Scripts](#scripts)
7. [Folder structure](#folder-structure)
8. [Coding standards](#coding-standards)
9. [API at a glance](#api-at-a-glance)
10. [Deployment](#deployment)
11. [Maintenance](#maintenance)
12. [Documentation & handover](#documentation--handover)

---

## What it does

- **Live shop status** — Open / Closed / Sold-Out, pushed to every client in **under 2 seconds**.
- **Live remaining-quantity counter** — customers always see accurate stock.
- **Race-safe ordering** — an atomic stock decrement in Postgres means the day's quantity can **never** be oversold.
- **Structured ordering** — bilingual menu with photos and MYR prices; delivery (zone + address) or walk-in pickup.
- **Order tracking** — `New -> Confirmed -> Preparing -> Ready -> Out-for-Delivery -> Delivered` (+ Cancelled), with history.
- **Automated bilingual notifications** — WhatsApp Business Cloud API (primary) with Web Push (fallback) on every state change.
- **Operator control** — one-tap Open/Close/Sold-Out, daily setup, a live order board, dispatch, broadcast, end-of-day summary.
- **Rider flow** — today's deliveries grouped by zone, map deep-link, one-tap Picked-up / Delivered.
- **Bilingual** — full Arabic (RTL) / English parity. **Auth** — phone-OTP. **Payments (v1)** — COD + DuitNow QR (manual proof).

Trading window: **13:00-19:00 MYT (UTC+8)**, or until sold out. Currency **MYR**.

---

## Architecture

A thin, server-action-driven Next.js front end over a managed Supabase back end, with two outbound messaging integrations:

```
Browser (PWA)                 Vercel (Singapore, ap-southeast-1)        Supabase (managed)
+-------------------+         +------------------------------+         +----------------------+
| Next.js + React   |  HTTPS  | Server Actions               |  SQL    | Postgres (>=3NF)     |
| TypeScript        | ------> | Route Handlers (app/api)     | ------> | Row-Level Security    |
| Tailwind          |         | - validate (Zod) + role-check|         | Realtime channels     |
| next-pwa / Workbox| <-----  | - the only write path        | <-----  | Auth (phone-OTP)      |
| Realtime + Push   | realtime| - issue notifications        | realtime| Storage (proofs)      |
+-------------------+         +---------------+--------------+         +----------------------+
                                              |
                                              v
                              WhatsApp Business Cloud API (primary)
                              Web Push / VAPID (fallback)
```

There is **no separate custom backend** to operate: business logic lives in server actions co-located with the app and is enforced again in the database via RLS and integrity constraints. Instant reads (status, quantity) come over **Supabase Realtime**; correct writes (place/advance order) go through validated server actions doing an **atomic race-safe decrement**.

| Layer | Technology | Responsibility |
|---|---|---|
| Client / PWA | Next.js (App Router) + React + TS + Tailwind; next-pwa/Workbox | Mobile-first bilingual UI for 3 roles; installable PWA; offline shell; Realtime + Web Push. |
| Application | Next.js Server Actions + Route Handlers (Vercel SG) | Validated, role-checked logic; only write path; notifications; webhooks. |
| Data & platform | Supabase — Postgres, Realtime, Auth, Storage | System of record; RLS per role; realtime broadcast; OTP auth; proof images. |
| Messaging | WhatsApp Cloud API (primary) + Web Push (VAPID, fallback) | Bilingual templated notifications; inbound WhatsApp receipts via webhook. |
| Hosting / CI | Vercel (ap-southeast-1) + GitHub + GitHub Actions | Preview + production deploys; CI runs typecheck/lint/tests; secrets in Vercel/Supabase. |

See **D-09 (SDD)** for the full architecture, ERD and the ten ADRs.

---

## Tech stack & versions

Baseline = **minimum supported**; upgrade within the same major line unless a deliberate migration is planned. **Free tier only.**

| Area | Technology | Baseline |
|---|---|---|
| Framework | Next.js (App Router) | 15.x |
| Language | TypeScript (strict) | 5.x |
| UI runtime | React | 19.x |
| Styling | Tailwind CSS | 3.4.x |
| Backend SDK | @supabase/supabase-js | 2.x |
| Database | Supabase Postgres | 15 (managed) |
| Auth | Supabase Auth (phone-OTP) | 2.x |
| PWA / SW | next-pwa + Workbox | 5.x / 7.x |
| Unit tests | Vitest | 2.x |
| E2E tests | Playwright | 1.4x |
| Validation | Zod | 3.x |
| Runtime | Node.js | 20 LTS |
| Package manager | pnpm (npm compatible) | 9.x / 10+ |

---

## Prerequisites & local setup

**Prerequisites:** Node.js 20 LTS, pnpm 9+ (or npm 10+), Git, VS Code (recommended). For the database, either run Supabase locally (CLI + Docker) or use a free cloud dev project. A WhatsApp Cloud API test number and a VAPID key pair are needed for notifications (placeholders are fine for first run).

```bash
# 1. Clone and enter the app
git clone <repo-url>
cd app

# 2. Install dependencies
pnpm install            # or: npm install

# 3. Create your env file (git-ignored) and fill it in (see table below)
cp .env.example .env.local

# 4. Start the database
supabase start          # local (CLI + Docker) — prints API URL + keys
#   or create a free Supabase cloud project and copy its URL + keys

# 5. Apply the schema (forward-only migrations) and seed reference data
pnpm db:migrate
pnpm db:seed            # zones, sample bilingual menu, operator account

# 6. Run the dev server
pnpm dev                # http://localhost:3000  (dev OTP is printed to logs)

# 7. (Optional) verify the toolchain on a clean checkout
pnpm typecheck && pnpm lint && pnpm test:unit
```

> **First-run tip:** if the UI boots but status/quantity do not update live, re-check the Supabase anon URL/key in `.env.local` and that migrations ran cleanly. WhatsApp/Web Push can stay on placeholders until you test notifications.

---

## Environment variables

All config comes from env vars — **no secret is ever hard-coded**. `.env*` is git-ignored; real values live only in `.env.local` (local) and the Vercel / Supabase dashboards (deployed). `NEXT_PUBLIC_*` is shipped to the browser and must be non-secret; everything else is server-only. A committed `.env.example` lists every key.

| Name | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL; browser anon client + Realtime. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Anon key; safe for the browser because RLS enforces row access. |
| `SUPABASE_SERVICE_ROLE_KEY` | server | Privileged key for server actions/automation; bypasses RLS. Never client-side. |
| `SUPABASE_DB_URL` | server | Direct Postgres connection string for migrations / tooling. |
| `WHATSAPP_TOKEN` | server | WhatsApp Cloud API access token for sending notifications. |
| `WHATSAPP_PHONE_NUMBER_ID` | server | ID of the WhatsApp Business sending number. |
| `WHATSAPP_VERIFY_TOKEN` | server | Verifies the inbound WhatsApp webhook hub challenge. |
| `WHATSAPP_APP_SECRET` | server | Validates the signature on inbound WhatsApp receipts. |
| `VAPID_PUBLIC_KEY` | public | Web Push public key for the browser subscription. |
| `VAPID_PRIVATE_KEY` | server | Web Push private key the server signs with. Secret. |
| `VAPID_SUBJECT` | server | `mailto:` contact identifying the push sender. |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | public | Default UI locale (`en` or `ar`); AR mirrors EN. |

> Any value that lets someone act as the system (service-role key, WhatsApp token/app secret, VAPID private key) is **server-scoped** and lives only in secret storage. A secret behind a `NEXT_PUBLIC_` prefix is a leaked credential — rotate it.

---

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Next.js dev server with hot reload at `http://localhost:3000`. |
| `pnpm build` | Production build of the PWA (the same build Vercel runs). |
| `pnpm start` | Serves the production build locally (pre-deploy smoke test). |
| `pnpm lint` | ESLint (Next.js config); CI fails on errors. |
| `pnpm typecheck` | `tsc --noEmit` in strict mode; CI fails on any type error. |
| `pnpm test:unit` | Vitest unit suite (domain logic, validators, utilities). |
| `pnpm test:e2e` | Playwright e2e suite across Customer / Operator / Rider journeys. |
| `pnpm db:migrate` | Applies forward-only SQL migrations in `supabase/migrations`. |
| `pnpm db:seed` | Loads reference/seed data (zones, sample menu, operator). |

---

## Folder structure

```
app/
  (customer)/        Home/live status, menu, item, cart, checkout, tracking, history, OTP login
  (operator)/        Dashboard, daily setup, live order board, order detail, menu manager, broadcast, end-of-day
  (rider)/           Zone-grouped deliveries, delivery detail
  api/               Route handlers: auth/otp, status, orders, board, rider, admin/eod, webhooks/whatsapp, push
  layout.tsx         Root layout: locale + dir (rtl/ltr), providers, bottom navigation
components/          Reusable UI (CMP-U-01..15): status badge, status chip, qty counter, buttons, inputs,
                     cards, status timeline, bottom nav, skeleton/empty states
lib/
  supabase/          Browser (anon) + server (service-role) clients and SSR helpers
  actions/           Server actions = business logic: orders, session/status, menu, rider, admin
  notifications/     WhatsApp Cloud API + Web Push senders; bilingual template catalogue (EVT-01..11)
  realtime/          Supabase channel subscriptions (shop:status, shop:qty, board:orders, order:{id}, rider:feed)
  i18n/              Locale loading, dir resolution, message helpers
supabase/
  migrations/        Forward-only SQL: schema, constraints, RLS policies, indexes
  seed.sql           Reference/seed data (zones, sample menu, operator)
public/              PWA manifest, service worker, app icons
messages/            en.json + ar.json — all user-facing strings (AR mirrors EN)
tests/               Vitest unit tests + Playwright e2e specs
```

**How to read it:** a screen lives under its role's route group in `app/`; its data comes from a server action in `lib/actions/`; live updates come from a subscription in `lib/realtime/`; every shown string comes from `messages/` (never inline); every schema it relies on is a migration in `supabase/migrations/`.

---

## Coding standards

- **TypeScript strict** everywhere; no `any` without a written reason; type public signatures and server-action I/O.
- **Naming:** `PascalCase` components/types, `camelCase` functions/vars, `kebab-case` files/folders, `UPPER_SNAKE_CASE` constants/env.
- **Server actions are the only write path** — each one validates input with **Zod** and **checks the caller's role**; never trust client-supplied role/IDs.
- **Every schema change is a forward-only migration** in `supabase/migrations/` (no editing past migrations, no dashboard changes); RLS stays on for every table.
- **No hard-coded user-facing strings** — use `messages/en.json` / `messages/ar.json`; **AR mirrors EN** in the same change; set `dir` by locale.
- **Every screen implements the 4 UI states** — empty, loading, error, offline. Respect design tokens and the >=44px tap target; reuse shared components.
- **Never log personal data** (phone, name, address); never commit secrets.
- **Commits:** `WP-NN: short imperative summary`. **Trunk-based** with short-lived branches and Vercel preview deploys.
- **Definition of Done:** typecheck + lint clean, tests for non-trivial logic, no secrets committed, bilingual strings (EN + AR) present.

---

## API at a glance

Uniform envelope: `{ ok, data }` on success or `{ ok: false, error: { code, message } }` on failure. `order.create` requires an **`Idempotency-Key`** so a retried submission cannot create a duplicate. Full contract in **D-09 (SDD)**.

| Domain | Action / Route | Role | Purpose |
|---|---|---|---|
| Auth / OTP | `POST /api/auth/otp/request` | public | Request a phone-OTP code. |
| Auth / OTP | `POST /api/auth/otp/verify` | public | Verify OTP and start a session (rate-limited). |
| Auth / OTP | `POST /api/auth/logout` | any | End the current session. |
| Menu | `GET /api/menu` · `menu.list` | public | List bilingual menu items with MYR prices. |
| Menu | `menu.upsert` / `menu.setAvailability` | operator | Create/update items; toggle availability. |
| Status | `GET /api/status` · `status.get` | public | Live `{ status, qty_remaining, window }`. |
| Status | `session.open` / `close` / `setSoldOut` | operator | One-tap shop state changes. |
| Status | `session.configure` / `zones.upsert` | operator | Set qty, cut-off, delivery window, active zones. |
| Orders | `order.create` | customer | Place an order (Idempotency-Key; atomic decrement). |
| Orders | `order.get` / `order.list?scope=history` | customer | Read one order / own history. |
| Orders | `order.cancel` | customer | Cancel own order while still new/confirmed. |
| Orders | `board.list` / `order.advance` | operator | Live order board; advance order states. |
| Orders | `order.dispatch` / `verifyPayment` / `refuse` | operator | Dispatch to rider; verify DuitNow proof; refuse w/ reason. |
| Rider | `GET /api/rider/deliveries?date` | rider | Today's deliveries grouped by zone. |
| Rider | `rider.pickup` / `rider.deliver` | rider | Mark Picked-up / Delivered. |
| Notifications | `GET/POST /api/webhooks/whatsapp` | system | Hub-challenge verify + signed delivery receipts. |
| Notifications | `push.subscribe` / `notify.broadcast` | cust / op | Register Web Push; broadcast bilingual announcement (throttled). |
| Admin | `GET /api/admin/eod` · `admin.endOfDay` | operator | End-of-day summary for a date. |

**Realtime (not endpoints):** `shop:status` + `shop:qty` to all clients, `board:orders` to the operator, `order:{id}` to the owning customer, `rider:feed` to the rider; a dropped socket falls back to periodic refresh. **Map nav** is a client-side Google Maps deep-link. The **WhatsApp webhook** answers Meta's hub challenge on GET and ingests signature-verified receipts on POST.

---

## Deployment

Git-driven; full guide in **D-21 (Deployment & Release Runbook)**.

- Push a branch -> **Vercel preview deploy**. Merge to main -> **production** (Vercel, Singapore `ap-southeast-1`).
- **GitHub Actions** gates promotion with typecheck + lint + tests.
- **Supabase** holds the database/storage; schema changes ship as migrations.
- **Secrets** live in Vercel project settings and the Supabase dashboard — never in the repo.

For monitoring, backup, rollback and the security/PDPA checklist, see **D-22**.

---

## Maintenance

| Cadence | Task | Notes |
|---|---|---|
| Weekly | Check Supabase usage vs free-tier limits | DB size, storage, MAU, Realtime/egress — act before any limit is hit. |
| Weekly | Review error logs | Vercel + Supabase logs, Sentry issues; triage anything new from the trading window. |
| Weekly | Take a backup export | Export Postgres data + storage manifest, store off-platform (D-22). |
| Monthly | Update dependencies | Merge Dependabot PRs; `npm audit` / `pnpm audit`; stay in-major; CI green. |
| Monthly | Run a restore test | Restore the latest backup into a scratch project and verify it boots (D-22). |
| Monthly | Review WhatsApp template status | Confirm templates approved and number in good standing. |
| Monthly | Cost-tier review | Re-confirm every service is within its free tier. |
| Quarterly | Rotate secrets | Service-role key, WhatsApp token/app secret, VAPID keys in Vercel/Supabase; redeploy. |
| Quarterly | Review RLS & PDPA retention | Re-check RLS policies; run the PDPA retention purge of stale personal data (D-22). |
| As needed | WhatsApp template re-approval | Resubmit on edit/rejection; update `lib/notifications`. |
| As needed | Next.js / Supabase major upgrades | Read the migration guide, branch, run full tests + a preview deploy before merging. |

Guiding rules: stay on free tiers, keep dependencies current but in-major, never let a backup go untested, rotate secrets on schedule.

---

## Documentation & handover

Every deliverable lives under `Documents/<format> format files/<Phase> Phase/` (formats: `docx`, `pdf`, plus `md` / `xlsx` where relevant).

- **D-09 — SDD** — architecture, ERD, data dictionary, RLS, state machines, API contract, notification catalogue, ADRs · *Design Phase*
- **D-15 — UI/UX Design System & Wireframes** — tokens, 15 components, 17 screens, 4 UI states · *Design Phase*
- **D-17 — Work Breakdown Structure & Build Sequence** — build tasks and order · *Implementation / Plan Phase*
- **D-21 — Deployment & Release Runbook** — environments, pipeline, promotion, rollback · *Deployment Phase*
- **D-22 — Monitoring, Backup, Rollback & Security/PDPA Checklist** — operational detail behind Deployment & Maintenance above · *Deployment Phase*
- **D-24 — README + Maintenance Plan** — the formal companion to this file (`Documents/.../Handover Phase/Fahman_Orders_README_Maintenance.docx` / `.pdf`)

Start with `Documents/MASTER_BUILD_BLUEPRINT.md` for the end-to-end build narrative and canonical IDs, and `Fahman_Orders_HANDOVER.md` for the zero-repeat snapshot to continue in a new session. Get the app running (setup above) and confirm typecheck/lint/tests are green before changing anything.

---

*Fahman Orders · built for a home-based shawarma operator in Johor, Malaysia · zero ongoing cost · author: Mohammed Al-Sakkaf.*
