import { IconBase, type IconProps } from './icon-base';

// Food / ingredient glyphs — power category chips, ingredient meta, the
// food-doodle watermark, and the <FoodImage> SVG placeholder (replacing the
// 🌯 emoji fallback). Thin line style, stroke=currentColor.

export function BurgerIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 10.5a7 7 0 0 1 14 0Z" />
      <path d="M4.5 13.5h15" />
      <path d="M5.5 16.5h13a2 2 0 0 1-2 2H7.5a2 2 0 0 1-2-2Z" />
      <path d="M8 7.6h.01M11 6.9h.01M14 7.4h.01" />
    </IconBase>
  );
}

export function FriesIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 10.5 6 19a1.5 1.5 0 0 0 1.5 1.7h9A1.5 1.5 0 0 0 18 19l-1-8.5Z" />
      <path d="M9 10.5V6.5M11.5 10.5V5M14 10.5V6" />
    </IconBase>
  );
}

export function DrumstickIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M14.5 4a5 5 0 0 0-5.2 7.8l-2.6 2.6a2.6 2.6 0 1 0 3.6 3.6l2.6-2.6A5 5 0 0 0 14.5 4Z" />
      <path d="m6.7 14.7-2 2M9 17l-2 2" />
    </IconBase>
  );
}

export function WrapIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 16 16 5a3 3 0 0 1 3 3L8 19a3 3 0 0 1-3-3Z" />
      <path d="m5 16-1.5 4 4-1.5" />
      <path d="M9.5 12.5l2 .6M12.5 9.5l1.6.8" />
    </IconBase>
  );
}

export function PizzaIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 8 12 21l8-13a16 16 0 0 0-16 0Z" />
      <path d="M4 8a16 16 0 0 1 16 0" />
      <path d="M10 11h.01M13 13.5h.01" />
    </IconBase>
  );
}

export function DrinkIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 8h12l-1.2 11.5a1.5 1.5 0 0 1-1.5 1.3H8.7a1.5 1.5 0 0 1-1.5-1.3Z" />
      <path d="M9 8 10 4h4l1 4" />
      <path d="M13 8 15 3" />
      <path d="M7.5 12h9" />
    </IconBase>
  );
}

export function BowlIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3.5 11h17a8.5 8.5 0 0 1-17 0Z" />
      <path d="M9 7.5c0-1 1-1.5 1-2.5M13 7c0-1 1-1.5 1-2.5" />
    </IconBase>
  );
}

export function CoffeeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 8h12v5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5Z" />
      <path d="M17 9.5h2a2.5 2.5 0 0 1 0 5h-2" />
      <path d="M8 4.5c0 1-1 1.5-1 2.5M12 4c0 1-1 1.5-1 2.5" />
    </IconBase>
  );
}
