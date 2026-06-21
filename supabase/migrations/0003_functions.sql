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
