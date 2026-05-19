import React, { useState, useCallback, useRef } from "react";
import { CartesianChart } from "./CartesianChart";
import type { CartesianChartProps } from "./CartesianChart";
import { ChartTooltip, findNearestPointIndex } from "../core/ChartTooltip";
import type { TooltipMode, TooltipEntry } from "../core/ChartTooltip";
import { StrictClip } from "../core/ChartCanvas";
import { dashStyleToArray, splitByZones } from "../core/utils";
import { buildPath, buildAreaPath } from "../core/paths";
import type { CurveType } from "../core/paths";
import { computeTrendline } from "../core/trendline";
import { ChartPattern, patternFill } from "../core/patterns";
import type { ChartDataPoint } from "../core/types";

export interface LineChartProps extends Omit<CartesianChartProps, "children"> {
  /** Line interpolation. Default: 'smooth' */
  curve?: CurveType;
  /** Show data point markers on nearest X. Default: true */
  showPoints?: boolean;
  /** Marker size (radius). Default: 5 */
  pointSize?: number;
  /** Default stroke width. Default: 3 */
  strokeWidth?: number;
  /** Show filled area under the line. Default: false */
  showArea?: boolean;
  /** Area fill opacity. Default: 0.15 */
  areaOpacity?: number;
  /** Tooltip mode. Default: 'single' */
  tooltipMode?: TooltipMode;
  /** Custom tooltip render */
  tooltipRender?: (entries: TooltipEntry[]) => React.ReactNode;
  /** Force tooltip to follow cursor instead of anchoring to the marker. Default: false */
  tooltipFollowCursor?: boolean;
}

/**
 * LineChart component for line-based data visualization.
 *
 * @description Renders data series as smooth or linear lines. Markers and
 * tooltip activate based on mouse X proximity — no need to hover exactly
 * on a point. Supports area fill, dash styles, and per-series customization.
 *
 * @example
 * ```tsx
 * <LineChart
 *   series={[{ id: "temp", name: "Temperature", data: [...] }]}
 *   xAxis={{ label: "Time" }}
 *   yAxis={{ label: "Value" }}
 * />
 * ```
 */
