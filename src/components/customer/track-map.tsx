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

