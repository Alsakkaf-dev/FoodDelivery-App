-- Fahman Orders — combined schema + seed. Paste ALL of this into the Supabase SQL Editor and Run.
-- Source: supabase/migrations/0001_init.sql, 0002_rls.sql, 0003_functions.sql + seed.sql

-- ========================= migrations/0001_init.sql =========================
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

-- ========================= migrations/0002_rls.sql =========================
-- ─────────────────────────────────────────────────────────────────────────────
-- Fahman Orders — 0002 Row-Level Security (SDD §3.7, §8.3). Defence-in-depth beneath
-- the application RBAC. The service role (server-only) bypasses RLS for automation.
-- ─────────────────────────────────────────────────────────────────────────────

-- Role of the current caller (reads users.role for auth.uid()).
create or replace function auth_role()
returns text language sql stable security definer set search_path = public as $$
  select coalesce((select role from users where id = auth.uid()), 'anon');
$$;

alter table users             enable row level security;
alter table zones             enable row level security;
alter table addresses         enable row level security;
alter table menu_items        enable row level security;
alter table daily_session     enable row level security;
alter table orders            enable row level security;
alter table order_items       enable row level security;
alter table notifications     enable row level security;
alter table payments          enable row level security;
alter table push_subscriptions enable row level security;

-- users: read/update own; operator full; rider reads own ------------------------
create policy users_select on users for select
  using (id = auth.uid() or auth_role() = 'operator');
create policy users_update_own on users for update
  using (id = auth.uid()) with check (id = auth.uid());

-- menu_items, zones, daily_session: public read; operator writes ----------------
create policy menu_public_read on menu_items for select using (true);
create policy menu_write on menu_items for all
  using (auth_role() = 'operator') with check (auth_role() = 'operator');

create policy zones_public_read on zones for select using (true);
create policy zones_write on zones for all
  using (auth_role() = 'operator') with check (auth_role() = 'operator');

create policy session_public_read on daily_session for select using (true);
create policy session_write on daily_session for all
  using (auth_role() = 'operator') with check (auth_role() = 'operator');

-- addresses: private to owner; operator may read --------------------------------
create policy addr_owner on addresses for all
  using (user_id = auth.uid() or auth_role() = 'operator')
  with check (user_id = auth.uid());

-- orders: own (insert/cancel) ; operator full ; rider sees ready/out ------------
create policy orders_select on orders for select using (
  customer_id = auth.uid()
  or auth_role() = 'operator'
  or (auth_role() = 'rider' and status in ('ready','out_for_delivery'))
);
create policy orders_insert_own on orders for insert
  with check (customer_id = auth.uid());
create policy orders_cancel_own on orders for update
  using (customer_id = auth.uid() and status in ('new','confirmed'))
  with check (status = 'cancelled');
create policy orders_operator_all on orders for all
  using (auth_role() = 'operator') with check (auth_role() = 'operator');
create policy orders_rider_advance on orders for update
  using (auth_role() = 'rider' and status in ('ready','out_for_delivery'))
  with check (status in ('out_for_delivery','delivered'));

-- order_items: visible with the parent order ------------------------------------
create policy order_items_select on order_items for select using (
  exists (select 1 from orders o where o.id = order_id and (
    o.customer_id = auth.uid() or auth_role() = 'operator'
    or (auth_role() = 'rider' and o.status in ('ready','out_for_delivery'))))
);
create policy order_items_operator on order_items for all
  using (auth_role() = 'operator') with check (auth_role() = 'operator');

-- notifications: own; operator reads all ----------------------------------------
create policy notif_select on notifications for select
  using (user_id = auth.uid() or auth_role() = 'operator');

-- payments (v2): own read; operator read ----------------------------------------
create policy payments_select on payments for select using (
  auth_role() = 'operator' or exists (select 1 from orders o where o.id = order_id and o.customer_id = auth.uid())
);

-- push_subscriptions: own --------------------------------------------------------
create policy push_owner on push_subscriptions for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ========================= migrations/0003_functions.sql =========================
-- ─────────────────────────────────────────────────────────────────────────────
-- Fahman Orders — 0003 functions. The correctness-critical race-safe order flow
-- (SDD §3.5, §5.1), cancellation restock, and session automation. SECURITY DEFINER
-- so the single atomic statement runs server-side; callers are still role-checked.
-- ─────────────────────────────────────────────────────────────────────────────

-- Daily order number, e.g. FO-20260619-007 --------------------------------------
create or replace function next_order_no(p_session uuid, p_date date)
returns text language plpgsql as $$
declare n int;
begin
  select count(*) + 1 into n from orders where session_id = p_session;
  return 'FO-' || to_char(p_date, 'YYYYMMDD') || '-' || lpad(n::text, 3, '0');
end; $$;

-- place_order: race-safe reserve + persist (SDD §5.1). p_items is jsonb:
--   [{ "menu_item_id": "...", "qty": 2 }, ...]
-- Returns (order_id, order_no, sold_out). Raises on guard failure (mapped to 409/422).
create or replace function place_order(
  p_customer uuid,
  p_type text,
  p_zone uuid,
  p_address uuid,
  p_payment_method text,
  p_proof text,
  p_items jsonb
) returns table(order_id uuid, order_no text, sold_out boolean)
language plpgsql security definer set search_path = public as $$
declare
  v_session daily_session%rowtype;
  v_item_count int;
  v_total numeric(10,2) := 0;
  v_remaining int;
  v_order_id uuid;
  v_order_no text;
  it jsonb;
  v_price numeric(8,2);
  v_now time := (now() at time zone 'Asia/Kuala_Lumpur')::time;
