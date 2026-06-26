'use client';
// Location-access primer button. Triggers the real browser geolocation prompt (a standard,
// harmless permission primer) then continues to /login regardless of grant/deny — it never
// blocks the entry flow and touches no frozen contract. Composes #02 PrimaryButton + #05 pin.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PrimaryButton } from '@/components/ui';
import { Icon } from '@/components/icons';

export function LocationPrimer({ label }: { label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  function grant() {
    setBusy(true);
    const proceed = () => router.push('/login');
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(proceed, proceed, { timeout: 8000 });
    } else {
      proceed();
    }
  }

  return (
    <PrimaryButton onClick={grant} disabled={busy}>
      <span className="inline-flex items-center gap-2">
        {label}
        <Icon name="map-pin" />
      </span>
    </PrimaryButton>
  );
}
