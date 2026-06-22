'use client';
import { useState, useTransition } from 'react';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { ApiResult } from '@/lib/utils/api';
import { broadcastSchema } from '@/lib/utils/schemas';

// SCR-O-06 — bilingual broadcast composer (US-038, FR-O-12). Two textareas
// (English + Arabic, the AR one RTL); submitting fans out once per opted-in
// customer in their language via `broadcast`. Surfaces the daily-cap
// `rate_limited` error and the success send count. Prop-driven + schema-mirrored.

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
          className={`rounded-control px-3 py-2 text-sm font-semibold ${
            result.kind === 'ok' ? 'bg-open/10 text-open' : 'bg-rust/10 text-rust'
          }`}
          role={result.kind === 'ok' ? 'status' : 'alert'}
        >
          {result.text}
        </p>
      ) : null}

      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate">{t.message_en}</span>
        <textarea dir="ltr" value={en} onChange={(e) => setEn(e.target.value)} maxLength={500} rows={3} className="field" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate">{t.message_ar}</span>
        <textarea dir="rtl" value={ar} onChange={(e) => setAr(e.target.value)} maxLength={500} rows={3} className="field" />
      </label>

      <p className="text-caption text-muted">{t.broadcast_hint}</p>
      <button type="submit" className="btn-primary min-h-tap w-full" disabled={!valid || pending}>
        {pending ? t.saving : t.send_broadcast}
      </button>
    </form>
  );
}
