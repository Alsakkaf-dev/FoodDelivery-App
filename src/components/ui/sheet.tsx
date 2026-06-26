'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cx } from './cx';
import { IconButton } from './buttons';

// Plan 02 — Overlays. BottomSheet + Modal share scrim, Esc-to-close, body-scroll lock,
// and a minimal focus trap. z-index sits in 40–49 (below OfflineBanner 50 / InstallPrompt
// 60), preserving the frozen z-stack. Slide/fade is CSS-only and respects reduced motion
// (the richer motion layer is #18). PinnedBar is the static, non-modal sticky variant.

function focusTrap(e: KeyboardEvent, container: HTMLElement | null) {
  if (e.key !== 'Tab' || !container) return;
  const f = container.querySelectorAll<HTMLElement>(
    'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])',
  );
  if (!f.length) return;
  const first = f[0];
  const last = f[f.length - 1];
  if (!first || !last) return;
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

function useOverlay(open: boolean, onClose: () => void, panelRef: React.RefObject<HTMLDivElement>) {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (!open) { setEntered(false); return; }
    const id = requestAnimationFrame(() => setEntered(true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else focusTrap(e, panelRef.current);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, panelRef]);
  return entered;
}

/** BottomSheet — top-rounded modal with grabber, scrim, pinned footer. */
export function BottomSheet({
  open, onClose, title, footer, closeLabel = 'Close', children, className,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  footer?: ReactNode;
  closeLabel?: string;
  children: ReactNode;
  className?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const entered = useOverlay(open, onClose, panelRef);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40">
      <div
        className={cx('absolute inset-0 bg-black/50 transition-opacity duration-200 motion-reduce:transition-none', entered ? 'opacity-100' : 'opacity-0')}
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        tabIndex={-1}
        className={cx(
          'absolute inset-x-0 bottom-0 flex max-h-[90dvh] flex-col rounded-t-2xl bg-surface shadow-sheet outline-none transition-transform duration-200 ease-out motion-reduce:transition-none',
          entered ? 'translate-y-0' : 'translate-y-full',
          className,
        )}
      >
        <div className="mx-auto mt-3 h-1.5 w-10 rounded-pill bg-line" aria-hidden />
        {title ? (
          <div className="flex items-center justify-between px-5 pb-2 pt-3">
            <h2 className="text-h2 font-bold text-ink">{title}</h2>
            <IconButton variant="nav" icon="close" aria-label={closeLabel} onClick={onClose} />
          </div>
        ) : null}
        <div className="overflow-y-auto px-5 pb-4 pt-2">{children}</div>
        {footer ? <div className="border-t border-line p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</div> : null}
      </div>
    </div>
  );
}

/** PinnedBar — always-visible sticky bottom bar (#09 add-bar, #10 summary). Non-modal. */
export function PinnedBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx('sticky bottom-0 z-30 rounded-t-2xl border-t border-line bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-sheet', className)}>
      {children}
    </div>
  );
}

/** Modal — centered dialog (confirmations, promos). */
