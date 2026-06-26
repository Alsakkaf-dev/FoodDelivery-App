'use client';
import { useEffect, useState } from 'react';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { PrimaryButton, TextAction, IconChip } from '@/components/ui';

// Web Push opt-in (FR-S-11 / FR-C-13). On tap: request Notification permission,
// subscribe via pushManager with the VAPID public key, and POST the subscription
// to /api/push/subscribe (the task-4-1 fallback channel). Hidden once enabled or
// where push is unsupported. Bilingual + ≥44px. The permission/subscribe flow and
// the /api/push/subscribe payload are a FROZEN behavior contract — restyle only.

/** Convert a base64url VAPID public key to the Uint8Array pushManager expects. */
export function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}

