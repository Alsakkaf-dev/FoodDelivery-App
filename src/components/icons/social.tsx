import { IconBase, type IconProps } from './icon-base';

// Social auth marks — rendered as filled glyphs (currentColor) so they read as
// a white glyph on a brand-colour circle (`bg-social-facebook`/`-twitter`/
// `-apple`, Plan 01 §1a) used by the auth screens (#06). Preview-only buttons.

export function FacebookIcon(props: IconProps) {
  return (
    <IconBase filled {...props}>
      <path d="M14.6 8.5H16V5.85h-2.25c-2.05 0-3.35 1.3-3.35 3.45V11H8.2v2.85h2.2V21h2.95v-7.15h2.35l.4-2.85h-2.75V9.45c0-.65.3-.95 1-.95Z" />
    </IconBase>
  );
}

export function TwitterIcon(props: IconProps) {
  return (
    <IconBase filled {...props}>
      <path d="M21 6.5a7 7 0 0 1-2 .56 3.45 3.45 0 0 0 1.5-1.9 7 7 0 0 1-2.2.86 3.45 3.45 0 0 0-5.95 2.36c0 .27.03.53.09.78A9.8 9.8 0 0 1 4.5 5.55a3.45 3.45 0 0 0 1.07 4.6 3.4 3.4 0 0 1-1.56-.43v.05a3.45 3.45 0 0 0 2.77 3.38 3.5 3.5 0 0 1-1.55.06 3.45 3.45 0 0 0 3.22 2.4A6.9 6.9 0 0 1 3 17.55a9.7 9.7 0 0 0 5.29 1.55c6.34 0 9.81-5.25 9.81-9.8V8.8A6.95 6.95 0 0 0 21 6.5Z" />
    </IconBase>
  );
}

export function AppleIcon(props: IconProps) {
  return (
    <IconBase filled {...props}>
      <path d="M16.1 12.55c0-2.05 1.65-3.05 1.72-3.1a3.65 3.65 0 0 0-2.9-1.6c-1.22-.12-2.4.72-3.02.72-.63 0-1.6-.7-2.63-.68a3.85 3.85 0 0 0-3.25 1.97c-1.4 2.43-.36 6.03 1 8 .68.95 1.48 2.02 2.53 1.98 1.02-.04 1.4-.65 2.64-.65 1.23 0 1.58.65 2.65.63 1.1-.02 1.79-.97 2.46-1.93a8 8 0 0 0 1.11-2.3 3.55 3.55 0 0 1-2.14-3.7Z" />
      <path d="M14.55 6.25A3.45 3.45 0 0 0 15.35 3.5a3.5 3.5 0 0 0-2.3 1.2 3.25 3.25 0 0 0-.82 2.65 2.9 2.9 0 0 0 2.32-1.1Z" />
    </IconBase>
  );
}

export function GoogleIcon(props: IconProps) {
  return (
    <IconBase filled {...props}>
      <path d="M21 12.2c0-.7-.06-1.22-.18-1.76H12v3.34h5.07a4.36 4.36 0 0 1-1.88 2.86v2.4h3.04C20.92 17.45 21 15.1 21 12.2Z" />
      <path d="M12 21c2.55 0 4.7-.85 6.27-2.3l-3.04-2.4a5.65 5.65 0 0 1-8.42-2.96H3.66v2.46A9 9 0 0 0 12 21Z" />
      <path d="M6.81 13.34a5.4 5.4 0 0 1 0-3.42V7.46H3.66a9 9 0 0 0 0 8.08Z" />
      <path d="M12 6.58a4.9 4.9 0 0 1 3.44 1.35l2.58-2.58A8.7 8.7 0 0 0 12 3a9 9 0 0 0-8.34 4.46l3.15 2.46A5.36 5.36 0 0 1 12 6.58Z" />
    </IconBase>
  );
}
