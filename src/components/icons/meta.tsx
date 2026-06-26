import { IconBase, type IconProps } from './icon-base';

// Meta / status / contact glyphs — ratings, delivery meta rows, wallet/payment,
// notifications, messaging, call controls, alerts. Filled variants (star/pin)
// are intentional per spec §7 ("Filled only for stars + active states + pins").

export function StarIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m12 3.5 2.6 5.35 5.9.86-4.25 4.15 1 5.88L12 17.9l-5.25 2.7 1-5.88L3.5 10.57l5.9-.86Z" />
    </IconBase>
  );
}

export function StarFilledIcon(props: IconProps) {
  return (
    <IconBase filled {...props}>
      <path d="m12 3.5 2.6 5.35 5.9.86-4.25 4.15 1 5.88L12 17.9l-5.25 2.7 1-5.88L3.5 10.57l5.9-.86Z" />
    </IconBase>
  );
}

export function TruckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 6.5h11v9H3Z" />
      <path d="M14 9.5h3.4L20 12.4v3.1H14Z" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </IconBase>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3.4 2" />
    </IconBase>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 21s6.5-5.6 6.5-11A6.5 6.5 0 0 0 5.5 10c0 5.4 6.5 11 6.5 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </IconBase>
  );
}

export function NavigationIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M21 3 3 10.6l7.8 2.6L13.4 21Z" />
    </IconBase>
  );
}

export function WalletIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 7.5A2 2 0 0 1 6 5.5h11A1.5 1.5 0 0 1 18.5 7H6" />
      <path d="M4 7.5V18a2 2 0 0 0 2 2h12a1.5 1.5 0 0 0 1.5-1.5V11A1.5 1.5 0 0 0 18 9.5H6" />
      <circle cx="16.5" cy="14.5" r="1.2" />
    </IconBase>
  );
}

export function CreditCardIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="6" width="18" height="12" rx="2.5" />
      <path d="M3 10h18" />
      <path d="M7 14.5h3" />
    </IconBase>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 5 2 6.5 2 6.5H4.5s2-1.5 2-6.5Z" />
      <path d="M10 19.5a2.2 2.2 0 0 0 4 0" />
    </IconBase>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="m4 7.5 8 5.5 8-5.5" />
    </IconBase>
  );
}

