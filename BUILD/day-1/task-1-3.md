# task-1-3 — App shell & role-based layouts + bottom navigation
> Day 1 · Sprint S1 · Scheduled: 2026-06-22T14:10:00+08:00 (Asia/Kuala_Lumpur, UTC+8)

## Goal
Give the (customer) and (operator) route groups their own shell layouts — mirroring the existing (rider) pattern — with a per-role bottom navigation, locale/dir inherited from the root layout, and auth-gated role redirects, so every customer and operator screen built later drops into a consistent frame.

## Scope — build exactly this
- Create `src/app/(customer)/layout.tsx`: a server component that calls `getI18n()` for locale + dictionary, renders children inside the standard `main` frame (`mx-auto min-h-dvh max-w-md ... p-4 pb-24`), mounts `OfflineBanner` at top, and renders a customer `BottomNav` (Home `/`, Menu `/menu`, Orders `/orders`, Account/History `/history`) using `BottomNav` from `src/components/ui/nav.tsx` with labels from the dictionary. Mirror the markup pattern in `src/app/(rider)/rider/page.tsx`.
- Create `src/app/(operator)/layout.tsx`: same frame; operator `BottomNav` (Board `/operator/board`, Setup `/operator/setup`, Menu `/operator/menu`, End of day `/operator/end-of-day`). Gate with `requireRole('operator')` (catch `RoleError` and redirect to `/` or `/login`) as defence-in-depth behind `src/middleware.ts`.
- Use `homeForRole` semantics from `src/lib/auth/roles.ts` for redirect targets; do NOT duplicate the redirect logic already in middleware — the layout is a secondary guard.
- Match BottomNav item count to <=4 (the component supports up to 4) and use existing dictionary keys (`menu`, `order_history`/`order_board`, `daily_setup`, `end_of_day`, `menu_manager`).

## Requirements & user stories covered
- US-002 (FR-R-01) / US-003 (FR-S-12) — role landing: operator lands on the operator dashboard with Open/Close/Sold-Out controls; rider lands on deliveries; the shell makes each role's nav role-appropriate.
- US-004 (FR-S-12) — RBAC: a non-operator hitting an operator route is denied; the layout guard re-asserts what middleware enforces.

## Design references (read these first)
- Shawarma/diagrams/uiux-fig-1-components.png (bottom nav + shell)
- Shawarma/Documents/pdf format files/Design Phase/Fahman_Orders_UIUX.pdf (navigation/shell section)
- Reference implementation to mirror: src/app/(rider)/rider/page.tsx + src/app/(rider)/rider/loading.tsx

## Files to CREATE
- src/app/(customer)/layout.tsx — customer shell + bottom nav; locale/dir via getI18n.
- src/app/(operator)/layout.tsx — operator shell + bottom nav; `requireRole('operator')` guard.
- (optional) src/app/(customer)/loading.tsx and src/app/(operator)/loading.tsx — route-level Loading using `Loading` from states.tsx, mirroring rider/loading.tsx.

## Files to REUSE / MODIFY (already exist — do not rebuild)
- src/app/layout.tsx — root sets `<html lang dir>` from NEXT_LOCALE; do not change; group layouts inherit it.
- src/components/ui/nav.tsx — `BottomNav({ items: { href, label, icon }[] })`.
- src/lib/auth/roles.ts — `requireRole`, `homeForRole`, `RoleError`, `getProfile`.
- src/lib/i18n/server.ts — `getI18n()` for `{ locale, t }`.
- src/components/ui/states.tsx — `OfflineBanner`, `Loading`.
- src/middleware.ts — already redirects unauthenticated/cross-role; layouts are a second layer.

## Acceptance criteria (Given/When/Then)
- US-003: Given my number carries the operator role; When I complete OTP sign-in; Then I reach the operator dashboard with Open/Close/Sold-Out controls (operator shell + nav). Given I am signed in as a customer; When I request an operator-only route directly; Then the request is denied by RBAC.
- US-002: Given my number is provisioned with the rider role; When I sign in; Then I land on today's deliveries and no customer/operator actions are visible — the customer/operator shells never render rider-only nav and vice versa.
- US-004: Given a caller in one role; When they invoke a route reserved for another role; Then it is rejected (middleware redirect + layout guard).

## Definition of Done
typecheck + lint clean; a Playwright e2e (or scripted) check that a customer visiting `/operator/*` is redirected and that each group renders its own bottom nav; bilingual nav labels from messages (AR mirrors EN); 4 UI states reachable via group loading.tsx + OfflineBanner; >=44px nav targets & RTL verified (nav mirrors under dir=rtl); committed ONE FILE PER COMMIT authored as the user; pushed to origin/main.

## Dependencies
- Runs after task-1-2 (primitives) and task-1-1 (green baseline + verified RBAC). Relies on src/components/ui/nav.tsx, src/lib/auth/roles.ts, src/lib/i18n/server.ts, src/middleware.ts.
