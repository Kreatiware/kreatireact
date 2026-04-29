import React, {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ChartSeverity } from "../core/types";
import type { TooltipEntry } from "../core/ChartTooltip";
import { ChartTooltip } from "../core/ChartTooltip";
import { resolveSeriesColor } from "../core/colors";
import { exportPng, exportSvg } from "../core/export";
import { ContextMenu } from "../../ContextMenu";
import type { MenuItem } from "../../../types/navigation";
import { useKreatiLocale } from "../../../locale/KreatiProvider";
import "../Chart.css";

// ─── Types ──────────────────────────────────────────────────────────────────

/** A node in the treemap hierarchy. */
export interface TreemapNode {
  /** Unique identifier. */
  id: string;
  /** Display name. */
  name: string;
  /** Numeric value — determines area. Leaf nodes must have a value. */
  value?: number;
  /** Explicit color override. */
  color?: string;
  /** Severity-based color. */
  severity?: ChartSeverity;
  /** Child nodes. */
  children?: TreemapNode[];
  /** Per-node CSS class. */
  className?: string;
  /** Per-node inline style. */
  style?: React.CSSProperties;
}

/** Props for the TreemapChart component. */
export interface TreemapChartProps {
  /** Hierarchical data. */
  data: TreemapNode[];
  /** Show node labels. Default: true */
  showLabels?: boolean;
  /** Label alignment inside cells. Default: "top-left" */
  labelAlign?: "top-left" | "center";
  /** Show values inside nodes. Default: false */
  showValues?: boolean;
  /** Format function for values. */
  valueFormat?: (value: number) => string;
  /** Cell border radius. Default: 2 */
  cellRadius?: number;
  /** Gap between cells in pixels. Default: 2 */
  cellGap?: number;
  /** Chart title. */
  title?: string;
  /** Chart subtitle. */
  subtitle?: string;
  /** Chart width. Fills container when omitted. */
  width?: number;
  /** Chart height. Default: 400 */
  height?: number;
  /** Show tooltip on hover. Default: true */
  showTooltip?: boolean;
  /** Custom tooltip render. */
  tooltipRender?: (node: TreemapNode) => React.ReactNode;
  /** Export formats. */
  exportFormats?: ("png" | "svg" | "csv" | "json")[];
  /** Show menu button. Default: "auto" */
  showMenuButton?: "auto" | boolean;
  /** Custom context menu items. */
  contextMenuItems?: MenuItem[];
  /** Click handler for a node. */
  onNodeClick?: (node: TreemapNode) => void;
  /** Entry animation. Default: true */
  animate?: boolean;
  /** Additional CSS class. */
  className?: string;
  /** Inline styles. */
  style?: React.CSSProperties;
}

const ELLIPSIS_V =
  "M12 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4z";

// ─── Squarified Treemap Algorithm ───────────────────────────────────────────

interface LayoutRect {
  x: number;
  y: number;
  w: number;
  h: number;
  node: TreemapNode;
  value: number;
  colorIdx: number;
}

/** Flatten tree to leaf nodes with computed values. */
const flattenNodes = (
  nodes: TreemapNode[]
): { node: TreemapNode; value: number }[] => {
  const result: { node: TreemapNode; value: number }[] = [];
  const walk = (list: TreemapNode[]) => {
    for (const n of list) {
      if (n.children && n.children.length > 0) {
        walk(n.children);
      } else {
        result.push({ node: n, value: n.value || 0 });
      }
    }
  };
  walk(nodes);
  return result.sort((a, b) => b.value - a.value);
};

