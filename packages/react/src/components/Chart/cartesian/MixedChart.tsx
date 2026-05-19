import React, { useState, useCallback, useRef } from "react";
import { CartesianChart } from "./CartesianChart";
import type { CartesianChartProps, CartesianContext } from "./CartesianChart";
import { ChartTooltip, findNearestPointIndex } from "../core/ChartTooltip";
import type { TooltipEntry } from "../core/ChartTooltip";
import { StrictClip } from "../core/ChartCanvas";
import { buildPath, buildAreaPath, buildStackedAreaPath } from "../core/paths";
import type { CurveType } from "../core/paths";
import { dashStyleToArray, splitByZones } from "../core/utils";
import { computeTrendline } from "../core/trendline";
import { ChartPattern, patternFill } from "../core/patterns";
import { renderMarker, MARKER_SYMBOLS } from "../core/markers";
import { roundedBarPath } from "../core/barPath";
import { niceDomain } from "../core/scales";
import { useKreatiLocale } from "../../../locale/KreatiProvider";
import type {
  ChartDataPoint,
  ChartSeries,
  MarkerSymbol,
  ScaleFunction,
} from "../core/types";

/** A series layer in a MixedChart. */
export interface MixedChartLayer {
  type: "line" | "bar" | "area" | "scatter";
  seriesIds: string[];
  curve?: CurveType;
  showPoints?: boolean;
  pointSize?: number;
  strokeWidth?: number;
  showArea?: boolean;
  areaOpacity?: number;
  groupMode?: "grouped" | "stacked" | "stacked-100";
  barRadius?: number;
  barGap?: number;
  barWidth?:
    | number
    | "auto"
    | ((point: ChartDataPoint, series: ChartSeries, index: number) => number);
  showCategoryDividers?: boolean;
  stackMode?: "normal" | "stacked" | "stacked-100";
  showLine?: boolean;
  showDataLabels?: boolean;
  /** Scatter-specific: marker size. Default: 6 */
  markerSize?: number;
  /** Scatter-specific: enable bubble mode. Default: false */
  bubbleMode?: boolean;
  /** Scatter-specific: min bubble radius. Default: 4 */
  bubbleMin?: number;
  /** Scatter-specific: max bubble radius. Default: 30 */
  bubbleMax?: number;
}

export interface MixedChartProps extends Omit<CartesianChartProps, "children"> {
  layers: MixedChartLayer[];
  tooltipMode?: "single" | "shared" | "custom";
  tooltipRender?: (entries: TooltipEntry[]) => React.ReactNode;
  tooltipFollowCursor?: boolean;
  /** Show a toggle button to switch between single and shared tooltip modes. Default: false */
  tooltipToggle?: boolean;
}

/**
 * MixedChart component for combining bar, line, and area series on the same axes.
 *
 * @description Uses a single CartesianChart with unified mouse tracking across
 * all layers. Each layer defines a chart type and which series it renders.
 * Layers render in order (first = bottom, last = top).
 *
 * @example
 * ```tsx
 * <MixedChart
 *   series={[revenueSeries, costsSeries, profitSeries]}
 *   layers={[
 *     { type: "bar", seriesIds: ["revenue"] },
 *     { type: "area", seriesIds: ["costs"], areaOpacity: 0.3 },
 *     { type: "line", seriesIds: ["profit"], strokeWidth: 3 },
 *   ]}
 *   xAxis={{ categories: ["Q1", "Q2", "Q3", "Q4"] }}
 * />
 * ```
 */
