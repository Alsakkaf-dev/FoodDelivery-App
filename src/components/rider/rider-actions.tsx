'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { OrderStatus } from '@/types/db';
import { PrimaryButton } from '@/components/ui';
import { riderPickup, riderDeliver } from '@/lib/domain/rider';

/**
 * CMP-R-02 — The rider's primary action button (FR-R-05/06).
 * "Picked up" shows while status='ready'; "Delivered" while status='out_for_delivery'.
 * After a successful action we return to the deliveries list.
 *
 * Action calls + `.ok` handling + post-action routing are FROZEN — only the buttons
 * are restyled (orange CTA for pickup; success-green for delivered).
 */
