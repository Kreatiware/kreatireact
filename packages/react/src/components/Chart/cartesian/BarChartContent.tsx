import React, { useState, useRef } from "react";
import type { TooltipEntry } from "../core/ChartTooltip";
import { ChartPattern, patternFill } from "../core/patterns";
import type { ChartDataPoint, ChartSeries } from "../core/types";
import type { ChartContentBaseProps } from "./chartContentTypes";

export interface BarChartContentProps extends ChartContentBaseProps {
  groupMode?: "grouped" | "stacked" | "stacked-100";
  orientation?: "vertical" | "horizontal";
  barRadius?: number;
  barGap?: number;
  barWidth?:
    | number
    | "auto"
    | ((point: ChartDataPoint, series: ChartSeries, index: number) => number);
  showDataLabels?: boolean;
  showCategoryDividers?: boolean;
}

/**
 * BarChartContent — SVG rendering logic for bar charts.
 * Designed to be used inside a CartesianChart render prop.
 * @internal
 */
export const BarChartContent: React.FC<BarChartContentProps> = ({
  ctx,
  groupMode = "grouped",
  orientation = "vertical",
  barRadius = 0,
  barGap = 0.1,
  barWidth = "auto",
  showDataLabels = false,
  showCategoryDividers = false,
  tooltipMode = "single",
  tooltipFollowCursor = false,
  tooltipHandlers,
  onPointClick,
  categories,
  margins,
}) => {
  const {
    xScale,
    yScale,
    plotWidth,
    plotHeight,
    visibleSeries,
    getColor,
    focusedSeriesIndex,
    focusedPointIndex,
  } = ctx;
  const ml = margins?.left ?? 50;
  const mt = margins?.top ?? 20;
  const isHorizontal = orientation === "horizontal";
  const [hoveredBar, setHoveredBar] = useState<{
    seriesId: string;
    pointIdx: number;
  } | null>(null);
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null);

  const valueScale = isHorizontal ? xScale : yScale;
  const catScale = isHorizontal ? yScale : xScale;
  const getCat = (p: ChartDataPoint) => (isHorizontal ? p.y : p.x);
  const getVal = (p: ChartDataPoint) => (isHorizontal ? p.x : p.y);

  const allCats = Array.from(
    new Set(visibleSeries.flatMap(s => s.data.map(getCat)))
  ).sort((a, b) => a - b);
  const seriesCount = visibleSeries.length;
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

  const stackedData = (() => {
    if (groupMode !== "stacked" && groupMode !== "stacked-100") return null;
    const map: Record<
      number,
      { positive: number; negative: number; total: number }
    > = {};
    for (const c of allCats) map[c] = { positive: 0, negative: 0, total: 0 };
    if (groupMode === "stacked-100") {
      for (const s of visibleSeries)
        for (const p of s.data) map[getCat(p)].total += Math.abs(getVal(p));
    }
    return map;
  })();

  const getBarRect = (
    seriesIdx: number,
    point: ChartDataPoint,
    _series: ChartSeries,
    pointIdx: number
  ) => {
    const cat = getCat(point);
    const center = catScale(cat);
    let value = getVal(point);
    const bw =
      typeof barWidth === "function"
        ? barWidth(point, _series, pointIdx)
        : defaultBarWidth;

    if (groupMode === "grouped") {
      const groupWidth =
        defaultBarWidth * seriesCount + usableSize * barGap * (seriesCount - 1);
      const slotCenter =
        center -
        groupWidth / 2 +
        seriesIdx * (defaultBarWidth + usableSize * barGap) +
        defaultBarWidth / 2;
      const barStart = valueScale(0);
      const barEnd = valueScale(value);
      if (isHorizontal)
        return {
          x: Math.min(barStart, barEnd),
          y: slotCenter - bw / 2,
          width: Math.abs(barEnd - barStart),
          height: bw,
        };
      return {
        x: slotCenter - bw / 2,
        y: Math.min(barStart, barEnd),
        width: bw,
        height: Math.abs(barStart - barEnd),
      };
    }

    if (!stackedData) return null;
    const entry = stackedData[cat];
    if (!entry) return null;
    if (groupMode === "stacked-100" && entry.total > 0)
      value = (value / entry.total) * 100;
    const isNeg = value < 0;
    const base = isNeg ? entry.negative : entry.positive;
    const top = base + value;
    if (isNeg) entry.negative = top;
    else entry.positive = top;
    const barStart = valueScale(base);
    const barEnd = valueScale(top);
    if (isHorizontal)
      return {
        x: Math.min(barStart, barEnd),
        y: center - bw / 2,
        width: Math.abs(barEnd - barStart),
        height: bw,
      };
    return {
      x: center - bw / 2,
      y: Math.min(barStart, barEnd),
      width: bw,
      height: Math.abs(barStart - barEnd),
    };
  };

  if (stackedData)
    for (const c of allCats) {
      stackedData[c].positive = 0;
      stackedData[c].negative = 0;
    }

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

    const anchor = tooltipMode === "single" && !tooltipFollowCursor;
    let pos = { x: e.clientX, y: e.clientY };
    if (anchor && svg) {
      const barRect = getBarRect(seriesIdx, point, series, pointIdx);
      if (barRect) {
        const svgRect = svg.getBoundingClientRect();
        const cx = isHorizontal
          ? barRect.x + barRect.width
          : barRect.x + barRect.width / 2;
        const cy = isHorizontal ? barRect.y + barRect.height / 2 : barRect.y;
        pos = { x: svgRect.left + ml + cx, y: svgRect.top + mt + cy };
      }
    }

    const catIdx = getCat(point);
    tooltipHandlers.onTooltipShow(
      entries,
      pos,
      categories?.[catIdx] ?? String(catIdx),
      anchor
    );
  };

  const handleBarMouseLeave = () => {
    setHoveredBar(null);
    tooltipHandlers.onTooltipHide();
  };

  const handleBarMouseMove = (e: React.MouseEvent) => {
    if (tooltipFollowCursor || tooltipMode !== "single") {
      tooltipHandlers.onTooltipMove({ x: e.clientX, y: e.clientY });
    }
  };

  return (
    <g
      className="k-chart-bars"
      onMouseDown={e => {
        mouseDownPos.current = { x: e.clientX, y: e.clientY };
      }}
    >
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
              const barRect = getBarRect(seriesIdx, point, series, pointIdx);
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
              return (
                <rect
                  key={pointIdx}
                  x={x}
                  y={y}
                  width={bw}
                  height={bh}
                  rx={useRadius ? Math.min(barRadius, bw / 2, bh / 2) : 0}
                  ry={useRadius ? Math.min(barRadius, bw / 2, bh / 2) : 0}
                  fill={point.color ? point.color : pointColor}
                  fillOpacity={fillOpacity}
                  stroke={isFocused ? "var(--kreati-chart-text)" : undefined}
                  strokeWidth={isFocused ? 3 : undefined}
                  opacity={isDimmed ? 0.3 : 1}
                  className={point.className}
                  style={
                    {
                      transformOrigin: isHorizontal
                        ? `${valueScale(0)}px ${y + bh / 2}px`
                        : `${x + bw / 2}px ${valueScale(0)}px`,
                      "--k-bar-i":
                        seriesIdx * (visibleSeries[0]?.data.length ?? 0) +
                        pointIdx,
                      ...point.style,
                    } as React.CSSProperties
                  }
                  role="img"
                  aria-label={`${series.name}: ${categories?.[getCat(point)] ?? getCat(point)} = ${getVal(point)}`}
                  onMouseEnter={e =>
                    handleBarMouseEnter(e, series, seriesIdx, point, pointIdx)
                  }
                  onMouseLeave={handleBarMouseLeave}
                  onMouseMove={handleBarMouseMove}
                  onClick={e => {
                    if (!onPointClick) return;
                    if (mouseDownPos.current) {
                      const dx = e.clientX - mouseDownPos.current.x;
                      const dy = e.clientY - mouseDownPos.current.y;
                      if (dx * dx + dy * dy > 25) return;
                    }
                    e.stopPropagation();
                    onPointClick(originalPoint(point), series);
                  }}
                  cursor={onPointClick ? "pointer" : undefined}
                />
              );
            })}
          </g>
        );
      })}

      {showDataLabels &&
        (() => {
          if (stackedData)
            for (const c of allCats) {
              stackedData[c].positive = 0;
              stackedData[c].negative = 0;
            }
          return visibleSeries.map((series, seriesIdx) => {
            const color = getColor(series, seriesIdx);
            const fmt =
              series.dataLabelFormat ??
              ((p: ChartDataPoint) => String(getVal(p)));
            return (
              <g key={`dl-${series.id}`} pointerEvents="none">
                {series.data.map((point, pi) => {
                  const barRect = getBarRect(seriesIdx, point, series, pi);
                  if (!barRect) return null;
                  const { x, y, width: bw, height: bh } = barRect;
                  const val = getVal(point);
                  let lx: number, ly: number;
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
                        isHorizontal ? (val >= 0 ? "start" : "end") : "middle"
                      }
                      dominantBaseline={isHorizontal ? "central" : undefined}
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
};