/** Squarified treemap layout (Bruls, Huizing, van Wijk). */
const squarify = (
  items: { node: TreemapNode; value: number }[],
  x: number,
  y: number,
  w: number,
  h: number,
  gap: number
): LayoutRect[] => {
  const total = items.reduce((s, i) => s + i.value, 0);
  if (total === 0 || items.length === 0) return [];

  const rects: LayoutRect[] = [];
  let cx = x,
    cy = y,
    cw = w,
    ch = h;
  let remaining = [...items];
  let colorIdx = 0;

  while (remaining.length > 0) {
    const isWide = cw >= ch;
    const side = isWide ? ch : cw;
    const remTotal = remaining.reduce((s, i) => s + i.value, 0);

    // Find the best row
    const row: typeof remaining = [];
    let rowSum = 0;
    let bestWorst = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      row.push(remaining[i]);
      rowSum += remaining[i].value;

      const rowArea = (rowSum / remTotal) * cw * ch;
      const rowSide = rowArea / side;

      let worst = 0;
      for (const r of row) {
        const itemArea = (r.value / rowSum) * rowArea;
        const itemSide = itemArea / rowSide;
        const ratio = Math.max(rowSide / itemSide, itemSide / rowSide);
        if (ratio > worst) worst = ratio;
      }

      if (worst > bestWorst && row.length > 1) {
        row.pop();
        rowSum -= remaining[i].value;
        break;
      }
      bestWorst = worst;
    }

    // Layout the row
    const rowTotal = row.reduce((s, i) => s + i.value, 0);
    const rowFraction = rowTotal / remTotal;
    const rowSize = isWide ? cw * rowFraction : ch * rowFraction;
    let offset = 0;

    for (const item of row) {
      const frac = item.value / rowTotal;
      const itemSize = (isWide ? ch : cw) * frac;

      const rx = isWide ? cx + offset * 0 : cx + offset;
      const ry = isWide ? cy + offset : cy;
      const rw = isWide ? rowSize : itemSize;
      const rh = isWide ? itemSize : rowSize;

      // Correct: place items along the short side
      rects.push({
        x: isWide ? cx : cx + offset,
        y: isWide ? cy + offset : cy,
        w: (isWide ? rowSize : itemSize) - gap,
        h: (isWide ? itemSize : rowSize) - gap,
        node: item.node,
        value: item.value,
        colorIdx: colorIdx++,
      });

      offset += isWide ? itemSize : itemSize;
    }

    // Reduce remaining area
    if (isWide) {
      cx += rowSize;
      cw -= rowSize;
    } else {
      cy += rowSize;
      ch -= rowSize;
    }

    remaining = remaining.slice(row.length);
  }

  return rects;
};

// ─── Contrast helper ────────────────────────────────────────────────────────

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

const textContrast = (color: string): "dark" | "light" => {
  if (color.startsWith("var(")) return "dark";
  const [r, g, b] = parseColor(color);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5 ? "dark" : "light";
};

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * TreemapChart — nested proportional rectangles for hierarchical data.
 *
 * @example
 * ```tsx
 * <TreemapChart
 *   data={[
 *     { id: "a", name: "Category A", value: 100 },
 *     { id: "b", name: "Category B", value: 60 },
 *     { id: "c", name: "Category C", value: 30 },
 *   ]}
 * />
 * ```
 */
