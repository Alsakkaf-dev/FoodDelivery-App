import { describe, it, expect, vi } from 'vitest';

import en from '../../messages/en.json';
import ar from '../../messages/ar.json';
import {
  LOCALES,
  DEFAULT_LOCALE,
  dir,
  isLocale,
} from '@/lib/i18n/config';
import { getDictionary, translate } from '@/lib/i18n/dictionaries';

// roles.ts is a server module (`import 'server-only'`) that transitively pulls in
// `next/headers`. Stub both so the helpers import cleanly under vitest's node env;
// we only assert pure exports here (no request-scoped calls).
vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({
  cookies: () => ({ get: () => undefined, getAll: () => [], set: () => {} }),
}));

describe('foundation: i18n config', () => {
  it('exposes the two supported locales', () => {
    expect([...LOCALES]).toEqual(['en', 'ar']);
  });

  it('has a default locale that is itself a valid locale', () => {
    expect(isLocale(DEFAULT_LOCALE)).toBe(true);
  });

  it('maps Arabic to RTL and English to LTR', () => {
    expect(dir('ar')).toBe('rtl');
    expect(dir('en')).toBe('ltr');
  });

  it('narrows unknown values with isLocale', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('ar')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});

describe('foundation: dictionaries parse and translate', () => {
  it('returns a dictionary for each locale', () => {
    expect(getDictionary('en').app_name).toBeTruthy();
    expect(getDictionary('ar').app_name).toBeTruthy();
  });

  it('interpolates {{var}} placeholders', () => {
    expect(translate(getDictionary('en'), 'portions_left', { n: '3' })).toContain('3');
    expect(translate(getDictionary('ar'), 'portions_left', { n: '3' })).toContain('3');
  });
});

describe('foundation: AR dictionary mirrors EN (bilingual invariant)', () => {
  const enKeys = Object.keys(en).sort();
  const arKeys = Object.keys(ar).sort();

  it('has the exact same key set in both languages', () => {
    expect(arKeys).toEqual(enKeys);
  });

  it('has a non-empty string for every key in both languages', () => {
    for (const k of enKeys) {
      const enVal = (en as Record<string, string>)[k];
      const arVal = (ar as Record<string, string>)[k];
      expect(typeof enVal).toBe('string');
      expect((enVal ?? '').length).toBeGreaterThan(0);
      expect(typeof arVal).toBe('string');
      expect((arVal ?? '').length).toBeGreaterThan(0);
    }
  });
});

describe('foundation: role helpers', () => {
  it('exports the auth helpers and routes each role to its home', async () => {
    const roles = await import('@/lib/auth/roles');
    expect(typeof roles.requireRole).toBe('function');
    expect(typeof roles.getProfile).toBe('function');
    expect(typeof roles.homeForRole).toBe('function');

    expect(roles.homeForRole('operator')).toBe('/operator');
    expect(roles.homeForRole('rider')).toBe('/rider');
    expect(roles.homeForRole('customer')).toBe('/');
  });

  it('RoleError carries an authorization code', async () => {
    const { RoleError } = await import('@/lib/auth/roles');
    const err = new RoleError('forbidden');
    expect(err).toBeInstanceOf(Error);
    expect(err.code).toBe('forbidden');
  });
});
