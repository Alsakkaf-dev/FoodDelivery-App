# task-3-5 — Order detail, payment verify, refuse, broadcast, end-of-day
> Day 3 · Sprint S1/S3 · Scheduled: 2026-06-24T19:10:00+08:00 (Asia/Kuala_Lumpur, UTC+8)

## Goal
Complete the operator workflow with three screens: an order detail page that verifies/rejects a DuitNow proof and cancels/refuses with a reason; a bilingual broadcast composer that fans out once per opted-in customer; and an end-of-day summary of orders, items and MYR revenue.

## Scope — build exactly this
- `src/app/(operator)/operator/orders/[id]/page.tsx` — server component. Load via `getOrder(id)` (returns `{ order, items }`). Show items, totals (MYR), payment method/status and, for `duitnow_qr`, the `proof_url` image. A client island offers Verify / Reject (→ `verifyPayment(id, 'verified'|'rejected')`) and a Cancel/Refuse control with a required reason (→ `refuseOrder(id, reason)`; only New/Confirmed are refusable). A rejection/refusal notifies the customer; refuse returns stock.
- `src/app/(operator)/operator/broadcast/page.tsx` — server component + client form with `message_en` and `message_ar` textareas (RTL for AR), submitting to `broadcast({ message_en, message_ar })`. Surface the `rate_limited` error if the daily cap is hit. Show send count on success.
- `src/app/(operator)/operator/end-of-day/page.tsx` — server component calling `endOfDay()` and rendering total orders, items sold and MYR revenue (delivered orders only).

## Requirements & user stories covered
- US-035 (FR-O-14) — Given a QR order with an uploaded proof, When I review it, Then I can mark payment verified or rejected, and a rejection notifies the customer.
- US-036 (FR-O-15) — Given an active order, When I cancel it with a reason, Then the customer is notified with that reason and any reserved quantity is returned to stock.
- US-038 (FR-O-12) — Given customers opted in, When I send a broadcast, Then each opted-in customer receives it once in their preferred language.
- US-037 (FR-O-13) — Given a completed trading day, When I open the end-of-day summary, Then it shows total orders, items sold and MYR revenue matching the session's orders.

## Design references (read these first)
- Shawarma/diagrams/uiux-scr-o-04-orderdetail.png · uiux-scr-o-06-broadcast.png · uiux-scr-o-07-endofday.png
- Shawarma/diagrams/uiux-fig-3-rtl.png · uiux-fig-4-states.png
- Shawarma/Documents/pdf format files/Design Phase/Fahman_Orders_SDD.pdf (§7.3 broadcast throttle, notifications) and Fahman_Orders_UIUX.pdf (these three screens).

## Files to CREATE
- src/app/(operator)/operator/orders/[id]/page.tsx — order detail + verify/reject + cancel/refuse.
- src/app/(operator)/operator/broadcast/page.tsx — bilingual broadcast composer.
- src/app/(operator)/operator/end-of-day/page.tsx — end-of-day summary.
- (Add the inline client islands these pages need, e.g. a payment-actions island and a broadcast-form island, under src/components/operator/.)

## Files to REUSE / MODIFY (already exist — do not rebuild)
- src/lib/domain/orders.ts — `getOrder(id)`, `verifyPayment(id, 'verified'|'rejected')`, `refuseOrder(id, reason)`, and `endOfDay()` (NOTE: endOfDay lives in orders.ts, not session.ts). All operator-guarded `ApiResult`s.
- src/lib/domain/notify.ts — `broadcast(input)` exported here (NOT a separate broadcast.ts); validates `broadcastSchema`, throttles per day, calls `dispatchBroadcast`. Use `broadcastSchema` from src/lib/utils/schemas.ts.
- src/app/api/admin/eod/route.ts — existing GET for the summary if you prefer a fetch over a direct call.
- src/components/ui/status.tsx — `OrderStatusChip`. src/components/ui/states.tsx — 4 states. src/components/ui/timeline.tsx — order timeline if useful. src/components/ui/nav.tsx — `BottomNav`. src/lib/i18n/server.ts — `getI18n()`. Add detail/verify/refuse/broadcast/end-of-day strings to messages/en.json + ar.json (verify, broadcast, end_of_day exist).

## Acceptance criteria (Given/When/Then)
- Given a QR order with an uploaded proof, When I review the proof, Then I can mark payment verified or rejected, and a rejection notifies the customer.
- Given an active order, When I cancel it with a reason, Then the customer is notified with that reason and any reserved quantity is returned to stock.
- Given customers opted in to notifications, When I send a broadcast, Then each opted-in customer receives it once in their preferred language.
- Given a completed trading day, When I open the end-of-day summary, Then it shows total orders, items sold and MYR revenue matching the session's orders.

## Definition of Done
- typecheck + lint clean; unit tests for verifyPayment verdicts, refuse (notify + restock), broadcast fan-out/throttle, and endOfDay totals; bilingual AR/EN strings (AR mirrors EN); 4 UI states; >=44px tap targets & RTL verified; committed ONE FILE PER COMMIT authored as the user; pushed to origin/main.

## Dependencies
- Runs after task-3-4 (order chips link into this detail page); relies on `src/lib/domain/orders.ts` (verifyPayment/refuseOrder/getOrder/endOfDay), `src/lib/domain/notify.ts` (broadcast), `broadcastSchema`, and the existing notifications dispatch (`dispatchBroadcast`, `dispatchOrderEvent`).
