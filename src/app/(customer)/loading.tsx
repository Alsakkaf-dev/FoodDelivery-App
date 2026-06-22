import { Loading } from '@/components/ui/states';

// Route-level Loading for the customer group. Rendered inside the group layout's
// `main` frame (which owns the shell), so it only supplies the spinner (D-15 §5).
export default function CustomerLoading() {
  return <Loading />;
}
