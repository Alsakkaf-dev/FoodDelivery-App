import type { ReactNode } from 'react';

// Minimal full-bleed shell for the pre-app entry group (splash, onboarding, auth, location).
// No bottom nav / no customer shell — these screens precede the app. IMPORTANT: this group
// intentionally has NO root page.tsx — every screen lives at its own path (/splash,
// /onboarding, /location-access, /signup, /forgot-password) so it never collides with `/`
// (home, owned by #07). Language/dir come from the root layout via the NEXT_LOCALE cookie.
export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-surface">{children}</div>;
}
