# task-2-1 — Bilingual menu list + item detail
> Day 2 · Sprint S2 · Scheduled: 2026-06-23T09:10:00+08:00 (Asia/Kuala_Lumpur, UTC+8)

## Goal
Deliver the customer menu browse experience: a fast-painting list of menu items (photo, bilingual name, MYR price, availability) and a single-item detail screen, both wired to the existing `listMenu` domain function and fully bilingual AR(RTL)/EN.

## Scope — build exactly this
- `menu/page.tsx` — server component that calls `listMenu()`, renders a responsive grid/list of `MenuCard`s; available items show photo + name + `formatMYR(price, locale)`; unavailable items are visibly marked (dimmed + badge) and not tappable to add.
- `menu/[id]/page.tsx` — item detail: large photo, bilingual name + description, price, an Add-to-cart affordance (Stepper + button). For now the Add control may be a placeholder no-op or import the cart store from task-2-2 only if it exists; otherwise leave a clearly-marked TODO that task-2-2 wires.
- `menu-card.tsx` — presentational card (photo with `next/image`, name by locale, MYR price, availability badge), `>=44px` tap target, links to `/menu/[id]`.
- Implement all 4 UI states (empty: no items / loading skeleton / error: `listMenu` failed / offline banner) reusing `src/components/ui/states.tsx`.
- Fast first paint: server-render the list; use `next/image` with width/height; keep the route a Server Component (no client data fetch for the initial paint).

## Requirements & user stories covered
- US-011 (FR-C-04) — Customer browses the bilingual menu with photos, bilingual names, descriptions and MYR prices; available items show photo/name/price, unavailable clearly marked; interactive in under 3s on 4G.

## Design references (read these first)
- Shawarma/diagrams/uiux-scr-c-02-menu.png (menu list)
- Shawarma/diagrams/uiux-scr-c-03-item.png (item detail)
- Shawarma/diagrams/uiux-fig-*.png (tokens / component / RTL figures)
- Shawarma/Documents/pdf format files/Design Phase/Fahman_Orders_UIUX.pdf (menu + item screens, design tokens)

## Files to CREATE
- src/app/(customer)/menu/page.tsx — server-rendered menu list, 4 states
- src/app/(customer)/menu/[id]/page.tsx — item detail screen
- src/components/customer/menu-card.tsx — single menu item card

## Files to REUSE / MODIFY (already exist — do not rebuild)
- src/lib/domain/menu.ts — call `listMenu(): Promise<ApiResult<MenuItem[]>>`; items sorted by `sort_order`. For detail, filter the list by `id` (no per-item domain fn exists) — do NOT invent `getMenuItem`.
- src/lib/utils/money.ts — `formatMYR(price, locale)` for MYR display.
- src/lib/i18n/server.ts — `getI18n()` returns `{ locale, t }`; set `dir` by locale at the layout level (already handled in root layout).
- src/components/ui/states.tsx — `Loading`, `EmptyState`, `ErrorState`, `OfflineBanner`.
- src/components/ui/controls.tsx — `LangToggle`, `Stepper`.
- src/types/db.ts — `MenuItem` ({ name_en, name_ar, description_en, description_ar, price, photo_url, available, sort_order }).
- messages/en.json + messages/ar.json — reuse `menu`, `add_to_cart`; ADD any new keys (e.g. `unavailable`, `menu_empty`) to BOTH files (AR mirrors EN).

## Acceptance criteria (Given/When/Then)
- Scenario: Available items show price and photo — Given the menu has available and unavailable items, When I open the menu, Then available items show photo, name and MYR price, And unavailable items are clearly marked as such.
- Scenario: Fast first paint on 4G — Given a mid-range Android on 4G, When I open the menu cold, Then it becomes interactive in under 3 seconds.

## Definition of Done
- typecheck + lint clean; relevant unit/e2e added or updated (e.g. menu-card render test for available vs unavailable); bilingual AR/EN strings present (AR mirrors EN); 4 UI states; >=44px tap targets & RTL verified; committed ONE FILE PER COMMIT authored as the user; pushed to origin/main.

## Dependencies
- First task of Day 2; no prior Day-2 dependency. Relies on existing `src/lib/domain/menu.ts`, `src/lib/utils/money.ts`, `src/components/ui/*`, `src/lib/i18n/*`. Provides the menu surface that task-2-2 (cart) adds items from.
