import React, {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  axisAngles,
  computeRadarPoints,
  radarPolygonPath,
  gridPath,
} from "../core/radar";
import type { RadarPoint } from "../core/radar";
import type { ChartFill, ChartSeverity } from "../core/types";
import type { TooltipEntry } from "../core/ChartTooltip";
import { ChartTooltip } from "../core/ChartTooltip";
import { Legend } from "../core/Legend";
import { ChartPattern, patternFill } from "../core/patterns";
import { resolveSeriesColor } from "../core/colors";
import { exportPng, exportSvg } from "../core/export";
import { ContextMenu } from "../../ContextMenu";
import type { MenuItem } from "../../../types/navigation";
import { useKreatiLocale } from "../../../locale/KreatiProvider";
import "../Chart.css";

// ─── Types ──────────────────────────────────────────────────────────────────

/** A single series for the RadarChart. */
export interface RadarSeries {
  /** Unique identifier. */
  id: string;
  /** Display name. */
  name: string;
  /** Values — one per axis, in the same order as `axes`. */
  values: number[];
  /** Explicit color override. */
  color?: string;
  /** Severity-based color. */
  severity?: ChartSeverity;
  /** Fill pattern. */
  fill?: ChartFill;
  /** Line width. Default: 2 */
  lineWidth?: number;
  /** Initially hidden in legend. */
  hidden?: boolean;
  /** Per-series CSS class. */
  className?: string;
  /** Per-series inline style applied to the polygon group. */
  style?: React.CSSProperties;
}

/** Props for the RadarChart component. */
export interface RadarChartProps {
  /** Axis names. Each axis radiates from the center. */
  axes: string[];
  /** Data series to render. Each series.values must match axes length. */
  series: RadarSeries[];
  /** Chart width. When omitted, fills container (responsive). */
  width?: number;
  /** Chart height. Default: 400 */
  height?: number;
  /** Minimum scale value. Default: 0 */
  min?: number;
  /** Maximum scale value. When omitted, auto-detected from data. */
  max?: number;
  /** Number of concentric grid levels. Default: 5 */
  gridLevels?: number;
  /** Grid shape. Default: "polygon" */
  gridShape?: "polygon" | "circle";
  /** Show grid level value labels. Default: true */
  showGridLabels?: boolean;
  /** Show axis labels. Default: true */
  showLabels?: boolean;
  /** Show markers at data vertices. Default: true */
  showMarkers?: boolean;
  /** Marker radius. Default: 4 */
  markerSize?: number;
  /** Area fill opacity. Default: 0.25 */
  fillOpacity?: number;
  /** Chart title. */
  title?: string;
  /** Chart subtitle. */
  subtitle?: string;
  /** Legend position. Default: "bottom" */
  legendPosition?: "top" | "bottom" | "left" | "right" | "none";
  /** Legend direction override. */
  legendDirection?: "horizontal" | "vertical";
  /** Show tooltip. Default: true */
  showTooltip?: boolean;
  /** Tooltip mode. "single" shows one point, "shared" shows all series for the hovered axis, "series" shows all axes for the hovered series. Default: "single" */
  tooltipMode?: "single" | "shared" | "series";
  /** Custom tooltip render. */
  tooltipRender?: (
    series: RadarSeries,
    axisName: string,
    value: number
  ) => React.ReactNode;
  /** Callback when a data point is clicked. */
  onPointClick?: (
    series: RadarSeries,
    axisIndex: number,
    value: number
  ) => void;
  /** Export formats. Default: [] */
  exportFormats?: ("png" | "svg" | "csv" | "json")[];
  /** Include title in exports. Default: true */
  exportTitle?: boolean;
  /** CSV separator. Default: ";" */
  csvSeparator?: string;
  /** Show menu button. Default: "auto" */
  showMenuButton?: boolean | "auto";
  /** Additional context menu items. */
  contextMenuItems?: MenuItem[];
  /** Custom palette override. */
  palette?: string[];
  /** Additional CSS class. */
  className?: string;
  /** Inline styles. */
  style?: React.CSSProperties;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const ELLIPSIS_V =
  "M12 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4z";

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * RadarChart — multi-axis radial chart for comparing variables across series.
 * Also known as Spider Chart or Star Chart.
 *
 * @example
 * ```tsx
 * <RadarChart
 *   axes={["Speed", "Power", "Defense", "Range", "Magic"]}
 *   series={[{ id: "hero", name: "Hero", values: [80, 60, 90, 40, 70] }]}
 * />
 * ```
 */
export const RadarChart = forwardRef<HTMLDivElement, RadarChartProps>(
  (
    {
      axes,
      series,
      width,
      height = 400,
      min = 0,
      max: maxProp,
      gridLevels = 5,
      gridShape = "polygon",
      showGridLabels = true,
      showLabels = true,
      showMarkers = true,
      markerSize = 4,
      fillOpacity = 0.25,
      title,
      subtitle,
      legendPosition = "bottom",
      legendDirection,
      showTooltip = true,
      tooltipMode = "single",
      tooltipRender,
      onPointClick,
      exportFormats = [],
      exportTitle = true,
      csvSeparator = ";",
      showMenuButton = "auto",
      contextMenuItems,
      palette,
      className = "",
      style,
    },
    ref
  ) => {
    const locale = useKreatiLocale();
    const t = locale.chart;

    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(width ?? 400);
    const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);
    const [hoveredPoint, setHoveredPoint] = useState<{
      seriesId: string;
      axisIndex: number;
    } | null>(null);
    const [focusedSeries, setFocusedSeries] = useState<number>(0);
    const [focusedPoint, setFocusedPoint] = useState<number | null>(null);
    const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => {
      const set = new Set<string>();
      series.forEach(s => {
        if (s.hidden) set.add(s.id);
      });
      return set;
    });
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [liveText, setLiveText] = useState("");

