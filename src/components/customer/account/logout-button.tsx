'use client';
// Real sign-out control for the account hub — a danger-tone row (matching the
// SettingsList look) that submits the signOutAction. It also clears the local guest
// cart so the next user on this device starts fresh.
import { IconChip } from '@/components/ui';
import { signOutAction } from '@/lib/auth/session';
import type { Dictionary } from '@/lib/i18n/dictionaries';

export function LogoutButton({ t }: { t: Dictionary }) {
  return (
    <form action={signOutAction} className="overflow-hidden rounded-2xl bg-surface-alt">
      <button
        type="submit"
        onClick={() => {
          try {
            localStorage.removeItem('fahman.cart.v1');
          } catch {
            // ignore — storage may be unavailable
          }
        }}
        className="flex w-full items-center gap-3 px-4 py-3 text-start transition active:bg-surface-input"
      >
        <IconChip icon="arrow-left" tone="danger" />
        <span className="flex-1 text-title font-semibold text-danger">{t.logout}</span>
      </button>
    </form>
  );
}
