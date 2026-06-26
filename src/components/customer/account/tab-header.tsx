import { UnderlineTabs } from '@/components/ui';

// Shared Notifications ↔ Messages tab strip. Both routes render this with their
// own `active` key; the tabs are #02 UnderlineTabs in href/Link mode so a tap
// navigates between the two deep-linkable routes (/notifications ↔ /messages)
// with no duplicated state. Labels (incl. the "Messages (3)" unread count) are
// composed by the server page from the dictionary. Underline animates in the
// logical direction (RTL handled by the primitive).
export function TabHeader({
  notificationsLabel,
  messagesLabel,
  active,
}: {
  notificationsLabel: string;
  messagesLabel: string;
  active: 'notifications' | 'messages';
}) {
  return (
    <UnderlineTabs
      value={active}
      tabs={[
        { key: 'notifications', label: notificationsLabel, href: '/notifications' },
        { key: 'messages', label: messagesLabel, href: '/messages' },
      ]}
    />
  );
}
