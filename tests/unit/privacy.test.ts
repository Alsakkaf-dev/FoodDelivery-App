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

function makeAdmin() {
  const rec = {
    deletes: [] as string[],
    updates: [] as { table: string; payload: Record<string, unknown> }[],
    inserts: [] as { table: string; payload: Record<string, unknown> }[],
  };
  function from(table: string) {
    const b = {
      delete: () => {
        rec.deletes.push(table);
        return b;
      },
      update: (p: Record<string, unknown>) => {
        rec.updates.push({ table, payload: p });
        return b;
      },
      insert: (p: Record<string, unknown>) => {
        rec.inserts.push({ table, payload: p });
        return b;
      },
      eq: () => b,
      then: (res: (v: unknown) => unknown, rej?: (e: unknown) => unknown) => Promise.resolve({ error: null }).then(res, rej),
    };
    return b;
  }
  return { client: { from }, rec };
}

beforeEach(() => {
  requireRole.mockClear();
  requireRole.mockResolvedValue({ id: 'u-1', role: 'customer' });
});

describe('requestErasure — self-service PDPA erasure (US-057)', () => {
  it('deletes addresses, scrubs phone/name, and writes an audit row', async () => {
    const a = makeAdmin();
    holder.admin = a.client;
    const res = await requestErasure();
    expect(res.ok).toBe(true);
    expect(a.rec.deletes).toContain('addresses');
    expect(a.rec.updates).toContainEqual({ table: 'users', payload: { phone: 'deleted-u-1', name: null } });
    expect(a.rec.inserts).toContainEqual({ table: 'erasure_audit', payload: { user_id: 'u-1', fields: 'phone,name,addresses' } });
  });
});

describe('eraseUserById — operator-handled erasure', () => {
  it('rejects an empty user id', async () => {
    holder.admin = makeAdmin().client;
    const res = await eraseUserById('');
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe('validation_error');
  });

  it('erases the named user', async () => {
    const a = makeAdmin();
    holder.admin = a.client;
    const res = await eraseUserById('cust-9');
    expect(res.ok).toBe(true);
    expect(a.rec.updates).toContainEqual({ table: 'users', payload: { phone: 'deleted-cust-9', name: null } });
  });
});

describe('consent version', () => {
  it('is defined and stamped on sign-in', () => {
    expect(typeof CONSENT_VERSION).toBe('string');
    expect(CONSENT_VERSION.length).toBeGreaterThan(0);
  });
});

describe('login PDPA consent gate (US-007)', () => {
  it('defaults consent OFF and disables the submit until opted in', () => {
    const html = renderToStaticMarkup(createElement(LoginPage));
    // Consent copy is sourced from messages and shown bilingually.
    expect(html).toContain(en.consent_agree);
    // The checkbox renders unchecked (no `checked` attribute) and the CTA is disabled.
    expect(html).not.toContain('checked=""');
    expect(html).toContain('disabled');
  });
});
