/**
 * Zoom utilities for chart coordinate transformations.
 *
 * @description All zoom math lives here — chart components never
 * calculate zoom transforms directly.
 */

/** Zoom state representing the visible domain window. */
export interface ZoomState {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

/** Applies wheel zoom centered on cursor position. */
export const wheelZoom = (
  current: ZoomState,
  fullDomain: ZoomState,
  cursorFractionX: number,
  cursorFractionY: number,
  delta: number,
  axis: "x" | "y" | "both"
): ZoomState => {
  const factor = delta > 0 ? 1.15 : 1 / 1.15;
  let { xMin, xMax, yMin, yMax } = current;

  if (axis === "x" || axis === "both") {
    const rangeX = xMax - xMin;
    const newRangeX = rangeX * factor;
    const cx = xMin + cursorFractionX * rangeX;
    xMin = cx - cursorFractionX * newRangeX;
    xMax = cx + (1 - cursorFractionX) * newRangeX;
  }

  if (axis === "y" || axis === "both") {
    const rangeY = yMax - yMin;
    const newRangeY = rangeY * factor;
    const cy = yMin + cursorFractionY * rangeY;
    yMin = cy - cursorFractionY * newRangeY;
    yMax = cy + (1 - cursorFractionY) * newRangeY;
  }

  return clampZoom({ xMin, xMax, yMin, yMax }, fullDomain);
};

/** Applies pan offset in data-space units. */
export const panZoom = (
  current: ZoomState,
  fullDomain: ZoomState,
  dxFraction: number,
  dyFraction: number
): ZoomState => {
  const rangeX = current.xMax - current.xMin;
  const rangeY = current.yMax - current.yMin;
  let xMin = current.xMin - dxFraction * rangeX;
  let xMax = current.xMax - dxFraction * rangeX;
  let yMin = current.yMin + dyFraction * rangeY;
  let yMax = current.yMax + dyFraction * rangeY;

  return clampZoom({ xMin, xMax, yMin, yMax }, fullDomain);
};

/** Creates zoom state from a rectangular selection (pixel fractions 0-1). */
export const selectZoom = (
  fullDomain: ZoomState,
  x1Frac: number,
  y1Frac: number,
  x2Frac: number,
  y2Frac: number
): ZoomState => {
  const rangeX = fullDomain.xMax - fullDomain.xMin;
  const rangeY = fullDomain.yMax - fullDomain.yMin;
  const left = Math.min(x1Frac, x2Frac);
  const right = Math.max(x1Frac, x2Frac);
  const top = Math.min(y1Frac, y2Frac);
  const bottom = Math.max(y1Frac, y2Frac);

  // Minimum selection size (5% of range) to prevent accidental micro-zooms
  if ((right - left) < 0.05 && (bottom - top) < 0.05) return fullDomain;

  return {
    xMin: fullDomain.xMin + left * rangeX,
    xMax: fullDomain.xMin + right * rangeX,
    // Y is inverted (top of SVG = max Y value)
    yMin: fullDomain.yMin + (1 - bottom) * rangeY,
    yMax: fullDomain.yMin + (1 - top) * rangeY,
  };
};

/** Checks if current zoom differs from full domain. */
export const isZoomed = (current: ZoomState, full: ZoomState): boolean =>
  Math.abs(current.xMin - full.xMin) > 0.001 ||
  Math.abs(current.xMax - full.xMax) > 0.001 ||
  Math.abs(current.yMin - full.yMin) > 0.001 ||
  Math.abs(current.yMax - full.yMax) > 0.001;

/** Clamps zoom to not exceed full domain boundaries. */
const clampZoom = (z: ZoomState, full: ZoomState): ZoomState => {
  let { xMin, xMax, yMin, yMax } = z;
  const rangeX = xMax - xMin;
  const rangeY = yMax - yMin;

  if (xMin < full.xMin) { xMin = full.xMin; xMax = xMin + rangeX; }
  if (xMax > full.xMax) { xMax = full.xMax; xMin = xMax - rangeX; }
  if (yMin < full.yMin) { yMin = full.yMin; yMax = yMin + rangeY; }
  if (yMax > full.yMax) { yMax = full.yMax; yMin = yMax - rangeY; }

  // Don't let it exceed full domain after clamping
  xMin = Math.max(xMin, full.xMin);
  xMax = Math.min(xMax, full.xMax);
  yMin = Math.max(yMin, full.yMin);
  yMax = Math.min(yMax, full.yMax);

  return { xMin, xMax, yMin, yMax };
};
