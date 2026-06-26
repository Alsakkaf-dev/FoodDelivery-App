# ACCESSIBILITY CHECKLIST — WCAG 2.1 AA (Engineer #20)

Applied per screen during the audit (see AUDIT_MATRIX). The codebase already has good
ARIA coverage (`role=status/alert/progressbar/radiogroup/switch/dialog`, `sr-only`,
`aria-label`); this checklist guards it doesn't regress and closes the known gaps
(focus-visible, reduced-motion, contrast) routed in DEFECT_LOG.

## Perceivable
- [ ] Text contrast ≥ 4.5:1 (normal) / 3:1 (≥18.66px bold). Sub-AA token pairs tracked QA-001..008.
- [ ] Non-text/graphical contrast ≥ 3:1 (icons, stars, focus ring, chip borders). QA-006/007.
- [ ] No information by colour alone (status also has text/icon/label).
- [ ] Images/illustrations: meaningful → `alt`; decorative → `aria-hidden` / empty alt (FoodImage/brand art).
- [ ] Content reflows with no horizontal scroll at 320px (verified by `responsive.spec.ts`).

## Operable
- [ ] All interactive elements ≥ 44×44px (`min-h-tap`/`min-w-tap`). Guarded in unit + e2e.
- [ ] Visible keyboard focus on every focusable control (`focus-visible` ring). **Gap QA-009.**
- [ ] Logical tab order; no positive `tabindex`; no keyboard traps.
- [ ] Bottom sheets / modals: `role=dialog` + `aria-modal`, focus trap, Esc closes, focus restored.
- [ ] Directional glyphs (back, chevrons, "+", carets, chat tails) mirror under `dir=rtl`.
- [ ] `prefers-reduced-motion` disables confetti/scale/marquee/auto-advance. **Gated QA-010 (#18).**

## Understandable
- [ ] `<html lang>` + `dir` set from locale (en→ltr, ar→rtl). Verified in guards/i18n specs.
- [ ] All copy from the dictionary (`t.<key>`); EN+AR parity (`i18n-parity.mjs`). No hardcoded user text.
- [ ] Form fields have programmatic labels (`<label for>` / `aria-label`); errors via `role=alert`.
- [ ] Consistent component behaviour across customer/operator/rider (same primitives).

## Robust
- [ ] Semantic landmarks: one `<main>`, `<nav>` for BottomNav, headings in order (no skipped levels).
- [ ] Status/async regions announced (`aria-live=polite`, `role=status`, `aria-busy`).
- [ ] Live order/board updates announced without stealing focus.
- [ ] Frozen `data-*` hooks intact (guarded by `contract-data-hooks.test.ts`).

## Per-surface notes
- **Cart / dark surfaces:** white-on-dark passes AA; verify orange CTAs on dark + Stepper contrast.
- **Operator board:** colour-coded columns also carry text labels; KPI numerals not colour-only.
- **Rider call/message:** call controls have `aria-label`s; end-call uses red **and** an icon/label.
