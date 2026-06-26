// Public surface of the Fahman icon set (Plan 05 · FOUNDATION_CONTRACTS §3).
//
// Two ways to consume — both tree-shakeable:
//   1. By name (when you hold a string — nav items, EmptyState, list rows):
//        import { Icon } from '@/components/icons';
//        <Icon name="home" className="text-brand" />
//   2. Direct (static call-sites):
//        import { HomeIcon } from '@/components/icons';
//        <HomeIcon className="text-muted" />
//
// Colour via Tailwind token text-* class (currentColor). Default size 24 — wrap
// in a ≥44px tap target when the icon is the only control. Directional glyphs
// (chevron-left/right/start, arrow-left, send) auto-mirror under dir=rtl.

export { IconBase } from './icon-base';
export type { IconProps } from './icon-base';

export * from './nav';
export * from './actions';
export * from './meta';
export * from './social';
export * from './food';

export { Icon, ICON_REGISTRY, ICON_NAMES } from './registry';
export type { IconName, IconComponent, IconRenderProps } from './registry';
