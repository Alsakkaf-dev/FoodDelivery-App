import Link from 'next/link';
import type { Order } from '@/types/db';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import { translate } from '@/lib/i18n/dictionaries';
import { formatMYR } from '@/lib/utils/money';
import { formatMyt } from '@/lib/utils/time';
import { OrderStatusChip } from '@/components/ui/status';
import { Icon } from '@/components/icons';
import { OrderActions, type OrderActionLabels } from './order-actions';

// Engineer #13 — one order row (Server Component) for the My Orders surface.
// Single-vendor app: an order carries no shop name / category / photo, so the
// "shop" slot binds to the contracted `shop_name` dict value and the thumbnail is a
// branded tile whose icon encodes the order type (scooter = delivery, store =
// pickup) — no extra fetch, the frozen listMyOrders item_count contract is untouched.
// Status is the frozen `OrderStatusChip` (consumed, never forked). The interactive
// actions live in the OrderActions client island.

type Props = {
  order: Order;
  variant: 'ongoing' | 'history';
  locale: 'en' | 'ar';
  t: Dictionary;
};

