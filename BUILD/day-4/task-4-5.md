# task-4-5 — PWA shell, offline, install, push subscription
> Day 4 · Sprint S4 · Scheduled: 2026-06-25T19:10:00+08:00 (Asia/Kuala_Lumpur, UTC+8)

## Goal
Ship an installable, offline-resilient PWA: a registered service worker that caches the app shell (menu/status), a wired offline fallback page, an A2HS install prompt, and a complete Web Push subscription flow (request permission → subscribe with VAPID → POST to the server). Refinements to existing SW/manifest, plus the client subscription wiring.

## Scope — build exactly this
- Service worker registration: the current `public/sw.js` exists but nothing registers it — add a small client registration component (`src/components/pwa/register-sw.tsx`, 'use client', registers `/sw.js` on load) and mount it in `src/app/layout.tsx`.
- SW caching: extend the SHELL precache and the fetch strategy in `public/sw.js` so the menu/status shell renders offline; keep network-first for navigations with the `/offline` fallback (already present); cache static/menu GET responses (stale-while-revalidate) without caching authed mutations.
- Manifest: verify `public/manifest.webmanifest` is linked from the root layout `<head>` (add the `<link rel="manifest">` and theme-color meta if missing); confirm icons exist under public/icons.
- Install prompt: add `src/components/pwa/install-prompt.tsx` capturing `beforeinstallprompt`, showing a dismissible bilingual A2HS button (≥44px), calling `prompt()` on tap.
- Web Push subscription flow: add `src/components/pwa/push-optin.tsx` that requests Notification permission, subscribes via `registration.pushManager.subscribe` using `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (base64-url → Uint8Array), and POSTs the subscription to `/api/push/subscribe`. Reuse the existing route — do not change its contract.
- 4 UI states: ensure the offline page mirrors the `uiux-fig-4-states.png` offline pattern; keep AR + EN copy (offline page already has both).
- Add a Playwright e2e asserting the manifest link + SW registration, and a unit test for the base64→Uint8Array VAPID key conversion.

## Requirements & user stories covered
- **EP-13 (PWA/offline NFRs)** — installable PWA; NFR-C-04: offline fallback renders the last cached shell so live-status still loads a meaningful screen; FR-S-11 / FR-C-13: Web Push subscription persisted for the notification fallback used in task-4-1.

## Design references (read these first)
- Shawarma/diagrams/uiux-fig-4-states.png (empty/loading/error/offline state patterns)
- Shawarma/Documents/pdf format files/Design Phase/Fahman_Orders_UIUX.pdf (PWA/install + offline section, tokens) and _SDD.pdf §6 (Web Push + VAPID, service worker scope)

## Files to CREATE
- src/components/pwa/register-sw.tsx — registers /sw.js (client).
- src/components/pwa/install-prompt.tsx — beforeinstallprompt A2HS button (bilingual, dismissible).
- src/components/pwa/push-optin.tsx — permission → pushManager.subscribe(VAPID) → POST /api/push/subscribe.
- tests/unit/pwa-vapid.test.ts — base64url→Uint8Array conversion.
- tests/e2e/pwa.spec.ts — manifest link present + SW registers.

## Files to REUSE / MODIFY (already exist — do not rebuild)
- public/sw.js — extend SHELL precache + fetch caching for menu/status; keep `/offline` fallback, push + notificationclick handlers.
- public/manifest.webmanifest — verify fields/icons; no rebuild.
- src/app/offline/page.tsx — already bilingual; align visuals to uiux-fig-4-states.
- src/app/layout.tsx — add `<link rel="manifest">`, theme-color, and mount RegisterSW (and InstallPrompt/PushOptIn where appropriate).
- src/app/api/push/subscribe/route.ts — POST handler that upserts into `push_subscriptions` keyed by endpoint; reuse as-is (it accepts `{ endpoint, keys:{p256dh,auth} }`).
- next.config.mjs — already serves /sw.js with no-cache headers; confirm scope.
- .env.example — `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (client) and `VAPID_PRIVATE_KEY`/`VAPID_SUBJECT` (server) already referenced by webpush.ts; do not inline values.

## Acceptance criteria (Given/When/Then)
- **Installable:** Given a supported browser, When the manifest + registered SW are present, Then the app is installable (A2HS prompt appears and install succeeds).
- **Offline shell (NFR-C-04):** Given the SW is active, When the network drops on a navigation, Then the cached shell or /offline page renders (not a browser error).
- **Push subscription:** Given the customer opts in, When permission is granted, Then a VAPID subscription is created and POSTed to /api/push/subscribe and persisted — enabling the task-4-1 push fallback.

## Definition of Done
typecheck + lint clean; PWA e2e + VAPID unit test added/green; bilingual AR/EN strings for install/opt-in (AR mirrors EN); 4 UI states incl. offline; ≥44px tap targets & RTL verified; no VAPID secret inlined (env only); committed ONE FILE PER COMMIT authored as the user; pushed to origin/main.

## Dependencies
Runs last on Day 4, after task-4-1 (the push fallback this subscription feeds). Relies on `public/sw.js`, `public/manifest.webmanifest`, `src/app/offline/page.tsx`, `src/app/api/push/subscribe/route.ts`, and `src/lib/notifications/webpush.ts` for VAPID config.
