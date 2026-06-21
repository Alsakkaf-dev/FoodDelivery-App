# task-2-3 — Checkout part 1 — fulfilment type + zone + address
> Day 2 · Sprint S2 · Scheduled: 2026-06-23T14:10:00+08:00 (Asia/Kuala_Lumpur, UTC+8)

## Goal
Build the first half of checkout: choose Delivery vs Walk-in/Pickup, and for Delivery show an active-zone picker plus address entry/save (with optional map pin) and saved-address reuse. Delivery-only fields appear only when Delivery is selected. This produces the `type`, `zone_id`, and `address_id` that task-2-4 submits.

## Scope — build exactly this
- `checkout/page.tsx` — the checkout shell (Server Component for initial data fetch of zones + saved addresses, client islands for interaction). Step 1 region: a fulfilment-type toggle (Delivery / Pickup) using `OrderType` values `'delivery' | 'pickup'` (NOTE: the schema enum is `pickup`, not `walk-in`). When Pickup is chosen, hide zone/address. When Delivery is chosen, render `ZonePicker` + `AddressForm`. Hold checkout draft state (type, zone_id, address_id) in component state or the cart store; do NOT place the order here (that is task-2-4).
- `zone-picker.tsx` — client component listing ACTIVE zones only; selects a `zone_id`. Source zones from `listZones(true)` passed as a prop from the server page.
- `address-form.tsx` — bilingual address entry (`line1`, optional `label`, optional `pin_lat`/`pin_lng` via a manual lat/lng or a 'use my location' button — no paid map API), plus a saved-address selector that lists prior addresses from `listAddresses()` for one-tap reuse. Saving calls `createAddress` (server action) which validates with `addressSchema`.
- Block progressing to payment for Delivery until an active zone AND an address are present, with a clear bilingual prompt.
- All 4 UI states (no active zones → empty/closed message; loading; error; offline).

## Requirements & user stories covered
- US-014 (FR-C-06) — Choose Delivery or Walk-in/Pickup; chosen type is stored on the order; delivery-only fields appear only for Delivery.
- US-015 (FR-C-07) — Select an active zone and enter/save an address with optional map pin; submission blocked without active zone + address (clear bilingual prompt); a previously saved address (with its pin) is reusable for a new delivery order.

## Design references (read these first)
- Shawarma/diagrams/uiux-scr-c-05-checkout.png (checkout screen)
- Shawarma/Documents/pdf format files/Design Phase/Fahman_Orders_UIUX.pdf (checkout flow, RTL form fields)
- Shawarma/Documents/pdf format files/Design Phase/Fahman_Orders_SDD.pdf (§6.1 schemas, addresses/zones entities)

## Files to CREATE
- src/app/(customer)/checkout/page.tsx — checkout shell + step 1 (fulfilment/zone/address)
- src/components/customer/zone-picker.tsx — active-zone selector
- src/components/customer/address-form.tsx — address entry/save + saved-address reuse

## Files to REUSE / MODIFY (already exist — do not rebuild)
- src/lib/domain/zones.ts — `listZones(activeOnly = false)`; call `listZones(true)` for active zones only.
- src/lib/domain/addresses.ts — `listAddresses(): Promise<ApiResult<Address[]>>` for saved-address reuse; `createAddress(input)` to save a new one (validated by `addressSchema`: requires `zone_id` + `line1`, optional `label`/`pin_lat`/`pin_lng`).
- src/lib/utils/schemas.ts — `addressSchema`; mirror the `createOrderSchema.refine` rule (delivery requires `zone_id` && `address_id`) for client-side gating.
- src/types/db.ts — `Zone`, `Address`, `OrderType`.
- src/components/ui/* — `EmptyState`/`ErrorState`/`OfflineBanner`, `LangToggle`, form controls.
- messages/en.json + messages/ar.json — reuse `delivery`, `pickup`, `choose_zone`, `address`; ADD keys (e.g. `save_address`, `use_saved_address`, `pin_location`, `address_required`) to BOTH (AR mirrors EN).

## Acceptance criteria (Given/When/Then)
- Scenario: Fulfilment type is stored — Given I am at checkout, When I select Delivery or Walk-in/Pickup, Then the chosen type is stored on the order, And delivery-only fields appear only for Delivery.
- Scenario: Delivery requires active zone and address — Given I chose Delivery, When I try to submit without an active zone and address, Then submission is blocked with a clear bilingual prompt.
- Scenario: Saved address is reusable — Given I saved an address before, When I start a new delivery order, Then I can reuse the saved address with its pin.

## Definition of Done
- typecheck + lint clean; unit/e2e for the delivery-vs-pickup field gating and the zone+address requirement; bilingual AR/EN strings present (AR mirrors EN); 4 UI states; >=44px tap targets & RTL verified; committed ONE FILE PER COMMIT authored as the user; pushed to origin/main.

## Dependencies
- Runs after task-2-2 (cart provides the items). Relies on `src/lib/domain/zones.ts`, `src/lib/domain/addresses.ts`, `src/lib/utils/schemas.ts`. Feeds `type`/`zone_id`/`address_id` into task-2-4.
