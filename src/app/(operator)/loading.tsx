import { Skeleton } from '@/components/ui/states';

// Route-level Loading for the operator group. Rendered inside the group layout's `main`
// frame (which owns the shell), so it only supplies placeholder content (D-15 §5).
// Shaped like the dashboard (title + KPI pair + chart card + a list card) to avoid
// layout shift when the real screen streams in.
export default function OperatorLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <Skeleton lines={1} className="h-7 w-1/2" />
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <Skeleton lines={2} />
        </div>
        <div className="card">
          <Skeleton lines={2} />
        </div>
      </div>
      <div className="card">
        <Skeleton lines={5} />
      </div>
      <div className="card">
        <Skeleton lines={2} />
      </div>
    </div>
  );
}