export const MixedChart = ({
  layers,
  tooltipMode: tooltipModeProp = "single",
  tooltipRender,
  tooltipFollowCursor = false,
  tooltipToggle = false,
  className = "",
  style,
  ref,
  ...cartesianProps
}: MixedChartProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);
  const [activeX, setActiveX] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [tooltipEntries, setTooltipEntries] = useState<TooltipEntry[]>([]);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipXLabel, setTooltipXLabel] = useState<string | undefined>();
  const [tooltipAnchored, setTooltipAnchored] = useState(false);
  const [internalMode, setInternalMode] = useState<"single" | "shared">(
    tooltipModeProp === "custom" ? "single" : tooltipModeProp
  );
  const tooltipMode = tooltipToggle ? internalMode : tooltipModeProp;
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevFocusRef = useRef<{ si: number | null; pi: number | null }>({
    si: null,
    pi: null,
  });
  const locale = useKreatiLocale();
  const t = locale.chart;

  // Force category type when categories are provided (same as BarChart)
  const xAxisConfig = cartesianProps.xAxis?.categories
    ? { ...cartesianProps.xAxis, type: "category" as const }
    : cartesianProps.xAxis;

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
      {tooltipToggle && (
        <div className="k-chart-tooltip-toggle">
          <button
            type="button"
            className={`k-chart-tooltip-toggle__btn ${tooltipMode === "single" ? "k-chart-tooltip-toggle__btn--active" : ""}`}
            onClick={() => setInternalMode("single")}
            aria-pressed={tooltipMode === "single"}
          >
            {t.tooltipSingle}
          </button>
          <button
            type="button"
            className={`k-chart-tooltip-toggle__btn ${tooltipMode === "shared" ? "k-chart-tooltip-toggle__btn--active" : ""}`}
            onClick={() => setInternalMode("shared")}
            aria-pressed={tooltipMode === "shared"}
          >
            {t.tooltipShared}
          </button>
        </div>
      )}
      <CartesianChart {...cartesianProps} xAxis={xAxisConfig}>
        {ctx => {
          const {
            xScale,
            yScale,
            yScales,
            plotWidth,
            plotHeight,
            visibleSeries,
            getColor,
          } = ctx;
          const ml = cartesianProps.margins?.left ?? 50;
          const mt = cartesianProps.margins?.top ?? 20;
          const cats = cartesianProps.xAxis?.categories;

          const getYScale = (s: { yAxisId?: string }): ScaleFunction =>
            yScales[s.yAxisId ?? "default"] ?? yScale;

          // Keyboard tooltip sync
          const { focusedSeriesIndex: fsi, focusedPointIndex: fpi } = ctx;
          if (
            fsi != null &&
            fpi != null &&
            (fsi !== prevFocusRef.current.si || fpi !== prevFocusRef.current.pi)
          ) {
            prevFocusRef.current = { si: fsi, pi: fpi };
            const s = visibleSeries[fsi];
            if (s) {
              const p = s.data[fpi];
              if (p) {
                queueMicrotask(() => {
                  setTooltipEntries([
                    { series: s, point: p, color: getColor(s, fsi) },
                  ]);
                  setHoveredSeries(s.id);
                  setTooltipAnchored(true);
                  setTooltipXLabel(cats?.[p.x] ?? String(p.x));
                  setTooltipVisible(true);
                  const svg = containerRef.current?.querySelector(
                    "svg.k-chart"
                  ) as SVGSVGElement | null;
                  if (svg) {
                    const sYS = getYScale(s);
                    const svgRect = svg.getBoundingClientRect();
                    setTooltipPos({
                      x: svgRect.left + ml + xScale(p.x),
                      y: svgRect.top + mt + sYS(p.y),
                    });
                  }
                });
              }
            }
          } else if (fsi == null && prevFocusRef.current.si != null) {
            prevFocusRef.current = { si: null, pi: null };
            queueMicrotask(() => {
              setTooltipVisible(false);
              setHoveredSeries(null);
            });
          }

          // Layer priority map: series in later layers get higher priority for tooltip/click
          const layerPriority: Record<string, number> = {};
          layers.forEach((l, li) => {
            for (const sid of l.seriesIds) layerPriority[sid] = li;
          });

          const handleMouseMove = (e: React.MouseEvent) => {
            const svg = (e.currentTarget as SVGGElement).ownerSVGElement;
            if (!svg) return;
            const rect = svg.getBoundingClientRect();
            const plotX = e.clientX - rect.left - ml;
            const plotY = e.clientY - rect.top - mt;

            if (plotX < 0 || plotX > plotWidth) {
              setTooltipVisible(false);
              setActiveX(null);
              setHoveredSeries(null);
              return;
            }

            // Find nearest point across ALL visible series
            const entries: TooltipEntry[] = [];
            let nearestPixelX: number | null = null;
            for (let i = 0; i < visibleSeries.length; i++) {
              const s = visibleSeries[i];
              const idx = findNearestPointIndex(s.data, xScale, plotX);
              if (idx < 0) continue;
              const p = s.data[idx];
              const px = xScale(p.x);
              if (
                nearestPixelX === null ||
                Math.abs(px - plotX) < Math.abs(nearestPixelX - plotX)
              ) {
                nearestPixelX = px;
              }
              entries.push({ series: s, point: p, color: getColor(s, i) });
            }

            let finalEntries = entries;
            if (tooltipMode === "single" && entries.length > 0) {
              let closest = entries[0];
              let minDist = Math.abs(
                getYScale(closest.series)(closest.point.y) - plotY
              );
              let closestPriority = layerPriority[closest.series.id] ?? 0;
              for (let j = 1; j < entries.length; j++) {
                const dist = Math.abs(
                  getYScale(entries[j].series)(entries[j].point.y) - plotY
                );
                const priority = layerPriority[entries[j].series.id] ?? 0;
                if (
                  dist < minDist ||
                  (dist === minDist && priority > closestPriority)
                ) {
                  minDist = dist;
                  closest = entries[j];
                  closestPriority = priority;
                }
              }
              finalEntries = [closest];
              setHoveredSeries(closest.series.id);
            } else if (tooltipMode === "shared") {
              setHoveredSeries(null);
            }

            setActiveX(nearestPixelX);
            setTooltipEntries(finalEntries);

            const anchor = tooltipMode === "single" && !tooltipFollowCursor;
            setTooltipAnchored(anchor);
            if (anchor && svg && finalEntries.length > 0) {
              const e0 = finalEntries[0];
              const svgRect = svg.getBoundingClientRect();
              setTooltipPos({
                x: svgRect.left + ml + xScale(e0.point.x),
                y: svgRect.top + mt + getYScale(e0.series)(e0.point.y),
              });
            } else {
              setTooltipPos({ x: e.clientX, y: e.clientY });
            }

            setTooltipVisible(finalEntries.length > 0);
            if (finalEntries.length > 0) {
              const xVal = finalEntries[0].point.x;
              setTooltipXLabel(cats?.[xVal] ?? String(xVal));
            }
          };

          const handleMouseLeave = () => {
            setTooltipVisible(false);
            setActiveX(null);
            setHoveredSeries(null);
          };

          return (
            <g
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
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
                  if (
                    !closest ||
                    dist < closest.dist ||
                    (dist === closest.dist &&
                      (layerPriority[s.id] ?? 0) >
                        (layerPriority[closest.series.id] ?? 0))
                  )
                    closest = { series: s, point: p, dist };
                }
                if (closest)
                  cartesianProps.onPointClick(closest.point, closest.series);
              }}
            >
              {/* Single hit area for all layers */}
              <rect
                x={0}
                y={0}
                width={plotWidth}
                height={plotHeight}
                fill="transparent"
                pointerEvents="all"
              />

              {/* Render layers in order */}
              {layers.map((layer, li) => {
                const layerSeries = visibleSeries.filter(s =>
                  layer.seriesIds.includes(s.id)
                );
                if (layerSeries.length === 0) return null;

                if (layer.type === "bar") {
                  return (
                    <StrictClip key={li}>
                      <MixedBarLayer
                        series={layerSeries}
                        xScale={xScale}
                        yScale={yScale}
                        plotWidth={plotWidth}
                        plotHeight={plotHeight}
                        getColor={getColor}
                        hoveredSeries={hoveredSeries}
                        layer={layer}
                        categories={cats}
                        focusedSeriesIndex={ctx.focusedSeriesIndex}
                        focusedPointIndex={ctx.focusedPointIndex}
                        allVisibleSeries={visibleSeries}
                      />
                    </StrictClip>
                  );
                }

                if (layer.type === "area") {
                  return (
                    <StrictClip key={li}>
                      <MixedAreaLayer
                        series={layerSeries}
                        xScale={xScale}
                        yScale={yScale}
                        yScales={yScales}
                        plotWidth={plotWidth}
                        plotHeight={plotHeight}
                        getColor={getColor}
                        hoveredSeries={hoveredSeries}
                        activeX={activeX}
                        layer={layer}
                      />
                    </StrictClip>
                  );
                }

                if (layer.type === "scatter") {
                  return (
                    <MixedScatterLayer
                      key={li}
                      series={layerSeries}
                      xScale={xScale}
                      yScale={yScale}
                      yScales={yScales}
                      plotWidth={plotWidth}
                      plotHeight={plotHeight}
                      getColor={getColor}
                      hoveredSeries={hoveredSeries}
                      layer={layer}
                    />
                  );
                }

                return (
                  <StrictClip key={li}>
                    <MixedLineLayer
                      series={layerSeries}
                      xScale={xScale}
                      yScale={yScale}
                      yScales={yScales}
                      plotWidth={plotWidth}
                      plotHeight={plotHeight}
                      getColor={getColor}
                      hoveredSeries={hoveredSeries}
                      activeX={activeX}
                      layer={layer}
                    />
                  </StrictClip>
                );
              })}
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
// ─── Internal layer renderers (no event handling, pure SVG) ─────────────────

