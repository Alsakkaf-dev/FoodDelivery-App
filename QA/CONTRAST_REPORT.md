# CONTRAST REPORT — Fahman Orders new palette (Engineer #20)

Computed by `tests/unit/a11y-contrast.test.ts` (WCAG 2.x relative-luminance ratio) over the
**real token hexes** in `tailwind.config.ts`. WCAG AA: **4.5:1** normal text · **3.0:1** large
(≥18.66px bold / 24px) text & graphical objects. Values below are reference; the test is authoritative.

## ✅ Pass (must stay ≥ AA — regression-guarded)
| Foreground | Background | Ratio | Use |
|---|---|---|---|
| `ink #1B1C2A` | white | ≈ 16.8 | Headings, bold dark text |
| `body #5B5F6B` | white | ≈ 6.3 | Paragraph / secondary text |
| white | `ink-header #1B1B2F` | ≈ 16.x | Auth dark hero |
| white | `dark-cta #1E1F2B` | ≈ 15.x | Dark CTA bars, steppers |
| white | `bg-dark #16171F` | ≈ 17.x | Immersive cart surface |

## ⚠️ Below AA (sub-AA findings → DEFECT_LOG)
| Foreground | Background | Ratio | Threshold | Defect |
|---|---|---|---|---|
| white | `brand #F5811F` | ≈ 2.6 | 4.5 | QA-001 |
| `brand #F5811F` | white | ≈ 2.6 | 4.5 | QA-002 |
| `muted #9AA0AD` | white | ≈ 2.6 | 4.5 | QA-003 |
| `success #27AE60` | white | ≈ 2.9 | 4.5 | QA-004 |
| `danger #EF4444` | white | ≈ 3.8 | 4.5 | QA-005 |
| `star #F5A623` | white | ≈ 2.0 | 3.0 | QA-006 |
| `info-blue #3D7BF2` | white | ≈ 4.0 | 4.5 | QA-007 |
| `warning #F5A623` | white | ≈ 2.0 | 4.5 | QA-008 |

## Remediation guidance (usage-level — the token hexes are the brand)
- **Orange CTAs (QA-001):** the design uses white-on-orange buttons everywhere. Either switch
  on-orange text to `ink`/dark, or have the Owner accept a documented brand exception (many real
  brands ship sub-AA orange CTAs). This is the headline call for #01 + the Owner.
- **Orange text/links (QA-002):** only use `text-brand` for ≥18.66px bold or with an underline; for
  body copy keep dark text and reserve orange for the single accent per row (spec §2 hierarchy rule).
- **Captions (QA-003):** prefer `text-body` for anything readable; `text-muted` for ≥AA-large or purely decorative.
- **Semantic colours (QA-004/005/008):** use on tints or as large/bold; not as small standalone text.
- **Graphical (QA-006/007):** add an off-state boundary so star/icon tints meet the 3:1 non-text rule.
