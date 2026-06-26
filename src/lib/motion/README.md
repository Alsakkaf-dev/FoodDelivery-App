# Motion & Interaction System (Engineer #18)

The app-wide motion language. **Self-contained** — no animation dependency: Web Animations API
(WAAPI) for one-shots/loops + Tailwind's built-in `duration-*`/`ease-*`/`motion-reduce:` utilities
for declarative state. Motion **values** live in [`tokens.ts`](./tokens.ts) / [`easings.ts`](./easings.ts).
`prefers-reduced-motion` and RTL mirroring are baked in.

## Where things live
- **Values / helpers / hooks:** `@/lib/motion` — `DURATION`, `EASE`, `SCALE`, `animateVariant`,
  `flyToCart`, `burstConfetti`, `useReducedMotion`, `useDirection`, the `*Variant` descriptors.
- **React components:** `@/components/ui/motion-primitives` — `Pressable`, `Pop`, `TabUnderline`,
  `useSheetTransition`/`SheetMotion`/`Scrim`, `ScaleIn`, `SuccessCheck`, `Confetti`, `BadgePop`,
  `useFlyToCart`, `TickNumber`, `PulseRings`, `SplashSequence`, `OnboardingSlide`, `CarouselDots`,
  plus class constants `PRESS_CLASS`, `CROSSFADE_CLASS`, `SHEET_SURFACE_CLASS`, `SHEET_SCRIM_CLASS`.

## Golden rules
1. **Timing:** stay in the 150–250ms ease-out band — use `DURATION.*` + `EASE.out`, never raw ms.
2. **Only `transform`/`opacity`** animate — never width/height/top/left — so there is no layout jank.
3. **Reduced motion is automatic.** WAAPI helpers/components skip *delight* motion; `motion-reduce:`
   Tailwind variants disable CSS transitions. The element always ends in its final, visible state —
   never convey information by motion alone.
4. **RTL:** horizontal motion is sign-flipped via `useDirection().sign`. Use logical CSS props
   (`ms/me/ps/pe/start/end`) in your own markup — never `left/right`.
5. Light theme only. Don't fork these — request a new variant/prop here (#18) via `TEAM_STATUS.md`.

## Cookbook (spec §6)
| Animation | Use |
|---|---|
| Button press | add `PRESS_CLASS` to any pressable, or wrap one child in `<Pressable>` |
| Chip/tab select pop | `const ref = useChipSelect<HTMLButtonElement>(selected)` → `ref` on the chip; add `CROSSFADE_CLASS` for the fill |
| Tab underline slide | `<TabUnderline activeIndex={i} count={n} />` |
| Bottom sheet | `const { mounted, state } = useSheetTransition(open)` → `<Scrim state=… onClick=onClose/>` + `<SheetMotion state=…>…</SheetMotion>` |
| Promo/success scale-in | `<ScaleIn>…</ScaleIn>` |
| Success check spring | `<SuccessCheck><Icon name="check-circle"/></SuccessCheck>` |
| Confetti (success only) | `<Confetti fire={success} />` inside a `relative` container |
| Add-to-cart fly + badge | `const fly = useFlyToCart(); fly(imgEl, cartEl, () => bump())` + wrap the badge in `<BadgePop count=…>` |
| Stepper number tick | `<TickNumber value={qty} />` (compose the ± buttons with `<Pressable>`) |
| Live-tracking pulse | `<PulseRings />` behind the destination pin |
| Splash sequence | `<SplashSequence doodle=… logo=… sunburst=… onComplete=…/>` |
| Onboarding slide + dots | `<OnboardingSlide active={i===current}>…</OnboardingSlide>` + `<CarouselDots count index onDotClick/>` |

All components are **headless** — they wrap *your* markup and assume nothing about it, so primitives
(#02) and feature screens compose them without forking. Reduced-motion + RTL come for free.
