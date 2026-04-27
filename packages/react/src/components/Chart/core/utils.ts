import type { DashStyle } from "./types";

/**
 * Converts a DashStyle to an SVG stroke-dasharray value.
 */
export const dashStyleToArray = (style: DashStyle): string => {
  switch (style) {
    case "dash":
      return "6 4";
    case "dot":
      return "2 3";
    case "dash-dot":
      return "6 3 2 3";
    case "long-dash":
      return "10 4";
    case "solid":
    default:
      return "none";
  }
};

/** A segment of a line with a specific color/dash, defined by pixel coordinates. */
export interface ZoneSegment {
  points: { x: number; y: number }[];
  color: string;
  dashStyle?: DashStyle;
}

/**
 * Splits data points into segments based on Y-value color zones.
 *
 * @description Zones are sorted by value ascending. Each zone applies to
 * Y values below its threshold. The last zone (or series default) applies
 * to values above all thresholds. Intersection points are interpolated
 * so segments connect cleanly at zone boundaries.
 */
export const splitByZones = (
  data: { x: number; y: number }[],
  zones: { value: number; color: string; dashStyle?: DashStyle }[],
  defaultColor: string,
  defaultDash?: DashStyle
): ZoneSegment[] => {
  if (data.length < 2 || zones.length === 0) return [];

  const sorted = [...zones].sort((a, b) => a.value - b.value);

  const getZone = (y: number): { color: string; dashStyle?: DashStyle } => {
    for (const z of sorted) {
      if (y < z.value) return z;
    }
    return { color: defaultColor, dashStyle: defaultDash };
  };

  const segments: ZoneSegment[] = [];
  let current: ZoneSegment = { points: [data[0]], ...getZone(data[0].y) };

  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1];
    const curr = data[i];
    const prevZone = getZone(prev.y);
    const currZone = getZone(curr.y);

    if (prevZone.color === currZone.color) {
      current.points.push(curr);
    } else {
      const crossings: { t: number }[] = [];
      for (const z of sorted) {
        if ((prev.y < z.value && curr.y >= z.value) || (prev.y >= z.value && curr.y < z.value)) {
          crossings.push({ t: (z.value - prev.y) / (curr.y - prev.y) });
        }
      }
      crossings.sort((a, b) => a.t - b.t);

      for (const c of crossings) {
        const ix = prev.x + c.t * (curr.x - prev.x);
        const iy = prev.y + c.t * (curr.y - prev.y);
        const intersection = { x: ix, y: iy };
        current.points.push(intersection);
        segments.push(current);
        current = { points: [intersection], ...getZone(iy + (curr.y > prev.y ? 0.001 : -0.001)) };
      }
      current.points.push(curr);
    }
  }

  if (current.points.length > 1) segments.push(current);
  return segments;
};
