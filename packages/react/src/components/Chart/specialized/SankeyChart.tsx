import React, { useCallback, useMemo, useRef, useState } from "react";
import type { ChartSeverity } from "../core/types";
import type { TooltipEntry } from "../core/ChartTooltip";
import { ChartTooltip } from "../core/ChartTooltip";
import { resolveSeriesColor } from "../core/colors";
import { exportPng, exportSvg } from "../core/export";
import { ContextMenu } from "../../ContextMenu";
import type { MenuItem } from "../../../types/navigation";
import { useKreatiLocale } from "../../../locale/KreatiProvider";
import "../Chart.css";

const ELLIPSIS_V =
  "M12 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4z";

// ─── Types ──────────────────────────────────────────────────────────────────

/** A node in the Sankey diagram. */
export interface SankeyNode {
  /** Unique identifier. */
  id: string;
  /** Display name. */
  name: string;
  /** Explicit color override. */
  color?: string;
  /** Severity-based color. */
  severity?: ChartSeverity;
  /** Per-node CSS class. */
  className?: string;
  /** Per-node inline style. */
  style?: React.CSSProperties;
}

/** A link (flow) between two nodes. */
export interface SankeyLink {
  /** Source node id. */
  source: string;
  /** Target node id. */
  target: string;
  /** Flow value — determines link width. */
  value: number;
  /** Explicit color override. Falls back to source node color. */
  color?: string;
  /** Per-link CSS class. */
  className?: string;
  /** Per-link inline style. */
  style?: React.CSSProperties;
}

/** Props for the SankeyChart component. */
export interface SankeyChartProps {
  /** Nodes in the diagram. */
  nodes: SankeyNode[];
  /** Links between nodes. */
  links: SankeyLink[];
  /** Node rectangle width. Default: 20 */
  nodeWidth?: number;
  /** Vertical padding between nodes. Default: 10 */
  nodePadding?: number;
  /** Chart title. */
  title?: string;
  /** Chart subtitle. */
  subtitle?: string;
  /** Chart width. Fills container when omitted. */
  width?: number;
  /** Chart height. Default: 400 */
  height?: number;
  /** Show node labels. Default: true */
  showLabels?: boolean;
  /** Show values on nodes. Default: false */
  showValues?: boolean;
  /** Format function for values. */
  valueFormat?: (value: number) => string;
  /** Link opacity. Default: 0.4 */
  linkOpacity?: number;
  /** Show tooltip. Default: true */
  showTooltip?: boolean;
  /** Export formats. */
  exportFormats?: ("png" | "svg" | "csv" | "json")[];
  /** Show menu button. Default: "auto" */
  showMenuButton?: "auto" | boolean;
  /** Custom context menu items. */
  contextMenuItems?: MenuItem[];
  /** Click handler for a node. */
  onNodeClick?: (node: SankeyNode) => void;
  /** Click handler for a link. */
  onLinkClick?: (link: SankeyLink) => void;
  /** Additional CSS class. */
  className?: string;
  /** Inline styles. */
  style?: React.CSSProperties;
}

// ─── Layout Algorithm ───────────────────────────────────────────────────────

interface LayoutNode {
  id: string;
  node: SankeyNode;
  col: number;
  x: number;
  y: number;
  h: number;
  totalIn: number;
  totalOut: number;
  total: number;
  colorIdx: number;
}

interface LayoutLink {
  link: SankeyLink;
  sourceId: string;
  targetId: string;
  sy: number;
  ty: number;
  width: number;
}

