import type { ChartDataPoint } from "./types";

export type CurveType = "linear" | "smooth" | "monotone";

/**
 * Builds an SVG path string from data points using the specified curve type.
 */
export const buildPath = (
  data: ChartDataPoint[],
  xScale: (v: number) => number,
  yScale: (v: number) => number,
  curve: CurveType
): string => {
  if (data.length === 0) return "";
  const points = data.map(p => ({ x: xScale(p.x), y: yScale(p.y) }));
  if (points.length <= 2)
    return points
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
      .join(" ");
  if (curve === "smooth") return buildSplinePath(points);
  if (curve === "monotone") return buildMonotonePath(points);
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
};

/**
 * Builds an area path: line path closed to a baseline Y position.
 */
export const buildAreaPath = (
  data: ChartDataPoint[],
  xScale: (v: number) => number,
  yScale: (v: number) => number,
  baselineY: number,
  curve: CurveType
): string => {
  if (data.length === 0) return "";
  const linePath = buildPath(data, xScale, yScale, curve);
  const lastX = xScale(data[data.length - 1].x);
  const firstX = xScale(data[0].x);
  return `${linePath} L${lastX},${baselineY} L${firstX},${baselineY} Z`;
};

/**
 * Builds a stacked area path between a top line and a bottom line.
 */
export const buildStackedAreaPath = (
  topData: { x: number; y: number }[],
  bottomData: { x: number; y: number }[],
  xScale: (v: number) => number,
  yScale: (v: number) => number,
  curve: CurveType
): string => {
  if (topData.length === 0) return "";
  const topPath = buildPath(topData as ChartDataPoint[], xScale, yScale, curve);
  // Bottom line reversed (right to left) with same curve, then strip the leading M to connect
  const reversed = [...bottomData].reverse();
  const bottomPath = buildPath(
    reversed as ChartDataPoint[],
    xScale,
    yScale,
    curve
  );
  // Replace leading "M" with "L" so it connects to the top path
  return `${topPath} ${bottomPath.replace(/^M/, "L")} Z`;
};

/** Catmull-Rom to cubic bezier spline. */
const buildSplinePath = (points: { x: number; y: number }[]): string => {
  if (points.length < 2) return "";
  if (points.length === 2)
    return `M${points[0].x},${points[0].y} L${points[1].x},${points[1].y}`;

  let path = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    const t = 1 / 6;
    const cp1x = p1.x + (p2.x - p0.x) * t;
    const cp1y = p1.y + (p2.y - p0.y) * t;
    const cp2x = p2.x - (p3.x - p1.x) * t;
    const cp2y = p2.y - (p3.y - p1.y) * t;
    path += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return path;
};

/**
 * Monotone cubic spline (Fritsch-Carlson) — no overshoot beyond adjacent values.
 */
const buildMonotonePath = (points: { x: number; y: number }[]): string => {
  const n = points.length;
  if (n < 2) return "";
  if (n === 2)
    return `M${points[0].x},${points[0].y} L${points[1].x},${points[1].y}`;

  const dx: number[] = [];
  const dy: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(points[i + 1].x - points[i].x);
    dy.push(points[i + 1].y - points[i].y);
    m.push(dy[i] / (dx[i] || 1));
  }

  const tangents: number[] = [m[0]];
  for (let i = 1; i < n - 1; i++) {
    tangents.push(m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2);
  }
  tangents.push(m[n - 2]);

  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
    } else {
      const a = tangents[i] / m[i];
      const b = tangents[i + 1] / m[i];
      const s = a * a + b * b;
      if (s > 9) {
        const t = 3 / Math.sqrt(s);
        tangents[i] = t * a * m[i];
        tangents[i + 1] = t * b * m[i];
      }
    }
  }

  let path = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const d = dx[i] / 3;
    const cp1x = points[i].x + d;
    const cp1y = points[i].y + tangents[i] * d;
    const cp2x = points[i + 1].x - d;
    const cp2y = points[i + 1].y - tangents[i + 1] * d;
    path += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${points[i + 1].x},${points[i + 1].y}`;
  }
  return path;
};
