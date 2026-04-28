import React, { forwardRef, useState, useRef } from "react";
import { CartesianChart } from "./CartesianChart";
import type { CartesianChartProps } from "./CartesianChart";
import { ChartTooltip } from "../core/ChartTooltip";
import type { TooltipMode, TooltipEntry } from "../core/ChartTooltip";
import { StrictClip } from "../core/ChartCanvas";
import { ChartPattern, patternFill } from "../core/patterns";
import { roundedBarPath } from "../core/barPath";
import { niceDomain } from "../core/scales";
import type { ChartDataPoint, ChartSeries } from "../core/types";

export interface BarChartProps extends Omit<CartesianChartProps, "children"> {
  /** Bar grouping mode. Default: 'grouped' */
  groupMode?: "grouped" | "stacked" | "stacked-100";
  /** Bar orientation. Default: 'vertical' */
  orientation?: "vertical" | "horizontal";
  /** Border radius on bar ends in px. Default: 0 */
  barRadius?: number;
  /** Gap between bars within a group as fraction of bar width (0-1). Default: 0.1 */
  barGap?: number;
  /** Bar width in px, 'auto', or a function for per-bar width. Default: 'auto' */
  barWidth?:
    | number
    | "auto"
    | ((point: ChartDataPoint, series: ChartSeries, index: number) => number);
  /** Show data labels on bars. Default: false */
  showDataLabels?: boolean;
  /** Show divider lines between categories. Default: false */
  showCategoryDividers?: boolean;
  /** Tooltip mode. Default: 'single' */
  tooltipMode?: TooltipMode;
  /** Custom tooltip render */
  tooltipRender?: (entries: TooltipEntry[]) => React.ReactNode;
  /** Force tooltip to follow cursor. Default: false */
  tooltipFollowCursor?: boolean;
}

/**
 * BarChart component for bar/column data visualization.
 *
 * @description Renders data series as vertical or horizontal bars.
 * Supports grouped, stacked, and stacked-100% modes with per-bar
 * customization, pattern fills, and severity colors.
 *
 * @example
 * ```tsx
 * <BarChart
 *   series={[{ id: "sales", name: "Sales", data: [...] }]}
 *   xAxis={{ label: "Month", categories: ["Jan", "Feb", "Mar"] }}
 *   yAxis={{ label: "Revenue" }}
 * />
 * ```
 */
