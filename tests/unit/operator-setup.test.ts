import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import en from '../../messages/en.json';
import ar from '../../messages/ar.json';
import { SetupForm } from '@/components/operator/setup-form';
import type { ApiResult } from '@/lib/utils/api';
import type { DailySession, Zone } from '@/types/db';

// ── Mocks for the configureSession domain test ──────────────────────────────
// session.ts is `'use server'` and reaches Supabase + cookies; stub those edges
// so we exercise the real domain logic (qty_remaining=qty_total + zone toggling)
// against an in-memory recorder.
vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({
  cookies: () => ({ get: () => undefined, getAll: () => [], set: () => {} }),
}));

const { holder, requireRole } = vi.hoisted(() => ({
  holder: { db: undefined as unknown },
  requireRole: vi.fn(async () => {}),
}));

vi.mock('@/lib/supabase/server', () => ({ createClient: () => ({}) }));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => holder.db }));
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

import { configureSession } from '@/lib/domain/session';

const SESSION = {
  id: 'sess-1',
  session_date: '2026-06-24',
  status: 'closed',
  qty_total: 0,
  qty_remaining: 0,
  cutoff_time: null,
  delivery_window: null,
  opened_at: null,
  closed_at: null,
  created_at: '2026-06-24T00:00:00Z',
};

// Chainable Supabase recorder — captures every update payload + .in()/.neq() filter.
function makeDb(session: Record<string, unknown>) {
  const updates: { table: string; payload: Record<string, unknown> }[] = [];
  const inFilters: { table: string; col: string; vals: unknown }[] = [];
  const neqFilters: { table: string; col: string; val: unknown }[] = [];

  function from(table: string) {
    const ctx: { update?: Record<string, unknown> } = {};
    const b = {
      select: () => b,
      eq: () => b,
      neq: (col: string, val: unknown) => {
        neqFilters.push({ table, col, val });
        return b;
      },
      in: (col: string, vals: unknown) => {
        inFilters.push({ table, col, vals });
        return b;
      },
      update: (payload: Record<string, unknown>) => {
        ctx.update = payload;
        updates.push({ table, payload });
        return b;
      },
      maybeSingle: async () => ({ data: session, error: null }),
      single: async () => ({ data: { ...session, ...(ctx.update ?? {}) }, error: null }),
    };
    return b;
  }

  return { client: { from }, updates, inFilters, neqFilters };
}

const ZONE_A = '11111111-1111-1111-1111-111111111111';
const ZONE_B = '22222222-2222-2222-2222-222222222222';

describe('configureSession (US-026/029, FR-O-04/07)', () => {
  beforeEach(() => {
    requireRole.mockClear();
  });

  it('sets qty_remaining = qty_total and activates exactly the selected zones', async () => {
    const db = makeDb({ ...SESSION });
    holder.db = db.client;

    const res = await configureSession({
      qty_total: 40,
      cutoff_time: '17:30',
      delivery_window: '2:00 PM – 7:00 PM',
      active_zone_ids: [ZONE_A, ZONE_B],
    });

    // operator-only guard ran
    expect(requireRole).toHaveBeenCalledWith('operator');

    // remaining initializes to the total for the session (US-026)
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.qty_remaining).toBe(40);
      expect(res.data.qty_total).toBe(40);
    }

    const sessionUpdate = db.updates.find((u) => u.table === 'daily_session');
    expect(sessionUpdate).toBeTruthy();
    expect(sessionUpdate?.payload.qty_total).toBe(40);
    expect(sessionUpdate?.payload.qty_remaining).toBe(40);
    expect(sessionUpdate?.payload.cutoff_time).toBe('17:30');
    expect(sessionUpdate?.payload.delivery_window).toBe('2:00 PM – 7:00 PM');

    // every zone deactivated, then the chosen ids reactivated (US-029)
    expect(db.updates.some((u) => u.table === 'zones' && u.payload.active === false)).toBe(true);
    expect(db.updates.some((u) => u.table === 'zones' && u.payload.active === true)).toBe(true);
    expect(db.inFilters).toContainEqual({ table: 'zones', col: 'id', vals: [ZONE_A, ZONE_B] });
  });

  it('with no active zones, deactivates all and skips the re-activate call', async () => {
    const db = makeDb({ ...SESSION });
    holder.db = db.client;

    const res = await configureSession({
      qty_total: 0,
      cutoff_time: '18:00',
      delivery_window: 'Pickup only',
      active_zone_ids: [],
    });

    expect(res.ok).toBe(true);
    expect(db.updates.some((u) => u.table === 'zones' && u.payload.active === false)).toBe(true);
    expect(db.updates.some((u) => u.table === 'zones' && u.payload.active === true)).toBe(false);
  });

  it('rejects invalid input via configureSessionSchema', async () => {
    holder.db = makeDb({ ...SESSION }).client;
    const res = await configureSession({ qty_total: 9999, cutoff_time: 'bad', delivery_window: '', active_zone_ids: [] });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe('validation_error');
  });
});

// ── SetupForm render / states ───────────────────────────────────────────────
const ZONES: Zone[] = [
  { id: ZONE_A, name: 'Pulai Spring', active: true, sort_order: 1 },
  { id: ZONE_B, name: 'Desa', active: false, sort_order: 2 },
];
const noop = async (): Promise<ApiResult<DailySession>> => ({ ok: true, data: SESSION as DailySession });

function render(overrides: { zones?: Zone[]; t?: typeof en; locale?: 'en' | 'ar' } = {}) {
  return renderToStaticMarkup(
    createElement(SetupForm, {
      initial: { qty_total: 40, cutoff_time: '17:30', delivery_window: '2:00 PM – 7:00 PM' },
      zones: overrides.zones ?? ZONES,
      t: overrides.t ?? en,
      locale: overrides.locale ?? 'en',
      action: noop,
    }),
  );
}

describe('SetupForm: fields, zone toggles, 4 states', () => {
  it('renders the four field labels and a Save action', () => {
    const html = render();
    expect(html).toContain(en.quantity);
    expect(html).toContain(en.cutoff);
    expect(html).toContain(en.delivery_window);
    expect(html).toContain(en.zones);
    expect(html).toContain(en.save_setup);
  });

  it('shows each zone as a toggle with active reflected via aria-checked', () => {
    const html = render();
    expect(html).toContain('Pulai Spring');
    expect(html).toContain('Desa');
    expect(html).toContain('aria-checked="true"'); // the active zone
    expect(html).toContain('aria-checked="false"'); // the inactive zone
  });

  it('carries >=44px tap targets', () => {
    expect(render()).toContain('min-h-tap');
  });

  it('renders the empty state when there are no zones', () => {
    expect(render({ zones: [] })).toContain(en.no_zones);
  });

  it('renders bilingual (Arabic Save label + RTL-safe)', () => {
    const html = render({ t: ar as typeof en, locale: 'ar' });
    expect(html).toContain(ar.save_setup);
    expect(html).toContain(ar.zones);
  });
});
