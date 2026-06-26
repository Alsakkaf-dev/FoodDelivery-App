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
import { AUTH_DISABLED } from '@/lib/auth/dev-bypass';

const redirectMock = vi.mocked(redirect);

