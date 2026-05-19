import React, { useCallback, useMemo, useRef, useState } from "react";
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

const ELLIPSIS_V =
  "M12 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4z";

// ─── Types ──────────────────────────────────────────────────────────────────

/** A single stage in the funnel. */
export interface FunnelStage {
  /** Unique identifier. */
  id: string;
  /** Stage name. */
  name: string;
  /** Numeric value — determines the width of the trapezoid. */
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

/** Props for the FunnelChart component. */
export interface FunnelChartProps {
  /** Funnel stages, ordered from top to bottom. */
  data: FunnelStage[];
  /** Direction: "down" narrows toward bottom (funnel), "up" narrows toward top (pyramid). Default: "down" */
  direction?: "down" | "up";
  /** Label position. Default: "inside" */
  labelPosition?: "inside" | "left" | "right";
  /** Show percentage next to value. Default: true */
  showPercentage?: boolean;
  /** Format function for values. */
  valueFormat?: (value: number, percentage: number) => string;
  /** Gap between stages in pixels. Default: 2 */
  stageGap?: number;
  /** Minimum width ratio for the narrowest stage (0–1). Default: 0.15 */
  neckRatio?: number;
  /** Make the last stage (bottom in funnel, top in pyramid) flat instead of tapered. Default: false */
  flatEnd?: boolean;
  /** Chart title. */
  title?: string;
  /** Chart subtitle. */
  subtitle?: string;
  /** Chart width. Fills container when omitted. */
  width?: number;
  /** Chart height. Default: 400 */
  height?: number;
  /** Show legend. Default: true */
  showLegend?: boolean;
  /** Legend position. Default: "bottom" */
  legendPosition?: "top" | "bottom" | "left" | "right";
  /** Show tooltip on hover. Default: true */
  showTooltip?: boolean;
  /** Custom tooltip render. */
  tooltipRender?: (stage: FunnelStage, percentage: number) => React.ReactNode;
  /** Export formats. */
  exportFormats?: ("png" | "svg" | "csv" | "json")[];
  /** Show menu button. Default: "auto" */
  showMenuButton?: "auto" | boolean;
  /** Custom context menu items. */
  contextMenuItems?: MenuItem[];
  /** Click handler for a stage. */
  onStageClick?: (stage: FunnelStage, index: number) => void;
  /** Entry animation. Default: true */
  animate?: boolean;
  /** Additional CSS class. */
  className?: string;
  /** Inline styles. */
  style?: React.CSSProperties;
}

// ─── Geometry ───────────────────────────────────────────────────────────────

interface TrapezoidPoints {
  topLeft: number;
  topRight: number;
  bottomLeft: number;
  bottomRight: number;
  y: number;
  h: number;
}

const trapezoidPath = (t: TrapezoidPoints): string =>
  `M${t.topLeft},${t.y} L${t.topRight},${t.y} L${t.bottomRight},${t.y + t.h} L${t.bottomLeft},${t.y + t.h} Z`;

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * FunnelChart — stacked trapezoids representing stages in a process.
 * Use `direction="up"` for a pyramid chart.
 *
 * @example
 * ```tsx
 * <FunnelChart
 *   data={[
 *     { id: "visits", name: "Visits", value: 5000 },
 *     { id: "leads", name: "Leads", value: 2500 },
 *     { id: "sales", name: "Sales", value: 500 },
 *   ]}
 * />
 * ```
 */
export const FunnelChart = ({
  data,
  direction = "down",
  labelPosition = "inside",
  showPercentage = true,
  valueFormat,
  stageGap = 2,
  neckRatio = 0.15,
  flatEnd = false,
  title,
  subtitle,
  width,
  height = 400,
  showLegend = true,
  legendPosition = "bottom",
  showTooltip = true,
  tooltipRender,
  exportFormats = [],
  showMenuButton = "auto",
  contextMenuItems,
  onStageClick,
  animate = true,
  className,
  style,
  ref,
}: FunnelChartProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const locale = useKreatiLocale();
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(width || 0);
  const [tooltip, setTooltip] = useState<{
    entries: TooltipEntry[];
    x: number;
    y: number;
  } | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

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

  const labelW = labelPosition === "inside" ? 0 : 120;
  const chartW = width || containerWidth;
  const titleH = (title ? 24 : 0) + (subtitle ? 18 : 0);

  const plotLeft = labelPosition === "left" ? labelW : 0;
  const plotRight = labelPosition === "right" ? labelW : 0;
  const plotTop = titleH;
  const plotBottom = 0;
  const plotW = chartW - plotLeft - plotRight;
  const plotH = height - plotTop - plotBottom;

  const maxVal = useMemo(() => Math.max(...data.map(d => d.value), 1), [data]);
  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);

