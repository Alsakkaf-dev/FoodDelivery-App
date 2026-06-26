import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import en from '../../messages/en.json';

// ── Mocks ───────────────────────────────────────────────────────────────────
vi.mock('server-only', () => ({}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: () => {}, refresh: () => {} }),
  useSearchParams: () => ({ get: () => null }),
}));

const { holder, requireRole } = vi.hoisted(() => ({
  holder: { admin: undefined as unknown },
  requireRole: vi.fn(async () => ({ id: 'u-1', role: 'customer' })),
}));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => holder.admin }));
vi.mock('@/lib/auth/roles', () => ({
  requireRole,
  RoleError: class RoleError extends Error {
    code: string;
    constructor(code: string) {
      super(code);
      this.code = code;
    }
  },
}));

// #06 restyled /login into a SERVER component that reads the request locale via
// getI18n() (next/headers). Provide it so LoginPage renders in the node test env —
// lockstep with #06's auth-shell restyle (the PDPA gate itself lives in <LoginForm>).
vi.mock('@/lib/i18n/server', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  const enDict = (await import('../../messages/en.json')).default;
  return { ...actual, getI18n: () => ({ locale: 'en', t: enDict }) };
});

import { requestErasure, eraseUserById } from '@/lib/domain/privacy';
import { CONSENT_VERSION } from '@/lib/utils/consent';
import LoginPage from '@/app/login/page';

