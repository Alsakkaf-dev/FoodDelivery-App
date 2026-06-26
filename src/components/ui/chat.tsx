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

export function Composer({
  value, onChange, onSend, placeholder, emojiSlot, sendLabel = 'Send', disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  placeholder?: string;
  emojiSlot?: ReactNode;
  sendLabel?: string;
  disabled?: boolean;
}) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (value.trim() && !disabled) onSend(); }}
      className="flex items-center gap-2"
    >
      <div className="flex flex-1 items-center gap-2 rounded-pill bg-surface-input px-4">
        {emojiSlot}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-tap flex-1 bg-transparent text-body text-ink outline-none placeholder:text-muted"
        />
      </div>
      <IconButton variant="add" icon="send" type="submit" aria-label={sendLabel} disabled={disabled || !value.trim()} />
    </form>
  );
}

function CircleBtn({
  onClick, ariaLabel, pressed, tone, big, children,
}: {
  onClick?: () => void;
  ariaLabel: string;
  pressed?: boolean;
  tone: 'neutral' | 'danger';
  big?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={pressed}
      className={cx(
        'inline-flex items-center justify-center rounded-full transition active:scale-95 motion-reduce:transition-none',
        big ? 'h-16 w-16' : 'h-14 w-14',
        tone === 'danger'
          ? 'bg-danger text-onColor hover:opacity-90'
          : pressed ? 'bg-ink text-onColor' : 'bg-surface-alt text-ink hover:bg-surface-input',
      )}
    >
      {children}
    </button>
  );
}

export function CallControls({
  muted, onToggleMute, onEnd, speaker, onToggleSpeaker,
  muteLabel = 'Mute', endLabel = 'End call', speakerLabel = 'Speaker',
}: {
  muted?: boolean;
  onToggleMute?: () => void;
  onEnd?: () => void;
  speaker?: boolean;
  onToggleSpeaker?: () => void;
  muteLabel?: string;
  endLabel?: string;
  speakerLabel?: string;
}) {
  return (
    <div className="flex items-center justify-center gap-6">
      <CircleBtn onClick={onToggleMute} ariaLabel={muteLabel} pressed={muted} tone="neutral">
        <Icon name={muted ? 'mic-off' : 'mic'} className="h-6 w-6" aria-hidden />
      </CircleBtn>
      <CircleBtn onClick={onEnd} ariaLabel={endLabel} tone="danger" big>
        <Icon name="phone-off" className="h-7 w-7" aria-hidden />
      </CircleBtn>
      <CircleBtn onClick={onToggleSpeaker} ariaLabel={speakerLabel} pressed={speaker} tone="neutral">
        <Icon name={speaker ? 'volume' : 'speaker'} className="h-6 w-6" aria-hidden />
      </CircleBtn>
    </div>
  );
}
