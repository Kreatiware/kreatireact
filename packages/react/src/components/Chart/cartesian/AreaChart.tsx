import React, { forwardRef, useState, useRef, useMemo } from "react";
import { CartesianChart } from "./CartesianChart";
import type { CartesianChartProps } from "./CartesianChart";
import { ChartTooltip, findNearestPointIndex } from "../core/ChartTooltip";
import type { TooltipMode, TooltipEntry } from "../core/ChartTooltip";
import { StrictClip } from "../core/ChartCanvas";
import { buildPath, buildStackedAreaPath, buildAreaPath } from "../core/paths";
import type { CurveType } from "../core/paths";
import { dashStyleToArray } from "../core/utils";
import { ChartPattern, patternFill } from "../core/patterns";
import { niceDomain } from "../core/scales";
import type { ChartDataPoint, ChartSeries } from "../core/types";

export interface AreaChartProps extends Omit<CartesianChartProps, "children"> {
  /** Area stacking mode. Default: 'normal' (overlapping, no stacking) */
  stackMode?: "normal" | "stacked" | "stacked-100";
  /** Line interpolation. Default: 'smooth' */
  curve?: CurveType;
  /** Area fill opacity. Default: 0.4 */
  areaOpacity?: number;
  /** Show line on top of area. Default: true */
  showLine?: boolean;
  /** Line stroke width. Default: 2 */
  strokeWidth?: number;
  /** Show data point markers on nearest X. Default: true */
  showPoints?: boolean;
  /** Marker size (radius). Default: 5 */
  pointSize?: number;
  /** Show data labels. Default: false */
  showDataLabels?: boolean;
  /** Tooltip mode. Default: 'single' */
  tooltipMode?: TooltipMode;
  /** Custom tooltip render */
  tooltipRender?: (entries: TooltipEntry[]) => React.ReactNode;
  /** Force tooltip to follow cursor. Default: false */
  tooltipFollowCursor?: boolean;
}

/**
 * AreaChart component for area-based data visualization.
 *
 * @description Renders data series as filled areas with optional stacking.
 * Supports normal (overlapping), stacked, and stacked-100% modes.
 * Built on CartesianChart with full zoom, pan, export, and keyboard support.
 *
 * @example
 * ```tsx
 * <AreaChart
 *   series={[{ id: "revenue", name: "Revenue", data: [...] }]}
 *   xAxis={{ label: "Month" }}
 *   yAxis={{ label: "Amount" }}
 *   stackMode="stacked"
 * />
 * ```
 */
