import React from "react";
import type { ChartShadedArea, ScaleFunction } from "./types";
import { ChartPattern, patternFill } from "./patterns";

export interface ShadedAreaProps {
  /** Shaded area config */
  area: ChartShadedArea;
  /** X scale */
  xScale: ScaleFunction;
  /** Y scale */
  yScale: ScaleFunction;
  /** Plot height */
  plotHeight: number;
}

/**
 * ShadedArea — renders a rectangular highlighted region.
 */
export const ShadedArea: React.FC<ShadedAreaProps> = ({
  area,
  xScale,
  yScale,
  plotHeight,
}) => {
  const {
    xStart,
    xEnd,
    yMin,
    yMax,
    color = "var(--kreati-chart-4)",
    fill,
    className = "",
  } = area;

  const x1 = xScale(xStart);
  const x2 = xScale(xEnd);
  const y1 = yMax != null ? yScale(yMax) : 0;
  const y2 = yMin != null ? yScale(yMin) : plotHeight;

  const rectX = Math.min(x1, x2);
  const rectY = Math.min(y1, y2);
  const rectW = Math.abs(x2 - x1);
  const rectH = Math.abs(y2 - y1);

  const fillColor = fill?.color || color;
  const pat = fill?.pattern;
  const fillValue = pat ? patternFill(pat, fillColor) : fillColor;
  const opacity = pat ? (fill?.opacity ?? 0.6) : (fill?.opacity ?? 0.1);

  return (
    <>
      {pat && (
        <defs>
          <ChartPattern type={pat} color={fillColor} />
        </defs>
      )}
      <rect
        className={`k-chart-shaded ${className}`}
        x={rectX}
        y={rectY}
        width={rectW}
        height={rectH}
        fill={fillValue}
        opacity={opacity}
      />
    </>
  );
};
