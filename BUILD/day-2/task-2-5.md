# task-2-5 — Order confirmation + tracking timeline + history
> Day 2 · Sprint S2 · Scheduled: 2026-06-23T19:10:00+08:00 (Asia/Kuala_Lumpur, UTC+8)

## Goal
Show the customer a confirmation/tracking screen for a placed order (lifecycle timeline with the current state highlighted, updating live in under 2s) and an order-history list (date, items, MYR total, final status).

## Scope — build exactly this
- `orders/[id]/page.tsx` — Server Component fetches the order + items via `getOrder(id)`, renders confirmation header (order_no, type, payment method/status) and the lifecycle `Timeline`. Hydrate a client island that subscribes with `useOrderStatus(id, initialOrder)` so operator/rider advances reflect within 2s without refresh; re-render the `Timeline` from the live `order.status`. Show order lines (bilingual names, qty, MYR line totals) and `formatMYR(total)`. Cancelled orders render the timeline's cancelled branch.
- `history/page.tsx` — Server Component calls `listMyOrders()` and lists each past order as a row: date (created_at, MYT), item summary/count, `formatMYR(total)`, and final status chip. Each row links to `/orders/[id]`.
- Both screens implement all 4 UI states (empty history → `EmptyState`; loading; error: fetch failed; offline banner). `>=44px` tap targets, RTL verified.

## Requirements & user stories covered
- US-018 (FR-C-10) — Order confirmation shows a tracking timeline listing ALL lifecycle states with the current one highlighted.
- US-021 (FR-C-11) — Order status updates in real time: an operator/rider status advance appears in the customer's tracking view within 2 seconds without refresh (NFR-P-01).
- US-020 (FR-C-12) — Order history: each row shows date, items, MYR total and final status.

## Design references (read these first)
- Shawarma/diagrams/uiux-scr-c-06-tracking.png (confirmation/tracking)
- Shawarma/diagrams/uiux-scr-c-07-history.png (order history)
- Shawarma/Documents/pdf format files/Design Phase/Fahman_Orders_UIUX.pdf (timeline component CMP-U-13, history list)
- Shawarma/Documents/pdf format files/Design Phase/Fahman_Orders_SDD.pdf (§4.1 order lifecycle, §5.3 realtime channels)

## Files to CREATE
- src/app/(customer)/orders/[id]/page.tsx — confirmation + live tracking timeline
- src/app/(customer)/history/page.tsx — order history list

## Files to REUSE / MODIFY (already exist — do not rebuild)
- src/lib/realtime/hooks.ts — `useOrderStatus(orderId, initial)` (subscribes to `order:{id}`, returns the live `Order`); drives the <2s update.
- src/lib/domain/orders.ts — `getOrder(id)` (returns `{ order, items }`) for the detail page; `listMyOrders()` (newest first) for history.
- src/app/api/orders/[id]/route.ts — GET order + items (RLS-restricted) if a client refetch is needed.
- src/components/ui/timeline.tsx — `Timeline({ status, lang })` renders the full FLOW with the current state highlighted and a separate cancelled branch; reuse as-is.
- src/lib/utils/money.ts — `formatMYR` for totals/line totals.
- src/lib/utils/time.ts — for MYT date formatting in history rows.
- src/components/ui/* — `EmptyState`/`ErrorState`/`OfflineBanner`, `OrderStatusChip` (status), `LangToggle`, `BottomNav`.
- src/types/db.ts — `Order`, `OrderItem`, `OrderStatus`.
- messages/en.json + messages/ar.json — reuse `order_placed`, `track_order`, `order_history`, `delivered`; ADD keys (e.g. `no_orders`, `order_no`, `final_status`) to BOTH (AR mirrors EN).

## Acceptance criteria (Given/When/Then)
- Scenario: Timeline lists states and highlights current — Given I just placed an order, When the confirmation appears, Then a timeline lists all lifecycle states and highlights the current one.
- Scenario: Operator/rider change appears within 2 s — Given I am viewing my order's tracking, When the operator or rider advances the status, Then my view updates within 2 seconds without refresh.
- Scenario: History shows key fields — Given I have completed orders, When I open order history, Then each row shows date, items, MYR total and final status.

## Definition of Done
- typecheck + lint clean; unit/e2e for timeline highlighting at a given status and a live-update test (or a history-row render test); bilingual AR/EN strings present (AR mirrors EN); 4 UI states; >=44px tap targets & RTL verified; committed ONE FILE PER COMMIT authored as the user; pushed to origin/main.

## Dependencies
- Runs after task-2-4 (place-order routes here with the new order id). Relies on `useOrderStatus`, `getOrder`/`listMyOrders`, and `src/components/ui/timeline.tsx`. Closes the Day-2 customer ordering flow.
