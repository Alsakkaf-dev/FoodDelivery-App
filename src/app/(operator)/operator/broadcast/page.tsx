import { getI18n } from '@/lib/i18n/server';
import { broadcast } from '@/lib/domain/notify';
import { BroadcastForm } from '@/components/operator/broadcast-form';

// SCR-O-06 — broadcast composer (US-038, FR-O-12). Server Component shell; the
// client form fans out the message once per opted-in customer in their language
// via `broadcast` (throttled per day → rate_limited). The (operator) layout owns
// the header chrome + nav.
export const dynamic = 'force-dynamic';

export default function BroadcastPage() {
  const { t } = getI18n();
  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-h1 font-bold text-ink">{t.broadcast}</h1>
      </header>
      <BroadcastForm t={t} send={broadcast} />
    </section>
  );
}
