# RELEASE SIGN-OFF — Fahman Orders UI/UX Overhaul (Engineer #20 gate)

#20 declares the product shippable only when **every** box below is true. Until then the gate is OPEN.

## Blocking gates (all must hold)
- [ ] **No open S1/S2 defects** in `DEFECT_LOG.md` (contrast QA-001..003/009 resolved or Owner-accepted).
- [ ] **`npm run typecheck`** clean after Manager integration (whole-repo `tsc` green).
- [ ] **`npm run test:unit`** green — incl. foundation, ui-primitives, shell-nav, i18n-parity,
      a11y-contrast, contract-data-hooks (and any pre-existing env failures resolved/documented).
- [ ] **`npm run build && npm run test:e2e`** green across `android`, `desktop`, `mobile-narrow`, `tablet`
      (seeded-data specs may self-skip under `AUTH_DISABLED` preview — documented, not a failure).
- [ ] **`node scripts/i18n-parity.mjs`** green — EN/AR key + `{{var}}` parity (#03).
- [ ] **All frozen `data-*` hooks intact** (contract-data-hooks guard green; e2e selectors aligned).

## Quality gates (per the Definition of Done)
- [ ] Every screen in `AUDIT_MATRIX.md` audited: Vis ✅ · Tok ✅ · Rsp ✅ · A11y ✅ · RTL ✅ · i18n ✅ · St ✅.
- [ ] Light theme only — no dark-mode artifacts (immersive cart is the only intentional dark surface).
- [ ] AR + EN both render; full RTL mirroring; logical CSS props only; no hardcoded copy.
- [ ] Tap targets ≥44px everywhere; visible focus; reduced-motion honoured.
- [ ] Tokens/primitives reused — no hardcoded hex / forked primitives / redefined tokens.
- [ ] Frozen logic/data contracts intact: cart (`fahman.cart.v1`, MAX_QTY 50), checkout draft,
      `POST /api/orders` + Idempotency-Key, ORDER_TRANSITIONS/REFUSABLE/COLUMNS, realtime channels,
      storage buckets, z-stack (30<40<50<60), `AUTH_DISABLED`, `force-dynamic`.
- [ ] PWA installable; `theme_color` / `viewport.themeColor` = `#F5811F`; no layout shift.

## Sign-off
| Role | Name | Status | Date |
|---|---|---|---|
| QA gate (#20) | — | ⬜ pending | — |
| Manager (#21) integration | — | ⬜ pending | — |
| Owner acceptance | Mohammed Al-Sakkaf | ⬜ pending | — |
