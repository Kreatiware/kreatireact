import React, {
  forwardRef,
  useRef,
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
} from "react";
import type { ChartMargins } from "./types";

export interface ChartCanvasProps {
  /** Fixed width in pixels. If omitted, fills container (responsive). */
  width?: number | string;
  /** Chart height in pixels. Default: 300 */
  height?: number;
  /** Margins around the plot area */
  margins?: Partial<ChartMargins>;
  /** Fires with mouse position in data-space coordinates */
  onMouseMove?: (event: {
    plotX: number;
    plotY: number;
    clientX: number;
    clientY: number;
  }) => void;
  /** Fires when mouse leaves the plot area */
  onMouseLeave?: () => void;
  /** Fires on click within the plot area */
  onClick?: (event: {
    plotX: number;
    plotY: number;
    clientX: number;
    clientY: number;
  }) => void;
  /** ARIA label for the chart */
  ariaLabel?: string;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Extra padding on the clip path in px. Default: 8 (room for markers). Set 0 for bar charts. */
  clipMargin?: number;
  /** Chart content (series, overlays, etc.) */
  children?: React.ReactNode;
}

const DEFAULT_MARGINS: ChartMargins = {
  top: 20,
  right: 20,
  bottom: 40,
  left: 50,
};

/**
 * ChartCanvas — base SVG wrapper for all chart types.
 *
 * @description Provides a responsive SVG container with a defined plot area
 * (inner rectangle after margins). Handles mouse/touch events and translates
 * pixel positions to plot-relative coordinates. All chart content is rendered
 * as children within a clipped group.
 */
export const ChartCanvas = forwardRef<SVGSVGElement, ChartCanvasProps>(
  (
    {
      width = "100%",
      height = 300,
      margins: marginsProp,
      onMouseMove,
      onMouseLeave,
      onClick,
      ariaLabel,
      className = "",
      style,
      clipMargin = 8,
      children,
    },
    ref
  ) => {
    const svgRef = useRef<SVGSVGElement>(null);
    useImperativeHandle(ref, () => svgRef.current as SVGSVGElement);

    const [svgWidth, setSvgWidth] = useState(
      typeof width === "number" ? width : 0
    );
    const margins: ChartMargins = { ...DEFAULT_MARGINS, ...marginsProp };

    useEffect(() => {
      if (typeof width === "number") {
        setSvgWidth(width);
        return;
      }
      const el = svgRef.current?.parentElement;
      if (!el) return;
      const observer = new ResizeObserver(entries => {
        const entry = entries[0];
        if (entry) setSvgWidth(entry.contentRect.width);
      });
      observer.observe(el);
      setSvgWidth(el.clientWidth);
      return () => observer.disconnect();
    }, [width]);

    const plotWidth = Math.max(svgWidth - margins.left - margins.right, 0);
    const plotHeight = Math.max(height - margins.top - margins.bottom, 0);

    const getPlotCoords = useCallback(
      (clientX: number, clientY: number) => {
        const svg = svgRef.current;
        if (!svg) return { plotX: 0, plotY: 0, clientX, clientY };
        const rect = svg.getBoundingClientRect();
        const plotX = clientX - rect.left - margins.left;
        const plotY = clientY - rect.top - margins.top;
        return { plotX, plotY, clientX, clientY };
      },
      [margins.left, margins.top]
    );

    const handleMouseMove = useCallback(
      (e: React.MouseEvent) => {
        if (!onMouseMove) return;
        onMouseMove(getPlotCoords(e.clientX, e.clientY));
      },
      [onMouseMove, getPlotCoords]
    );

    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        if (!onClick) return;
        onClick(getPlotCoords(e.clientX, e.clientY));
      },
      [onClick, getPlotCoords]
    );

    const base = "k-chart";

    return (
      <svg
        ref={svgRef}
        className={`${base} ${className}`}
        style={{ width, height, ...style }}
        viewBox={svgWidth ? `0 0 ${svgWidth} ${height}` : undefined}
        role="img"
        aria-label={ariaLabel}
        onMouseMove={handleMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={handleClick}
      >
        <defs>
          <clipPath id={`${base}-clip`}>
            <rect
              x={-clipMargin}
              y={-clipMargin}
              width={plotWidth + clipMargin * 2}
              height={plotHeight + clipMargin * 2}
            />
          </clipPath>
        </defs>
        <g transform={`translate(${margins.left},${margins.top})`}>
          <ChartCanvasContext.Provider
            value={{ width: plotWidth, height: plotHeight, margins }}
          >
            {children}
          </ChartCanvasContext.Provider>
        </g>
      </svg>
    );
  }
);

ChartCanvas.displayName = "ChartCanvas";

// ─── Context for children to access plot dimensions ─────────────────────────

interface ChartCanvasContextValue {
  width: number;
  height: number;
  margins: ChartMargins;
}

export const ChartCanvasContext = React.createContext<ChartCanvasContextValue>({
  width: 0,
  height: 0,
  margins: DEFAULT_MARGINS,
});

/**
 * Hook to access the current chart plot dimensions.
 */
export const useChartCanvas = (): ChartCanvasContextValue => {
  return React.useContext(ChartCanvasContext);
};
