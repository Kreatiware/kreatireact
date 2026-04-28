import React, { useRef } from "react";
import type { TooltipEntry } from "../core/ChartTooltip";
import { renderMarker, MARKER_SYMBOLS } from "../core/markers";
import { buildPath } from "../core/paths";
import type { CurveType } from "../core/paths";
import { dashStyleToArray } from "../core/utils";
import { computeTrendline } from "../core/trendline";
import { ChartPattern, patternFill } from "../core/patterns";
import type {
  ChartDataPoint,
  ChartSeries,
  MarkerSymbol,
  ScaleFunction,
} from "../core/types";
import type { ChartContentBaseProps } from "./chartContentTypes";

export interface ScatterChartContentProps extends ChartContentBaseProps {
  markerSize?: number;
  bubbleMode?: boolean;
  bubbleMin?: number;
  bubbleMax?: number;
  showLine?: boolean;
  curve?: CurveType;
  strokeWidth?: number;
  showDataLabels?: boolean;
}

/**
 * ScatterChartContent — SVG rendering logic for scatter/bubble charts.
 * Designed to be used inside a CartesianChart render prop.
 * @internal
 */
export const ScatterChartContent: React.FC<ScatterChartContentProps> = ({
  ctx,
  markerSize = 6,
  bubbleMode = false,
  bubbleMin = 4,
  bubbleMax = 30,
  showLine = false,
  curve = "linear",
  strokeWidth = 2,
  showDataLabels = false,
  tooltipMode = "single",
  tooltipFollowCursor = false,
  tooltipHandlers,
  onPointClick,
  categories,
  margins,
  hoveredSeries,
}) => {
  const {
    xScale,
    yScale,
    yScales,
    plotWidth,
    plotHeight,
    visibleSeries,
    getColor,
    focusedPointIndex,
    focusedSeriesIndex,
  } = ctx;
  const ml = margins?.left ?? 50;
  const mt = margins?.top ?? 20;
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null);

  const getYScale = (s: { yAxisId?: string }): ScaleFunction =>
    yScales[s.yAxisId ?? "default"] ?? yScale;

  // Bubble z-range across all visible series
  let zMin = Infinity;
  let zMax = -Infinity;
  if (bubbleMode) {
    for (const s of visibleSeries) {
      for (const p of s.data) {
        if (p.z != null) {
          if (p.z < zMin) zMin = p.z;
          if (p.z > zMax) zMax = p.z;
        }
      }
    }
    if (!isFinite(zMin)) {
      zMin = 0;
      zMax = 1;
    }
  }

  const getRadius = (p: ChartDataPoint, s: ChartSeries): number => {
    if (bubbleMode && p.z != null) {
      const range = zMax - zMin;
      const t = range > 0 ? (p.z - zMin) / range : 0.5;
      return bubbleMin + t * (bubbleMax - bubbleMin);
    }
    return s.markerSize ?? markerSize;
  };

  const getSymbol = (s: ChartSeries, si: number): MarkerSymbol =>
    s.markerSymbol ?? MARKER_SYMBOLS[si % MARKER_SYMBOLS.length];

  const plotToViewport = (svg: SVGSVGElement, px: number, py: number) => {
    const rect = svg.getBoundingClientRect();
    return { x: rect.left + ml + px, y: rect.top + mt + py };
  };

  const findNearest2D = (plotX: number, plotY: number) => {
    let closest: TooltipEntry | null = null;
    let minDist = Infinity;
    const entries: TooltipEntry[] = [];
    for (let i = 0; i < visibleSeries.length; i++) {
      const s = visibleSeries[i];
      const sYScale = getYScale(s);
      for (const p of s.data) {
        const dx = xScale(p.x) - plotX;
        const dy = sYScale(p.y) - plotY;
        const dist = dx * dx + dy * dy;
        const entry: TooltipEntry = {
          series: s,
          point: p,
          color: getColor(s, i),
          markerSymbol: getSymbol(s, i),
        };
        entries.push(entry);
        if (dist < minDist) {
          minDist = dist;
          closest = entry;
        }
      }
    }
    return { entries, closest };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const svg = (e.currentTarget as SVGGElement).ownerSVGElement;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const plotX = e.clientX - rect.left - ml;
    const plotY = e.clientY - rect.top - mt;

    if (plotX < 0 || plotX > plotWidth || plotY < 0 || plotY > plotHeight) {
      tooltipHandlers.onTooltipHide();
      tooltipHandlers.onHoveredSeriesChange(null);
      return;
    }

    const { entries, closest } = findNearest2D(plotX, plotY);
    if (!closest) {
      tooltipHandlers.onTooltipHide();
      return;
    }

    let finalEntries: TooltipEntry[];
    if (tooltipMode === "shared") {
      const targetX = xScale(closest.point.x);
      finalEntries = [];
      for (let i = 0; i < visibleSeries.length; i++) {
        const s = visibleSeries[i];
        let best: ChartDataPoint | null = null;
        let bestDist = Infinity;
        for (const p of s.data) {
          const d = Math.abs(xScale(p.x) - targetX);
          if (d < bestDist) {
            bestDist = d;
            best = p;
          }
        }
        if (best) {
          finalEntries.push({
            series: s,
            point: best,
            color: getColor(s, i),
            markerSymbol: getSymbol(s, i),
          });
        }
      }
      tooltipHandlers.onHoveredSeriesChange(null);
    } else {
      finalEntries = [closest];
      tooltipHandlers.onHoveredSeriesChange(closest.series.id);
    }

    tooltipHandlers.onActiveXChange(xScale(closest.point.x));

    const anchor = tooltipMode === "single" && !tooltipFollowCursor;
    let pos = { x: e.clientX, y: e.clientY };
    if (anchor && svg) {
      const sYScale = getYScale(closest.series);
      pos = plotToViewport(
        svg,
        xScale(closest.point.x),
        sYScale(closest.point.y)
      );
    }

    const xVal = closest.point.x;
    const xLabel = categories?.[xVal] ?? String(xVal);
    tooltipHandlers.onTooltipShow(finalEntries, pos, xLabel, anchor);
  };

  const handleMouseLeave = () => {
    tooltipHandlers.onTooltipHide();
    tooltipHandlers.onActiveXChange(null);
    tooltipHandlers.onHoveredSeriesChange(null);
  };

  return (
    <g
      className="k-chart-scatter"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={e => {
        mouseDownPos.current = { x: e.clientX, y: e.clientY };
      }}
      onClick={e => {
        if (!onPointClick) return;
        if (mouseDownPos.current) {
          const dx = e.clientX - mouseDownPos.current.x;
          const dy = e.clientY - mouseDownPos.current.y;
          if (dx * dx + dy * dy > 25) return;
        }
        const svg = (e.currentTarget as SVGGElement).ownerSVGElement;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const plotX = e.clientX - rect.left - ml;
        const plotY = e.clientY - rect.top - mt;
        if (plotX < 0 || plotX > plotWidth || plotY < 0 || plotY > plotHeight)
          return;
        const { closest } = findNearest2D(plotX, plotY);
        if (closest) onPointClick(closest.point, closest.series);
      }}
    >
      <rect
        x={0}
        y={0}
        width={plotWidth}
        height={plotHeight}
        fill="transparent"
        pointerEvents="all"
      />

      <defs>
        {visibleSeries.map((s, si) => {
          const pat = s.fill?.pattern;
          if (!pat) return null;
          return <ChartPattern key={s.id} type={pat} color={getColor(s, si)} />;
        })}
      </defs>

      {/* Connecting lines */}
      {showLine &&
        visibleSeries.map((s, si) => {
          const color = getColor(s, si);
          const sYScale = getYScale(s);
          const sorted = [...s.data].sort((a, b) => a.x - b.x);
          const path = buildPath(sorted, xScale, sYScale, curve);
          const isDimmed = hoveredSeries != null && hoveredSeries !== s.id;
          return (
            <path
              key={`line-${s.id}`}
              d={path}
              fill="none"
              stroke={color}
              strokeWidth={
                hoveredSeries === s.id ? strokeWidth + 1 : strokeWidth
              }
              strokeDasharray={dashStyleToArray(s.dashStyle ?? "solid")}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={isDimmed ? 0.2 : 1}
              pointerEvents="none"
            />
          );
        })}

      {/* Trendlines */}
      {visibleSeries.map((s, si) => {
        if (!s.trendline) return null;
        const tl = s.trendline;
        const trendData = computeTrendline(s.data, tl);
        if (trendData.length < 2) return null;
        const color = tl.color ?? getColor(s, si);
        return (
          <path
            key={`tl-${s.id}`}
            className="k-chart-trendline"
            d={buildPath(trendData, xScale, getYScale(s), "linear")}
            fill="none"
            stroke={color}
            strokeWidth={tl.lineWidth ?? 2}
            strokeDasharray={dashStyleToArray(tl.dashStyle ?? "dash")}
            strokeLinecap="round"
            opacity={0.7}
            pointerEvents="none"
            role="img"
            aria-label={`${tl.label ?? s.name + " trend"}: ${tl.type}`}
          />
        );
      })}

      {/* Points */}
      {visibleSeries.map((s, si) => {
        const color = getColor(s, si);
        const symbol = getSymbol(s, si);
        const sYScale = getYScale(s);
        const isDimmed = hoveredSeries != null && hoveredSeries !== s.id;
        const fillValue = s.fill?.pattern
          ? patternFill(s.fill.pattern, color)
          : color;
        return (
          <g
            key={s.id}
            className={`k-chart-scatter-series ${s.className || ""}`}
            opacity={isDimmed ? 0.2 : 1}
          >
            {s.data.map((p, pi) => {
              const cx = xScale(p.x);
              const cy = sYScale(p.y);
              if (cx < 0 || cx > plotWidth || cy < 0 || cy > plotHeight)
                return null;
              const r = getRadius(p, s);
              const globalSi = visibleSeries.indexOf(s);
              const isFocused =
                focusedSeriesIndex === globalSi && focusedPointIndex === pi;
              return (
                <React.Fragment key={pi}>
                  {renderMarker(symbol, cx, cy, r, {
                    fill: p.color ?? fillValue,
                    stroke: isFocused
                      ? "var(--kreati-chart-text)"
                      : "var(--kreati-chart-bg)",
                    strokeWidth: isFocused ? 3 : 2,
                    style: p.style,
                    className: p.className,
                  } as React.SVGProps<SVGElement>)}
                </React.Fragment>
              );
            })}
          </g>
        );
      })}

      {/* Data labels */}
      {showDataLabels &&
        visibleSeries.map((s, si) => {
          const color = getColor(s, si);
          const fmt = s.dataLabelFormat ?? ((p: ChartDataPoint) => String(p.y));
          const sYScale = getYScale(s);
          return (
            <g key={`dl-${s.id}`} pointerEvents="none">
              {s.data.map((p, pi) => {
                const cx = xScale(p.x);
                const cy = sYScale(p.y);
                if (cx < 0 || cx > plotWidth || cy < 0 || cy > plotHeight)
                  return null;
                const r = getRadius(p, s);
                const anchor =
                  cx < 30 ? "start" : cx > plotWidth - 30 ? "end" : "middle";
                return (
                  <text
                    key={pi}
                    x={cx}
                    y={cy > r + 14 ? cy - r - 6 : cy + r + 14}
                    className="k-chart-data-label"
                    textAnchor={anchor}
                    fill={color}
                  >
                    {fmt(p)}
                  </text>
                );
              })}
            </g>
          );
        })}

      {/* Focus ring */}
      {focusedSeriesIndex != null &&
        focusedPointIndex != null &&
        (() => {
          const s = visibleSeries[focusedSeriesIndex];
          if (!s) return null;
          const p = s.data[focusedPointIndex];
          if (!p) return null;
          const cx = xScale(p.x);
          const cy = getYScale(s)(p.y);
          if (cx < 0 || cx > plotWidth || cy < 0 || cy > plotHeight)
            return null;
          return (
            <circle
              cx={cx}
              cy={cy}
              r={getRadius(p, s) + 4}
              className="k-chart-focus-ring"
              pointerEvents="none"
            />
          );
        })()}
    </g>
  );
};
