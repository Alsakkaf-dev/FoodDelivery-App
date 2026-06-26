import { Skeleton } from '@/components/ui';

// Route-level loading for the account hub (shell already shows the offline
// banner). A hero-sized block + a settings-list placeholder.
export default function AccountLoading() {
  return (
    <div className="space-y-5">
      <div className="h-32 rounded-2xl bg-surface-alt" aria-hidden />
      <Skeleton lines={5} />
    </div>
  );
}
