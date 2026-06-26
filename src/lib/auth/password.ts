'use server';
import { createClient } from '@/lib/supabase/server';
import { ok, fail, type ApiResult } from '@/lib/utils/api';
import { signupSchema, passwordLoginSchema, resetRequestSchema, resetUpdateSchema } from '@/lib/utils/schemas';
import { ensureProfile } from '@/lib/auth/provision';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? '';

// Create an email+password account. The display name rides in user_metadata and is
// copied to the profile by ensureProfile (here if a session is returned with
// confirmations off, otherwise by /api/auth/confirm when the email link is opened).
export async function signUpWithPassword(
  input: unknown,
): Promise<ApiResult<{ needsConfirmation: boolean; role: string }>> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) return fail('validation_error', 'Invalid input', parsed.error.flatten());
  const sb = createClient();
  const { data, error } = await sb.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { name: parsed.data.name }, emailRedirectTo: `${APP_URL}/api/auth/confirm` },
  });
  if (error) return fail(error.status === 422 ? 'conflict' : 'bad_request', error.message);
  if (data.session && data.user) {
    const { role } = await ensureProfile({
      id: data.user.id,
      email: parsed.data.email,
      name: parsed.data.name,
      recordConsent: true,
    }).catch(() => ({ role: 'customer' }));
    return ok({ needsConfirmation: false, role });
  }
  return ok({ needsConfirmation: true, role: 'customer' });
}

// Sign in with an existing email+password. Tops up the profile (idempotent).
export async function signInWithPassword(input: unknown): Promise<ApiResult<{ role: string }>> {
  const parsed = passwordLoginSchema.safeParse(input);
  if (!parsed.success) return fail('validation_error', 'Invalid input', parsed.error.flatten());
  const sb = createClient();
  const { data, error } = await sb.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
  if (error || !data.user) return fail('unauthorized', error?.message ?? 'invalid_credentials');
  const { role } = await ensureProfile({ id: data.user.id, email: parsed.data.email }).catch(() => ({ role: 'customer' }));
  return ok({ role });
}

// Send a reset link. Always returns ok so we never reveal whether an email exists.
export async function requestPasswordReset(input: unknown): Promise<ApiResult<null>> {
  const parsed = resetRequestSchema.safeParse(input);
  if (!parsed.success) return fail('validation_error', 'Invalid email');
  const sb = createClient();
  await sb.auth.resetPasswordForEmail(parsed.data.email, { redirectTo: `${APP_URL}/api/auth/confirm?type=recovery` });
  return ok(null);
}

// Set a new password for the recovery session opened by the reset link.
export async function updatePassword(input: unknown): Promise<ApiResult<null>> {
  const parsed = resetUpdateSchema.safeParse(input);
  if (!parsed.success) return fail('validation_error', 'password_too_short');
  const sb = createClient();
  const { error } = await sb.auth.updateUser({ password: parsed.data.password });
  if (error) return fail('bad_request', error.message);
  return ok(null);
}
