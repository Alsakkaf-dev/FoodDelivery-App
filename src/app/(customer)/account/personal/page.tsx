import { getI18n } from '@/lib/i18n/server';
import { getProfile } from '@/lib/auth/roles';
import { Avatar, TextAction } from '@/components/ui';
import { PageHeader } from '@/components/customer/account/page-header';
import { IdentityCard, type IdentityRow } from '@/components/customer/account/identity-card';

// SCR-C — Personal Info (read-only). Header carries an EDIT link to the edit form.
// All fields are the real profile (getProfile). Icon-chip semantics per spec:
// person=brand, mail/phone=info.blue.
export const dynamic = 'force-dynamic';

export default async function PersonalInfoPage() {
  const { t } = getI18n();
  const profile = await getProfile();
  const name = profile?.name || t.app_name;

  const rows: IdentityRow[] = [
    { key: 'name', icon: 'user', tone: 'brand', label: t.full_name, value: name },
    { key: 'email', icon: 'mail', tone: 'info.blue', label: t.email, value: profile?.email || '—', dir: 'ltr' },
    { key: 'phone', icon: 'phone', tone: 'info.blue', label: t.phone, value: profile?.phone || '—', dir: 'ltr' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t.personal_info} backLabel={t.back} action={<TextAction tone="brand" href="/account/edit">{t.edit}</TextAction>} />

      <div className="flex items-center gap-4">
        <Avatar name={name} size="xl" backdrop />
        <div className="min-w-0">
          <p className="truncate text-h1 font-bold text-ink">{name}</p>
          {profile?.bio ? <p className="truncate text-body text-muted">{profile.bio}</p> : null}
        </div>
      </div>

      <IdentityCard rows={rows} />
    </div>
  );
}
