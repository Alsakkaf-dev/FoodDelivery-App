import { redirect } from 'next/navigation';

// The customer bottom-nav "Orders" tab points at /orders, and an order's live
// tracking lives at /orders/[id] — but there was no /orders index, so the tab
// 404'd. Until the order-list route is consolidated here, send customers to their
// existing order list (/history). See BUILD/PROGRESS.md Notes log for the planned
// consolidation (canonical /orders list + a dedicated Account screen).
export default function OrdersIndexPage() {
  redirect('/history');
}
