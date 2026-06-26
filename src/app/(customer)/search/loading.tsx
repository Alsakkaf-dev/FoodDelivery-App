import { Skeleton } from '@/components/ui';

// Route-level loading skeleton for /search (matches the header + grid rhythm).
export default function Loading() {
  return (
    <div className="space-y-5">
      <Skeleton lines={1} />
      <Skeleton lines={1} />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton lines={5} />
        <Skeleton lines={5} />
      </div>
    </div>
  );
}
