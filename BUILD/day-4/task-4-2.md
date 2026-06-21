# task-4-2 — Realtime correctness across all channels (<2s, reconnect, snapshot)
> Day 4 · Sprint S3 · Scheduled: 2026-06-25T11:40:00+08:00 (Asia/Kuala_Lumpur, UTC+8)

## Goal
Make all five Supabase Realtime channels demonstrably correct: changes propagate to subscribed clients in <2 s, a late-joining client renders the **current** snapshot, and a dropped socket gracefully degrades to a periodic refresh fallback. Refinements to the hooks + tests, no new screens.

## Scope — build exactly this
- Audit `src/lib/realtime/hooks.ts`: `useShopStatus` (shop:status + shop:qty), `useOrderBoard` (board:orders), `useOrderStatus` (order:{id}), `useRiderFeed` (rider:feed). Each must seed state from the server-rendered `initial` prop so a late joiner shows current truth immediately.
- Add a **reconnect / dropped-socket fallback**: subscribe with a status callback; on `CHANNEL_ERROR`/`TIMED_OUT`/`CLOSED`, start a periodic re-fetch (e.g. ~10 s) of the relevant API (`/api/status`, `/api/board`, `/api/orders/[id]`, `/api/rider/deliveries`) and stop polling once `SUBSCRIBED` returns. Keep it a small shared helper inside hooks.ts; do not change the public hook signatures consumers already use.
- Fix `useOrderBoard` INSERT ordering / dedupe so a re-delivered INSERT does not duplicate a row already present (guard by id).
- Ensure `useShopStatus` reflects both status and qty_remaining from the single `daily_session` UPDATE (already one row — verify the cast).
- Add tests: a Vitest unit test for the reducer/merge logic (extract pure merge functions if needed) and a Playwright e2e asserting a status change is reflected without a manual refresh.

## Requirements & user stories covered
- **US-010 (FR-S-07, NFR-P-01)** — *Given* many subscribed clients *When* status/quantity changes *Then* ≥95% reflect it within 2 s; *And* a late joiner immediately receives current status and quantity.
- **US-021 (FR-C-11)** — *Given* I am viewing my order tracking *When* operator/rider advances status *Then* my view updates within 2 s without refresh.
- **US-032 (FR-O-09/S-08)** — *Given* the order board is open *When* a customer places an order *Then* it appears in New within 2 s without refresh.
- **US-044 (FR-R-07/S-08)** — *Given* my deliveries screen is open *When* an order is marked Ready in my zone *Then* it appears within 2 s.

## Design references (read these first)
- Shawarma/diagrams/srs-fig-6-realtime-sequence.png (the publish→subscribe sequence + latency budget)
- Shawarma/Documents/pdf format files/Design Phase/Fahman_Orders_SDD.pdf §5.3 (Realtime channels) and the SRS NFR-P-01 latency spec

## Files to CREATE
- tests/unit/realtime-merge.test.ts — pure board/feed merge + dedupe-by-id assertions.
- tests/e2e/realtime.spec.ts — Playwright: a status/board change appears without reload (may stub via the API where realtime infra is unavailable in CI).

## Files to REUSE / MODIFY (already exist — do not rebuild)
- src/lib/realtime/hooks.ts — `useShopStatus`, `useOrderBoard`, `useOrderStatus`, `useRiderFeed`. Add reconnect/poll fallback + INSERT dedupe; keep signatures stable.
- src/lib/supabase/client.ts — `createClient` (the browser client used to open channels).
- src/app/api/status/route.ts, src/app/api/board/route.ts, src/app/api/orders/[id]/route.ts, src/app/api/rider/deliveries/route.ts — the periodic-refresh fallback endpoints.
- src/components/rider/rider-feed-seed.tsx — confirms the snapshot-seed pattern already in use; mirror it.

## Acceptance criteria (Given/When/Then)
- **Propagation <2 s (US-010/021/032/044):** Given a subscribed client, When the underlying row changes, Then the UI reflects it within 2 s without a manual refresh.
- **Late joiner gets current state (US-010):** Given a change already happened, When a new client mounts, Then it renders the current status/quantity from the seeded initial value (no flash of stale data).
- **Dropped socket fallback (NFR-R-04):** Given the socket drops, When the channel errors/closes, Then the hook falls back to periodic API refresh and resumes live updates on reconnect.

## Definition of Done
typecheck + lint clean; unit + e2e added/green; no behavior regression for existing customer/operator/rider screens consuming these hooks; bilingual UI unaffected; RTL unaffected; committed ONE FILE PER COMMIT authored as the user; pushed to origin/main.

## Dependencies
Runs after task-4-1. Relies on `src/lib/realtime/hooks.ts`, the Supabase browser client, and the existing read APIs used as fallback. task-4-3 (rider feed) consumes the hardened `useRiderFeed`.
