'use client';
import { type ReactNode } from 'react';
import { Icon } from '@/components/icons';
import { cx } from './cx';
import { IconButton } from './buttons';
import { Avatar } from './avatar';

// Plan 02 — In-app communication primitives (R-3: hard deps of #14 messages + #17 rider
// chat/call). ChatBubble mirrors its side + tail under RTL via logical corner radii;
// Composer is the pill + orange send; CallControls = gray mute / red end / gray speaker.
// Token-driven, ≥44px tap, copy-agnostic (placeholder/labels via props).

function Receipt({ receipt }: { receipt: 'sent' | 'delivered' | 'read' }) {
  // sent = single tick, delivered/read = double tick, read tinted info-blue.
  const tint = receipt === 'read' ? 'text-info-blue' : 'text-onColor/70';
  return (
    <span className={cx('inline-flex items-center', tint)} aria-hidden>
      <Icon name="check" className="h-3.5 w-3.5" />
      {receipt !== 'sent' ? <Icon name="check" className="-ms-2 h-3.5 w-3.5" /> : null}
    </span>
  );
}

export function ChatBubble({
  side, text, time, receipt, avatarSrc, className,
}: {
  side: 'in' | 'out';
  text: ReactNode;
  time?: ReactNode;
  receipt?: 'sent' | 'delivered' | 'read';
  avatarSrc?: string;
  className?: string;
}) {
  const out = side === 'out';
  return (
    <div className={cx('flex w-full items-end gap-2', out ? 'justify-end' : 'justify-start', className)}>
      {!out && avatarSrc ? <Avatar src={avatarSrc} size="sm" alt="" /> : null}
      <div className="max-w-[78%]">
        <div className={cx('rounded-2xl px-4 py-2.5 text-sm', out ? 'rounded-ee-sm bg-brand text-onColor' : 'rounded-es-sm bg-surface-alt text-ink')}>
          {text}
        </div>
        <div className={cx('mt-1 flex items-center gap-1 text-caption text-muted', out ? 'justify-end' : 'justify-start')}>
          {time ? <span>{time}</span> : null}
          {out && receipt ? <Receipt receipt={receipt} /> : null}
        </div>
      </div>
    </div>
  );
}

