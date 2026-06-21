# task-3-4 — Live order board — columns, advance, dispatch
> Day 3 · Sprint S1/S3 · Scheduled: 2026-06-24T16:40:00+08:00 (Asia/Kuala_Lumpur, UTC+8)

## Goal
Build the live order board at `/operator/board`: a status-columned view where new orders appear within 2 seconds via realtime, the operator advances each order only through legal lifecycle transitions, and Ready delivery orders can be dispatched to the rider.

## Scope — build exactly this
- `src/app/(operator)/operator/board/page.tsx` — server component. Seed via `boardList()`, render header + `BottomNav` + the board client island.
- `src/components/operator/board-column.tsx` — renders one status column (New, Confirmed, Preparing, Ready, Out-for-Delivery, Delivered) with its order chips and a count badge.
- `src/components/operator/order-chip.tsx` — `'use client'` chip showing order_no, type, item_count, total (MYR), `OrderStatusChip`, and an Advance button. The Advance button must only offer the legal next status from `ORDER_TRANSITIONS` and call `advanceOrder({ id, to_status })`; an invalid transition is rejected by the action (`invalid_transition`). For a Ready delivery order show a Dispatch button calling `dispatchOrder(id)` (advances to out_for_delivery). The board itself is a client wrapper using `useOrderBoard(initial)` so INSERT/UPDATE stream live; group the live `orders` array by status into columns.

## Requirements & user stories covered
- US-032 (FR-O-09) — Given the order board is open, When a customer places an order, Then it appears in the New column within 2 seconds without refresh.
- US-033 (FR-O-10) — Given an order in a given state, When I advance it to the next valid state, Then the status updates and exactly one matching notification fires; When an invalid transition is attempted, Then it is rejected and state is unchanged.
- US-034 (FR-O-11) — Given a Ready delivery order, When I dispatch it to the rider, Then it appears in the rider's deliveries grouped under its zone.

## Design references (read these first)
- Shawarma/diagrams/uiux-scr-o-03-board.png
- Shawarma/diagrams/sdd-fig-*.png (order state machine) · uiux-fig-1-components.png
- Shawarma/Documents/pdf format files/Design Phase/Fahman_Orders_SDD.pdf (order lifecycle / state machine §5) and Fahman_Orders_UIUX.pdf (board layout).

## Files to CREATE
- src/app/(operator)/operator/board/page.tsx — board server component (seeds boardList).
- src/components/operator/board-column.tsx — one status column with chips + count.
- src/components/operator/order-chip.tsx — client chip with legal advance + dispatch actions.

## Files to REUSE / MODIFY (already exist — do not rebuild)
- src/lib/domain/orders.ts — `boardList()`, `advanceOrder({ id, to_status })` (validates via canTransition + fires one status notification), `dispatchOrder(id)` (= advance to out_for_delivery).
- src/types/db.ts — `ORDER_TRANSITIONS` and `canTransition(from,to)` to compute the legal next status for the button (do not hardcode).
- src/lib/realtime/hooks.ts — `useOrderBoard(initial)` (channel board:orders).
- src/app/api/board/route.ts — existing GET for the seed if needed.
- src/components/ui/status.tsx — `OrderStatusChip`. src/components/ui/states.tsx — 4 states. src/components/ui/nav.tsx — `BottomNav`. src/lib/i18n/server.ts — `getI18n()`. Add board/advance/dispatch strings to messages/en.json + ar.json (order_board exists).

## Acceptance criteria (Given/When/Then)
- Given the order board is open, When a customer places an order, Then it appears in the New column within 2 seconds without refresh.
- Given an order in a given state, When I advance it to the next valid state, Then the status updates and exactly one matching notification fires.
- Given an order in a given state, When an invalid transition is attempted, Then it is rejected and the state is unchanged.
- Given a Ready delivery order, When I dispatch it to the rider, Then it appears in the rider's deliveries grouped under its zone.

## Definition of Done
- typecheck + lint clean; unit test for legal vs illegal transition + an e2e asserting live insertion; bilingual AR/EN strings (AR mirrors EN); 4 UI states; >=44px tap targets & RTL verified; committed ONE FILE PER COMMIT authored as the user; pushed to origin/main.

## Dependencies
- Runs after task-3-1..3-3 (shares operator nav). The dispatch path (US-034) depends on the existing rider deliveries screen (`src/app/(rider)/rider/page.tsx`, `riderDeliveries`) already built. Relies on `useOrderBoard`, `advanceOrder`, `ORDER_TRANSITIONS`.
