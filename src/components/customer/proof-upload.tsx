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

