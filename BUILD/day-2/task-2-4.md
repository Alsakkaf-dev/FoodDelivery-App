# task-2-4 — Checkout part 2 — payment, ordering gate, place order
> Day 2 · Sprint S2 · Scheduled: 2026-06-23T16:40:00+08:00 (Asia/Kuala_Lumpur, UTC+8)

## Goal
Complete checkout: pick a payment method (COD with no proof, or DuitNow QR requiring a proof image uploaded to Supabase Storage), gate ordering so it only succeeds while Open / before cut-off / not Sold-Out, and place the order through the existing race-safe `createOrder` with a unique Idempotency-Key.

## Scope — build exactly this
- `payment-section.tsx` — client component: radio between `cod` and `duitnow_qr` (`PaymentMethod`). For DuitNow QR, show the static DuitNow QR image and require a proof upload before Place-order is enabled; for COD, no proof. Surface the live shop status (Open/Closed/Sold-Out + cut-off) so the Place-order button is disabled and a bilingual reason is shown when ordering is not allowed — read live status via `useShopStatus(initial)` seeded from `getStatus()`.
- `proof-upload.tsx` — client image picker that uploads to a Supabase Storage bucket (e.g. `payment-proofs`) using the browser client `createClient()` from `src/lib/supabase/client.ts`, then returns the public/signed URL as `proof_url`. Validate type/size; show preview; `>=44px` controls. (If the bucket does not exist yet, document it in supabase/seed or a migration note — do NOT hardcode secrets.)
- Wire Place-order: assemble `{ type, zone_id, address_id, payment_method, proof_url, items }` from the cart store + task-2-3 draft, generate a fresh `idempotency_key` (e.g. `crypto.randomUUID()`), and POST to `/api/orders` with header `Idempotency-Key: <key>` (the route injects it into `createOrder`). On success, clear the cart and route to `/orders/[id]` (task-2-5). Map `createOrder` error codes (`shop_not_open`, `past_cutoff`, `sold_out_or_insufficient`, `delivery_requires_zone_address`, `item_unavailable`, `empty_cart`) to bilingual messages.
- All 4 UI states including a submitting/loading state on the button and an error state for a rejected placement.

## Requirements & user stories covered
- US-016 (FR-C-08) — Ordering allowed only while Open and before cut-off; blocked after cut-off and when Closed or Sold-Out, each with a clear message.
- US-017 (FR-C-09) — Pay via COD (no proof) or DuitNow QR; QR confirmation blocked until a proof image is attached; COD places without proof.
- US-045/046/047 (FR-S-01/02/03) — Inventory: `createOrder` calls the `place_order` RPC which atomically decrements remaining quantity, enforces remaining >= 0 (no overselling), and reports `sold_out`; the UI must rely on this RPC (never decrement client-side) and react to a `sold_out_or_insufficient` failure.

## Design references (read these first)
- Shawarma/diagrams/uiux-scr-c-05-checkout.png (payment section)
- Shawarma/Documents/pdf format files/Design Phase/Fahman_Orders_UIUX.pdf (payment + ordering-gate states)
- Shawarma/Documents/pdf format files/Design Phase/Fahman_Orders_SDD.pdf (§5.1 place_order RPC, idempotency, inventory state machine)

## Files to CREATE
- src/components/customer/payment-section.tsx — method picker + ordering gate + place-order wiring
- src/components/customer/proof-upload.tsx — DuitNow proof image upload to Storage

## Files to REUSE / MODIFY (already exist — do not rebuild)
- src/lib/domain/orders.ts — `createOrder(input)` (race-safe; fires EVT-01). Do not re-implement order placement.
- src/app/api/orders/route.ts — POST reads the `Idempotency-Key` header and calls `createOrder`; send the header from the client. Returns 201 on success.
- src/lib/utils/schemas.ts — `createOrderSchema` (enums: `type` `'delivery'|'pickup'`, `payment_method` `'cod'|'duitnow_qr'`; `proof_url` optional URL; `items` min 1; `idempotency_key` 8–120 chars). Match this shape exactly.
- src/lib/realtime/hooks.ts — `useShopStatus(initial)` for live Open/Sold-Out gating.
- src/lib/domain/session.ts — `getStatus()` to seed shop status + `cutoff_time`.
- src/lib/supabase/client.ts — `createClient()` for the Storage upload.
- src/lib/cart/store.ts (task-2-2) — source of `items` and `clear()` after success.
- messages/en.json + messages/ar.json — reuse `payment`, `cod`, `duitnow`, `upload_proof`, `place_order`, `order_placed`, `shop_closed_msg`, `sold_out_msg`; ADD error-code keys to BOTH (AR mirrors EN).

## Acceptance criteria (Given/When/Then)
- Scenario: QR order requires a proof image — Given I chose DuitNow QR, When I try to confirm without uploading a proof image, Then confirmation is blocked until a proof image is attached.
- Scenario: COD needs no proof — Given I chose Cash on Delivery, When I confirm the order, Then the order is placed without a proof upload.
- Scenario: Blocked after cut-off — Given the cut-off time has passed, When I try to place an order, Then ordering is blocked with a clear message explaining why.
- Scenario: Blocked when Closed or Sold-Out — Given the shop is Closed or Sold-Out, When I try to place an order, Then ordering is blocked.
- Scenario: No overselling — Given remaining quantity is insufficient, When two orders race, Then the `place_order` RPC keeps remaining >= 0 and the losing client sees a sold-out/insufficient message.

## Definition of Done
- typecheck + lint clean; unit/e2e covering COD-no-proof, QR-requires-proof, and a blocked-when-closed path; bilingual AR/EN strings present (AR mirrors EN); 4 UI states; >=44px tap targets & RTL verified; no inlined secrets; committed ONE FILE PER COMMIT authored as the user; pushed to origin/main.

## Dependencies
- Runs after task-2-3 (fulfilment/zone/address) and task-2-2 (cart items). Relies on `createOrder`, POST /api/orders, `createOrderSchema`, `useShopStatus`/`getStatus`, and the `place_order` RPC. Routes to task-2-5 on success.
