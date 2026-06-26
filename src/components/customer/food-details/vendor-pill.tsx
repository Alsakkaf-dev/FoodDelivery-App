import { Chip } from '@/components/ui';
import { Icon } from '@/components/icons';
import type { Dictionary } from '@/lib/i18n/dictionaries';

// Vendor pill — single-vendor brand chrome. Fahman is one kitchen, so this is a static,
// non-interactive label (NOT a link to a vendor page); the text comes from the dictionary
// (`vendor_name`). Composed from the shared Chip primitive in its outline/static state.
export function VendorPill({ t }: { t: Dictionary }) {
  return (
    <Chip selected={false}>
      <Icon name="store" className="me-2 h-4 w-4" />
      {t.vendor_name}
    </Chip>
  );
}
