'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getDictionary } from '@/lib/i18n/dictionaries';

// US-017 / FR-C-09 — DuitNow QR proof upload. Picks an image, validates its type
// and size on the client, uploads it to the `payment-proofs` Storage bucket with
// the browser (anon) client, and returns the public URL as the order's
// `proof_url`. No secrets are inlined; the bucket + its insert policy are an owner
// setup step (see BUILD/PROGRESS.md). A 5 MB / image-only guard keeps junk out.
const BUCKET = 'payment-proofs';
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

type Props = {
  lang: 'en' | 'ar';
  value: string | null;
  onChange: (url: string | null) => void;
};

export function ProofUpload({ lang, value, onChange }: Props) {
  const t = getDictionary(lang);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // let the same file be re-selected after a remove
    if (!file) return;
    setError(null);
    if (!ACCEPTED.includes(file.type)) {
      setError(t.proof_invalid_type);
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(t.proof_too_large);
      return;
    }
    setBusy(true);
    try {
      const sb = createClient();
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      const path = `proofs/${crypto.randomUUID()}.${ext}`;
      const up = await sb.storage.from(BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });
      if (up.error) throw up.error;
      const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
      onChange(data.publicUrl);
    } catch {
      setError(t.proof_upload_failed);
      onChange(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="space-y-2">
          {/* Preview via background-image (no remote-image config needed). */}
          <div
            className="h-40 w-full rounded-control border border-line bg-cream bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${value})` }}
            role="img"
            aria-label={t.proof_attached}
          />
          <div className="flex items-center gap-2">
            <span className="badge bg-open/10 text-open">✓ {t.proof_attached}</span>
            <button
              type="button"
              className="btn-ghost min-h-tap"
              onClick={() => {
                setError(null);
                onChange(null);
              }}
            >
              {t.remove}
            </button>
          </div>
        </div>
      ) : (
        <label className="btn-secondary flex min-h-tap cursor-pointer items-center justify-center gap-2">
          <span aria-hidden>📷</span>
          <span>{busy ? t.loading : t.upload_proof}</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            disabled={busy}
            aria-label={t.upload_proof}
            onChange={onPick}
          />
        </label>
      )}
      <p className="text-caption text-muted">{t.upload_proof_hint}</p>
      {error ? (
        <p className="text-sm text-soldout" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
