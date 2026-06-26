'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Order } from '@/types/db';
import { Icon } from '@/components/icons';
import { useRiderFeed } from '@/lib/realtime/hooks';

/**
 * CMP-R-03 — Live deliveries feed (SDD §5.3, rider:feed).
 * Seeds useRiderFeed with the server-rendered orders; when the live set of
 * ready / out-for-delivery orders changes, it surfaces a one-tap refresh so the
 * rider always sees the latest assignments without a manual reload (NFR-R-04:
 * a dropped socket simply degrades to the static server render).
 *
 * Feed-diff + hook usage are FROZEN logic — only the button presentation is restyled.
 * Keeps `sticky top-2 z-30` (z-stack: feed-seed 30 < BottomNav 40 < OfflineBanner 50).
 */
