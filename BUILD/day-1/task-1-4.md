# task-1-4 — i18n completeness + language switcher
> Day 1 · Sprint S1 · Scheduled: 2026-06-22T16:40:00+08:00 (Asia/Kuala_Lumpur, UTC+8)

## Goal
Guarantee bilingual parity — every string used so far exists in both `messages/en.json` and `messages/ar.json` (AR mirrors EN key-for-key) — and ship a reusable language switcher whose choice persists across sessions and flips the whole app LTR<->RTL.

## Scope — build exactly this
- Audit every user-facing string used in the codebase against `messages/en.json`. Add any missing keys to BOTH files; ensure `en.json` and `ar.json` have IDENTICAL key sets (Arabic values translated, not copied). Note: a `language` key already exists holding the OTHER language label (`العربية` in en, `English` in ar) — keep this convention.
- Create `src/components/ui/lang-switch.tsx`: a client component language switcher. It MUST set the `NEXT_LOCALE` cookie (path `/`, `max-age=31536000`) and reload — the same mechanism the existing `LangToggle` in `src/components/ui/controls.tsx` already uses. Decide deliberately: either (a) make `lang-switch.tsx` a richer/labelled switcher and refactor `LangToggle` to re-export it, or (b) document that `LangToggle` is the canonical toggle and `lang-switch.tsx` is the labelled variant for headers. Do NOT create two divergent cookie mechanisms.
- Confirm persistence path end-to-end: `src/app/layout.tsx` reads `NEXT_LOCALE` to set `<html lang dir>`, and `src/lib/i18n/server.ts` `getLocale()` reads the same cookie — so a set cookie survives reopen. Verify `dir()`/`isLocale()` from `src/lib/i18n/config.ts` are used.
- Ensure the switcher renders a >=44px tap target and a clear current-vs-target label.

## Requirements & user stories covered
- US-012 (FR-C-14) — Customer switches the whole app between Arabic (RTL) and English (LTR); the choice persists across sessions.

## Design references (read these first)
- Shawarma/diagrams/uiux-fig-3-rtl.png (RTL flip + switcher placement)
- Shawarma/Documents/pdf format files/Design Phase/Fahman_Orders_UIUX.pdf (localization / language-switch section)

## Files to CREATE
- src/components/ui/lang-switch.tsx — labelled language switcher; sets `NEXT_LOCALE` cookie + reload; reuses the existing toggle mechanism.

## Files to REUSE / MODIFY (already exist — do not rebuild)
- messages/en.json — source-of-truth key set; add missing keys.
- messages/ar.json — must mirror en.json key-for-key with Arabic values.
- src/components/ui/controls.tsx — existing `LangToggle` (cookie + reload pattern to reuse/refactor).
- src/lib/i18n/config.ts — `DEFAULT_LOCALE`, `dir`, `isLocale`, `LOCALES`, `Locale`.
- src/lib/i18n/server.ts — `getLocale()`, `getI18n()` read `NEXT_LOCALE`.
- src/lib/i18n/dictionaries.ts — `getDictionary`, `translate` (with `{{var}}` interpolation).
- src/app/layout.tsx — sets `<html lang dir>` from the cookie (confirms persistence).

## Acceptance criteria (Given/When/Then)
- US-012, Scenario Switching flips text and direction: Given the app is in English (LTR); When I switch to Arabic; Then all text becomes Arabic and the layout flips to RTL.
- US-012, Scenario Choice persists across sessions: Given I selected Arabic; When I close and reopen the app; Then it opens in Arabic (RTL) again.

## Definition of Done
typecheck + lint clean; a unit test asserting `en.json` and `ar.json` have identical key sets (parity guard) plus a Playwright e2e that switches to AR, reloads, and asserts `<html dir=rtl>` persists; AR mirrors EN; switcher >=44px tap target; RTL verified; committed ONE FILE PER COMMIT authored as the user; pushed to origin/main.

## Dependencies
- Runs after task-1-2 (primitives) and task-1-3 (shell where the switcher is mounted). Relies on src/lib/i18n/*, messages/*, and the existing LangToggle cookie pattern in controls.tsx.
