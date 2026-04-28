import type React from "react";
import type { TooltipEntry } from "../core/ChartTooltip";
import type { CartesianContext } from "./CartesianChart";
import type { ChartDataPoint, ChartSeries } from "../core/types";

/** Tooltip event callbacks shared by all chart content components. */
export interface ChartContentTooltipHandlers {
  onTooltipShow: (
    entries: TooltipEntry[],
    pos: { x: number; y: number },
    xLabel: string | undefined,
    anchored: boolean
  ) => void;
  onTooltipHide: () => void;
  onTooltipMove: (pos: { x: number; y: number }) => void;
  onActiveXChange: (x: number | null) => void;
  onHoveredSeriesChange: (id: string | null) => void;
}

/** Base props shared by all chart content components. */
export interface ChartContentBaseProps {
  ctx: CartesianContext;
  tooltipMode?: "single" | "shared" | "custom" | "panel";
  tooltipFollowCursor?: boolean;
  tooltipHandlers: ChartContentTooltipHandlers;
  onPointClick?: (point: ChartDataPoint, series: ChartSeries) => void;
  categories?: string[];
  margins?: { left?: number; top?: number };
  /** Currently hovered series id (from parent) */
  hoveredSeries?: string | null;
  /** Currently active X pixel position (from parent) */
  activeX?: number | null;
  /** Keyboard focused series index */
  focusedSeriesIndex?: number | null;
  /** Keyboard focused point index */
  focusedPointIndex?: number | null;
}
