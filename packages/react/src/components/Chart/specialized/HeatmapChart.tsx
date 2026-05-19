import React, { useCallback, useMemo, useRef, useState } from "react";
import type { TooltipEntry } from "../core/ChartTooltip";
import { ChartTooltip } from "../core/ChartTooltip";
import { Legend } from "../core/Legend";
import { exportPng, exportSvg, exportCsv } from "../core/export";
import { ContextMenu } from "../../ContextMenu";
import type { MenuItem } from "../../../types/navigation";
import { useKreatiLocale } from "../../../locale/KreatiProvider";
import "../Chart.css";

const ELLIPSIS_V =
  "M12 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4z";

// ─── Types ──────────────────────────────────────────────────────────────────

/** A single cell in the heatmap. */
export interface HeatmapCell {
  /** X index (column). */
  x: number;
  /** Y index (row). */
  y: number;
  /** Cell value — mapped to color intensity. */
  value: number;
  /** Per-cell CSS class. */
  className?: string;
  /** Per-cell inline style. */
  style?: React.CSSProperties;
}

/** Color stop for multi-color gradients. */
export interface HeatmapColorStop {
  /** Value threshold (0–1 normalized). */
  at: number;
  /** CSS color string (hex, rgb, hsl). */
  color: string;
}

/** Props for the HeatmapChart component. */
export interface HeatmapChartProps {
  /** Cell data array. */
  data: HeatmapCell[];
  /** Column labels. When omitted, uses numeric indices. */
  xCategories?: string[];
  /** Row labels. When omitted, uses numeric indices. */
  yCategories?: string[];
  /** Minimum value for color scale. Auto-detected when omitted. */
  min?: number;
  /** Maximum value for color scale. Auto-detected when omitted. */
  max?: number;
  /** Two-color gradient endpoints. Default: ["#dbeafe", "#1e40af"] (light blue to dark blue). */
  colorRange?: [string, string];
  /** Multi-stop color scale. Overrides colorRange when provided. */
  colorStops?: HeatmapColorStop[];
  /** Show numeric value inside each cell. Default: false */
  showValues?: boolean;
  /** Format function for cell values. */
  valueFormat?: (value: number) => string;
  /** Cell border radius. Default: 0 */
  cellRadius?: number;
  /** Gap between cells in pixels. Default: 1 */
  cellGap?: number;
  /** Chart title. */
  title?: string;
  /** Chart subtitle. */
  subtitle?: string;
  /** Chart width. Fills container when omitted. */
  width?: number;
  /** Chart height. Default: 400 */
  height?: number;
  /** Show legend gradient bar. Default: true */
  showLegend?: boolean;
  /** Legend position. Default: "right" */
  legendPosition?: "top" | "bottom" | "left" | "right";
  /** Tooltip mode. Default: true */
  showTooltip?: boolean;
  /** Custom tooltip render. */
  tooltipRender?: (
    cell: HeatmapCell,
    xLabel: string,
    yLabel: string
  ) => React.ReactNode;
  /** Export formats available in context menu. */
  exportFormats?: ("png" | "svg" | "csv" | "json")[];
  /** Show menu button. Default: "auto" */
  showMenuButton?: "auto" | boolean;
  /** Custom context menu items. */
  contextMenuItems?: MenuItem[];
  /** Click handler for a cell. */
  onCellClick?: (cell: HeatmapCell, xLabel: string, yLabel: string) => void;
  /** Additional CSS class. */
  className?: string;
  /** Inline styles. */
  style?: React.CSSProperties;
}

// ─── Color interpolation ────────────────────────────────────────────────────

const parseColor = (c: string): [number, number, number] => {
  if (c.startsWith("#")) {
    const hex =
      c.length === 4 ? c[1] + c[1] + c[2] + c[2] + c[3] + c[3] : c.slice(1);
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ];
  }
  const m = c.match(/\d+/g);
  return m ? [+m[0], +m[1], +m[2]] : [0, 0, 0];
};