const computeLayout = (
  nodes: SankeyNode[],
  links: SankeyLink[],
  chartW: number,
  chartH: number,
  nodeWidth: number,
  nodePadding: number,
  titleH: number
): { layoutNodes: LayoutNode[]; layoutLinks: LayoutLink[] } => {
  // Build adjacency
  const outLinks = new Map<string, SankeyLink[]>();
  const inLinks = new Map<string, SankeyLink[]>();
  for (const n of nodes) {
    outLinks.set(n.id, []);
    inLinks.set(n.id, []);
  }
  for (const l of links) {
    outLinks.get(l.source)?.push(l);
    inLinks.get(l.target)?.push(l);
  }

  // Assign columns via topological sort (longest path)
  const colMap = new Map<string, number>();
  const visited = new Set<string>();
  const assignCol = (id: string): number => {
    if (colMap.has(id)) return colMap.get(id)!;
    if (visited.has(id)) return 0;
    visited.add(id);
    const ins = inLinks.get(id) || [];
    const col =
      ins.length === 0 ? 0 : Math.max(...ins.map(l => assignCol(l.source) + 1));
    colMap.set(id, col);
    return col;
  };
  for (const n of nodes) assignCol(n.id);

  const maxCol = Math.max(0, ...colMap.values());
  const colCount = maxCol + 1;

  // Compute node totals
  const totals = new Map<string, { in: number; out: number }>();
  for (const n of nodes) {
    const totalOut = (outLinks.get(n.id) || []).reduce(
      (s, l) => s + l.value,
      0
    );
    const totalIn = (inLinks.get(n.id) || []).reduce((s, l) => s + l.value, 0);
    totals.set(n.id, { in: totalIn, out: totalOut });
  }

  // Group nodes by column
  const columns: SankeyNode[][] = Array.from({ length: colCount }, () => []);
  for (const n of nodes) columns[colMap.get(n.id) || 0].push(n);

  // Position nodes
  const plotH = chartH - titleH;
  const colSpacing = colCount > 1 ? (chartW - nodeWidth) / (colCount - 1) : 0;

  const layoutNodes: LayoutNode[] = [];
  const nodeMap = new Map<string, LayoutNode>();
  let colorIdx = 0;

  for (let c = 0; c < colCount; c++) {
    const col = columns[c];
    const colTotal = col.reduce((s, n) => {
      const t = totals.get(n.id)!;
      return s + Math.max(t.in, t.out);
    }, 0);
    const totalPadding = nodePadding * (col.length - 1);
    const availH = plotH - totalPadding;
    const scale = colTotal > 0 ? availH / colTotal : 0;

    let y = titleH;
    for (const n of col) {
      const t = totals.get(n.id)!;
      const val = Math.max(t.in, t.out);
      const h = Math.max(2, val * scale);
      const ln: LayoutNode = {
        id: n.id,
        node: n,
        col: c,
        x: c * colSpacing,
        y,
        h,
        totalIn: t.in,
        totalOut: t.out,
        total: val,
        colorIdx: colorIdx++,
      };
      layoutNodes.push(ln);
      nodeMap.set(n.id, ln);
      y += h + nodePadding;
    }
  }

  // Position links
  const layoutLinks: LayoutLink[] = [];
  const sourceOffsets = new Map<string, number>();
  const targetOffsets = new Map<string, number>();
  for (const n of layoutNodes) {
    sourceOffsets.set(n.id, 0);
    targetOffsets.set(n.id, 0);
  }

  // Sort links by source position for consistent ordering
  const sortedLinks = [...links].sort((a, b) => {
    const sa = nodeMap.get(a.source);
    const sb = nodeMap.get(b.source);
    const ta = nodeMap.get(a.target);
    const tb = nodeMap.get(b.target);
    if (!sa || !sb || !ta || !tb) return 0;
    return sa.y - sb.y || ta.y - tb.y;
  });

  for (const l of sortedLinks) {
    const src = nodeMap.get(l.source);
    const tgt = nodeMap.get(l.target);
    if (!src || !tgt) continue;

    const srcScale = src.totalOut > 0 ? src.h / src.totalOut : 0;
    const tgtScale = tgt.totalIn > 0 ? tgt.h / tgt.totalIn : 0;
    const w = l.value;

    const sOff = sourceOffsets.get(l.source) || 0;
    const tOff = targetOffsets.get(l.target) || 0;

    layoutLinks.push({
      link: l,
      sourceId: l.source,
      targetId: l.target,
      sy: src.y + sOff * srcScale + (w * srcScale) / 2,
      ty: tgt.y + tOff * tgtScale + (w * tgtScale) / 2,
      width: Math.max(1, w * Math.min(srcScale, tgtScale)),
    });

    sourceOffsets.set(l.source, sOff + w);
    targetOffsets.set(l.target, tOff + w);
  }

  return { layoutNodes, layoutLinks };
};

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * SankeyChart — node-link flow diagram showing quantities between stages.
 *
 * @example
 * ```tsx
 * <SankeyChart
 *   nodes={[
 *     { id: "a", name: "Source" },
 *     { id: "b", name: "Target" },
 *   ]}
 *   links={[{ source: "a", target: "b", value: 100 }]}
 * />
 * ```
 */
