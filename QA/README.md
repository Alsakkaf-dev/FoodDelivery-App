# QA — Fahman Orders UI/UX Overhaul (Engineer #20)

The final cross-cutting **quality gate**. Engineer #20 verifies every overhauled screen
against the new design language, enforces accessibility / responsive / RTL / bilingual
correctness, keeps the test suites green, and **blocks sign-off** until contracts hold.
#20 owns **tests only** — it never edits feature source, tokens (#01), or primitives (#02).
Every fix is a **defect routed to the owner** via [`DEFECT_LOG.md`](./DEFECT_LOG.md) → Manager (#21).

## Files in this folder
| File | Purpose |
|---|---|
| [`DEFECT_LOG.md`](./DEFECT_LOG.md) | Append-only defect log (id · screen · owner · severity · contract clause · status). |
| [`AUDIT_MATRIX.md`](./AUDIT_MATRIX.md) | Per-screen visual/responsive/a11y/RTL/bilingual audit grid (~26 existing + ~15 net-new). |
| [`A11Y_CHECKLIST.md`](./A11Y_CHECKLIST.md) | WCAG 2.1 AA checklist applied per screen. |
| [`CONTRAST_REPORT.md`](./CONTRAST_REPORT.md) | Computed token-pair contrast ratios + the sub-AA findings. |
| [`SIGNOFF.md`](./SIGNOFF.md) | Release gate — the conditions that must all be true to ship. |

## Test assets #20 owns (`Cooding/tests/**`, `playwright.config.ts`, `vitest.config.ts`)
- **Unit (vitest, node, SSR-string assertions):**
  - `tests/unit/a11y-contrast.test.ts` — WCAG ratio math over the real `tailwind.config.ts` hexes.
  - `tests/unit/contract-data-hooks.test.ts` — frozen `data-*` hook presence guard.
  - (+ the existing foundation/ui-primitives/shell-nav/i18n-parity suites — kept green.)
- **E2E (Playwright — `android`, `desktop`, `mobile-narrow` 320, `tablet` 768):**
  - `tests/e2e/responsive.spec.ts` — no horizontal overflow + ≥44px tap targets across viewports.
  - `a11y.spec.ts` / `rtl-parity.spec.ts` land per-wave as surfaces reach DONE.

## Severity scale
`S1` blocker (ships broken / breaks a frozen contract or data-* hook) · `S2` major (AA fail,
broken RTL, missing state) · `S3` minor (spacing/token drift) · `S4` polish. **Sign-off blocks on every open S1/S2.**

## How to run
```
npm run typecheck      # whole-repo tsc — RED during parallel build is expected (Manager integrates)
npm run test:unit      # vitest — #20's unit gate (must be green for #20's own specs)
npm run build && npm run test:e2e   # Playwright across all 4 viewport projects
node scripts/i18n-parity.mjs        # #03's EN/AR parity guard (run as part of the gate)
```

## Working rules (from the Shared Contract + Manager rulings)
- Light theme only · AR/EN + full RTL (logical CSS props) · tokens/primitives reused, no hardcoded hex.
- Frozen: cart/checkout/order/realtime contracts, `data-*` hooks, `force-dynamic`, z-stack (30<40<50<60), `AUTH_DISABLED`.
- #20 changes an e2e selector **only in lockstep** with the `data-*` owner (e.g. R-6 cart CTA with #10; #04 nav icon literals).
- No git — the Manager integrates.
