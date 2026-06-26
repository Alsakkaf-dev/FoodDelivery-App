-- ─────────────────────────────────────────────────────────────────────────────
-- 0007 — multi-method identity on users (phone OTP + email OTP + email/password
-- + Google OAuth). Additive & idempotent. Adds email/avatar_url/bio, makes phone
-- optional, and repairs the legacy email-as-phone provisioning hack.
-- ─────────────────────────────────────────────────────────────────────────────

alter table users add column if not exists email      text;
alter table users add column if not exists avatar_url text;
alter table users add column if not exists bio        text;

-- Repair rows where an email was stored in the phone column (hack signature: a
-- real E.164 phone never contains '@'). Move it to email, then clear the phone.
update users set email = phone
 where email is null and phone like '%@%';
update users set phone = null
 where phone like '%@%' and email is not null and email = phone;

-- Phone is now optional (email/oauth users may have no phone).
alter table users alter column phone drop not null;

-- Case-insensitive unique email (NULLs allowed → many phone-only users OK).
create unique index if not exists uq_users_email_ci on users (lower(email)) where email is not null;

-- Every user must keep at least one contact identifier.
alter table users drop constraint if exists users_contact_present;
alter table users add  constraint users_contact_present
  check (phone is not null or email is not null);