export const BarChart = forwardRef<HTMLDivElement, BarChartProps>(
  (
    {
      groupMode = "grouped",
      orientation = "vertical",
      barRadius = 0,
      barGap = 0.1,
      barWidth = "auto",
      showDataLabels = false,
      showCategoryDividers = false,
      tooltipMode = "single",
      tooltipRender,
      tooltipFollowCursor = false,
      className = "",
      style,
      ...cartesianProps
    },
    ref
  ) => {
    const [hoveredBar, setHoveredBar] = useState<{
      seriesId: string;
      pointIdx: number;
    } | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const [tooltipEntries, setTooltipEntries] = useState<TooltipEntry[]>([]);
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [tooltipXLabel, setTooltipXLabel] = useState<string | undefined>();
    const [tooltipAnchored, setTooltipAnchored] = useState(false);
    const mouseDownPos = useRef<{ x: number; y: number } | null>(null);

    // Bars must always include 0 on the value axis
    const hasNegative = cartesianProps.series.some(s =>
      s.data.some(p => p.y < 0)
    );
    const hasPositive = cartesianProps.series.some(s =>
      s.data.some(p => p.y > 0)
    );
    const forceZero = (cfg: typeof cartesianProps.yAxis) => {
      if (Array.isArray(cfg)) {
        return cfg.map(ax => ({
          ...ax,
          ...(ax.min == null && !hasNegative ? { min: 0 } : {}),
          ...(ax.max == null && !hasPositive ? { max: 0 } : {}),
        }));
      }
      return {
        ...cfg,
        ...(cfg?.min == null && !hasNegative ? { min: 0 } : {}),
        ...(cfg?.max == null && !hasPositive ? { max: 0 } : {}),
      };
    };

    const isHorizontal = orientation === "horizontal";

    // Force category type on the category axis when categories are provided
    const catAxisConfig = cartesianProps.xAxis?.categories
      ? { ...cartesianProps.xAxis, type: "category" as const }
      : cartesianProps.xAxis;

    // For stacked modes, compute the correct max for the value axis
    const valAxisBase = forceZero(cartesianProps.yAxis);
    const valAxisConfig = (() => {
      const base = Array.isArray(valAxisBase) ? valAxisBase[0] : valAxisBase;
      if (base?.max != null) return valAxisBase; // user override

      if (groupMode === "stacked-100") {
        return { ...base, min: 0, max: 100 };
      }

      if (groupMode === "stacked") {
        // Sum per category to find the real stacked max
        const sums: Record<number, { pos: number; neg: number }> = {};
        for (const s of cartesianProps.series) {
          for (const p of s.data) {
            if (!sums[p.x]) sums[p.x] = { pos: 0, neg: 0 };
            if (p.y >= 0) sums[p.x].pos += p.y;
            else sums[p.x].neg += p.y;
          }
        }
        const maxSum = Math.max(...Object.values(sums).map(s => s.pos), 0);
        const minSum = Math.min(...Object.values(sums).map(s => s.neg), 0);
        return {
          ...base,
          min: minSum < 0 ? undefined : 0,
          max: maxSum,
        };
      }

      return valAxisBase;
    })();

    // In horizontal mode, CartesianChart doesn't apply niceDomain to X axis,
    // so we compute nice min/max for the value axis ourselves
    const niceValAxis = (() => {
      if (!isHorizontal) return valAxisConfig;
      const base = Array.isArray(valAxisConfig)
        ? valAxisConfig[0]
        : valAxisConfig;
      if (base?.min != null && base?.max != null) return valAxisConfig;
      const allVals = cartesianProps.series.flatMap(s => s.data.map(p => p.y));
      if (allVals.length === 0) return valAxisConfig;
      const [nMin, nMax] = niceDomain(
        base?.min ?? Math.min(...allVals, 0),
        base?.max ?? Math.max(...allVals, 0)
      );
      return { ...base, min: nMin, max: nMax };
    })();

    // Grid defaults: on value axis. User can override via xAxis.showGrid / yAxis.showGrid
    const userValGrid = (
      Array.isArray(cartesianProps.yAxis)
        ? cartesianProps.yAxis[0]
        : cartesianProps.yAxis
    )?.showGrid;
    const userCatGrid = cartesianProps.xAxis?.showGrid;

    const resolvedXAxis = isHorizontal
      ? {
          ...(Array.isArray(niceValAxis) ? niceValAxis[0] : niceValAxis),
          showGrid: userValGrid ?? true,
        }
      : { ...catAxisConfig, showGrid: userCatGrid ?? false };
    const resolvedYAxis = isHorizontal
      ? { ...catAxisConfig, inverted: true, showGrid: userCatGrid ?? false }
      : valAxisConfig;

    return (
      <div ref={ref} className={className} style={style}>
        <CartesianChart
          {...cartesianProps}
          series={
            isHorizontal
              ? cartesianProps.series.map(s => ({
                  ...s,
                  data: s.data.map(p => ({ ...p, x: p.y, y: p.x })),
                }))
              : cartesianProps.series
          }
          xAxis={resolvedXAxis}
          yAxis={resolvedYAxis}
          zoomAxis={cartesianProps.zoomAxis ?? (isHorizontal ? "x" : "y")}
        >
          {({
            xScale,
            yScale,
            plotWidth,
            plotHeight,
            visibleSeries,
            getColor,
            focusedSeriesIndex,
            focusedPointIndex,
          }) => {
            const ml = cartesianProps.margins?.left ?? 50;
            const mt = cartesianProps.margins?.top ?? 20;
            const seriesCount = visibleSeries.length;

            // In horizontal mode, axes are swapped:
            //   valueScale = xScale (horizontal), catScale = yScale (vertical)
            // In vertical mode:
            //   valueScale = yScale (vertical), catScale = xScale (horizontal)
            const valueScale = isHorizontal ? xScale : yScale;
            const catScale = isHorizontal ? yScale : xScale;

            // In horizontal mode, data is swapped: point.x = value, point.y = category index
            // In vertical mode: point.x = category index, point.y = value
            const getCat = (p: ChartDataPoint) => (isHorizontal ? p.y : p.x);
            const getVal = (p: ChartDataPoint) => (isHorizontal ? p.x : p.y);

            // Collect all unique category indices
            const allCats = Array.from(
              new Set(visibleSeries.flatMap(s => s.data.map(getCat)))
            ).sort((a, b) => a - b);

            // Compute bar geometry based on category axis spacing
            const categoryCount = allCats.length;
            const catAxisSize = isHorizontal ? plotHeight : plotWidth;
            const categorySize =
              categoryCount > 0 ? catAxisSize / categoryCount : catAxisSize;
            const padding = categorySize * 0.2;
            const usableSize = categorySize - padding;
            const defaultBarWidth =
              typeof barWidth === "function"
                ? usableSize / (groupMode === "grouped" ? seriesCount : 1)
                : barWidth === "auto"
                  ? groupMode === "grouped"
                    ? Math.max(
                        (usableSize - usableSize * barGap * (seriesCount - 1)) /
                          seriesCount,
                        1
                      )
                    : usableSize
                  : barWidth;

            // Stacked data: compute cumulative values per category
            const stackedData = (() => {
              if (groupMode !== "stacked" && groupMode !== "stacked-100")
                return null;
              const map: Record<
                number,
                { positive: number; negative: number; total: number }
              > = {};
              for (const c of allCats) {
                map[c] = { positive: 0, negative: 0, total: 0 };
              }
              if (groupMode === "stacked-100") {
                for (const s of visibleSeries) {
                  for (const p of s.data) {
                    map[getCat(p)].total += Math.abs(getVal(p));
                  }
                }
              }
              return map;
            })();

            /** Position on the category axis via the scale */
            const getCategoryCenter = (catIdx: number): number =>
              catScale(catIdx);

            /** Compute bar rect for a given series index and data point */
            const getBarRect = (
              seriesIdx: number,
              point: ChartDataPoint,
              _series: ChartSeries,
              pointIdx: number
            ): {
              x: number;
              y: number;
              width: number;
              height: number;
            } | null => {
              const cat = getCat(point);
              const center = getCategoryCenter(cat);
              let value = getVal(point);

              // Resolve per-bar width (function override or default)
              const bw =
                typeof barWidth === "function"
                  ? barWidth(point, _series, pointIdx)
                  : defaultBarWidth;

              if (groupMode === "grouped") {
                const groupWidth =
                  defaultBarWidth * seriesCount +
                  usableSize * barGap * (seriesCount - 1);
                const slotCenter =
                  center -
                  groupWidth / 2 +
                  seriesIdx * (defaultBarWidth + usableSize * barGap) +
                  defaultBarWidth / 2;

                const barStart = valueScale(0);
                const barEnd = valueScale(value);

                if (isHorizontal) {
                  return {
                    x: Math.min(barStart, barEnd),
                    y: slotCenter - bw / 2,
                    width: Math.abs(barEnd - barStart),
                    height: bw,
                  };
                }
                return {
                  x: slotCenter - bw / 2,
                  y: Math.min(barStart, barEnd),
                  width: bw,
                  height: Math.abs(barStart - barEnd),
                };
              }

              // Stacked / stacked-100
              if (!stackedData) return null;
              const entry = stackedData[cat];
              if (!entry) return null;

              if (groupMode === "stacked-100" && entry.total > 0) {
                value = (value / entry.total) * 100;
              }

              const isNeg = value < 0;
              const base = isNeg ? entry.negative : entry.positive;
              const top = base + value;

              if (isNeg) {
                entry.negative = top;
              } else {
                entry.positive = top;
              }

              const barStart = valueScale(base);
              const barEnd = valueScale(top);

              if (isHorizontal) {
                return {
                  x: Math.min(barStart, barEnd),
                  y: center - bw / 2,
                  width: Math.abs(barEnd - barStart),
                  height: bw,
                };
              }
              return {
                x: center - bw / 2,
                y: Math.min(barStart, barEnd),
                width: bw,
                height: Math.abs(barStart - barEnd),
              };
            };

            // Reset stacked accumulators before each render
            if (stackedData) {
              for (const c of allCats) {
                stackedData[c].positive = 0;
                stackedData[c].negative = 0;
              }
            }

            /** Restore original point orientation for tooltip display */
            const originalPoint = (p: ChartDataPoint): ChartDataPoint =>
              isHorizontal ? { ...p, x: p.y, y: p.x } : p;

            const handleBarMouseEnter = (
              e: React.MouseEvent,
              series: ChartSeries,
              seriesIdx: number,
              point: ChartDataPoint,
              pointIdx: number
            ) => {
              setHoveredBar({ seriesId: series.id, pointIdx });
              const svg = (e.currentTarget as Element).closest(
                "svg"
              ) as SVGSVGElement | null;

              const entries: TooltipEntry[] =
                tooltipMode === "shared"
                  ? visibleSeries.reduce<TooltipEntry[]>((acc, s, i) => {
                      const p = s.data.find(d => getCat(d) === getCat(point));
                      if (p)
                        acc.push({
                          series: s,
                          point: originalPoint(p),
                          color: getColor(s, i),
                        });
                      return acc;
                    }, [])
                  : [
                      {
                        series,
                        point: originalPoint(point),
                        color: getColor(series, seriesIdx),
                      },
                    ];

              setTooltipEntries(entries);

              const anchor = tooltipMode === "single" && !tooltipFollowCursor;
              setTooltipAnchored(anchor);

              if (anchor && svg) {
                const rect = svg.getBoundingClientRect();
                const barRect = getBarRect(seriesIdx, point, series, pointIdx);
                if (barRect) {
                  const cx = isHorizontal
                    ? barRect.x + barRect.width
                    : barRect.x + barRect.width / 2;
                  const cy = isHorizontal
                    ? barRect.y + barRect.height / 2
                    : barRect.y;
                  setTooltipPos({
                    x: rect.left + ml + cx,
                    y: rect.top + mt + cy,
                  });
                }
              } else {
                setTooltipPos({ x: e.clientX, y: e.clientY });
              }

              setTooltipVisible(true);
              const categories = cartesianProps.xAxis?.categories;
              const catIdx = getCat(point);
              setTooltipXLabel(categories?.[catIdx] ?? String(catIdx));
            };

            const handleBarMouseLeave = () => {
              setHoveredBar(null);
              setTooltipVisible(false);
            };

            const handleBarMouseMove = (e: React.MouseEvent) => {
              if (tooltipFollowCursor || tooltipMode !== "single") {
                setTooltipPos({ x: e.clientX, y: e.clientY });
              }
            };

            return (
              <g
                className="k-chart-bars"
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
                }}
              >
                {/* Category divider lines */}
                {showCategoryDividers &&
                  allCats.map((cat, i) => {
                    const pos = catScale(cat);
                    const half = categorySize / 2;
                    if (isHorizontal) {
                      return (
                        <React.Fragment key={`div-${i}`}>
                          {i === 0 && (
                            <line
                              x1={0}
                              y1={pos - half}
                              x2={plotWidth}
                              y2={pos - half}
                              stroke="var(--kreati-chart-grid)"
                              strokeWidth={1}
                              pointerEvents="none"
                            />
                          )}
                          <line
                            x1={0}
                            y1={pos + half}
                            x2={plotWidth}
                            y2={pos + half}
                            stroke="var(--kreati-chart-grid)"
                            strokeWidth={1}
                            pointerEvents="none"
                          />
                        </React.Fragment>
                      );
                    }
                    return (
                      <React.Fragment key={`div-${i}`}>
                        {i === 0 && (
                          <line
                            x1={pos - half}
                            y1={0}
                            x2={pos - half}
                            y2={plotHeight}
                            stroke="var(--kreati-chart-grid)"
                            strokeWidth={1}
                            pointerEvents="none"
                          />
                        )}
                        <line
                          x1={pos + half}
                          y1={0}
                          x2={pos + half}
                          y2={plotHeight}
                          stroke="var(--kreati-chart-grid)"
                          strokeWidth={1}
                          pointerEvents="none"
                        />
                      </React.Fragment>
                    );
                  })}

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

                  {visibleSeries.map((series, seriesIdx) => {
                    const color = getColor(series, seriesIdx);
                    const fillValue = series.fill?.pattern
                      ? patternFill(series.fill.pattern, color)
                      : color;
                    const fillOpacity = series.fill?.opacity ?? 1;

                    return (
                      <g
                        key={series.id}
                        className={`k-chart-bar-series${isHorizontal ? " k-chart-bar-series--horizontal" : ""} ${series.className || ""}`}
                      >
                        {series.data.map((point, pointIdx) => {
                          const barRect = getBarRect(
                            seriesIdx,
                            point,
                            series,
                            pointIdx
                          );
                          if (!barRect) return null;
                          const { x, y, width: bw, height: bh } = barRect;
                          if (bw <= 0 || bh <= 0) return null;

                          const isHovered =
                            hoveredBar?.seriesId === series.id &&
                            hoveredBar?.pointIdx === pointIdx;
                          const isDimmed = hoveredBar != null && !isHovered;
                          const isFocused =
                            focusedSeriesIndex === seriesIdx &&
                            focusedPointIndex === pointIdx;
                          const pointColor = point.color ?? fillValue;
                          const useRadius =
                            barRadius > 0 &&
                            (groupMode === "grouped" ||
                              seriesIdx === visibleSeries.length - 1);

                          // Determine which end gets rounded corners
                          const roundPos = isHorizontal
                            ? getVal(point) >= 0
                              ? "right"
                              : "left"
                            : getVal(point) >= 0
                              ? "top"
                              : "bottom";

                          const sharedProps = {
                            fill: point.color ? point.color : pointColor,
                            fillOpacity,
                            stroke: isFocused
                              ? "var(--kreati-chart-text)"
                              : undefined,
                            strokeWidth: isFocused ? 3 : undefined,
                            opacity: isDimmed ? 0.3 : 1,
                            className: point.className,
                            style: {
                              transformOrigin: isHorizontal
                                ? `${valueScale(0)}px ${y + bh / 2}px`
                                : `${x + bw / 2}px ${valueScale(0)}px`,
                              "--k-bar-i":
                                seriesIdx * visibleSeries[0]?.data.length +
                                pointIdx,
                              ...point.style,
                            } as React.CSSProperties,
                            role: "img" as const,
                            "aria-label": `${series.name}: ${cartesianProps.xAxis?.categories?.[getCat(point)] ?? getCat(point)} = ${getVal(point)}`,
                            onMouseEnter: (e: React.MouseEvent) =>
                              handleBarMouseEnter(
                                e,
                                series,
                                seriesIdx,
                                point,
                                pointIdx
                              ),
                            onMouseLeave: handleBarMouseLeave,
                            onMouseMove: handleBarMouseMove,
                            onClick: (e: React.MouseEvent) => {
                              if (!cartesianProps.onPointClick) return;
                              if (mouseDownPos.current) {
                                const dx = e.clientX - mouseDownPos.current.x;
                                const dy = e.clientY - mouseDownPos.current.y;
                                if (dx * dx + dy * dy > 25) return;
                              }
                              e.stopPropagation();
                              cartesianProps.onPointClick(
                                originalPoint(point),
                                series
                              );
                            },
                            cursor: cartesianProps.onPointClick
                              ? "pointer"
                              : undefined,
                          };

                          return useRadius ? (
                            <path
                              key={pointIdx}
                              d={roundedBarPath(
                                x,
                                y,
                                bw,
                                bh,
                                barRadius,
                                roundPos as "top" | "bottom" | "left" | "right"
                              )}
                              {...sharedProps}
                            />
                          ) : (
                            <rect
                              key={pointIdx}
                              x={x}
                              y={y}
                              width={bw}
                              height={bh}
                              {...sharedProps}
                            />
                          );
                        })}
                      </g>
                    );
                  })}
                </StrictClip>

                {/* Data labels */}
                {showDataLabels &&
                  (() => {
                    // Reset stacked accumulators for label positioning
                    if (stackedData) {
                      for (const c of allCats) {
                        stackedData[c].positive = 0;
                        stackedData[c].negative = 0;
                      }
                    }
                    return visibleSeries.map((series, seriesIdx) => {
                      const color = getColor(series, seriesIdx);
                      const fmt =
                        series.dataLabelFormat ??
                        ((p: ChartDataPoint) => String(getVal(p)));
                      return (
                        <g key={`dl-${series.id}`} pointerEvents="none">
                          {series.data.map((point, pi) => {
                            const barRect = getBarRect(
                              seriesIdx,
                              point,
                              series,
                              pi
                            );
                            if (!barRect) return null;
                            const { x, y, width: bw, height: bh } = barRect;
                            const val = getVal(point);
                            let lx: number;
                            let ly: number;
                            if (isHorizontal) {
                              lx = val >= 0 ? x + bw + 4 : x - 4;
                              ly = y + bh / 2;
                            } else {
                              lx = x + bw / 2;
                              ly = val >= 0 ? y - 4 : y + bh + 14;
                            }
                            return (
                              <text
                                key={pi}
                                x={lx}
                                y={ly}
                                className="k-chart-data-label"
                                textAnchor={
                                  isHorizontal
                                    ? val >= 0
                                      ? "start"
                                      : "end"
                                    : "middle"
                                }
                                dominantBaseline={
                                  isHorizontal ? "central" : undefined
                                }
                                fill={color}
                              >
                                {fmt(point)}
                              </text>
                            );
                          })}
                        </g>
                      );
                    });
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

BarChart.displayName = "BarChart";
