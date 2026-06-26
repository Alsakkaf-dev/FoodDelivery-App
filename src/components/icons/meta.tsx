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

export function PhoneIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6.5 4h3l1.5 4-2 1.5a11 11 0 0 0 4.5 4.5l1.5-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5C12 22 4 14 3.9 5.6A1.5 1.5 0 0 1 5.4 4Z" />
    </IconBase>
  );
}

export function MessageIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 4.5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H10l-4 3.5V15.5H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" />
    </IconBase>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5" />
      <path d="M12 7.8h.01" />
    </IconBase>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 4 21 19H3Z" />
      <path d="M12 10v4" />
      <path d="M12 16.6h.01" />
    </IconBase>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </IconBase>
  );
}

export function HomeAddressIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 10v9h12v-9" />
      <path d="M10 19v-5h4v5" />
    </IconBase>
  );
}

export function BriefcaseIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3.5" y="7.5" width="17" height="11" rx="2" />
      <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" />
      <path d="M3.5 12.5h17" />
    </IconBase>
  );
}

export function MicIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
      <path d="M12 17.5V21" />
    </IconBase>
  );
}

export function MicOffIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 4 20 20" />
      <path d="M9 5.2A3 3 0 0 1 15 6v4" />
      <path d="M15 13.6A3 3 0 0 1 9 12v-1.5" />
      <path d="M5.5 11a6.5 6.5 0 0 0 9.6 5.7" />
      <path d="M12 17.5V21" />
    </IconBase>
  );
}

export function SpeakerIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 9.5v5h3l4.5 3.5v-12L7 9.5Z" />
      <path d="M16 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 6a8 8 0 0 1 0 12" />
    </IconBase>
  );
}

export function VolumeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 9.5v5h3l4.5 3.5v-12L7 9.5Z" />
      <path d="M16 9.8a4 4 0 0 1 0 4.4" />
    </IconBase>
  );
}

export function PhoneOffIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 4 20 20" />
      <path d="M10.5 5.5 9.5 4H6.5L5 8l2 1.5a11 11 0 0 0 .9 1.5" />
      <path d="M13.8 14a11 11 0 0 0 1.5.9l1.5-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5 16 16 0 0 1-6.6-2.1" />
    </IconBase>
  );
}

// "Hot / popular" accent for the active All category chip (requested by #07).
export function FlameIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 21a6 6 0 0 0 6-6c0-4-4-6.5-4-6.5s.5 2-1 3c0 0-.4-4.6-3.5-7.5 0 0 .5 4-2 6.5A6 6 0 0 0 6 15a6 6 0 0 0 6 6Z" />
    </IconBase>
  );
}
