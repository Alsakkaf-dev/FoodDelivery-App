# UI Primitives (Plan 02) — API reference

The shared component library every feature engineer **imports and composes** (never forks).
Import from `@/components/ui` (barrel) or the individual module. All primitives are
**token-driven** (no hardcoded hex/px-radii/shadow — they consume Plan 01's classes),
**RTL-mirrored** (logical CSS props; directional icons auto-mirror), **≥44px tap**, and
**light-theme only**. Copy is **caller-supplied** — pass `t.<key>` strings in as props
(primitives carry only English fallbacks for a few aria labels, overridable).

Icons come from Plan 05 via `<Icon name="…"/>` (`IconName` union). Where a prop is typed
`IconName`, pass one of the contracted names (FOUNDATION_CONTRACTS.md §3).

> Need a new prop or a missing primitive? File a request in `TEAM_STATUS.md` → REQUESTS
> (do **not** fork a primitive or inline a parallel button/chip/stepper/sheet).

## Restyled (existing API + asserted strings preserved)
| Component | Props | Notes |
|---|---|---|
| `StatusBadge` | `{ status: ShopStatus; lang? }` | success/warning/muted semantics |
| `OrderStatusChip` | `{ status: OrderStatus; lang? }` | brand/success/danger semantics |
| `QtyCounter` | `{ remaining; total; lang? }` | keeps `role="progressbar"` |
| `Timeline` | `{ status: OrderStatus; lang? }` | brand-active connected nodes |
| `Stepper` | `{ value; onChange; min?=0; max?=50 }` | dark pill; `aria-label` decrease/increase |
| `LangToggle` | `{ current: 'en'\|'ar' }` | uses shared `setLocaleCookie` |
| `Loading` | `{ label? }` | `role="status"` |
| `Skeleton` | `{ lines?=3; className? }` | N shimmer bars |
| `EmptyState` | `{ title; hint?; icon?; illustration?; action? }` | illustration/action are new |
| `ErrorState` | `{ message; onRetry?; retryLabel? }` | localized retry fallback |
| `OfflineBanner` | `{ label? }` | sticky, `z-50` (frozen) |

## Buttons & actions (`buttons.tsx`, `badge.tsx`)
- `PrimaryButton` / `OutlineButton` (`dashed?` for "+ ADD NEW") / `GhostOnColor` —
  `{ fullWidth?; loading?; leadingIcon?: IconName; trailingIcon?: IconName } & button attrs`.
- `TextAction` — `{ tone?: 'brand'|'success'; underline?; trailingIcon?: IconName; href? } & button attrs`.
- `IconButton` — `{ variant?: 'nav'|'dark'|'add'; icon?: IconName; 'aria-label' (required) } & button attrs`.
- `FloatingIconButton` — `{ icon: IconName; active? } & button attrs` (over imagery).
- `Badge` — `{ count?; max?=99; dot?; showZero?; 'aria-label'? }` (orange count pill; consumer positions it).

## Inputs (`inputs.tsx`) — `'use client'`
- `FilledInput` — `{ label?; hint?; error?; trailingIcon?: IconName; multiline?; rows?; showPasswordLabel?; hidePasswordLabel? } & input attrs`. `type="password"` auto-adds the eye toggle.
- `OtpInput` — `{ length?=4; value; onChange; onResend?; resendLabel?; resendSeconds?=30; formatResendIn?; autoFocus?; inputMode? }` (bound to one string).
- `Checkbox` — `{ checked; onChange; label?; disabled?; id? }`.
- `UploadTile` — `{ onFiles?; accept?; multiple?; label?; hint?; preview?; disabled? }` (wraps a hidden file input).

## Chips & selectable (`chips.tsx`)
- `Chip` / `Pill` — `{ selected?; onToggle?; leadingIcon?: IconName } & button attrs` (outline↔orange; pass `role` for tab/radio).
- `SelectChip` — circular gray↔orange toggle (sizes, `$`/`$$`/`$$$`).
- `SelectTile` — `{ selected?; onSelect?; title; subtitle?; leading?; trailing?; role?='radio' }` (orange-border + check).
- `CategoryChip` — `{ icon: IconName; label; active?; onClick? }` (active = gradient disc).
- `OverlayChip` — `{ leadingIcon?: IconName }` dark translucent over imagery.
