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