    // Responsive width
    const observerRef = useRef<ResizeObserver | null>(null);
    const measuredRef = useCallback(
      (node: HTMLDivElement | null) => {
        if (observerRef.current) observerRef.current.disconnect();
        if (node && !width) {
          observerRef.current = new ResizeObserver(entries => {
            const w = entries[0]?.contentRect.width;
            if (w && w > 0) setContainerWidth(w);
          });
          observerRef.current.observe(node);
          const w = node.getBoundingClientRect().width;
          if (w > 0) setContainerWidth(w);
        }
      },
      [width]
    );

    // Visible series
    const visibleSeries = useMemo(
      () => series.filter(s => !hiddenIds.has(s.id)),
      [series, hiddenIds]
    );

    // Auto max
    const max = useMemo(() => {
      if (maxProp !== undefined) return maxProp;
      let m = 0;
      for (const s of visibleSeries) {
        for (const v of s.values) {
          if (v > m) m = v;
        }
      }
      return m || 100;
    }, [maxProp, visibleSeries]);

    // Geometry
    const chartW = width ?? containerWidth;
    const svgH = height;
    const cx = chartW / 2;
    const cy = svgH / 2;
    const maxLabelLen = showLabels
      ? Math.max(...axes.map(a => a.length), 0)
      : 0;
    const labelMarginPx = showLabels ? Math.max(30, maxLabelLen * 6 + 16) : 4;
    const radius = Math.min(chartW, svgH) / 2 - labelMarginPx;
    const angles = useMemo(() => axisAngles(axes.length), [axes.length]);

    // Colors (stable per original index)
    const colorMap = useMemo(() => {
      const map = new Map<string, string>();
      series.forEach((s, i) => {
        map.set(
          s.id,
          resolveSeriesColor(
            {
              id: s.id,
              name: s.name,
              data: [],
              color: s.color,
              severity: s.severity,
            },
            i,
            palette
          )
        );
      });
      return map;
    }, [series, palette]);

    // Radar points per visible series
    const seriesPoints = useMemo(
      () =>
        visibleSeries.map(s =>
          computeRadarPoints(s.values, cx, cy, radius, angles, min, max)
        ),
      [visibleSeries, cx, cy, radius, angles, min, max]
    );

