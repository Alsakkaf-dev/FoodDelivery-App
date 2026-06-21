import 'server-only';
import { createClient as createSbClient } from '@supabase/supabase-js';

/**
 * Service-role client. SERVER-ONLY — bypasses RLS for system automation
 * (notifications, auto sold-out/close, rider address detail). Never import in a
 * client component. The key lives only in server env (see D-22 §7).
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set (server-only).');
  return createSbClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
