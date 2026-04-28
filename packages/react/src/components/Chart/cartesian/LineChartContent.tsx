import React, { useRef } from "react";
import { findNearestPointIndex } from "../core/ChartTooltip";
import type { TooltipEntry } from "../core/ChartTooltip";
import { dashStyleToArray, splitByZones } from "../core/utils";
import { buildPath, buildAreaPath } from "../core/paths";
import type { CurveType } from "../core/paths";
import { computeTrendline } from "../core/trendline";
import { ChartPattern, patternFill } from "../core/patterns";
import type { ChartDataPoint } from "../core/types";
import type { ChartContentBaseProps } from "./chartContentTypes";

export interface LineChartContentProps extends ChartContentBaseProps {
  curve?: CurveType;
  showPoints?: boolean;
  pointSize?: number;
  strokeWidth?: number;
  showArea?: boolean;
  areaOpacity?: number;
  showCrosshair?: boolean;
}

/**
 * LineChartContent — SVG rendering logic for line charts.
 * Designed to be used inside a CartesianChart render prop.
 * @internal
 */
export const LineChartContent: React.FC<LineChartContentProps> = ({
  ctx,
  curve = "smooth",
  showPoints = true,
  pointSize = 5,
  strokeWidth: defaultStrokeWidth = 3,
  showArea = false,
  areaOpacity = 0.15,
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

  const getYScale = (s: { yAxisId?: string }) =>
    yScales[s.yAxisId ?? "default"] ?? yScale;

  const plotToViewport = (svg: SVGSVGElement, px: number, py: number) => {
    const rect = svg.getBoundingClientRect();
    return { x: rect.left + ml + px, y: rect.top + mt + py };
  };

  const handleMouseMove = (
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
      ) {
        nearestPixelX = px;
      }
      entries.push({ series, point, color: getColor(series, i) });
    }

    let finalEntries = entries;
    if (tooltipMode === "single" && entries.length > 0) {
      let closest = entries[0];
      let minDist = Math.abs(
        getYScale(closest.series)(closest.point.y) - plotY
      );
      for (let j = 1; j < entries.length; j++) {
        const dist = Math.abs(
          getYScale(entries[j].series)(entries[j].point.y) - plotY
        );
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
      pos = plotToViewport(
        svg,
        xScale(e0.point.x),
        getYScale(e0.series)(e0.point.y)
      );
    }

    const xVal = finalEntries[0]?.point.x;
    const xLabel = categories?.[xVal ?? 0] ?? String(xVal ?? 0);
    tooltipHandlers.onTooltipShow(
      finalEntries,
      pos,
      finalEntries.length > 0 ? xLabel : undefined,
      anchor
    );
  };

  const handleMouseLeave = () => {
    tooltipHandlers.onTooltipHide();
    tooltipHandlers.onActiveXChange(null);
    tooltipHandlers.onHoveredSeriesChange(null);
  };

  return (
    <g
      className="k-chart-lines"
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

      {/* Error bars */}
      {visibleSeries.map((series, seriesIdx) => {
        if (
          !series.errorMargin &&
          !series.data.some(p => p.error != null || p.errorHigh != null)
        )
          return null;
        const color = getColor(series, seriesIdx);
        const ebYScale = getYScale(series);
        const capW = 4;
        return (
          <g
            key={`eb-${series.id}`}
            className="k-chart-error-bars"
            pointerEvents="none"
            role="img"
            aria-label={`Error bars for ${series.name}`}
          >
            {series.data.map((point, pi) => {
              const hi =
                point.errorHigh ??
                (point.error != null
                  ? point.y + point.error
                  : series.errorMargin != null
                    ? point.y + series.errorMargin
                    : null);
              const lo =
                point.errorLow ??
                (point.error != null
                  ? point.y - point.error
                  : series.errorMargin != null
                    ? point.y - series.errorMargin
                    : null);
              if (hi == null || lo == null) return null;
              const cx = xScale(point.x);
              const yHi = ebYScale(hi);
              const yLo = ebYScale(lo);
              if (cx < 0 || cx > plotWidth) return null;
              return (
                <g key={pi}>
                  <line
                    x1={cx}
                    y1={yHi}
                    x2={cx}
                    y2={yLo}
                    stroke={color}
                    strokeWidth={1.5}
                    opacity={0.6}
                  />
                  <line
                    x1={cx - capW}
                    y1={yHi}
                    x2={cx + capW}
                    y2={yHi}
                    stroke={color}
                    strokeWidth={1.5}
                    opacity={0.6}
                  />
                  <line
                    x1={cx - capW}
                    y1={yLo}
                    x2={cx + capW}
                    y2={yLo}
                    stroke={color}
                    strokeWidth={1.5}
                    opacity={0.6}
                  />
                </g>
              );
            })}
          </g>
        );
      })}

      {/* Pattern definitions */}
      {showArea && (
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
      )}

      {visibleSeries.map((series, seriesIdx) => {
        const color = getColor(series, seriesIdx);
        const sw = series.lineWidth ?? defaultStrokeWidth;
        const dash = dashStyleToArray(series.dashStyle ?? "solid");
        const isHovered = hoveredSeries === series.id;
        const isDimmed = hoveredSeries != null && !isHovered;
        const sYScale = getYScale(series);
        const path = buildPath(series.data, xScale, sYScale, curve);
        const areaPath = showArea
          ? buildAreaPath(series.data, xScale, sYScale, plotHeight, curve)
          : "";
        const areaFillValue = series.fill?.pattern
          ? patternFill(series.fill.pattern, color)
          : color;

        return (
          <g
            key={series.id}
            className={`k-chart-line-series ${series.className || ""}`}
            opacity={isDimmed ? 0.2 : 1}
          >
            {showArea && (
              <path
                d={areaPath}
                fill={areaFillValue}
                opacity={
                  series.fill?.pattern
                    ? (series.fill?.opacity ?? 0.6)
                    : areaOpacity
                }
                pointerEvents="none"
              />
            )}
            <path
              d={path}
              fill="none"
              stroke="transparent"
              strokeWidth={Math.max(sw * 4, 16)}
              pointerEvents="stroke"
            />
            {series.zones && series.zones.length > 0 ? (
              splitByZones(
                series.data,
                series.zones,
                color,
                series.dashStyle
              ).map((seg, si) => (
                <path
                  key={si}
                  d={buildPath(
                    seg.points as ChartDataPoint[],
                    xScale,
                    sYScale,
                    curve
                  )}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={isHovered ? sw + 1 : sw}
                  strokeDasharray={dashStyleToArray(
                    seg.dashStyle ?? series.dashStyle ?? "solid"
                  )}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pointerEvents="none"
                />
              ))
            ) : (
              <path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={isHovered ? sw + 1 : sw}
                strokeDasharray={dash}
                strokeLinecap="round"
                strokeLinejoin="round"
                pointerEvents="none"
              />
            )}
          </g>
        );
      })}

      {/* Trendlines */}
      {visibleSeries.map((series, seriesIdx) => {
        if (!series.trendline) return null;
        const tl = series.trendline;
        const trendData = computeTrendline(series.data, tl);
        if (trendData.length < 2) return null;
        const color = tl.color ?? getColor(series, seriesIdx);
        const tlPath = buildPath(
          trendData,
          xScale,
          getYScale(series),
          "linear"
        );
        const dash = dashStyleToArray(tl.dashStyle ?? "dash");
        return (
          <path
            key={`tl-${series.id}`}
            className="k-chart-trendline"
            d={tlPath}
            fill="none"
            stroke={color}
            strokeWidth={tl.lineWidth ?? 2}
            strokeDasharray={dash}
            strokeLinecap="round"
            opacity={0.7}
            pointerEvents="none"
            role="img"
            aria-label={`${tl.label ?? series.name + " trend"}: ${tl.type}`}
          />
        );
      })}

      {/* Data labels */}
      {visibleSeries.map((series, seriesIdx) => {
        if (!series.showDataLabels) return null;
        const color = getColor(series, seriesIdx);
        const fmt = series.dataLabelFormat ?? (p => String(p.y));
        const dlYScale = getYScale(series);
        return (
          <g key={`dl-${series.id}`} pointerEvents="none">
            {series.data.map((point, pi) => {
              const cx = xScale(point.x);
              const cy = dlYScale(point.y);
              if (cx < 0 || cx > plotWidth || cy < 0 || cy > plotHeight)
                return null;
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

      {/* Active markers */}
      {showPoints &&
        activeX != null &&
        visibleSeries.map((series, seriesIdx) => {
          const color = getColor(series, seriesIdx);
          const markerSize = series.markerSize ?? pointSize;
          const idx = findNearestPointIndex(series.data, xScale, activeX);
          if (idx < 0) return null;
          const point = series.data[idx];
          const cy = getYScale(series)(point.y);
          if (cy < 0 || cy > plotHeight) return null;
          const dimmed = hoveredSeries != null && hoveredSeries !== series.id;
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

      {/* Keyboard focus ring */}
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
              r={pointSize + 4}
              className="k-chart-focus-ring"
              pointerEvents="none"
            />
          );
        })()}
    </g>
  );
};