    // Patterns
    const patterns = useMemo(() => {
      const set: { type: "stripes" | "dots" | "crosshatch"; color: string }[] =
        [];
      visibleSeries.forEach(s => {
        if (s.fill?.pattern) {
          set.push({ type: s.fill.pattern, color: colorMap.get(s.id) || "" });
        }
      });
      return set;
    }, [visibleSeries, colorMap]);

    // Legend toggle
    const handleLegendToggle = useCallback((id: string) => {
      setHiddenIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }, []);

    // Legend series adapter
    const legendSeries = useMemo(
      () =>
        series.map(s => ({
          id: s.id,
          name: s.name,
          data: [],
          color: colorMap.get(s.id),
        })),
      [series, colorMap]
    );

    // Active point for tooltip
    const activeSeriesId = hoveredPoint?.seriesId ?? null;
    const activeAxisIndex = hoveredPoint?.axisIndex ?? null;
    const activeSeries =
      activeSeriesId !== null
        ? (visibleSeries.find(s => s.id === activeSeriesId) ?? null)
        : null;

    // Mouse handlers
    const handlePointEnter = useCallback(
      (e: React.MouseEvent, seriesId: string, axisIndex: number) => {
        setHoveredSeries(seriesId);
        setHoveredPoint({ seriesId, axisIndex });
        setTooltipPos({ x: e.clientX, y: e.clientY });
        setTooltipVisible(true);
      },
      []
    );

    const handlePointMove = useCallback((e: React.MouseEvent) => {
      setTooltipPos({ x: e.clientX, y: e.clientY });
    }, []);

    const handlePointLeave = useCallback(() => {
      setHoveredSeries(null);
      setHoveredPoint(null);
      setTooltipVisible(false);
    }, []);

    // Area hover (highlight series without specific point)
    const handleAreaEnter = useCallback(
      (e: React.MouseEvent, seriesId: string) => {
        setHoveredSeries(seriesId);
        if (tooltipMode === "series") {
          setTooltipPos({ x: e.clientX, y: e.clientY });
          setTooltipVisible(true);
        }
      },
      [tooltipMode]
    );

    const handleAreaMove = useCallback(
      (e: React.MouseEvent) => {
        if (tooltipMode === "series") {
          setTooltipPos({ x: e.clientX, y: e.clientY });
        }
      },
      [tooltipMode]
    );

    const handleAreaLeave = useCallback(() => {
      if (!hoveredPoint) {
        setHoveredSeries(null);
        if (tooltipMode === "series") setTooltipVisible(false);
      }
    }, [hoveredPoint, tooltipMode]);

    // Touch
    const handlePointTouch = useCallback(
      (e: React.TouchEvent, seriesId: string, axisIndex: number) => {
        const touch = e.touches[0];
        if (!touch) return;
        setHoveredSeries(seriesId);
        setHoveredPoint({ seriesId, axisIndex });
        setTooltipPos({ x: touch.clientX, y: touch.clientY });
        setTooltipVisible(true);
      },
      []
    );

    const handleTouchEnd = useCallback(() => {
      setHoveredSeries(null);
      setHoveredPoint(null);
      setTooltipVisible(false);
    }, []);

    // Position tooltip at a radar point in viewport coordinates
    const positionTooltipAtPoint = useCallback(
      (seriesIdx: number, pointIdx: number) => {
        const points = seriesPoints[seriesIdx];
        const p = points?.[pointIdx];
        if (!p) return;
        const svgEl = containerRef.current?.querySelector("svg.k-radar-chart");
        if (!svgEl) return;
        const svgRect = svgEl.getBoundingClientRect();
        const scaleX = svgRect.width / chartW;
        const scaleY = svgRect.height / svgH;
        setTooltipPos({
          x: svgRect.left + p.x * scaleX,
          y: svgRect.top + p.y * scaleY,
        });
        setTooltipVisible(true);
        setHoveredPoint({
          seriesId: visibleSeries[seriesIdx].id,
          axisIndex: pointIdx,
        });
        setHoveredSeries(visibleSeries[seriesIdx].id);
      },
      [seriesPoints, chartW, svgH, visibleSeries]
    );

    // Keyboard navigation
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (visibleSeries.length === 0 || axes.length === 0) return;

