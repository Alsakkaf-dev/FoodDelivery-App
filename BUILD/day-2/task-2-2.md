# task-2-2 — Cart (add / quantity / remove, live total)
> Day 2 · Sprint S2 · Scheduled: 2026-06-23T11:40:00+08:00 (Asia/Kuala_Lumpur, UTC+8)

## Goal
Give the customer a client-side cart: add items, change quantity, remove lines, with the item count and MYR total recomputed immediately on every change. The cart persists across menu navigation (within the session) and feeds checkout in task-2-3/2-4.

## Scope — build exactly this
- `cart/store.ts` — a client cart store (Zustand or a React context + `useReducer`; if Zustand is not already a dependency, use a small context/provider — verify `package.json` before adding deps). Shape per line: `{ menu_item_id, name_en, name_ar, unit_price, qty }`. Actions: `add(item)`, `increment(id)`, `decrement(id)` (removing at qty 0), `remove(id)`, `clear()`. Derived selectors: `itemCount` and `total` (compute via `sumLines` from money util). Persist to `localStorage` so the cart survives reloads.
- `cart-line.tsx` — one editable cart row: bilingual name, unit price, `Stepper` for qty, remove button, line subtotal in MYR. `>=44px` controls.
- `cart/page.tsx` — lists `CartLine`s, shows live item count + `formatMYR(total)`, a sticky checkout CTA linking to `/checkout` (disabled when empty), and the empty state (`t.empty_cart`). Implement all 4 UI states (empty cart, loading hydration, error, offline banner).
- Wire the menu detail/list Add control (task-2-1) to `cart/store.ts` `add()`.

## Requirements & user stories covered
- US-013 (FR-C-05) — Customer adds items and chooses quantities in a cart so the whole order is assembled before checkout; the cart item count and MYR total update immediately on each add/increase/remove.

## Design references (read these first)
- Shawarma/diagrams/uiux-scr-c-04-cart.png (cart screen)
- Shawarma/Documents/pdf format files/Design Phase/Fahman_Orders_UIUX.pdf (cart screen + Stepper component spec)

## Files to CREATE
- src/app/(customer)/cart/page.tsx — cart screen, live total, 4 states
- src/lib/cart/store.ts — client cart state + persistence + derived count/total
- src/components/customer/cart-line.tsx — single editable cart row

## Files to REUSE / MODIFY (already exist — do not rebuild)
- src/lib/utils/money.ts — `formatMYR(amount, locale)` and `sumLines(lines)` (lines = `{ qty, unit_price }[]`); use these for line subtotal and grand total — do NOT hand-roll currency formatting.
- src/components/ui/controls.tsx — `Stepper` for quantity; `LangToggle`.
- src/components/ui/states.tsx — `EmptyState`, `Loading`, `ErrorState`, `OfflineBanner`.
- src/lib/i18n/server.ts / dictionaries — `cart`, `checkout`, `empty_cart`, `quantity`, `add_to_cart` already exist; ADD new keys (e.g. `remove`, `subtotal`, `cart_total`) to BOTH messages/en.json and messages/ar.json.
- src/types/db.ts — `MenuItem` for the add() payload mapping.

## Acceptance criteria (Given/When/Then)
- Scenario: Cart total updates on every change — Given I am viewing the menu, When I add, increase or remove items, Then the cart item count and MYR total update immediately on each change.

## Definition of Done
- typecheck + lint clean; unit test for the store reducer/selectors (add/increment/decrement/remove → correct count + total); bilingual AR/EN strings present (AR mirrors EN); 4 UI states; >=44px tap targets & RTL verified; committed ONE FILE PER COMMIT authored as the user; pushed to origin/main.

## Dependencies
- Runs after task-2-1 (menu Add control hooks into this store). Relies on `src/lib/utils/money.ts` and `src/components/ui/controls.tsx`. The store is the source of `items` for task-2-4 `createOrder`.
