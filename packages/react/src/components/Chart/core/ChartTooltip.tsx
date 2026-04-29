import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ChartDataPoint, ChartSeries, MarkerSymbol } from "./types";
import { renderMarker } from "./markers";

export type TooltipMode = "shared" | "panel" | "single" | "custom";

export interface TooltipEntry {
  series: ChartSeries;
  point: ChartDataPoint;
  color: string;
  /** Resolved marker symbol for this entry (auto-assigned or explicit). */
  markerSymbol?: MarkerSymbol;
}

export interface ChartTooltipProps {
  /** Tooltip entries to display */
  entries: TooltipEntry[];
  /** Pixel position (relative to viewport) */
  x: number;
  y: number;
  /** Whether tooltip is visible */
  visible: boolean;
  /** Custom render */
  customRender?: (entries: TooltipEntry[]) => React.ReactNode;
  /** X axis label for the current position */
  xLabel?: string;
  /** Whether the tooltip is anchored to a fixed point (shows arrow) or follows cursor */
  anchored?: boolean;
}

const OFFSET = 12;

/**
 * ChartTooltip — renders as a portal outside the SVG for proper overflow handling.
 * When `anchored` is true, the tooltip shows an arrow pointing toward the anchor point.
 */
export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  entries,
  x,
  y,
  visible,
  customRender,
  xLabel,
  anchored = false,
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: 0, top: 0 });
  const [arrowSide, setArrowSide] = useState<"left" | "right">("left");

  useEffect(() => {
    if (!visible || !tooltipRef.current) return;
    const el = tooltipRef.current;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = x + OFFSET;
    let top = y - rect.height / 2;
    let side: "left" | "right" = "left";

    // Flip horizontal if overflows right
    if (left + rect.width > vw - 8) {
      left = x - rect.width - OFFSET;
      side = "right";
    }
    // Clamp: don't go past left edge
    if (left < 8) left = 8;
    // Flip vertical if overflows bottom
    if (top + rect.height > vh - 8) {
      top = vh - rect.height - 8;
    }
    // Don't go above viewport
    if (top < 8) top = 8;

    setPos({ left, top });
    setArrowSide(side);
  }, [x, y, visible, entries]);

  if (!visible || entries.length === 0) return null;

  const content = customRender ? (
    customRender(entries)
  ) : (
    <>
      {xLabel && <div className="k-chart-tooltip__title">{xLabel}</div>}
      {entries.map(entry => (
        <div key={entry.series.id} className="k-chart-tooltip__row">
          {(() => {
            const symbol = entry.markerSymbol ?? entry.series.markerSymbol;
            if (symbol && symbol !== "circle" && symbol !== "none") {
              return (
                <svg
                  className="k-chart-tooltip__marker"
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                >
                  {renderMarker(symbol, 5, 5, 4, { fill: entry.color })}
                </svg>
              );
            }
            return (
              <span
                className="k-chart-tooltip__dot"
                style={{ backgroundColor: entry.color }}
              />
            );
          })()}
          <span className="k-chart-tooltip__name">{entry.series.name}</span>
          <span className="k-chart-tooltip__value">
            {entry.point.y}
            {entry.series.unit ? ` ${entry.series.unit}` : ""}
          </span>
        </div>
      ))}
    </>
  );

  return createPortal(
    <div
      ref={tooltipRef}
      className={`k-chart-tooltip${anchored ? ` k-chart-tooltip--anchored k-chart-tooltip--arrow-${arrowSide}` : ""}`}
      style={{ left: pos.left, top: pos.top }}
    >
      {content}
    </div>,
    document.body
  );
};

/**
 * Finds the nearest data point index for a given X pixel position.
 */
export const findNearestPointIndex = (
  data: ChartDataPoint[],
  xScale: (v: number) => number,
  pixelX: number
): number => {
  if (data.length === 0) return -1;
  let nearest = 0;
  let minDist = Math.abs(xScale(data[0].x) - pixelX);
  for (let i = 1; i < data.length; i++) {
    const dist = Math.abs(xScale(data[i].x) - pixelX);
    if (dist < minDist) {
      minDist = dist;
      nearest = i;
    }
  }
  return nearest;
};
