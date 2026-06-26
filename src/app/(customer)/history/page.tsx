import { redirect } from 'next/navigation';

// Order history is now consolidated into the canonical My Orders surface
// (/orders, with Ongoing / History underline tabs — Engineer #13). Per ruling R-4 the
// bottom-nav href '/history' is FROZEN (shell-nav.test.ts pins it), so this route is
// kept as a redirect to the History tab. The order detail page's "← Order history"
// link (owned by #12) and any saved /history deep links keep resolving here.
export default function HistoryPage() {
  redirect('/orders?tab=history');
}
