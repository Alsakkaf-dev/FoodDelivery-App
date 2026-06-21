-- ─────────────────────────────────────────────────────────────────────────────
-- Fahman Orders — 0001 init schema (>= 3NF). Mirrors SDD (D-09 §3) data dictionary.
-- Currency MYR, timezone MYT (UTC+8). Primary keys are uuid; FKs carry ON DELETE.
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists pgcrypto;        -- gen_random_uuid()

-- Generic updated_at trigger ------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

-- users --------------------------------------------------------------------------
create table if not exists users (
  id          uuid primary key default gen_random_uuid(),
  phone       text not null unique,                          -- E.164
  role        text not null default 'customer' check (role in ('customer','operator','rider')),
  name        text,
  lang        text not null default 'en' check (lang in ('en','ar')),  -- FR-C-14
  consent_at  timestamptz,                                   -- PDPA consent (NFR-C-01)
  created_at  timestamptz not null default now()
);

-- zones --------------------------------------------------------------------------
create table if not exists zones (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  active      boolean not null default true,                 -- FR-O-07
  sort_order  int not null default 0
);

-- addresses ----------------------------------------------------------------------
create table if not exists addresses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  zone_id     uuid not null references zones(id) on delete restrict,
  label       text,
  line1       text not null,
  pin_lat     numeric(9,6),                                  -- FR-C-07 (optional map pin)
  pin_lng     numeric(9,6),
  created_at  timestamptz not null default now()
);

-- menu_items ---------------------------------------------------------------------
create table if not exists menu_items (
  id              uuid primary key default gen_random_uuid(),
  name_en         text not null,
  name_ar         text not null,
  description_en  text,
  description_ar  text,
  price           numeric(8,2) not null check (price >= 0), -- MYR
  photo_url       text,
  available       boolean not null default true,            -- FR-C-04 / FR-O-08
  sort_order      int not null default 0
);

-- daily_session ------------------------------------------------------------------
create table if not exists daily_session (
  id              uuid primary key default gen_random_uuid(),
  session_date    date not null unique,                      -- one per day (FR-S-06)
  status          text not null default 'closed' check (status in ('open','closed','sold_out')),
  qty_total       int not null default 0 check (qty_total >= 0),                 -- FR-O-04
  qty_remaining   int not null default 0 check (qty_remaining >= 0 and qty_remaining <= qty_total), -- FR-S-02
  cutoff_time     time,                                      -- FR-O-05 / FR-S-04
  delivery_window text,                                      -- FR-O-06
  opened_at       timestamptz,
  closed_at       timestamptz,
  created_at      timestamptz not null default now()
);
-- At most one OPEN session at any time (FR-S-06).
create unique index if not exists one_open_session on daily_session ((1)) where status = 'open';

-- orders -------------------------------------------------------------------------
create table if not exists orders (
  id              uuid primary key default gen_random_uuid(),
  order_no        text not null unique,
  session_id      uuid not null references daily_session(id) on delete restrict,
  customer_id     uuid not null references users(id) on delete restrict,
  zone_id         uuid references zones(id),
  address_id      uuid references addresses(id),
  type            text not null check (type in ('delivery','pickup')),           -- FR-C-06
  status          text not null default 'new'
                    check (status in ('new','confirmed','preparing','ready','out_for_delivery','delivered','cancelled')),
  payment_method  text not null check (payment_method in ('cod','duitnow_qr')),  -- FR-C-09
  payment_status  text not null default 'pending'
                    check (payment_status in ('pending','submitted','verified','rejected')),
  proof_url       text,
  item_count      int not null check (item_count > 0),       -- drives stock decrement (FR-S-01)
  total           numeric(10,2) not null check (total >= 0), -- cached aggregate (SDD §3.4)
  cancel_reason   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  -- a delivery order cannot exist without zone + address (FR-C-07)
  constraint delivery_needs_addr check (type = 'pickup' or (zone_id is not null and address_id is not null))
);
create trigger orders_updated_at before update on orders
  for each row execute function set_updated_at();

-- order_items --------------------------------------------------------------------
create table if not exists order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references orders(id) on delete cascade,
  menu_item_id  uuid not null references menu_items(id) on delete restrict,
  qty           int not null check (qty > 0),
  unit_price    numeric(8,2) not null check (unit_price >= 0)   -- price snapshot (SDD §3.4)
);

-- notifications ------------------------------------------------------------------
create table if not exists notifications (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid references orders(id) on delete cascade,   -- null for broadcasts
  user_id      uuid references users(id) on delete set null,   -- null = broadcast-all
  event        text not null,                                  -- EVT-nn (SDD §7.1)
  channel      text not null check (channel in ('whatsapp','web_push')),
  template     text not null,
  lang         text not null check (lang in ('en','ar')),
  status       text not null default 'queued' check (status in ('queued','sent','delivered','failed')),
  retry_count  int not null default 0,
  sent_at      timestamptz,
  created_at   timestamptz not null default now()
);
-- exactly one notification per order transition (FR-S-09)
create unique index if not exists uq_notif_order_event on notifications(order_id, event) where order_id is not null;

-- payments (v2 — designed, not used in v1) --------------------------------------
create table if not exists payments (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references orders(id) on delete restrict,
  provider    text not null check (provider in ('billplz','toyyibpay','stripe_fpx')),
  amount      numeric(10,2) not null check (amount >= 0),
  status      text not null default 'initiated' check (status in ('initiated','paid','failed','refunded')),
  ref         text,
  created_at  timestamptz not null default now()
);

-- web push subscriptions (free fallback channel, FR-S-11) ------------------------
create table if not exists push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz not null default now()
);

-- Indexes (SDD §3.6) -------------------------------------------------------------
create index if not exists idx_orders_session  on orders(session_id);
create index if not exists idx_orders_status   on orders(status);
create index if not exists idx_orders_customer on orders(customer_id);
create index if not exists idx_orders_zone     on orders(zone_id);
create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_notifications_order on notifications(order_id);
create index if not exists idx_addresses_user  on addresses(user_id);
