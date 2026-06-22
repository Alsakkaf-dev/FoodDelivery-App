'use client';
import { useEffect, useMemo, useState } from 'react';
import type { DailySession, Zone } from '@/types/db';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import type { ApiResult } from '@/lib/utils/api';
import { configureSessionSchema, type ConfigureSessionInput } from '@/lib/utils/schemas';
import { EmptyState } from '@/components/ui/states';

// SCR-O-02 — Daily setup form (US-026..029, FR-O-04..07).
// One form that persists today's total quantity, cut-off time, delivery window
// and the active delivery zones via `configureSession`. Kept prop-driven (the
// server action arrives as `action`) so it is unit-testable without the DB and
// the page owns the data-loading. configureSession sets qty_remaining=qty_total
// and activates exactly the selected zones (deactivating the rest).
export function SetupForm({
  initial,
  zones,
  t,
  locale,
  action,
}: {
  initial: { qty_total: number; cutoff_time: string | null; delivery_window: string | null };
  zones: Zone[];
  t: Dictionary;
  locale: Locale;
  action: (input: ConfigureSessionInput) => Promise<ApiResult<DailySession>>;
}) {
  const [qty, setQty] = useState<number>(initial.qty_total ?? 0);
  const [cutoff, setCutoff] = useState<string>((initial.cutoff_time ?? '').slice(0, 5));
  const [deliveryWindow, setDeliveryWindow] = useState<string>(initial.delivery_window ?? '');
  const initialActive = useMemo(() => zones.filter((z) => z.active).map((z) => z.id), [zones]);
  const [activeIds, setActiveIds] = useState<string[]>(initialActive);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [offline, setOffline] = useState(false);

  // Offline state (the layout shows the top banner; here we also gate Save).
  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);

  // Client-side validation mirrors configureSessionSchema (no duplicated rules).
  const candidate = {
    qty_total: qty,
    cutoff_time: cutoff,
    delivery_window: deliveryWindow.trim(),
    active_zone_ids: activeIds,
  };
  const valid = configureSessionSchema.safeParse(candidate).success;
  const saving = status === 'saving';

  function clampQty(n: number) {
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.min(1000, Math.round(n)));
  }

  function toggleZone(id: string) {
    setStatus('idle');
    setActiveIds((prev) => (prev.includes(id) ? prev.filter((z) => z !== id) : [...prev, id]));
  }

  async function save() {
    if (!valid || offline || saving) return;
    setStatus('saving');
    try {
      const res = await action(configureSessionSchema.parse(candidate));
      setStatus(res.ok ? 'saved' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      {/* Success toast (US-026) */}
      {status === 'saved' ? (
        <p className="rounded-control bg-open/10 px-3 py-2 text-sm font-semibold text-open" role="status">
          ✓ {t.setup_saved}
        </p>
      ) : null}

      {/* Error state */}
      {status === 'error' ? (
        <p className="rounded-control bg-rust/10 px-3 py-2 text-sm text-rust" role="alert">
          {t.setup_error}
        </p>
      ) : null}

      {/* Total quantity — numeric stepper (FR-O-04) */}
      <div role="group" aria-label={t.quantity}>
        <span className="mb-1 block text-sm font-semibold text-slate">{t.quantity}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-secondary min-h-tap min-w-tap !p-0"
            aria-label="decrease"
            onClick={() => {
              setStatus('idle');
              setQty((q) => clampQty(q - 1));
            }}
            disabled={qty <= 0}
          >
            −
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={1000}
            value={qty}
            onChange={(e) => {
              setStatus('idle');
              setQty(clampQty(Number(e.target.value)));
            }}
            className="field max-w-[7rem] text-center font-semibold tabular-nums"
            aria-label={t.quantity}
          />
          <button
            type="button"
            className="btn-secondary min-h-tap min-w-tap !p-0"
            aria-label="increase"
            onClick={() => {
              setStatus('idle');
              setQty((q) => clampQty(q + 1));
            }}
            disabled={qty >= 1000}
          >
            +
          </button>
        </div>
      </div>

      {/* Order cut-off time (FR-O-05) */}
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate">{t.cutoff}</span>
        <input
          type="time"
          value={cutoff}
          onChange={(e) => {
            setStatus('idle');
            setCutoff(e.target.value);
          }}
          className="field tabular-nums"
        />
      </label>

      {/* Delivery window (FR-O-06) */}
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate">{t.delivery_window}</span>
        <input
          type="text"
          value={deliveryWindow}
          maxLength={80}
          placeholder={t.delivery_window_placeholder}
          onChange={(e) => {
            setStatus('idle');
            setDeliveryWindow(e.target.value);
          }}
          className="field"
        />
      </label>

      {/* Active delivery zones (FR-O-07) */}
      <div>
        <span className="mb-2 block text-sm font-semibold text-slate">{t.zones}</span>
        {zones.length === 0 ? (
          <EmptyState title={t.no_zones} hint={t.no_zones_hint} icon="📍" />
        ) : (
          <div className="flex flex-wrap gap-2">
            {zones.map((z) => {
              const on = activeIds.includes(z.id);
              return (
                <button
                  key={z.id}
                  type="button"
                  role="switch"
                  aria-checked={on}
                  aria-label={`${z.name} — ${on ? t.zone_active : t.zone_inactive}`}
                  onClick={() => toggleZone(z.id)}
                  className={`chip min-w-tap justify-center ${
                    on ? 'border-open bg-open/10 font-semibold text-open' : 'border-line text-muted'
                  }`}
                >
                  {on ? '✓ ' : ''}
                  {z.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Gate hints */}
      {offline ? (
        <p className="text-sm text-muted" role="status">
          {t.offline}
        </p>
      ) : !valid ? (
        <p className="text-sm text-muted" role="status">
          {t.setup_invalid}
        </p>
      ) : null}

      <button type="submit" className="btn-primary w-full" disabled={!valid || saving || offline}>
        {saving ? t.saving : `✓ ${t.save_setup}`}
      </button>
      <p className="text-center text-caption text-muted">{t.setup_autoclose_hint}</p>
    </form>
  );
}