export const SankeyChart = ({
  nodes,
  links,
  nodeWidth = 20,
  nodePadding = 10,
  title,
  subtitle,
  width,
  height = 400,
  showLabels = true,
  showValues = false,
  valueFormat,
  linkOpacity = 0.4,
  showTooltip = true,
  exportFormats = [],
  showMenuButton = "auto",
  contextMenuItems,
  onNodeClick,
  onLinkClick,
  className,
  style,
  ref,
}: SankeyChartProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const locale = useKreatiLocale();
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(width || 0);
  const [tooltip, setTooltip] = useState<{
    entries: TooltipEntry[];
    x: number;
    y: number;
  } | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<number | null>(null);
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

  const { layoutNodes, layoutLinks } = useMemo(
    () =>
      computeLayout(
        nodes,
        links,
        chartW,
        height,
        nodeWidth,
        nodePadding,
        titleH
      ),
    [nodes, links, chartW, height, nodeWidth, nodePadding, titleH]
  );

  // Colors
  const nodeColorMap = useMemo(
    () =>
      new Map(
        layoutNodes.map(ln => [
          ln.id,
          ln.node.color ||
            (ln.node.severity
              ? resolveSeriesColor(
                  {
                    id: ln.id,
                    name: ln.node.name,
                    data: [],
                    severity: ln.node.severity,
                  },
                  ln.colorIdx
                )
              : resolveSeriesColor(
                  { id: ln.id, name: ln.node.name, data: [] },
                  ln.colorIdx
                )),
        ])
      ),
    [layoutNodes]
  );

  const formatVal = (v: number) =>
    valueFormat ? valueFormat(v) : v.toLocaleString();

  // Tooltip handlers
  const handleNodeEnter = useCallback(
    (ln: LayoutNode, e: React.MouseEvent) => {
      if (!showTooltip) return;
      setHoveredNode(ln.id);
      setTooltip({
        x: e.clientX,
        y: e.clientY,
        entries: [
          {
            series: {
              id: ln.id,
              name: ln.node.name,
              data: [{ x: 0, y: ln.total }],
            },
            point: { x: 0, y: ln.total, label: formatVal(ln.total) },
            color: nodeColorMap.get(ln.id) || "",
          },
        ],
      });
    },
    [showTooltip, nodeColorMap, formatVal]
  );

  const handleLinkEnter = useCallback(
    (idx: number, ll: LayoutLink, e: React.MouseEvent) => {
      if (!showTooltip) return;
      setHoveredLink(idx);
      const srcName =
        nodes.find(n => n.id === ll.sourceId)?.name || ll.sourceId;
      const tgtName =
        nodes.find(n => n.id === ll.targetId)?.name || ll.targetId;
      const name = `${srcName} → ${tgtName}`;
      setTooltip({
        x: e.clientX,
        y: e.clientY,
        entries: [
          {
            series: {
              id: `link-${idx}`,
              name,
              data: [{ x: 0, y: ll.link.value }],
            },
            point: {
              x: 0,
              y: ll.link.value,
              label: formatVal(ll.link.value),
            },
            color: ll.link.color || nodeColorMap.get(ll.sourceId) || "",
          },
        ],
      });
    },
    [showTooltip, nodes, nodeColorMap, formatVal]
  );

  const handleLeave = useCallback(() => {
    setHoveredNode(null);
    setHoveredLink(null);
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
          if (fmt === "csv") {
            const header = ["Source", "Target", "Value"];
            const csvRows = links.map(l => [
              l.source,
              l.target,
              String(l.value),
            ]);
            const csv = [header, ...csvRows].map(r => r.join(";")).join("\n");
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "sankey.csv";
            a.click();
            URL.revokeObjectURL(url);
            return;
          }
          if (fmt === "json") {
            const obj = {
              nodes: nodes.map(n => ({ id: n.id, name: n.name })),
              links: links.map(l => ({
                source: l.source,
                target: l.target,
                value: l.value,
              })),
            };
            const blob = new Blob([JSON.stringify(obj, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "sankey.json";
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
  }, [exportFormats, contextMenuItems, locale, nodes, links]);

  const showMenu =
    showMenuButton === true ||
    (showMenuButton === "auto" && menuItems.length > 0);

  // Keyboard
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (layoutNodes.length === 0) return;
      const fc = focusedIdx ?? 0;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          setFocusedIdx(Math.min(fc + 1, layoutNodes.length - 1));
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          setFocusedIdx(Math.max(fc - 1, 0));
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          onNodeClick?.(layoutNodes[fc].node);
          break;
        case "Escape":
          setFocusedIdx(null);
          setTooltip(null);
          break;
      }
    },
    [focusedIdx, layoutNodes, onNodeClick]
  );

  // Keyboard tooltip sync
  const prevFocusRef = useRef(focusedIdx);
  if (
    prevFocusRef.current !== focusedIdx &&
    focusedIdx !== null &&
    showTooltip
  ) {
    prevFocusRef.current = focusedIdx;
    const ln = layoutNodes[focusedIdx];
    if (ln) {
      const rect = wrapRef.current?.getBoundingClientRect();
      queueMicrotask(() => {
        setTooltip({
          x: (rect?.left || 0) + ln.x + nodeWidth / 2,
          y: (rect?.top || 0) + ln.y + ln.h / 2,
          entries: [
            {
              series: {
                id: ln.id,
                name: ln.node.name,
                data: [{ x: 0, y: ln.total }],
              },
              point: { x: 0, y: ln.total, label: formatVal(ln.total) },
              color: nodeColorMap.get(ln.id) || "",
            },
          ],
        });
      });
    }
  } else if (focusedIdx === null) {
    prevFocusRef.current = null;
  }

  // Highlight: connected links
  const connectedLinks = useMemo(() => {
    if (!hoveredNode && focusedIdx === null) return null;
    const id = focusedIdx !== null ? layoutNodes[focusedIdx]?.id : hoveredNode;
    if (!id) return null;
    return new Set(
      layoutLinks
        .map((ll, i) => (ll.sourceId === id || ll.targetId === id ? i : -1))
        .filter(i => i >= 0)
    );
  }, [hoveredNode, focusedIdx, layoutNodes, layoutLinks]);

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
        className={`k-chart k-sankey ${className || ""}`}
        style={{ width: width || "100%", minHeight: height, ...style }}
      />
    );
  }

  // Accessible data table
  const srTable = (
    <table className="k-sr-only">
      <caption>{title || "Sankey diagram"}</caption>
      <thead>
        <tr>
          <th>Source</th>
          <th>Target</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {links.map((l, i) => (
          <tr key={i}>
            <td>{nodes.find(n => n.id === l.source)?.name || l.source}</td>
            <td>{nodes.find(n => n.id === l.target)?.name || l.target}</td>
            <td>{formatVal(l.value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  // Link path
  const linkPath = (ll: LayoutLink) => {
    const sx =
      (layoutNodes.find(n => n.id === ll.sourceId)?.x || 0) + nodeWidth;
    const tx = layoutNodes.find(n => n.id === ll.targetId)?.x || 0;
    const mx = (sx + tx) / 2;
    return `M${sx},${ll.sy} C${mx},${ll.sy} ${mx},${ll.ty} ${tx},${ll.ty}`;
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
      className={`k-chart k-sankey ${className || ""}`}
      style={{ width: width || "100%", position: "relative", ...style }}
    >
      <svg
        ref={svgRef}
        className="k-chart-svg"
        width={chartW}
        height={height}
        viewBox={`0 0 ${chartW} ${height}`}
        role="figure"
        aria-label={title || "Sankey diagram"}
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
            className="k-sankey-title"
          >
            {title}
          </text>
        )}
        {subtitle && (
          <text
            x={chartW / 2}
            y={title ? 34 : 16}
            textAnchor="middle"
            className="k-sankey-subtitle"
          >
            {subtitle}
          </text>
        )}

        {/* Links */}
        {layoutLinks.map((ll, i) => {
          const srcColor = nodeColorMap.get(ll.sourceId) || "";
          const color = ll.link.color || srcColor;
          const highlighted = connectedLinks?.has(i);
          const dimmed =
            connectedLinks !== null && !highlighted && hoveredLink !== i;

          return (
            <path
              key={`link-${i}`}
              d={linkPath(ll)}
              fill="none"
              stroke={color}
              strokeWidth={ll.width}
              strokeOpacity={
                dimmed ? 0.1 : hoveredLink === i ? 0.7 : linkOpacity
              }
              className={`k-sankey-link ${ll.link.className || ""}`}
              style={ll.link.style}
              onMouseEnter={e => handleLinkEnter(i, ll, e)}
              onMouseLeave={handleLeave}
              onClick={() => onLinkClick?.(ll.link)}
              cursor={onLinkClick ? "pointer" : undefined}
            />
          );
        })}

        {/* Nodes */}
        {layoutNodes.map((ln, i) => {
          const color = nodeColorMap.get(ln.id) || "";
          const isFocused = focusedIdx === i;
          const isHovered = hoveredNode === ln.id;
          const isRight = ln.col > Math.max(...layoutNodes.map(n => n.col)) / 2;

          return (
            <g
              key={ln.id}
              className={`k-sankey-node ${ln.node.className || ""}`}
              style={ln.node.style}
            >
              <rect
                x={ln.x}
                y={ln.y}
                width={nodeWidth}
                height={ln.h}
                fill={color}
                stroke={
                  isFocused
                    ? "var(--kreati-chart-text)"
                    : isHovered
                      ? "var(--kreati-chart-text)"
                      : "none"
                }
                strokeWidth={isFocused ? 2 : isHovered ? 1 : 0}
                rx={2}
                onMouseEnter={e => handleNodeEnter(ln, e)}
                onMouseLeave={handleLeave}
                onClick={() => {
                  setFocusedIdx(i);
                  onNodeClick?.(ln.node);
                }}
                cursor={onNodeClick ? "pointer" : undefined}
              />
              {showLabels && (
                <text
                  x={isRight ? ln.x - 6 : ln.x + nodeWidth + 6}
                  y={ln.y + ln.h / 2}
                  textAnchor={isRight ? "end" : "start"}
                  dominantBaseline="central"
                  className="k-sankey-label"
                >
                  {ln.node.name}
                  {showValues ? ` (${formatVal(ln.total)})` : ""}
                </text>
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
};
