# task-3-3 — Menu manager — CRUD, price, availability, photo
> Day 3 · Sprint S1/S3 · Scheduled: 2026-06-24T14:10:00+08:00 (Asia/Kuala_Lumpur, UTC+8)

## Goal
Build the menu manager at `/operator/menu` where the operator can add, edit and hide items, set the MYR price, toggle availability, and upload a photo to Supabase Storage — with changes reflected on the customer menu within 5 seconds.

## Scope — build exactly this
- `src/app/(operator)/operator/menu/page.tsx` — server component. Load items via `listMenu()` (already sorted by sort_order). Render header + `BottomNav` + the editor island.
- `src/components/operator/menu-editor.tsx` — `'use client'` island. List each item showing bilingual name (`name_en`/`name_ar`), price formatted as MYR, photo thumbnail, and an availability toggle wired to `setAvailability(id, available)`. Provide an add/edit form (bilingual name/description, `price`, `sort_order`) that submits to `upsertMenuItem(input)`. Photo upload: use the Supabase browser client (`src/lib/supabase/client.ts`) to `storage.from(...).upload(...)`, then save the returned public URL as `photo_url` via `upsertMenuItem`. Show the 4 UI states; after save call `router.refresh()` so the customer menu picks it up.

## Requirements & user stories covered
- US-031 (FR-O-08) — Operator manages menu items, prices, availability and photos.
  - Scenario A: Given I edit a price or upload a photo, When I save, Then the change appears on the customer menu within 5 seconds.
  - Scenario B: Given I mark an item unavailable, When customers view the menu, Then the item is clearly marked unavailable and cannot be added.

## Design references (read these first)
- Shawarma/diagrams/uiux-scr-o-05-menumanager.png
- Shawarma/diagrams/uiux-fig-1-components.png · uiux-fig-2-tokens.png
- Shawarma/Documents/pdf format files/Design Phase/Fahman_Orders_UIUX.pdf (menu manager) and Fahman_Orders_SDD.pdf (Storage + menu_items schema, §5/§6).

## Files to CREATE
- src/app/(operator)/operator/menu/page.tsx — menu manager server component (loads items).
- src/components/operator/menu-editor.tsx — client CRUD/availability/photo-upload island.

## Files to REUSE / MODIFY (already exist — do not rebuild)
- src/lib/domain/menu.ts — `listMenu()`, `upsertMenuItem(input)` (operator-only upsert; insert when no `id`, update when `id` present), `setAvailability(id, available)`.
- src/lib/utils/schemas.ts — `menuUpsertSchema` (fields: id?, name_en, name_ar, description_en?, description_ar?, price, photo_url?, available, sort_order). Mirror its rules client-side; do not invent new fields.
- src/lib/supabase/client.ts — browser client for the Storage upload (read the file to confirm the export name before calling).
- src/components/ui/states.tsx — 4 states. src/components/ui/controls.tsx — `Stepper`/`LangToggle`. src/components/ui/nav.tsx — `BottomNav`. src/lib/i18n/server.ts — `getI18n()`. Add menu-manager strings to messages/en.json + ar.json (menu_manager exists).

## Acceptance criteria (Given/When/Then)
- Given I edit a price or upload a photo, When I save, Then the change appears on the customer menu within 5 seconds.
- Given I mark an item unavailable, When customers view the menu, Then the item is clearly marked unavailable and cannot be added.

## Definition of Done
- typecheck + lint clean; unit test for upsert (insert vs update) and availability toggle; bilingual AR/EN strings (AR mirrors EN); 4 UI states; >=44px tap targets & RTL verified; committed ONE FILE PER COMMIT authored as the user; pushed to origin/main.

## Dependencies
- Runs after task-3-2 (shares operator nav); relies on `src/lib/domain/menu.ts`, `menuUpsertSchema`, and the Supabase Storage bucket. Confirm the bucket name in supabase/migrations or seed before uploading.
