import { UnderlineTabs } from '@/components/ui';

// Engineer #13 — the Ongoing / History segmented tabs for the My Orders surface.
// URL-driven so the page stays a Server Component (force-dynamic): each segment is an
// anchor to ?tab=…; the active key comes from the page's searchParams. Verified against
// #02's ui/tabs.tsx: UnderlineTabs({ tabs: {key,label,href}[], value }) renders <a> in
// link mode with the active tab carrying border-brand/text-brand (RTL-safe, no transform).

type Props = {
  active: 'ongoing' | 'history';
  ongoingLabel: string;
  historyLabel: string;
};

export function OrdersTabs({ active, ongoingLabel, historyLabel }: Props) {
  return (
    <UnderlineTabs
      value={active}
      tabs={[
        { key: 'ongoing', label: ongoingLabel, href: '/orders?tab=ongoing' },
        { key: 'history', label: historyLabel, href: '/orders?tab=history' },
      ]}
    />
  );
}
