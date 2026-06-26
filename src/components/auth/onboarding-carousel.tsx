'use client';
// Swipeable 4-slide onboarding carousel — ZERO new dependencies: native CSS scroll-snap
// for touch/momentum (mirrors automatically under dir=rtl), an IntersectionObserver to
// drive the active dot, keyboard arrows, and prefers-reduced-motion → instant scroll.
// Consumes #02 CarouselDots/PrimaryButton/TextAction/LangToggle + #05 illustrations.
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDictionary } from '@/lib/i18n/dictionaries';
import type { Locale } from '@/lib/i18n/config';
import { CarouselDots, LangToggle, PrimaryButton, TextAction } from '@/components/ui';
import { OnbIllustration, PeachBlob } from '@/components/brand'; // AWAITING #05: confirm names/props

