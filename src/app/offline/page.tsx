// Offline fallback served by the service worker (NFR-C-04). MUST stay FULLY STATIC:
// no 'use client', no i18n/dictionary imports, no hooks, no async — inline EN+AR only.
// Restyled to the new palette with token classes + an inline SVG glyph (no icon import).
export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 bg-surface p-8 text-center">
      <span
        className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-tint text-brand"
        aria-hidden
      >
        <svg
          viewBox="0 0 24 24"
          width="36"
          height="36"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 2l20 20" />
          <path d="M16.7 11.06A6 6 0 0 1 19.7 13.2" />
          <path d="M4.3 13.2a10 10 0 0 1 4.2-2.5" />
          <path d="M2 8.8A15.5 15.5 0 0 1 7.6 5.6" />
          <path d="M21.9 8.9a15.6 15.6 0 0 0-5-3.2" />
          <path d="M8.5 16.4a5 5 0 0 1 6.5-.4" />
          <path d="M12 20h.01" />
        </svg>
      </span>
      <h1 className="text-h1 font-bold text-ink">You&rsquo;re offline</h1>
      <p className="text-body text-muted">
        Fahman Orders needs a connection to show live status and place orders. We&rsquo;ll reconnect automatically.
      </p>
      <p className="text-body text-muted" dir="rtl" lang="ar">
        أنت غير متصل بالإنترنت. سيعاد الاتصال تلقائياً لعرض الحالة المباشرة وإرسال الطلبات.
      </p>
    </main>
  );
}
