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
