import { Icon, type IconName } from '@/components/icons';

// FoodImage — the shared imagery helper (Plan 05 · design-spec §7).
//
// Preserves the codebase's CSS `background-image` pattern (no remote next/image
// config needed — see menu-card.tsx) and standardises the new look: circular /
// rounded / hero crops, the warm amber "plate" backdrop with a soft contact
// shadow, and a dish that can overhang the card top. Replaces the bare 🌯 emoji
// fallback with a real line-icon on a tinted surface.
//
// Tokens only (no hardcoded hex/shadow): `bg-hero-gradient` + `shadow-card`
// (Plan 01). Colour-agnostic; copy comes from the caller via `alt` (a dict
// string) so this file never hardcodes user-facing text. RTL-safe (no
// left/right; symmetric).

type FoodImageShape = 'circle' | 'rounded' | 'hero';

const SHAPE_RADIUS: Record<FoodImageShape, string> = {
  circle: 'rounded-full',
  rounded: 'rounded-lg', // 16px thumbnails/cards
  hero: 'rounded-xl', // 20px hero plates
};

export interface FoodImageProps {
  /** Image URL (e.g. Supabase `photo_url`). When absent, the fallback icon shows. */
  src?: string | null;
  /** Accessible description — pass a dictionary string (e.g. the dish name). */
  alt: string;
  /** Crop shape. Default `rounded`. */
  shape?: FoodImageShape;
  /** Wrap the image in the warm amber gradient "plate" with a contact shadow. */
  plate?: boolean;
  /** Let the dish bleed above the plate's top edge (use with `plate`). */
  overhang?: boolean;
  /** Glyph shown when there is no photo. Default `burger`. */
  fallbackIcon?: IconName;
  /** Sizing/extra classes applied to the image surface (e.g. `h-20 w-20`). */
  className?: string;
}

