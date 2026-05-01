import React, {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { computeSlices, arcPath, labelPosition } from "../core/arc";
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

/** A single data item for the PieChart. */
export interface PieDataItem {
  /** Unique identifier. */
  id: string;
  /** Display name. */
  name: string;
  /** Numeric value (must be >= 0). */
  value: number;
  /** Explicit color override. */
  color?: string;
  /** Severity-based color. */
  severity?: ChartSeverity;
  /** Fill pattern/gradient. */
  fill?: ChartFill;
  /** Per-item CSS class. */
  className?: string;
  /** Per-item inline style. */
  style?: React.CSSProperties;
}

/** Props for the PieChart component. */
export interface PieChartProps {
  /** Data items to render as slices. */
  data: PieDataItem[];
  /** Chart width. When omitted, fills container (responsive). */
  width?: number;
  /** Chart height. Default: 300 */
  height?: number;
  /** Inner radius ratio (0-1). 0 = pie, >0 = donut. Default: 0 */
  innerRadius?: number;
  /** Start angle in degrees. Default: -90 (top) */
  startAngle?: number;
  /** End angle in degrees. Default: 270 (full circle from top) */
  endAngle?: number;
  /** Gap between slices in degrees. Default: 0 */
  padAngle?: number;
  /** Corner radius for slice edges. Default: 0 */
  cornerRadius?: number;
  /** Sort slices by value descending. Default: false */
  sortDescending?: boolean;
  /** Radial offset (px) when a slice is hovered. Default: 8 */
  hoverOffset?: number;
  /** Show labels on slices. Default: false */
  showLabels?: boolean;
  /** Label position: inside the slice or outside with leader lines. Default: "outside" */
  labelPosition?: "inside" | "outside";
  /** Custom label formatter. Receives item and percentage. */
  labelFormat?: (item: PieDataItem, percentage: number) => string;
  /** Minimum percentage to show a label (avoids clutter). Default: 5 */
  labelThreshold?: number;
  /** Minimum percentage for a slice to be shown individually. Smaller slices are grouped into "Others". 0 = disabled. Default: 0 */
  othersThreshold?: number;
  /** Show percentage in tooltip. Default: true */
  showPercentage?: boolean;
  /** Chart title. */
  title?: string;
  /** Chart subtitle. */
  subtitle?: string;
  /** Legend position. Default: "bottom" */
  legendPosition?: "top" | "bottom" | "left" | "right" | "none";
  /** Legend direction override. */
  legendDirection?: "horizontal" | "vertical";
  /** Tooltip mode. Default: true */
  showTooltip?: boolean;
  /** Custom tooltip render. */
  tooltipRender?: (item: PieDataItem, percentage: number) => React.ReactNode;
  /** Callback when a slice is clicked. */
  onSliceClick?: (item: PieDataItem, index: number) => void;
  /** Export formats available in context menu. Default: [] */
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
  /** Content displayed in the center of the donut hole. Only visible when no slice is active. Requires innerRadius > 0. */
  centerLabel?: React.ReactNode;
  /** Custom render for the center area. Receives total value and visible data. Only visible when no slice is active. Requires innerRadius > 0. */
  centerTemplate?: (total: number, data: PieDataItem[]) => React.ReactNode;
}

/** Props for the DonutChart component. Same as PieChartProps with innerRadius defaulting to 0.6. */
export interface DonutChartProps extends PieChartProps {}

// ─── Helpers ────────────────────────────────────────────────────────────────

const ELLIPSIS_V =
  "M12 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4z";

const OTHERS_ID = "__kreati_others__";

const resolveItemColor = (
  item: PieDataItem,
  index: number,
  palette?: string[]
): string =>
  resolveSeriesColor(
    {
      id: item.id,
      name: item.name,
      data: [],
      color: item.color,
      severity: item.severity,
    },
    index,
    palette
  );

const resolveItemFill = (item: PieDataItem, color: string): string => {
  if (item.fill?.pattern) return patternFill(item.fill.pattern, color);
  return item.fill?.color || color;
};

/** Groups small items into an "Others" bucket. */
const groupOthers = (
  data: PieDataItem[],
  threshold: number,
  othersLabel: string
): PieDataItem[] => {
  if (threshold <= 0) return data;
  const total = data.reduce((s, d) => s + Math.max(0, d.value), 0);
  if (total === 0) return data;

  const kept: PieDataItem[] = [];
  let othersValue = 0;

  for (const item of data) {
    if ((item.value / total) * 100 >= threshold) {
      kept.push(item);
    } else {
      othersValue += item.value;
    }
  }

  if (othersValue > 0) {
    kept.push({
      id: OTHERS_ID,
      name: othersLabel,
      value: othersValue,
      color: "var(--kreati-gray-400)",
    });
  }

  return kept;
};

// ─── PieChart Component ─────────────────────────────────────────────────────

/**
 * PieChart — radial chart displaying proportional data as slices.
 * Set `innerRadius` > 0 for donut variant, or use the dedicated `DonutChart` component.
 *
 * @example
 * ```tsx
 * <PieChart data={[{ id: "a", name: "Alpha", value: 30 }, { id: "b", name: "Beta", value: 70 }]} />
 * ```
 */
export const PieChart = forwardRef<HTMLDivElement, PieChartProps>(
  (
    {
      data,
      width,
      height = 300,
      innerRadius = 0,
      startAngle = -90,
      endAngle = 270,
      padAngle = 0,
      cornerRadius = 0,
      sortDescending = false,
      hoverOffset = 8,
      showLabels = false,
      labelPosition: labelPos = "outside",
      labelFormat,
      labelThreshold = 5,
      othersThreshold = 0,
      showPercentage = true,
      title,
      subtitle,
      legendPosition = "bottom",
      legendDirection,
      showTooltip = true,
      tooltipRender,
      onSliceClick,
      exportFormats = [],
      exportTitle = true,
      csvSeparator = ";",
      showMenuButton = "auto",
      contextMenuItems,
      palette,
      className = "",
      style,
      centerLabel,
      centerTemplate,
    },
    ref
  ) => {
    const locale = useKreatiLocale();
    const t = locale.chart;

    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(width ?? 400);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
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

    // Others grouping
    const processedData = useMemo(
      () => groupOthers(data, othersThreshold, t.othersLabel),
      [data, othersThreshold, t.othersLabel]
    );

    // Filter hidden items
    const visibleData = useMemo(
      () => processedData.filter(d => !hiddenIds.has(d.id)),
      [processedData, hiddenIds]
    );

    // Compute slices
    const slices = useMemo(
      () =>
        computeSlices(
          visibleData.map(d => d.value),
          startAngle,
          endAngle,
          padAngle,
          sortDescending
        ),
      [visibleData, startAngle, endAngle, padAngle, sortDescending]
    );

    // Geometry
    const chartW = width ?? containerWidth;
    const svgH = height;
    const cx = chartW / 2;
    const cy = svgH / 2;
    const labelMargin = showLabels && labelPos === "outside" ? 20 : 0;
    const outerR = Math.min(chartW, svgH) / 2 - hoverOffset - labelMargin - 4;
    const innerR = outerR * Math.max(0, Math.min(1, innerRadius));

    // Colors resolved per original data index (stable)
    const colorMap = useMemo(() => {
      const map = new Map<string, string>();
      processedData.forEach((item, i) => {
        map.set(item.id, resolveItemColor(item, i, palette));
      });
      return map;
    }, [processedData, palette]);

    // Legend toggle
    const handleLegendToggle = useCallback((id: string) => {
      setHiddenIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }, []);

    // Tooltip — mouse
    const handleSliceEnter = useCallback(
      (e: React.MouseEvent, sliceIdx: number) => {
        setHoveredIndex(sliceIdx);
        setTooltipPos({ x: e.clientX, y: e.clientY });
        setTooltipVisible(true);
      },
      []
    );

    const handleSliceMove = useCallback((e: React.MouseEvent) => {
      setTooltipPos({ x: e.clientX, y: e.clientY });
    }, []);

    const handleSliceLeave = useCallback(() => {
      setHoveredIndex(null);
      setTooltipVisible(false);
    }, []);

    // Tooltip — touch
    const handleSliceTouch = useCallback(
      (e: React.TouchEvent, sliceIdx: number) => {
        const touch = e.touches[0];
        if (!touch) return;
        setHoveredIndex(sliceIdx);
        setTooltipPos({ x: touch.clientX, y: touch.clientY });
        setTooltipVisible(true);
      },
      []
    );

    const handleTouchEnd = useCallback(() => {
      setHoveredIndex(null);
      setTooltipVisible(false);
    }, []);

    // Keyboard navigation
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (slices.length === 0) return;
        const current = focusedIndex ?? -1;
        let next: number | null = null;

        switch (e.key) {
          case "ArrowRight":
          case "ArrowDown":
            e.preventDefault();
            next = (current + 1) % slices.length;
            break;
          case "ArrowLeft":
          case "ArrowUp":
            e.preventDefault();
            next = (current - 1 + slices.length) % slices.length;
            break;
          case "Home":
            e.preventDefault();
            next = 0;
            break;
          case "End":
            e.preventDefault();
            next = slices.length - 1;
            break;
          case "Enter":
          case " ":
            e.preventDefault();
            if (focusedIndex !== null && onSliceClick) {
              const slice = slices[focusedIndex];
              onSliceClick(visibleData[focusedIndex], slice.index);
            }
            return;
          case "Escape":
            setFocusedIndex(null);
            setLiveText("");
            setTooltipVisible(false);
            return;
        }

        if (next !== null) {
          setFocusedIndex(next);
          const item = visibleData[next];
          const slice = slices[next];
          if (item && slice) {
            setLiveText(
              `${item.name}: ${item.value}, ${slice.percentage.toFixed(1)}%`
            );
            // Position tooltip at the midpoint of the focused slice
            const container = containerRef.current;
            if (container) {
              const svgEl = container.querySelector("svg.k-pie-chart");
              if (svgEl) {
                const svgRect = svgEl.getBoundingClientRect();
                const midR = innerR + (outerR - innerR) / 2;
                const tx = midR * Math.cos(slice.midAngle);
                const ty = midR * Math.sin(slice.midAngle);
                setTooltipPos({
                  x: svgRect.left + svgRect.width / 2 + tx,
                  y: svgRect.top + svgRect.height / 2 + ty,
                });
                setTooltipVisible(true);
              }
            }
          }
        }
      },
      [slices, focusedIndex, onSliceClick, visibleData]
    );

    // Active slice (keyboard takes priority)
    const activeIndex = focusedIndex ?? hoveredIndex;
    const activeItem = activeIndex !== null ? visibleData[activeIndex] : null;
    const activeSlice = activeIndex !== null ? slices[activeIndex] : null;

    // Export handlers
    const handleMenuSelect = useCallback(
      (key: string) => {
        const svg = containerRef.current?.querySelector(
          "svg.k-pie-chart"
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
          const total = visibleData.reduce((s, d) => s + d.value, 0);
          const rows = [["Name", "Value", "Percentage"].join(csvSeparator)];
          visibleData.forEach(d => {
            rows.push(
              [
                d.name,
                String(d.value),
                `${((d.value / total) * 100).toFixed(1)}%`,
              ].join(csvSeparator)
            );
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
          const total = visibleData.reduce((s, d) => s + d.value, 0);
          const rows = visibleData.map(d => ({
            name: d.name,
            value: d.value,
            percentage: +((d.value / total) * 100).toFixed(1),
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
      [visibleData, title, subtitle, exportTitle, csvSeparator]
    );

    // Context menu items
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

    // Patterns
    const patterns = useMemo(() => {
      const set: { type: "stripes" | "dots" | "crosshatch"; color: string }[] =
        [];
      visibleData.forEach(item => {
        if (item.fill?.pattern) {
          set.push({
            type: item.fill.pattern,
            color: colorMap.get(item.id) || "",
          });
        }
      });
      return set;
    }, [visibleData, colorMap]);

    // Legend series adapter
    const legendSeries = useMemo(
      () =>
        processedData.map(item => ({
          id: item.id,
          name: item.name,
          data: [],
          color: colorMap.get(item.id),
        })),
      [processedData, colorMap]
    );

    // Tooltip entries
    const tooltipEntries: TooltipEntry[] = useMemo(() => {
      if (activeItem === null || activeSlice === null) return [];
      return [
        {
          series: {
            id: activeItem.id,
            name: activeItem.name,
            data: [{ x: 0, y: activeItem.value }],
          },
          point: { x: 0, y: activeItem.value },
          color: colorMap.get(activeItem.id) || "",
        },
      ];
    }, [activeItem, activeSlice, colorMap]);

    // Label formatter
    const formatLabel = (item: PieDataItem, pct: number): string => {
      if (labelFormat) return labelFormat(item, pct);
      return `${item.name} (${pct.toFixed(1)}%)`;
    };

    // Tooltip render
    const customTooltipRender = tooltipRender
      ? () => {
          if (!activeItem || !activeSlice) return null;
          return tooltipRender(activeItem, activeSlice.percentage);
        }
      : showPercentage
        ? () => {
            if (!activeItem || !activeSlice) return null;
            return (
              <div className="k-chart-tooltip__row">
                <span
                  className="k-chart-tooltip__dot"
                  style={{ backgroundColor: colorMap.get(activeItem.id) }}
                />
                <span className="k-chart-tooltip__name">{activeItem.name}</span>
                <span className="k-chart-tooltip__value">
                  {activeItem.value} ({activeSlice.percentage.toFixed(1)}%)
                </span>
              </div>
            );
          }
        : undefined;

    const total = visibleData.reduce((s, d) => s + d.value, 0);

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
        className={`k-pie-chart-container${className ? ` ${className}` : ""}`}
        style={style}
        tabIndex={0}
        role="figure"
        aria-label={title || "Pie chart"}
        aria-roledescription="pie chart"
        onKeyDown={handleKeyDown}
        onBlur={e => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setFocusedIndex(null);
            setLiveText("");
          }
        }}
      >
        {/* aria-live region for keyboard navigation announcements */}
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
          className="k-pie-chart__body"
          style={
            legendPosition === "left" || legendPosition === "right"
              ? { display: "flex", alignItems: "center" }
              : undefined
          }
        >
          {legendPosition === "left" && legend}

          <div className="k-pie-chart__svg-wrap">
            <svg
              className="k-pie-chart k-chart"
              viewBox={`0 0 ${chartW} ${svgH}`}
              width={width ? chartW : "100%"}
              height={svgH}
              role="list"
              aria-label={title || "Pie chart"}
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

              {slices.map((slice, i) => {
                const item = visibleData[i];
                const color = colorMap.get(item.id) || "";
                const fill = resolveItemFill(item, color);
                const isActive = activeIndex === i;
                const dimmed = activeIndex !== null && !isActive;
                const offset = isActive ? hoverOffset : 0;
                const tx = offset * Math.cos(slice.midAngle);
                const ty = offset * Math.sin(slice.midAngle);
                const d = arcPath(
                  cx,
                  cy,
                  outerR,
                  innerR,
                  slice.startAngle,
                  slice.endAngle,
                  cornerRadius
                );

                return (
                  <g
                    key={item.id}
                    onMouseEnter={e => handleSliceEnter(e, i)}
                    onMouseMove={handleSliceMove}
                    onMouseLeave={handleSliceLeave}
                    onTouchStart={e => handleSliceTouch(e, i)}
                    onTouchEnd={handleTouchEnd}
                    onClick={() => onSliceClick?.(item, slice.index)}
                    role="listitem"
                    aria-label={`${item.name}: ${item.value} (${slice.percentage.toFixed(1)}%)`}
                    tabIndex={-1}
                    style={onSliceClick ? { cursor: "pointer" } : undefined}
                  >
                    <path d={d} fill="transparent" stroke="none" />
                    <path
                      d={d}
                      className={`k-pie-slice${item.className ? ` ${item.className}` : ""}`}
                      style={
                        {
                          ...item.style,
                          transform: `translate(${tx}px, ${ty}px)`,
                          opacity: dimmed ? 0.3 : 1,
                          "--k-pie-i": i,
                        } as React.CSSProperties
                      }
                      fill={fill}
                      fillOpacity={item.fill?.opacity}
                      fillRule="evenodd"
                      stroke="var(--kreati-chart-bg)"
                      strokeWidth={padAngle > 0 ? 0 : 1}
                      pointerEvents="none"
                    />
                    {focusedIndex === i && (
                      <path
                        d={d}
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

              {showLabels &&
                slices.map((slice, i) => {
                  if (slice.percentage < labelThreshold) return null;
                  const item = visibleData[i];
                  const text = formatLabel(item, slice.percentage);

                  if (labelPos === "inside") {
                    const r = innerR + (outerR - innerR) / 2;
                    const pos = labelPosition(cx, cy, r, slice.midAngle);
                    return (
                      <text
                        key={`label-${item.id}`}
                        x={pos.x}
                        y={pos.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="k-pie-label k-pie-label--inside"
                      >
                        {text}
                      </text>
                    );
                  }

                  const anchorR = outerR + 12;
                  const labelR = outerR + 28;
                  const anchor = labelPosition(cx, cy, anchorR, slice.midAngle);
                  const pos = labelPosition(cx, cy, labelR, slice.midAngle);
                  const isRight = Math.cos(slice.midAngle) >= 0;

                  return (
                    <g key={`label-${item.id}`}>
                      <line
                        x1={cx + outerR * Math.cos(slice.midAngle)}
                        y1={cy + outerR * Math.sin(slice.midAngle)}
                        x2={anchor.x}
                        y2={anchor.y}
                        className="k-pie-leader"
                      />
                      <line
                        x1={anchor.x}
                        y1={anchor.y}
                        x2={pos.x}
                        y2={pos.y}
                        className="k-pie-leader"
                      />
                      <text
                        x={pos.x + (isRight ? 4 : -4)}
                        y={pos.y}
                        textAnchor={isRight ? "start" : "end"}
                        dominantBaseline="central"
                        className="k-pie-label k-pie-label--outside"
                      >
                        {text}
                      </text>
                    </g>
                  );
                })}

              {/* Center content for donut */}
              {innerRadius > 0 &&
                (centerLabel || centerTemplate) &&
                (() => {
                  const holeDiameter = innerR * 2 * 0.7;
                  const centerContent = centerTemplate
                    ? centerTemplate(total, visibleData)
                    : centerLabel;
                  return (
                    <foreignObject
                      x={cx - holeDiameter / 2}
                      y={cy - holeDiameter / 2}
                      width={holeDiameter}
                      height={holeDiameter}
                      pointerEvents="none"
                    >
                      <div className="k-donut-center" aria-hidden="true">
                        {centerContent}
                      </div>
                    </foreignObject>
                  );
                })()}
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
          <caption>{title || "Pie chart data"}</caption>
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {visibleData.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.value}</td>
                <td>
                  {total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showTooltip && (
          <ChartTooltip
            entries={tooltipEntries}
            x={tooltipPos.x}
            y={tooltipPos.y}
            visible={tooltipVisible && activeItem !== null}
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

PieChart.displayName = "PieChart";

// ─── DonutChart Component ───────────────────────────────────────────────────

/**
 * DonutChart — radial chart with a hollow center, supporting center content.
 * Built on PieChart with `innerRadius` defaulting to 0.6.
 *
 * @example
 * ```tsx
 * <DonutChart
 *   data={[{ id: "a", name: "Alpha", value: 30 }]}
 *   centerLabel="Total: 30"
 * />
 * ```
 */
export const DonutChart = forwardRef<HTMLDivElement, DonutChartProps>(
  (props, ref) => <PieChart ref={ref} innerRadius={0.6} {...props} />
);

DonutChart.displayName = "DonutChart";