  // Compute trapezoids
  const stages = useMemo(() => {
    const n = data.length;
    const totalGap = stageGap * (n - 1);
    const stageH = (plotH - totalGap) / n;
    const cx = plotLeft + plotW / 2;

    return data.map((d, i) => {
      // For "down": i=0 is widest (ratio=1), last is narrowest (ratio=neckRatio)
      // For "up": i=0 is narrowest (ratio=neckRatio), last is widest (ratio=1)
      const t = n === 1 ? 0 : i / (n - 1);
      const tNext = n === 1 ? 0 : (i + 1) / n;

      const ratioAt = (pos: number) =>
        direction === "down"
          ? 1 - (1 - neckRatio) * pos
          : neckRatio + (1 - neckRatio) * pos;

      const topW = ratioAt(n === 1 ? 0 : i / n) * plotW;
      let bottomW = ratioAt(n === 1 ? 1 : (i + 1) / n) * plotW;

      // flatEnd: last stage in funnel (or first in pyramid) gets same bottom as top
      if (flatEnd) {
        const isEnd = direction === "down" ? i === n - 1 : i === n - 1;
        if (isEnd) bottomW = topW;
      }
      const y = plotTop + i * (stageH + stageGap);

      return {
        data: d,
        index: i,
        trap: {
          topLeft: cx - topW / 2,
          topRight: cx + topW / 2,
          bottomLeft: cx - bottomW / 2,
          bottomRight: cx + bottomW / 2,
          y,
          h: stageH,
        } as TrapezoidPoints,
        percentage: total > 0 ? (d.value / total) * 100 : 0,
      };
    });
  }, [
    data,
    direction,
    neckRatio,
    flatEnd,
    stageGap,
    plotW,
    plotH,
    plotLeft,
    plotTop,
    total,
  ]);

  // Colors
  const colorMap = useMemo(
    () =>
      data.map(
        (d, i) =>
          d.color ||
          (d.severity
            ? resolveSeriesColor(
                { id: d.id, name: d.name, data: [], severity: d.severity },
                i
              )
            : resolveSeriesColor({ id: d.id, name: d.name, data: [] }, i))
      ),
    [data]
  );

  const formatVal = (value: number, pct: number) => {
    if (valueFormat) return valueFormat(value, pct);
    return showPercentage
      ? `${value.toLocaleString()} (${pct.toFixed(1)}%)`
      : value.toLocaleString();
  };

