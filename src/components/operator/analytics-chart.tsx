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

