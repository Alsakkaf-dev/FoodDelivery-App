import { IconBase, type IconProps } from './icon-base';

// Navigation / chrome glyphs (Plan 04 bottom-nav, Plan 07 header, role shells).
// All stroke=currentColor line icons. Requested by #04 by string name and
// resolved via ICON_REGISTRY in registry.ts.

export function HomeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 10.75 12 3l9 7.75" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
      <path d="M9.5 21v-6.5h5V21" />
    </IconBase>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </IconBase>
  );
}

// Food menu / browse list (the customer "Menu" tab).
export function MenuIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="4" y="3.5" width="16" height="17" rx="2.5" />
      <path d="M8 8.5h8" />
      <path d="M8 12h8" />
      <path d="M8 15.5h5" />
    </IconBase>
  );
}

export function BagIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 8h12l-1 12.4a1 1 0 0 1-1 .95H8a1 1 0 0 1-1-.95Z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </IconBase>
  );
}

