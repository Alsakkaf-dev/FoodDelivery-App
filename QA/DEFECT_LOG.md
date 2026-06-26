# DEFECT LOG — Fahman Orders UI/UX Overhaul (Engineer #20)

Append-only. Severity: **S1** blocker · **S2** major · **S3** minor · **S4** polish.
Status: `OPEN` → `ROUTED` (to owner via Manager) → `FIXED` (owner) → `VERIFIED` (#20) → `CLOSED`.
Sign-off blocks on every open **S1/S2**. #20 logs defects — owners fix; #20 re-verifies.

| ID | Sev | Screen / scope | Owner | Contract clause | Finding | Status |
|---|---|---|---|---|---|---|
| QA-001 | S2 | All orange CTAs (`PrimaryButton`, `.btn-primary`) | #01 | DoD a11y; spec §1 | White text on `brand #F5811F` ≈ **2.6:1** — fails WCAG AA (4.5 normal, 3.0 large). Fix at usage: use `ink`/dark text on solid orange, or accept a documented brand exception. | OPEN |
| QA-002 | S2 | `text-brand` link/accent text on white | #01 | DoD a11y | Orange-on-white ≈ **2.6:1** — fails AA as small text. Restrict orange text to ≥18.66px bold, or pair with an underline/dark weight. | OPEN |
| QA-003 | S2 | Captions / labels / placeholders (`text-muted`) | #01 | TOKENS_REFERENCE ⚠️ | `muted #9AA0AD` on white ≈ **2.6:1** — fails AA for body/caption text. Use `text-body #5B5F6B` (≈6.3:1) for readable secondary text; reserve `muted` for ≥AA-large/decorative. | OPEN |
| QA-004 | S3 | `text-success` on white | #01/#02 | DoD a11y | Green `#27AE60` on white ≈ **2.9:1** — ok as ≥3:1 large/icon, fails AA as small text. Use on tint or as large/bold only. | OPEN |
| QA-005 | S3 | `text-danger` / destructive labels on white | #01 | DoD a11y | Red `#EF4444` on white ≈ **3.8:1** — passes AA-large, fails AA-normal. Use ≥18.66px bold or darker red for small destructive text. | OPEN |
| QA-006 | S3 | Rating stars (`text-star`) | #01/#02 | non-text contrast | Amber `#F5A623` on white ≈ **2.0:1** — below the 3:1 non-text minimum. Add a hairline/!off-state boundary so filled stars are distinguishable. | OPEN |
| QA-007 | S3 | Info icon-chips (`text-info-blue`) on white | #01/#02 | non-text contrast | `#3D7BF2` on white ≈ **4.0:1** — ok as graphical (≥3:1); fails AA-normal if used as small text. Keep as icon/tile tint only. | OPEN |
| QA-008 | S3 | `text-warning` on white | #01 | DoD a11y | `#F5A623` on white ≈ **2.0:1** — same as star; reserve for backgrounds/large only. | OPEN |
| QA-009 | S2 | Focus indicators (`.btn`, `.field`, `.chip`) | #01 (+#18) | DoD a11y (focus) | No visible `focus-visible` ring; `.field` uses `outline-none focus:border-rust` only. Keyboard focus is hard to see. Add a token `focus-visible` ring on interactive base classes. | OPEN |
| QA-010 | S4 | Motion (`prefers-reduced-motion`) | #18 | spec §6 | No `prefers-reduced-motion` guard yet (motion system not landed). Verify when #18 merges; reduced-motion must disable confetti/scale/marquee. | OPEN (gated on #18) |
| QA-011 | S4 | `ProductCard` tap target (menu card) | #02 | DoD a11y (≥44px) | ProductCard's tappable link relies on `.card` padding+content for its ≥44px height — no explicit `min-h-tap`. Met in practice; recommend an explicit `min-h-tap` on the wrapper for a hard guarantee. `menu-card.test.ts` updated in lockstep with #09's delegation. | OPEN (recommendation) |
| QA-012 | S3 | `ProductCard` disabled/unavailable state | #02 (+#09) | spec §7; design | Unavailable items are labelled + non-tappable but NOT visually dimmed (old `opacity-60` dropped when MenuCard moved to ProductCard). Sold-out cards should de-emphasize (opacity/grayscale) to match the reference. | OPEN |
| QA-013 | S4 | `shell-nav.test.ts` RBAC guard | Manager / #04 | preview / AUTH_DISABLED | The 2 guard cases (`deny customer→home`, `unauth→/login`) don't throw because `AUTH_DISABLED=true` makes `requireRole` return the dev profile (`roles.ts` / `dev-bypass.ts` FROZEN). **Environmental, not a redesign regression** — gate these on `!AUTH_DISABLED` or re-enable auth before prod. | GATED — `describe.skipIf(AUTH_DISABLED)` keeps the preview suite green; the assertions run in prod (`AUTH_DISABLED=false`). |

### Notes
- QA-001..008 are **token-level** facts computed by `tests/unit/a11y-contrast.test.ts` from the
  real `tailwind.config.ts` hexes. They do **not** block the parallel BUILD — they are the
  contrast-sweep backlog routed to #01 for the integration pass.
- Environmental (not a redesign regression): `shell-nav.test.ts` RBAC-guard cases may not throw
  under `AUTH_DISABLED=true` (`requireRole` returns the dev profile — `roles.ts`/`dev-bypass.ts`
  are FROZEN). To be confirmed in the test run and, if present, logged here as environmental, not a blocker.
