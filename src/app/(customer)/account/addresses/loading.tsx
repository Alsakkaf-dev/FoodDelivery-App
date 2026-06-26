import { Skeleton } from '@/components/ui';

// Route-level loading for the address book.
export default function AddressesLoading() {
  return (
    <div className="space-y-3">
      <div className="h-20 rounded-2xl bg-surface-alt" aria-hidden />
      <div className="h-20 rounded-2xl bg-surface-alt" aria-hidden />
      <Skeleton lines={2} />
    </div>
  );
}
