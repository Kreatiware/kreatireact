import React from "react";
import type { MarkerSymbol } from "./types";

/**
 * Renders an SVG marker shape at the given coordinates.
 *
 * @description Supports circle, square, diamond, triangle, triangle-down,
 * and cross shapes. Used primarily by ScatterChart but available for any
 * chart that needs shaped markers.
 */
export const renderMarker = (
  symbol: MarkerSymbol,
  cx: number,
  cy: number,
  r: number,
  props: React.SVGProps<SVGElement>
): React.ReactNode => {
  switch (symbol) {
    case "square":
      return (
        <rect
          x={cx - r}
          y={cy - r}
          width={r * 2}
          height={r * 2}
          {...(props as React.SVGProps<SVGRectElement>)}
        />
      );
    case "diamond": {
      const d = `M${cx},${cy - r} L${cx + r},${cy} L${cx},${cy + r} L${cx - r},${cy}Z`;
      return <path d={d} {...(props as React.SVGProps<SVGPathElement>)} />;
    }
    case "triangle": {
      const d = `M${cx},${cy - r} L${cx + r},${cy + r * 0.7} L${cx - r},${cy + r * 0.7}Z`;
      return <path d={d} {...(props as React.SVGProps<SVGPathElement>)} />;
    }
    case "triangle-down": {
      const d = `M${cx},${cy + r} L${cx + r},${cy - r * 0.7} L${cx - r},${cy - r * 0.7}Z`;
      return <path d={d} {...(props as React.SVGProps<SVGPathElement>)} />;
    }
    case "none":
      return null;
    case "circle":
    default:
      return (
        <circle
          cx={cx}
          cy={cy}
          r={r}
          {...(props as React.SVGProps<SVGCircleElement>)}
        />
      );
  }
};

/** Default marker symbol sequence for auto-assignment per series. */
export const MARKER_SYMBOLS: MarkerSymbol[] = [
  "circle",
  "square",
  "diamond",
  "triangle",
  "triangle-down",
];
