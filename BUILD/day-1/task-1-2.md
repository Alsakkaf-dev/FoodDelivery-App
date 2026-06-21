# task-1-2 — Design tokens + shared UI primitives + 4 UI states + RTL
> Day 1 · Sprint S1 · Scheduled: 2026-06-22T11:40:00+08:00 (Asia/Kuala_Lumpur, UTC+8)

## Goal
Lock the D-15 design system into code: confirm/extend tokens in `tailwind.config.ts` + `globals.css`, audit and complete the shared `src/components/ui` primitives (status badge, qty counter, buttons/inputs, cards, timeline, the four UI states), and make RTL direction handling correct so every later screen composes from one tokenised kit.

## Scope — build exactly this
- Audit tokens against uiux-fig-2-tokens.png. The palette already exists in `tailwind.config.ts` (rust/slate/muted/cream/line/open/soldout, radius card 12px / control 8px, fontFamily sans+arabic, minHeight/minWidth tap 44px) and `globals.css` (.btn/.btn-primary/.btn-secondary/.btn-open/.card/.field/.badge/.chip). Fill only real gaps (e.g. type scale or spacing tokens shown in the figure) — do NOT rename existing tokens.
- Audit shared primitives against uiux-fig-1-components.png. Confirmed present: `StatusBadge`, `QtyCounter`, `OrderStatusChip` (status.tsx); `Loading`, `EmptyState`, `ErrorState`, `OfflineBanner` (states.tsx); `Stepper`, `LangToggle` (controls.tsx); `BottomNav` (nav.tsx); timeline.tsx. Add only what is missing.
- Create `src/components/ui/qty-counter.tsx` ONLY IF a counter distinct from the existing `QtyCounter` in status.tsx is required by the figure; otherwise reuse the existing one and note it.
- Create `src/components/ui/card.tsx` ONLY IF a component-level Card wrapper is needed beyond the `.card` utility class; otherwise standardise on `.card` and note it.
- Add a Skeleton primitive to states.tsx if uiux-fig-4-states.png shows skeleton loading distinct from the spinner `Loading`.
- RTL: confirm `html[dir='rtl']` swaps font in globals.css; verify primitives use logical spacing (start/end, not hard left/right) so they mirror under RTL (US-012, uiux-fig-3-rtl.png).

## Requirements & user stories covered
- EP-13 (cross-cutting NFR enablers) — reusable, tokenised, accessible primitives with 44px tap targets and the four mandatory UI states.
- US-012 (FR-C-14) — Arabic flips layout to RTL; primitives mirror correctly.

## Design references (read these first)
- Shawarma/diagrams/uiux-fig-2-tokens.png (color/type/spacing/radius)
- Shawarma/diagrams/uiux-fig-1-components.png (component inventory)
- Shawarma/diagrams/uiux-fig-3-rtl.png (RTL mirroring rules)
- Shawarma/diagrams/uiux-fig-4-states.png (empty/loading/error/offline)
- Shawarma/Documents/pdf format files/Design Phase/Fahman_Orders_UIUX.pdf (D-15 tokens & components section)

## Files to CREATE
- src/components/ui/qty-counter.tsx — ONLY if distinct from existing `QtyCounter`; else skip and document reuse.
- src/components/ui/card.tsx — ONLY if a component Card is needed beyond `.card`; else skip and document reuse.

## Files to REUSE / MODIFY (already exist — do not rebuild)
- tailwind.config.ts — extend token scale only where the figure shows a gap.
- src/app/globals.css — add component classes/skeleton utility only if missing; keep `html[dir='rtl']` rule.
- src/components/ui/status.tsx — `StatusBadge`, `QtyCounter`, `OrderStatusChip` (already correct).
- src/components/ui/states.tsx — `Loading`, `EmptyState`, `ErrorState`, `OfflineBanner`; add Skeleton if needed.
- src/components/ui/controls.tsx — `Stepper`, `LangToggle`.
- src/components/ui/nav.tsx — `BottomNav`.
- src/components/ui/timeline.tsx — order timeline primitive.

## Acceptance criteria (Given/When/Then)
- US-012: Given the app is in English (LTR); When I switch to Arabic; Then all text becomes Arabic and the layout flips to RTL. Given I selected Arabic; When I close and reopen the app; Then it opens in Arabic (RTL) again. (Persistence is wired in task-1-4; here verify primitives mirror under `dir='rtl'`.)
- EP-13 enabler: Given any primitive; When rendered; Then interactive elements are >=44x44px and the four UI states render from the shared kit without bespoke markup.

## Definition of Done
typecheck + lint clean; a unit test (Vitest) rendering each primitive in en + ar (and asserting tap-target classes) added; bilingual labels present where primitives carry text (AR mirrors EN); 4 UI states available; >=44px tap targets & RTL mirroring verified; committed ONE FILE PER COMMIT authored as the user; pushed to origin/main.

## Dependencies
- Runs after task-1-1 (green baseline). Relies on existing tailwind.config.ts, globals.css and src/components/ui/*. Unblocks task-1-3 and task-1-5 which compose these primitives.
