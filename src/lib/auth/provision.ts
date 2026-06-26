import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { CONSENT_VERSION } from '@/lib/utils/consent';

// Single source of truth for creating/topping-up a `users` profile row across ALL
// sign-in methods (phone OTP, email OTP, email+password, Google OAuth). Uses the
// service-role client because the row may not exist yet and `users` has no INSERT
// RLS policy. Only fills EMPTY fields, so signing in again via a second method
// augments the profile instead of clobbering it. Consent is recorded once, on first
// create. Role/lang are read back only (operator/rider promotion stays admin-owned).
export interface EnsureProfileInput {
  id: string;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  avatar_url?: string | null;
  recordConsent?: boolean;
}

export async function ensureProfile(input: EnsureProfileInput): Promise<{ role: string; lang: string }> {
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from('users')
    .select('role, lang, name, email, phone, avatar_url')
    .eq('id', input.id)
    .single();

  const patch: Record<string, unknown> = { id: input.id };
  if (input.email && !existing?.email) patch.email = input.email;
  if (input.phone && !existing?.phone) patch.phone = input.phone;
  if (input.name && !existing?.name) patch.name = input.name;
  if (input.avatar_url && !existing?.avatar_url) patch.avatar_url = input.avatar_url;
  if (input.recordConsent && !existing) {
    patch.consent_at = new Date().toISOString();
    patch.consent_version = CONSENT_VERSION;
  }

  await admin.from('users').upsert(patch, { onConflict: 'id', ignoreDuplicates: false });

  const { data: p } = await admin.from('users').select('role, lang').eq('id', input.id).single();
  return { role: p?.role ?? 'customer', lang: p?.lang ?? 'en' };
}
