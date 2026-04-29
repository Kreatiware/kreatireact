import React, {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { arcPath } from "../core/arc";
import { gridPath } from "../core/radar";
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

/** A single data item for the PolarAreaChart. */
export interface PolarDataItem {
  /** Unique identifier. */
  id: string;
  /** Category name. */
  name: string;
  /** Numeric value — determines the radius of the sector. */
  value: number;
  /** Explicit color override. */
  color?: string;
  /** Severity-based color. */
  severity?: ChartSeverity;
  /** Fill pattern. */
  fill?: ChartFill;
  /** Per-item CSS class. */
  className?: string;
  /** Per-item inline style. */
  style?: React.CSSProperties;
}

/** Props for the PolarAreaChart component. */
export interface PolarAreaChartProps {
  /** Data items. Each gets an equal-angle sector with radius proportional to value. */
  data: PolarDataItem[];
  /** Chart width. When omitted, fills container. */
  width?: number;
  /** Chart height. Default: 400 */
  height?: number;
  /** Minimum scale value. Default: 0 */
  min?: number;
  /** Maximum scale value. When omitted, auto-detected. */
  max?: number;
  /** Start angle in degrees. Default: -90 (top) */
  startAngle?: number;
  /** Number of concentric grid levels. Default: 4 */
  gridLevels?: number;
  /** Grid shape. Default: "circle" */
  gridShape?: "polygon" | "circle";
  /** Show grid level value labels. Default: true */
  showGridLabels?: boolean;
  /** Gap between sectors in degrees. Default: 1 */
  padAngle?: number;
  /** Show category labels. Default: true */
  showLabels?: boolean;
  /** Radial offset on hover. Default: 6 */
  hoverOffset?: number;
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
  /** Custom tooltip render. */
  tooltipRender?: (item: PolarDataItem, percentage: number) => React.ReactNode;
  /** Callback when a sector is clicked. */
  onSliceClick?: (item: PolarDataItem, index: number) => void;
  /** Export formats. Default: [] */
  exportFormats?: ("png" | "svg" | "csv")[];
  /** Include title in exports. Default: true */
  exportTitle?: boolean;
  /** CSV separator. Default: ";" */
  csvSeparator?: string;
  /** Show menu button. Default: "auto" */
  showMenuButton?: boolean | "auto";
  /** Additional context menu items. */
  contextMenuItems?: MenuItem[];
  /** Custom palette. */
  palette?: string[];
  /** Additional CSS class. */
  className?: string;
  /** Inline styles. */
  style?: React.CSSProperties;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const ELLIPSIS_V =
  "M12 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4z";

const DEG_TO_RAD = Math.PI / 180;

const resolveItemColor = (
  item: PolarDataItem,
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

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * PolarAreaChart — equal-angle sectors with radius proportional to value.
 * Also known as Coxcomb Chart or Nightingale Rose Chart.
 *
 * @example
 * ```tsx
 * <PolarAreaChart data={[
 *   { id: "a", name: "Alpha", value: 80 },
 *   { id: "b", name: "Beta", value: 45 },
 * ]} />
 * ```
 */
export const PolarAreaChart = forwardRef<HTMLDivElement, PolarAreaChartProps>(
  (
    {
      data,
      width,
      height = 400,
      min = 0,
      max: maxProp,
      startAngle = -90,
      gridLevels = 4,
      gridShape = "circle",
      showGridLabels = true,
      padAngle = 1,
      showLabels = true,
      hoverOffset = 6,
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

    // Responsive
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

    const visibleData = useMemo(
      () => data.filter(d => !hiddenIds.has(d.id)),
      [data, hiddenIds]
    );

    // Auto max
    const max = useMemo(() => {
      if (maxProp !== undefined) return maxProp;
      let m = 0;
      for (const d of visibleData) if (d.value > m) m = d.value;
      return m || 100;
    }, [maxProp, visibleData]);

    // Geometry
    const chartW = width ?? containerWidth;
    const svgH = height;
    const cx = chartW / 2;
    const cy = svgH / 2;
    const maxLabelLen = showLabels
      ? Math.max(...data.map(d => d.name.length), 0)
      : 0;
    const labelMargin = showLabels ? Math.max(24, maxLabelLen * 6 + 16) : 4;
    const outerR = Math.min(chartW, svgH) / 2 - labelMargin;

    // Equal angles
    const sliceAngle = visibleData.length > 0 ? 360 / visibleData.length : 360;
    const pad = visibleData.length > 1 ? padAngle : 0;

    // Colors (stable per original index)
    const colorMap = useMemo(() => {
      const map = new Map<string, string>();
      data.forEach((item, i) =>
        map.set(item.id, resolveItemColor(item, i, palette))
      );
      return map;
    }, [data, palette]);

    // Grid angles for polygon grid
    const gridAngles = useMemo(() => {
      const n = visibleData.length || 6;
      return Array.from(
        { length: n },
        (_, i) => (startAngle + i * (360 / n)) * DEG_TO_RAD
      );
    }, [visibleData.length, startAngle]);

    // Total for percentages
    const total = visibleData.reduce((s, d) => s + Math.max(0, d.value), 0);

    // Legend
    const handleLegendToggle = useCallback((id: string) => {
      setHiddenIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }, []);

    // Mouse
    const handleSliceEnter = useCallback((e: React.MouseEvent, i: number) => {
      setHoveredIndex(i);
      setTooltipPos({ x: e.clientX, y: e.clientY });
      setTooltipVisible(true);
    }, []);
    const handleSliceMove = useCallback((e: React.MouseEvent) => {
      setTooltipPos({ x: e.clientX, y: e.clientY });
    }, []);
    const handleSliceLeave = useCallback(() => {
      setHoveredIndex(null);
      setTooltipVisible(false);
    }, []);

    // Touch
    const handleSliceTouch = useCallback((e: React.TouchEvent, i: number) => {
      const touch = e.touches[0];
      if (!touch) return;
      setHoveredIndex(i);
      setTooltipPos({ x: touch.clientX, y: touch.clientY });
      setTooltipVisible(true);
    }, []);
    const handleTouchEnd = useCallback(() => {
      setHoveredIndex(null);
      setTooltipVisible(false);
    }, []);

    // Keyboard
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (visibleData.length === 0) return;
        const current = focusedIndex ?? -1;
        let next: number | null = null;

        switch (e.key) {
          case "ArrowRight":
          case "ArrowDown":
            e.preventDefault();
            next = (current + 1) % visibleData.length;
            break;
          case "ArrowLeft":
          case "ArrowUp":
            e.preventDefault();
            next = (current - 1 + visibleData.length) % visibleData.length;
            break;
          case "Home":
            e.preventDefault();
            next = 0;
            break;
          case "End":
            e.preventDefault();
            next = visibleData.length - 1;
            break;
          case "Enter":
          case " ":
            e.preventDefault();
            if (focusedIndex !== null && onSliceClick)
              onSliceClick(visibleData[focusedIndex], focusedIndex);
            return;
          case "Escape":
            setFocusedIndex(null);
            setTooltipVisible(false);
            setLiveText("");
            return;
        }

        if (next !== null) {
          setFocusedIndex(next);
          const item = visibleData[next];
          const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0";
          setLiveText(`${item.name}: ${item.value} (${pct}%)`);
          // Position tooltip at sector midpoint
          const midAngleDeg = startAngle + next * sliceAngle + sliceAngle / 2;
          const midAngle = midAngleDeg * DEG_TO_RAD;
          const r =
            outerR *
            Math.max(0, Math.min(1, (item.value - min) / (max - min))) *
            0.6;
          const svgEl =
            containerRef.current?.querySelector("svg.k-polar-chart");
          if (svgEl) {
            const rect = svgEl.getBoundingClientRect();
            setTooltipPos({
              x: rect.left + rect.width / 2 + r * Math.cos(midAngle),
              y: rect.top + rect.height / 2 + r * Math.sin(midAngle),
            });
            setTooltipVisible(true);
          }
        }
      },
      [
        visibleData,
        focusedIndex,
        onSliceClick,
        startAngle,
        sliceAngle,
        outerR,
        min,
        max,
        total,
      ]
    );

    const activeIndex = focusedIndex ?? hoveredIndex;
    const activeItem = activeIndex !== null ? visibleData[activeIndex] : null;

    // Export
    const handleMenuSelect = useCallback(
      (key: string) => {
        const svg = containerRef.current?.querySelector(
          "svg.k-polar-chart"
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
          const rows = [["Name", "Value", "Percentage"].join(csvSeparator)];
          visibleData.forEach(d => {
            rows.push(
              [
                d.name,
                String(d.value),
                `${total > 0 ? ((d.value / total) * 100).toFixed(1) : 0}%`,
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
      },
      [visibleData, title, subtitle, exportTitle, csvSeparator, total]
    );

    const menuItems: MenuItem[] = useMemo(() => {
      const items: MenuItem[] = [];
      if (exportFormats.includes("png"))
        items.push({ key: "export-png", label: t.exportPng });
      if (exportFormats.includes("svg"))
        items.push({ key: "export-svg", label: t.exportSvg });
      if (exportFormats.includes("csv"))
        items.push({ key: "export-csv", label: t.exportCsv });
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
        if (item.fill?.pattern)
          set.push({
            type: item.fill.pattern,
            color: colorMap.get(item.id) || "",
          });
      });
      return set;
    }, [visibleData, colorMap]);

    // Legend adapter
    const legendSeries = useMemo(
      () =>
        data.map(item => ({
          id: item.id,
          name: item.name,
          data: [],
          color: colorMap.get(item.id),
        })),
      [data, colorMap]
    );

    // Tooltip
    const activePct =
      activeItem && total > 0 ? (activeItem.value / total) * 100 : 0;
    const tooltipEntries: TooltipEntry[] = useMemo(() => {
      if (!activeItem) return [];
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
    }, [activeItem, colorMap]);

    const customTooltipRender = tooltipRender
      ? () => (activeItem ? tooltipRender(activeItem, activePct) : null)
      : () =>
          activeItem ? (
            <div className="k-chart-tooltip__row">
              <span
                className="k-chart-tooltip__dot"
                style={{ backgroundColor: colorMap.get(activeItem.id) }}
              />
              <span className="k-chart-tooltip__name">{activeItem.name}</span>
              <span className="k-chart-tooltip__value">
                {activeItem.value} ({activePct.toFixed(1)}%)
              </span>
            </div>
          ) : null;

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
        className={`k-polar-chart-container${className ? ` ${className}` : ""}`}
        style={style}
        tabIndex={0}
        role="figure"
        aria-label={title || "Polar area chart"}
        aria-roledescription="polar area chart"
        onKeyDown={handleKeyDown}
        onBlur={e => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setFocusedIndex(null);
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
          className="k-polar-chart__body"
          style={
            legendPosition === "left" || legendPosition === "right"
              ? { display: "flex", alignItems: "center" }
              : undefined
          }
        >
          {legendPosition === "left" && legend}

          <div className="k-polar-chart__svg-wrap">
            <svg
              className="k-polar-chart k-chart"
              viewBox={`0 0 ${chartW} ${svgH}`}
              width={width ? chartW : "100%"}
              height={svgH}
              role="list"
              aria-label={title || "Polar area chart"}
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
                const r = outerR * level;
                return (
                  <path
                    key={`grid-${i}`}
                    d={gridPath(cx, cy, r, gridAngles, gridShape)}
                    className="k-radar-grid"
                    fill="none"
                  />
                );
              })}

              {/* Grid labels */}
              {showGridLabels &&
                Array.from({ length: gridLevels }, (_, i) => {
                  const level = (i + 1) / gridLevels;
                  const val = min + (max - min) * level;
                  return (
                    <text
                      key={`gl-${i}`}
                      x={cx + 4}
                      y={cy - outerR * level - 2}
                      className="k-radar-grid-label"
                    >
                      {Number.isInteger(val) ? val : val.toFixed(1)}
                    </text>
                  );
                })}

              {/* Sectors */}
              {visibleData.map((item, i) => {
                const color = colorMap.get(item.id) || "";
                const fillColor = item.fill?.pattern
                  ? patternFill(item.fill.pattern, color)
                  : item.fill?.color || color;
                const ratio =
                  max === min
                    ? 0
                    : Math.max(
                        0,
                        Math.min(1, (item.value - min) / (max - min))
                      );
                const r = outerR * ratio;

                const sa = (startAngle + i * sliceAngle + pad / 2) * DEG_TO_RAD;
                const ea =
                  (startAngle + (i + 1) * sliceAngle - pad / 2) * DEG_TO_RAD;
                const d = arcPath(cx, cy, r, 0, sa, ea);

                const isActive = activeIndex === i;
                const dimmed = activeIndex !== null && !isActive;
                const midAngle = (sa + ea) / 2;
                const offset = isActive ? hoverOffset : 0;
                const tx = offset * Math.cos(midAngle);
                const ty = offset * Math.sin(midAngle);

                return (
                  <g
                    key={item.id}
                    onMouseEnter={e => handleSliceEnter(e, i)}
                    onMouseMove={handleSliceMove}
                    onMouseLeave={handleSliceLeave}
                    onTouchStart={e => handleSliceTouch(e, i)}
                    onTouchEnd={handleTouchEnd}
                    onClick={() => onSliceClick?.(item, i)}
                    role="listitem"
                    aria-label={`${item.name}: ${item.value}${total > 0 ? ` (${((item.value / total) * 100).toFixed(1)}%)` : ""}`}
                    tabIndex={-1}
                    style={onSliceClick ? { cursor: "pointer" } : undefined}
                  >
                    <path
                      d={arcPath(cx, cy, outerR, 0, sa, ea)}
                      fill="transparent"
                      stroke="none"
                    />
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
                      fill={fillColor}
                      fillOpacity={item.fill?.opacity ?? 0.75}
                      stroke={color}
                      strokeWidth={1}
                      pointerEvents="none"
                    />
                    {focusedIndex === i && (
                      <path
                        d={arcPath(cx, cy, r, 0, sa, ea)}
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

              {/* Category labels */}
              {showLabels &&
                visibleData.map((item, i) => {
                  const midAngleDeg =
                    startAngle + i * sliceAngle + sliceAngle / 2;
                  const midAngle = midAngleDeg * DEG_TO_RAD;
                  const labelR = outerR + 14;
                  const x = cx + labelR * Math.cos(midAngle);
                  const y = cy + labelR * Math.sin(midAngle);
                  const isRight = Math.cos(midAngle) > 0.01;
                  const isLeft = Math.cos(midAngle) < -0.01;
                  const anchor = isRight ? "start" : isLeft ? "end" : "middle";
                  const dy =
                    Math.sin(midAngle) > 0.5
                      ? "0.8em"
                      : Math.sin(midAngle) < -0.5
                        ? "-0.2em"
                        : "0.35em";

                  return (
                    <text
                      key={`label-${item.id}`}
                      x={x}
                      y={y}
                      textAnchor={anchor}
                      dy={dy}
                      className="k-radar-label"
                    >
                      {item.name}
                    </text>
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

        <table className="k-sr-only">
          <caption>{title || "Polar area chart data"}</caption>
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

PolarAreaChart.displayName = "PolarAreaChart";
