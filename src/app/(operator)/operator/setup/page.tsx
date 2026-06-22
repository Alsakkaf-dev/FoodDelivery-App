import { getI18n } from '@/lib/i18n/server';
import { getStatus, configureSession } from '@/lib/domain/session';
import { listZones } from '@/lib/domain/zones';
import { ErrorState } from '@/components/ui/states';
import { SetupForm } from '@/components/operator/setup-form';
import { TZ } from '@/lib/utils/time';

// SCR-O-02 — Daily setup screen (US-026..029). Server component: pre-loads the
// current session values (`getStatus`) and ALL zones (`listZones()` — no
// activeOnly, so inactive zones are shown for toggling), then hands them to the
// client form. The operator layout owns the header chrome + BottomNav.
export const dynamic = 'force-dynamic';

export default async function SetupPage() {
  const { locale, t } = getI18n();
  const [statusRes, zonesRes] = await Promise.all([getStatus(), listZones()]);

  const today = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-MY' : 'en-MY', {
    timeZone: TZ,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-h1 font-bold text-slate">{t.daily_setup}</h1>
        <p className="text-sm text-muted">
          {t.today} · {today}
        </p>
      </header>

      {zonesRes.ok ? (
        <SetupForm
          initial={{
            qty_total: statusRes.ok ? statusRes.data.qty_total : 0,
            cutoff_time: statusRes.ok ? statusRes.data.cutoff_time : null,
            delivery_window: statusRes.ok ? statusRes.data.delivery_window : null,
          }}
          zones={zonesRes.data}
          t={t}
          locale={locale}
          action={configureSession}
        />
      ) : (
        <ErrorState message={t.error_generic} />
      )}
    </section>
  );
}
