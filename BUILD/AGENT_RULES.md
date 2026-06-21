# AGENT RULES — read this in full before every build task

You are an autonomous builder continuing **Fahman Orders**, a bilingual (Arabic RTL / English)
real-time ordering & home-delivery **PWA** for a shawarma seller in Johor, Malaysia.
Each scheduled task runs as a **fresh session with no memory** — this file plus your task brief
(`BUILD/day-N/task-N-M.md`) are your full context. Follow these rules exactly; they are non-negotiable.

## 0. Where things are
- **Working repo (build here):** `C:\Users\Mohammed Alsakkaf\Desktop\Food-Delivery\Cooding`
  (Git Bash: `/c/Users/Mohammed Alsakkaf/Desktop/Food-Delivery/Cooding`). Remote `origin` =
  `https://github.com/Alsakkaf-dev/FoodDelivery-App` (branch `main`).
- **Reference docs (READ-ONLY — never modify):** the briefs may cite paths under
  `C:\Users\Mohammed Alsakkaf\Desktop\Food-Delivery\Shawarma` (backlog `.md`, `SDD.pdf`,
  `UIUX.pdf`, per-screen wireframes in `diagrams/uiux-scr-*.png`).
  **If that folder is not present (e.g. you are running in the cloud), the same references are
  committed inside the repo** — wireframes/figures at `BUILD/refs/diagrams/*.png`, the user-story
  backlog at `BUILD/refs/Fahman_Orders_User_Story_Backlog.md`. So treat any
  `Shawarma/diagrams/<x>.png` citation as `BUILD/refs/diagrams/<x>.png`, and
  `Shawarma/Documents/.../Fahman_Orders_User_Story_Backlog.md` as the in-repo `BUILD/refs/` copy.
  The PDFs (SDD/UIUX) live only in the local Shawarma folder; the wireframe PNGs + backlog + this
  repo's `README.md` and `src/**` are enough to build from when running in the cloud.

## 1. The two hard commit laws (NEVER break these)
1. **ONE FILE PER COMMIT.** Every commit contains exactly one file. Never `git add -A` / `git add .`.
   Stage one path, commit, repeat. (`git add -- <path> && git commit -m "..."`).
2. **The commit is the user's, not the AI's.** The repo is pre-configured with
   `user.name = Alsakkaf-dev`, `user.email = mohammed.alsakkaaf@gmail.com`. Do **not** change it,
   do **not** add a `Co-Authored-By` trailer, do **not** mention Claude/AI anywhere in commit
   messages. Verify with `git log -1 --pretty='%an <%ae>'` after committing — it must read
   `Alsakkaf-dev <mohammed.alsakkaaf@gmail.com>`.

Commit message style: `<area>: <imperative summary>` (e.g. `customer/menu: add bilingual menu list`,
`fix: type cookie callback`). One line, no AI references.

## 2. Your loop for every task
1. **Sync:** `git -C <repo> pull --rebase origin main`.
2. **Read:** this file + your brief `BUILD/day-N/task-N-M.md` + the docs/wireframes it names.
3. **Plan:** write a short todo list of the sub-steps for THIS task, then execute it.
4. **Build:** create/modify only the files your brief scopes. Reuse existing domain/api/hooks —
   do not rebuild what exists (see the repo's `README.md` and `src/lib/**`).
5. **Verify GREEN before committing:**
   - `npm run typecheck` (must pass), `npm run lint` (fix what you touched),
   - run/extend relevant tests (`npm run test:unit`, and Playwright on test days).
   - The repo must never be left red. If a change can't be made green, revert it.
6. **Commit — one file per commit** (rule §1), in a sensible order.
7. **Record progress:** tick your task in `BUILD/PROGRESS.md` and append a 2–3 line note of what
   you built / any follow-ups. Commit that file on its own.
8. **Push:** `git -C <repo> push origin main`. Credentials are cached; if push fails on auth,
   **stop and leave a clear note in `BUILD/PROGRESS.md`** (commit it) rather than retrying blindly.

## 3. Quality bar (every screen/feature)
- **Bilingual:** no hard-coded user-facing strings — add to `messages/en.json` **and**
  `messages/ar.json` (AR mirrors EN) in the same task; set `dir` by locale.
- **4 UI states:** empty, loading, error, offline — reuse `src/components/ui/states.tsx`.
- **Touch:** tap targets ≥ 44×44 px; verify RTL mirrors correctly.
- **Server actions / route handlers are the only write path**; validate with Zod; check role.
- **Reuse** `src/components/ui/*` and the existing `src/lib/**`; match the existing Rider UI quality.

## 4. Safety
- **Never commit secrets.** Only `.env.example` is tracked; real `.env*` stays git-ignored.
- **Never log PII** (phone, name, address). Keep RLS on for every table.
- Don't touch the `Shawarma` folder or files outside the `Cooding` repo.
- Stay within the task brief's scope. If you discover out-of-scope work, note it in
  `BUILD/PROGRESS.md` for a later task instead of expanding this one.

## 5. If blocked
Commit whatever is green and complete, write the blocker clearly in `BUILD/PROGRESS.md`
(its own commit), push, and stop. The next scheduled task (or the user) will pick it up.
Never leave the tree red or the push un-done without a recorded reason.
