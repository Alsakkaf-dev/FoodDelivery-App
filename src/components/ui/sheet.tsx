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
