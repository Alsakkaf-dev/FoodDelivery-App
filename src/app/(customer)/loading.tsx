import { getI18n } from '@/lib/i18n/server';

// Route-level Loading for the customer home. Content-shaped skeleton (D-15 §5)
// mirroring the discovery layout — header row, search pill, category chips, hero
// card — so there is no layout shift when data streams in. Rendered inside the
// group layout's `main` frame, which owns the shell.
export default function CustomerLoading() {
  const { t } = getI18n();
  const block = 'animate-pulse bg-surface-input';
  return (
    <div className="space-y-6" role="status" aria-busy="true" aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        <span className={`h-11 w-11 rounded-pill ${block}`} aria-hidden />
        <span className={`h-9 w-32 rounded-pill ${block}`} aria-hidden />
        <span className={`h-11 w-11 rounded-pill ${block}`} aria-hidden />
      </div>
      <span className={`block h-6 w-48 rounded-md ${block}`} aria-hidden />

      <span className={`block h-[52px] w-full rounded-pill ${block}`} aria-hidden />

      <div className="flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <span key={i} className={`h-16 w-16 rounded-2xl ${block}`} aria-hidden />
        ))}
      </div>

      <div className="card space-y-3">
        <span className={`block h-44 w-full rounded-xl ${block}`} aria-hidden />
        <span className={`block h-5 w-40 rounded-md ${block}`} aria-hidden />
        <span className={`block h-4 w-56 rounded-md ${block}`} aria-hidden />
      </div>

      <span className="sr-only">{t.loading}</span>
    </div>
  );
}