export const AreaChart = forwardRef<HTMLDivElement, AreaChartProps>(
  (
    {
      stackMode = "normal",
      curve = "smooth",
      areaOpacity = 0.4,
      showLine = true,
      strokeWidth: defaultStrokeWidth = 2,
      showPoints = true,
      pointSize = 5,
      showDataLabels = false,
      tooltipMode = "single",
      tooltipRender,
      tooltipFollowCursor = false,
      showCrosshair = false,
      className = "",
      style,
      ...cartesianProps
    },
    ref
  ) => {
    const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);
    const [activeX, setActiveX] = useState<number | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const [tooltipEntries, setTooltipEntries] = useState<TooltipEntry[]>([]);
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [tooltipXLabel, setTooltipXLabel] = useState<string | undefined>();
    const [tooltipAnchored, setTooltipAnchored] = useState(false);
    const mouseDownPos = useRef<{ x: number; y: number } | null>(null);
    const prevFocusRef = useRef<{ si: number | null; pi: number | null }>({
      si: null,
      pi: null,
    });

    const isStacked = stackMode === "stacked" || stackMode === "stacked-100";

    // Compute stacked Y domain
    const valAxisConfig = useMemo(() => {
      const base = Array.isArray(cartesianProps.yAxis)
        ? cartesianProps.yAxis[0]
        : cartesianProps.yAxis;
      if (base?.max != null) return cartesianProps.yAxis;

      if (stackMode === "stacked-100") {
        return { ...base, min: 0, max: 100 };
      }

      if (stackMode === "stacked") {
        const sums: Record<number, number> = {};
        for (const s of cartesianProps.series) {
          for (const p of s.data) {
            sums[p.x] = (sums[p.x] ?? 0) + p.y;
          }
        }
        const maxSum = Math.max(...Object.values(sums), 0);
        const [nMin, nMax] = niceDomain(0, maxSum);
        return { ...base, min: nMin, max: nMax };
      }

      return cartesianProps.yAxis;
    }, [cartesianProps.yAxis, cartesianProps.series, stackMode]);

    return (
      <div ref={ref} className={className} style={style}>
        <CartesianChart
          showCrosshair={false}
          {...cartesianProps}
          yAxis={valAxisConfig}
        >
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

            const getYScale = (s: { yAxisId?: string }) =>
              yScales[s.yAxisId ?? "default"] ?? yScale;

            const plotToViewport = (
              svg: SVGSVGElement,
              px: number,
              py: number
            ) => {
              const rect = svg.getBoundingClientRect();
              return { x: rect.left + ml + px, y: rect.top + mt + py };
            };

            // Compute stacked data: cumulative Y values per X
            const stackedSeries = (() => {
              if (!isStacked) return null;

              // Collect all unique X values
              const allX = Array.from(
                new Set(visibleSeries.flatMap(s => s.data.map(p => p.x)))
              ).sort((a, b) => a - b);

              // Compute totals for stacked-100
              const totals: Record<number, number> = {};
              if (stackMode === "stacked-100") {
                for (const x of allX) {
                  totals[x] = visibleSeries.reduce((sum, s) => {
                    const p = s.data.find(d => d.x === x);
                    return sum + Math.abs(p?.y ?? 0);
                  }, 0);
                }
              }

              // Build cumulative top/bottom for each series
              const cumulative: Record<number, number> = {};
              for (const x of allX) cumulative[x] = 0;

              return visibleSeries.map(s => {
                const bottom: { x: number; y: number }[] = [];
                const top: { x: number; y: number }[] = [];

                for (const x of allX) {
                  const p = s.data.find(d => d.x === x);
                  let val = p?.y ?? 0;
                  if (stackMode === "stacked-100" && totals[x] > 0) {
                    val = (val / totals[x]) * 100;
                  }
                  bottom.push({ x, y: cumulative[x] });
                  cumulative[x] += val;
                  top.push({ x, y: cumulative[x] });
                }

                return { seriesId: s.id, top, bottom };
              });
            })();

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
                const sYScale = getYScale(e0.series);
                // For stacked, use the stacked Y position
                let py = sYScale(p.y);
                if (isStacked && stackedSeries) {
                  const si = visibleSeries.findIndex(
                    s => s.id === e0.series.id
                  );
                  const stack = stackedSeries[si];
                  if (stack) {
                    const tp = stack.top.find(t => t.x === p.x);
                    if (tp) py = sYScale(tp.y);
                  }
                }
                return plotToViewport(svg, xScale(p.x), py);
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

              const entries: TooltipEntry[] = [];
              let nearestPixelX: number | null = null;

              for (let i = 0; i < visibleSeries.length; i++) {
                const series = visibleSeries[i];
                const idx = findNearestPointIndex(series.data, xScale, plotX);
                if (idx < 0) continue;
                const point = series.data[idx];
                const _px = xScale(point.x);
                if (
                  nearestPixelX === null ||
                  Math.abs(_px - plotX) < Math.abs(nearestPixelX - plotX)
                ) {
                  nearestPixelX = _px;
                }
                entries.push({ series, point, color: getColor(series, i) });
              }

              let finalEntries = entries;
              if (tooltipMode === "single" && entries.length > 0) {
                let closest = entries[0];
                const stackedY = (si: number) => {
                  if (!isStacked || !stackedSeries)
                    return getYScale(entries[si].series)(entries[si].point.y);
                  const idx = visibleSeries.findIndex(
                    s => s.id === entries[si].series.id
                  );
                  const tp = stackedSeries[idx]?.top.find(
                    t => t.x === entries[si].point.x
                  );
                  return tp
                    ? getYScale(entries[si].series)(tp.y)
                    : getYScale(entries[si].series)(entries[si].point.y);
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
                  if (!cartesianProps.onPointClick) return;
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
                    series: ChartSeries;
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

                {/* Pattern definitions */}
                <StrictClip>
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

                  {/* Area fills — render bottom to top so first series is on top */}
                  {visibleSeries.map((series, seriesIdx) => {
                    const color = getColor(series, seriesIdx);
                    const fillValue = series.fill?.pattern
                      ? patternFill(series.fill.pattern, color)
                      : color;
                    const opacity = series.fill?.pattern
                      ? (series.fill?.opacity ?? 0.6)
                      : areaOpacity;
                    const highlighted =
                      focusedSeriesIndex != null
                        ? visibleSeries[focusedSeriesIndex]?.id
                        : hoveredSeries;
                    const isDimmed =
                      highlighted != null && highlighted !== series.id;
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
                        {/* Area fill */}
                        <path
                          d={areaPath}
                          fill={fillValue}
                          opacity={opacity}
                          pointerEvents="none"
                        />

                        {/* Line on top */}
                        {showLine && (
                          <path
                            d={
                              isStacked && stackedSeries
                                ? buildPath(
                                    stackedSeries[seriesIdx]
                                      .top as ChartDataPoint[],
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
                            strokeDasharray={dashStyleToArray(
                              series.dashStyle ?? "solid"
                            )}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            pointerEvents="none"
                          />
                        )}
                      </g>
                    );
                  })}
                </StrictClip>

                {/* Data labels */}
                {showDataLabels &&
                  visibleSeries.map((series, seriesIdx) => {
                    const color = getColor(series, seriesIdx);
                    const fmt =
                      series.dataLabelFormat ??
                      ((p: ChartDataPoint) => String(p.y));
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
                          } else {
                            cy = sYScale(point.y);
                          }
                          const cx = xScale(point.x);
                          if (cx < 0 || cx > plotWidth) return null;
                          const anchor =
                            cx < 30
                              ? "start"
                              : cx > plotWidth - 30
                                ? "end"
                                : "middle";
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
                    const sYScale = getYScale(series);
                    let cy: number;
                    if (isStacked && stackedSeries) {
                      const tp = stackedSeries[seriesIdx]?.top.find(
                        t => t.x === point.x
                      );
                      cy = tp ? sYScale(tp.y) : sYScale(point.y);
                    } else {
                      cy = sYScale(point.y);
                    }
                    const cx = xScale(point.x);
                    if (cy < 0 || cy > plotHeight) return null;
                    const dimmed =
                      (focusedSeriesIndex != null
                        ? visibleSeries[focusedSeriesIndex]?.id
                        : hoveredSeries) != null &&
                      (focusedSeriesIndex != null
                        ? visibleSeries[focusedSeriesIndex]?.id
                        : hoveredSeries) !== series.id;

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

                {/* Crosshair */}
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

                {/* Keyboard focus ring + tooltip sync */}
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
                    } else {
                      cy = sYScale(p.y);
                    }
                    if (cx < 0 || cx > plotWidth || cy < 0 || cy > plotHeight)
                      return null;

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
                      const categories = cartesianProps.xAxis?.categories;
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
                        setTooltipXLabel(categories?.[p.x] ?? String(p.x));
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
  }
);

AreaChart.displayName = "AreaChart";
