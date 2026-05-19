import React, { useState, useCallback, useRef } from "react";
import { CartesianChart } from "./CartesianChart";
import type { CartesianChartProps } from "./CartesianChart";
import { ChartTooltip } from "../core/ChartTooltip";
import type { TooltipMode, TooltipEntry } from "../core/ChartTooltip";
import { StrictClip } from "../core/ChartCanvas";
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

export interface ScatterChartProps extends Omit<
  CartesianChartProps,
  "children"
> {
  /** Default marker size (radius). Individual points can override via `z` value when `bubbleMode` is enabled. Default: 6 */
  markerSize?: number;
  /** Enable bubble mode — point `z` value controls marker radius. Default: false */
  bubbleMode?: boolean;
  /** Minimum bubble radius in pixels. Default: 4 */
  bubbleMin?: number;
  /** Maximum bubble radius in pixels. Default: 30 */
  bubbleMax?: number;
  /** Show connecting line between points of each series. Default: false */
  showLine?: boolean;
  /** Line interpolation when showLine is true. Default: 'linear' */
  curve?: CurveType;
  /** Line stroke width when showLine is true. Default: 2 */
  strokeWidth?: number;
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
 * ScatterChart component for scatter/bubble data visualization.
 *
 * @description Renders data points as individual markers with configurable
 * shapes per series. Supports bubble mode where the `z` value on each data
 * point controls marker size. Uses euclidean 2D proximity for tooltip
 * detection (not just X-axis like LineChart).
 *
 * @example
 * ```tsx
 * <ScatterChart
 *   series={[{ id: "sample", name: "Samples", data: [{ x: 1, y: 5 }, { x: 3, y: 8 }] }]}
 *   xAxis={{ label: "Concentration" }}
 *   yAxis={{ label: "Response" }}
 * />
 * ```
 */
export const ScatterChart = ({
  markerSize = 6,
  bubbleMode = false,
  bubbleMin = 4,
  bubbleMax = 30,
  showLine = false,
  curve = "linear",
  strokeWidth = 2,
  showDataLabels = false,
  tooltipMode = "single",
  tooltipRender,
  tooltipFollowCursor = false,
  className = "",
  style,
  ref,
  ...cartesianProps
}: ScatterChartProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [tooltipEntries, setTooltipEntries] = useState<TooltipEntry[]>([]);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipXLabel, setTooltipXLabel] = useState<string | undefined>();
  const [tooltipAnchored, setTooltipAnchored] = useState(false);
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevFocusRef = useRef<{ si: number | null; pi: number | null }>({
    si: null,
    pi: null,
  });

  return (
    <div
      ref={node => {
        (
          containerRef as React.MutableRefObject<HTMLDivElement | null>
        ).current = node;
        if (typeof ref === "function") ref(node);
        else if (ref)
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      className={className}
      style={style}
    >
      <CartesianChart showCrosshair={false} {...cartesianProps}>
        {ctx => {
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
          const ml = cartesianProps.margins?.left ?? 50;
          const mt = cartesianProps.margins?.top ?? 20;

          const getYScale = (s: { yAxisId?: string }): ScaleFunction =>
            yScales[s.yAxisId ?? "default"] ?? yScale;

          // Compute bubble scale from z values across all visible series
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

          const plotToViewport = (
            svg: SVGSVGElement,
            px: number,
            py: number
          ) => {
            const rect = svg.getBoundingClientRect();
            return { x: rect.left + ml + px, y: rect.top + mt + py };
          };

          // Euclidean 2D nearest point search
          const findNearest = (
            plotX: number,
            plotY: number
          ): {
            entries: TooltipEntry[];
            closest: TooltipEntry | null;
          } => {
            const entries: TooltipEntry[] = [];
            let closest: TooltipEntry | null = null;
            let minDist = Infinity;

            for (let i = 0; i < visibleSeries.length; i++) {
              const s = visibleSeries[i];
              const sYScale = getYScale(s);
              for (const p of s.data) {
                const px = xScale(p.x);
                const py = sYScale(p.y);
                const dx = px - plotX;
                const dy = py - plotY;
                const dist = dx * dx + dy * dy;
                const entry: TooltipEntry = {
                  series: s,
                  point: p,
                  color: getColor(s, i),
                  markerSymbol: getSymbol(s, i),
                };
                // For shared mode, collect all points near the closest X
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

            if (
              plotX < 0 ||
              plotX > plotWidth ||
              plotY < 0 ||
              plotY > plotHeight
            ) {
              setTooltipVisible(false);
              setHoveredSeries(null);
              return;
            }

            const { entries, closest } = findNearest(plotX, plotY);
            if (!closest) {
              setTooltipVisible(false);
              setHoveredSeries(null);
              return;
            }

            let finalEntries: TooltipEntry[];
            if (tooltipMode === "shared") {
              // Find nearest point per series by X proximity to closest
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
              setHoveredSeries(null);
            } else {
              finalEntries = [closest];
              setHoveredSeries(closest.series.id);
            }

            const anchor = tooltipMode === "single" && !tooltipFollowCursor;
            setTooltipAnchored(anchor);

            if (anchor && svg) {
              const sYScale = getYScale(closest.series);
              const pos = plotToViewport(
                svg,
                xScale(closest.point.x),
                sYScale(closest.point.y)
              );
              setTooltipPos(pos);
            } else {
              setTooltipPos({ x: e.clientX, y: e.clientY });
            }

            const cats = cartesianProps.xAxis?.categories;
            const xVal = closest.point.x;
            setTooltipXLabel(cats?.[xVal] ?? String(xVal));
            setTooltipEntries(finalEntries);
            setTooltipVisible(true);
          };

          const handleMouseLeave = () => {
            setTooltipVisible(false);
            setHoveredSeries(null);
          };

          // Keyboard tooltip sync
          const si = focusedSeriesIndex;
          const pi = focusedPointIndex;
          if (
            si != null &&
            pi != null &&
            (si !== prevFocusRef.current.si || pi !== prevFocusRef.current.pi)
          ) {
            prevFocusRef.current = { si, pi };
            const s = visibleSeries[si];
            if (s) {
              const p = s.data[pi];
              if (p) {
                const entry: TooltipEntry = {
                  series: s,
                  point: p,
                  color: getColor(s, si),
                  markerSymbol: getSymbol(s, si),
                };
                // Use microtask to avoid setState during render
                queueMicrotask(() => {
                  setTooltipEntries([entry]);
                  setHoveredSeries(s.id);
                  setTooltipAnchored(true);
                  const cats = cartesianProps.xAxis?.categories;
                  setTooltipXLabel(cats?.[p.x] ?? String(p.x));
                  setTooltipVisible(true);
                  const svg = containerRef.current?.querySelector(
                    "svg.k-chart"
                  ) as SVGSVGElement | null;
                  if (svg) {
                    const sYScale = getYScale(s);
                    const pos = plotToViewport(svg, xScale(p.x), sYScale(p.y));
                    setTooltipPos(pos);
                  }
                });
              }
            }
          } else if (si == null && prevFocusRef.current.si != null) {
            prevFocusRef.current = { si: null, pi: null };
            queueMicrotask(() => {
              setTooltipVisible(false);
              setHoveredSeries(null);
            });
          }

          return (
            <g
              className="k-chart-scatter"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onTouchStart={e => {
                if (e.touches.length !== 1) return;
                const touch = e.touches[0];
                const svg = (e.currentTarget as SVGGElement).ownerSVGElement;
                if (!svg) return;
                const rect = svg.getBoundingClientRect();
                const plotX = touch.clientX - rect.left - ml;
                const plotY = touch.clientY - rect.top - mt;
                const { closest } = findNearest(plotX, plotY);
                if (closest) {
                  setTooltipEntries([closest]);
                  setHoveredSeries(closest.series.id);
                  setTooltipAnchored(true);
                  const sYScale = getYScale(closest.series);
                  setTooltipPos(
                    plotToViewport(
                      svg,
                      xScale(closest.point.x),
                      sYScale(closest.point.y)
                    )
                  );
                  const cats = cartesianProps.xAxis?.categories;
                  setTooltipXLabel(
                    cats?.[closest.point.x] ?? String(closest.point.x)
                  );
                  setTooltipVisible(true);
                }
              }}
              onMouseDown={e => {
                mouseDownPos.current = {
                  x: e.clientX,
                  y: e.clientY,
                };
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
                if (
                  plotX < 0 ||
                  plotX > plotWidth ||
                  plotY < 0 ||
                  plotY > plotHeight
                )
                  return;
                const { closest } = findNearest(plotX, plotY);
                if (closest)
                  cartesianProps.onPointClick(closest.point, closest.series);
              }}
            >
              {/* Hit area */}
              <rect
                x={0}
                y={0}
                width={plotWidth}
                height={plotHeight}
                fill="transparent"
                pointerEvents="all"
              />

              {/* Pattern definitions */}
              <defs>
                {visibleSeries.map((s, si) => {
                  const pat = s.fill?.pattern;
                  if (!pat) return null;
                  return (
                    <ChartPattern
                      key={s.id}
                      type={pat}
                      color={getColor(s, si)}
                    />
                  );
                })}
              </defs>

              {/* Connecting lines (behind points) */}
              <StrictClip>
                {showLine &&
                  visibleSeries.map((s, si) => {
                    const color = getColor(s, si);
                    const sYScale = getYScale(s);
                    const sorted = [...s.data].sort((a, b) => a.x - b.x);
                    const path = buildPath(sorted, xScale, sYScale, curve);
                    const isDimmed =
                      hoveredSeries != null && hoveredSeries !== s.id;
                    const dash = dashStyleToArray(s.dashStyle ?? "solid");
                    return (
                      <path
                        key={`line-${s.id}`}
                        d={path}
                        fill="none"
                        stroke={color}
                        strokeWidth={
                          hoveredSeries === s.id ? strokeWidth + 1 : strokeWidth
                        }
                        strokeDasharray={dash}
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
                  const sYScale = getYScale(s);
                  const tlPath = buildPath(
                    trendData,
                    xScale,
                    sYScale,
                    "linear"
                  );
                  const dash = dashStyleToArray(tl.dashStyle ?? "dash");
                  return (
                    <path
                      key={`tl-${s.id}`}
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
                      aria-label={`${tl.label ?? s.name + " trend"}: ${tl.type}`}
                    />
                  );
                })}
              </StrictClip>

              {/* Data points */}
              {visibleSeries.map((s, si) => {
                const color = getColor(s, si);
                const symbol = getSymbol(s, si);
                const sYScale = getYScale(s);
                const isDimmed =
                  hoveredSeries != null && hoveredSeries !== s.id;
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
                        focusedSeriesIndex === globalSi &&
                        focusedPointIndex === pi;
                      const cats = cartesianProps.xAxis?.categories;
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
                            role: "img",
                            "aria-label": `${s.name}: ${cats?.[p.x] ?? p.x}, ${p.y}${p.z != null ? `, z=${p.z}` : ""}`,
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
                  const fmt =
                    s.dataLabelFormat ?? ((p: ChartDataPoint) => String(p.y));
                  const sYScale = getYScale(s);
                  return (
                    <g key={`dl-${s.id}`} pointerEvents="none">
                      {s.data.map((p, pi) => {
                        const cx = xScale(p.x);
                        const cy = sYScale(p.y);
                        if (
                          cx < 0 ||
                          cx > plotWidth ||
                          cy < 0 ||
                          cy > plotHeight
                        )
                          return null;
                        const r = getRadius(p, s);
                        const anchor =
                          cx < 30
                            ? "start"
                            : cx > plotWidth - 30
                              ? "end"
                              : "middle";
                        const above = cy > r + 14;
                        return (
                          <text
                            key={pi}
                            x={cx}
                            y={above ? cy - r - 6 : cy + r + 14}
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
                  const r = getRadius(p, s);
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r + 4}
                      className="k-chart-focus-ring"
                      pointerEvents="none"
                    />
                  );
                })()}
            </g>
          );
        }}
      </CartesianChart>

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
