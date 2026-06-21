# task-4-4 — Automation & inventory integrity
> Day 4 · Sprint S4 · Scheduled: 2026-06-25T16:40:00+08:00 (Asia/Kuala_Lumpur, UTC+8)

## Goal
Prove and operationalize the system-automation guarantees: the race-safe atomic decrement (remaining never < 0 under concurrency), auto-flip to Sold-Out at remaining=0 (<2 s), auto-close at the cut-off and at 19:00 MYT, and restock of reserved quantity on cancel/refuse. The SQL exists; this task wires the scheduled trigger and adds concurrency/boundary tests.

## Scope — build exactly this
- Verify the atomic reservation in `place_order` (0003_functions.sql): the conditional `UPDATE daily_session SET qty_remaining = qty_remaining - v_item_count WHERE status='open' AND qty_remaining >= v_item_count` — confirm `IF NOT FOUND` raises `sold_out_or_insufficient` (no global lock, FR-S-02).
- Verify auto sold-out: `place_order` sets status='sold_out' when `v_remaining = 0` in the same transaction (FR-S-03); the client sees it <2 s via the shop:status channel (task-4-2).
- Wire the **scheduled auto-close** job to call `auto_close_expired_sessions()` (already defined; closes when MYT now ≥ 19:00 or past cutoff). Since the project is free-tier on Vercel, add a GitHub Actions scheduled workflow `.github/workflows/auto-close.yml` (cron every few minutes during trading hours, UTC) that invokes a tiny protected API route, OR a Supabase cron statement in a new migration — pick GitHub Actions + a secured route to stay within free tier. Create `src/app/api/admin/auto-close/route.ts` (POST, guarded by a shared secret header) that calls the RPC via the admin client.
- Verify restock: the `orders_restock` trigger (`restock_after_cancel`) returns `old.item_count` to qty_remaining and reverts sold_out→open; confirm `cancelOrder`/`refuseOrder` set status='cancelled' so the trigger fires.
- Add tests: a concurrency test (two orders for the last portion → exactly one succeeds), boundary tests for cutoff/19:00 using the time helpers, and a restock test.

## Requirements & user stories covered
- **US-045 (FR-S-01)** — Given remaining is N, When an order for k portions is accepted, Then remaining becomes N−k.
- **US-046 (FR-S-02)** — Given remaining is 1, When two orders for the last portion arrive at the same instant, Then exactly one succeeds, the other is rejected, And remaining never goes below zero (atomic guard, no global lock).
- **US-047 (FR-S-03)** — Given remaining reaches zero, When the last portion is taken, Then status becomes Sold-Out within 2 s And the sold-out broadcast fires once.
- **US-048 (FR-S-04)** — Given the cut-off time, When the time passes, Then no new orders are accepted even if stock remains. (Plus US-049/FR-S-05: auto-close at 19:00 MYT.)

## Design references (read these first)
- Shawarma/diagrams/sdd-fig-3-shop-state.png (shop state machine: open → sold_out / closed transitions)
- Shawarma/Documents/pdf format files/Design Phase/Fahman_Orders_SDD.pdf §3.5 (race-safe flow), §5.1 (place_order), §4.1 (restock)

## Files to CREATE
- src/app/api/admin/auto-close/route.ts — POST, secret-header guarded, calls `auto_close_expired_sessions()` via `createAdminClient`.
- .github/workflows/auto-close.yml — scheduled cron (UTC equiv of MYT trading window) curling the route with the secret.
- tests/unit/inventory.test.ts — decrement math, restock-on-cancel, sold-out-at-zero boundary.
- tests/unit/auto-close.test.ts — cutoff and 19:00 MYT boundary using `pastCutoff`/`withinTradingHours`.

## Files to REUSE / MODIFY (already exist — do not rebuild)
- supabase/migrations/0003_functions.sql — `place_order`, `restock_after_cancel` + `orders_restock` trigger, `auto_close_expired_sessions`, `next_order_no`. Do not duplicate; add a new migration only if a guard is missing.
- src/lib/domain/orders.ts — `createOrder` (calls `place_order` RPC; surfaces `sold_out`), `cancelOrder`, `refuseOrder` (drive the restock trigger).
- src/lib/domain/session.ts — `setSoldOut`, `closeShop`, `openShop`, `getStatus` (status surface).
- src/lib/utils/time.ts — `nowMyt`, `withinTradingHours`, `pastCutoff`, `OPEN_HOUR`, `CLOSE_HOUR`, `TZ`. Reuse for boundary tests; do not reimplement TZ math.
- src/lib/supabase/admin.ts — `createAdminClient` for the cron route.

## Acceptance criteria (Given/When/Then)
- Copy US-045/046/047/048 scenarios above verbatim. Critically: concurrent orders for remaining=1 → exactly one succeeds, remaining never < 0; sold-out auto-set at zero with one broadcast; no order accepted after cutoff or 19:00 MYT; cancel/refuse returns reserved units and reverts sold_out→open.

## Definition of Done
typecheck + lint clean; inventory + auto-close unit tests added/green; the scheduled job is protected by a secret (no secret inlined — env/Actions secret only); migrations idempotent; committed ONE FILE PER COMMIT authored as the user; pushed to origin/main.

## Dependencies
Runs after task-4-1 (sold-out broadcast dispatch) and benefits from task-4-2 (the <2 s sold-out propagation). Relies on `supabase/migrations/0003_functions.sql`, `src/lib/domain/{orders,session}.ts`, `src/lib/utils/time.ts`, `createAdminClient`.