  // Tooltip
  const handleStageEnter = useCallback(
    (idx: number, e: React.MouseEvent) => {
      if (!showTooltip) return;
      setHoveredIdx(idx);
      const d = data[idx];
      const pct = total > 0 ? (d.value / total) * 100 : 0;
      setTooltip({
        x: e.clientX,
        y: e.clientY,
        entries: [
          {
            series: {
              id: d.id,
              name: d.name,
              data: [{ x: idx, y: d.value }],
            },
            point: { x: idx, y: d.value, label: formatVal(d.value, pct) },
            color: colorMap[idx],
          },
        ],
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, showTooltip, colorMap, total, valueFormat, showPercentage]
  );

  const handleStageLeave = useCallback(() => {
    setHoveredIdx(null);
    setTooltip(null);
  }, []);

  // Legend
  const legendSeries = useMemo(
    () =>
      data.map((d, i) => ({
        id: d.id,
        name: d.name,
        data: [],
        color: colorMap[i],
        severity: d.severity,
      })),
    [data, colorMap]
  );

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
          if (fmt === "csv") {
            const header = ["Stage", "Value", "Percentage"];
            const csvRows = data.map(d => {
              const pct = total > 0 ? (d.value / total) * 100 : 0;
              return [d.name, String(d.value), pct.toFixed(1) + "%"];
            });
            const csv = [header, ...csvRows].map(r => r.join(";")).join("\n");
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "funnel.csv";
            a.click();
            URL.revokeObjectURL(url);
            return;
          }
          if (fmt === "json") {
            const rows = data.map(d => ({
              name: d.name,
              value: d.value,
              percentage: +(total > 0
                ? ((d.value / total) * 100).toFixed(1)
                : 0),
            }));
            const blob = new Blob([JSON.stringify(rows, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "funnel.json";
            a.click();
            URL.revokeObjectURL(url);
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
  }, [exportFormats, contextMenuItems, locale, data, total]);

  const showMenu =
    showMenuButton === true ||
    (showMenuButton === "auto" && menuItems.length > 0);

  // Keyboard
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const fc = focusedIdx ?? 0;
      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
          e.preventDefault();
          setFocusedIdx(Math.min(fc + 1, data.length - 1));
          break;
        case "ArrowUp":
        case "ArrowLeft":
          e.preventDefault();
          setFocusedIdx(Math.max(fc - 1, 0));
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          onStageClick?.(data[fc], fc);
          break;
        case "Escape":
          setFocusedIdx(null);
          setTooltip(null);
          break;
      }
    },
    [focusedIdx, data, onStageClick]
  );

  // Update tooltip on keyboard nav
  const prevFocusRef = useRef(focusedIdx);
  if (
    prevFocusRef.current !== focusedIdx &&
    focusedIdx !== null &&
    showTooltip
  ) {
    prevFocusRef.current = focusedIdx;
    const s = stages[focusedIdx];
    if (s) {
      const rect = wrapRef.current?.getBoundingClientRect();
      const cx = (rect?.left || 0) + (s.trap.topLeft + s.trap.topRight) / 2;
      const cy = (rect?.top || 0) + s.trap.y + s.trap.h / 2;
      queueMicrotask(() => {
        setTooltip({
          x: cx,
          y: cy,
          entries: [
            {
              series: {
                id: s.data.id,
                name: s.data.name,
                data: [{ x: s.index, y: s.data.value }],
              },
              point: {
                x: s.index,
                y: s.data.value,
                label: formatVal(s.data.value, s.percentage),
              },
              color: colorMap[s.index],
            },
          ],
        });
      });
    }
  } else if (focusedIdx === null) {
    prevFocusRef.current = null;
  }

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
        className={`k-chart k-funnel ${className || ""}`}
        style={{ width: width || "100%", minHeight: height, ...style }}
      />
    );
  }

  // Accessible data table
  const srTable = (
    <table className="k-sr-only">
      <caption>{title || "Funnel chart"}</caption>
      <thead>
        <tr>
          <th>Stage</th>
          <th>Value</th>
          <th>Percentage</th>
        </tr>
      </thead>
      <tbody>
        {stages.map(s => (
          <tr key={s.data.id}>
            <td>{s.data.name}</td>
            <td>{s.data.value}</td>
            <td>{s.percentage.toFixed(1)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  // Patterns
  const patterns = data.map((d, i) => {
    if (!d.fill?.pattern) return null;
    const patColor = d.color || d.fill.color || colorMap[i] || "#666";
    return (
      <ChartPattern
        key={`pat-${d.id}`}
        type={d.fill.pattern}
        color={patColor}
      />
    );
  });

  const getPatternFillUrl = (d: FunnelStage, i: number) => {
    if (!d.fill?.pattern) return colorMap[i];
    const patColor = d.color || d.fill.color || colorMap[i] || "#666";
    return patternFill(d.fill.pattern, patColor);
  };

  const isLegendSide = legendPosition === "left" || legendPosition === "right";

  const legendEl = showLegend ? (
    <Legend
      series={legendSeries}
      hiddenIds={hiddenIds}
      position={legendPosition}
      onToggle={id =>
        setHiddenIds(prev => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        })
      }
    />
  ) : null;

  const svgEl = (
    <svg
      ref={svgRef}
      className="k-chart-svg"
      width={isLegendSide ? "100%" : chartW}
      height={height}
      viewBox={`0 0 ${chartW} ${height}`}
      style={isLegendSide ? { flex: 1, minWidth: 0 } : undefined}
      role="figure"
      aria-label={title || "Funnel chart"}
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
      <defs>{patterns}</defs>

      {/* Title */}
      {title && (
        <text
          x={plotLeft + plotW / 2}
          y={16}
          textAnchor="middle"
          className="k-funnel-title"
        >
          {title}
        </text>
      )}
      {subtitle && (
        <text
          x={plotLeft + plotW / 2}
          y={title ? 34 : 16}
          textAnchor="middle"
          className="k-funnel-subtitle"
        >
          {subtitle}
        </text>
      )}

      {/* Stages */}
      {stages.map((s, i) => {
        const color = colorMap[i];
        const fillVal = getPatternFillUrl(s.data, i);
        const isHovered = hoveredIdx === i;
        const isFocused = focusedIdx === i;
        const activeIdx = focusedIdx !== null ? focusedIdx : hoveredIdx;
        const dimmed = activeIdx !== null && activeIdx !== i;
        const hidden = hiddenIds.has(s.data.id);

        return (
          <g
            key={s.data.id}
            className={`k-funnel-stage ${s.data.className || ""}`}
            style={{
              ...s.data.style,
              animationDelay: animate
                ? `calc(var(--k-funnel-i, ${i}) * 80ms)`
                : undefined,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ["--k-funnel-i" as any]: i,
            }}
            opacity={hidden ? 0.15 : dimmed ? 0.4 : 1}
          >
            <path
              d={trapezoidPath(s.trap)}
              fill={fillVal}
              fillOpacity={s.data.fill?.opacity}
              stroke={
                isFocused
                  ? "var(--kreati-chart-text)"
                  : isHovered
                    ? "var(--kreati-chart-text)"
                    : "none"
              }
              strokeWidth={isFocused ? 2 : isHovered ? 1 : 0}
              onMouseEnter={e => handleStageEnter(i, e)}
              onMouseLeave={handleStageLeave}
              onClick={() => {
                setFocusedIdx(i);
                onStageClick?.(s.data, i);
              }}
              cursor={onStageClick ? "pointer" : undefined}
            />
            {/* Inside label */}
            {labelPosition === "inside" && (
              <foreignObject
                x={Math.max(s.trap.topLeft, s.trap.bottomLeft)}
                y={s.trap.y}
                width={Math.min(
                  s.trap.topRight - s.trap.topLeft,
                  s.trap.bottomRight - s.trap.bottomLeft
                )}
                height={s.trap.h}
                pointerEvents="none"
              >
                <div
                  className="k-funnel-label"
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    padding: "0 4px",
                    overflow: "hidden",
                  }}
                >
                  {s.data.name}: {formatVal(s.data.value, s.percentage)}
                </div>
              </foreignObject>
            )}
            {/* Right label */}
            {labelPosition === "right" && (
              <>
                <text
                  x={s.trap.topRight + 12}
                  y={s.trap.y + s.trap.h / 2 - 6}
                  className="k-funnel-label--name"
                  dominantBaseline="central"
                  pointerEvents="none"
                >
                  {s.data.name}
                </text>
                <text
                  x={s.trap.topRight + 12}
                  y={s.trap.y + s.trap.h / 2 + 8}
                  className="k-funnel-label--value"
                  dominantBaseline="central"
                  pointerEvents="none"
                >
                  {formatVal(s.data.value, s.percentage)}
                </text>
              </>
            )}
            {/* Left label */}
            {labelPosition === "left" && (
              <>
                <text
                  x={s.trap.topLeft - 12}
                  y={s.trap.y + s.trap.h / 2 - 6}
                  textAnchor="end"
                  className="k-funnel-label--name"
                  dominantBaseline="central"
                  pointerEvents="none"
                >
                  {s.data.name}
                </text>
                <text
                  x={s.trap.topLeft - 12}
                  y={s.trap.y + s.trap.h / 2 + 8}
                  textAnchor="end"
                  className="k-funnel-label--value"
                  dominantBaseline="central"
                  pointerEvents="none"
                >
                  {formatVal(s.data.value, s.percentage)}
                </text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );

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
      className={`k-chart k-funnel ${className || ""}`}
      style={{ width: width || "100%", position: "relative", ...style }}
    >
      {showLegend && legendPosition === "top" && legendEl}

      {isLegendSide ? (
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          {showLegend && legendPosition === "left" && (
            <div style={{ paddingTop: plotTop, alignSelf: "flex-start" }}>
              {legendEl}
            </div>
          )}
          {svgEl}
          {showLegend && legendPosition === "right" && (
            <div style={{ paddingTop: plotTop, alignSelf: "flex-start" }}>
              {legendEl}
            </div>
          )}
        </div>
      ) : (
        svgEl
      )}

      {showLegend && legendPosition === "bottom" && legendEl}

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
};
