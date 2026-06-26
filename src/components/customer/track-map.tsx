import type { OrderStatus } from '@/types/db';

// CMP-C-12 — MapKit: the decorative live-tracking basemap (SCR-C-06, FR-C-11).
// Engineer #12 owns this (FOUNDATION_CONTRACTS §2: track-map/MapKit → #12); the
// route + marker pattern is reusable by the rider/operator maps later (#15/#17).
//
// It is a pure, deterministic inline SVG — no map API, no network, no client hooks —
// so it ALWAYS renders and degrades gracefully (a missing tile service can never
// blank it). Light theme only. Colours come from #01 token classes via
// `fill="currentColor"` + a `text-*` class per layer (no hardcoded hex). The
// destination pulse uses Tailwind's built-in `motion-safe:animate-ping`, so it is
// automatically still under `prefers-reduced-motion`. The basemap art is abstract,
// so it is intentionally NOT mirrored under RTL (mirroring an abstract map conveys
// nothing) — the surrounding chrome mirrors via logical props instead.

// Orthogonal "delivered route" from the shop (origin, bottom-start) up to the
// customer (destination, top-end). pathLength is normalised to 1 so the solid
// segment can grow with status via a simple dash, independent of real length.
const ROUTE = 'M62 356 V300 H112 V250 H164 V205 H250 V160 H300';

// Fraction of the route drawn solid for each lifecycle status (purely visual).
const PROGRESS: Record<OrderStatus, number> = {
  new: 0.05,
  confirmed: 0.15,
  preparing: 0.3,
  ready: 0.5,
  out_for_delivery: 0.82,
  delivered: 1,
  cancelled: 0,
};

export function TrackMap({
  status,
  lang = 'en',
  label,
}: {
  status: OrderStatus;
  lang?: 'en' | 'ar';
  label?: string;
}) {
  const progress = PROGRESS[status] ?? 0;
  const alt =
    label ?? (lang === 'ar' ? 'خريطة التوصيل توضح حالة طلبك' : 'Delivery map showing your order status');

  return (
    <svg
      viewBox="0 0 375 420"
      role="img"
      aria-label={alt}
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
    >
      {/* basemap canvas */}
      <rect x="0" y="0" width="375" height="420" className="text-surface-alt" fill="currentColor" />

      {/* peach landmass blobs */}
      <g className="text-brand-tint" fill="currentColor">
        <ellipse cx="40" cy="58" rx="56" ry="42" />
        <ellipse cx="338" cy="300" rx="60" ry="52" />
      </g>

      {/* green park blobs */}
      <g className="text-success/15" fill="currentColor">
        <ellipse cx="305" cy="92" rx="72" ry="58" />
        <ellipse cx="58" cy="190" rx="52" ry="44" />
        <ellipse cx="250" cy="372" rx="86" ry="55" />
      </g>

      {/* white road network */}
      <g className="text-white" stroke="currentColor" strokeWidth="14" strokeLinecap="round" fill="none">
        <path d="M-20 120 H395" />
        <path d="M-20 275 H395" />
        <path d="M130 -20 V440" />
        <path d="M275 -20 V440" />
        <path d="M255 440 L395 250" />
      </g>

      {/* route — faint full path + solid travelled segment */}
      <path
        d={ROUTE}
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-brand/25"
      />
      <path
        d={ROUTE}
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={`${progress} 1`}
        className="text-brand"
      />

      {/* origin pin — the shop (red) */}
      <circle cx="62" cy="356" r="15" className="text-danger" fill="currentColor" />
      <circle cx="62" cy="356" r="6.5" className="text-white" fill="currentColor" />
      <circle cx="62" cy="356" r="3" className="text-danger" fill="currentColor" />

      {/* destination — the customer (orange, pulsing concentric rings) */}
      <g>
        <circle cx="300" cy="156" r="30" className="text-brand/10" fill="currentColor" />
        <circle cx="300" cy="156" r="20" className="text-brand/20" fill="currentColor" />
        <circle
          cx="300"
          cy="156"
          r="16"
          className="text-brand/30 motion-safe:animate-ping"
          fill="currentColor"
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />
        <circle cx="300" cy="156" r="11" className="text-brand" fill="currentColor" />
        <circle cx="300" cy="156" r="4.5" className="text-white" fill="currentColor" />
      </g>
    </svg>
  );
}
