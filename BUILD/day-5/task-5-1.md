# task-5-1 — Unit tests (Vitest) for domain logic
> Day 5 · Sprint S4 · Scheduled: 2026-06-26T09:10:00+08:00 (Asia/Kuala_Lumpur, UTC+8)

## Goal
Add a focused Vitest unit suite that locks down the pure/near-pure logic the whole app depends on — order state machine, inventory guard, money math, time/cut-off, and Zod schemas — so `npm run test:unit` runs green in CI and regressions are caught before they ship.

## Scope — build exactly this
- `tests/unit/orders.test.ts` — exercise the state machine `canTransition(from,to)` and `ORDER_TRANSITIONS` from `src/types/db.ts`: every legal edge (new→confirmed, confirmed→preparing, preparing→ready, ready→out_for_delivery, out_for_delivery→delivered, new/confirmed→cancelled) returns true; illegal/back/skip edges (e.g. new→delivered, delivered→preparing, ready→new) return false; terminal states (`delivered`, `cancelled`) allow no exits.
- `tests/unit/money.test.ts` — `sumLines` and `formatMYR` from `src/lib/utils/money.ts`: sum of mixed qty×unit_price lines, empty array = 0, 2-decimal MYR formatting for `en` and `ar` locales.
- `tests/unit/time.test.ts` — `withinTradingHours`, `pastCutoff`, `nowMyt` from `src/lib/utils/time.ts`: assert OPEN_HOUR=13/CLOSE_HOUR=19 boundaries by mocking the clock with `vi.useFakeTimers()`/`vi.setSystemTime()`; `pastCutoff(null)===false`; cut-off string compared HH:MM.
- `tests/unit/schemas.test.ts` — Zod schemas from `src/lib/utils/schemas.ts`: `createOrderSchema` rejects empty `items` (empty_cart) and delivery without zone+address (delivery_requires_zone_address refine), accepts a valid pickup order; `otpVerifySchema` requires 6-digit code; `configureSessionSchema` rejects bad cutoff format and negative qty.
- `tests/unit/api.test.ts` — `ok`/`fail`/`httpStatus` + `ERROR_STATUS` from `src/lib/utils/api.ts`: envelope shape and code→status mapping (sold_out_or_insufficient→409, validation_error→400, unknown→500).
- Cover the inventory-guard invariant at the logic level: a helper assertion that remaining can never be driven < 0 (model the conditional-decrement contract; the race-safe DB RPC `place_order` is integration-tested elsewhere).

## Requirements & user stories covered
- US-046 (FR-S-02) — System enforces remaining ≥ 0 (race-safe, no overselling). Verification target for the inventory guard and transition correctness.
- US-048 (FR-S-04) — auto-close at cut-off; the `pastCutoff` boundary tests verify the time logic that backs it.

## Design references (read these first)
- Shawarma/diagrams/sdd-fig-2-order-state.png (order state machine — the legal transition set)
- Shawarma/diagrams/figure-4-order-lifecycle.png (end-to-end order lifecycle)
- Shawarma/Documents/pdf format files/Design Phase/Fahman_Orders_SDD.pdf (§5 state machines, §6 API envelope)

## Files to CREATE
- tests/unit/orders.test.ts — state-machine transition coverage
- tests/unit/money.test.ts — money math + MYR formatting
- tests/unit/time.test.ts — MYT trading-hours & cut-off boundaries
- tests/unit/schemas.test.ts — Zod validation happy + negative paths
- tests/unit/api.test.ts — result envelope + HTTP status mapping

## Files to REUSE / MODIFY (already exist — do not rebuild)
- vitest.config.ts — already includes `tests/unit/**/*.test.ts`, node env, `@`→`src` alias, `globals:true`. Do not change unless coverage is added.
- src/types/db.ts — import `canTransition`, `ORDER_TRANSITIONS`, `OrderStatus`.
- src/lib/utils/money.ts — import `sumLines`, `formatMYR`.
- src/lib/utils/time.ts — import `withinTradingHours`, `pastCutoff`, `nowMyt`, `OPEN_HOUR`, `CLOSE_HOUR`.
- src/lib/utils/schemas.ts — import `createOrderSchema`, `otpVerifySchema`, `configureSessionSchema`, `advanceOrderSchema`.
- src/lib/utils/api.ts — import `ok`, `fail`, `httpStatus`, `ERROR_STATUS`.

## Acceptance criteria (Given/When/Then)
- US-046 — Given remaining quantity is 1, When two orders for the last portion arrive at the same instant, Then exactly one succeeds and the other is rejected, And remaining never goes below zero. (Unit level: the decrement guard returns failure once remaining hits 0; transitions stay valid.)
- US-046 — Given high concurrency at open, When many orders compete for stock, Then an atomic conditional update enforces correctness without a global lock (asserted via the guard contract; concurrency itself covered in e2e/DB).
- State machine — Given an order in any status, When an illegal transition is attempted, Then `canTransition` returns false and no move is allowed.

## Definition of Done
typecheck + lint clean; `npm run test:unit` green with the new suites; no app/runtime code changed except test files; AR/EN not applicable (pure logic) but locale branches of `formatMYR` both asserted; committed ONE FILE PER COMMIT authored as the user; pushed to origin/main.

## Dependencies
- First Day-5 task; relies only on existing pure modules under `src/lib/utils/*` and `src/types/db.ts`. No DB or network. Blocks task-5-5 (final green gate).
