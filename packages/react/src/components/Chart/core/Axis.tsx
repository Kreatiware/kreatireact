import React from "react";
import type { ChartAxisConfig, ScaleFunction } from "./types";
import { dashStyleToArray } from "./utils";

export interface AxisProps {
  /** Axis orientation */
  orientation: "top" | "bottom" | "left" | "right";
  /** Scale function for positioning */
  scale: ScaleFunction;
  /** Axis config */
  config?: ChartAxisConfig;
  /** Plot width (for horizontal grid lines) */
  plotWidth?: number;
  /** Plot height (for vertical grid lines) */
  plotHeight?: number;
  /** Hide tick marks and labels but keep axis line and grid. Default: false */
  hideLabels?: boolean;
}

const base = "k-chart-axis";

/**
 * Axis component — renders ticks, labels, and optional grid lines.
 */
export const Axis: React.FC<AxisProps> = ({
  orientation,
  scale,
  config = {},
  plotWidth = 0,
  plotHeight = 0,
  hideLabels = false,
}) => {
  const {
    label,
    ticks: tickCount,
    tickFormat,
    showGrid,
    gridDashStyle = "solid",
    alternatingBands = false,
    alternatingBandColor: bandColorProp = "var(--kreati-chart-grid)",
    alternatingBandOpacity = 0.08,
    categories,
  } = config;

  const bandColors = Array.isArray(bandColorProp)
    ? bandColorProp
    : [bandColorProp, "transparent"];

  const isHorizontal = orientation === "top" || orientation === "bottom";

  // Auto-reduce ticks based on available space
  const autoTickCount = isHorizontal
    ? Math.max(2, Math.floor(plotWidth / 80))
    : Math.max(2, Math.floor(plotHeight / 40));
  const ticks = scale.ticks(
    tickCount ?? Math.min(autoTickCount, isHorizontal ? 10 : 8)
  );

  const formatTick = (value: number): string => {
    if (tickFormat) return tickFormat(value);
    if (categories && categories[value] !== undefined) return categories[value];
    if (config.type === "datetime") {
      const d = new Date(value);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    }
    return Math.abs(value) >= 1000
      ? value.toLocaleString()
      : String(Math.round(value * 100) / 100);
  };

  const tickSize = 5;

  return (
    <g className={`${base} ${base}--${orientation}`}>
      {/* Axis line */}
      <line
        className={`${base}__line`}
        x1={isHorizontal ? 0 : 0}
        y1={isHorizontal ? (orientation === "bottom" ? plotHeight : 0) : 0}
        x2={isHorizontal ? plotWidth : 0}
        y2={
          isHorizontal
            ? orientation === "bottom"
              ? plotHeight
              : 0
            : plotHeight
        }
        stroke="var(--kreati-chart-axis)"
        strokeWidth={1}
      />

      {/* Alternating bands */}
      {alternatingBands &&
        ticks.length > 1 &&
        ticks.map((value, i) => {
          const next = ticks[i + 1];
          if (next == null) return null;
          const bandColor = bandColors[i % 2];
          if (bandColor === "transparent") return null;
          const p1 = scale(value);
          const p2 = scale(next);
          if (isHorizontal) {
            return (
              <rect
                key={`band-${i}`}
                x={Math.min(p1, p2)}
                y={0}
                width={Math.abs(p2 - p1)}
                height={plotHeight}
                fill={bandColor}
                opacity={alternatingBandOpacity}
                pointerEvents="none"
              />
            );
          }
          return (
            <rect
              key={`band-${i}`}
              x={0}
              y={Math.min(p1, p2)}
              width={plotWidth}
              height={Math.abs(p2 - p1)}
              fill={bandColor}
              opacity={alternatingBandOpacity}
              pointerEvents="none"
            />
          );
        })}

      {/* Ticks + labels */}
      {ticks.map(value => {
        const pos = scale(value);
        const gridDash = dashStyleToArray(gridDashStyle);

        if (isHorizontal) {
          const y = orientation === "bottom" ? plotHeight : 0;
          const tickDir = orientation === "bottom" ? 1 : -1;
          return (
            <g key={value} transform={`translate(${pos},0)`}>
              {showGrid && (
                <line
                  className={`${base}__grid`}
                  y1={0}
                  y2={plotHeight}
                  stroke="var(--kreati-chart-grid)"
                  strokeWidth={1}
                  strokeDasharray={gridDash}
                />
              )}
              {!hideLabels && (
                <>
                  <line
                    y1={y}
                    y2={y + tickSize * tickDir}
                    stroke="var(--kreati-chart-axis)"
                    strokeWidth={1}
                  />
                  <text
                    className={`${base}__label`}
                    y={y + tickSize * tickDir + 12 * tickDir}
                    textAnchor="middle"
                    fill="var(--kreati-chart-text)"
                    fontSize="var(--kreati-font-size-xs)"
                  >
                    {formatTick(value)}
                  </text>
                </>
              )}
            </g>
          );
        }

        // Vertical axis
        const x = 0;
        const tickDir = orientation === "left" ? -1 : 1;
        return (
          <g key={value} transform={`translate(0,${pos})`}>
            {showGrid && (
              <line
                className={`${base}__grid`}
                x1={0}
                x2={plotWidth}
                stroke="var(--kreati-chart-grid)"
                strokeWidth={1}
                strokeDasharray={gridDash}
              />
            )}
            {!hideLabels && (
              <>
                <line
                  x1={x}
                  x2={x + tickSize * tickDir}
                  stroke="var(--kreati-chart-axis)"
                  strokeWidth={1}
                />
                <text
                  className={`${base}__label`}
                  x={x + tickSize * tickDir + (orientation === "left" ? -4 : 4)}
                  dy="0.35em"
                  textAnchor={orientation === "left" ? "end" : "start"}
                  fill="var(--kreati-chart-text)"
                  fontSize="var(--kreati-font-size-xs)"
                >
                  {formatTick(value)}
                </text>
              </>
            )}
          </g>
        );
      })}

      {/* Axis label */}
      {label && (
        <text
          className={`${base}__title`}
          fill="var(--kreati-chart-text)"
          fontSize="var(--kreati-font-size-sm)"
          fontWeight="var(--kreati-font-weight-medium)"
          textAnchor="middle"
          transform={
            isHorizontal
              ? `translate(${plotWidth / 2},${orientation === "bottom" ? plotHeight + 36 : -16})`
              : `translate(${orientation === "left" ? -40 : 40},${plotHeight / 2}) rotate(${orientation === "left" ? -90 : 90})`
          }
        >
          {label}
        </text>
      )}
    </g>
  );
};
