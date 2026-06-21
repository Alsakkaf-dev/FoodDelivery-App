# task-5-5 — Final integration pass + handover + release tag
> Day 5 · Sprint S4 · Scheduled: 2026-06-26T19:10:00+08:00 (Asia/Kuala_Lumpur, UTC+8)

## Goal
Run the full quality gate green (typecheck + lint + unit + e2e), fix any residuals across the three role areas, mark the build 100% complete, write the final handover doc, and cut a v1.0.0 release commit/tag.

## Scope — build exactly this
- Full green gate: run `npm run typecheck`, `npm run lint`, `npm run test:unit`, `npm run build`, `npm run test:e2e`; fix residual failures (type errors, lint, broken selectors, flaky waits). Do not rescope features — only stabilize.
- Integration sanity: walk each role once against the built UI wiring (Customer order via `createOrder`/`listMyOrders`/`getOrder`; Operator via `configureSession`/`openShop`/`boardList`/`advanceOrder`/`verifyPayment`/`endOfDay`; Rider via `riderDeliveries`/`riderPickup`/`riderDeliver`) confirming realtime hooks update live and the 4 UI states render.
- Update `BUILD/PROGRESS.md` to 100% with a per-day/per-task status table reflecting Days 1–5.
- Write `BUILD/FINAL_HANDOVER.md`: what was built, architecture map (routes → server actions → domain → DB), how to run/test/deploy (link README + GO_LIVE_CHECKLIST), known limitations, and next steps.
- Release: create a final commit and tag `v1.0.0` (annotated), authored as the user; push tag to origin.

## Requirements & user stories covered
- Final acceptance — all S0–S4 stories integrated; the three role journeys pass; release tagged.

## Design references (read these first)
- Shawarma/diagrams/figure-4-order-lifecycle.png (the lifecycle the integration pass must confirm)
- Shawarma/diagrams/sdd-fig-1-erd.png (data model sanity for handover map)
- Shawarma/Documents/pdf format files/Design Phase/Fahman_Orders_SDD.pdf (architecture, state machines)

## Files to CREATE
- BUILD/FINAL_HANDOVER.md — final architecture map, run/test/deploy, limitations, next steps

## Files to REUSE / MODIFY (already exist — do not rebuild)
- BUILD/PROGRESS.md — set to 100% with status table.
- README.md and BUILD/GO_LIVE_CHECKLIST.md — link from handover (do not duplicate).
- Everything under src/* — touch only to fix residual typecheck/lint/test failures.
- package.json scripts — the gate commands (`typecheck`, `lint`, `test:unit`, `test:e2e`, `build`).

## Acceptance criteria (Given/When/Then)
- Final acceptance — Given the full repo, When typecheck, lint, unit, build, and e2e are run, Then all pass with zero residual failures.
- Handover — Given a new owner reads BUILD/FINAL_HANDOVER.md, When they follow it, Then they can run, test, and deploy without further context.
- Release — Given the green build, When the release is cut, Then a `v1.0.0` annotated tag exists on origin/main authored as the user.

## Definition of Done
All gates green (typecheck + lint + unit + e2e + build); PROGRESS.md at 100%; FINAL_HANDOVER.md written; bilingual AR/EN parity intact; 4 UI states + ≥44px targets + RTL verified across roles; committed ONE FILE PER COMMIT authored as the user; v1.0.0 tag pushed to origin/main.

## Dependencies
- Runs last; depends on task-5-1 (unit), task-5-2 (e2e), task-5-3 (security/a11y/PDPA), and task-5-4 (deploy-prep). Relies on the entire codebase and BUILD/ docs.