interface BarLayerProps {
  series: ChartSeries[];
  xScale: ScaleFunction;
  yScale: ScaleFunction;
  plotWidth: number;
  plotHeight: number;
  getColor: (s: ChartSeries, i: number) => string;
  hoveredSeries: string | null;
  layer: MixedChartLayer;
  categories?: string[];
  focusedSeriesIndex: number | null;
  focusedPointIndex: number | null;
  allVisibleSeries: ChartSeries[];
}

const MixedBarLayer: React.FC<BarLayerProps> = ({
  series,
  xScale,
  yScale,
  plotWidth,
  plotHeight,
  getColor,
  hoveredSeries,
  layer,
  categories,
  focusedSeriesIndex,
  focusedPointIndex,
  allVisibleSeries,
}) => {
  const barRadius = layer.barRadius ?? 0;
  const barGap = layer.barGap ?? 0.1;
  const groupMode = layer.groupMode ?? "grouped";
  const allCats = Array.from(
    new Set(series.flatMap(s => s.data.map(p => p.x)))
  ).sort((a, b) => a - b);
  const catCount = allCats.length;
  const catSize = catCount > 0 ? plotWidth / catCount : plotWidth;
  const usable = catSize * 0.8;
  const seriesCount = series.length;
  const bw =
    groupMode === "grouped"
      ? Math.max(
          (usable - usable * barGap * (seriesCount - 1)) / seriesCount,
          1
        )
      : usable;

  const stackedData =
    groupMode === "stacked" || groupMode === "stacked-100"
      ? (() => {
          const map: Record<
            number,
            { pos: number; neg: number; total: number }
          > = {};
          for (const c of allCats) map[c] = { pos: 0, neg: 0, total: 0 };
          if (groupMode === "stacked-100") {
            for (const s of series)
              for (const p of s.data) map[p.x].total += Math.abs(p.y);
          }
          return map;
        })()
      : null;

  return (
    <g className="k-chart-bars" pointerEvents="none">
      <defs>
        {series.map((s, si) => {
          const pat = s.fill?.pattern;
          if (!pat) return null;
          return <ChartPattern key={s.id} type={pat} color={getColor(s, si)} />;
        })}
      </defs>
      {series.map((s, si) => {
        const color = getColor(s, si);
        const fillValue = s.fill?.pattern
          ? patternFill(s.fill.pattern, color)
          : color;
        return (
          <g key={s.id} className={`k-chart-bar-series ${s.className || ""}`}>
            {s.data.map((p, pi) => {
              const cx = xScale(p.x);
              let barX: number, barY: number, barW: number, barH: number;

              if (groupMode === "grouped") {
                const groupW =
                  bw * seriesCount + usable * barGap * (seriesCount - 1);
                const slot =
                  cx - groupW / 2 + si * (bw + usable * barGap) + bw / 2;
                const y0 = yScale(0);
                const y1 = yScale(p.y);
                barX = slot - bw / 2;
                barY = Math.min(y0, y1);
                barW = bw;
                barH = Math.abs(y0 - y1);
              } else {
                if (!stackedData) return null;
                const entry = stackedData[p.x];
                let val = p.y;
                if (groupMode === "stacked-100" && entry.total > 0)
                  val = (val / entry.total) * 100;
                const base = val >= 0 ? entry.pos : entry.neg;
                const top = base + val;
                if (val >= 0) entry.pos = top;
                else entry.neg = top;
                const y0 = yScale(base);
                const y1 = yScale(top);
                barX = cx - bw / 2;
                barY = Math.min(y0, y1);
                barW = bw;
                barH = Math.abs(y0 - y1);
              }

              if (barW <= 0 || barH <= 0) return null;
              const isDimmed = hoveredSeries != null && hoveredSeries !== s.id;
              const globalIdx = allVisibleSeries.indexOf(s);
              const isFocused =
                focusedSeriesIndex === globalIdx && focusedPointIndex === pi;
              const useR =
                barRadius > 0 &&
                (groupMode === "grouped" || si === series.length - 1);
              const roundPos = p.y >= 0 ? "top" : "bottom";

              const barProps = {
                fill: p.color ?? fillValue,
                opacity: isDimmed ? 0.3 : 1,
                stroke: isFocused ? "var(--kreati-chart-text)" : undefined,
                strokeWidth: isFocused ? 3 : undefined,
                style: {
                  transformOrigin: `${barX + barW / 2}px ${yScale(0)}px`,
                  "--k-bar-i": si * s.data.length + pi,
                } as React.CSSProperties,
                role: "img" as const,
                "aria-label": `${s.name}: ${categories?.[p.x] ?? p.x} = ${p.y}`,
              };

              return useR ? (
                <path
                  key={pi}
                  d={roundedBarPath(
                    barX,
                    barY,
                    barW,
                    barH,
                    barRadius,
                    roundPos
                  )}
                  {...barProps}
                />
              ) : (
                <rect
                  key={pi}
                  x={barX}
                  y={barY}
                  width={barW}
                  height={barH}
                  {...barProps}
                />
              );
            })}
          </g>
        );
      })}
      {/* Data labels */}
      {layer.showDataLabels &&
        series.map((s, si) => {
          const color = getColor(s, si);
          const fmt = s.dataLabelFormat ?? ((p: ChartDataPoint) => String(p.y));
          return (
            <g key={`dl-${s.id}`}>
              {s.data.map((p, pi) => {
                const cx = xScale(p.x);
                const y0 = yScale(0);
                const y1 = yScale(p.y);
                const above = p.y >= 0;
                const labelY = above
                  ? Math.min(y0, y1) - 6
                  : Math.max(y0, y1) + 14;
                if (cx < 0 || cx > plotWidth) return null;
                return (
                  <text
                    key={pi}
                    x={cx}
                    y={labelY}
                    className="k-chart-data-label"
                    textAnchor="middle"
                    fill={color}
                  >
                    {fmt(p)}
                  </text>
                );
              })}
            </g>
          );
        })}
    </g>
  );
};

