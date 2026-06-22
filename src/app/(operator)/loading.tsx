import { Loading } from '@/components/ui/states';

// Route-level Loading for the operator group. Rendered inside the group layout's
// `main` frame (which owns the shell), so it only supplies the spinner (D-15 §5).
export default function OperatorLoading() {
  return <Loading />;
}
