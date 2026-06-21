# task-4-3 — Rider flow completion & polish
> Day 4 · Sprint S3 · Scheduled: 2026-06-25T14:10:00+08:00 (Asia/Kuala_Lumpur, UTC+8)

## Goal
Bring the already-scaffolded rider flow to the same quality bar as the customer/operator screens: verified zone-grouped today list, complete delivery detail with map deep-link and one-tap Picked-up/Delivered, a live ready-feed, and all four UI states (empty/loading/error/offline) in both AR (RTL) and EN with ≥44px tap targets. This is gap-fill + polish, not a rebuild.

## Scope — build exactly this
- Verify SCR-R-01 (`src/app/(rider)/rider/page.tsx`): today's `ready`/`out_for_delivery` delivery orders grouped by zone via `riderDeliveries()`; empty/error states present; add an explicit `loading.tsx` skeleton if the existing one is thin; confirm the live feed banner (`RiderFeedSeed` + `useRiderFeed`).
- Verify SCR-R-02 (`src/app/(rider)/rider/[id]/page.tsx`): address, map deep-link, `tel:` link, items, payment method/status, and the `RiderActions` button. Add the missing **payment method/status** display (US-040 requires it — current detail shows items/total but not payment fields) by reading them off `order` (payment_method, payment_status).
- Map deep-link: confirm `buildMapsLink`/`mapsLink` produce a Google Maps `search` URL from pin or address (FR-R-04); ensure it opens in a new tab with rel=noopener.
- One-tap actions: `RiderActions` shows Picked-up while `ready` and Delivered while `out_for_delivery`, calling `riderPickup`/`riderDeliver`; confirm buttons are h-16 (≥44px) and disabled-while-busy.
- A11y/i18n sweep: every visible string from `messages/en.json` + `messages/ar.json` (keys like deliveries, picked_up, delivered, open_map, address, cart); set `dir` by locale; verify the not-found / offline paths.
- Add Playwright e2e for the rider happy path and a unit test for `mapsLink`/`buildMapsLink`.

## Requirements & user stories covered
- **US-039 (FR-R-02)** — Given a mix of orders across days/states, When I open my deliveries, Then only today's ready/out-for-delivery orders appear, grouped by zone.
- **US-040 (FR-R-03)** — Given a delivery in my list, When I open it, Then I see address, map link, customer phone, items, and payment method/status.
- **US-041 (FR-R-04)** — Given a saved pin/address, When I tap the map link, Then the device map opens at that location.
- **US-042 (FR-R-05)** — Given an assigned delivery, When I mark Picked up, Then it moves to Out-for-Delivery and the customer is notified.
- **US-043 (FR-R-06)** — Given an out-for-delivery order, When I mark Delivered, Then it completes and the delivered notification fires.
- **US-044 (FR-R-07)** — Given my deliveries screen is open, When an order is marked Ready in my zone, Then it appears within 2 s.

## Design references (read these first)
- Shawarma/diagrams/uiux-scr-r-01-deliveries.png and uiux-scr-r-02-deliverydetail.png
- Shawarma/Documents/pdf format files/Design Phase/Fahman_Orders_UIUX.pdf (rider screens, tokens, 44px tap targets, RTL) and _SDD.pdf §3.7 (rider data-exposure note)

## Files to CREATE
- tests/e2e/rider.spec.ts — list → detail → Picked up → Delivered happy path.
- tests/unit/rider-maps.test.ts — `mapsLink`/`buildMapsLink` produces correct pin and address-fallback URLs.

## Files to REUSE / MODIFY (already exist — do not rebuild)
- src/app/(rider)/rider/page.tsx, loading.tsx — list screen; polish states only.
- src/app/(rider)/rider/[id]/page.tsx — detail; ADD payment method/status display (US-040).
- src/components/rider/delivery-card.tsx (exports `DeliveryCard`, `buildMapsLink`), rider-actions.tsx (`RiderActions`), rider-feed-seed.tsx (`RiderFeedSeed`).
- src/lib/domain/rider.ts — `riderDeliveries`, `riderPickup`, `riderDeliver`, `mapsLink`, `RiderDelivery`. Note `RiderDelivery.order` already carries payment_method/payment_status.
- src/components/ui/states.tsx (`EmptyState`, `ErrorState`, `OfflineBanner`), ui/status.tsx (`OrderStatusChip`), ui/nav.tsx (`BottomNav`), ui/controls.tsx (`LangToggle`).
- messages/en.json + messages/ar.json — add any missing payment-label keys (AR mirrors EN).

## Acceptance criteria (Given/When/Then)
- Copy the US-039..US-044 scenarios above verbatim as the acceptance gate. Specifically: grouped-by-zone today-only list; detail shows address + map link + phone + items + **payment method/status**; map link opens device map; Picked up → out_for_delivery + notify; Delivered → delivered + notify; new Ready order appears <2 s.

## Definition of Done
typecheck + lint clean; rider e2e + maps unit test added/green; bilingual AR/EN strings present (AR mirrors EN); all 4 UI states on both rider screens; ≥44px tap targets & RTL verified against the wireframes; committed ONE FILE PER COMMIT authored as the user; pushed to origin/main.

## Dependencies
Runs after task-4-1 (notifications fire on pickup/deliver) and task-4-2 (hardened `useRiderFeed`). Relies on `src/lib/domain/rider.ts` and the shared UI components.
