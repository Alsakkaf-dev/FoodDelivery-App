-- 0005 — PDPA consent versioning + erasure audit (US-007 / US-057, NFR-C-01/02/03).
-- Records which privacy-policy version the user consented to, and an audit trail of
-- verified data-erasure requests. Idempotent.

alter table users add column if not exists consent_version text;

create table if not exists erasure_audit (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references users(id) on delete set null,
  fields      text not null,                                   -- which personal fields were erased
  created_at  timestamptz not null default now()
);

alter table erasure_audit enable row level security;
-- Service-role only (the erasure path uses the admin client); no public policy.
