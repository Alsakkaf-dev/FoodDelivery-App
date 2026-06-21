# task-1-5 — Customer Home / Live Status screen
> Day 1 · Sprint S1 · Scheduled: 2026-06-22T19:10:00+08:00 (Asia/Kuala_Lumpur, UTC+8)

## Goal
Ship the customer Home screen: a live Open/Closed/Sold-Out status badge and a live remaining-portions counter that update within 2s with no refresh via the `useShopStatus` realtime hook, with Closed/Sold-Out banners that disable the ordering entry — fully bilingual with all four UI states.

## Scope — build exactly this
- Create `src/app/(customer)/page.tsx` (server component, `dynamic = 'force-dynamic'`): fetch initial state server-side via `getStatus()` from `src/lib/domain/session.ts` (returns `status`, `qty_remaining`, `qty_total`, `delivery_window`, `cutoff_time`), get `{ locale, t }` from `getI18n()`, and render the `StatusHero` client island seeded with that initial state. Mirror the server/island pattern of `src/app/(rider)/rider/page.tsx`.
- Create `src/components/customer/status-hero.tsx` (client component): subscribe with `useShopStatus(initial)` from `src/lib/realtime/hooks.ts` (initial = `{ status, qty_remaining }`); render `StatusBadge` and, when Open, `QtyCounter` (both from `src/components/ui/status.tsx`) plus the `delivery_window`/`cutoff_time` line shown in the wireframe ("Order by 5:30 PM · Delivery 2–7 PM").
- Banners + gating: when status is `closed` show the closed banner (`t.shop_closed_msg`) and disable the "Browse menu & order" CTA; when `sold_out` show `t.sold_out_msg` and disable the CTA; when `open` enable the CTA (links to `/menu`). Hide/zero the counter when not Open (US-009 negative case).
- Implement all four UI states (loading via group loading.tsx / `Loading`; empty when no session today; error via `ErrorState` when `getStatus` fails; offline via `OfflineBanner`). Bilingual throughout (AR mirrors EN); >=44px CTA.
- Match uiux-scr-c-01-home.png: header with app name + language switch, OPEN pill + check, big remaining number with progress bar, order-by/delivery line, today's menu teaser, primary CTA, bottom nav (provided by the (customer) layout).

## Requirements & user stories covered
- US-008 (FR-C-02) — Customer views live Open/Closed/Sold-Out without refresh; Closed shows a clear banner and disables ordering.
- US-009 (FR-C-03) — Live remaining-quantity counter; decreases within 2s; hidden/zero when not Open.
- US-010 (FR-S-07) — Realtime broadcast of status & quantity; a late joiner immediately gets the current state (server-rendered initial + `useShopStatus`).

## Design references (read these first)
- Shawarma/diagrams/uiux-scr-c-01-home.png (the Home wireframe — OPEN pill, 18 portions counter, CTA, bottom nav)
- Shawarma/Documents/pdf format files/Design Phase/Fahman_Orders_UIUX.pdf (Customer Home screen spec)
- Shawarma/Documents/pdf format files/Design Phase/Fahman_Orders_SDD.pdf (§ realtime channels shop:status / shop:qty)

## Files to CREATE
- src/app/(customer)/page.tsx — server component; `getStatus()` + `getI18n()`; renders StatusHero island; force-dynamic.
- src/components/customer/status-hero.tsx — client island; `useShopStatus(initial)`; badge + counter + banners + gated CTA.

## Files to REUSE / MODIFY (already exist — do not rebuild)
- src/lib/realtime/hooks.ts — `useShopStatus(initial: { status, qty_remaining } | null)` (channels shop:status/shop:qty).
- src/lib/domain/session.ts — `getStatus()` for the server-rendered initial state.
- src/app/api/status/route.ts — public `GET /api/status` (fallback/late-joiner fetch if needed).
- src/components/ui/status.tsx — `StatusBadge`, `QtyCounter` (already bilingual via `lang` prop).
- src/components/ui/states.tsx — `EmptyState`, `ErrorState`, `OfflineBanner`, `Loading`.
- src/lib/i18n/server.ts — `getI18n()`; messages keys `status_*`, `remaining`, `portions_left`, `shop_closed_msg`, `sold_out_msg`, `menu`.
- src/app/(customer)/layout.tsx — provides the shell + bottom nav (from task-1-3).

## Acceptance criteria (Given/When/Then)
- US-008, Status matches operator setting live: Given the home screen is open; When the operator changes the shop status; Then my view reflects the new status within 2s with no manual refresh. Closed state: Given the shop is Closed; When I open the app; Then a clear Closed banner is shown and ordering controls are disabled.
- US-009, Counter reflects changes within 2s: Given the shop is Open with remaining shown; When another order is accepted; Then my counter decreases within 2s without refresh. Counter hidden when not Open: Given Closed or Sold-Out; Then the live counter is not shown or shows zero appropriately.
- US-010, Late joiner gets current state: Given a change already happened; When a new client connects; Then it immediately receives the current status and quantity (server-rendered initial seeds the hook).

## Definition of Done
typecheck + lint clean; a Playwright e2e asserting badge + counter render, CTA disabled when Closed/Sold-Out, and counter hidden when not Open (plus a unit test for StatusHero gating); bilingual AR/EN (AR mirrors EN); 4 UI states; >=44px CTA & RTL verified; committed ONE FILE PER COMMIT authored as the user; pushed to origin/main.

## Dependencies
- Runs after task-1-2 (primitives), task-1-3 ((customer) shell + nav) and task-1-4 (i18n strings). Relies on src/lib/realtime/hooks.ts (useShopStatus), src/lib/domain/session.ts (getStatus), src/components/ui/status.tsx and states.tsx.
