# task-5-2 — E2E tests (Playwright) for the 3 role journeys
> Day 5 · Sprint S4 · Scheduled: 2026-06-26T11:40:00+08:00 (Asia/Kuala_Lumpur, UTC+8)

## Goal
Provide Playwright end-to-end specs that walk each of the three roles through its core journey on the built UI (Customer order, Operator manage, Rider deliver), plus the sold-out / cut-off / RTL guard cases, so `npm run test:e2e` proves the app works as a whole.

## Scope — build exactly this
- `tests/e2e/customer.spec.ts` — Customer journey: land on menu (`src/app/(customer)/menu`), add an item, go to cart → checkout (delivery: pick zone + address, COD), place order, land on `orders/[id]` and see a live status timeline. Assert order-number visible and the 4 UI states render (empty cart, loading, error toast on a forced failure).
- `tests/e2e/operator.spec.ts` — Operator journey: log in as operator, open `operator/setup`, configure session (qty_total, cutoff, delivery window, zones) and Open Shop; on `operator/board` see the new order and advance it through the lane columns (new→confirmed→preparing→ready→out_for_delivery); verify a delivered/payment action.
- `tests/e2e/rider.spec.ts` — Rider journey (UI already built): log in as rider, see today’s deliveries on `/rider`, open `/rider/[id]`, tap Pickup then Deliver, confirm the card moves to the delivered group.
- `tests/e2e/guards.spec.ts` — sold-out + cut-off + RTL: when status is Sold-Out the menu/checkout CTA is disabled and a sold-out banner shows; after cut-off, placing an order surfaces the `past_cutoff` error; switching locale to `ar` sets `dir="rtl"` on the layout and mirrors nav. Assert ≥44px tap targets via bounding-box checks on primary buttons.
- Use Playwright fixtures/route-mocking or seeded test accounts to drive auth (phone-OTP); stub OTP verify and Supabase reads where a live backend is unavailable in CI, matching the API envelope `{ ok, data | error }`.

## Requirements & user stories covered
- UAT journeys (Customer / Operator / Rider) — full happy-path acceptance.
- US-046 (FR-S-02) sold-out behavior surfaced to the customer; US-047 auto Sold-Out at remaining=0; US-048 (FR-S-04) auto-close at cut-off.
- US-007 (PDPA consent) — consent checkbox blocks signup until checked.

## Design references (read these first)
- Shawarma/diagrams/figure-4-order-lifecycle.png and Shawarma/diagrams/sdd-fig-2-order-state.png (the journey the e2e must traverse)
- Shawarma/diagrams/uiux-fig-4-states.png (the 4 UI states each screen must show)
- Shawarma/Documents/pdf format files/Design Phase/Fahman_Orders_UIUX.pdf (RTL parity, tap-target tokens)

## Files to CREATE
- tests/e2e/customer.spec.ts — browse → order (delivery, COD) end-to-end
- tests/e2e/operator.spec.ts — open shop + advance a live order on the board
- tests/e2e/rider.spec.ts — pickup → deliver a delivery
- tests/e2e/guards.spec.ts — sold-out, cut-off, RTL + tap-target checks

## Files to REUSE / MODIFY (already exist — do not rebuild)
- playwright.config.ts — targets `tests/e2e`, projects `android` (Pixel 5) + `desktop`, webServer runs `npm run start` on :3000. Reuse as-is.
- src/lib/realtime/hooks.ts — selectors should wait for live updates driven by `useOrderBoard`, `useOrderStatus`, `useRiderFeed`, `useShopStatus`.
- src/app/(rider)/rider/* and src/components/rider/* — the finished Rider UI is the selector reference.
- messages/en.json + messages/ar.json — assert against real i18n strings, not hard-coded English.

## Acceptance criteria (Given/When/Then)
- US-048 — Given the cut-off time has passed, When a customer tries to place an order, Then no order is accepted and a past-cut-off message is shown.
- US-047 — Given remaining quantity reaches zero, When the last portion is taken, Then status becomes Sold-Out within 2 seconds and the order CTA is disabled.
- Customer UAT — Given an open shop with stock, When I browse → add → checkout (delivery, COD), Then an order is created and I see its live status.
- Rider UAT — Given an assigned delivery, When I tap Pickup then Deliver, Then the order reaches delivered.

## Definition of Done
typecheck + lint clean; `npm run test:e2e` green locally (android + desktop projects); RTL asserted via `dir="rtl"`; ≥44px tap targets asserted on primary CTAs; specs use i18n keys; committed ONE FILE PER COMMIT authored as the user; pushed to origin/main.

## Dependencies
- Runs after the Customer and Operator screens exist (Days 3–4) and after task-5-1; relies on existing realtime hooks, route handlers under `src/app/api/*`, and the built UI.
