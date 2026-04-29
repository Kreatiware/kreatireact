/**
 * Arc geometry utilities for radial charts (PieChart, DonutChart).
 *
 * @description All coordinate math for pie/donut slices lives here.
 * Chart components must NOT contain arc calculations directly.
 */

/** A computed slice with all geometry needed for rendering. */
export interface ArcSlice {
  /** Index in the original data array. */
  index: number;
  /** Start angle in radians. */
  startAngle: number;
  /** End angle in radians. */
  endAngle: number;
  /** Percentage of the total (0–100). */
  percentage: number;
  /** Original value. */
  value: number;
  /** Mid-angle in radians (for label positioning). */
  midAngle: number;
}

/** Degrees to radians. */
export const degToRad = (deg: number): number => (deg * Math.PI) / 180;

/**
 * Computes arc slices from an array of values.
 *
 * @param values - Numeric values for each slice.
 * @param startAngle - Start angle in degrees (default -90 = top).
 * @param endAngle - End angle in degrees (default 270 = full circle from top).
 * @param padAngle - Gap between slices in degrees (default 0).
 * @param sortDescending - Sort slices by value descending.
 */
export const computeSlices = (
  values: number[],
  startAngle = -90,
  endAngle = 270,
  padAngle = 0,
  sortDescending = false
): ArcSlice[] => {
  const total = values.reduce((sum, v) => sum + Math.max(0, v), 0);
  if (total === 0) return [];

  const indices = values.map((_, i) => i);
  if (sortDescending) {
    indices.sort((a, b) => values[b] - values[a]);
  }

  const totalAngle = degToRad(endAngle - startAngle);
  const pad = indices.length > 1 ? degToRad(padAngle) : 0;
  const usableAngle = totalAngle - pad * indices.length;
  let current = degToRad(startAngle);

  return indices.map(originalIndex => {
    const value = Math.max(0, values[originalIndex]);
    const angle = (value / total) * usableAngle;
    const start = current + pad / 2;
    const end = start + angle;
    current = start + angle + pad / 2;

    return {
      index: originalIndex,
      startAngle: start,
      endAngle: end,
      percentage: (value / total) * 100,
      value,
      midAngle: (start + end) / 2,
    };
  });
};

/**
 * Generates an SVG arc path for a slice.
 *
 * @param cx - Center X.
 * @param cy - Center Y.
 * @param outerRadius - Outer radius.
 * @param innerRadius - Inner radius (0 for pie, >0 for donut).
 * @param startAngle - Start angle in radians.
 * @param endAngle - End angle in radians.
 * @param cornerRadius - Corner rounding radius (default 0).
 */
