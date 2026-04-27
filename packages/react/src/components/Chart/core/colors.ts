import type { ChartSeries, ChartSeverity } from "./types";

const PALETTE = [
  "var(--kreati-chart-1)",
  "var(--kreati-chart-2)",
  "var(--kreati-chart-3)",
  "var(--kreati-chart-4)",
  "var(--kreati-chart-5)",
  "var(--kreati-chart-6)",
  "var(--kreati-chart-7)",
  "var(--kreati-chart-8)",
  "var(--kreati-chart-9)",
  "var(--kreati-chart-10)",
  "var(--kreati-chart-11)",
  "var(--kreati-chart-12)",
];

const SEVERITY_MAP: Record<ChartSeverity, string> = {
  primary: "var(--kreati-severity-primary)",
  secondary: "var(--kreati-severity-secondary)",
  success: "var(--kreati-severity-success)",
  info: "var(--kreati-severity-info)",
  warning: "var(--kreati-severity-warning)",
  help: "var(--kreati-severity-help)",
  danger: "var(--kreati-severity-danger)",
  accent: "var(--kreati-severity-accent)",
};

/**
 * Resolves the color for a series based on priority:
 * explicit color > severity mapping > palette auto-assignment.
 */
export const resolveSeriesColor = (
  series: ChartSeries,
  index: number,
  palette?: string[]
): string => {
  if (series.color) return series.color;
  if (series.severity) return SEVERITY_MAP[series.severity];
  const colors = palette || PALETTE;
  return colors[index % colors.length];
};

/**
 * Returns the default chart palette.
 */
export const getDefaultPalette = (): string[] => [...PALETTE];

/**
 * Returns the severity color map.
 */
export const getSeverityMap = (): Record<ChartSeverity, string> => ({
  ...SEVERITY_MAP,
});
