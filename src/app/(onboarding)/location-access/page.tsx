import { getI18n } from '@/lib/i18n/server';
import { MapIllustration } from '@/components/brand'; // AWAITING #05: confirm export name
import { TextAction } from '@/components/ui';
import { LocationPrimer } from '@/components/auth/location-primer';

// Location permission primer. The "Access location" button triggers the real geolocation
// prompt then continues to /login (grant or deny); "Skip" goes straight to /login.
export default function LocationAccessPage() {
  const { t } = getI18n();
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-8 px-8 text-center">
      <h1 className="text-h1 font-bold text-ink">{t.location_access_title}</h1>
      <MapIllustration aria-hidden className="h-64 w-64" />
      <div className="w-full space-y-4">
        <LocationPrimer label={t.access_location} />
        <p className="text-body text-muted">{t.location_access_body}</p>
        <TextAction href="/login" tone="brand" className="mx-auto block">
          {t.skip}
        </TextAction>
      </div>
    </main>
  );
}
