'use client';
import { useState, useTransition } from 'react';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { ApiResult } from '@/lib/utils/api';
import { broadcastSchema } from '@/lib/utils/schemas';
import { cx, FilledInput, PrimaryButton } from '@/components/ui';

// SCR-O-06 — bilingual broadcast composer (US-038, FR-O-12). Two textareas
// (English + Arabic, the AR one RTL); submitting fans out once per opted-in
// customer in their language via `broadcast`. Re-skinned to the new design
// language (shared #02 FilledInput/PrimaryButton, #01 tokens) while keeping the
// daily-cap `rate_limited` error, the success send count, the `data-can-send`
// hook and the schema-mirrored client gate. Prop-driven (the server action
// arrives as `send`) so it stays testable without the DB.

export type BroadcastAction = (input: { message_en: string; message_ar: string }) => Promise<ApiResult<{ count: number }>>;

export function BroadcastForm({ t, send }: { t: Dictionary; send: BroadcastAction }) {
  const [en, setEn] = useState('');
  const [ar, setAr] = useState('');
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const candidate = { message_en: en.trim(), message_ar: ar.trim() };
  const valid = broadcastSchema.safeParse(candidate).success;

  function submit() {
    if (!valid || pending) return;
    setResult(null);
    start(async () => {
      const res = await send(candidate);
      if (res.ok) {
        setResult({ kind: 'ok', text: t.broadcast_sent.replace('{{n}}', String(res.data.count)) });
        setEn('');
        setAr('');
      } else {
        setResult({
          kind: 'err',
          text: res.error.code === 'rate_limited' ? t.broadcast_limit : t.error_generic,
        });
      }
    });
  }

  return (
    <form
      className="card space-y-4"
      data-can-send={valid ? 'yes' : 'no'}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {result ? (
        <p
          className={cx(
            'rounded-md px-3 py-2 text-sm font-semibold',
            result.kind === 'ok' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger',
          )}
          role={result.kind === 'ok' ? 'status' : 'alert'}
        >
          {result.text}
        </p>
      ) : null}

      <FilledInput
        label={t.message_en}
        multiline
        rows={3}
        dir="ltr"
        value={en}
        maxLength={500}
        onChange={(e) => setEn(e.target.value)}
      />
      <FilledInput
        label={t.message_ar}
        multiline
        rows={3}
        dir="rtl"
        value={ar}
        maxLength={500}
        onChange={(e) => setAr(e.target.value)}
      />

      <p className="text-caption text-muted">{t.broadcast_hint}</p>
      <PrimaryButton type="submit" fullWidth loading={pending} disabled={!valid}>
        {t.send_broadcast}
      </PrimaryButton>
    </form>
  );
}
