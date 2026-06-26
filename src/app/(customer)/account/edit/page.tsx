import { getI18n } from '@/lib/i18n/server';
import { getProfile } from '@/lib/auth/roles';
import { PageHeader } from '@/components/customer/account/page-header';
import { ProfileForm } from '@/components/customer/account/profile-form';
import { DEMO_EMAIL, DEMO_BIO, localize } from '@/components/customer/account/seed';

// SCR-C — Edit Profile. Pre-fills from getProfile (name/phone real); email/bio
// are preview placeholders (no DB column). SAVE is an optimistic preview stub —
// there is no updateProfile server action yet (consolidated backend request in
// TEAM_STATUS.md).
export const dynamic = 'force-dynamic';

export default async function EditProfilePage() {
  const { locale, t } = getI18n();
  const profile = await getProfile();

  return (
    <div className="space-y-6">
      <PageHeader title={t.edit_profile} backLabel={t.back} />
      <ProfileForm
        t={t}
        initial={{
          name: profile?.name || '',
          email: DEMO_EMAIL,
          phone: profile?.phone || '',
          bio: localize(locale, DEMO_BIO),
        }}
      />
    </div>
  );
}
