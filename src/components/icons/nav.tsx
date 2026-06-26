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

export function CartIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="9.5" cy="20" r="1.4" />
      <circle cx="17" cy="20" r="1.4" />
      <path d="M3 4h2.2l2.2 11.1a1 1 0 0 0 1 .8h8.2a1 1 0 0 0 1-.78L20.2 8H6.2" />
    </IconBase>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="8.5" r="3.7" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </IconBase>
  );
}

export function ClipboardIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="5" y="5" width="14" height="15.5" rx="2.2" />
      <path d="M9 5v-.8A2 2 0 0 1 11 2.2h2a2 2 0 0 1 2 2V5Z" />
      <path d="M8.5 11h7" />
      <path d="M8.5 15h5" />
    </IconBase>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.6v2.4M12 19v2.4M21.4 12H19M5 12H2.6M18.6 5.4 16.9 7.1M7.1 16.9 5.4 18.6M18.6 18.6 16.9 16.9M7.1 7.1 5.4 5.4" />
    </IconBase>
  );
}

export function UtensilsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7.5 3v4.5" />
      <path d="M10.5 3v4.5" />
      <path d="M9 7.5V21" />
      <path d="M7.5 7.5a1.5 1.5 0 0 0 3 0" />
      <path d="M15.5 3c2 2 2 6 0 8.5V21" />
    </IconBase>
  );
}
