# Fahman Icon Set (Plan 05)

Thin (1.5–2px) rounded-stroke line icons that replace **every emoji** in the
app's chrome/state UI (design-spec §7). Hand-authored SVG — **no icon library
dependency**, fully tree-shakeable.

## Consume

```tsx
// By name — when you hold a string (nav items, EmptyState, list rows):
import { Icon } from '@/components/icons';
<Icon name="home" className="text-brand" />

// Direct — static call-sites (best tree-shaking):
import { HomeIcon } from '@/components/icons';
<HomeIcon className="text-muted" title="Home" />
```

- **Colour** comes from `currentColor` → set a Tailwind **token** text class
  (`text-brand` active/brand · `text-muted` neutral · `text-ink` headings ·
  `text-star` ratings · `text-danger` destructive). Never pass a hex.
- **Size** defaults to **24**. When an icon is the sole control, wrap it in a
  ≥44px tap target (`min-h-tap min-w-tap`). Props: `size`, `strokeWidth`,
  `title`, `className`, + any `<svg>` attr.
- **Accessibility:** decorative by default (`aria-hidden`). Pass `title` to
  expose `role="img"` + `<title>` + `aria-label` (use a **dict string**, #03).
- **RTL:** directional glyphs (`chevron-left/right/start`, `arrow-left`, `send`)
  auto-mirror via `rtl:-scale-x-100`. Everything else is symmetric.

## `IconName` union (superset of FOUNDATION_CONTRACTS §3)

`ICON_REGISTRY: Record<IconName, …>` guarantees every name resolves; importing
`IconName` from `@/components/icons` gives consumers a compile-time check.

- **nav/chrome:** home · search · menu · bag · cart · user · clipboard ·
  settings · utensils · moon · scooter · bike · store
- **actions:** plus · minus · check · close · trash · edit · share · filter ·
  sliders · camera · upload · cloud-upload · eye · eye-off · chevron-left ·
  chevron-right · chevron-down · chevron-start · arrow-left · send · heart ·
  heart-filled · refresh · reset
- **meta/status/contact:** star · star-filled · truck · clock · map-pin ·
  navigation · wallet · credit-card · bell · mail · phone · message · info ·
  alert · check-circle · home-address · briefcase · mic · mic-off · speaker ·
  volume · phone-off · flame
- **social:** facebook · twitter · apple · google
- **food/ingredient:** burger · fries · drumstick · wrap · pizza · drink ·
  bowl · coffee

> Need a name not here? File a request in `TEAM_STATUS.md` → REQUESTS. #05 adds
> it (never invent a parallel set in a consumer).

## Emoji → icon migration map (for the owning engineers)

#05 ships the icons; the **file owner** swaps the emoji in their own lane
(#04 nav/items.ts, #02 ui/states.tsx EmptyState, feature plans for their
screens). Recommended replacements:

| Emoji | Where (today) | Replace with |
|---|---|---|
| 🏠 | nav home | `name="home"` |
| 🔍 | nav menu/search | `name="search"` (or `menu`) |
| 🛍️ | nav orders | `name="bag"` |
| 👤 | nav account/history | `name="user"` |
| 📋 | operator board | `name="clipboard"` |
| ⚙️ | operator setup | `name="settings"` |
| 🍽️ | operator menu / EmptyState default | `name="utensils"` / `<EmptyIllustration variant="menu"/>` |
| 🌙 | operator end-of-day | `name="moon"` |
| 🛵 | rider nav / empty | `name="scooter"` / `<EmptyIllustration/>` |
| 🌯 | menu photo fallback | `<FoodImage/>` (built-in SVG fallback) |
| ✓ ✅ 🏁 | status / timeline / rider done | `name="check"` or `name="check-circle"` |
| 📍 | location button / zones empty | `name="map-pin"` / `<EmptyIllustration variant="zones"/>` |
| 📷 | photo upload | `name="camera"` |
| 🗺️ | open map | `name="navigation"` (or `map-pin`) |
| 📞 | call | `name="phone"` |
| 🔔 | notifications opt-in | `name="bell"` |
| ⚠️ | ErrorState | `name="alert"` / `<ErrorIllustration/>` |
| ✕ | dismiss | `name="close"` |
| 🛒 | empty cart | `name="cart"` / `<EmptyIllustration variant="cart"/>` |
| 🙏 | sold-out copy | remove glyph; keep dict copy only |

Files: `icon-base.tsx` (shell) · `nav/actions/meta/social/food.tsx` (glyphs) ·
`registry.ts` (`IconName` + `ICON_REGISTRY` + `<Icon>`) · `index.ts` (barrel).
