'use client';
import { useEffect, useMemo, useState } from 'react';
import type { DailySession, Zone } from '@/types/db';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import type { ApiResult } from '@/lib/utils/api';
import { configureSessionSchema, type ConfigureSessionInput } from '@/lib/utils/schemas';
import { Icon } from '@/components/icons';
import { cx, EmptyState, FilledInput, PrimaryButton } from '@/components/ui';

// SCR-O-02 — Daily setup form (US-026..029, FR-O-04..07).
// One form that persists today's total quantity, cut-off time, delivery window
// and the active delivery zones via `configureSession`. Re-skinned to the new
// design language (shared #02 FilledInput/PrimaryButton, #05 line icons, #01
// tokens) while keeping the schema-mirrored client gate, the offline gate and
// the role="switch"/aria-checked zone toggles. Kept prop-driven (the server
// action arrives as `action`) so it stays unit-testable without the DB.
// configureSession sets qty_remaining=qty_total and activates exactly the
// selected zones (deactivating the rest).
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

  const stepBtn =
    'inline-flex min-h-tap min-w-tap items-center justify-center rounded-full bg-dark-cta text-onColor transition active:scale-95 disabled:opacity-40';

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
        <p className="rounded-md bg-success/10 px-3 py-2 text-sm font-semibold text-success" role="status">
          {t.setup_saved}
        </p>
      ) : null}

      {/* Error state */}
      {status === 'error' ? (
        <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
          {t.setup_error}
        </p>
      ) : null}

      {/* Total quantity — numeric stepper with a typeable field (FR-O-04) */}
      <div role="group" aria-label={t.quantity}>
        <span className="mb-2 block text-label font-semibold uppercase tracking-wide text-muted">{t.quantity}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={stepBtn}
            aria-label="decrease"
            onClick={() => {
              setStatus('idle');
              setQty((q) => clampQty(q - 1));
            }}
            disabled={qty <= 0}
          >
            <Icon name="minus" className="h-5 w-5" aria-hidden />
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
            className="min-h-tap w-24 rounded-md bg-surface-input px-4 py-3 text-center text-body font-bold tabular-nums text-ink outline-none transition focus:ring-2 focus:ring-brand/30"
            aria-label={t.quantity}
          />
          <button
            type="button"
            className={stepBtn}
            aria-label="increase"
            onClick={() => {
              setStatus('idle');
              setQty((q) => clampQty(q + 1));
            }}
            disabled={qty >= 1000}
          >
            <Icon name="plus" className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      {/* Order cut-off time (FR-O-05) */}
      <FilledInput
        label={t.cutoff}
        type="time"
        className="tabular-nums"
        value={cutoff}
        onChange={(e) => {
          setStatus('idle');
          setCutoff(e.target.value);
        }}
      />

      {/* Delivery window (FR-O-06) */}
      <FilledInput
        label={t.delivery_window}
        value={deliveryWindow}
        maxLength={80}
        placeholder={t.delivery_window_placeholder}
        onChange={(e) => {
          setStatus('idle');
          setDeliveryWindow(e.target.value);
        }}
      />

      {/* Active delivery zones (FR-O-07) */}
      <div>
        <span className="mb-2 block text-label font-semibold uppercase tracking-wide text-muted">{t.zones}</span>
        {zones.length === 0 ? (
          <EmptyState title={t.no_zones} hint={t.no_zones_hint} />
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
                  className={cx(
                    'inline-flex min-h-tap items-center gap-1 rounded-pill border px-4 text-sm font-bold transition',
                    on ? 'border-brand bg-brand text-onColor' : 'border-line bg-surface text-muted',
                  )}
                >
                  {on ? <Icon name="check" className="h-4 w-4" aria-hidden /> : null}
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

      <PrimaryButton type="submit" fullWidth loading={saving} disabled={!valid || offline}>
        {t.save_setup}
      </PrimaryButton>
      <p className="text-center text-caption text-muted">{t.setup_autoclose_hint}</p>
    </form>
  );
}
