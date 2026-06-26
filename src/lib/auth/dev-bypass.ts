// TEMPORARY preview switch — sign-in is DISABLED, not removed.
//
// While `AUTH_DISABLED` is true the app can be browsed end-to-end (customer,
// operator, rider) without any login: the middleware skips its /login redirect
// and the role guards (`requireRole` / `getProfile` in ./roles.ts) hand back a
// mock profile instead of throwing. The real auth flow (login page, OTP/email
// routes, Supabase session, RBAC, RLS) is untouched.
//
// To turn sign-in back ON: set `AUTH_DISABLED` to false (or remove this file's
// usage). No other changes are needed.
//
// NOTE: kept free of `server-only` and Node APIs on purpose so it is safe to
// import from the Edge middleware runtime as well as server components.

import type { Role, UserProfile } from '@/types/db';

export const AUTH_DISABLED = true;

/**
 * A stand-in profile used only while {@link AUTH_DISABLED} is true. The role
 * defaults to whatever the guard asked for, so an operator screen sees an
 * operator and a customer action sees a customer. The id is an all-zero UUID
 * that matches no real row, so user-scoped reads simply come back empty.
 */
export function devProfile(role: Role = 'customer'): UserProfile {
  return {
    id: '00000000-0000-0000-0000-000000000000',
    phone: '+0000000000',
    email: null,
    role,
    name: 'Preview User',
    avatar_url: null,
    bio: null,
    lang: 'en',
    consent_at: null,
    consent_version: null,
    created_at: '1970-01-01T00:00:00.000Z',
  };
}
