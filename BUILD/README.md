# BUILD/ — the autonomous 5-day build system

This folder drives an unattended, multi-day build of **Fahman Orders**. The work is split into
**25 tasks** (5 days × 5), each created as a **scheduled task** on your Claude desktop app. When a
task fires, a fresh Claude session reads its brief here, plans itself, writes code into this repo,
commits **one file per commit as you** (`Alsakkaf-dev`), and pushes to
`github.com/Alsakkaf-dev/FoodDelivery-App`.

## Files
- **`AGENT_RULES.md`** — the contract every task obeys (commit laws, build loop, quality bar).
- **`PLAN.md`** — the 25-task schedule (dates/times, UTC+8).
- **`PROGRESS.md`** — live checklist + notes the tasks tick off as they go.
- **`day-N/task-N-M.md`** — the 25 self-contained task briefs.
- **`GO_LIVE_CHECKLIST.md`** / **`FINAL_HANDOVER.md`** — created on Day 5.

## How it runs (important)
- Tasks run **locally inside the Claude desktop app while it is open**. If the app is closed at a
  task's scheduled time, that task runs **the next time you open the app** — and overdue tasks run
  in order, so the sequence stays intact.
- To get the smoothest run, **keep the Claude app open** during the daily windows
  (roughly 09:00–19:30 local), 22–26 June 2026. You don't need to do anything else.

## Watch progress
- `git log --oneline` (one commit per file, authored as you) or open the repo on GitHub.
- `BUILD/PROGRESS.md` shows what's done / in-progress / blocked.
- Pull anytime to update your local copy: `git pull` in this folder.

## After Day 5
The app will be **code-complete, typechecked, and tested** on `main`. Taking it **live** needs your
own accounts/secrets (Supabase, Vercel, WhatsApp Cloud API) — follow `BUILD/GO_LIVE_CHECKLIST.md`.
