import React from "react";
import type { ChartConstant, ScaleFunction } from "./types";
import { dashStyleToArray } from "./utils";

export interface ConstantLineProps {
  /** Constant line config */
  constant: ChartConstant;
  /** X scale (for vertical lines) */
  xScale: ScaleFunction;
  /** Y scale (for horizontal lines) */
  yScale: ScaleFunction;
  /** Plot width */
  plotWidth: number;
  /** Plot height */
  plotHeight: number;
}

/**
 * ConstantLine — renders a horizontal or vertical reference line.
 */
export const ConstantLine: React.FC<ConstantLineProps> = ({
  constant,
  xScale,
  yScale,
  plotWidth,
  plotHeight,
}) => {
  const {
    value,
    type = "horizontal",
    color = "var(--kreati-chart-axis)",
    dashStyle = "dash",
    width = 1.5,
    label,
    showLabel = true,
    labelPosition = "end",
    labelAlign = "above",
    className = "",
  } = constant;

  const dash = dashStyleToArray(dashStyle);
  const isHorizontal = type === "horizontal";
  const pos = isHorizontal ? yScale(value) : xScale(value);

  if (pos < 0 || (isHorizontal && pos > plotHeight) || (!isHorizontal && pos > plotWidth)) {
    return null;
  }

  const labelX = isHorizontal
    ? labelPosition === "start" ? 4 : labelPosition === "center" ? plotWidth / 2 : plotWidth - 4
    : pos;

  const labelY = isHorizontal
    ? pos
    : labelPosition === "start" ? plotHeight - 4 : labelPosition === "center" ? plotHeight / 2 : 4;

  const textAnchor = isHorizontal
    ? labelPosition === "start" ? "start" : labelPosition === "center" ? "middle" : "end"
    : "middle";

  const yOffset = isHorizontal
    ? (labelAlign === "below" ? 14 : -4)
    : (labelAlign === "below" ? 14 : -4);

  return (
    <g className={`k-chart-constant ${className}`}>
      <line
        x1={isHorizontal ? 0 : pos}
        y1={isHorizontal ? pos : 0}
        x2={isHorizontal ? plotWidth : pos}
        y2={isHorizontal ? pos : plotHeight}
        stroke={color}
        strokeWidth={width}
        strokeDasharray={dash}
      />
      {showLabel && label && (
        <text
          x={labelX}
          y={labelY + yOffset}
          textAnchor={textAnchor}
          fill={color}
          fontSize="var(--kreati-font-size-xs)"
          fontWeight="var(--kreati-font-weight-medium)"
        >
          {label}
          {constant.unit ? ` (${constant.unit})` : ""}
        </text>
      )}
    </g>
  );
};
