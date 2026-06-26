'use client';
// Animated splash: doodle watermark fade → logo reveal → sunburst sweep, then auto-advance
// to onboarding. Animation is driven by React state + inline CSS transitions (NOT shared
// keyframes) so it stays entirely in #06's lane. prefers-reduced-motion → render the final
// frame and advance near-instantly. router.replace so Back never returns to the splash.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo, Sunburst, FoodDoodles } from '@/components/brand'; // AWAITING #05: confirm names

export function SplashLogo() {
  const router = useRouter();
  const [phase, setPhase] = useState(0); // 0 doodles · 1 +logo · 2 +sunburst

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setPhase(2);
      const go = setTimeout(() => router.replace('/onboarding'), 400);
      return () => clearTimeout(go);
    }
    const t1 = setTimeout(() => setPhase(1), 350);
    const t2 = setTimeout(() => setPhase(2), 800);
    const go = setTimeout(() => router.replace('/onboarding'), 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(go);
    };
  }, [router]);

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-md items-center justify-center overflow-hidden bg-surface">
      <FoodDoodles
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08] transition-opacity duration-700"
      />
      <Sunburst
        aria-hidden
        className={`pointer-events-none absolute -top-10 start-1/2 h-72 w-72 -translate-x-1/2 transition-all duration-700 ${phase >= 2 ? 'scale-100 opacity-100' : 'scale-[0.8] opacity-0'}`}
      />
      <Logo
        aria-label="Fahman Orders"
        className={`relative h-16 transition-all duration-500 ${phase >= 1 ? 'scale-100 opacity-100' : 'scale-[0.92] opacity-0'}`}
      />
    </main>
  );
}
