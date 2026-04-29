/**
 * Radar geometry utilities for RadarChart.
 *
 * @description All coordinate math for radar/spider charts lives here.
 * Chart components must NOT contain polygon or grid calculations directly.
 */

/** A point in polar coordinates converted to cartesian for SVG rendering. */
export interface RadarPoint {
  /** X coordinate. */
  x: number;
  /** Y coordinate. */
  y: number;
  /** Original value. */
  value: number;
  /** Axis index. */
  axisIndex: number;
  /** Angle in radians. */
  angle: number;
}

/**
 * Computes the angle for each axis, evenly distributed around the circle.
 * Starts at -PI/2 (top) and goes clockwise.
 *
 * @param count - Number of axes.
 */
export const axisAngles = (count: number): number[] => {
  const step = (2 * Math.PI) / count;
  return Array.from({ length: count }, (_, i) => -Math.PI / 2 + i * step);
};

/**
 * Converts a value on a given axis to cartesian coordinates.
 *
 * @param cx - Center X.
 * @param cy - Center Y.
 * @param radius - Maximum radius.
 * @param angle - Axis angle in radians.
 * @param value - Data value.
 * @param min - Scale minimum.
 * @param max - Scale maximum.
 */
export const polarToCartesian = (
  cx: number,
  cy: number,
  radius: number,
  angle: number,
  value: number,
  min: number,
  max: number
): { x: number; y: number } => {
  const ratio = max === min ? 0 : (value - min) / (max - min);
  const r = radius * Math.max(0, Math.min(1, ratio));
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
};

/**
 * Computes radar points for a series of values.
 *
 * @param values - One value per axis.
 * @param cx - Center X.
 * @param cy - Center Y.
 * @param radius - Maximum radius.
 * @param angles - Angle per axis (from axisAngles).
 * @param min - Scale minimum.
 * @param max - Scale maximum.
 */
export const computeRadarPoints = (
  values: number[],
  cx: number,
  cy: number,
  radius: number,
  angles: number[],
  min: number,
  max: number
): RadarPoint[] =>
  values.map((value, i) => {
    const angle = angles[i] ?? 0;
    const { x, y } = polarToCartesian(cx, cy, radius, angle, value, min, max);
    return { x, y, value, axisIndex: i, angle };
  });

/**
 * Builds an SVG polygon path string from radar points.
 *
 * @param points - Array of radar points.
 */
export const radarPolygonPath = (points: RadarPoint[]): string => {
  if (points.length === 0) return "";
  return (
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") +
    " Z"
  );
};

/**
 * Builds a grid polygon (or circle) path at a given level.
 *
 * @param cx - Center X.
 * @param cy - Center Y.
 * @param radius - Radius at this level.
 * @param angles - Axis angles.
 * @param shape - "polygon" or "circle".
 */
export const gridPath = (
  cx: number,
  cy: number,
  radius: number,
  angles: number[],
  shape: "polygon" | "circle"
): string => {
  if (shape === "circle") {
    return `M ${cx + radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx - radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx + radius} ${cy} Z`;
  }
  return (
    angles
      .map((a, i) => {
        const x = cx + radius * Math.cos(a);
        const y = cy + radius * Math.sin(a);
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ") + " Z"
  );
};
