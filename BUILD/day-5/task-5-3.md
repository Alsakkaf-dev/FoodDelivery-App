# task-5-3 — Security, a11y & PDPA hardening
> Day 5 · Sprint S4 · Scheduled: 2026-06-26T14:10:00+08:00 (Asia/Kuala_Lumpur, UTC+8)

## Goal
Close the security/accessibility/compliance gaps: bump Next.js to the patched 14.2.x and re-green the build, enforce a11y tokens (≥44px targets, contrast, focus, RTL parity), and make the PDPA consent + retention/deletion path real without ever logging PII.

## Scope — build exactly this
- Security: bump `next` and `eslint-config-next` from 14.2.15 to the latest patched 14.2.x in `package.json`, `npm install`, run `npm audit` and resolve/justify flagged advisories; confirm `npm run build` + typecheck still pass. Add basic security headers (CSP/Referrer-Policy/X-Content-Type-Options) via `next.config.mjs` headers() or middleware; never inline secrets (verify all secrets read from env).
- A11y: audit primary interactive elements across Customer + Operator + Rider screens for ≥44px tap targets, visible focus rings, and AA contrast against the UIUX tokens; ensure `src/components/ui/*` controls expose proper roles/labels; verify `aria-live` on status/timeline updates; confirm `dir` flips with locale in `src/app/layout.tsx` and nav mirrors in RTL.
- PDPA consent (US-007): make the login consent gate authoritative — the current `src/app/login/page.tsx` defaults `consent` to `true`; change to default `false` so signup is blocked until the user opts in, and persist the consent timestamp + policy version on the user record (store via the existing server write path / a migration column if absent). Move the bilingual consent copy out of the JSX literal into `messages/en.json` + `messages/ar.json`.
- PDPA retention/erasure (US-057): add a verified deletion request path (server action + admin/erasure route) that erases personal fields (phone, name, address) per retention policy and writes an audit row; ensure logs/notifications never emit PII (scrub phone/name from `console`/error payloads in `src/lib/notifications/*` and domain catch blocks).

## Requirements & user stories covered
- US-007 (NFR-C-01) — Explicit consent opt-in at signup (PDPA).
- US-057 (FR-S-13; NFR-C-02/03/04) — data minimization, retention & erasure.
- NFR security/usability — patched dependencies, a11y baseline, no PII in logs.

## Design references (read these first)
- Shawarma/diagrams/uiux-fig-4-states.png and Shawarma/diagrams/uiux-fig-*.png (token/contrast/RTL figures)
- Shawarma/Documents/pdf format files/Design Phase/Fahman_Orders_UIUX.pdf (a11y tokens, 44px targets, RTL parity)
- Shawarma/Documents/pdf format files/Design Phase/Fahman_Orders_SDD.pdf (§ security, PDPA retention model)

## Files to CREATE
- (audit fixes only) plus, if needed: supabase/migrations/0004_consent_retention.sql — consent_at/consent_version columns + erasure audit table; a deletion server action under src/lib/domain/ and an admin erasure route under src/app/api/admin/.

## Files to REUSE / MODIFY (already exist — do not rebuild)
- package.json — bump next + eslint-config-next to patched 14.2.x.
- next.config.mjs — add security headers.
- src/app/login/page.tsx — default consent to false; gate submit; persist consent.
- messages/en.json + messages/ar.json — add consent + privacy strings (AR mirrors EN).
- src/middleware.ts — keep role guards; optionally attach headers.
- src/lib/notifications/* and src/lib/domain/* — scrub PII from logs/errors.
- src/components/ui/* — focus/label/tap-target fixes.

## Acceptance criteria (Given/When/Then)
- US-007 — Given I am completing signup, When I proceed without opting in to data use and notifications, Then I cannot complete signup until consent is given, And the consent timestamp and version are stored.
- US-057 — Given my account holds only phone, name and address, When I submit a verified deletion request, Then my personal data is erased per the retention policy and the access is auditable.

## Definition of Done
`npm audit` clean or justified; Next.js on patched 14.2.x; typecheck + lint + unit + build green; consent defaults off and is enforced + persisted; erasure path works and is audited; no PII in logs; ≥44px targets, focus, contrast, RTL verified; bilingual strings present (AR mirrors EN); committed ONE FILE PER COMMIT authored as the user; pushed to origin/main.

## Dependencies
- Runs after task-5-1/5-2 (so tests catch regressions from the bump); relies on `src/app/login/page.tsx`, supabase migrations, and notification/domain modules.
