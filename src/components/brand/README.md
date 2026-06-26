# Fahman Brand Kit (Plan 05)

Logo, brand textures and flat-vector illustrations (design-spec §7). Consumed by
auth/onboarding (#06), home (#07), payment/tracking (#11/#12), empty/error
states (#02), and PWA icons (#19). **Copy-free** — the consuming screen owns all
AR/EN text (dict keys, #03).

```tsx
import { Logo, Sunburst, FoodDoodles, OnboardingIllustration, SuccessLite } from '@/components/brand';
import { FoodImage } from '@/components/ui/food-image';
```

## Logo (`logo.tsx`)
`<Logo variant?='wordmark'|'mark' size?=32 className? label?='Fahman' title? />`
— navy `text-ink` wordmark + orange `fill-brand` food-cloche mark (token-driven,
no hex). The wordmark is a brand name → stays LTR under RTL. `variant="mark"`
(the cloche) is the source glyph for #19's PWA icons.

## Textures (`textures.tsx`) — decorative, `aria-hidden`, position via `className`
- `<Sunburst/>` — amber→orange ray fan behind hero/splash logos.
- `<FoodDoodles/>` — tiled cream food-doodle **watermark at 7% opacity** (spec
  6–10%). Fills its nearest `relative` ancestor (`absolute inset-0`).
- `<DashedCurve/>` — faint dashed flourish.
- `<PeachBlob/>` — organic `brand.tint` blob (onboarding/avatar backdrops).
- `<Confetti/>` — celebratory burst, **success states only**. Inline SVG so #18
  can animate it.

## Illustrations (`illustrations.tsx`) — flat vector, lazy, no-CLS
- `<OnboardingIllustration step={1|2|3|4} />` — onboarding/splash slides.
- `<MapIllustration/>` — circular map (Location Access).
- `<SuccessWallet/>` — rich payment-success art (pair with `<Confetti/>`).
- `<SuccessLite/>` — lite token-coloured check-circle + sparkles (Withdraw
  Successful). Inline → brand-coloured + animatable.
- `<EmptyIllustration variant='cart'|'orders'|'search'|'menu'|'zones'|'generic' />`
  — fills #02 `EmptyState`'s `illustration` slot.
- `<ErrorIllustration/>` — fills #02 `ErrorState`.
- `<CreditCardIllustration/>` — flat card (payment/add-card).

All decorative (`aria-hidden`) by default; pass `title` for an accessible name.

## FoodImage (`@/components/ui/food-image.tsx`)
`<FoodImage src? alt shape?='circle'|'rounded'|'hero' plate? overhang? fallbackIcon? className? />`
— preserves the CSS `background-image` pattern (no remote `next/image` config),
adds the amber gradient "plate" (`bg-hero-gradient` + `shadow-card`), circular/
rounded/hero crops, dish overhang, and an **SVG fallback replacing `🌯`**. Pass
`alt` as a dict string.

## Colour note for the SVG assets
React components use **Plan 01 token classes** (`fill-brand`, `text-ink`,
`bg-hero-gradient`, `stroke-onColor`). The raw `/public/illustrations/*` and
`/public/textures/*` SVGs **bake the spec-exact hex** internally because static
assets cannot read Tailwind tokens — these values mirror the §1 palette
(`brand #F5811F`, `brand.deep #E5721A`, `amber.from #FFB347`, `ink #1B1C2A`,
`brand.tint #FCE3D3`, `success #27AE60`, `danger #EF4444`, confetti
lavender/yellow/peach). If Plan 01 ever re-tunes a hex, update the assets here.
