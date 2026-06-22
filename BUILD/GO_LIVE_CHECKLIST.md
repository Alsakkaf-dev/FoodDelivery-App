# Fahman Orders — GO-LIVE CHECKLIST

Everything the **owner** must supply or do to take the app from a green build to
serving real customers. The code is complete and tested; these are the human /
account / secret steps that cannot be committed to the repo.

> Order matters top-to-bottom. Tick each box. Nothing else is needed once every
> item is done — only your own accounts and secrets.

## 1. Supabase (database + auth + realtime + storage)
- [ ] Create a Supabase project in **Singapore (ap-southeast-1)** (free tier).
- [ ] Apply the schema: run `npm run db:migrate` (pushes `supabase/migrations/0001→0005`),
      **or** paste `supabase/setup.sql` into the SQL editor (combined schema + the
      0004/0005 additions). Then seed: `npm run db:seed` (zones, sample bilingual
      menu, today's closed session).
- [ ] Copy the project **URL**, **anon key**, **service-role key** into env (below).
- [ ] **Storage:** create two public buckets — `payment-proofs` and `menu-photos` —
      each with an authenticated-insert policy. Drop the merchant DuitNow QR at
      `public/duitnow-qr.png` if using DuitNow.
- [ ] **Auth:** enable Email OTP (works immediately). For WhatsApp-delivered phone
      OTP, configure the Supabase **Send-SMS hook** → `/api/auth/sms-hook` (see
      `BUILD/AUTH_SETUP.md`).
- [ ] Create the **operator** and **rider** accounts: sign each in once, then set
      `users.role = 'operator'` / `'rider'` in the SQL editor (default is customer).

## 2. WhatsApp Business Cloud API (primary notifications — optional at launch)
- [ ] Create a Meta app + WhatsApp Business number; get a **permanent/system-user token**.
- [ ] Set `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`,
      `WHATSAPP_APP_SECRET` in env.
- [ ] Point the webhook to `https://<app>/api/webhooks/whatsapp` and verify (GET hub
      challenge). Until approved, the app automatically falls back to Web Push.

## 3. Web Push (free fallback notifications)
- [ ] Generate VAPID keys: `npx web-push generate-vapid-keys`.
- [ ] Set `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`.
- [ ] Replace the placeholder `public/icons/` with real PNGs — `icon-192.png`,
      `icon-512.png`, `maskable-512.png` — so install shows the app icon.

## 4. Vercel (hosting)
- [ ] Import the GitHub repo into Vercel; region **Singapore (ap-southeast-1)**.
- [ ] Add **all** env vars from `.env.example` in Project → Settings → Environment
      Variables (production + preview). `NEXT_PUBLIC_*` are browser-exposed; the rest
      are server-only.
- [ ] Set `NEXT_PUBLIC_APP_URL` to the production URL.
- [ ] Deploy `main`; confirm the build is green.

## 5. Scheduled auto-close (free tier)
- [ ] Set `AUTO_CLOSE_SECRET` (a long random string) in Vercel env.
- [ ] Add GitHub Actions repo secrets `APP_URL` (deployed URL) and `AUTO_CLOSE_SECRET`
      (matching). The workflow `.github/workflows/auto-close.yml` pokes
      `/api/admin/auto-close` every 5 min during 13:00–19:59 MYT to close ordering at
      the cut-off and at 19:00.

## 6. Trading config (operator, in-app)
- [ ] Sign in as operator → `/operator/setup`: set today's quantity, cut-off time,
      delivery window, and active zones.
- [ ] Add/curate menu items + photos at `/operator/menu`.
- [ ] Tap **Open shop** on `/operator` when ready to trade.

## 7. Smoke test (all three roles)
- [ ] **Customer:** browse `/menu` → add → checkout (delivery + COD) → see live status.
- [ ] **Operator:** see the order on `/operator/board` → advance New→…→Delivered;
      verify a DuitNow proof; send a broadcast; check `/operator/end-of-day`.
- [ ] **Rider:** `/rider` shows the ready delivery → open it → Picked-up → Delivered.
- [ ] Switch to Arabic — confirm the whole app flips to RTL and persists on reload.
- [ ] Install the PWA (A2HS) and confirm the offline shell renders with no network.

## Known limitations / deferred
- Next.js stays on the patched **14.2.x** line; a future Next 15/16 major upgrade
  closes the remaining advisories flagged by `npm audit` (none apply to this
  deployment's config — see `BUILD/PROGRESS.md` 5-3 note).
- Dev-tooling audit advisories (esbuild/vitest, glob/eslint-config-next) are
  build-time only and need breaking major upgrades; not shipped to users.
- E2E specs self-skip data-dependent paths until a seeded stack is available; the
  RTL + tap-target + unit suites run everywhere.
