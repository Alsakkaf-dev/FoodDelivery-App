import { notFound } from 'next/navigation';
import { getI18n } from '@/lib/i18n/server';
import { getOrder, verifyPayment, refuseOrder } from '@/lib/domain/orders';
import { listMenu } from '@/lib/domain/menu';
import { formatMYR } from '@/lib/utils/money';
import { OrderStatusChip } from '@/components/ui/status';
import { ErrorState } from '@/components/ui/states';
import { PaymentActions } from '@/components/operator/payment-actions';
import type { MenuItem, PaymentStatus } from '@/types/db';

// SCR-O-04 — operator order detail (US-035/036, FR-O-14/15). Server Component:
// loads the order + lines via getOrder(id), resolves bilingual line names from the
// menu, shows totals + payment method/status and (for DuitNow) the proof image,
// then mounts the verify/reject + cancel/refuse island. The (operator) layout owns
// the shell; operator RLS restricts who can read the order.
export const dynamic = 'force-dynamic';

