'use client';
// Social sign-in circles (Facebook / Twitter / Apple). PREVIEW-ONLY: there is no
// social-auth backend and AUTH_DISABLED is on, so these never navigate or fetch —
// a click surfaces an honest "coming soon" notice. Faithful to the reference look
// using #01 social tokens + #05 glyphs (composed, not a forked primitive).
import { useState } from 'react';
import { Icon } from '@/components/icons';

const SOCIALS = [
  { name: 'facebook', cls: 'bg-social-facebook' },
  { name: 'twitter', cls: 'bg-social-twitter' },
  { name: 'apple', cls: 'bg-social-apple' },
] as const;

export function SocialRow({ comingSoonLabel }: { comingSoonLabel: string }) {
  const [notice, setNotice] = useState(false);
  return (
    <div className="space-y-3 text-center">
      <div className="flex justify-center gap-4">
        {SOCIALS.map((s) => (
          <button
            key={s.name}
            type="button"
            aria-label={s.name}
            onClick={() => setNotice(true)}
            className={`flex h-14 w-14 items-center justify-center rounded-full text-onColor transition active:scale-95 ${s.cls}`}
          >
            <Icon name={s.name} />
          </button>
        ))}
      </div>
      {notice ? (
        <p role="status" className="text-caption text-muted">
          {comingSoonLabel}
        </p>
      ) : null}
    </div>
  );
}
