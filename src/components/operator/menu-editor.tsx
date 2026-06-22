'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MenuItem } from '@/types/db';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { ApiResult } from '@/lib/utils/api';
import { menuUpsertSchema } from '@/lib/utils/schemas';
import { formatMYR } from '@/lib/utils/money';
import { createClient } from '@/lib/supabase/client';
import { EmptyState } from '@/components/ui/states';

// SCR-O-05 — Menu manager (US-031, FR-O-08). The operator adds/edits/hides items,
// sets the MYR price, toggles availability and uploads a photo. Saves go through
// `upsertMenuItem` (operator-only) and `setAvailability`; after each save we
// `router.refresh()` so the customer menu reflects the change within seconds.
// Kept prop-driven (server actions arrive as props) so the form + validation are
// unit-testable without the DB, exactly like the daily-setup form.

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

  const candidate = draftToInput(draft);
  const valid = menuUpsertSchema.safeParse(candidate).success;
  const saving = status === 'saving';

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

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file after a change
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

  const editing = Boolean(draft.id);

  return (
    <div className="space-y-6">
      {/* ── Add / edit form ─────────────────────────────────────────── */}
      <form
        className="card space-y-4"
        data-can-save={valid ? 'yes' : 'no'}
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-title font-bold text-slate">
            {editing ? t.edit_item : t.new_item}
          </h2>
          {editing ? (
            <button type="button" className="btn-ghost min-h-tap" onClick={startNew}>
              {t.add_item}
            </button>
          ) : null}
        </div>

        {status === 'saved' ? (
          <p className="rounded-control bg-open/10 px-3 py-2 text-sm font-semibold text-open" role="status">
            ✓ {t.item_saved}
          </p>
        ) : null}
        {status === 'error' ? (
          <p className="rounded-control bg-rust/10 px-3 py-2 text-sm text-rust" role="alert">
            {t.item_error}
          </p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate">{t.name_en}</span>
            <input
              type="text"
              dir="ltr"
              value={draft.name_en}
              maxLength={80}
              onChange={(e) => set('name_en', e.target.value)}
              className="field"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate">{t.name_ar}</span>
            <input
              type="text"
              dir="rtl"
              value={draft.name_ar}
              maxLength={80}
              onChange={(e) => set('name_ar', e.target.value)}
              className="field"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate">{t.description_en}</span>
            <input
              type="text"
              dir="ltr"
              value={draft.description_en}
              maxLength={300}
              onChange={(e) => set('description_en', e.target.value)}
              className="field"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate">{t.description_ar}</span>
            <input
              type="text"
              dir="rtl"
              value={draft.description_ar}
              maxLength={300}
              onChange={(e) => set('description_ar', e.target.value)}
              className="field"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate">{t.price_myr}</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.5"
              value={draft.price}
              onChange={(e) => set('price', e.target.value)}
              className="field tabular-nums"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate">{t.sort_order}</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={draft.sort_order}
              onChange={(e) => set('sort_order', Number(e.target.value))}
              className="field tabular-nums"
            />
          </label>
        </div>

        {/* Photo upload (US-031: photo appears on the customer menu) */}
        <div className="space-y-2">
          <span className="block text-sm font-semibold text-slate">{t.photo}</span>
          <div className="flex items-center gap-3">
            <div
              className="h-16 w-16 shrink-0 rounded-control border border-line bg-cream bg-cover bg-center text-2xl"
              style={draft.photo_url ? { backgroundImage: `url(${draft.photo_url})` } : undefined}
              role="img"
              aria-label={t.photo}
            >
              {draft.photo_url ? '' : <span aria-hidden className="grid h-full place-items-center">🌯</span>}
            </div>
            <label className="btn-secondary flex min-h-tap cursor-pointer items-center gap-2">
              <span aria-hidden>📷</span>
              <span>{busy ? t.loading : draft.photo_url ? t.change_photo : t.upload_photo}</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                disabled={busy}
                aria-label={t.upload_photo}
                onChange={onPickPhoto}
              />
            </label>
          </div>
          <p className="text-caption text-muted">{t.photo_hint}</p>
          {uploadError ? (
            <p className="text-sm text-soldout" role="alert">
              {uploadError}
            </p>
          ) : null}
        </div>

        {!valid ? (
          <p className="text-sm text-muted" role="status">
            {t.item_form_invalid}
          </p>
        ) : null}

        <button type="submit" className="btn-primary w-full" disabled={!valid || saving || busy}>
          {saving ? t.saving : `✓ ${t.save_item}`}
        </button>
      </form>

      {/* ── Existing items ──────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-title font-bold text-slate">{t.menu_manager}</h2>
        {items.length === 0 ? (
          <EmptyState title={t.no_items} hint={t.no_items_hint} icon="🌯" />
        ) : (
          <ul className="space-y-3">
            {items.map((item) => {
              const name = lang === 'ar' ? item.name_ar : item.name_en;
              const on = item.available;
              return (
                <li key={item.id} className="card flex items-center gap-3" data-available={on ? 'yes' : 'no'}>
                  <div
                    className="h-14 w-14 shrink-0 rounded-control border border-line bg-cream bg-cover bg-center text-xl"
                    style={item.photo_url ? { backgroundImage: `url(${item.photo_url})` } : undefined}
                    role="img"
                    aria-label={name}
                  >
                    {item.photo_url ? '' : <span aria-hidden className="grid h-full place-items-center">🌯</span>}
                  </div>
                  <div className={`min-w-0 flex-1 ${on ? '' : 'opacity-60'}`}>
                    <p className="truncate font-semibold text-slate">{name}</p>
                    <p className="text-sm tabular-nums text-muted">{formatMYR(item.price, lang)}</p>
                  </div>
                  <button
                    type="button"
                    className="btn-ghost min-h-tap"
                    onClick={() => startEdit(item)}
                    aria-label={`${t.edit_item}: ${name}`}
                  >
                    {t.edit_item}
                  </button>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    aria-label={on ? t.mark_unavailable : t.mark_available}
                    disabled={togglingId === item.id}
                    onClick={() => toggle(item)}
                    className={`chip min-w-tap justify-center ${
                      on ? 'border-open bg-open/10 font-semibold text-open' : 'border-line text-muted'
                    }`}
                  >
                    {on ? `✓ ${t.available}` : t.unavailable}
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
