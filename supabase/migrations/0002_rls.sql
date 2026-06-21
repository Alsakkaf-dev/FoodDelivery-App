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