export const TreemapChart = forwardRef<HTMLDivElement, TreemapChartProps>(
  (
    {
      data,
      showLabels = true,
      labelAlign = "top-left",
      showValues = false,
      valueFormat,
      cellRadius = 2,
      cellGap = 2,
      title,
      subtitle,
      width,
      height = 400,
      showTooltip = true,
      tooltipRender,
      exportFormats = [],
      showMenuButton = "auto",
      contextMenuItems,
      onNodeClick,
      animate = true,
      className,
      style,
    },
    ref
  ) => {
    const locale = useKreatiLocale();
    const svgRef = useRef<SVGSVGElement>(null);
    const wrapRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(width || 0);
    const [tooltip, setTooltip] = useState<{
      entries: TooltipEntry[];
      x: number;
      y: number;
    } | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [focusedIdx, setFocusedIdx] = useState<number | null>(null);

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

    const chartW = width || containerWidth;
    const titleH = (title ? 24 : 0) + (subtitle ? 18 : 0);
    const plotH = height - titleH;

    // Flatten and layout
    const flat = useMemo(() => flattenNodes(data), [data]);
    const total = useMemo(() => flat.reduce((s, f) => s + f.value, 0), [flat]);

    const rects = useMemo(
      () => squarify(flat, 0, titleH, chartW, plotH, cellGap),
      [flat, chartW, plotH, titleH, cellGap]
    );

    // Colors
    const colorMap = useMemo(
      () =>
        rects.map(r => {
          const n = r.node;
          if (n.color) return n.color;
          if (n.severity)
            return resolveSeriesColor(
              { id: n.id, name: n.name, data: [], severity: n.severity },
              r.colorIdx
            );
          return resolveSeriesColor(
            { id: n.id, name: n.name, data: [] },
            r.colorIdx
          );
        }),
      [rects]
    );

    const formatVal = (v: number) =>
      valueFormat ? valueFormat(v) : v.toLocaleString();

    // Tooltip
    const handleEnter = useCallback(
      (idx: number, e: React.MouseEvent) => {
        if (!showTooltip) return;
        const r = rects[idx];
        setHoveredId(r.node.id);
        const pct = total > 0 ? (r.value / total) * 100 : 0;
        setTooltip({
          x: e.clientX,
          y: e.clientY,
          entries: [
            {
              series: {
                id: r.node.id,
                name: r.node.name,
                data: [{ x: 0, y: r.value }],
              },
              point: {
                x: 0,
                y: r.value,
                label: `${formatVal(r.value)} (${pct.toFixed(1)}%)`,
              },
              color: colorMap[idx],
            },
          ],
        });
      },
      [rects, showTooltip, colorMap, total, valueFormat]
    );

    const handleLeave = useCallback(() => {
      setHoveredId(null);
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
              : fmt === "csv"
                ? locale?.chart?.exportCsv || "Export CSV"
                : locale?.chart?.exportJsonTable || "Export JSON";
        items.push({
          key: fmt,
          label,
          command: () => {
            if (fmt === "csv" || fmt === "json") {
              const rows = rects.map(r => {
                const pct = total > 0 ? (r.value / total) * 100 : 0;
                return {
                  name: r.node.name,
                  value: r.value,
                  percentage: +pct.toFixed(1),
                };
              });
              if (fmt === "json") {
                const blob = new Blob([JSON.stringify(rows, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "treemap.json";
                a.click();
                URL.revokeObjectURL(url);
              } else {
                const header = ["Name", "Value", "Percentage"];
                const csv = [
                  header,
                  ...rows.map(r => [
                    r.name,
                    String(r.value),
                    r.percentage + "%",
                  ]),
                ]
                  .map(r => r.join(";"))
                  .join("\n");
                const blob = new Blob([csv], {
                  type: "text/csv;charset=utf-8",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "treemap.csv";
                a.click();
                URL.revokeObjectURL(url);
              }
              return;
            }
            if (!svgRef.current) return;
            if (fmt === "png") exportPng(svgRef.current);
            else exportSvg(svgRef.current);
          },
        });
      }
      if (contextMenuItems) items.push(...contextMenuItems);
      return items;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [exportFormats, contextMenuItems, locale, rects, total]);

    const showMenu =
      showMenuButton === true ||
      (showMenuButton === "auto" && menuItems.length > 0);

    // Keyboard
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (rects.length === 0) return;
        const fc = focusedIdx ?? 0;
        switch (e.key) {
          case "ArrowRight":
          case "ArrowDown":
            e.preventDefault();
            setFocusedIdx(Math.min(fc + 1, rects.length - 1));
            break;
          case "ArrowLeft":
          case "ArrowUp":
            e.preventDefault();
            setFocusedIdx(Math.max(fc - 1, 0));
            break;
          case "Enter":
          case " ":
            e.preventDefault();
            onNodeClick?.(rects[fc].node);
            break;
          case "Escape":
            setFocusedIdx(null);
            setTooltip(null);
            break;
        }
      },
      [focusedIdx, rects, onNodeClick]
    );

    // Keyboard tooltip sync
    const prevFocusRef = useRef(focusedIdx);
    if (
      prevFocusRef.current !== focusedIdx &&
      focusedIdx !== null &&
      showTooltip
    ) {
      prevFocusRef.current = focusedIdx;
      const r = rects[focusedIdx];
      if (r) {
        const rect = wrapRef.current?.getBoundingClientRect();
        const cx = (rect?.left || 0) + r.x + r.w / 2;
        const cy = (rect?.top || 0) + r.y + r.h / 2;
        const pct = total > 0 ? (r.value / total) * 100 : 0;
        queueMicrotask(() => {
          setTooltip({
            x: cx,
            y: cy,
            entries: [
              {
                series: {
                  id: r.node.id,
                  name: r.node.name,
                  data: [{ x: 0, y: r.value }],
                },
                point: {
                  x: 0,
                  y: r.value,
                  label: `${formatVal(r.value)} (${pct.toFixed(1)}%)`,
                },
                color: colorMap[focusedIdx],
              },
            ],
          });
        });
      }
    } else if (focusedIdx === null) {
      prevFocusRef.current = null;
    }

    // Wait for ResizeObserver to measure
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
          className={`k-chart k-treemap ${className || ""}`}
          style={{ width: width || "100%", minHeight: height, ...style }}
        />
      );
    }

    // Accessible data table
    const srTable = (
      <table className="k-sr-only">
        <caption>{title || "Treemap"}</caption>
        <thead>
          <tr>
            <th>Name</th>
            <th>Value</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          {rects.map(r => {
            const pct = total > 0 ? (r.value / total) * 100 : 0;
            return (
              <tr key={r.node.id}>
                <td>{r.node.name}</td>
                <td>{formatVal(r.value)}</td>
                <td>{pct.toFixed(1)}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );

    const body = (
      <div
        ref={node => {
          if (typeof ref === "function") ref(node);
          else if (ref)
            (ref as React.MutableRefObject<HTMLDivElement | null>).current =
              node;
          resizeRef(node);
          (wrapRef as React.MutableRefObject<HTMLDivElement | null>).current =
            node;
        }}
        className={`k-chart k-treemap ${className || ""}`}
        style={{
          width: width || "100%",
          minHeight: height,
          position: "relative",
          ...style,
        }}
      >
        <svg
          ref={svgRef}
          className="k-chart-svg"
          width={chartW}
          height={height}
          viewBox={`0 0 ${chartW} ${height}`}
          role="figure"
          aria-label={title || "Treemap chart"}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (focusedIdx === null) setFocusedIdx(0);
          }}
          onBlur={e => {
            if (!e.currentTarget.contains(e.relatedTarget as Node))
              setTooltip(null);
          }}
        >
          {/* Title */}
          {title && (
            <text
              x={chartW / 2}
              y={16}
              textAnchor="middle"
              className="k-treemap-title"
            >
              {title}
            </text>
          )}
          {subtitle && (
            <text
              x={chartW / 2}
              y={title ? 34 : 16}
              textAnchor="middle"
              className="k-treemap-subtitle"
            >
              {subtitle}
            </text>
          )}

          {/* Cells */}
          {rects.map((r, i) => {
            const color = colorMap[i];
            const isHovered = hoveredId === r.node.id;
            const isFocused = focusedIdx === i;
            const activeId =
              focusedIdx !== null ? rects[focusedIdx]?.node.id : hoveredId;
            const dimmed = activeId !== null && activeId !== r.node.id;
            const contrast = textContrast(color);
            const minDim = Math.min(r.w, r.h);

            return (
              <g
                key={r.node.id}
                className={`k-treemap-cell ${r.node.className || ""}`}
                style={{
                  ...r.node.style,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ["--k-treemap-i" as any]: i,
                }}
                opacity={dimmed ? 0.4 : 1}
              >
                <rect
                  x={r.x}
                  y={r.y}
                  width={Math.max(0, r.w)}
                  height={Math.max(0, r.h)}
                  rx={cellRadius}
                  fill={color}
                  stroke={
                    isFocused
                      ? "var(--kreati-chart-text)"
                      : isHovered
                        ? "var(--kreati-chart-text)"
                        : "var(--kreati-chart-bg)"
                  }
                  strokeWidth={isFocused ? 2 : isHovered ? 1.5 : 1}
                  onMouseEnter={e => handleEnter(i, e)}
                  onMouseLeave={handleLeave}
                  onClick={() => {
                    setFocusedIdx(i);
                    onNodeClick?.(r.node);
                  }}
                  cursor={onNodeClick ? "pointer" : undefined}
                />
                {showLabels && minDim > 24 && (
                  <foreignObject
                    x={r.x}
                    y={r.y}
                    width={Math.max(0, r.w)}
                    height={Math.max(0, r.h)}
                    pointerEvents="none"
                  >
                    <div
                      className={`k-treemap-label k-treemap-label--${labelAlign} ${contrast === "light" ? "k-treemap-label--light" : ""}`}
                    >
                      <span className="k-treemap-label__name">
                        {r.node.name}
                      </span>
                      {showValues && (
                        <span className="k-treemap-label__value">
                          {formatVal(r.value)}
                        </span>
                      )}
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>

        {srTable}

        {tooltip && showTooltip && (
          <ChartTooltip
            entries={tooltip.entries}
            x={tooltip.x}
            y={tooltip.y}
            visible
          />
        )}

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
  }
);

TreemapChart.displayName = "TreemapChart";
