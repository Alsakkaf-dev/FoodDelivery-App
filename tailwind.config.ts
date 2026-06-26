import type { Config } from 'tailwindcss';

/**
 * Fahman Orders — design tokens (NEW orange/amber design system).
 * SINGLE SOURCE OF TRUTH — Plan 01. Consumers use Tailwind token classes only;
 * no component hardcodes hex / px radii / shadows.
 * Frozen interface: The_Master_Plan/FOUNDATION_CONTRACTS.md §1.
 * Human-readable map: The_Master_Plan/TOKENS_REFERENCE.md.
 *
 * Legacy keys (rust / slate / muted / cream / line) are RECOLORED IN PLACE to the
 * new palette so existing `text-rust` / `bg-cream` / `border-line` consumers adopt
 * the new look with ZERO component edits. `rust` is NOT renamed to `brand`
 * (cross-surface refs preserved per Contract §B); `brand` is added as the canonical
 * new alias. Legacy status keys (open / soldout / teal) are kept untouched —
 * status.tsx still consumes them; migrating their semantics is #02's call.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── NEW canonical brand palette ──
        brand: { DEFAULT: '#F5811F', deep: '#E5721A', tint: '#FCE3D3', faint: '#FFF4EC' },
        amber: { from: '#FFB347', to: '#F89B3C' },
        ink: { DEFAULT: '#1B1C2A', header: '#1B1B2F' },
        dark: { cta: '#1E1F2B' },
        surface: { DEFAULT: '#FFFFFF', input: '#F1F3F6', alt: '#F6F7F9' },
        bg: { DEFAULT: '#FFFFFF', warm: '#FFFBF7', dark: '#16171F', canvas: '#F4F6F8' },
        // Flat aliases (R-2): make `bg-warm` (#07) + `bg-canvas` (#15) resolve
        // alongside `bg-bg-warm` / `bg-bg-canvas` / `bg-bg-dark` from the nested group.
        warm: '#FFFBF7',
        canvas: '#F4F6F8',
        body: '#5B5F6B',
        success: '#27AE60',
        warning: '#F5A623',
        danger: '#EF4444',
        star: { DEFAULT: '#F5A623', off: '#C9CDD4' },
        info: { blue: '#3D7BF2', purple: '#7C5CFC' },
        social: { facebook: '#3B5BA9', twitter: '#1DA1F2', apple: '#111111' },
        onColor: '#FFFFFF',

        // ── Legacy keys RECOLORED IN PLACE (orange adoption, zero component edits) ──
        rust: { DEFAULT: '#F5811F', dark: '#E5721A', soft: '#FCE3D3' },
        slate: { DEFAULT: '#1B1C2A', 2: '#323F4B' },
        muted: '#9AA0AD',
        cream: '#FFFBF7',
        line: '#E6E7EB',

        // ── Legacy status keys KEPT (status.tsx semantics — do not recolor here) ──
        open: '#2F8F4F',
        soldout: '#C9821F',
        teal: '#2E8B7B',
      },
      borderRadius: {
        // legacy (back-compat) — keep so existing rounded-card / rounded-control work
        card: '12px',
        control: '8px',
        // new scale
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '28px',
        pill: '9999px',
      },
      boxShadow: {
        card: '0 8px 24px rgba(20,20,40,0.06)',
        floating: '0 4px 12px rgba(245,129,31,0.25)',
        sheet: '0 -8px 30px rgba(20,20,40,0.10)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #FFB347 0%, #F5811F 100%)',
        'promo-gradient': 'linear-gradient(135deg, #FFB347 0%, #F5811F 100%)',
      },
      // Expanded type scale. Existing text-h1/h2/title/caption keep working (grow slightly).
      // NOTE: `body` is intentionally both a color key and a font-size key, so
      // `text-body` carries body size (15px/1.5) + body color (#5B5F6B). See TOKENS_REFERENCE.md.
      fontSize: {
        display: ['32px', { lineHeight: '38px', fontWeight: '800' }],
        h1: ['24px', { lineHeight: '30px', fontWeight: '700' }],
        h2: ['18px', { lineHeight: '24px', fontWeight: '700' }],
        title: ['16px', { lineHeight: '22px', fontWeight: '700' }],
        headerTitle: ['16px', { lineHeight: '22px', fontWeight: '600' }],
        body: ['15px', { lineHeight: '1.5' }],
        label: ['12px', { lineHeight: '16px', fontWeight: '600', letterSpacing: '0.08em' }],
        button: ['15px', { lineHeight: '20px', fontWeight: '700', letterSpacing: '0.05em' }],
        link: ['14px', { lineHeight: '18px', fontWeight: '700' }],
        caption: ['12px', { lineHeight: '16px' }],
      },
      fontFamily: {
        // var names preserved; fonts are loaded in-lane in globals.css (Poppins + Cairo).
        sans: ['var(--font-sans)', 'system-ui', 'Arial', 'sans-serif'],
        arabic: ['var(--font-arabic)', 'Tahoma', 'Arial', 'sans-serif'],
      },
      minHeight: { tap: '44px' },
      minWidth: { tap: '44px' },
    },
  },
  plugins: [],
};
