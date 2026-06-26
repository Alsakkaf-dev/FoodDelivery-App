'use client';
// Back affordance for the auth shell (Sign Up / Forgot / Verification headers).
// Composes #02's FloatingIconButton + #05's auto-mirroring `chevron-start` glyph;
// never forks a button. Default action is router.back(); pass href to override.
import { useRouter } from 'next/navigation';
import { FloatingIconButton } from '@/components/ui';

export function BackButton({
  label,
  href,
  className = '',
}: {
  label: string;
  href?: string;
  className?: string;
}) {
  const router = useRouter();
  return (
    <FloatingIconButton
      aria-label={label}
      className={className}
      icon="chevron-start"
      onClick={() => (href ? router.push(href) : router.back())}
    />
  );
}
