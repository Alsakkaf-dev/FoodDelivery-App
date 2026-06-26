// Plan 02 — Shared UI primitive barrel. Feature engineers may import from here
// (`@/components/ui`) or from the individual module. Only Plan 02's owned primitives are
// re-exported: nav.tsx + lang-switch.tsx (Plan 04) and food-image.tsx (Plan 05) are NOT
// re-exported here and must be imported from their own modules.

export { cx } from './cx';
export type { ClassValue } from './cx';

// Existing (restyled) primitives — signatures + asserted strings preserved.
export { StatusBadge, OrderStatusChip, QtyCounter } from './status';
export { Timeline } from './timeline';
export { Stepper, LangToggle } from './controls';
export { Loading, Skeleton, EmptyState, ErrorState, OfflineBanner } from './states';

// Buttons & actions.
export { PrimaryButton, OutlineButton, GhostOnColor, TextAction, IconButton, FloatingIconButton } from './buttons';
export { Badge } from './badge';

// Inputs.
export { FilledInput, OtpInput, Checkbox, UploadTile } from './inputs';

// Chips & selectable controls.
export { Chip, Pill, SelectChip, SelectTile, CategoryChip, OverlayChip } from './chips';

// Cards.
export { Card, ProductCard, CategoryPhotoCard, RestaurantHeroCard, ReviewCard, PromoCard } from './cards';

// Overlays.
export { BottomSheet, PinnedBar, Modal } from './sheet';

// Meta / data display.
export { MetaStat } from './meta-stat';
export type { MetaItem } from './meta-stat';
export { IconChip, IconTile } from './icon-chip';
export { RatingRow } from './rating';
export { ListRow, SettingsRow } from './list-row';
export { UnderlineTabs, CarouselDots } from './tabs';
export type { TabItem } from './tabs';
export { Avatar } from './avatar';

// Communication (R-3).
export { ChatBubble, Composer, CallControls } from './chat';
export { SuccessScreen } from './success';
