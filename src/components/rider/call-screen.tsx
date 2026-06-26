'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CallControls } from '@/components/ui';
import { Icon } from '@/components/icons';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';

/**
 * Delivery Man — Call screen (presentational).
 * There is no telephony backend, so mute/speaker/end are visual-only states; a REAL
 * `tel:` link preserves the actual call affordance (no broken/fake flow, AUTH_DISABLED).
 * Full-screen immersive surface: `fixed inset-0 z-[45]` sits in the modal band
 * (BottomNav 40 < 45 < OfflineBanner 50) so it overlays the (rider) shell chrome while
 * keeping the existing z-stack order intact. `bg-ink-header` is a sanctioned immersive
 * dark surface (NOT dark mode). End-call routes back to the delivery detail.
 */
