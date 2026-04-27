import type { AxisScaleType, ScaleFunction } from "./types";

/**
 * Creates a linear scale mapping domain values to pixel range.
 */
export const createLinearScale = (
  domain: [number, number],
  range: [number, number]
): ScaleFunction => {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const dSpan = d1 - d0 || 1;
  const rSpan = r1 - r0;

  const scale = (value: number): number => {
    return r0 + ((value - d0) / dSpan) * rSpan;
  };

  scale.domain = () => domain;
  scale.range = () => range;
  scale.ticks = (count = 5): number[] => {
    const step = niceStep(dSpan / count);
    const start = Math.ceil(d0 / step) * step;
    const ticks: number[] = [];
    for (let v = start; v <= d1; v += step) {
      ticks.push(Math.round(v * 1e10) / 1e10);
    }
    return ticks;
  };

  return scale;
};

/**
 * Creates a logarithmic scale (base 10).
 */
export const createLogScale = (
  domain: [number, number],
  range: [number, number]
): ScaleFunction => {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const logD0 = Math.log10(Math.max(d0, 1e-10));
  const logD1 = Math.log10(Math.max(d1, 1e-10));
  const logSpan = logD1 - logD0 || 1;
  const rSpan = r1 - r0;

  const scale = (value: number): number => {
    const logVal = Math.log10(Math.max(value, 1e-10));
    return r0 + ((logVal - logD0) / logSpan) * rSpan;
  };

  scale.domain = () => domain;
  scale.range = () => range;
  scale.ticks = (count = 5): number[] => {
    const ticks: number[] = [];
    const startPow = Math.floor(logD0);
    const endPow = Math.ceil(logD1);
    for (let p = startPow; p <= endPow && ticks.length < count * 2; p++) {
      const val = Math.pow(10, p);
      if (val >= d0 && val <= d1) ticks.push(val);
    }
    return ticks;
  };

  return scale;
};

/**
 * Creates a category scale mapping indices to evenly spaced positions.
 */
export const createCategoryScale = (
  categories: string[],
  range: [number, number]
): ScaleFunction => {
  const count = categories.length || 1;
  const [r0, r1] = range;
  const step = (r1 - r0) / count;

  const scale = (index: number): number => {
    return r0 + index * step + step / 2;
  };

  scale.domain = () => [0, count - 1] as [number, number];
  scale.range = () => range;
  scale.ticks = (): number[] => categories.map((_, i) => i);

  return scale;
};

/**
 * Creates a scale based on axis type.
 */
export const createScale = (
  type: AxisScaleType,
  domain: [number, number],
  range: [number, number],
  categories?: string[]
): ScaleFunction => {
  switch (type) {
    case "logarithmic":
      return createLogScale(domain, range);
    case "category":
      return createCategoryScale(categories || [], range);
    case "datetime":
    case "linear":
    default:
      return createLinearScale(domain, range);
  }
};

/**
 * Computes a "nice" step value for tick generation.
 */
const niceStep = (rawStep: number): number => {
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const residual = rawStep / magnitude;
  let nice: number;
  if (residual <= 1.5) nice = 1;
  else if (residual <= 3) nice = 2;
  else if (residual <= 7) nice = 5;
  else nice = 10;
  return nice * magnitude;
};

/**
 * Computes a nice domain (rounded min/max) for a given data range.
 * Rounds to clean tick boundaries. Adds one extra tick when the data
 * is very close to the ceiling or floor (less than 15% of a step),
 * so spline curves and labels have room.
 */
export const niceDomain = (
  min: number,
  max: number,
  tickCount = 5
): [number, number] => {
  if (min === max) {
    return min === 0 ? [-1, 1] : [min * 0.9, max * 1.1];
  }
  const span = max - min;
  const step = niceStep(span / tickCount);
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const threshold = step * 0.15;
  // Extra tick above if data is very close to ceiling
  const paddedMax = niceMax - max < threshold ? niceMax + step : niceMax;
  // Extra tick below if data is very close to floor (but never below 0 if all positive)
  let paddedMin = min - niceMin < threshold ? niceMin - step : niceMin;
  if (min >= 0) paddedMin = Math.max(paddedMin, 0);
  return [paddedMin, paddedMax];
};

/**
 * Inverts a pixel position back to a data value (for linear scales).
 */
export const invertLinear = (
  pixel: number,
  domain: [number, number],
  range: [number, number]
): number => {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const rSpan = r1 - r0 || 1;
  return d0 + ((pixel - r0) / rSpan) * (d1 - d0);
};
