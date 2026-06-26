'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChatBubble, Composer } from '@/components/ui';
import { EmptyState } from '@/components/ui/states';
import { Icon } from '@/components/icons';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';

type Msg = { id: number; side: 'in' | 'out'; text: string };

/**
 * Delivery Man — Message screen (presentational).
 * No chat backend / messages table exists (frozen domain), so there is NO invented data
 * contract: the thread starts empty and the composer echoes the rider's own outgoing
 * bubbles locally. Full-screen immersive surface: `fixed inset-0 z-[45]` (modal band —
 * BottomNav 40 < 45 < OfflineBanner 50, z-stack order preserved). Close → delivery detail.
 */
