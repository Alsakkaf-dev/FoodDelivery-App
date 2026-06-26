import { getI18n } from '@/lib/i18n/server';
import { getProfile } from '@/lib/auth/roles';
import { listAddresses } from '@/lib/domain/addresses';
import { listMyOrders } from '@/lib/domain/orders';
import { PageHeader } from '@/components/customer/account/page-header';
import { ProfileHero, type HeroStat } from '@/components/customer/account/profile-hero';
import { SettingsList, type SettingsItem } from '@/components/customer/account/settings-list';
import { LogoutButton } from '@/components/customer/account/logout-button';

// SCR-C — Account hub (My Account). Identity hero (real name/phone + real
// order/address counts — no fabricated wallet, see TEAM_STATUS.md) + a settings
// list linking to the account sub-screens, notifications and messages (the
// bottom-nav hrefs are frozen, R-4, so these links + the home header are the
// entry points). The (customer) layout owns the shell frame + bottom nav.
export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const { t } = getI18n();
  const profile = await getProfile();
  const [addrRes, ordRes] = await Promise.all([listAddresses(), listMyOrders()]);
  const addrCount = addrRes.ok ? addrRes.data.length : 0;
  const ordCount = ordRes.ok ? ordRes.data.length : 0;

  const stats: HeroStat[] = [
    { icon: 'bag', label: `${ordCount} ${t.orders}` },
    { icon: 'home-address', label: `${addrCount} ${t.my_addresses}` },
  ];

  const items: SettingsItem[] = [
    { key: 'personal', icon: 'user', tone: 'brand', title: t.personal_info, href: '/account/personal' },
    { key: 'addresses', icon: 'home-address', tone: 'info.blue', title: t.my_addresses, href: '/account/addresses' },
    { key: 'notifications', icon: 'bell', tone: 'info.purple', title: t.notifications, href: '/notifications' },
    { key: 'messages', icon: 'message', tone: 'success', title: t.messages, href: '/messages' },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title={t.my_account} backLabel={t.back} />
      <ProfileHero name={profile?.name || t.app_name} phone={profile?.phone || ''} stats={stats} />
      <SettingsList items={items} />
      <LogoutButton t={t} />
    </div>
  );
}
