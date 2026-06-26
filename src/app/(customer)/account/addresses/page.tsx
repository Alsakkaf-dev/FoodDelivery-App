import { getI18n } from '@/lib/i18n/server';
import { listAddresses } from '@/lib/domain/addresses';
import { listZones } from '@/lib/domain/zones';
import { ErrorState } from '@/components/ui';
import { PageHeader } from '@/components/customer/account/page-header';
import { AddressList } from '@/components/customer/account/address-list';

// SCR-C — My Address (saved-address book). Reads are real (listAddresses +
// active zones for the add/edit form). Add-new writes for real (createAddress);
// edit/delete are preview-only (no update/delete server action — see TEAM_STATUS).
export const dynamic = 'force-dynamic';

export default async function AddressesPage() {
  const { t } = getI18n();
  const [addrRes, zoneRes] = await Promise.all([listAddresses(), listZones(true)]);
  const zones = zoneRes.ok ? zoneRes.data : [];

  return (
    <div className="space-y-5">
      <PageHeader title={t.my_addresses} backLabel={t.back} />
      {!addrRes.ok ? <ErrorState message={t.error_generic} /> : <AddressList t={t} zones={zones} initial={addrRes.data} />}
    </div>
  );
}
