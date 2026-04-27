import type React from "react";

// ─── Primitives ─────────────────────────────────────────────────────────────

export type ChartSeverity =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "help"
  | "danger"
  | "accent";

export type DashStyle = "solid" | "dash" | "dot" | "dash-dot" | "long-dash";

export type MarkerSymbol =
  | "circle"
  | "square"
  | "diamond"
  | "triangle"
  | "triangle-down"
  | "none";

export type AxisScaleType = "linear" | "logarithmic" | "datetime" | "category";

/** Trendline type for automatic regression/smoothing. */
export type TrendlineType = "linear" | "polynomial" | "exponential" | "moving-average" | "custom";

/** Trendline configuration for a series. */
export interface ChartTrendline {
  /** Regression type. */
  type: TrendlineType;
  /** Polynomial degree (only for type 'polynomial'). Default: 2 */
  degree?: number;
  /** Window size (only for type 'moving-average'). Default: 3 */
  period?: number;
  /** Custom compute function (only for type 'custom'). */
  compute?: (data: ChartDataPoint[]) => ChartDataPoint[];
  /** Trendline color. Defaults to series color with reduced opacity. */
  color?: string;
  /** Dash style. Default: 'dash' */
  dashStyle?: DashStyle;
  /** Line width. Default: 2 */
  lineWidth?: number;
  /** Label shown in legend. Default: '{seriesName} (trend)' */
  label?: string;
}

// ─── Data ───────────────────────────────────────────────────────────────────

export interface ChartDataPoint {
  x: number;
  y: number;
  label?: string;
  z?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  /** Symmetric error range (±error). Overridden by errorHigh/errorLow. */
  error?: number;
  /** Upper error bound (absolute Y value). */
  errorHigh?: number;
  /** Lower error bound (absolute Y value). */
  errorLow?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface ChartFill {
  color?: string;
  gradient?: [number, string][];
  pattern?: "stripes" | "dots" | "crosshatch";
  opacity?: number;
}

export interface ChartSeries {
  id: string;
  name: string;
  data: ChartDataPoint[];
  color?: string;
  severity?: ChartSeverity;
  fill?: ChartFill;
  lineWidth?: number;
  dashStyle?: DashStyle;
  showMarkers?: boolean;
  markerSymbol?: MarkerSymbol;
  markerSize?: number;
  showDataLabels?: boolean;
  dataLabelFormat?: (point: ChartDataPoint) => string;
  yAxisId?: string;
  yAxisSide?: "left" | "right";
  axisLabel?: string;
  unit?: string;
  type?: "line" | "spline" | "bar" | "area" | "scatter";
  zones?: { value: number; color: string; dashStyle?: DashStyle }[];
  hidden?: boolean;
  disableTooltip?: boolean;
  /** Default symmetric error margin for all points. Per-point error/errorHigh/errorLow overrides this. */
  errorMargin?: number;
  /** Trendline configuration. When set, a regression/smoothing line is rendered over the series. */
  trendline?: ChartTrendline;
  className?: string;
  style?: React.CSSProperties;
}

// ─── Overlays ───────────────────────────────────────────────────────────────

export interface ChartConstant {
  id: string;
  label: string;
  value: number;
  type?: "horizontal" | "vertical";
  color?: string;
  severity?: ChartSeverity;
  referTo?: string;
  yAxisSide?: "left" | "right";
  unit?: string;
  dashStyle?: DashStyle;
  width?: number;
  showLabel?: boolean;
  labelPosition?: "start" | "center" | "end";
  /** Whether the label renders above or below the line. Default: 'above' */
  labelAlign?: "above" | "below";
  showTooltip?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface ChartShadedArea {
  id: string;
  label: string;
  xStart: number;
  xEnd: number;
  yMin?: number;
  yMax?: number;
  color?: string;
  fill?: ChartFill;
  showTooltip?: boolean;
  tooltipValue?: React.ReactNode;
  keepOpacity?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface ChartAnnotation {
  id: string;
  x: number;
  y: number;
  content: React.ReactNode;
  showArrow?: boolean;
  offsetX?: number;
  offsetY?: number;
  className?: string;
  style?: React.CSSProperties;
}

// ─── Axis ───────────────────────────────────────────────────────────────────

export interface ChartAxisConfig {
  id?: string;
  label?: string;
  type?: AxisScaleType;
  min?: number;
  max?: number;
  inverted?: boolean;
  allowNegative?: boolean;
  ticks?: number;
  tickInterval?: number;
  tickFormat?: (value: number) => string;
  showGrid?: boolean;
  gridDashStyle?: DashStyle;
  /** Show alternating background bands between ticks. Default: false */
  alternatingBands?: boolean;
  /** Color(s) for alternating bands. A single string applies to even bands only; a tuple applies [even, odd]. Default: 'var(--kreati-chart-grid)' */
  alternatingBandColor?: string | [string, string];
  /** Opacity for alternating bands. Default: 0.06 */
  alternatingBandOpacity?: number;
  categories?: string[];
  side?: "left" | "right";
  offset?: number;
  unit?: string;
}

// ─── Canvas ─────────────────────────────────────────────────────────────────

export interface ChartMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ScaleFunction {
  (value: number): number;
  domain: () => [number, number];
  range: () => [number, number];
  ticks: (count?: number) => number[];
}
