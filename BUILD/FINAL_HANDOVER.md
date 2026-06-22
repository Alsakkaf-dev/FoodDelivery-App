# Fahman Orders — Final Handover (v1.0.0)

Code-complete, typechecked, unit-tested, build-green ordering + home-delivery PWA
for a solo shawarma seller in Johor, Malaysia. Bilingual (Arabic RTL / English),
three roles (Customer / Operator / Rider), real-time, on free tiers only.

This document is the single entry point for a new owner/engineer: what was built,
how the pieces fit, and how to run / test / deploy. For deeper detail follow the
links — this file does not duplicate them.

- **Run / env / scripts:** [`README.md`](../README.md)
- **Going live (accounts + secrets + smoke test):** [`BUILD/GO_LIVE_CHECKLIST.md`](GO_LIVE_CHECKLIST.md)
- **Per-task build log + decisions:** [`BUILD/PROGRESS.md`](PROGRESS.md)
- **Build rules:** [`BUILD/AGENT_RULES.md`](AGENT_RULES.md) · **Auth setup:** [`BUILD/AUTH_SETUP.md`](AUTH_SETUP.md)

## What was built

A complete three-role experience over a managed Supabase backend:

- **Customer:** live shop status + remaining-quantity counter; bilingual menu with
  photos + MYR prices; cart; checkout (delivery zone + address, or pickup); payment
  (COD or DuitNow QR proof); race-safe order placement; live order tracking +
  history. Installable PWA with an offline shell and Web Push opt-in.
- **Operator:** one-tap Open/Close/Sold-Out dashboard; daily setup (qty, cut-off,
  delivery window, zones); menu manager (CRUD + availability + photo); live order
  board (advance through legal transitions, dispatch to rider); order detail
  (verify/reject DuitNow proof, cancel/refuse with reason + restock); bilingual
  broadcast (throttled); end-of-day summary.
- **Rider:** today's deliveries grouped by zone; delivery detail with map deep-link,
  customer phone, items, and payment method/status; one-tap Picked-up / Delivered.
- **System:** exactly-once bilingual notifications (WhatsApp primary → Web Push
  fallback, deduped, with signed-receipt webhook mapping); five realtime channels
  (<2s, snapshot-seeded, reconnect/poll fallback); atomic race-safe stock decrement
  with auto sold-out and DB-trigger restock; free-tier scheduled auto-close;
  PDPA consent (opt-in + versioned) and verified data erasure with audit.

## Architecture map (request → data)

```
Browser (PWA, RTL/LTR)
  │  server action / route handler call
  ▼
src/app/<role>/**            screens (Server Components) + 'use client' islands
src/app/api/**               route handlers (REST envelope { ok, data|error })
  │
  ▼
src/lib/domain/**            THE ONLY WRITE PATH — Zod-validated, role-checked
  orders · session · menu · zones · addresses · rider · notify · privacy
  │                                   │
  │ createClient (RLS, anon/user)     │ createAdminClient (service role)
  ▼                                   ▼
Supabase Postgres  ── RLS per role · place_order RPC (atomic) · restock trigger ·
                      auto_close RPC · UNIQUE(order_id,event) dedupe
  │  realtime (postgres_changes)
  ▼
src/lib/realtime/hooks.ts    useShopStatus · useOrderBoard · useOrderStatus ·
                             useRiderFeed  (seed-from-snapshot + reconnect poll)

src/lib/notifications/**     dispatch → WhatsApp (sendWhatsApp) → Web Push fallback
                             templates (EVT-01..11, bilingual) · webpush · whatsapp
```

Key invariants: business logic lives in `src/lib/domain` (server actions) and is
re-enforced in the DB (RLS + constraints + the `place_order` atomic guard); the
client never decrements stock or trusts a role; every user-facing string is in
`messages/{en,ar}.json` (AR mirrors EN, enforced by a parity test); every screen
has the 4 UI states and ≥44px tap targets.

## How to run / test / deploy

```bash
npm install
cp .env.example .env.local        # fill Supabase (+ optional WhatsApp/VAPID)
npm run db:migrate && npm run db:seed   # or paste supabase/setup.sql in the SQL editor
npm run dev                        # http://localhost:3000
# gate:
npm run typecheck && npm run lint && npm run test:unit && npm run build
npm run test:e2e                   # needs `npx playwright install` + a built app
```

Deploy: push to `main` → Vercel (Singapore). CI (`.github/workflows/ci.yml`) gates
on lint/typecheck/unit/build + e2e. Complete the **GO_LIVE_CHECKLIST** for secrets.

## Quality status (v1.0.0)

- `typecheck` ✅ · `lint` ✅ (0 warnings) · `test:unit` ✅ **181 tests / 26 files** ·
  `build` ✅ (all 18 routes dynamic) · i18n EN/AR parity ✅.
- E2E specs authored for all three roles + guards; RTL + tap-target + non-seeded
  paths run in CI, data-dependent paths self-skip until a seeded Supabase stack.

## Known limitations / next steps

- **Next.js 14.2.x:** stays on the patched 14.2 line; a Next 15/16 major upgrade
  closes the residual `npm audit` advisories (none apply to this config). Dev-tool
  advisories (esbuild/vitest, glob/eslint-config-next) are build-time only.
- **Owner-supplied assets:** real PWA icons (placeholder dir today), live secrets
  (Supabase/WhatsApp/VAPID/auto-close), Storage buckets `payment-proofs` +
  `menu-photos`, and the merchant DuitNow QR.
- **Polish backlog (non-blocking):** a customer Account screen for the 4th nav tab;
  a cart bottom-nav entry; migrate the early inline-AR customer strings onto
  `messages/*`; a broadcast preview/confirm step; a Cancelled lane on the board.
- **WhatsApp:** notifications fall back to Web Push until Meta approves the number/
  templates (see AUTH_SETUP + GO_LIVE).

*Fahman Orders v1.0.0 · author: Mohammed Al-Sakkaf (Alsakkaf-dev) · zero ongoing cost.*