begin
  if p_type = 'delivery' and (p_zone is null or p_address is null) then
    raise exception 'delivery_requires_zone_address' using errcode = '23514'; -- -> 422
  end if;

  -- lock today's session row
  select * into v_session from daily_session where session_date = (now() at time zone 'Asia/Kuala_Lumpur')::date for update;
  if not found or v_session.status <> 'open' then
    raise exception 'shop_not_open' using errcode = 'P0001';                   -- -> 409
  end if;
  if v_session.cutoff_time is not null and v_now > v_session.cutoff_time then
    raise exception 'past_cutoff' using errcode = 'P0001';                     -- -> 409 (FR-C-08/S-04)
  end if;

  -- compute item_count + total from current menu prices (snapshot per line)
  v_item_count := 0;
  for it in select * from jsonb_array_elements(p_items) loop
    select price into v_price from menu_items where id = (it->>'menu_item_id')::uuid and available = true;
    if v_price is null then raise exception 'item_unavailable' using errcode = '23514'; end if;
    v_item_count := v_item_count + (it->>'qty')::int;
    v_total := v_total + v_price * (it->>'qty')::int;
  end loop;
  if v_item_count <= 0 then raise exception 'empty_cart' using errcode = '23514'; end if;

  -- ► race-safe atomic reservation: succeeds only if open AND enough remains (FR-S-02)
  update daily_session
     set qty_remaining = qty_remaining - v_item_count
   where id = v_session.id and status = 'open' and qty_remaining >= v_item_count
  returning qty_remaining into v_remaining;
  if not found then
    raise exception 'sold_out_or_insufficient' using errcode = 'P0001';        -- -> 409 (FR-S-02)
  end if;

  -- persist order + lines in the same transaction (FR-C-05)
  v_order_no := next_order_no(v_session.id, v_session.session_date);
  insert into orders(order_no, session_id, customer_id, zone_id, address_id, type, status,
                     payment_method, payment_status, proof_url, item_count, total)
  values (v_order_no, v_session.id, p_customer, p_zone, p_address, p_type, 'new',
          p_payment_method, case when p_proof is not null then 'submitted' else 'pending' end,
          p_proof, v_item_count, v_total)
  returning id into v_order_id;

  for it in select * from jsonb_array_elements(p_items) loop
    select price into v_price from menu_items where id = (it->>'menu_item_id')::uuid;
    insert into order_items(order_id, menu_item_id, qty, unit_price)
    values (v_order_id, (it->>'menu_item_id')::uuid, (it->>'qty')::int, v_price);
  end loop;

  -- auto sold-out at zero (FR-S-03)
  if v_remaining = 0 then
    update daily_session set status = 'sold_out' where id = v_session.id;
  end if;

  return query select v_order_id, v_order_no, (v_remaining = 0);
end; $$;

-- Restock on cancellation (SDD §4.1): return reserved units; revert sold_out->open.
create or replace function restock_after_cancel()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    update daily_session
       set qty_remaining = least(qty_total, qty_remaining + old.item_count),
           status = case when status = 'sold_out' then 'open' else status end
     where id = new.session_id and status <> 'closed';
  end if;
  return new;
end; $$;
create trigger orders_restock after update of status on orders
  for each row execute function restock_after_cancel();

-- Auto-close ordering at cut-off and at 19:00 MYT (FR-S-04/05). Call from a free
-- scheduled job (Supabase cron / GitHub Actions) every few minutes.
create or replace function auto_close_expired_sessions()
returns void language plpgsql security definer set search_path = public as $$
declare v_now time := (now() at time zone 'Asia/Kuala_Lumpur')::time;
begin
  update daily_session
     set status = 'closed', closed_at = now()
   where status in ('open','sold_out')
     and session_date = (now() at time zone 'Asia/Kuala_Lumpur')::date
     and (v_now >= time '19:00' or (cutoff_time is not null and v_now > cutoff_time));
end; $$;

-- ========================= seed.sql =========================
-- ─────────────────────────────────────────────────────────────────────────────
-- Fahman Orders — seed data (idempotent). Zones, a sample menu, and today's session.
-- Run with: npm run db:seed   (or paste into the Supabase SQL editor).
-- ─────────────────────────────────────────────────────────────────────────────

insert into zones (name, active, sort_order) values
  ('Pulai Spring', true, 1),
  ('D''summit',    true, 2),
  ('Garden',       true, 3),
  ('Desa',         true, 4),
  ('Greenfield',   true, 5)
on conflict do nothing;

insert into menu_items (name_en, name_ar, description_en, description_ar, price, available, sort_order) values
  ('Chicken Shawarma', 'شاورما دجاج', 'Grilled chicken, garlic sauce, pickles in flatbread', 'دجاج مشوي وثوم ومخلل في خبز صاج', 8.50, true, 1),
  ('Beef Shawarma',    'شاورما لحم',  'Spiced beef, tahini, salad in flatbread',           'لحم متبّل وطحينة وسلطة في خبز صاج', 9.50, true, 2),
  ('Shawarma Plate',   'صحن شاورما',  'Shawarma with rice, salad and sauce',               'شاورما مع أرز وسلطة وصلصة',          14.00, true, 3),
  ('Falafel Wrap',     'لفة فلافل',   'Falafel, hummus, salad in flatbread',               'فلافل وحمص وسلطة في خبز صاج',         7.00, true, 4),
  ('Soft Drink',       'مشروب غازي',  'Canned soft drink',                                  'مشروب غازي معلب',                     2.50, true, 5)
on conflict do nothing;

-- Today's session (closed by default; the operator opens it from the dashboard).
insert into daily_session (session_date, status, qty_total, qty_remaining, cutoff_time, delivery_window)
values ((now() at time zone 'Asia/Kuala_Lumpur')::date, 'closed', 40, 40, time '18:00', '1:00–7:00 PM')
on conflict (session_date) do nothing;
