import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Mutable request-scoped state the stubs read at call time (locale cookie + the
// signed-in user/role the operator guard checks).
const h = vi.hoisted(() => ({
  state: { locale: '' as string, user: null as null | { id: string }, role: null as null | string },
}));

// roles.ts is `import 'server-only'`; i18n/server reads `next/headers`; the shells
// render the client BottomNav (next/link + usePathname). Stub them all so the
// server components import and render under vitest's node env.
vi.mock('server-only', () => ({}));
vi.mock('next/link', () => ({ default: 'a' }));
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: (name: string) => (name === 'NEXT_LOCALE' && h.state.locale ? { value: h.state.locale } : undefined),
    getAll: () => [],
    set: () => {},
  }),
}));
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  redirect: vi.fn((url: string) => {
    throw new Error('REDIRECT:' + url);
  }),
}));
vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: async () => ({ data: { user: h.state.user } }) },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: h.state.role === null ? null : { id: 'u1', role: h.state.role } }),
        }),
      }),
    }),
  }),
}));

import { customerNav, operatorNav } from '@/lib/nav/items';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { redirect } from 'next/navigation';
import CustomerLayout from '@/app/(customer)/layout';
import OperatorLayout from '@/app/(operator)/layout';

const redirectMock = vi.mocked(redirect);

beforeEach(() => {
  h.state.locale = '';
  h.state.user = null;
  h.state.role = null;
  redirectMock.mockClear();
});

describe('shell nav: per-role bottom-nav config (CMP-U-14)', () => {
  it('customer nav lists Home · Menu · Orders · History with EN labels', () => {
    const items = customerNav(getDictionary('en'));
    expect(items.map((i) => i.href)).toEqual(['/', '/menu', '/orders', '/history']);
    expect(items.map((i) => i.label)).toEqual(['Home', 'Menu', 'Orders', 'Order history']);
    expect(items.length).toBeLessThanOrEqual(4);
  });

  it('customer nav labels mirror in Arabic', () => {
    const labels = customerNav(getDictionary('ar')).map((i) => i.label);
    expect(labels).toEqual(['الرئيسية', 'القائمة', 'الطلبات', 'سجل الطلبات']);
  });

  it('operator nav lists Board · Setup · Menu · End of day with EN labels', () => {
    const items = operatorNav(getDictionary('en'));
    expect(items.map((i) => i.href)).toEqual([
      '/operator/board',
      '/operator/setup',
      '/operator/menu',
      '/operator/end-of-day',
    ]);
    expect(items.map((i) => i.label)).toEqual(['Order board', 'Daily setup', 'Menu manager', 'End of day']);
    expect(items.length).toBeLessThanOrEqual(4);
  });

  it('operator nav labels mirror in Arabic', () => {
    const labels = operatorNav(getDictionary('ar')).map((i) => i.label);
    expect(labels).toEqual(['لوحة الطلبات', 'إعداد اليوم', 'إدارة القائمة', 'نهاية اليوم']);
  });

  it('each role nav is role-appropriate — disjoint, operator-only routes are scoped (US-002)', () => {
    const cust = customerNav(getDictionary('en')).map((i) => i.href);
    const op = operatorNav(getDictionary('en')).map((i) => i.href);
    expect(op.every((href) => href.startsWith('/operator'))).toBe(true);
    expect(cust.some((href) => href.startsWith('/operator'))).toBe(false);
    expect(cust.filter((href) => op.includes(href))).toHaveLength(0);
  });
});

describe('shell nav: each group renders its own bottom nav', () => {
  it('customer layout renders the customer nav with 44px tap targets (EN + AR)', () => {
    const en = renderToStaticMarkup(
      createElement(CustomerLayout, { children: createElement('div', null, 'customer-page') }),
    );
    expect(en).toContain('customer-page');
    expect(en).toContain('Home');
    expect(en).toContain('href="/orders"');
    expect(en).toContain('Order history');
    expect(en).not.toContain('/operator');
    expect(en).toContain('min-h-tap');
    // The shell mounts the public language switcher (US-012, handed off by 1-4).
    expect(en).toContain('Switch language to Arabic');

    h.state.locale = 'ar';
    const ar = renderToStaticMarkup(
      createElement(CustomerLayout, { children: createElement('div', null, 'x') }),
    );
    expect(ar).toContain('الرئيسية');
    expect(ar).toContain('سجل الطلبات');
    expect(ar).toContain('Switch language to English');
  });

  it('operator layout renders the operator nav for an operator', async () => {
    h.state.user = { id: 'u1' };
    h.state.role = 'operator';
    const el = await OperatorLayout({ children: createElement('div', null, 'operator-page') });
    const html = renderToStaticMarkup(el);
    expect(html).toContain('operator-page');
    expect(html).toContain('Order board');
    expect(html).toContain('href="/operator/board"');
    expect(html).not.toContain('href="/menu"');
    expect(html).toContain('Switch language');
    expect(redirectMock).not.toHaveBeenCalled();
  });
});

describe('shell nav: operator layout RBAC guard (US-004, FR-S-12)', () => {
  it('denies a signed-in customer hitting an operator route → home', async () => {
    h.state.user = { id: 'u1' };
    h.state.role = 'customer';
    await expect(OperatorLayout({ children: null })).rejects.toThrow();
    expect(redirectMock).toHaveBeenCalledWith('/');
  });

  it('redirects an unauthenticated visitor to /login', async () => {
    h.state.user = null;
    await expect(OperatorLayout({ children: null })).rejects.toThrow();
    expect(redirectMock).toHaveBeenCalledWith('/login');
  });
});
