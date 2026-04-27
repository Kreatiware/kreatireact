import type { ChartDataPoint, ChartTrendline } from "./types";

/**
 * Computes trendline data points for a given series.
 *
 * @description Supports linear regression, polynomial regression,
 * exponential regression, moving average, and custom compute functions.
 * All math is kept in this utility — chart components never calculate regressions.
 */
export const computeTrendline = (
  data: ChartDataPoint[],
  config: ChartTrendline
): ChartDataPoint[] => {
  if (data.length < 2) return [];
  const sorted = [...data].sort((a, b) => a.x - b.x);

  switch (config.type) {
    case "linear":
      return linearRegression(sorted);
    case "polynomial":
      return polynomialRegression(sorted, config.degree ?? 2);
    case "exponential":
      return exponentialRegression(sorted);
    case "moving-average":
      return movingAverage(sorted, config.period ?? 3);
    case "custom":
      return config.compute ? config.compute(sorted) : [];
    default:
      return [];
  }
};

/** Linear regression: y = mx + b */
const linearRegression = (data: ChartDataPoint[]): ChartDataPoint[] => {
  const n = data.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (const p of data) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumX2 += p.x * p.x;
  }
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return [];
  const m = (n * sumXY - sumX * sumY) / denom;
  const b = (sumY - m * sumX) / n;
  return data.map((p) => ({ x: p.x, y: m * p.x + b }));
};

/** Polynomial regression using normal equations. */
const polynomialRegression = (
  data: ChartDataPoint[],
  degree: number
): ChartDataPoint[] => {
  const n = data.length;
  const d = Math.min(degree, n - 1);

  // Build Vandermonde matrix and solve via Gaussian elimination
  const size = d + 1;
  const matrix: number[][] = Array.from({ length: size }, () => new Array(size + 1).fill(0));

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let sum = 0;
      for (const p of data) sum += Math.pow(p.x, i + j);
      matrix[i][j] = sum;
    }
    let sum = 0;
    for (const p of data) sum += p.y * Math.pow(p.x, i);
    matrix[i][size] = sum;
  }

  // Gaussian elimination with partial pivoting
  for (let col = 0; col < size; col++) {
    let maxRow = col;
    for (let row = col + 1; row < size; row++) {
      if (Math.abs(matrix[row][col]) > Math.abs(matrix[maxRow][col])) maxRow = row;
    }
    [matrix[col], matrix[maxRow]] = [matrix[maxRow], matrix[col]];
    if (Math.abs(matrix[col][col]) < 1e-12) continue;
    for (let row = col + 1; row < size; row++) {
      const factor = matrix[row][col] / matrix[col][col];
      for (let k = col; k <= size; k++) matrix[row][k] -= factor * matrix[col][k];
    }
  }

  // Back substitution
  const coeffs = new Array(size).fill(0);
  for (let i = size - 1; i >= 0; i--) {
    let sum = matrix[i][size];
    for (let j = i + 1; j < size; j++) sum -= matrix[i][j] * coeffs[j];
    coeffs[i] = Math.abs(matrix[i][i]) > 1e-12 ? sum / matrix[i][i] : 0;
  }

  return data.map((p) => {
    let y = 0;
    for (let i = 0; i < coeffs.length; i++) y += coeffs[i] * Math.pow(p.x, i);
    return { x: p.x, y };
  });
};

/** Exponential regression: y = a * e^(bx) */
const exponentialRegression = (data: ChartDataPoint[]): ChartDataPoint[] => {
  // Filter positive Y values (log requires > 0)
  const valid = data.filter((p) => p.y > 0);
  if (valid.length < 2) return [];

  // Linear regression on ln(y) = ln(a) + bx
  const logData = valid.map((p) => ({ x: p.x, y: Math.log(p.y) }));
  const result = linearRegression(logData);
  if (result.length === 0) return [];

  // Extract a and b from the log-space regression
  const lnA = result[0].y - (result[1].y - result[0].y) / (logData[1].x - logData[0].x) * logData[0].x;
  const b = result.length > 1 ? (result[result.length - 1].y - result[0].y) / (logData[logData.length - 1].x - logData[0].x) : 0;
  const a = Math.exp(lnA);

  return data.map((p) => ({ x: p.x, y: a * Math.exp(b * p.x) }));
};

/** Moving average with configurable window. */
const movingAverage = (
  data: ChartDataPoint[],
  period: number
): ChartDataPoint[] => {
  const w = Math.max(1, Math.min(period, data.length));
  const result: ChartDataPoint[] = [];
  for (let i = w - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = i - w + 1; j <= i; j++) sum += data[j].y;
    result.push({ x: data[i].x, y: sum / w });
  }
  return result;
};
