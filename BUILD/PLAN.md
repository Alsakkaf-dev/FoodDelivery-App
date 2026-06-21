# Fahman Orders — 5-Day Autonomous Build Plan (25 tasks)

One **root plan per day**, **5 task-plans per day**, **25 total** — each task is its own scheduled
run that reads its brief, makes its own micro-plan, builds, verifies green, and commits
**one file per commit** as the user. Times are **Asia/Kuala_Lumpur (UTC+8)**. Tasks are sequential
(each builds on the previous); if the app is closed at a fire time, the task runs on next launch.

> Foundation (the ~50% scaffold) is already committed & green on `main` before Day 1.

## Day 1 — 2026-06-22 · Foundation hardening, shared UI, customer live-status
| Time | Task | Brief |
|---|---|---|
| 09:10 | 1-1 Foundation audit & green baseline | `day-1/task-1-1.md` |
| 11:40 | 1-2 Design tokens + shared UI + 4 states + RTL | `day-1/task-1-2.md` |
| 14:10 | 1-3 App shell & role layouts + bottom nav | `day-1/task-1-3.md` |
| 16:40 | 1-4 i18n completeness + language switcher | `day-1/task-1-4.md` |
| 19:10 | 1-5 Customer Home / Live Status | `day-1/task-1-5.md` |

## Day 2 — 2026-06-23 · Customer ordering & checkout
| Time | Task | Brief |
|---|---|---|
| 09:10 | 2-1 Menu list + item detail | `day-2/task-2-1.md` |
| 11:40 | 2-2 Cart | `day-2/task-2-2.md` |
| 14:10 | 2-3 Checkout: fulfilment + zone + address | `day-2/task-2-3.md` |
| 16:40 | 2-4 Checkout: payment + gate + place order | `day-2/task-2-4.md` |
| 19:10 | 2-5 Confirmation + tracking + history | `day-2/task-2-5.md` |

## Day 3 — 2026-06-24 · Operator experience
| Time | Task | Brief |
|---|---|---|
| 09:10 | 3-1 Dashboard + one-tap Open/Close/Sold-Out | `day-3/task-3-1.md` |
| 11:40 | 3-2 Daily setup (qty/cutoff/window/zones) | `day-3/task-3-2.md` |
| 14:10 | 3-3 Menu manager (CRUD/price/availability/photo) | `day-3/task-3-3.md` |
| 16:40 | 3-4 Live order board (advance/dispatch) | `day-3/task-3-4.md` |
| 19:10 | 3-5 Order detail/verify/refuse/broadcast/EOD | `day-3/task-3-5.md` |

## Day 4 — 2026-06-25 · Realtime, notifications, rider, automation, PWA
| Time | Task | Brief |
|---|---|---|
| 09:10 | 4-1 Notifications end-to-end (WhatsApp + Push) | `day-4/task-4-1.md` |
| 11:40 | 4-2 Realtime correctness (<2s, snapshot, reconnect) | `day-4/task-4-2.md` |
| 14:10 | 4-3 Rider flow completion & polish | `day-4/task-4-3.md` |
| 16:40 | 4-4 Automation & inventory integrity | `day-4/task-4-4.md` |
| 19:10 | 4-5 PWA shell / offline / install / push | `day-4/task-4-5.md` |

## Day 5 — 2026-06-26 · Hardening, tests, docs, deploy-prep
| Time | Task | Brief |
|---|---|---|
| 09:10 | 5-1 Unit tests (Vitest) | `day-5/task-5-1.md` |
| 11:40 | 5-2 E2E tests (Playwright) | `day-5/task-5-2.md` |
| 14:10 | 5-3 Security + a11y + PDPA hardening | `day-5/task-5-3.md` |
| 16:40 | 5-4 Deploy-prep (env/CI/config/README) | `day-5/task-5-4.md` |
| 19:10 | 5-5 Final integration + handover + release tag | `day-5/task-5-5.md` |

**End state:** a code-complete, typechecked, tested, deploy-ready Fahman Orders app on `main`.
Going live (real Supabase/Vercel/WhatsApp) is the guided step in `BUILD/GO_LIVE_CHECKLIST.md`.
