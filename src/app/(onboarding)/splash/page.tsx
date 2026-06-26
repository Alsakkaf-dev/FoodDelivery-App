import { SplashLogo } from '@/components/auth/splash-logo';

// Animated brand splash → auto-advances to /onboarding (the timed reveal + reduced-motion
// handling live in the client component). Standalone route; not forced from `/`.
export default function SplashPage() {
  return <SplashLogo />;
}
