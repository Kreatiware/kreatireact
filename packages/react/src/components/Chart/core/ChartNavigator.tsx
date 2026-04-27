import React, { useRef, useCallback, useState } from "react";
import type { ChartSeries, ScaleFunction } from "./types";
import { createScale } from "./scales";
import { resolveSeriesColor } from "./colors";

export interface ChartNavigatorProps {
  /** All series data */
  series: ChartSeries[];
  /** Full X domain [min, max] */
  xDomain: [number, number];
  /** Full Y domain [min, max] */
  yDomain: [number, number];
  /** Current visible X range as fractions [0-1] */
  rangeFraction: [number, number];
  /** Callback when range changes */
  onRangeChange: (fraction: [number, number]) => void;
  /** Width in pixels */
  width: number;
  /** Height in pixels. Default: 40 */
  height?: number;
  /** Custom palette */
  palette?: string[];
}

const HANDLE_WIDTH = 6;

/**
 * ChartNavigator — mini chart with draggable range handles.
 *
 * @description Renders a simplified view of all series with a
 * draggable window indicating the visible range. Handles on
 * left/right edges resize the window, dragging the center pans.
 */
export const ChartNavigator: React.FC<ChartNavigatorProps> = ({
  series,
  xDomain,
  yDomain,
  rangeFraction,
  onRangeChange,
  width,
  height = 40,
  palette,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<"left" | "right" | "center" | null>(null);
  const dragStartRef = useRef({ x: 0, range: rangeFraction });

  const xScale = createScale("linear", xDomain, [0, width]);
  const yScale = createScale("linear", yDomain, [height - 2, 2]);

  const left = rangeFraction[0] * width;
  const right = rangeFraction[1] * width;

  const handleMouseDown = useCallback(
    (type: "left" | "right" | "center", e: React.MouseEvent) => {
      e.preventDefault();
      setDragging(type);
      dragStartRef.current = { x: e.clientX, range: [...rangeFraction] as [number, number] };

      const handleMouseMove = (ev: MouseEvent) => {
        const dx = (ev.clientX - dragStartRef.current.x) / width;
        const [startL, startR] = dragStartRef.current.range;

        let newL = startL;
        let newR = startR;

        if (type === "left") {
          newL = Math.max(0, Math.min(startL + dx, startR - 0.02));
        } else if (type === "right") {
          newR = Math.min(1, Math.max(startR + dx, startL + 0.02));
        } else {
          const span = startR - startL;
          newL = startL + dx;
          newR = startR + dx;
          if (newL < 0) { newL = 0; newR = span; }
          if (newR > 1) { newR = 1; newL = 1 - span; }
        }

        onRangeChange([newL, newR]);
      };

      const handleMouseUp = () => {
        setDragging(null);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [rangeFraction, width, onRangeChange]
  );

  // Build simplified line paths
  const paths = series
    .filter((s) => !s.hidden)
    .map((s, i) => {
      const color = resolveSeriesColor(s, i, palette);
      const d = s.data
        .map((p, j) => `${j === 0 ? "M" : "L"}${xScale(p.x)},${yScale(p.y)}`)
        .join(" ");
      return <path key={s.id} d={d} fill="none" stroke={color} strokeWidth={1} opacity={0.6} />;
    });

  return (
    <div
      className="k-chart-navigator"
      role="slider"
      aria-label="Chart range navigator"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(rangeFraction[0] * 100)}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="k-chart-navigator__svg"
      >
        {/* Series preview */}
        {paths}

        {/* Dimmed areas outside selection */}
        <rect x={0} y={0} width={left} height={height} className="k-chart-navigator__mask" />
        <rect x={right} y={0} width={width - right} height={height} className="k-chart-navigator__mask" />

        {/* Selection window */}
        <rect
          x={left}
          y={0}
          width={right - left}
          height={height}
          className="k-chart-navigator__window"
          style={{ cursor: dragging === "center" ? "grabbing" : "grab" }}
          onMouseDown={(e) => handleMouseDown("center", e)}
        />

        {/* Left handle */}
        <rect
          x={left}
          y={0}
          width={HANDLE_WIDTH}
          height={height}
          className="k-chart-navigator__handle"
          style={{ cursor: "ew-resize" }}
          onMouseDown={(e) => handleMouseDown("left", e)}
        />

        {/* Right handle */}
        <rect
          x={right - HANDLE_WIDTH}
          y={0}
          width={HANDLE_WIDTH}
          height={height}
          className="k-chart-navigator__handle"
          style={{ cursor: "ew-resize" }}
          onMouseDown={(e) => handleMouseDown("right", e)}
        />
      </svg>
    </div>
  );
};
