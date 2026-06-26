import { Skeleton } from '@/components/ui/states';

// Route-level Loading fallback for the rider feed (D-15 §5). Renders INSIDE the
// (rider)/layout.tsx <main> frame (Plan 04, ruling R-5) — body only, no frame of its own.
export default function RiderLoading() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-44 animate-pulse rounded-md bg-surface-input" />
      {[0, 1].map((s) => (
        <section key={s} className="space-y-3">
          <div className="h-4 w-24 animate-pulse rounded-md bg-surface-input" />
          <div className="rounded-2xl bg-surface p-4 shadow-card">
            <Skeleton lines={4} />
          </div>
          <div className="rounded-2xl bg-surface p-4 shadow-card">
            <Skeleton lines={4} />
          </div>
        </section>
      ))}
    </div>
  );
}
