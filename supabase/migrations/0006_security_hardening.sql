-- ─────────────────────────────────────────────────────────────────────────────
-- Fahman Orders — 0006 security hardening. Clears the Supabase Security Advisor
-- WARN findings (0 errors). All changes are reversible and safe:
--   • service_role (server automation) BYPASSES execute grants — server code unaffected.
--   • trigger functions fire regardless of execute grants.
--   • auth_role() is intentionally LEFT executable (every RLS policy calls it;
--     revoking it would break all data access).
-- Idempotent + defensive: wrapped so a signature/role mismatch never hard-fails.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1) Pin search_path on the two flagged functions (prevents search_path injection).
do $$
begin
  execute 'alter function public.set_updated_at() set search_path = public';
exception when undefined_function then null; end $$;

do $$
begin
  execute 'alter function public.next_order_no(uuid, date) set search_path = public';
exception when undefined_function then null; end $$;

-- 2) Lock down SECURITY DEFINER functions that must never be called by clients.
--    Only server automation (service_role) needs them; triggers fire regardless.
do $$
declare fn text;
begin
  foreach fn in array array[
    'auto_close_expired_sessions()',
    'restock_after_cancel()',
    'rls_auto_enable()'
  ] loop
    begin
      execute format('revoke execute on function public.%s from public, anon, authenticated', fn);
    exception when undefined_function then null;  -- not present here; skip
    end;
  end loop;
end $$;

-- 3) place_order: only signed-in customers (authenticated) may call it.
--    Remove the implicit anon/PUBLIC grant; keep authenticated (the customer flow).
do $$
begin
  execute 'revoke execute on function '
       || 'public.place_order(uuid, text, uuid, uuid, text, text, jsonb) from public, anon';
  execute 'grant execute on function '
       || 'public.place_order(uuid, text, uuid, uuid, text, text, jsonb) to authenticated';
exception when undefined_function then null; end $$;

-- 4) auth_role(): deliberately untouched — required by every RLS policy.
