import { getI18n } from '@/lib/i18n/server';
import { getProfile } from '@/lib/auth/roles';
import { PageHeader } from '@/components/customer/account/page-header';
import { ProfileForm } from '@/components/customer/account/profile-form';

// SCR-C — Edit Profile. Pre-filled from the real profile (getProfile); SAVE calls
// the updateProfile server action. Phone is read-only (changed via OTP re-verify).
export const dynamic = 'force-dynamic';

export default async function EditProfilePage() {
  const { t } = getI18n();
  const profile = await getProfile();

  return (
    <div className="space-y-6">
      <PageHeader title={t.edit_profile} backLabel={t.back} />
      <ProfileForm
        t={t}
        initial={{
          name: profile?.name || '',
          email: profile?.email || '',
          phone: profile?.phone || '',
          bio: profile?.bio || '',
        }}
      />
    </div>
  );
}
