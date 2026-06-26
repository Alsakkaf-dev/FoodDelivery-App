'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { Icon } from '@/components/icons';
import { TextAction, UploadTile } from '@/components/ui';

// US-017 / FR-C-09 — DuitNow QR proof upload. Picks an image, validates its type
// and size on the client, uploads it to the `payment-proofs` Storage bucket with
// the browser (anon) client, and returns the public URL as the order's
// `proof_url`. No secrets are inlined; the bucket + its insert policy are an owner
// setup step. A 5 MB / image-only guard keeps junk out. (Pipeline frozen.)
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

  async function onFiles(files: FileList) {
    const file = files[0];
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
            className="h-40 w-full rounded-md border border-line bg-surface-alt bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${value})` }}
            role="img"
            aria-label={t.proof_attached}
          />
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-success">
              <Icon name="check-circle" className="h-4 w-4" aria-hidden />
              {t.proof_attached}
            </span>
            <TextAction
              tone="brand"
              onClick={() => {
                setError(null);
                onChange(null);
              }}
            >
              {t.remove}
            </TextAction>
          </div>
        </div>
      ) : (
        <UploadTile
          accept="image/png,image/jpeg,image/webp"
          label={busy ? t.loading : t.upload_proof}
          hint={t.upload_proof_hint}
          disabled={busy}
          onFiles={onFiles}
        />
      )}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