export const arcPath = (
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number,
  cornerRadius = 0
): string => {
  const cr = Math.min(cornerRadius, (outerRadius - innerRadius) / 2);
  const sweep = endAngle - startAngle;

  // Full circle: SVG cannot draw a 360° arc in one command.
  // Split into two half-arcs.
  if (sweep >= 2 * Math.PI - 1e-6) {
    const mid = startAngle + Math.PI;
    if (innerRadius <= 0) {
      const ox1 = cx + outerRadius * Math.cos(startAngle);
      const oy1 = cy + outerRadius * Math.sin(startAngle);
      const omx = cx + outerRadius * Math.cos(mid);
      const omy = cy + outerRadius * Math.sin(mid);
      return [
        `M ${ox1} ${oy1}`,
        `A ${outerRadius} ${outerRadius} 0 1 1 ${omx} ${omy}`,
        `A ${outerRadius} ${outerRadius} 0 1 1 ${ox1} ${oy1}`,
        "Z",
      ].join(" ");
    }
    const ox1 = cx + outerRadius * Math.cos(startAngle);
    const oy1 = cy + outerRadius * Math.sin(startAngle);
    const omx = cx + outerRadius * Math.cos(mid);
    const omy = cy + outerRadius * Math.sin(mid);
    const ix1 = cx + innerRadius * Math.cos(startAngle);
    const iy1 = cy + innerRadius * Math.sin(startAngle);
    const imx = cx + innerRadius * Math.cos(mid);
    const imy = cy + innerRadius * Math.sin(mid);
    return [
      `M ${ox1} ${oy1}`,
      `A ${outerRadius} ${outerRadius} 0 1 1 ${omx} ${omy}`,
      `A ${outerRadius} ${outerRadius} 0 1 1 ${ox1} ${oy1}`,
      `Z`,
      `M ${ix1} ${iy1}`,
      `A ${innerRadius} ${innerRadius} 0 1 0 ${imx} ${imy}`,
      `A ${innerRadius} ${innerRadius} 0 1 0 ${ix1} ${iy1}`,
      "Z",
    ].join(" ");
  }

  const largeArc = sweep > Math.PI ? 1 : 0;

  if (cr <= 0) {
    const ox1 = cx + outerRadius * Math.cos(startAngle);
    const oy1 = cy + outerRadius * Math.sin(startAngle);
    const ox2 = cx + outerRadius * Math.cos(endAngle);
    const oy2 = cy + outerRadius * Math.sin(endAngle);

    if (innerRadius <= 0) {
      return [
        `M ${cx} ${cy}`,
        `L ${ox1} ${oy1}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${ox2} ${oy2}`,
        "Z",
      ].join(" ");
    }

    const ix1 = cx + innerRadius * Math.cos(endAngle);
    const iy1 = cy + innerRadius * Math.sin(endAngle);
    const ix2 = cx + innerRadius * Math.cos(startAngle);
    const iy2 = cy + innerRadius * Math.sin(startAngle);

    return [
      `M ${ox1} ${oy1}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${ox2} ${oy2}`,
      `L ${ix1} ${iy1}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2}`,
      "Z",
    ].join(" ");
  }

  // With corner radius — offset start/end angles slightly to make room for rounded corners
  const angleOffset = cr / outerRadius;
  const innerAngleOffset = innerRadius > 0 ? cr / innerRadius : 0;

  const sa = startAngle + angleOffset;
  const ea = endAngle - angleOffset;

  // If the slice is too small for corner radius, fall back to no rounding
  if (ea <= sa) {
    return arcPath(cx, cy, outerRadius, innerRadius, startAngle, endAngle, 0);
  }

  const la = ea - sa > Math.PI ? 1 : 0;

  const ox1 = cx + outerRadius * Math.cos(sa);
  const oy1 = cy + outerRadius * Math.sin(sa);
  const ox2 = cx + outerRadius * Math.cos(ea);
  const oy2 = cy + outerRadius * Math.sin(ea);

  // Corner start points (on the raw start/end angles at reduced radius)
  const csx = cx + (outerRadius - cr) * Math.cos(startAngle);
  const csy = cy + (outerRadius - cr) * Math.sin(startAngle);
  const cex = cx + (outerRadius - cr) * Math.cos(endAngle);
  const cey = cy + (outerRadius - cr) * Math.sin(endAngle);

  if (innerRadius <= 0) {
    return [
      `M ${csx} ${csy}`,
      `Q ${cx + outerRadius * Math.cos(startAngle)} ${cy + outerRadius * Math.sin(startAngle)} ${ox1} ${oy1}`,
      `A ${outerRadius} ${outerRadius} 0 ${la} 1 ${ox2} ${oy2}`,
      `Q ${cx + outerRadius * Math.cos(endAngle)} ${cy + outerRadius * Math.sin(endAngle)} ${cex} ${cey}`,
      `L ${cx} ${cy}`,
      "Z",
    ].join(" ");
  }

  const isa = startAngle + innerAngleOffset;
  const iea = endAngle - innerAngleOffset;
  const ila = iea - isa > Math.PI ? 1 : 0;

  const ix1 = cx + innerRadius * Math.cos(iea);
  const iy1 = cy + innerRadius * Math.sin(iea);
  const ix2 = cx + innerRadius * Math.cos(isa);
  const iy2 = cy + innerRadius * Math.sin(isa);

  const ciex = cx + (innerRadius + cr) * Math.cos(endAngle);
  const ciey = cy + (innerRadius + cr) * Math.sin(endAngle);
  const cisx = cx + (innerRadius + cr) * Math.cos(startAngle);
  const cisy = cy + (innerRadius + cr) * Math.sin(startAngle);

  return [
    `M ${csx} ${csy}`,
    `Q ${cx + outerRadius * Math.cos(startAngle)} ${cy + outerRadius * Math.sin(startAngle)} ${ox1} ${oy1}`,
    `A ${outerRadius} ${outerRadius} 0 ${la} 1 ${ox2} ${oy2}`,
    `Q ${cx + outerRadius * Math.cos(endAngle)} ${cy + outerRadius * Math.sin(endAngle)} ${cex} ${cey}`,
    `L ${ciex} ${ciey}`,
    `Q ${cx + innerRadius * Math.cos(endAngle)} ${cy + innerRadius * Math.sin(endAngle)} ${ix1} ${iy1}`,
    `A ${innerRadius} ${innerRadius} 0 ${ila} 0 ${ix2} ${iy2}`,
    `Q ${cx + innerRadius * Math.cos(startAngle)} ${cy + innerRadius * Math.sin(startAngle)} ${cisx} ${cisy}`,
    "Z",
  ].join(" ");
};

/**
 * Computes the position of a label for a slice.
 *
 * @param cx - Center X.
 * @param cy - Center Y.
 * @param radius - Radius at which to place the label.
 * @param midAngle - Mid-angle of the slice in radians.
 */
export const labelPosition = (
  cx: number,
  cy: number,
  radius: number,
  midAngle: number
): { x: number; y: number } => ({
  x: cx + radius * Math.cos(midAngle),
  y: cy + radius * Math.sin(midAngle),
});
