-- 0004 — store the WhatsApp Cloud API message id on each notification so inbound
-- delivery receipts (the webhook POST) map precisely to their row (FR-S-15),
-- instead of the previous broad "most recent sent" update. Idempotent.

alter table notifications add column if not exists provider_message_id text;

create index if not exists idx_notif_provider
  on notifications(provider_message_id)
  where provider_message_id is not null;
