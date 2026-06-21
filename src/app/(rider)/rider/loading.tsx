import { Loading } from '@/components/ui/states';

// Route-level Loading state for the rider screens (D-15 §5).
export default function RiderLoading() {
  return (
    <main className="mx-auto min-h-dvh max-w-md p-4">
      <Loading />
    </main>
  );
}
