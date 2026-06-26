'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MenuItem } from '@/types/db';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { ApiResult } from '@/lib/utils/api';
import { menuUpsertSchema } from '@/lib/utils/schemas';
import { formatMYR } from '@/lib/utils/money';
import { createClient } from '@/lib/supabase/client';
import { Icon } from '@/components/icons';
import { FoodImage } from '@/components/ui/food-image';
import {
  cx,
  EmptyState,
  FilledInput,
  PrimaryButton,
  TextAction,
  UnderlineTabs,
  UploadTile,
  type TabItem,
} from '@/components/ui';

// SCR-O-05 — Menu manager / "My Food List" (US-031, FR-O-08). The operator
// adds/edits/hides items, sets the MYR price, toggles availability and uploads a
// photo. Saves go through `upsertMenuItem` (operator-only) + `setAvailability`;
// after each save we `router.refresh()` so the customer menu reflects the change
// within seconds. Re-skinned to the new design language — shared #02 primitives
// (FilledInput / UploadTile / PrimaryButton / UnderlineTabs), #05 FoodImage + line
// icons, #01 tokens — while preserving every frozen contract: menuUpsertSchema +
// draftToInput, the `menu-photos` Storage upload pipeline, the `data-can-save`
// hook and the role="switch"/aria-checked availability toggle.
//
// SCHEMA-FAITHFUL: the reference "Add New Items"/"My Food List" show ingredient
// chips, Pick-up/Delivery toggles, ★ratings and meal-time categories, but the
// frozen `menuUpsertSchema` + `MenuItem` store none of these — so they are NOT
// rendered as controls that can't persist. The meal-time tabs render for visual
// parity but, with no category column, "All" is the only functional view.

const BUCKET = 'menu-photos';
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

export type MenuUpsertAction = (input: unknown) => Promise<ApiResult<MenuItem>>;
export type AvailabilityAction = (id: string, available: boolean) => Promise<ApiResult<true>>;

export type MenuDraft = {
  id?: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  price: string; // text field; parsed to a number on submit
  photo_url: string | null;
  sort_order: number;
  available: boolean;
};

/** A fresh empty draft for the "add item" form. */
export function blankDraft(sort_order = 0): MenuDraft {
  return {
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    price: '',
    photo_url: null,
    sort_order,
    available: true,
  };
}

/** Map the form draft onto the `menuUpsertSchema` shape (id present ⇒ update). */
export function draftToInput(d: MenuDraft) {
  return {
    ...(d.id ? { id: d.id } : {}),
    name_en: d.name_en.trim(),
    name_ar: d.name_ar.trim(),
    description_en: d.description_en.trim() || null,
    description_ar: d.description_ar.trim() || null,
    price: Number(d.price),
    photo_url: d.photo_url || null,
    available: d.available,
    sort_order: Number(d.sort_order) || 0,
  };
}

function toDraft(item: MenuItem): MenuDraft {
  return {
    id: item.id,
    name_en: item.name_en,
    name_ar: item.name_ar,
    description_en: item.description_en ?? '',
    description_ar: item.description_ar ?? '',
    price: String(item.price),
    photo_url: item.photo_url,
    sort_order: item.sort_order,
    available: item.available,
  };
}

