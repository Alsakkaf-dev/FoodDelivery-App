# AUDIT MATRIX — per-screen visual-vs-spec sweep (Engineer #20)

One row per screen. Columns are checked when that owner reaches DONE and #20 verifies.
Legend: ✅ pass · ⚠️ defect (see DEFECT_LOG) · ⬜ not yet audited (owner not DONE) · — n/a.
Columns: **Vis** visual-vs-spec · **Tok** tokens+primitives reused (no hardcoded hex/forked) ·
**Rsp** responsive (320/768/desktop, no h-overflow, ≥44px) · **A11y** contrast/focus/ARIA/landmarks ·
**RTL** dir=rtl mirrors · **i18n** AR+EN, no hardcoded copy · **St** loading/empty/error/offline states.

## Customer
| Route | Owner | Exists | New_UI ref | Vis | Tok | Rsp | A11y | RTL | i18n | St |
|---|---|---|---|---|---|---|---|---|---|---|
| `/splash` | #06 | net-new | Splash Page_01/02 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | — |
| `/onboarding` | #06 | net-new | Onboarding_01–04 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | — |
| `/login` | #06 | yes | Log In / Verification / Forgot Password | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| `/signup`, `/forgot-password`, `/location-access` | #06 | net-new | Sign Up / Forgot / Location Access | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | — |
| `/` (home) | #07 | yes | Home V / V-1 / V-2 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| `/search` | #08 | net-new | Search | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| `/categories` | #08 | net-new | Food - Burgers | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| `/menu` | #09 | yes | Menu / Food - Burgers | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| `/menu/[id]` | #09 | yes | Food Details_01/02 / Chef | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| `/cart` | #10 | yes (DONE) | My Cart / Edit Cart | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| `/checkout` | #11 | yes | Address / Add New Address / Location | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| `/checkout/payment` | #11 | yes | Payment Method / Add Card / Success | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| `/orders/[id]` | #12 | yes | Tracking Order / Call / Message | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| `/history` (→ `/orders?tab=history`) | #13 | yes | My Orders_01/02 | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| reviews (`/history/[id]/review`) | #13 | net-new | Review Screen | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | — |
| `/account` + edit | #14 | net-new | Personal Profiles / Edit Profile | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| `/account/addresses` | #14 | net-new | Address / Add New Address | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| `/notifications` | #14 | net-new | Notification | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| `/messages` | #14 | net-new | Massages | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| `/offline` | #06/Found. | yes | (static) | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ✅ static | — |

## Operator
| Route | Owner | Exists | New_UI ref | Vis | Tok | Rsp | A11y | RTL | i18n | St |
|---|---|---|---|---|---|---|---|---|---|---|
| `/operator` | #15 | yes | Seller Dashboard Home | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| `/operator/board` | #15 | yes | Running Orders | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| `/operator/orders/[id]` | #15 | yes | (operator order detail) | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| `/operator/menu` + add/edit | #16 | yes / net-new | My Food / Add new Items | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| `/operator/setup` | Found. | yes | (config) | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| `/operator/broadcast` | #16 | yes | (text broadcast) | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| `/operator/end-of-day` | #15/#16 | yes | Payment Withdraw Successful | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| `/operator/wallet` | #16 | net-new | Payment Withdraw Successful | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

## Rider
| Route | Owner | Exists | New_UI ref | Vis | Tok | Rsp | A11y | RTL | i18n | St |
|---|---|---|---|---|---|---|---|---|---|---|
| `/rider` | #17 (shell #04) | yes | Running Orders | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| `/rider/[id]` | #17 | yes | Delivery Man Call / Message | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

