# task-4-1 — Notifications end-to-end (WhatsApp + Web Push)
> Day 4 · Sprint S3 · Scheduled: 2026-06-25T09:10:00+08:00 (Asia/Kuala_Lumpur, UTC+8)

## Goal
Guarantee that every order state change fires **exactly one** bilingual notification (WhatsApp primary, Web Push fallback), deduped by `(order_id, event)`, and that the WhatsApp webhook correctly answers the verification handshake and validates signed delivery receipts. This is a correctness/wiring + test task, not new UI.

## Scope — build exactly this
- Audit every order transition path and confirm each calls dispatch exactly once: `createOrder` (EVT order_received), `advanceOrder` → `fireStatusEvent`, `cancelOrder`, `refuseOrder`, `riderPickup`/`riderDeliver` (which both route through `advanceOrder`). Add the dispatch call anywhere a status write bypasses `fireStatusEvent`.
- Confirm dedupe: `dispatchOrderEvent` inserts a `notifications` row first and returns `{ deduped: true }` on the DB UNIQUE(order_id, event) violation — verify the unique constraint exists in `0001_init.sql`; if absent, add a migration `supabase/migrations/0004_notifications_unique.sql` adding `UNIQUE(order_id, event)`.
- Confirm fallback order: WhatsApp via `sendWhatsApp`; on `{ ok:false }` (incl. `not_configured`) fall back to `sendWebPush` for every row in `push_subscriptions` for that user; persist final `channel`/`status`.
- Harden the webhook POST receipt handler in `route.ts`: the current `.eq('status','sent').limit(1)` update is too broad — map by the receipt's WhatsApp message id where available, or scope by recipient; keep the GET hub-challenge as-is.
- Add Vitest unit tests (mock the Supabase admin client + `sendWhatsApp`/`sendWebPush`) and any fixtures.

## Requirements & user stories covered
- **US-022 (FR-C-13)** — Customer receives an automatic notification per state change. *Given* my order advances through states *When* each transition occurs *Then* I receive exactly one notification per transition (WhatsApp, or push fallback).
- **US-038 (FR-S-10)** — Operator broadcast: *Given* customers opted in *When* I send a broadcast *Then* each opted-in customer receives it once in their preferred language (covered by `dispatchBroadcast`; verify consent filter + per-lang body).

## Design references (read these first)
- Shawarma/diagrams/sdd-fig-2-order-state.png (order state machine — the transitions that must each notify once)
- Shawarma/Documents/pdf format files/Design Phase/Fahman_Orders_SDD.pdf §7.1–7.3 (EVT codes, templates, dispatch) and §6.10 (WhatsApp Cloud API + webhook)

## Files to CREATE
- tests/unit/notifications.test.ts — dedupe (2nd call returns deduped), fallback (WA fail → push), broadcast fan-out + per-lang body.
- supabase/migrations/0004_notifications_unique.sql — ONLY if UNIQUE(order_id, event) is not already in 0001_init.sql.
- tests/fixtures/whatsapp-receipt.json — sample signed receipt payload for webhook tests.

## Files to REUSE / MODIFY (already exist — do not rebuild)
- src/lib/notifications/dispatch.ts — `dispatchOrderEvent(opts)`, `dispatchBroadcast(en, ar)`. Do not change the dedupe-by-insert pattern.
- src/lib/notifications/templates.ts — `render`, `TEMPLATES`, `STATUS_EVENT`, `EventCode`. Reuse mappings; do not invent new event codes.
- src/lib/notifications/whatsapp.ts — `sendWhatsApp`, `verifyWebhookSignature`.
- src/lib/notifications/webpush.ts — `sendWebPush`, `PushSub`.
- src/lib/domain/orders.ts — `fireStatusEvent` (private), `createOrder`, `advanceOrder`, `cancelOrder`, `refuseOrder`. Ensure each terminal/transition writes go through dispatch.
- src/app/api/webhooks/whatsapp/route.ts — GET handshake (keep), POST receipt mapping (tighten).
- src/app/api/push/subscribe/route.ts — subscription persistence (no change expected; confirm shape).

## Acceptance criteria (Given/When/Then)
- **Exactly one message per transition (US-022):** Given an order advances through states, When each transition occurs, Then exactly one notification is sent per transition (WhatsApp, else push fallback) — a second dispatch for the same (order_id, event) is a no-op.
- **Broadcast once per opted-in customer (US-038):** Given customers opted in (consent_at not null), When a broadcast is sent, Then each receives it once in their preferred language (ar/en body).
- **Webhook handshake:** Given a GET with hub.mode=subscribe and a matching verify token, Then the challenge is echoed with 200; otherwise 403.
- **Signed receipts:** Given a POST with a valid X-Hub-Signature-256, Then the matching notification status updates; an invalid signature returns 401.

## Definition of Done
typecheck + lint clean; unit tests for dedupe/fallback/broadcast/webhook added and green; bilingual AR/EN templates verified (AR mirrors EN); no secrets inlined (env only); committed ONE FILE PER COMMIT authored as the user; pushed to origin/main.

## Dependencies
Runs first on Day 4. Relies on existing `src/lib/notifications/*`, `src/lib/domain/orders.ts`, `createAdminClient`, and the `notifications`/`push_subscriptions` tables. task-4-3 and task-4-4 depend on the dispatch correctness verified here.
