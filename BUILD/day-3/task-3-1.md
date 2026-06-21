# task-3-1 — Operator dashboard + one-tap Open/Close/Sold-Out
> Day 3 · Sprint S1/S3 · Scheduled: 2026-06-24T09:10:00+08:00 (Asia/Kuala_Lumpur, UTC+8)

## Goal
Give the operator a mobile dashboard at `/operator` that shows the live day snapshot (status, remaining portions, orders count) and lets them flip the shop Open / Closed / Sold-Out with one tap that propagates to all customers in under 2 seconds.

## Scope — build exactly this
- `src/app/(operator)/operator/page.tsx` — server component (`export const dynamic = 'force-dynamic'`). Fetch the day snapshot via `getStatus()` and the orders count via `boardList()`. Render header with `LangToggle`, a `StatusBadge`, a `QtyCounter`, an orders-count stat, and a `BottomNav` linking the operator screens (dashboard, board, menu, setup, broadcast, end-of-day).
- `src/components/operator/state-controls.tsx` — `'use client'` island with three large (>=44px, use `h-16`) buttons wired to server actions `openShop`, `closeShop`, `setSoldOut`. Optimistic: update local status immediately on tap, then call the action; on failure roll back and show inline error. Subscribe to `useShopStatus(initial)` so the displayed status/qty stays live without refresh.
- Mirror the rider page pattern (server component + client islands) from `src/app/(rider)/rider/page.tsx`.

## Requirements & user stories covered
- US-023 (FR-O-01) — Given I am on the operator dashboard, When I tap Open, Then status becomes Open and customers see it within 2 seconds.
- US-024 (FR-O-02) — Given the shop is Open, When I tap Close, Then new orders are blocked and customers see Closed within 2 seconds.
- US-025 (FR-O-03) — Given the shop is Open, When I tap Sold-Out, Then status becomes Sold-Out and the sold-out announcement is broadcast to customers.

## Design references (read these first)
- Shawarma/diagrams/uiux-scr-o-01-dashboard.png
- Shawarma/diagrams/uiux-fig-1-components.png · uiux-fig-2-tokens.png · uiux-fig-4-states.png
- Shawarma/Documents/pdf format files/Design Phase/Fahman_Orders_UIUX.pdf (operator dashboard) and Fahman_Orders_SDD.pdf §5.3 (realtime channels), §6.4.

## Files to CREATE
- src/app/(operator)/operator/page.tsx — operator dashboard server component (snapshot + nav).
- src/components/operator/state-controls.tsx — client one-tap Open/Close/Sold-Out island with optimistic update.

## Files to REUSE / MODIFY (already exist — do not rebuild)
- src/lib/domain/session.ts — call `openShop()`, `closeShop()`, `setSoldOut()`, `getStatus()` (all return `ApiResult`; openShop guards trading hours and qty_total>0).
- src/lib/domain/orders.ts — call `boardList()` for today's orders count.
- src/lib/realtime/hooks.ts — `useShopStatus(initial)` (channel shop:status / shop:qty).
- src/components/ui/status.tsx — `StatusBadge`, `QtyCounter`. src/components/ui/states.tsx — `OfflineBanner`, `ErrorState`. src/components/ui/controls.tsx — `LangToggle`. src/components/ui/nav.tsx — `BottomNav`.
- src/lib/i18n/server.ts — `getI18n()` returns `{ locale, t }`. Add operator keys to messages/en.json + ar.json if missing (operator_dashboard/open_shop/close_shop/set_sold_out already exist).

## Acceptance criteria (Given/When/Then)
- Given I am on the operator dashboard, When I tap Open, Then the status becomes Open and customers see it within 2 seconds.
- Given the shop is Open, When I tap Close, Then new orders are blocked and customers see Closed within 2 seconds.
- Given the shop is Open, When I tap Sold-Out, Then status becomes Sold-Out and the sold-out announcement is broadcast to customers.

## Definition of Done
- typecheck + lint clean; unit/e2e for the three transitions added or updated; bilingual AR/EN strings present (AR mirrors EN); 4 UI states (empty/loading/error/offline); >=44px tap targets & RTL verified; committed ONE FILE PER COMMIT authored as the user; pushed to origin/main.

## Dependencies
- First Day-3 task; relies on existing `src/lib/domain/session.ts`, `useShopStatus`, and the shared UI components. No prior Day-3 task required.
