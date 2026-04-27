import React from "react";

export interface CrosshairProps {
  /** X position in plot pixels */
  x?: number;
  /** Y position in plot pixels */
  y?: number;
  /** Plot width */
  plotWidth: number;
  /** Plot height */
  plotHeight: number;
  /** Crosshair type */
  type?: "vertical" | "horizontal" | "both";
  /** Whether to show */
  visible?: boolean;
}

/**
 * Crosshair — cursor-following vertical/horizontal line.
 */
export const Crosshair: React.FC<CrosshairProps> = ({
  x,
  y,
  plotWidth,
  plotHeight,
  type = "vertical",
  visible = true,
}) => {
  if (!visible || (x == null && y == null)) return null;

  return (
    <g className="k-chart-crosshair" pointerEvents="none">
      {(type === "vertical" || type === "both") &&
        x != null &&
        x >= 0 &&
        x <= plotWidth && (
          <line
            x1={x}
            y1={0}
            x2={x}
            y2={plotHeight}
            stroke="var(--kreati-chart-crosshair)"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
        )}
      {(type === "horizontal" || type === "both") &&
        y != null &&
        y >= 0 &&
        y <= plotHeight && (
          <line
            x1={0}
            y1={y}
            x2={plotWidth}
            y2={y}
            stroke="var(--kreati-chart-crosshair)"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
        )}
    </g>
  );
};
