// Offline fallback served by the service worker (NFR-C-04).
export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="text-5xl" aria-hidden>📶</div>
      <h1 className="text-xl font-bold text-slate">You are offline</h1>
      <p className="text-muted">
        Fahman Orders needs a connection to show live status and place orders. We will reconnect automatically.
      </p>
      <p className="text-muted" dir="rtl">
        أنت غير متصل بالإنترنت. سيعاد الاتصال تلقائياً لعرض الحالة المباشرة وإرسال الطلبات.
      </p>
    </main>
  );
}
