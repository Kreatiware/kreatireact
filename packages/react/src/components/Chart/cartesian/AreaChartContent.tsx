import React, { useMemo, useRef, useCallback } from "react";
import { findNearestPointIndex } from "../core/ChartTooltip";
import type { TooltipEntry } from "../core/ChartTooltip";
import { buildPath, buildStackedAreaPath, buildAreaPath } from "../core/paths";
import type { CurveType } from "../core/paths";
import { dashStyleToArray } from "../core/utils";
import { ChartPattern, patternFill } from "../core/patterns";
import type { ChartDataPoint } from "../core/types";
import type { ChartContentBaseProps } from "./chartContentTypes";

export interface AreaChartContentProps extends ChartContentBaseProps {
  stackMode?: "normal" | "stacked" | "stacked-100";
  curve?: CurveType;
  areaOpacity?: number;
  showLine?: boolean;
  strokeWidth?: number;
  showPoints?: boolean;
  pointSize?: number;
  showDataLabels?: boolean;
  showCrosshair?: boolean;
}

/**
 * AreaChartContent — SVG rendering logic for area charts.
 * Designed to be used inside a CartesianChart render prop.
 * @internal
 */
export const AreaChartContent: React.FC<AreaChartContentProps> = ({
  ctx,
  stackMode = "normal",
  curve = "smooth",
  areaOpacity = 0.4,
  showLine = true,
  strokeWidth: defaultStrokeWidth = 2,
  showPoints = true,
  pointSize = 5,
  showDataLabels = false,
  showCrosshair = false,
  tooltipMode = "single",
  tooltipFollowCursor = false,
  tooltipHandlers,
  onPointClick,
  categories,
  margins,
  hoveredSeries,
  activeX,
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
  const isStacked = stackMode === "stacked" || stackMode === "stacked-100";

  const getYScale = (s: { yAxisId?: string }) =>
    yScales[s.yAxisId ?? "default"] ?? yScale;

  const plotToViewport = (svg: SVGSVGElement, px: number, py: number) => {
    const rect = svg.getBoundingClientRect();
    return { x: rect.left + ml + px, y: rect.top + mt + py };
  };

  const stackedSeries = useMemo(() => {
    if (!isStacked) return null;
    const allX = Array.from(
      new Set(visibleSeries.flatMap(s => s.data.map(p => p.x)))
    ).sort((a, b) => a - b);
    const totals: Record<number, number> = {};
    if (stackMode === "stacked-100") {
      for (const x of allX)
        totals[x] = visibleSeries.reduce(
          (sum, s) => sum + Math.abs(s.data.find(d => d.x === x)?.y ?? 0),
          0
        );
    }
    const cumulative: Record<number, number> = {};
    for (const x of allX) cumulative[x] = 0;
    return visibleSeries.map(s => {
      const bottom: { x: number; y: number }[] = [];
      const top: { x: number; y: number }[] = [];
      for (const x of allX) {
        let val = s.data.find(d => d.x === x)?.y ?? 0;
        if (stackMode === "stacked-100" && totals[x] > 0)
          val = (val / totals[x]) * 100;
        bottom.push({ x, y: cumulative[x] });
        cumulative[x] += val;
        top.push({ x, y: cumulative[x] });
      }
      return { seriesId: s.id, top, bottom };
    });
  }, [visibleSeries, isStacked, stackMode]);

  const handleMouseMove = useCallback(
    (
      plotX: number,
      plotY: number,
      clientX: number,
      clientY: number,
      svg: SVGSVGElement | null
    ) => {
      if (plotX < 0 || plotX > plotWidth) {
        tooltipHandlers.onTooltipHide();
        tooltipHandlers.onActiveXChange(null);
        return;
      }
      const entries: TooltipEntry[] = [];
      let nearestPixelX: number | null = null;
      for (let i = 0; i < visibleSeries.length; i++) {
        const series = visibleSeries[i];
        const idx = findNearestPointIndex(series.data, xScale, plotX);
        if (idx < 0) continue;
        const point = series.data[idx];
        const px = xScale(point.x);
        if (
          nearestPixelX === null ||
          Math.abs(px - plotX) < Math.abs(nearestPixelX - plotX)
        )
          nearestPixelX = px;
        entries.push({ series, point, color: getColor(series, i) });
      }
      let finalEntries = entries;
      if (tooltipMode === "single" && entries.length > 0) {
        let closest = entries[0];
        const stackedY = (ei: number) => {
          if (!isStacked || !stackedSeries)
            return getYScale(entries[ei].series)(entries[ei].point.y);
          const si = visibleSeries.findIndex(
            s => s.id === entries[ei].series.id
          );
          const tp = stackedSeries[si]?.top.find(
            t => t.x === entries[ei].point.x
          );
          return tp
            ? getYScale(entries[ei].series)(tp.y)
            : getYScale(entries[ei].series)(entries[ei].point.y);
        };
        let minDist = Math.abs(stackedY(0) - plotY);
        for (let j = 1; j < entries.length; j++) {
          const dist = Math.abs(stackedY(j) - plotY);
          if (dist < minDist) {
            minDist = dist;
            closest = entries[j];
          }
        }
        finalEntries = [closest];
        tooltipHandlers.onHoveredSeriesChange(closest.series.id);
      } else {
        tooltipHandlers.onHoveredSeriesChange(null);
      }
      tooltipHandlers.onActiveXChange(nearestPixelX);
      const anchor = tooltipMode === "single" && !tooltipFollowCursor;
      let pos = { x: clientX, y: clientY };
      if (anchor && svg && finalEntries.length > 0) {
        const e0 = finalEntries[0];
        let py = getYScale(e0.series)(e0.point.y);
        if (isStacked && stackedSeries) {
          const si = visibleSeries.findIndex(s => s.id === e0.series.id);
          const tp = stackedSeries[si]?.top.find(t => t.x === e0.point.x);
          if (tp) py = getYScale(e0.series)(tp.y);
        }
        pos = plotToViewport(svg, xScale(e0.point.x), py);
      }
      const xVal = finalEntries[0]?.point.x;
      tooltipHandlers.onTooltipShow(
        finalEntries,
        pos,
        finalEntries.length > 0
          ? (categories?.[xVal ?? 0] ?? String(xVal ?? 0))
          : undefined,
        anchor
      );
    },
    [
      visibleSeries,
      xScale,
      plotWidth,
      tooltipMode,
      getColor,
      isStacked,
      stackedSeries,
    ]
  );

  const handleMouseLeave = useCallback(() => {
    tooltipHandlers.onTooltipHide();
    tooltipHandlers.onActiveXChange(null);
    tooltipHandlers.onHoveredSeriesChange(null);
  }, []);

  const highlighted =
    focusedSeriesIndex != null
      ? visibleSeries[focusedSeriesIndex]?.id
      : hoveredSeries;

  return (
    <g
      className="k-chart-areas"
      onMouseMove={e => {
        const svg = (e.currentTarget as SVGGElement).ownerSVGElement;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        handleMouseMove(
          e.clientX - rect.left - ml,
          e.clientY - rect.top - mt,
          e.clientX,
          e.clientY,
          svg
        );
      }}
      onMouseLeave={handleMouseLeave}
      onTouchStart={e => {
        if (e.touches.length !== 1) return;
        const touch = e.touches[0];
        const svg = (e.currentTarget as SVGGElement).ownerSVGElement;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        handleMouseMove(
          touch.clientX - rect.left - ml,
          touch.clientY - rect.top - mt,
          touch.clientX,
          touch.clientY,
          svg
        );
      }}
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
        if (plotX < 0 || plotX > plotWidth) return;
        let closest: {
          series: (typeof visibleSeries)[0];
          point: ChartDataPoint;
          dist: number;
        } | null = null;
        for (const s of visibleSeries) {
          const idx = findNearestPointIndex(s.data, xScale, plotX);
          if (idx < 0) continue;
          const p = s.data[idx];
          const ddx = xScale(p.x) - plotX;
          const ddy = getYScale(s)(p.y) - plotY;
          const dist = ddx * ddx + ddy * ddy;
          if (!closest || dist < closest.dist)
            closest = { series: s, point: p, dist };
        }
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
        {visibleSeries.map((series, seriesIdx) => {
          const pat = series.fill?.pattern;
          if (!pat) return null;
          return (
            <ChartPattern
              key={series.id}
              type={pat}
              color={getColor(series, seriesIdx)}
            />
          );
        })}
      </defs>

      {visibleSeries.map((series, seriesIdx) => {
        const color = getColor(series, seriesIdx);
        const fillValue = series.fill?.pattern
          ? patternFill(series.fill.pattern, color)
          : color;
        const opacity = series.fill?.pattern
          ? (series.fill?.opacity ?? 0.6)
          : areaOpacity;
        const isDimmed = highlighted != null && highlighted !== series.id;
        const sYScale = getYScale(series);

        let areaPath: string;
        if (isStacked && stackedSeries) {
          const stack = stackedSeries[seriesIdx];
          if (!stack) return null;
          areaPath = buildStackedAreaPath(
            stack.top,
            stack.bottom,
            xScale,
            sYScale,
            curve
          );
        } else {
          areaPath = buildAreaPath(
            series.data,
            xScale,
            sYScale,
            plotHeight,
            curve
          );
        }

        return (
          <g
            key={series.id}
            className={`k-chart-area-series ${series.className || ""}`}
            opacity={isDimmed ? 0.2 : 1}
          >
            <path
              d={areaPath}
              fill={fillValue}
              opacity={opacity}
              pointerEvents="none"
            />
            {showLine && (
              <path
                d={
                  isStacked && stackedSeries
                    ? buildPath(
                        stackedSeries[seriesIdx].top as ChartDataPoint[],
                        xScale,
                        sYScale,
                        curve
                      )
                    : buildPath(series.data, xScale, sYScale, curve)
                }
                fill="none"
                stroke={color}
                strokeWidth={
                  hoveredSeries === series.id
                    ? defaultStrokeWidth + 1
                    : defaultStrokeWidth
                }
                strokeDasharray={dashStyleToArray(series.dashStyle ?? "solid")}
                strokeLinecap="round"
                strokeLinejoin="round"
                pointerEvents="none"
              />
            )}
          </g>
        );
      })}

      {showDataLabels &&
        visibleSeries.map((series, seriesIdx) => {
          const color = getColor(series, seriesIdx);
          const fmt =
            series.dataLabelFormat ?? ((p: ChartDataPoint) => String(p.y));
          const sYScale = getYScale(series);
          return (
            <g key={`dl-${series.id}`} pointerEvents="none">
              {series.data.map((point, pi) => {
                let cy: number;
                if (isStacked && stackedSeries) {
                  const tp = stackedSeries[seriesIdx]?.top.find(
                    t => t.x === point.x
                  );
                  cy = tp ? sYScale(tp.y) : sYScale(point.y);
                } else cy = sYScale(point.y);
                const cx = xScale(point.x);
                if (cx < 0 || cx > plotWidth) return null;
                const anchor =
                  cx < 30 ? "start" : cx > plotWidth - 30 ? "end" : "middle";
                const above = cy > 18;
                return (
                  <text
                    key={pi}
                    x={cx}
                    y={above ? cy - 10 : cy + 16}
                    className="k-chart-data-label"
                    textAnchor={anchor}
                    fill={color}
                  >
                    {fmt(point)}
                  </text>
                );
              })}
            </g>
          );
        })}

      {showPoints &&
        activeX != null &&
        visibleSeries.map((series, seriesIdx) => {
          const color = getColor(series, seriesIdx);
          const markerSize = series.markerSize ?? pointSize;
          const idx = findNearestPointIndex(series.data, xScale, activeX);
          if (idx < 0) return null;
          const point = series.data[idx];
          const sYScale = getYScale(series);
          let cy: number;
          if (isStacked && stackedSeries) {
            const tp = stackedSeries[seriesIdx]?.top.find(t => t.x === point.x);
            cy = tp ? sYScale(tp.y) : sYScale(point.y);
          } else cy = sYScale(point.y);
          if (cy < 0 || cy > plotHeight) return null;
          const dimmed = highlighted != null && highlighted !== series.id;
          return (
            <circle
              key={series.id}
              cx={xScale(point.x)}
              cy={cy}
              r={markerSize}
              fill={color}
              stroke="var(--kreati-chart-bg)"
              strokeWidth={2.5}
              opacity={dimmed ? 0.2 : 1}
              pointerEvents="none"
            />
          );
        })}

      {showCrosshair && activeX != null && (
        <line
          x1={activeX}
          y1={0}
          x2={activeX}
          y2={plotHeight}
          stroke="var(--kreati-chart-crosshair)"
          strokeWidth={1}
          strokeDasharray="3 3"
          pointerEvents="none"
          opacity={0.6}
        />
      )}

      {focusedSeriesIndex != null &&
        focusedPointIndex != null &&
        (() => {
          const s = visibleSeries[focusedSeriesIndex];
          if (!s) return null;
          const p = s.data[focusedPointIndex];
          if (!p) return null;
          const cx = xScale(p.x);
          const sYScale = getYScale(s);
          let cy: number;
          if (isStacked && stackedSeries) {
            const tp = stackedSeries[focusedSeriesIndex]?.top.find(
              t => t.x === p.x
            );
            cy = tp ? sYScale(tp.y) : sYScale(p.y);
          } else cy = sYScale(p.y);
          if (cx < 0 || cx > plotWidth || cy < 0 || cy > plotHeight)
            return null;
          return (
            <circle
              cx={cx}
              cy={cy}
              r={pointSize + 4}
              className="k-chart-focus-ring"
              pointerEvents="none"
            />
          );
        })()}
    </g>
  );
};
