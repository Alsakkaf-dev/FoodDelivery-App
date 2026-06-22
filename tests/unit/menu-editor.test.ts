import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import en from '../../messages/en.json';
import ar from '../../messages/ar.json';
import type { MenuItem } from '@/types/db';
import { MenuEditor, blankDraft, draftToInput } from '@/components/operator/menu-editor';

// ── Domain mocks (menu.ts is `'use server'` and reaches Supabase + cookies) ──
vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({
  cookies: () => ({ get: () => undefined, getAll: () => [], set: () => {} }),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: () => {} }) }));

const { holder, requireRole } = vi.hoisted(() => ({
  holder: { db: undefined as unknown },
  requireRole: vi.fn(async () => {}),
}));

vi.mock('@/lib/supabase/server', () => ({ createClient: () => holder.db }));
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

import { upsertMenuItem, setAvailability } from '@/lib/domain/menu';

// Chainable Supabase recorder — captures upsert payloads + update/eq filters.
function makeDb(opts: { upsertError?: unknown; updateError?: unknown } = {}) {
  const calls = {
    upsert: [] as { table: string; payload: Record<string, unknown> }[],
    updates: [] as { table: string; payload: Record<string, unknown> }[],
    eqs: [] as { table: string; col: string; val: unknown }[],
  };
  function from(table: string) {
    const b = {
      upsert(payload: Record<string, unknown>) {
        calls.upsert.push({ table, payload });
        return b;
      },
      select() {
        return b;
      },
      single: async () =>
        opts.upsertError
          ? { data: null, error: opts.upsertError }
          : { data: { id: 'generated-id', ...calls.upsert.at(-1)?.payload }, error: null },
      update(payload: Record<string, unknown>) {
        calls.updates.push({ table, payload });
        return b;
      },
      eq(col: string, val: unknown) {
        calls.eqs.push({ table, col, val });
        return Promise.resolve({ error: opts.updateError ?? null });
      },
    };
    return b;
  }
  return { client: { from }, calls };
}

const VALID_ITEM = {
  name_en: 'Chicken Shawarma',
  name_ar: 'شاورما دجاج',
  price: 12.5,
  available: true,
  sort_order: 1,
};
const ITEM_ID = '11111111-1111-1111-1111-111111111111';

describe('upsertMenuItem (US-031, FR-O-08) — insert vs update', () => {
  beforeEach(() => requireRole.mockClear());

  it('inserts a new item when no id is supplied (operator-only)', async () => {
    const db = makeDb();
    holder.db = db.client;
    const res = await upsertMenuItem({ ...VALID_ITEM });
    expect(requireRole).toHaveBeenCalledWith('operator');
    expect(res.ok).toBe(true);
    const payload = db.calls.upsert.at(-1)?.payload ?? {};
    expect(payload.id).toBeUndefined(); // insert path
    expect(payload.name_en).toBe('Chicken Shawarma');
    expect(payload.price).toBe(12.5);
  });

  it('updates an existing item when an id is supplied', async () => {
    const db = makeDb();
    holder.db = db.client;
    const res = await upsertMenuItem({ ...VALID_ITEM, id: ITEM_ID, price: 14 });
    expect(res.ok).toBe(true);
    const payload = db.calls.upsert.at(-1)?.payload ?? {};
    expect(payload.id).toBe(ITEM_ID); // update path
    expect(payload.price).toBe(14);
  });

  it('rejects invalid input via menuUpsertSchema', async () => {
    holder.db = makeDb().client;
    const res = await upsertMenuItem({ name_en: '', name_ar: '', price: -1 });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error.code).toBe('validation_error');
  });
});

describe('setAvailability (US-031, Scenario B)', () => {
  beforeEach(() => requireRole.mockClear());

  it('hides an item by writing available=false for its id', async () => {
    const db = makeDb();
    holder.db = db.client;
    const res = await setAvailability(ITEM_ID, false);
    expect(requireRole).toHaveBeenCalledWith('operator');
    expect(res.ok).toBe(true);
    expect(db.calls.updates).toContainEqual({ table: 'menu_items', payload: { available: false } });
    expect(db.calls.eqs).toContainEqual({ table: 'menu_items', col: 'id', val: ITEM_ID });
  });
});

describe('draftToInput — maps the form draft onto the upsert shape', () => {
  it('omits id for a blank draft (insert) and trims/parses fields', () => {
    const input = draftToInput({ ...blankDraft(3), name_en: ' Falafel ', name_ar: ' فلافل ', price: '8.5' });
    expect('id' in input).toBe(false);
    expect(input.name_en).toBe('Falafel');
    expect(input.price).toBe(8.5);
    expect(input.sort_order).toBe(3);
  });

  it('keeps the id for an edited draft (update)', () => {
    const input = draftToInput({ ...blankDraft(0), id: ITEM_ID, name_en: 'A', name_ar: 'أ', price: '5' });
    expect(input.id).toBe(ITEM_ID);
  });
});

// ── MenuEditor render / states ──────────────────────────────────────────────
const ITEMS: MenuItem[] = [
  {
    id: ITEM_ID,
    name_en: 'Chicken Shawarma',
    name_ar: 'شاورما دجاج',
    description_en: null,
    description_ar: null,
    price: 12.5,
    photo_url: null,
    available: true,
    sort_order: 1,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name_en: 'Beef Shawarma',
    name_ar: 'شاورما لحم',
    description_en: null,
    description_ar: null,
    price: 14,
    photo_url: null,
    available: false,
    sort_order: 2,
  },
];

const noop = async () => ({ ok: true as const, data: ITEMS[0]! });
const noopAvail = async () => ({ ok: true as const, data: true as const });

function render(overrides: { items?: MenuItem[]; t?: typeof en; lang?: 'en' | 'ar' } = {}) {
  return renderToStaticMarkup(
    createElement(MenuEditor, {
      items: overrides.items ?? ITEMS,
      t: overrides.t ?? en,
      lang: overrides.lang ?? 'en',
      upsert: noop,
      setAvailable: noopAvail,
    }),
  );
}

describe('MenuEditor: list, toggle, form, 4 states', () => {
  it('lists items with an availability switch reflecting each item', () => {
    const html = render();
    expect(html).toContain('Chicken Shawarma');
    expect(html).toContain('Beef Shawarma');
    expect(html).toContain('aria-checked="true"'); // available item
    expect(html).toContain('aria-checked="false"'); // hidden item
    expect(html).toContain('data-available="no"'); // hidden item carries the flag
  });

  it('renders the add form fields and Save action', () => {
    const html = render();
    expect(html).toContain(en.name_en);
    expect(html).toContain(en.name_ar);
    expect(html).toContain(en.price_myr);
    expect(html).toContain(en.save_item);
    expect(html).toContain(en.upload_photo);
  });

  it('carries >=44px tap targets', () => {
    expect(render()).toContain('min-h-tap');
  });

  it('shows the empty state when there are no items', () => {
    expect(render({ items: [] })).toContain(en.no_items);
  });

  it('renders bilingual (Arabic labels + names)', () => {
    const html = render({ t: ar as typeof en, lang: 'ar' });
    expect(html).toContain(ar.save_item);
    expect(html).toContain('شاورما دجاج');
  });
});
