import { getI18n } from '@/lib/i18n/server';
import { listZones } from '@/lib/domain/zones';
import { PageHeader } from '@/components/customer/account/page-header';
import { AccountAddressForm } from '@/components/customer/account/account-address-form';

// SCR-C — Add New Address. Active zones supply the required zone_id (auto-selected
// when there is only one). This is the one fully-real write in the account lane:
// the form calls createAddress, then returns to the address book.
export const dynamic = 'force-dynamic';

export default async function NewAddressPage() {
  const { t } = getI18n();
  const zoneRes = await listZones(true);
  const zones = zoneRes.ok ? zoneRes.data : [];

  return (
    <div className="space-y-5">
      <PageHeader title={t.add_new_address} backLabel={t.back} />
      <AccountAddressForm t={t} zones={zones} />
    </div>
  );
}