const lerpColor = (
  a: [number, number, number],
  b: [number, number, number],
  t: number
): string => {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r},${g},${bl})`;
};

const interpolateColor = (
  t: number,
  colorRange: [string, string],
  colorStops?: HeatmapColorStop[]
): string => {
  const clamped = Math.max(0, Math.min(1, t));
  if (colorStops && colorStops.length >= 2) {
    const sorted = [...colorStops].sort((a, b) => a.at - b.at);
    if (clamped <= sorted[0].at) return sorted[0].color;
    if (clamped >= sorted[sorted.length - 1].at)
      return sorted[sorted.length - 1].color;
    for (let i = 0; i < sorted.length - 1; i++) {
      if (clamped >= sorted[i].at && clamped <= sorted[i + 1].at) {
        const local =
          (clamped - sorted[i].at) / (sorted[i + 1].at - sorted[i].at);
        return lerpColor(
          parseColor(sorted[i].color),
          parseColor(sorted[i + 1].color),
          local
        );
      }
    }
  }
  return lerpColor(
    parseColor(colorRange[0]),
    parseColor(colorRange[1]),
    clamped
  );
};

// ─── Contrast helper ────────────────────────────────────────────────────────

/** Returns "dark" or "light" based on perceived luminance for text contrast. */
const textContrast = (color: string): "dark" | "light" => {
  const [r, g, b] = parseColor(color);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.5 ? "dark" : "light";
};

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * HeatmapChart — a color-coded cell grid for visualizing matrix data.
 *
 * @example
 * ```tsx
 * <HeatmapChart
 *   data={[{ x: 0, y: 0, value: 10 }, { x: 1, y: 0, value: 20 }]}
 *   xCategories={["Mon", "Tue"]}
 *   yCategories={["Morning"]}
 * />
 * ```
 */
export const HeatmapChart = ({
  data,
  xCategories,
  yCategories,
  min: minProp,
  max: maxProp,
  colorRange = ["#dbeafe", "#1e40af"],
  colorStops,
  showValues = false,
  valueFormat,
  cellRadius = 0,
  cellGap = 1,
  title,
  subtitle,
  width,
  height = 400,
  showLegend = true,
  legendPosition = "right",
  showTooltip = true,
  tooltipRender,
  exportFormats = [],
  showMenuButton = "auto",
  contextMenuItems,
  onCellClick,
  className,
  style,
  ref,
}: HeatmapChartProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const locale = useKreatiLocale();
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(width || 0);
  const [tooltip, setTooltip] = useState<{
    entries: TooltipEntry[];
    x: number;
    y: number;
  } | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Responsive width
  const resizeRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || width) return;
      const ro = new ResizeObserver(entries => {
        const w = entries[0]?.contentRect.width;
        if (w && w > 0) setContainerWidth(w);
      });
      ro.observe(node);
      return () => ro.disconnect();
    },
    [width]
  );

  // Compute grid dimensions
  const { cols, rows, minVal, maxVal } = useMemo(() => {
    let maxX = 0,
      maxY = 0,
      lo = Infinity,
      hi = -Infinity;
    for (const d of data) {
      if (d.x > maxX) maxX = d.x;
      if (d.y > maxY) maxY = d.y;
      if (d.value < lo) lo = d.value;
      if (d.value > hi) hi = d.value;
    }
    return {
      cols: xCategories?.length || maxX + 1,
      rows: yCategories?.length || maxY + 1,
      minVal: minProp ?? lo,
      maxVal: maxProp ?? hi,
    };
  }, [data, xCategories, yCategories, minProp, maxProp]);

  // Build cell lookup
  const cellMap = useMemo(() => {
    const map = new Map<string, HeatmapCell>();
    for (const d of data) map.set(`${d.x},${d.y}`, d);
    return map;
  }, [data]);

  // Layout
  const chartW = width || containerWidth;
  const labelMarginLeft = yCategories ? 60 : 30;
  const labelMarginBottom = xCategories ? 30 : 20;
  const legendSize = showLegend ? 50 : 0;
  const titleH = (title ? 24 : 0) + (subtitle ? 18 : 0);

  const isHorizontalLegend =
    legendPosition === "top" || legendPosition === "bottom";
  const plotLeft =
    labelMarginLeft + (legendPosition === "left" ? legendSize : 0);
  const plotTop = titleH + (legendPosition === "top" ? legendSize : 0);
  const plotRight = legendPosition === "right" ? legendSize + 16 : 0;
  const plotBottom =
    labelMarginBottom + (legendPosition === "bottom" ? legendSize : 0);

  const plotW = chartW - plotLeft - plotRight;
  const plotH = height - plotTop - plotBottom;
  const cellW = Math.max(1, (plotW - cellGap * (cols - 1)) / cols);
  const cellH = Math.max(1, (plotH - cellGap * (rows - 1)) / rows);

  const getColor = useCallback(
    (value: number) => {
      const range = maxVal - minVal;
      const t = range === 0 ? 0.5 : (value - minVal) / range;
      return interpolateColor(t, colorRange, colorStops);
    },
    [minVal, maxVal, colorRange, colorStops]
  );

  const getLabel = (axis: "x" | "y", idx: number) => {
    if (axis === "x") return xCategories?.[idx] ?? String(idx);
    return yCategories?.[idx] ?? String(idx);
  };

  const formatValue = (v: number) => (valueFormat ? valueFormat(v) : String(v));

  // Tooltip
  const handleCellEnter = useCallback(
    (cell: HeatmapCell, e: React.MouseEvent) => {
      if (!showTooltip) return;
      setHoveredCell({ x: cell.x, y: cell.y });
      setTooltip({
        x: e.clientX,
        y: e.clientY,
        entries: [
          {
            series: {
              id: `${cell.x},${cell.y}`,
              name: `${getLabel("x", cell.x)} / ${getLabel("y", cell.y)}`,
              data: [{ x: cell.x, y: cell.value }],
            },
            point: {
              x: cell.x,
              y: cell.value,
              label: formatValue(cell.value),
            },
            color: getColor(cell.value),
          },
        ],
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showTooltip, getColor, xCategories, yCategories, valueFormat]
  );

  const handleCellLeave = useCallback(() => {
    setHoveredCell(null);
    setTooltip(null);
  }, []);

  // Context menu
  const menuItems = useMemo(() => {
    const items: MenuItem[] = [];
    for (const fmt of exportFormats) {
      const label =
        fmt === "png"
          ? locale?.chart?.exportPng || "Export PNG"
          : fmt === "svg"
            ? locale?.chart?.exportSvg || "Export SVG"
            : fmt === "json"
              ? locale?.chart?.exportJsonTable || "Export JSON"
              : locale?.chart?.exportCsv || "Export CSV";
      items.push({
        key: fmt,
        label,
        command: () => {
          if (!svgRef.current) return;
          if (fmt === "png") exportPng(svgRef.current);
          else if (fmt === "svg") exportSvg(svgRef.current);
          else if (fmt === "csv") {
            const header = [
              "",
              ...(xCategories ||
                Array.from({ length: cols }, (_, i) => String(i))),
            ];
            const csvRows = Array.from({ length: rows }, (_, r) => {
              const rowLabel = getLabel("y", r);
              const vals = Array.from({ length: cols }, (_, c) => {
                const cell = cellMap.get(`${c},${r}`);
                return cell ? formatValue(cell.value) : "";
              });
              return [rowLabel, ...vals];
            });
            const csv = [header, ...csvRows].map(r => r.join(";")).join("\n");
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "heatmap.csv";
            a.click();
            URL.revokeObjectURL(url);
          } else if (fmt === "json") {
            const jsonData = Array.from({ length: rows }, (_, r) =>
              Array.from({ length: cols }, (_, c) => {
                const cell = cellMap.get(`${c},${r}`);
                return {
                  x: getLabel("x", c),
                  y: getLabel("y", r),
                  value: cell ? cell.value : null,
                };
              })
            ).flat();
            const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "heatmap.json";
            a.click();
            URL.revokeObjectURL(url);
          }
        },
      });
    }
    if (contextMenuItems) items.push(...contextMenuItems);
    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    exportFormats,
    contextMenuItems,
    xCategories,
    yCategories,
    cols,
    rows,
    cellMap,
  ]);

  const showMenu =
    showMenuButton === true ||
    (showMenuButton === "auto" && menuItems.length > 0);

  // Keyboard navigation
  const [focusedCell, setFocusedCell] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const fc = focusedCell || { x: 0, y: 0 };
      let nx = fc.x,
        ny = fc.y;
      switch (e.key) {
        case "ArrowRight":
          nx = Math.min(fc.x + 1, cols - 1);
          break;
        case "ArrowLeft":
          nx = Math.max(fc.x - 1, 0);
          break;
        case "ArrowDown":
          ny = Math.min(fc.y + 1, rows - 1);
          break;
        case "ArrowUp":
          ny = Math.max(fc.y - 1, 0);
          break;
        case "Enter":
        case " ": {
          const cell = cellMap.get(`${fc.x},${fc.y}`);
          if (cell)
            onCellClick?.(cell, getLabel("x", fc.x), getLabel("y", fc.y));
          e.preventDefault();
          return;
        }
        case "Escape":
          setFocusedCell(null);
          setTooltip(null);
          return;
        default:
          return;
      }
      e.preventDefault();
      setFocusedCell({ x: nx, y: ny });
      // Update tooltip for keyboard nav
      const cell = cellMap.get(`${nx},${ny}`);
      if (cell && showTooltip) {
        const rect = wrapRef.current?.getBoundingClientRect();
        const cx =
          (rect?.left || 0) + plotLeft + nx * (cellW + cellGap) + cellW / 2;
        const cy =
          (rect?.top || 0) + plotTop + ny * (cellH + cellGap) + cellH / 2;
        setTooltip({
          x: cx,
          y: cy,
          entries: [
            {
              series: {
                id: `${nx},${ny}`,
                name: `${getLabel("x", nx)} / ${getLabel("y", ny)}`,
                data: [{ x: nx, y: cell.value }],
              },
              point: { x: nx, y: cell.value, label: formatValue(cell.value) },
              color: getColor(cell.value),
            },
          ],
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      focusedCell,
      cols,
      rows,
      cellMap,
      onCellClick,
      showTooltip,
      cellW,
      cellH,
      cellGap,
      plotLeft,
      plotTop,
      getColor,
    ]
  );

  // Wait for ResizeObserver
  if (!chartW) {
    return (
      <div
        ref={node => {
          if (typeof ref === "function") ref(node);
          else if (ref)
            (ref as React.MutableRefObject<HTMLDivElement | null>).current =
              node;
          resizeRef(node);
        }}
        className={`k-chart k-heatmap ${className || ""}`}
        style={{ width: width || "100%", minHeight: height, ...style }}
      />
    );
  }

  // Accessible data table
  const srTable = (
    <table className="k-sr-only">
      <caption>{title || "Heatmap"}</caption>
      <thead>
        <tr>
          <th />
          {Array.from({ length: cols }, (_, c) => (
            <th key={c}>{getLabel("x", c)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }, (_, r) => (
          <tr key={r}>
            <th>{getLabel("y", r)}</th>
            {Array.from({ length: cols }, (_, c) => {
              const cell = cellMap.get(`${c},${r}`);
              return <td key={c}>{cell ? formatValue(cell.value) : ""}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );

  // Legend gradient bar
  const legendGradientId = "k-heatmap-legend-grad";
  const renderLegend = () => {
    if (!showLegend) return null;
    const stops: { offset: string; color: string }[] = [];
    if (colorStops && colorStops.length >= 2) {
      const sorted = [...colorStops].sort((a, b) => a.at - b.at);
      for (const s of sorted)
        stops.push({ offset: `${s.at * 100}%`, color: s.color });
    } else {
      stops.push({ offset: "0%", color: colorRange[0] });
      stops.push({ offset: "100%", color: colorRange[1] });
    }

    if (isHorizontalLegend) {
      const barW = Math.min(plotW, 200);
      const lx = plotLeft + (plotW - barW) / 2;
      const ly = legendPosition === "top" ? titleH + 4 : height - 30;
      return (
        <g className="k-heatmap-legend">
          <defs>
            <linearGradient id={legendGradientId}>
              {stops.map((s, i) => (
                <stop key={i} offset={s.offset} stopColor={s.color} />
              ))}
            </linearGradient>
          </defs>
          <rect
            x={lx}
            y={ly}
            width={barW}
            height={12}
            rx={2}
            fill={`url(#${legendGradientId})`}
          />
          <text
            x={lx}
            y={ly + 24}
            className="k-heatmap-legend-label"
            textAnchor="start"
          >
            {formatValue(minVal)}
          </text>
          <text
            x={lx + barW}
            y={ly + 24}
            className="k-heatmap-legend-label"
            textAnchor="end"
          >
            {formatValue(maxVal)}
          </text>
        </g>
      );
    }

    // Vertical legend
    const barH = Math.min(plotH, 200);
    const lx = legendPosition === "left" ? 8 : chartW - legendSize + 8;
    const ly = plotTop + (plotH - barH) / 2;
    return (
      <g className="k-heatmap-legend">
        <defs>
          <linearGradient id={legendGradientId} x1="0" y1="1" x2="0" y2="0">
            {stops.map((s, i) => (
              <stop key={i} offset={s.offset} stopColor={s.color} />
            ))}
          </linearGradient>
        </defs>
        <rect
          x={lx}
          y={ly}
          width={12}
          height={barH}
          rx={2}
          fill={`url(#${legendGradientId})`}
        />
        <text
          x={lx + 18}
          y={ly + barH}
          className="k-heatmap-legend-label"
          dominantBaseline="auto"
        >
          {formatValue(minVal)}
        </text>
        <text
          x={lx + 18}
          y={ly + 4}
          className="k-heatmap-legend-label"
          dominantBaseline="hanging"
        >
          {formatValue(maxVal)}
        </text>
      </g>
    );
  };

  const body = (
    <div
      ref={node => {
        if (typeof ref === "function") ref(node);
        else if (ref)
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        resizeRef(node);
        (wrapRef as React.MutableRefObject<HTMLDivElement | null>).current =
          node;
      }}
      className={`k-chart k-heatmap ${className || ""}`}
      style={{ width: width || "100%", position: "relative", ...style }}
    >
      <svg
        ref={svgRef}
        className="k-chart-svg"
        width={chartW}
        height={height}
        viewBox={`0 0 ${chartW} ${height}`}
        role="figure"
        aria-label={title || "Heatmap chart"}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (!focusedCell) setFocusedCell({ x: 0, y: 0 });
        }}
        onBlur={e => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setTooltip(null);
          }
        }}
      >
        {/* Title */}
        {title && (
          <text
            x={chartW / 2}
            y={16}
            textAnchor="middle"
            className="k-heatmap-title"
          >
            {title}
          </text>
        )}
        {subtitle && (
          <text
            x={chartW / 2}
            y={title ? 34 : 16}
            textAnchor="middle"
            className="k-heatmap-subtitle"
          >
            {subtitle}
          </text>
        )}

        {/* Y axis labels */}
        {Array.from({ length: rows }, (_, r) => (
          <text
            key={`y-${r}`}
            x={plotLeft - 6}
            y={plotTop + r * (cellH + cellGap) + cellH / 2}
            textAnchor="end"
            dominantBaseline="central"
            className="k-heatmap-label"
          >
            {getLabel("y", r)}
          </text>
        ))}

        {/* X axis labels */}
        {Array.from({ length: cols }, (_, c) => (
          <text
            key={`x-${c}`}
            x={plotLeft + c * (cellW + cellGap) + cellW / 2}
            y={plotTop + plotH + 16}
            textAnchor="middle"
            className="k-heatmap-label"
          >
            {getLabel("x", c)}
          </text>
        ))}

        {/* Cells */}
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            const cell = cellMap.get(`${c},${r}`);
            const cx = plotLeft + c * (cellW + cellGap);
            const cy = plotTop + r * (cellH + cellGap);
            const color = cell
              ? getColor(cell.value)
              : "var(--kreati-chart-bg)";
            const isHovered = hoveredCell?.x === c && hoveredCell?.y === r;
            const isFocused = focusedCell?.x === c && focusedCell?.y === r;

            return (
              <g key={`${c},${r}`}>
                <rect
                  x={cx}
                  y={cy}
                  width={cellW}
                  height={cellH}
                  rx={cellRadius}
                  fill={color}
                  className={`k-heatmap-cell ${cell?.className || ""}`}
                  style={cell?.style}
                  opacity={isHovered || isFocused ? 0.85 : 1}
                  stroke={
                    isFocused
                      ? "var(--kreati-chart-text)"
                      : isHovered
                        ? "var(--kreati-chart-text)"
                        : "none"
                  }
                  strokeWidth={isFocused ? 2 : isHovered ? 1 : 0}
                  onMouseEnter={
                    cell ? e => handleCellEnter(cell, e) : undefined
                  }
                  onMouseLeave={handleCellLeave}
                  onClick={
                    cell
                      ? () => {
                          setFocusedCell({ x: c, y: r });
                          onCellClick?.(
                            cell,
                            getLabel("x", c),
                            getLabel("y", r)
                          );
                        }
                      : undefined
                  }
                  cursor={onCellClick && cell ? "pointer" : undefined}
                />
                {showValues && cell && (
                  <text
                    x={cx + cellW / 2}
                    y={cy + cellH / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className={`k-heatmap-value ${Math.min(cellW, cellH) <= 30 ? "k-heatmap-value--sm" : ""}`}
                    fill={
                      textContrast(color) === "light"
                        ? "var(--kreati-white)"
                        : "var(--kreati-gray-900)"
                    }
                  >
                    {formatValue(cell.value)}
                  </text>
                )}
              </g>
            );
          })
        )}

        {/* Legend */}
        {renderLegend()}
      </svg>

      {/* Accessible data table */}
      {srTable}

      {/* Tooltip */}
      {tooltip && showTooltip && (
        <ChartTooltip
          entries={tooltip.entries}
          x={tooltip.x}
          y={tooltip.y}
          visible
        />
      )}

      {/* Menu button */}
      {showMenu && (
        <button
          type="button"
          className="k-chart-menu-btn"
          aria-label={locale?.chart?.menuLabel || "Chart menu"}
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
            aria-hidden="true"
          >
            <path d={ELLIPSIS_V} />
          </svg>
        </button>
      )}
    </div>
  );

  if (menuItems.length > 0) {
    return (
      <ContextMenu items={menuItems} trigger="contextmenu">
        {body}
      </ContextMenu>
    );
  }

  return body;
};
