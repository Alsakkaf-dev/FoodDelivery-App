# task-3-2 — Daily setup — quantity, cut-off, delivery window, zones
> Day 3 · Sprint S1/S3 · Scheduled: 2026-06-24T11:40:00+08:00 (Asia/Kuala_Lumpur, UTC+8)

## Goal
Build the daily-setup screen at `/operator/setup` where the operator sets today's total quantity, order cut-off time, delivery window and active delivery zones in one form, persisting via `configureSession` so the live counter and zone selectability are driven by real numbers.

## Scope — build exactly this
- `src/app/(operator)/operator/setup/page.tsx` — server component. Pre-load current values via `getStatus()` and all zones via `listZones()` (no `activeOnly`, so inactive zones are shown for toggling). Render header + `BottomNav`, pass data to the client form.
- `src/components/operator/setup-form.tsx` — `'use client'` form island. Fields: total quantity (reuse `Stepper` from controls.tsx, or numeric input), cut-off time (`<input type="time">` → `HH:mm`), delivery window (text, e.g. "5–7 PM"), and a zone list of >=44px toggles (active on/off). On submit call `configureSession({ qty_total, cutoff_time, delivery_window, active_zone_ids })`; show success toast and the 4 UI states. Validate client-side to match `configureSessionSchema` (qty 0–1000, cutoff `/^\d{2}:\d{2}$/`, window 1–80 chars, zone ids uuid array).

## Requirements & user stories covered
- US-026 (FR-O-04) — Given I am configuring today's session, When I set the daily total quantity, Then remaining quantity initializes to that total.
- US-027 (FR-O-05) — Given I set a cut-off time, When that time arrives, Then ordering auto-closes at the cut-off.
- US-028 (FR-O-06) — Given I set a delivery window, When customers and the rider view the day, Then the same window is shown to both.
- US-029 (FR-O-07) — Given I deactivate a zone, When a customer starts a delivery order, Then that zone is not selectable and active zones are.

## Design references (read these first)
- Shawarma/diagrams/uiux-scr-o-02-setup.png
- Shawarma/diagrams/uiux-fig-2-tokens.png · uiux-fig-3-rtl.png
- Shawarma/Documents/pdf format files/Design Phase/Fahman_Orders_UIUX.pdf (daily setup) and Fahman_Orders_SDD.pdf §6 (configureSession contract).

## Files to CREATE
- src/app/(operator)/operator/setup/page.tsx — setup screen server component (loads session + zones).
- src/components/operator/setup-form.tsx — client form wiring qty/cutoff/window/zones to configureSession.

## Files to REUSE / MODIFY (already exist — do not rebuild)
- src/lib/domain/session.ts — `configureSession(input)` (operator-only; sets qty_total AND qty_remaining=qty_total, cutoff_time, delivery_window; activates selected zones and deactivates the rest). `getStatus()` for current values.
- src/lib/domain/zones.ts — `listZones()` to list all zones for toggling.
- src/lib/utils/schemas.ts — `configureSessionSchema` (do not duplicate; mirror its rules client-side).
- src/components/ui/controls.tsx — `Stepper`, `LangToggle`. src/components/ui/states.tsx — states. src/components/ui/nav.tsx — `BottomNav`. src/lib/i18n/server.ts — `getI18n()`. Add setup strings to messages/en.json + ar.json (daily_setup exists; add field labels).

## Acceptance criteria (Given/When/Then)
- Given I am configuring today's session, When I set the daily total quantity, Then remaining quantity initializes to that total for the session.
- Given I set a cut-off time, When that time arrives, Then ordering auto-closes at the cut-off.
- Given I set a delivery window, When customers and the rider view the day, Then the same window is shown to both.
- Given I deactivate a zone, When a customer starts a delivery order, Then that zone is not selectable and active zones are.

## Definition of Done
- typecheck + lint clean; unit test asserting configureSession sets qty_remaining=qty_total and zone activation; bilingual AR/EN strings (AR mirrors EN); 4 UI states; >=44px tap targets & RTL verified; committed ONE FILE PER COMMIT authored as the user; pushed to origin/main.

## Dependencies
- Runs after task-3-1 (shares operator BottomNav + dashboard entry); relies on `configureSession`, `listZones`, `configureSessionSchema`.
