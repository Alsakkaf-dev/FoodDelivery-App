# Auth setup — two free channels (no paid SMS provider)

Login supports **two channels**, both avoiding a paid SMS provider:

1. **Email OTP** — built into Supabase, free, works locally **now**.
2. **WhatsApp OTP** — phone OTP delivered over WhatsApp via Supabase's *Send-SMS hook*
   (Supabase still generates/verifies the code and owns the session). **Deploy-gated.**

The login screen (`/login`) has a **WhatsApp · هاتف / Email · بريد** toggle.

---

## 1. Email OTP — works now (free, no provider)

Endpoints: `POST /api/auth/email/request`, `POST /api/auth/email/verify`.

**One-time Supabase config:**
- Authentication → **Providers → Email**: ensure **Email** is enabled (it is by default).
- Authentication → **Email Templates → "Magic Link"**: make sure the body includes the
  **`{{ .Token }}`** variable so the email contains the **6-digit code** (not only a link).
  Example line: `Your code: {{ .Token }}`.
- (Optional) Authentication → Rate limits: the built-in email sender is rate-limited
  (a handful per hour). For production add your own SMTP under Project Settings → Auth → SMTP.

**To log in:** open `/login` → **Email** tab → enter your email → check inbox → enter the 6-digit code.
> The DB schema (`supabase/setup.sql`) must be applied for the *profile* row; login itself
> works even before that (the profile step is guarded).

---

## 2. WhatsApp OTP — activates at deploy (free tier / low cost)

Flow: `signInWithOtp({ phone })` → Supabase calls our **Send-SMS hook**
(`POST /api/auth/sms-hook`) → we deliver the code via **WhatsApp Cloud API**. Supabase
verifies the code and creates the session, so the existing phone flow is unchanged.

**Why deploy-gated:** Supabase (cloud) must be able to reach the hook URL over the internet —
it cannot call `localhost`. So this turns on once the app is deployed (Vercel) — or via a
tunnel (e.g. ngrok) for local testing.

**Steps:**
1. **Meta WhatsApp** (free tier): create a Meta app + WhatsApp Business number, get an
   access token + phone-number-id, and submit an **authentication-category template**.
   Put the values in env: `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`.
2. **Deploy** the app (so `https://<your-app>/api/auth/sms-hook` is reachable).
3. **Supabase → Authentication → Hooks → "Send SMS Hook"**: enable it, set the URI to
   `https://<your-app>/api/auth/sms-hook`, and copy the generated **hook secret**.
4. **Supabase → Authentication → Providers → Phone**: enable Phone (the hook replaces the
   need for a Twilio/etc. provider for delivery).
5. Set the hook secret in env (e.g. `SEND_SMS_HOOK_SECRET`) and finish the signature
   verification marked `TODO(deploy)` in `src/app/api/auth/sms-hook/route.ts`.

**To log in:** `/login` → **WhatsApp** tab → enter phone (`+60…`, spaces ok) → receive the
code on WhatsApp → enter it.

---

## Quick test right now (zero setup)
Don't want to configure anything yet? Authentication → Providers → **Phone** → enable →
**Test phone numbers** → add `+60177966805` = `123456`, then log in with that pair. Free,
instant, no real message sent.
