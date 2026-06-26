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
import { OnboardingIllustration, PeachBlob } from '@/components/brand';

export function OnboardingCarousel({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const router = useRouter();
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  const slides = [
    { step: 1, title: t.onb1_title, body: t.onb1_body },
    { step: 2, title: t.onb2_title, body: t.onb2_body },
    { step: 3, title: t.onb3_title, body: t.onb3_body },
    { step: 4, title: t.onb4_title, body: t.onb4_body },
  ];
  const isLast = active === slides.length - 1;

  // Active dot follows whichever slide is centered in the viewport.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const items = Array.from(track.children) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(items.indexOf(e.target as HTMLElement));
        });
      },
      { root: track, threshold: 0.6 },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  function goTo(i: number) {
    const track = trackRef.current;
    if (!track) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const child = track.children[i] as HTMLElement | undefined;
    child?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
  }

  function finish() {
    router.push('/location-access');
  }

  function next() {
    if (isLast) finish();
    else goTo(active + 1);
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col bg-surface">
      <div className="flex items-center justify-between p-4">
        <LangToggle current={locale} />
        {isLast ? <span /> : <TextAction tone="brand" onClick={finish}>{t.skip}</TextAction>}
      </div>

      <ul
        ref={trackRef}
        className="flex flex-1 snap-x snap-mandatory overflow-x-auto scroll-smooth motion-reduce:scroll-auto"
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') goTo(Math.min(active + 1, slides.length - 1));
          if (e.key === 'ArrowLeft') goTo(Math.max(active - 1, 0));
        }}
      >
        {slides.map((s, i) => (
          <li
            key={s.step}
            className="flex min-w-full snap-center snap-always flex-col items-center justify-center px-8 text-center"
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${slides.length}`}
          >
            <div className="relative mb-10 flex h-64 w-64 items-center justify-center">
              <PeachBlob className="absolute inset-0 h-full w-full" />
              <OnboardingIllustration step={s.step as 1 | 2 | 3 | 4} className="relative h-48 w-48" />
            </div>
            <h1 className="text-h1 font-bold text-ink">{s.title}</h1>
            <p className="mt-3 max-w-xs text-body text-muted">{s.body}</p>
          </li>
        ))}
      </ul>

      <div className="flex flex-col items-center gap-6 p-6">
        <CarouselDots count={slides.length} index={active} onDotClick={goTo} />
        <PrimaryButton onClick={next}>{isLast ? t.get_started : t.next}</PrimaryButton>
      </div>
    </main>
  );
}