export const LineChart = ({
  curve = "smooth",
  showPoints = true,
  pointSize = 5,
  strokeWidth: defaultStrokeWidth = 3,
  showArea = false,
  areaOpacity = 0.15,
  tooltipMode = "single",
  tooltipRender,
  tooltipFollowCursor = false,
  showCrosshair = false,
  className = "",
  style,
  ref,
  ...cartesianProps
}: LineChartProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);
  const [activeX, setActiveX] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [tooltipEntries, setTooltipEntries] = useState<TooltipEntry[]>([]);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipXLabel, setTooltipXLabel] = useState<string | undefined>();
  const [tooltipAnchored, setTooltipAnchored] = useState(false);
  const prevFocusRef = useRef<{ si: number | null; pi: number | null }>({
    si: null,
    pi: null,
  });
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null);

  return (
    <div ref={ref} className={className} style={style}>
      <CartesianChart showCrosshair={false} {...cartesianProps}>
        {({
          xScale,
          yScale,
          yScales,
          plotWidth,
          plotHeight,
          visibleSeries,
          getColor,
          focusedPointIndex,
          focusedSeriesIndex,
        }) => {
          const ml = cartesianProps.margins?.left ?? 50;
          const mt = cartesianProps.margins?.top ?? 20;

          /** Resolve the Y scale for a series (multi-axis support) */
          const getYScale = (s: { yAxisId?: string }) =>
            yScales[s.yAxisId ?? "default"] ?? yScale;

          /** Convert plot coordinates to viewport coordinates using an SVG element */
          const plotToViewport = (
            svg: SVGSVGElement,
            px: number,
            py: number
          ) => {
            const rect = svg.getBoundingClientRect();
            return { x: rect.left + ml + px, y: rect.top + mt + py };
          };

          const resolveTooltipPos = (
            svg: SVGSVGElement | null,
            entries: TooltipEntry[],
            clientX: number,
            clientY: number
          ) => {
            const anchor = tooltipMode === "single" && !tooltipFollowCursor;
            setTooltipAnchored(anchor);
            if (anchor && svg && entries.length > 0) {
              const e0 = entries[0];
              const p = e0.point;
              return plotToViewport(
                svg,
                xScale(p.x),
                getYScale(e0.series)(p.y)
              );
            }
            return { x: clientX, y: clientY };
          };

          const handleMouseMove = (
            plotX: number,
            plotY: number,
            clientX: number,
            clientY: number,
            svg: SVGSVGElement | null
          ) => {
            if (plotX < 0 || plotX > plotWidth) {
              setTooltipVisible(false);
              setActiveX(null);
              return;
            }

            // Find nearest X across all series
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

              entries.push({
                series,
                point,
                color: getColor(series, i),
              });
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
              setHoveredSeries(closest.series.id);
            } else {
              setHoveredSeries(null);
            }

            setTooltipEntries(finalEntries);
            setActiveX(nearestPixelX);
            setTooltipPos(
              resolveTooltipPos(svg, finalEntries, clientX, clientY)
            );
            setTooltipVisible(finalEntries.length > 0);

            // X label from categories or value
            if (finalEntries.length > 0) {
              const xVal = finalEntries[0].point.x;
              const categories = cartesianProps.xAxis?.categories;
              setTooltipXLabel(categories?.[xVal] ?? String(xVal));
            }
          };

          const handleMouseLeave = () => {
            setTooltipVisible(false);
            setActiveX(null);
            setHoveredSeries(null);
          };

          return (
            <g
              className="k-chart-lines"
              onMouseMove={e => {
                const svg = (e.currentTarget as SVGGElement).ownerSVGElement;
                if (!svg) return;
                const rect = svg.getBoundingClientRect();
                const plotX = e.clientX - rect.left - ml;
                const plotY = e.clientY - rect.top - mt;
                handleMouseMove(plotX, plotY, e.clientX, e.clientY, svg);
              }}
              onMouseLeave={handleMouseLeave}
              onTouchStart={e => {
                if (e.touches.length !== 1) return;
                const touch = e.touches[0];
                const svg = (e.currentTarget as SVGGElement).ownerSVGElement;
                if (!svg) return;
                const rect = svg.getBoundingClientRect();
                const plotX = touch.clientX - rect.left - ml;
                const plotY = touch.clientY - rect.top - mt;
                handleMouseMove(
                  plotX,
                  plotY,
                  touch.clientX,
                  touch.clientY,
                  svg
                );
              }}
              onMouseDown={e => {
                mouseDownPos.current = { x: e.clientX, y: e.clientY };
              }}
              onClick={e => {
                if (!cartesianProps.onPointClick) return;
                // Suppress click if mouse moved more than 5px (was a drag/zoom/pan)
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
                for (let i = 0; i < visibleSeries.length; i++) {
                  const s = visibleSeries[i];
                  const idx = findNearestPointIndex(s.data, xScale, plotX);
                  if (idx < 0) continue;
                  const p = s.data[idx];
                  const dx = xScale(p.x) - plotX;
                  const dy = getYScale(s)(p.y) - plotY;
                  const dist = dx * dx + dy * dy;
                  if (!closest || dist < closest.dist)
                    closest = { series: s, point: p, dist };
                }
                if (closest)
                  cartesianProps.onPointClick(closest.point, closest.series);
              }}
            >
              {/* Full-area invisible rect for mouse tracking */}
              <rect
                x={0}
                y={0}
                width={plotWidth}
                height={plotHeight}
                fill="transparent"
                pointerEvents="all"
              />

              <StrictClip>
                {/* Error bars */}
                {visibleSeries.map((series, seriesIdx) => {
                  if (
                    !series.errorMargin &&
                    !series.data.some(
                      p => p.error != null || p.errorHigh != null
                    )
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
                  const markerSize = series.markerSize ?? pointSize;
                  const isHovered = hoveredSeries === series.id;
                  const isDimmed = hoveredSeries != null && !isHovered;

                  const sYScale = getYScale(series);
                  const path = buildPath(series.data, xScale, sYScale, curve);
                  const areaPath = showArea
                    ? buildAreaPath(
                        series.data,
                        xScale,
                        sYScale,
                        plotHeight,
                        curve
                      )
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
                      {/* Area fill */}
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

                      {/* Hover target */}
                      <path
                        d={path}
                        fill="none"
                        stroke="transparent"
                        strokeWidth={Math.max(sw * 4, 16)}
                        pointerEvents="stroke"
                      />

                      {/* Visible line */}
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
              </StrictClip>

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
                      // Autoflip: horizontal anchor near edges
                      const anchor =
                        cx < 30
                          ? "start"
                          : cx > plotWidth - 30
                            ? "end"
                            : "middle";
                      // Autoflip: show below point if too close to top
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

              {/* Active markers at nearest X */}
              {showPoints &&
                activeX != null &&
                visibleSeries.map((series, seriesIdx) => {
                  const color = getColor(series, seriesIdx);
                  const markerSize = series.markerSize ?? pointSize;
                  const idx = findNearestPointIndex(
                    series.data,
                    xScale,
                    activeX
                  );
                  if (idx < 0) return null;
                  const point = series.data[idx];
                  const cx = xScale(point.x);
                  const cy = getYScale(series)(point.y);
                  if (cy < 0 || cy > plotHeight) return null;
                  const dimmed =
                    hoveredSeries != null && hoveredSeries !== series.id;

                  return (
                    <circle
                      key={series.id}
                      cx={cx}
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

              {/* Vertical indicator line at active X — only when crosshair enabled */}
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

              {/* Keyboard focus indicator + tooltip sync */}
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

                  // Sync tooltip to keyboard-focused point
                  if (
                    prevFocusRef.current.si !== focusedSeriesIndex ||
                    prevFocusRef.current.pi !== focusedPointIndex
                  ) {
                    prevFocusRef.current = {
                      si: focusedSeriesIndex,
                      pi: focusedPointIndex,
                    };
                    const svg =
                      (document.querySelector(
                        ".k-cartesian-chart svg.k-chart"
                      ) as SVGSVGElement) ?? null;
                    const vp = svg
                      ? plotToViewport(svg, cx, cy)
                      : { x: 0, y: 0 };
                    const xVal = p.x;
                    const categories = cartesianProps.xAxis?.categories;
                    // Schedule state updates to avoid setting state during render
                    queueMicrotask(() => {
                      setTooltipEntries([
                        {
                          series: s,
                          point: p,
                          color: getColor(s, focusedSeriesIndex),
                        },
                      ]);
                      setTooltipPos(vp);
                      setTooltipAnchored(true);
                      setTooltipVisible(true);
                      setTooltipXLabel(categories?.[xVal] ?? String(xVal));
                      setActiveX(cx);
                    });
                  }

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
              {/* Clear tooltip when keyboard focus is lost */}
              {(focusedSeriesIndex == null || focusedPointIndex == null) &&
                prevFocusRef.current.si != null &&
                (() => {
                  prevFocusRef.current = { si: null, pi: null };
                  queueMicrotask(() => {
                    setTooltipVisible(false);
                    setActiveX(null);
                  });
                  return null;
                })()}
            </g>
          );
        }}
      </CartesianChart>

      {/* Tooltip portal */}
      <ChartTooltip
        entries={tooltipEntries}
        x={tooltipPos.x}
        y={tooltipPos.y}
        visible={tooltipVisible}
        customRender={tooltipMode === "custom" ? tooltipRender : undefined}
        xLabel={tooltipXLabel}
        anchored={tooltipAnchored}
      />
    </div>
  );
};
