-- ─────────────────────────────────────────────────────────────────────────────
-- 0008 — per-user server-synced cart + saved favorites. Each row is owned by one
-- user and isolated via RLS (auth.uid()), mirroring push_subscriptions. The
-- composite PK (user_id, menu_item_id) enables upsert-on-conflict.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists cart_items (
  user_id      uuid not null references users(id) on delete cascade,
  menu_item_id uuid not null references menu_items(id) on delete cascade,
  qty          int  not null check (qty > 0 and qty <= 50),
  updated_at   timestamptz not null default now(),
  primary key (user_id, menu_item_id)
);
create index if not exists idx_cart_items_user on cart_items(user_id);

create table if not exists favorites (
  user_id      uuid not null references users(id) on delete cascade,
  menu_item_id uuid not null references menu_items(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (user_id, menu_item_id)
);
create index if not exists idx_favorites_user on favorites(user_id);

alter table cart_items enable row level security;
alter table favorites  enable row level security;

drop policy if exists cart_owner on cart_items;
create policy cart_owner on cart_items for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists fav_owner on favorites;
create policy fav_owner on favorites for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
