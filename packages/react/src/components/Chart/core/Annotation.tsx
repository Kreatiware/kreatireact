import React from "react";
import type { ChartAnnotation, ScaleFunction } from "./types";

export interface AnnotationProps {
  /** Annotation config */
  annotation: ChartAnnotation;
  /** X scale */
  xScale: ScaleFunction;
  /** Y scale */
  yScale: ScaleFunction;
  /** Plot width for bounds checking */
  plotWidth: number;
  /** Plot height for bounds checking */
  plotHeight: number;
}

const ARROW_SIZE = 6;

/**
 * Annotation — renders a label with optional arrow pointing to a data coordinate.
 *
 * @description Positions text (or foreignObject for React content) at a
 * data point with configurable offset. Arrow line connects the label to
 * the exact (x, y) coordinate when showArrow is true.
 */
export const Annotation: React.FC<AnnotationProps> = ({
  annotation,
  xScale,
  yScale,
  plotWidth,
  plotHeight,
}) => {
  const {
    x,
    y,
    content,
    showArrow = true,
    offsetX = 0,
    offsetY = -24,
    className = "",
    style,
  } = annotation;

  const px = xScale(x);
  const py = yScale(y);

  if (px < 0 || px > plotWidth || py < 0 || py > plotHeight) return null;

  const labelX = px + offsetX;
  const labelY = py + offsetY;

  const isString = typeof content === "string" || typeof content === "number";

  return (
    <g
      className={`k-chart-annotation ${className}`}
      role="img"
      aria-label={isString ? String(content) : "Chart annotation"}
    >
      {showArrow && (
        <line
          x1={px}
          y1={py}
          x2={labelX}
          y2={labelY + ARROW_SIZE}
          className="k-chart-annotation__arrow"
          stroke="var(--kreati-chart-text)"
          strokeWidth={1}
          markerEnd="url(#k-annotation-arrow)"
        />
      )}
      {isString ? (
        <text
          x={labelX}
          y={labelY}
          className="k-chart-annotation__text"
          textAnchor="middle"
          fill="var(--kreati-chart-text)"
          style={style}
        >
          {content}
        </text>
      ) : (
        <foreignObject
          x={labelX - 50}
          y={labelY - 16}
          width={100}
          height={32}
          style={{ overflow: "visible" }}
        >
          <div className="k-chart-annotation__content" style={style}>
            {content}
          </div>
        </foreignObject>
      )}
      {/* Target dot */}
      <circle
        cx={px}
        cy={py}
        r={3}
        fill="var(--kreati-chart-text)"
        className="k-chart-annotation__dot"
      />
    </g>
  );
};
