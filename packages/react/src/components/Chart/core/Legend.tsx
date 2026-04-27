import React, { useState } from "react";
import type { ChartSeries } from "./types";
import { resolveSeriesColor } from "./colors";

export interface LegendProps {
  /** Series to display in the legend */
  series: ChartSeries[];
  /** Currently hidden series IDs */
  hiddenIds?: Set<string>;
  /** Toggle series visibility */
  onToggle?: (seriesId: string) => void;
  /** Position */
  position?: "top" | "bottom" | "left" | "right";
  /** Override layout direction. Default: inferred from position */
  direction?: "horizontal" | "vertical";
  /** Custom palette */
  palette?: string[];
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

const base = "k-chart-legend";

/**
 * Legend component — renders outside the SVG as HTML for better text handling.
 */
export const Legend: React.FC<LegendProps> = ({
  series,
  hiddenIds = new Set(),
  onToggle,
  position = "bottom",
  direction,
  palette,
  className = "",
  style,
}) => {
  const isVertical = direction
    ? direction === "vertical"
    : position === "left" || position === "right";

  return (
    <div
      className={`${base} ${base}--${position}${isVertical ? ` ${base}--vertical` : ""} ${className}`}
      style={style}
      role="list"
      aria-label="Chart legend"
    >
      {series.map((s, i) => {
        const color = resolveSeriesColor(s, i, palette);
        const hidden = hiddenIds.has(s.id);

        return (
          <button
            key={s.id}
            type="button"
            className={`${base}__item${hidden ? ` ${base}__item--hidden` : ""}`}
            onClick={() => onToggle?.(s.id)}
            role="listitem"
            aria-pressed={!hidden}
          >
            <span
              className={`${base}__swatch`}
              style={{ backgroundColor: hidden ? undefined : color }}
            />
            <span className={`${base}__label`}>{s.name}</span>
          </button>
        );
      })}
    </div>
  );
};