        switch (e.key) {
          case "ArrowRight": {
            e.preventDefault();
            const fp = focusedPoint ?? -1;
            const next = (fp + 1) % axes.length;
            setFocusedPoint(next);
            const s = visibleSeries[focusedSeries];
            setLiveText(`${axes[next]}: ${s.values[next]}`);
            positionTooltipAtPoint(focusedSeries, next);
            break;
          }
          case "ArrowLeft": {
            e.preventDefault();
            const fp = focusedPoint ?? axes.length;
            const next = (fp - 1 + axes.length) % axes.length;
            setFocusedPoint(next);
            const s = visibleSeries[focusedSeries];
            setLiveText(`${axes[next]}: ${s.values[next]}`);
            positionTooltipAtPoint(focusedSeries, next);
            break;
          }
          case "ArrowDown": {
            e.preventDefault();
            const next = (focusedSeries + 1) % visibleSeries.length;
            setFocusedSeries(next);
            setLiveText(visibleSeries[next].name);
            if (focusedPoint !== null) {
              positionTooltipAtPoint(next, focusedPoint);
            }
            break;
          }
          case "ArrowUp": {
            e.preventDefault();
            const next =
              (focusedSeries - 1 + visibleSeries.length) % visibleSeries.length;
            setFocusedSeries(next);
            setLiveText(visibleSeries[next].name);
            if (focusedPoint !== null) {
              positionTooltipAtPoint(next, focusedPoint);
            }
            break;
          }
          case "Home":
            e.preventDefault();
            setFocusedPoint(0);
            positionTooltipAtPoint(focusedSeries, 0);
            break;
          case "End":
            e.preventDefault();
            setFocusedPoint(axes.length - 1);
            positionTooltipAtPoint(focusedSeries, axes.length - 1);
            break;
          case "Enter":
          case " ":
            e.preventDefault();
            if (focusedPoint !== null && onPointClick) {
              const s = visibleSeries[focusedSeries];
              onPointClick(s, focusedPoint, s.values[focusedPoint]);
            }
            break;
          case "Escape":
            setFocusedPoint(null);
            setTooltipVisible(false);
            setLiveText("");
            break;
        }
      },
      [
        visibleSeries,
        axes,
        focusedSeries,
        focusedPoint,
        onPointClick,
        positionTooltipAtPoint,
      ]
    );

    // Export
    const handleMenuSelect = useCallback(
      (key: string) => {
        const svg = containerRef.current?.querySelector(
          "svg.k-radar-chart"
        ) as SVGSVGElement | null;
        if (key === "export-png" && svg)
          exportPng(
            svg,
            exportTitle ? title : undefined,
            exportTitle ? subtitle : undefined
          );
        if (key === "export-svg" && svg)
          exportSvg(
            svg,
            exportTitle ? title : undefined,
            exportTitle ? subtitle : undefined
          );
        if (key === "export-csv") {
          const header = ["Series", ...axes].join(csvSeparator);
          const rows = [header];
          visibleSeries.forEach(s => {
            rows.push([s.name, ...s.values.map(String)].join(csvSeparator));
          });
          const blob = new Blob([rows.join("\n")], {
            type: "text/csv;charset=utf-8",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "chart.csv";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
        if (key === "export-json") {
          const rows = visibleSeries.map(s => ({
            name: s.name,
            values: Object.fromEntries(axes.map((a, i) => [a, s.values[i]])),
          }));
          const blob = new Blob([JSON.stringify(rows, null, 2)], {
            type: "application/json",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "chart.json";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      },
      [visibleSeries, axes, title, subtitle, exportTitle, csvSeparator]
    );

    // Context menu
    const menuItems: MenuItem[] = useMemo(() => {
      const items: MenuItem[] = [];
      if (exportFormats.includes("png"))
        items.push({ key: "export-png", label: t.exportPng });
      if (exportFormats.includes("svg"))
        items.push({ key: "export-svg", label: t.exportSvg });
      if (exportFormats.includes("csv"))
        items.push({ key: "export-csv", label: t.exportCsv });
      if (exportFormats.includes("json"))
        items.push({
          key: "export-json",
          label: t.exportJsonTable || "Export JSON",
        });
      if (contextMenuItems?.length) {
        if (items.length > 0)
          items.push({ key: "divider-custom", separator: true });
        items.push(...contextMenuItems);
      }
      return items;
    }, [exportFormats, contextMenuItems, t]);

    const hasMenu =
      showMenuButton === true ||
      (showMenuButton === "auto" && menuItems.length > 0);

    // Tooltip
    const hoveredSeriesObj = hoveredSeries
      ? (visibleSeries.find(s => s.id === hoveredSeries) ?? null)
      : null;

    const tooltipEntries: TooltipEntry[] = useMemo(() => {
      if (tooltipMode === "series") {
        if (!hoveredSeriesObj) return [];
        return axes.map((_, i) => ({
          series: {
            id: hoveredSeriesObj.id,
            name: hoveredSeriesObj.name,
            data: [{ x: i, y: hoveredSeriesObj.values[i] }],
          },
          point: { x: i, y: hoveredSeriesObj.values[i] },
          color: colorMap.get(hoveredSeriesObj.id) || "",
        }));
      }

      if (activeAxisIndex === null) return [];

      if (tooltipMode === "shared") {
        return visibleSeries.map(s => ({
          series: {
            id: s.id,
            name: s.name,
            data: [{ x: activeAxisIndex, y: s.values[activeAxisIndex] }],
          },
          point: { x: activeAxisIndex, y: s.values[activeAxisIndex] },
          color: colorMap.get(s.id) || "",
        }));
      }

      if (!activeSeries) return [];
      return [
        {
          series: {
            id: activeSeries.id,
            name: activeSeries.name,
            data: [
              { x: activeAxisIndex, y: activeSeries.values[activeAxisIndex] },
            ],
          },
          point: {
            x: activeAxisIndex,
            y: activeSeries.values[activeAxisIndex],
          },
          color: colorMap.get(activeSeries.id) || "",
        },
      ];
    }, [
      activeSeries,
      activeAxisIndex,
      colorMap,
      tooltipMode,
      visibleSeries,
      hoveredSeriesObj,
      axes,
    ]);

    const customTooltipRender =
      tooltipRender && activeSeries && activeAxisIndex !== null
        ? () =>
            tooltipRender(
              activeSeries,
              axes[activeAxisIndex],
              activeSeries.values[activeAxisIndex]
            )
        : tooltipMode === "series" && hoveredSeriesObj
          ? () => {
              const color = colorMap.get(hoveredSeriesObj.id) || "";
              return (
                <div>
                  <div className="k-chart-tooltip__title">
                    {hoveredSeriesObj.name}
                  </div>
                  {axes.map((axis, i) => (
                    <div key={axis} className="k-chart-tooltip__row">
                      <span
                        className="k-chart-tooltip__dot"
                        style={{ backgroundColor: color }}
                      />
                      <span className="k-chart-tooltip__name">{axis}</span>
                      <span className="k-chart-tooltip__value">
                        {hoveredSeriesObj.values[i]}
                      </span>
                    </div>
                  ))}
                </div>
              );
            }
          : activeAxisIndex !== null
            ? () => (
                <div>
                  <div className="k-chart-tooltip__title">
                    {axes[activeAxisIndex]}
                  </div>
                  {tooltipEntries.map(entry => (
                    <div key={entry.series.id} className="k-chart-tooltip__row">
                      <span
                        className="k-chart-tooltip__dot"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="k-chart-tooltip__name">
                        {entry.series.name}
                      </span>
                      <span className="k-chart-tooltip__value">
                        {entry.point.y}
                      </span>
                    </div>
                  ))}
                </div>
              )
            : undefined;

    // Legend
    const legend =
      legendPosition !== "none" ? (
        <Legend
          series={legendSeries}
          hiddenIds={hiddenIds}
          onToggle={handleLegendToggle}
          position={legendPosition}
          direction={legendDirection}
          palette={palette}
        />
      ) : null;

    const body = (
      <div
        ref={node => {
          if (typeof ref === "function") ref(node);
          else if (ref)
            (ref as React.MutableRefObject<HTMLDivElement | null>).current =
              node;
          (
            containerRef as React.MutableRefObject<HTMLDivElement | null>
          ).current = node;
          measuredRef(node);
        }}
        className={`k-radar-chart-container${className ? ` ${className}` : ""}`}
        style={style}
        tabIndex={0}
        role="figure"
        aria-label={title || "Radar chart"}
        aria-roledescription="radar chart"
        onKeyDown={handleKeyDown}
        onBlur={e => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setFocusedPoint(null);
            setLiveText("");
          }
        }}
      >
        <div aria-live="polite" aria-atomic="true" className="k-sr-only">
          {liveText}
        </div>

        {(title || subtitle) && (
          <div className="k-chart-header">
            {title && <div className="k-chart-header__title">{title}</div>}
            {subtitle && (
              <div className="k-chart-header__subtitle">{subtitle}</div>
            )}
          </div>
        )}

        {legendPosition === "top" && legend}

        <div
          className="k-radar-chart__body"
          style={
            legendPosition === "left" || legendPosition === "right"
              ? { display: "flex", alignItems: "center" }
              : undefined
          }
        >
          {legendPosition === "left" && legend}

          <div className="k-radar-chart__svg-wrap">
            <svg
              className="k-radar-chart k-chart"
              viewBox={`0 0 ${chartW} ${svgH}`}
              width={width ? chartW : "100%"}
              height={svgH}
              role="img"
              aria-label={title || "Radar chart"}
            >
              <defs>
                {patterns.map(p => (
                  <ChartPattern
                    key={`${p.type}-${p.color}`}
                    type={p.type}
                    color={p.color}
                  />
                ))}
              </defs>

              {/* Grid levels */}
              {Array.from({ length: gridLevels }, (_, i) => {
                const level = (i + 1) / gridLevels;
                const r = radius * level;
                return (
                  <path
                    key={`grid-${i}`}
                    d={gridPath(cx, cy, r, angles, gridShape)}
                    className="k-radar-grid"
                    fill="none"
                  />
                );
              })}

              {/* Axis lines */}
              {angles.map((angle, i) => (
                <line
                  key={`axis-${i}`}
                  x1={cx}
                  y1={cy}
                  x2={cx + radius * Math.cos(angle)}
                  y2={cy + radius * Math.sin(angle)}
                  className="k-radar-axis"
                />
              ))}

              {/* Grid level labels */}
              {showGridLabels &&
                Array.from({ length: gridLevels }, (_, i) => {
                  const level = (i + 1) / gridLevels;
                  const val = min + (max - min) * level;
                  const y = cy - radius * level;
                  return (
                    <text
                      key={`grid-label-${i}`}
                      x={cx + 4}
                      y={y - 2}
                      className="k-radar-grid-label"
                    >
                      {Number.isInteger(val) ? val : val.toFixed(1)}
                    </text>
                  );
                })}

              {/* Axis labels */}
              {showLabels &&
                angles.map((angle, i) => {
                  const labelR = radius + 14;
                  const x = cx + labelR * Math.cos(angle);
                  const y = cy + labelR * Math.sin(angle);
                  const isRight = Math.cos(angle) > 0.01;
                  const isLeft = Math.cos(angle) < -0.01;
                  const anchor = isRight ? "start" : isLeft ? "end" : "middle";
                  const dy =
                    Math.sin(angle) > 0.5
                      ? "0.8em"
                      : Math.sin(angle) < -0.5
                        ? "-0.2em"
                        : "0.35em";

                  return (
                    <text
                      key={`label-${i}`}
                      x={x}
                      y={y}
                      textAnchor={anchor}
                      dy={dy}
                      className="k-radar-label"
                    >
                      {axes[i]}
                    </text>
                  );
                })}

              {/* Series polygons */}
              {visibleSeries.map((s, si) => {
                const points = seriesPoints[si];
                const color = colorMap.get(s.id) || "";
                const fillColor = s.fill?.pattern
                  ? patternFill(s.fill.pattern, color)
                  : s.fill?.color || color;
                const dimmed =
                  tooltipMode === "single" &&
                  hoveredSeries !== null &&
                  hoveredSeries !== s.id;
                const isFocusedSeries = focusedSeries === si;

                return (
                  <g
                    key={s.id}
                    className={`k-radar-series${s.className ? ` ${s.className}` : ""}`}
                    style={{
                      ...s.style,
                      opacity: dimmed ? 0.15 : 1,
                    }}
                    onMouseEnter={e => handleAreaEnter(e, s.id)}
                    onMouseMove={handleAreaMove}
                    onMouseLeave={handleAreaLeave}
                  >
                    {/* Area fill */}
                    <path
                      d={radarPolygonPath(points)}
                      fill={fillColor}
                      fillOpacity={s.fill?.opacity ?? fillOpacity}
                      fillRule="evenodd"
                      stroke={color}
                      strokeWidth={s.lineWidth ?? 2}
                      className="k-radar-polygon"
                    />

                    {/* Markers */}
                    {showMarkers &&
                      points.map((p, pi) => {
                        const isHovered =
                          hoveredPoint?.seriesId === s.id &&
                          hoveredPoint?.axisIndex === pi;
                        const isFocused =
                          isFocusedSeries && focusedPoint === pi;
                        const r =
                          isHovered || isFocused ? markerSize + 2 : markerSize;

                        return (
                          <circle
                            key={`marker-${pi}`}
                            cx={p.x}
                            cy={p.y}
                            r={r}
                            fill={color}
                            stroke="var(--kreati-chart-bg)"
                            strokeWidth={2}
                            className="k-radar-marker"
                            onMouseEnter={e => handlePointEnter(e, s.id, pi)}
                            onMouseMove={handlePointMove}
                            onMouseLeave={handlePointLeave}
                            onTouchStart={e => handlePointTouch(e, s.id, pi)}
                            onTouchEnd={handleTouchEnd}
                            onClick={() => onPointClick?.(s, pi, s.values[pi])}
                            style={
                              onPointClick ? { cursor: "pointer" } : undefined
                            }
                          />
                        );
                      })}

                    {/* Focus ring on keyboard-focused point */}
                    {isFocusedSeries &&
                      focusedPoint !== null &&
                      points[focusedPoint] && (
                        <circle
                          cx={points[focusedPoint].x}
                          cy={points[focusedPoint].y}
                          r={markerSize + 4}
                          fill="none"
                          stroke="var(--kreati-primary-500)"
                          strokeWidth={2}
                          className="k-chart-focus-ring"
                          pointerEvents="none"
                        />
                      )}
                  </g>
                );
              })}
            </svg>

            {hasMenu && (
              <button
                type="button"
                className="k-chart-menu-btn"
                aria-label={t.menuLabel}
                onClick={e => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.dispatchEvent(
                    new MouseEvent("contextmenu", {
                      bubbles: true,
                      clientX: rect.left,
                      clientY: rect.bottom,
                    })
                  );
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d={ELLIPSIS_V} />
                </svg>
              </button>
            )}
          </div>

          {legendPosition === "right" && legend}
        </div>

        {legendPosition === "bottom" && legend}

        {/* Accessible data table */}
        <table className="k-sr-only">
          <caption>{title || "Radar chart data"}</caption>
          <thead>
            <tr>
              <th>Series</th>
              {axes.map(a => (
                <th key={a}>{a}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleSeries.map(s => (
              <tr key={s.id}>
                <td>{s.name}</td>
                {s.values.map((v, i) => (
                  <td key={i}>{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {showTooltip && (
          <ChartTooltip
            entries={tooltipEntries}
            x={tooltipPos.x}
            y={tooltipPos.y}
            visible={
              tooltipVisible &&
              (activeAxisIndex !== null || hoveredSeriesObj !== null)
            }
            customRender={customTooltipRender}
          />
        )}
      </div>
    );

    if (menuItems.length > 0) {
      return (
        <ContextMenu
          items={menuItems}
          trigger="contextmenu"
          onItemSelect={handleMenuSelect}
        >
          {body}
        </ContextMenu>
      );
    }

    return body;
  }
);

RadarChart.displayName = "RadarChart";
