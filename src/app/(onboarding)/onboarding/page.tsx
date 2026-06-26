import { getI18n } from '@/lib/i18n/server';
import { OnboardingCarousel } from '@/components/auth/onboarding-carousel';

// Swipeable 4-slide onboarding. Locale resolved server-side and passed to the client
// carousel (which reads the dictionary for its copy). Standalone route; not forced from `/`.
export default function OnboardingPage() {
  const { locale } = getI18n();
  return <OnboardingCarousel locale={locale} />;
}
