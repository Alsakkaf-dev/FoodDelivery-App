'use client';
import Link from 'next/link';
import { useRef, useState, useId } from 'react';

// SCR-O-01 — operator revenue analytics chart (R-7: owned by #15, NOT a #02 primitive).
// Presentational, prop-driven, ZERO new npm deps: an inline-SVG orange spline with a
// soft gradient area-fill, a dark value tooltip + marker, and an hourly x-axis. Daily
// data is real (computed by the dashboard from boardList); Weekly/Monthly have no frozen
// source yet, so selecting them shows an honest empty state (no fabricated numbers).
// Token-driven only (fill-/stroke- utilities + currentColor gradient via the svg's
// text-brand color) — no hardcoded hex/px-radii. The plot is wrapped dir="ltr" so the
// time axis stays chronological; the card chrome mirrors under dir=rtl via logical props.

export type ChartRange = 'daily' | 'weekly' | 'monthly';
export interface ChartPoint {
  /** x-axis label, e.g. "10AM" */
  label: string;
  /** numeric magnitude used to plot the spline */
  value: number;
  /** localized formatted value shown in the tooltip, e.g. "RM 60" */
  display: string;
}

const W = 320;
const H = 140;
const PAD_X = 10;
const PAD_TOP = 30;
const PAD_BOTTOM = 22;

function project(points: ChartPoint[]) {
  const n = points.length;
  const values = points.map((p) => p.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_TOP - PAD_BOTTOM;
  return points.map((p, i) => ({
    x: n === 1 ? W / 2 : PAD_X + (innerW * i) / (n - 1),
    y: PAD_TOP + innerH * (1 - (p.value - min) / span),
  }));
}

// Catmull-Rom → cubic-Bézier smoothing for a natural spline (no dependency).
function splinePath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0]!.x} ${pts[0]!.y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`;
  }
  return d;
}

export function AnalyticsChart({
  title,
  total,
  points,
  rangeLabels,
  emptyLabel,
  detailsHref,
  detailsLabel,
}: {
  title: string;
  /** formatted daily revenue total, e.g. "RM 2,241" */
  total: string;
  points: ChartPoint[];
  rangeLabels: { daily: string; weekly: string; monthly: string };
  emptyLabel: string;
  detailsHref?: string;
  detailsLabel?: string;
}) {
  const gid = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [range, setRange] = useState<ChartRange>('daily');

  const hasData = range === 'daily' && points.length > 0;
  const maxIdx = points.reduce((b, p, i, a) => (p.value > a[b]!.value ? i : b), 0);
  const [hi, setHi] = useState<number | null>(null);
  const active = hi ?? maxIdx;

  const pts = hasData ? project(points) : [];
  const line = splinePath(pts);
  const area =
    pts.length >= 2
      ? `${line} L ${pts[pts.length - 1]!.x} ${H - PAD_BOTTOM} L ${pts[0]!.x} ${H - PAD_BOTTOM} Z`
      : '';

  function moveTo(clientX: number) {
    const el = svgRef.current;
    if (!el || pts.length === 0) return;
    const r = el.getBoundingClientRect();
    const vx = ((clientX - r.left) / r.width) * W;
    let best = 0;
    let bestD = Infinity;
    pts.forEach((p, i) => {
      const d = Math.abs(p.x - vx);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    setHi(best);
  }

  return (
    <section className="card space-y-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-label uppercase tracking-wide text-muted">{title}</p>
        {detailsHref && detailsLabel ? (
          <Link href={detailsHref} className="text-link font-bold text-brand">
            {detailsLabel}
          </Link>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-display font-extrabold tabular-nums text-ink">
          {range === 'daily' ? total : '—'}
        </p>
        <select
          value={range}
          onChange={(e) => {
            setRange(e.target.value as ChartRange);
            setHi(null);
          }}
          aria-label={title}
          className="min-h-tap rounded-pill border border-line bg-surface px-3 text-caption font-semibold text-body"
        >
          <option value="daily">{rangeLabels.daily}</option>
          <option value="weekly">{rangeLabels.weekly}</option>
          <option value="monthly">{rangeLabels.monthly}</option>
        </select>
      </div>

      {/* Plot stays LTR so the time axis reads chronologically in both locales. */}
      <div dir="ltr">
        {hasData ? (
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="h-40 w-full text-brand"
            role="img"
            aria-label={`${title}: ${total}`}
            onMouseMove={(e) => moveTo(e.clientX)}
            onMouseLeave={() => setHi(null)}
            onTouchMove={(e) => e.touches[0] && moveTo(e.touches[0].clientX)}
          >
            <defs>
              <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity={0.28} />
                <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* baseline */}
            <line
              x1={PAD_X}
              y1={H - PAD_BOTTOM}
              x2={W - PAD_X}
              y2={H - PAD_BOTTOM}
              className="stroke-line"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />

            {area ? <path d={area} fill={`url(#${gid})`} stroke="none" /> : null}
            {line ? (
              <path
                d={line}
                className="stroke-brand"
                strokeWidth={2.5}
                fill="none"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            ) : null}

            {/* active marker + pointer */}
            {pts[active] ? (
              <>
                <line
                  x1={pts[active]!.x}
                  y1={pts[active]!.y}
                  x2={pts[active]!.x}
                  y2={H - PAD_BOTTOM}
                  className="stroke-brand opacity-40"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  vectorEffect="non-scaling-stroke"
                />
                <circle
                  cx={pts[active]!.x}
                  cy={pts[active]!.y}
                  r={4}
                  className="fill-white stroke-brand"
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                />
                {(() => {
                  const tw = 58;
                  const th = 22;
                  const tx = Math.min(Math.max(pts[active]!.x - tw / 2, 2), W - tw - 2);
                  const ty = Math.max(pts[active]!.y - th - 8, 2);
                  return (
                    <>
                      <rect x={tx} y={ty} width={tw} height={th} rx={7} className="fill-ink" />
                      <text
                        x={tx + tw / 2}
                        y={ty + th / 2 + 4}
                        textAnchor="middle"
                        className="fill-white text-[11px] font-bold"
                      >
                        {points[active]!.display}
                      </text>
                    </>
                  );
                })()}
              </>
            ) : null}

            {/* x-axis labels (first / active / last to avoid crowding) */}
            {pts.map((p, i) =>
              i === 0 || i === pts.length - 1 || i === active ? (
                <text
                  key={i}
                  x={Math.min(Math.max(p.x, 12), W - 12)}
                  y={H - 6}
                  textAnchor="middle"
                  className="fill-muted text-[10px]"
                >
                  {points[i]!.label}
                </text>
              ) : null,
            )}
          </svg>
        ) : (
          <div className="flex h-40 items-center justify-center rounded-lg bg-surface-alt">
            <p className="text-caption text-muted">{emptyLabel}</p>
          </div>
        )}
      </div>
    </section>
  );
}