interface LineLayerProps {
  series: ChartSeries[];
  xScale: ScaleFunction;
  yScale: ScaleFunction;
  yScales: Record<string, ScaleFunction>;
  plotWidth: number;
  plotHeight: number;
  getColor: (s: ChartSeries, i: number) => string;
  hoveredSeries: string | null;
  activeX: number | null;
  layer: MixedChartLayer;
}

const MixedLineLayer: React.FC<LineLayerProps> = ({
  series,
  xScale,
  yScale,
  yScales,
  plotWidth,
  plotHeight,
  getColor,
  hoveredSeries,
  activeX,
  layer,
}) => {
  const crv = layer.curve ?? "smooth";
  const sw = layer.strokeWidth ?? 3;
  const ps = layer.pointSize ?? 5;
  const showPts = layer.showPoints !== false;
  const showArea = layer.showArea ?? false;
  const areaOp = layer.areaOpacity ?? 0.15;
  const showDL = layer.showDataLabels ?? false;

  const getYS = (s: { yAxisId?: string }) =>
    yScales[s.yAxisId ?? "default"] ?? yScale;

  return (
    <g className="k-chart-lines" pointerEvents="none">
      {showArea && (
        <defs>
          {series.map((s, si) => {
            const pat = s.fill?.pattern;
            if (!pat) return null;
            return (
              <ChartPattern key={s.id} type={pat} color={getColor(s, si)} />
            );
          })}
        </defs>
      )}

      {/* Error bars */}
      {series.map((s, si) => {
        if (
          !s.errorMargin &&
          !s.data.some(p => p.error != null || p.errorHigh != null)
        )
          return null;
        const color = getColor(s, si);
        const sYS = getYS(s);
        const capW = 4;
        return (
          <g key={`eb-${s.id}`} className="k-chart-error-bars">
            {s.data.map((p, pi) => {
              const hi =
                p.errorHigh ??
                (p.error != null
                  ? p.y + p.error
                  : s.errorMargin != null
                    ? p.y + s.errorMargin
                    : null);
              const lo =
                p.errorLow ??
                (p.error != null
                  ? p.y - p.error
                  : s.errorMargin != null
                    ? p.y - s.errorMargin
                    : null);
              if (hi == null || lo == null) return null;
              const cx = xScale(p.x);
              const yHi = sYS(hi);
              const yLo = sYS(lo);
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

      {/* Series paths */}
      {series.map((s, si) => {
        const color = getColor(s, si);
        const sYS = getYS(s);
        const path = buildPath(s.data, xScale, sYS, crv);
        const isDimmed = hoveredSeries != null && hoveredSeries !== s.id;
        const isHovered = hoveredSeries === s.id;
        const areaFill = s.fill?.pattern
          ? patternFill(s.fill.pattern, color)
          : color;
        return (
          <g
            key={s.id}
            className={`k-chart-line-series ${s.className || ""}`}
            opacity={isDimmed ? 0.2 : 1}
          >
            {showArea && (
              <path
                d={buildAreaPath(s.data, xScale, sYS, plotHeight, crv)}
                fill={areaFill}
                opacity={s.fill?.pattern ? (s.fill?.opacity ?? 0.6) : areaOp}
              />
            )}
            {/* Color zones or single path */}
            {s.zones && s.zones.length > 0 ? (
              splitByZones(s.data, s.zones, color, s.dashStyle).map(
                (seg, sgi) => (
                  <path
                    key={sgi}
                    d={buildPath(
                      seg.points as ChartDataPoint[],
                      xScale,
                      sYS,
                      crv
                    )}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={isHovered ? sw + 1 : sw}
                    strokeDasharray={dashStyleToArray(
                      seg.dashStyle ?? s.dashStyle ?? "solid"
                    )}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )
              )
            ) : (
              <path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={isHovered ? sw + 1 : sw}
                strokeDasharray={dashStyleToArray(s.dashStyle ?? "solid")}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </g>
        );
      })}

      {/* Trendlines */}
      {series.map((s, si) => {
        if (!s.trendline) return null;
        const tl = s.trendline;
        const td = computeTrendline(s.data, tl);
        if (td.length < 2) return null;
        const color = tl.color ?? getColor(s, si);
        return (
          <path
            key={`tl-${s.id}`}
            d={buildPath(td, xScale, getYS(s), "linear")}
            fill="none"
            stroke={color}
            strokeWidth={tl.lineWidth ?? 2}
            strokeDasharray={dashStyleToArray(tl.dashStyle ?? "dash")}
            strokeLinecap="round"
            opacity={0.7}
          />
        );
      })}

      {/* Data labels */}
      {showDL &&
        series.map((s, si) => {
          const color = getColor(s, si);
          const fmt = s.dataLabelFormat ?? ((p: ChartDataPoint) => String(p.y));
          const sYS = getYS(s);
          return (
            <g key={`dl-${s.id}`}>
              {s.data.map((p, pi) => {
                const cx = xScale(p.x);
                const cy = sYS(p.y);
                if (cx < 0 || cx > plotWidth || cy < 0 || cy > plotHeight)
                  return null;
                const anchor =
                  cx < 30 ? "start" : cx > plotWidth - 30 ? "end" : "middle";
                return (
                  <text
                    key={pi}
                    x={cx}
                    y={cy > 18 ? cy - 10 : cy + 16}
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

      {/* Markers at active X */}
      {showPts &&
        activeX != null &&
        series.map((s, si) => {
          const color = getColor(s, si);
          const idx = findNearestPointIndex(s.data, xScale, activeX);
          if (idx < 0) return null;
          const p = s.data[idx];
          const cy = getYS(s)(p.y);
          if (cy < 0 || cy > plotHeight) return null;
          const dimmed = hoveredSeries != null && hoveredSeries !== s.id;
          return (
            <circle
              key={s.id}
              cx={xScale(p.x)}
              cy={cy}
              r={s.markerSize ?? ps}
              fill={color}
              stroke="var(--kreati-chart-bg)"
              strokeWidth={2.5}
              opacity={dimmed ? 0.2 : 1}
            />
          );
        })}
    </g>
  );
};

const MixedAreaLayer: React.FC<LineLayerProps & { layer: MixedChartLayer }> = ({
  series,
  xScale,
  yScale,
  yScales,
  plotWidth,
  plotHeight,
  getColor,
  hoveredSeries,
  activeX,
  layer,
}) => {
  const crv = layer.curve ?? "smooth";
  const areaOp = layer.areaOpacity ?? 0.4;
  const showLn = layer.showLine !== false;
  const sw = layer.strokeWidth ?? 2;
  const ps = layer.pointSize ?? 5;
  const showPts = layer.showPoints !== false;
  const stackMode = layer.stackMode ?? "normal";
  const isStacked = stackMode === "stacked" || stackMode === "stacked-100";

  const getYS = (s: { yAxisId?: string }) =>
    yScales[s.yAxisId ?? "default"] ?? yScale;

  // Compute stacked data
  const stackedSeries = isStacked
    ? (() => {
        const allX = Array.from(
          new Set(series.flatMap(s => s.data.map(p => p.x)))
        ).sort((a, b) => a - b);
        const totals: Record<number, number> = {};
        if (stackMode === "stacked-100") {
          for (const x of allX)
            totals[x] = series.reduce(
              (sum, s) => sum + Math.abs(s.data.find(d => d.x === x)?.y ?? 0),
              0
            );
        }
        const cum: Record<number, number> = {};
        for (const x of allX) cum[x] = 0;
        return series.map(s => {
          const bottom: { x: number; y: number }[] = [];
          const top: { x: number; y: number }[] = [];
          for (const x of allX) {
            let val = s.data.find(d => d.x === x)?.y ?? 0;
            if (stackMode === "stacked-100" && totals[x] > 0)
              val = (val / totals[x]) * 100;
            bottom.push({ x, y: cum[x] });
            cum[x] += val;
            top.push({ x, y: cum[x] });
          }
          return { top, bottom };
        });
      })()
    : null;

  return (
    <g className="k-chart-areas" pointerEvents="none">
      <defs>
        {series.map((s, si) => {
          const pat = s.fill?.pattern;
          if (!pat) return null;
          return <ChartPattern key={s.id} type={pat} color={getColor(s, si)} />;
        })}
      </defs>
      {series.map((s, si) => {
        const color = getColor(s, si);
        const fillVal = s.fill?.pattern
          ? patternFill(s.fill.pattern, color)
          : color;
        const isDimmed = hoveredSeries != null && hoveredSeries !== s.id;
        const sYS = getYS(s);
        const aPath =
          isStacked && stackedSeries
            ? buildStackedAreaPath(
                stackedSeries[si].top,
                stackedSeries[si].bottom,
                xScale,
                sYS,
                crv
              )
            : buildAreaPath(s.data, xScale, sYS, plotHeight, crv);
        return (
          <g
            key={s.id}
            className={`k-chart-area-series ${s.className || ""}`}
            opacity={isDimmed ? 0.2 : 1}
          >
            <path
              d={aPath}
              fill={fillVal}
              opacity={s.fill?.pattern ? (s.fill?.opacity ?? 0.6) : areaOp}
            />
            {showLn && (
              <path
                d={
                  isStacked && stackedSeries
                    ? buildPath(
                        stackedSeries[si].top as ChartDataPoint[],
                        xScale,
                        sYS,
                        crv
                      )
                    : buildPath(s.data, xScale, sYS, crv)
                }
                fill="none"
                stroke={color}
                strokeWidth={hoveredSeries === s.id ? sw + 1 : sw}
                strokeDasharray={dashStyleToArray(s.dashStyle ?? "solid")}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </g>
        );
      })}
      {showPts &&
        activeX != null &&
        series.map((s, si) => {
          const color = getColor(s, si);
          const idx = findNearestPointIndex(s.data, xScale, activeX);
          if (idx < 0) return null;
          const p = s.data[idx];
          const sYS = getYS(s);
          let cy = sYS(p.y);
          if (isStacked && stackedSeries) {
            const tp = stackedSeries[si]?.top.find(t => t.x === p.x);
            if (tp) cy = sYS(tp.y);
          }
          if (cy < 0 || cy > plotHeight) return null;
          const dimmed = hoveredSeries != null && hoveredSeries !== s.id;
          return (
            <circle
              key={s.id}
              cx={xScale(p.x)}
              cy={cy}
              r={s.markerSize ?? ps}
              fill={color}
              stroke="var(--kreati-chart-bg)"
              strokeWidth={2.5}
              opacity={dimmed ? 0.2 : 1}
            />
          );
        })}

      {/* Trendlines */}
      {series.map((s, si) => {
        if (!s.trendline) return null;
        const tl = s.trendline;
        const td = computeTrendline(s.data, tl);
        if (td.length < 2) return null;
        const color = tl.color ?? getColor(s, si);
        return (
          <path
            key={`tl-${s.id}`}
            d={buildPath(td, xScale, getYS(s), "linear")}
            fill="none"
            stroke={color}
            strokeWidth={tl.lineWidth ?? 2}
            strokeDasharray={dashStyleToArray(tl.dashStyle ?? "dash")}
            strokeLinecap="round"
            opacity={0.7}
          />
        );
      })}

      {/* Data labels */}
      {layer.showDataLabels &&
        series.map((s, si) => {
          const color = getColor(s, si);
          const fmt = s.dataLabelFormat ?? ((p: ChartDataPoint) => String(p.y));
          const sYS = getYS(s);
          return (
            <g key={`dl-${s.id}`}>
              {s.data.map((p, pi) => {
                const cx = xScale(p.x);
                let cy = sYS(p.y);
                if (isStacked && stackedSeries) {
                  const tp = stackedSeries[si]?.top.find(t => t.x === p.x);
                  if (tp) cy = sYS(tp.y);
                }
                if (cx < 0 || cx > plotWidth || cy < 0 || cy > plotHeight)
                  return null;
                const anchor =
                  cx < 30 ? "start" : cx > plotWidth - 30 ? "end" : "middle";
                return (
                  <text
                    key={pi}
                    x={cx}
                    y={cy > 18 ? cy - 10 : cy + 16}
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
    </g>
  );
};

interface ScatterLayerProps {
  series: ChartSeries[];
  xScale: ScaleFunction;
  yScale: ScaleFunction;
  yScales: Record<string, ScaleFunction>;
  plotWidth: number;
  plotHeight: number;
  getColor: (s: ChartSeries, i: number) => string;
  hoveredSeries: string | null;
  layer: MixedChartLayer;
}

const MixedScatterLayer: React.FC<ScatterLayerProps> = ({
  series,
  xScale,
  yScale,
  yScales,
  plotWidth,
  plotHeight,
  getColor,
  hoveredSeries,
  layer,
}) => {
  const ms = layer.markerSize ?? 6;
  const bubbleMode = layer.bubbleMode ?? false;
  const bubbleMin = layer.bubbleMin ?? 4;
  const bubbleMax = layer.bubbleMax ?? 30;
  const showLn = layer.showLine ?? false;
  const crv = layer.curve ?? "linear";
  const sw = layer.strokeWidth ?? 2;

  const getYS = (s: { yAxisId?: string }) =>
    yScales[s.yAxisId ?? "default"] ?? yScale;

  let zMin = Infinity;
  let zMax = -Infinity;
  if (bubbleMode) {
    for (const s of series)
      for (const p of s.data) {
        if (p.z != null) {
          if (p.z < zMin) zMin = p.z;
          if (p.z > zMax) zMax = p.z;
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
    return s.markerSize ?? ms;
  };

  const getSymbol = (s: ChartSeries, si: number): MarkerSymbol =>
    s.markerSymbol ?? MARKER_SYMBOLS[si % MARKER_SYMBOLS.length];

  return (
    <g className="k-chart-scatter" pointerEvents="none">
      <defs>
        {series.map((s, si) => {
          const pat = s.fill?.pattern;
          if (!pat) return null;
          return <ChartPattern key={s.id} type={pat} color={getColor(s, si)} />;
        })}
      </defs>
      {showLn &&
        series.map((s, si) => {
          const color = getColor(s, si);
          const sYS = getYS(s);
          const sorted = [...s.data].sort((a, b) => a.x - b.x);
          const path = buildPath(sorted, xScale, sYS, crv);
          const isDimmed = hoveredSeries != null && hoveredSeries !== s.id;
          return (
            <path
              key={`line-${s.id}`}
              d={path}
              fill="none"
              stroke={color}
              strokeWidth={hoveredSeries === s.id ? sw + 1 : sw}
              strokeDasharray={dashStyleToArray(s.dashStyle ?? "solid")}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={isDimmed ? 0.2 : 1}
            />
          );
        })}
      {series.map((s, si) => {
        const color = getColor(s, si);
        const symbol = getSymbol(s, si);
        const sYS = getYS(s);
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
              const cy = sYS(p.y);
              if (cx < 0 || cx > plotWidth || cy < 0 || cy > plotHeight)
                return null;
              const r = getRadius(p, s);
              return (
                <React.Fragment key={pi}>
                  {renderMarker(symbol, cx, cy, r, {
                    fill: p.color ?? fillValue,
                    stroke: "var(--kreati-chart-bg)",
                    strokeWidth: 2,
                    style: p.style,
                    className: p.className,
                  } as React.SVGProps<SVGElement>)}
                </React.Fragment>
              );
            })}
          </g>
        );
      })}

      {/* Trendlines */}
      {series.map((s, si) => {
        if (!s.trendline) return null;
        const tl = s.trendline;
        const td = computeTrendline(s.data, tl);
        if (td.length < 2) return null;
        const color = tl.color ?? getColor(s, si);
        return (
          <path
            key={`tl-${s.id}`}
            d={buildPath(td, xScale, getYS(s), "linear")}
            fill="none"
            stroke={color}
            strokeWidth={tl.lineWidth ?? 2}
            strokeDasharray={dashStyleToArray(tl.dashStyle ?? "dash")}
            strokeLinecap="round"
            opacity={0.7}
          />
        );
      })}

      {/* Data labels */}
      {layer.showDataLabels &&
        series.map((s, si) => {
          const color = getColor(s, si);
          const fmt = s.dataLabelFormat ?? ((p: ChartDataPoint) => String(p.y));
          const sYS = getYS(s);
          return (
            <g key={`dl-${s.id}`}>
              {s.data.map((p, pi) => {
                const cx = xScale(p.x);
                const cy = sYS(p.y);
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
    </g>
  );
};