export function MenuEditor({
  items,
  t,
  lang,
  upsert,
  setAvailable,
}: {
  items: MenuItem[];
  t: Dictionary;
  lang: 'en' | 'ar';
  upsert: MenuUpsertAction;
  setAvailable: AvailabilityAction;
}) {
  const router = useRouter();
  const nextSort = useMemo(
    () => items.reduce((m, i) => Math.max(m, i.sort_order), 0) + 1,
    [items],
  );
  const [draft, setDraft] = useState<MenuDraft>(() => blankDraft(nextSort));
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false); // photo upload in flight
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [tab, setTab] = useState('all');

  const candidate = draftToInput(draft);
  const valid = menuUpsertSchema.safeParse(candidate).success;
  const saving = status === 'saving';
  const editing = Boolean(draft.id);

  // Meal-time tabs (visual parity). The menu has no category column, so every tab
  // shows the full list — "All" is the only functional view (see header note).
  const mealTabs: TabItem[] = [
    { key: 'all', label: t.tab_all },
    { key: 'breakfast', label: t.tab_breakfast },
    { key: 'lunch', label: t.tab_lunch },
    { key: 'dinner', label: t.tab_dinner },
  ];

  function set<K extends keyof MenuDraft>(key: K, value: MenuDraft[K]) {
    setStatus('idle');
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function startNew() {
    setStatus('idle');
    setUploadError(null);
    setDraft(blankDraft(nextSort));
  }

  function startEdit(item: MenuItem) {
    setStatus('idle');
    setUploadError(null);
    setDraft(toDraft(item));
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploadError(null);
    if (!ACCEPTED.includes(file.type)) {
      setUploadError(t.proof_invalid_type);
      return;
    }
    if (file.size > MAX_BYTES) {
      setUploadError(t.proof_too_large);
      return;
    }
    setBusy(true);
    try {
      const sb = createClient();
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      const path = `items/${crypto.randomUUID()}.${ext}`;
      const up = await sb.storage.from(BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });
      if (up.error) throw up.error;
      const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
      set('photo_url', data.publicUrl);
    } catch {
      setUploadError(t.proof_upload_failed);
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!valid || saving) return;
    setStatus('saving');
    try {
      const res = await upsert(menuUpsertSchema.parse(candidate));
      if (res.ok) {
        setStatus('saved');
        setDraft(blankDraft(nextSort + 1));
        router.refresh();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  async function toggle(item: MenuItem) {
    if (togglingId) return;
    setTogglingId(item.id);
    try {
      const res = await setAvailable(item.id, !item.available);
      if (res.ok) router.refresh();
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Add / edit form ("Add New Items") ───────────────────────────── */}
      <form
        className="card space-y-4"
        data-can-save={valid ? 'yes' : 'no'}
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-h2 font-bold text-ink">{editing ? t.edit_item : t.new_item}</h2>
          <TextAction onClick={startNew}>{t.reset}</TextAction>
        </div>

        {status === 'saved' ? (
          <p className="rounded-md bg-success/10 px-3 py-2 text-sm font-semibold text-success" role="status">
            {t.item_saved}
          </p>
        ) : null}
        {status === 'error' ? (
          <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
            {t.item_error}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <FilledInput
            label={t.name_en}
            dir="ltr"
            value={draft.name_en}
            maxLength={80}
            onChange={(e) => set('name_en', e.target.value)}
          />
          <FilledInput
            label={t.name_ar}
            dir="rtl"
            value={draft.name_ar}
            maxLength={80}
            onChange={(e) => set('name_ar', e.target.value)}
          />
          <FilledInput
            label={t.price_myr}
            type="number"
            inputMode="decimal"
            min={0}
            step="0.5"
            className="tabular-nums"
            value={draft.price}
            onChange={(e) => set('price', e.target.value)}
          />
          <FilledInput
            label={t.sort_order}
            type="number"
            inputMode="numeric"
            min={0}
            className="tabular-nums"
            value={draft.sort_order}
            onChange={(e) => set('sort_order', Number(e.target.value))}
          />
        </div>

        {/* DETAILS — bilingual (schema keeps EN + AR) */}
        <div className="space-y-4">
          <FilledInput
            label={t.description_en}
            multiline
            rows={3}
            dir="ltr"
            value={draft.description_en}
            maxLength={300}
            onChange={(e) => set('description_en', e.target.value)}
          />
          <FilledInput
            label={t.description_ar}
            multiline
            rows={3}
            dir="rtl"
            value={draft.description_ar}
            maxLength={300}
            onChange={(e) => set('description_ar', e.target.value)}
          />
        </div>

        {/* Photo upload (US-031) — keeps the menu-photos Storage pipeline intact */}
        <div className="space-y-2">
          <span className="block text-label font-semibold uppercase tracking-wide text-muted">{t.photo}</span>
          <UploadTile
            accept="image/png,image/jpeg,image/webp"
            label={busy ? t.loading : draft.photo_url ? t.change_photo : t.upload_photo}
            hint={t.photo_hint}
            disabled={busy}
            onFiles={(files) => void handleFile(files[0])}
            preview={
              draft.photo_url ? (
                <div className="flex flex-col items-center gap-2">
                  <FoodImage src={draft.photo_url} alt={t.photo} shape="rounded" className="h-24 w-24" />
                  <span className="text-sm font-semibold text-brand">{t.change_photo}</span>
                </div>
              ) : undefined
            }
          />
          {uploadError ? (
            <p className="text-caption text-danger" role="alert">
              {uploadError}
            </p>
          ) : null}
        </div>

        {!valid ? (
          <p className="text-sm text-muted" role="status">
            {t.item_form_invalid}
          </p>
        ) : null}

        <PrimaryButton type="submit" fullWidth loading={saving} disabled={!valid || busy}>
          {t.save_item}
        </PrimaryButton>
      </form>

      {/* ── My Food List ────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <UnderlineTabs tabs={mealTabs} value={tab} onChange={setTab} />
        <p className="text-caption text-muted">
          {t.total_items} · <span className="font-bold tabular-nums text-ink">{items.length}</span>
        </p>

        {items.length === 0 ? (
          <EmptyState title={t.no_items} hint={t.no_items_hint} />
        ) : (
          <ul className="space-y-3">
            {items.map((item) => {
              const name = lang === 'ar' ? item.name_ar : item.name_en;
              const on = item.available;
              return (
                <li
                  key={item.id}
                  className="card flex items-center gap-3"
                  data-available={on ? 'yes' : 'no'}
                >
                  <FoodImage
                    src={item.photo_url}
                    alt={name}
                    shape="rounded"
                    fallbackIcon="wrap"
                    className="h-16 w-16 shrink-0"
                  />
                  <div className={cx('min-w-0 flex-1', !on && 'opacity-60')}>
                    <p className="truncate text-title font-bold text-ink">{name}</p>
                    <p className="text-body font-extrabold tabular-nums text-ink">{formatMYR(item.price, lang)}</p>
                  </div>
                  <TextAction onClick={() => startEdit(item)} aria-label={`${t.edit_item}: ${name}`}>
                    {t.edit_item}
                  </TextAction>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    aria-label={on ? t.mark_unavailable : t.mark_available}
                    disabled={togglingId === item.id}
                    onClick={() => toggle(item)}
                    className={cx(
                      'inline-flex min-h-tap min-w-tap items-center justify-center gap-1 rounded-pill px-3 text-sm font-bold transition disabled:opacity-50',
                      on ? 'bg-success/10 text-success' : 'bg-surface-input text-muted',
                    )}
                  >
                    {on ? <Icon name="check" className="h-4 w-4" aria-hidden /> : null}
                    {on ? t.available : t.unavailable}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
