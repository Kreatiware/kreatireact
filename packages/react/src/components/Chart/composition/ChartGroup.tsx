import React, {
  useState,
  useCallback,
  useRef,
  useMemo,
  useImperativeHandle,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import { LineChart } from "../cartesian/LineChart";
import type { LineChartProps } from "../cartesian/LineChart";
import { BarChart } from "../cartesian/BarChart";
import type { BarChartProps } from "../cartesian/BarChart";
import { AreaChart } from "../cartesian/AreaChart";
import type { AreaChartProps } from "../cartesian/AreaChart";
import { ScatterChart } from "../cartesian/ScatterChart";
import type { ScatterChartProps } from "../cartesian/ScatterChart";
import { MixedChart } from "../cartesian/MixedChart";
import type { MixedChartProps } from "../cartesian/MixedChart";
import { Legend } from "../core/Legend";
import {
  exportPng,
  exportSvg,
  exportCsv,
  exportJsonTable,
  exportJsonSeries,
} from "../core/export";
import type { ZoomState } from "../core/zoom";
import type { ChartSeries, ChartAxisConfig } from "../core/types";
import { useKreatiLocale } from "../../../locale/KreatiProvider";
import "../Chart.css";

const EXPORT_TITLE_FONT_SIZE = "11";
const EXPORT_TITLE_FONT_WEIGHT = "600";

/** Omitted props that ChartGroup controls. */
type GroupOmitted =
  | "xAxis"
  | "showLegend"
  | "zoomMode"
  | "zoomAxis"
  | "exportFormats"
  | "showMenuButton";

/** Configuration for a single panel in a ChartGroup. */
export interface ChartGroupPanel extends Omit<LineChartProps, GroupOmitted> {
  /** Chart type for this panel. Default: 'line' */
  type?: "line" | "bar" | "area" | "scatter" | "mixed";
  /** BarChart-specific: grouping mode */
  groupMode?: BarChartProps["groupMode"];
  /** BarChart-specific: orientation */
  orientation?: BarChartProps["orientation"];
  /** BarChart-specific: border radius */
  barRadius?: BarChartProps["barRadius"];
  /** BarChart-specific: gap between bars */
  barGap?: BarChartProps["barGap"];
  /** BarChart-specific: bar width */
  barWidth?: BarChartProps["barWidth"];
  /** BarChart-specific: show data labels */
  showDataLabels?: BarChartProps["showDataLabels"];
  /** BarChart-specific: show category dividers */
  showCategoryDividers?: BarChartProps["showCategoryDividers"];
  /** AreaChart-specific: stacking mode */
  stackMode?: AreaChartProps["stackMode"];
  /** AreaChart-specific: area fill opacity */
  areaOpacity?: AreaChartProps["areaOpacity"];
  /** AreaChart-specific: show line on top of area */
  showLine?: AreaChartProps["showLine"];
  /** ScatterChart-specific: marker size */
  scatterMarkerSize?: ScatterChartProps["markerSize"];
  /** ScatterChart-specific: enable bubble mode */
  bubbleMode?: ScatterChartProps["bubbleMode"];
  /** ScatterChart-specific: min bubble radius */
  bubbleMin?: ScatterChartProps["bubbleMin"];
  /** ScatterChart-specific: max bubble radius */
  bubbleMax?: ScatterChartProps["bubbleMax"];
  /** MixedChart-specific: layer definitions */
  layers?: MixedChartProps["layers"];
  /** Panel title displayed above the chart */
  title?: string;
  /** Panel height in pixels. Default: 200 */
  height?: number;
  /** Show X axis labels on this panel. Default: false (only last panel shows them) */
  showXLabels?: boolean;
  /** Keep panel visible even when all its series are hidden. Default: false */
  keepEmpty?: boolean;
}

export interface ChartGroupRef {
  /** Export all panels as a single file */
  export: (format: string) => void;
}

export interface ChartGroupProps {
  /** Array of chart panels */
  panels: ChartGroupPanel[];
  /** Shared X axis config (applied to all panels) */
  xAxis?: ChartAxisConfig;
  /** Synchronize zoom, crosshair, legend, and export across panels. When false, each panel operates independently. Default: true */
  synchronized?: boolean;
  /** Zoom mode for all panels. Default: 'both' */
  zoomMode?: "select" | "wheel" | "both" | false;
  /** Zoom axis constraint. Default: 'x' */
  zoomAxis?: "x" | "y" | "both";
  /** Show synchronized crosshair across panels. Default: true */
  showCrosshair?: boolean;
  /** Show a unified legend for all series. Default: true */
  showLegend?: boolean;
  /** Legend position. Default: 'bottom' */
  legendPosition?: "top" | "bottom";
  /** Export formats in context menu. Default: [] */
  exportFormats?: ("png" | "svg" | "csv" | "json-table" | "json-series")[];
  /**
   * Tooltip mode.
   * - 'single': tooltip shows closest series in the active panel (default)
   * - 'shared': tooltip shows all series in the active panel
   * - 'group': unified tooltip showing data from ALL panels at the crosshair position
   */
  tooltipMode?: "single" | "shared" | "group";
  /** Controlled zoom state (for external toolbar). */
  controlledZoom?: ZoomState | null;
  /** Callback when zoom changes (for external toolbar). */
  onZoomChange?: (zoom: ZoomState | null) => void;
  /** Custom palette */
  palette?: string[];
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * ChartGroup — synchronized multi-panel chart layout.
 *
 * @description Renders multiple LineChart panels stacked vertically with
 * shared X axis, synchronized zoom, crosshair, and a unified legend.
 * Only the last panel displays X axis labels by default.
 * Tooltip shows data for the panel under the cursor.
 */
export const ChartGroup = ({
  panels,
  xAxis,
  synchronized = true,
  zoomMode = "both",
  zoomAxis = "x",
  showCrosshair = true,
  showLegend = true,
  legendPosition = "bottom",
  exportFormats = [],
  controlledZoom: externalZoom,
  onZoomChange: externalZoomChange,
  tooltipMode = "single",
  palette,
  className = "",
  style,
  ref,
}: ChartGroupProps & { ref?: React.Ref<ChartGroupRef> }) => {
  const t = useKreatiLocale().chart;
  const containerRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);

  // Shared zoom state — use external if provided
  const [internalZoom, setInternalZoom] = useState<ZoomState | null>(null);
  const sharedZoom = externalZoom !== undefined ? externalZoom : internalZoom;
  const setSharedZoom = useCallback(
    (z: ZoomState | null | ((prev: ZoomState | null) => ZoomState | null)) => {
      const next = typeof z === "function" ? z(sharedZoom) : z;
      if (externalZoomChange) externalZoomChange(next);
      if (externalZoom === undefined) setInternalZoom(next);
    },
    [sharedZoom, externalZoomChange, externalZoom]
  );

  // Shared crosshair X in data coordinates
  const [crosshairX, setCrosshairX] = useState<number | null>(null);

  // Track which panel the mouse is over
  const [activePanel, setActivePanel] = useState<number | null>(null);

  // Group tooltip state
  const [groupTooltipPos, setGroupTooltipPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const groupTooltipRef = useRef<HTMLDivElement>(null);

  // Selection overlay — use ref for direct DOM updates (no render lag)
  const selectOverlayRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const handleSelectChange = useCallback(
    (
      range: {
        x1: number;
        x2: number;
        plotLeft: number;
        plotWidth: number;
      } | null
    ) => {
      const el = selectOverlayRef.current;
      if (!el) return;
      if (range) {
        isDraggingRef.current = true;
        el.style.display = "block";
        el.style.left = `${range.plotLeft + range.x1}px`;
        el.style.width = `${range.x2 - range.x1}px`;
      } else {
        isDraggingRef.current = false;
        el.style.display = "none";
      }
    },
    []
  );

  // Unified hidden series
  const allSeries = panels.flatMap(p => p.series ?? []);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(
    () => new Set(allSeries.filter(s => s.hidden).map(s => s.id))
  );
  const toggleSeries = useCallback((id: string) => {
    setHiddenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Build group tooltip entries from crosshairX
  const groupTooltipEntries = useMemo(() => {
    if (tooltipMode !== "group" || crosshairX == null) return [];
    const entries: {
      name: string;
      value: number;
      color: string;
      unit?: string;
    }[] = [];
    let paletteIdx = 0;
    panels.forEach(panel => {
      const panelSeries = panel.series ?? [];
      panelSeries.forEach(s => {
        if (hiddenIds.has(s.id)) {
          paletteIdx++;
          return;
        }
        let nearest = s.data[0];
        let minDist = Infinity;
        for (const p of s.data) {
          const d = Math.abs(p.x - crosshairX);
          if (d < minDist) {
            minDist = d;
            nearest = p;
          }
        }
        if (nearest) {
          const color =
            s.color ?? `var(--kreati-chart-${(paletteIdx % 12) + 1})`;
          entries.push({
            name: s.name,
            value: nearest.y,
            color,
            unit: s.unit,
          });
        }
        paletteIdx++;
      });
    });
    return entries;
  }, [tooltipMode, crosshairX, panels, hiddenIds]);

  const handleZoomChange = useCallback(
    (zoom: ZoomState | null) => {
      if (synchronized) {
        if (zoom) {
          setSharedZoom(prev => ({
            xMin: zoom.xMin,
            xMax: zoom.xMax,
            yMin: prev?.yMin ?? zoom.yMin,
            yMax: prev?.yMax ?? zoom.yMax,
          }));
        } else {
          setSharedZoom(null);
        }
      }
      // Clear selection overlay when zoom is applied
      handleSelectChange(null);
    },
    [synchronized, handleSelectChange]
  );

  const handleCrosshairChange = useCallback(
    (panelIdx: number) => (x: number | null) => {
      setCrosshairX(x);
      if (!isDraggingRef.current) setActivePanel(x != null ? panelIdx : null);
    },
    []
  );

  // Export all panels
  const handleExport = useCallback(
    (format: string) => {
      const el = containerRef.current;
      if (!el) return;
      if (format === "png" || format === "svg") {
        const panelEls = Array.from(
          el.querySelectorAll(".k-chart-group__panel")
        ) as HTMLElement[];
        const svgs = Array.from(
          el.querySelectorAll("svg.k-chart")
        ) as SVGSVGElement[];
        if (svgs.length === 0) return;
        if (
          svgs.length === 1 &&
          !panelEls[0]?.querySelector(".k-chart-group__panel-title")
        ) {
          if (format === "png") exportPng(svgs[0]);
          else exportSvg(svgs[0]);
          return;
        }

        const width = svgs[0].getBoundingClientRect().width;
        const textColor =
          window.getComputedStyle(el).color || "var(--kreati-chart-text)";
        const titleH = 18;

        // Collect panel info
        const panelInfo: { title?: string; svgIdx: number; svgH: number }[] =
          [];
        let svgIdx = 0;
        panelEls.forEach(pe => {
          const titleEl = pe.querySelector(".k-chart-group__panel-title");
          const svg = pe.querySelector("svg.k-chart") as SVGSVGElement | null;
          if (!svg) return;
          panelInfo.push({
            title: titleEl?.textContent || undefined,
            svgIdx,
            svgH: svg.getBoundingClientRect().height,
          });
          svgIdx++;
        });

        let totalH = 0;
        panelInfo.forEach(p => {
          totalH += (p.title ? titleH : 0) + p.svgH;
        });

        const merged = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        merged.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        merged.setAttribute("width", String(width));
        merged.setAttribute("height", String(totalH));
        merged.setAttribute("viewBox", `0 0 ${width} ${totalH}`);

        const inlineStyles = (src: Element, tgt: Element) => {
          const cs = window.getComputedStyle(src);
          const te = tgt as SVGElement;
          for (const p of [
            "fill",
            "stroke",
            "stroke-width",
            "stroke-dasharray",
            "font-size",
            "font-family",
            "font-weight",
            "opacity",
            "color",
          ]) {
            const v = cs.getPropertyValue(p);
            if (v) te.style.setProperty(p, v);
          }
          for (
            let j = 0;
            j < src.children.length && j < tgt.children.length;
            j++
          ) {
            inlineStyles(src.children[j], tgt.children[j]);
          }
        };

        let yOff = 0;
        panelInfo.forEach(p => {
          if (p.title) {
            const t = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "text"
            );
            t.setAttribute("x", "8");
            t.setAttribute("y", String(yOff + 13));
            t.setAttribute("fill", textColor);
            t.setAttribute("font-size", EXPORT_TITLE_FONT_SIZE);
            t.setAttribute("font-weight", EXPORT_TITLE_FONT_WEIGHT);
            t.setAttribute("font-family", "Inter, sans-serif");
            t.textContent = p.title;
            merged.appendChild(t);
            yOff += titleH;
          }
          const svg = svgs[p.svgIdx];
          const clone = svg.cloneNode(true) as SVGSVGElement;
          clone
            .querySelectorAll(
              ".k-chart-menu-btn, .k-chart-zoom-select, .k-chart-focus-ring"
            )
            .forEach(e => e.remove());
          inlineStyles(svg, clone);
          const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
          g.setAttribute("transform", `translate(0,${yOff})`);
          while (clone.firstChild) g.appendChild(clone.firstChild);
          merged.appendChild(g);
          yOff += p.svgH;
        });

        const svgData = new XMLSerializer().serializeToString(merged);
        const download = (blob: Blob, name: string) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        };
        if (format === "svg") {
          download(
            new Blob([svgData], { type: "image/svg+xml;charset=utf-8" }),
            "chart.svg"
          );
        } else {
          const blob = new Blob([svgData], {
            type: "image/svg+xml;charset=utf-8",
          });
          const url = URL.createObjectURL(blob);
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const scale = 2;
            canvas.width = width * scale;
            canvas.height = totalH * scale;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            ctx.scale(scale, scale);
            ctx.drawImage(img, 0, 0, width, totalH);
            URL.revokeObjectURL(url);
            canvas.toBlob(pngBlob => {
              if (pngBlob) download(pngBlob, "chart.png");
            }, "image/png");
          };
          img.src = url;
        }
      }
      if (format === "csv") {
        const vis = allSeries.filter(s => !hiddenIds.has(s.id));
        exportCsv(vis, xAxis?.categories, xAxis?.label);
      }
      if (format === "json-table") {
        exportJsonTable(
          allSeries.filter(s => !hiddenIds.has(s.id)),
          xAxis?.categories,
          xAxis?.label
        );
      }
      if (format === "json-series") {
        exportJsonSeries(allSeries.filter(s => !hiddenIds.has(s.id)));
      }
    },
    [allSeries, hiddenIds, xAxis]
  );

  // Calculate unified margins based on max axes across all panels
  const unifiedMargins = useMemo(() => {
    let maxLeft = 1;
    let maxRight = 0;
    for (const p of panels) {
      const yAxesCfg = p.yAxis;
      const axes = Array.isArray(yAxesCfg)
        ? yAxesCfg
        : yAxesCfg
          ? [yAxesCfg]
          : [{}];
      const leftCount = axes.filter(a => a.side !== "right").length;
      const rightCount = axes.filter(a => a.side === "right").length;
      if (leftCount > maxLeft) maxLeft = leftCount;
      if (rightCount > maxRight) maxRight = rightCount;
    }
    return {
      left: 50 + (maxLeft - 1) * 60,
      right: 20 + (maxRight > 0 ? 60 * maxRight : 0),
    };
  }, [panels]);

  // Assign consistent colors to all series for legend
  const coloredSeries = allSeries.map((s, i) => ({
    ...s,
    ...(!s.color && !s.severity
      ? { color: `var(--kreati-chart-${(i % 12) + 1})` }
      : {}),
  }));

  const legend =
    showLegend && synchronized && allSeries.length > 1 ? (
      <Legend
        series={coloredSeries}
        hiddenIds={hiddenIds}
        onToggle={toggleSeries}
        position={legendPosition === "top" ? "top" : "bottom"}
        palette={palette}
      />
    ) : null;

  useImperativeHandle(
    ref,
    () => ({
      export: (format: string) => handleExport(format),
    }),
    [handleExport]
  );

  return (
    <div
      ref={containerRef}
      className={`k-chart-group ${className}`}
      style={style}
      role="group"
      aria-label="Chart group"
    >
      {legendPosition === "top" && legend}

      <div
        ref={panelsRef}
        className="k-chart-group__panels"
        onMouseMove={
          tooltipMode === "group"
            ? e => setGroupTooltipPos({ x: e.clientX, y: e.clientY })
            : undefined
        }
        onMouseLeave={
          tooltipMode === "group" ? () => setGroupTooltipPos(null) : undefined
        }
      >
        {panels.map((panel, idx) => {
          const {
            title: panelTitle,
            height: panelHeight = 200,
            showXLabels,
            keepEmpty = false,
            series: panelSeries = [],
            type: panelType = "line",
            groupMode,
            orientation,
            barRadius,
            barGap,
            barWidth,
            showDataLabels,
            showCategoryDividers,
            stackMode,
            areaOpacity,
            showLine,
            scatterMarkerSize,
            bubbleMode,
            bubbleMin,
            bubbleMax,
            layers: panelLayers,
            ...rest
          } = panel;

          // Hide panel if all its series are hidden
          const hasVisible = panelSeries.some(s => !hiddenIds.has(s.id));
          if (!hasVisible && !keepEmpty) return null;

          // Determine if this is the last visible panel
          const visiblePanels = panels.filter((p, i) => {
            const ps = p.series ?? [];
            return (
              ps.some(s => !hiddenIds.has(s.id)) || p.keepEmpty || i === idx
            );
          });
          const isLastVisible =
            visiblePanels[visiblePanels.length - 1] === panel;
          const showX = showXLabels ?? isLastVisible;

          // Palette offset so each panel gets unique colors
          const paletteOffset = panels
            .slice(0, idx)
            .reduce((sum, p) => sum + (p.series?.length ?? 0), 0);

          // Filter hidden series
          const filteredSeries = panelSeries.map((s, si) => ({
            ...s,
            ...(hiddenIds.has(s.id) ? { hidden: true } : {}),
            // Assign color from global palette position if not explicitly set
            ...(!s.color && !s.severity
              ? {
                  color: `var(--kreati-chart-${((paletteOffset + si) % 12) + 1})`,
                }
              : {}),
          }));

          // X axis: hide labels and ticks on non-last panels
          const panelXAxis: ChartAxisConfig = {
            ...xAxis,
            ...(!showX ? { label: undefined, ticks: 0 } : {}),
          };

          // Reduce bottom margin on non-last panels (no X labels/ticks)
          const panelMargins = {
            left: unifiedMargins.left,
            right: unifiedMargins.right,
            ...(!showX ? { bottom: 5 } : {}),
            ...(rest.margins ?? {}),
          };

          return (
            <div
              key={idx}
              className="k-chart-group__panel"
              role="region"
              aria-label={panelTitle ?? `Panel ${idx + 1}`}
              onMouseEnter={() => {
                if (!isDraggingRef.current) setActivePanel(idx);
              }}
              onMouseLeave={() => {
                if (!isDraggingRef.current) {
                  setActivePanel(null);
                  setCrosshairX(null);
                  handleSelectChange(null);
                }
              }}
            >
              {panelTitle && (
                <div className="k-chart-group__panel-title">{panelTitle}</div>
              )}
              {(() => {
                const sharedProps = {
                  ...rest,
                  series: filteredSeries,
                  xAxis: panelXAxis,
                  height: panelHeight,
                  margins: panelMargins,
                  showLegend: !synchronized,
                  zoomMode,
                  zoomAxis,
                  controlledZoom: synchronized ? sharedZoom : undefined,
                  onZoomChange: handleZoomChange,
                  showCrosshair: showCrosshair && activePanel === idx,
                  syncCrosshairX:
                    showCrosshair && synchronized && activePanel !== idx
                      ? crosshairX
                      : null,
                  onCrosshairChange: synchronized
                    ? handleCrosshairChange(idx)
                    : undefined,
                  onSelectChange:
                    synchronized && activePanel === idx
                      ? handleSelectChange
                      : undefined,
                  hideSelection: !!synchronized,
                  tooltipMode:
                    tooltipMode === "group"
                      ? ("custom" as "single")
                      : tooltipMode,
                  tooltipRender:
                    tooltipMode === "group" ? () => null : undefined,
                  exportFormats: !synchronized
                    ? (exportFormats as (
                        | "png"
                        | "svg"
                        | "csv"
                        | "json-table"
                        | "json-series"
                      )[])
                    : [],
                  showMenuButton: !synchronized
                    ? ("auto" as const)
                    : idx === 0 && exportFormats.length > 0
                      ? (true as const)
                      : idx === 0
                        ? ("auto" as const)
                        : (false as const),
                  contextMenuItems:
                    synchronized && exportFormats.length > 0
                      ? exportFormats.map(fmt => ({
                          key: `group-export-${fmt}`,
                          label:
                            fmt === "png"
                              ? t.exportPng
                              : fmt === "svg"
                                ? t.exportSvg
                                : fmt === "csv"
                                  ? t.exportCsv
                                  : fmt === "json-table"
                                    ? t.exportJsonTable
                                    : t.exportJsonSeries,
                          command: () => handleExport(fmt),
                        }))
                      : undefined,
                  palette,
                };

                if (panelType === "bar") {
                  return (
                    <BarChart
                      {...(sharedProps as BarChartProps)}
                      groupMode={groupMode}
                      orientation={orientation}
                      barRadius={barRadius}
                      barGap={barGap}
                      barWidth={barWidth}
                      showDataLabels={showDataLabels}
                      showCategoryDividers={showCategoryDividers}
                    />
                  );
                }
                if (panelType === "area") {
                  return (
                    <AreaChart
                      {...(sharedProps as AreaChartProps)}
                      stackMode={stackMode}
                      areaOpacity={areaOpacity}
                      showLine={showLine}
                      showDataLabels={showDataLabels}
                    />
                  );
                }
                if (panelType === "scatter") {
                  return (
                    <ScatterChart
                      {...(sharedProps as ScatterChartProps)}
                      markerSize={scatterMarkerSize}
                      bubbleMode={bubbleMode}
                      bubbleMin={bubbleMin}
                      bubbleMax={bubbleMax}
                      showDataLabels={showDataLabels}
                    />
                  );
                }
                if (panelType === "mixed" && panelLayers) {
                  return (
                    <MixedChart
                      {...(sharedProps as MixedChartProps)}
                      layers={panelLayers}
                    />
                  );
                }
                return <LineChart {...sharedProps} />;
              })()}
            </div>
          );
        })}

        {/* Selection overlay across all panels */}
        {synchronized && (
          <div
            ref={selectOverlayRef}
            className="k-chart-group__select-overlay"
            style={{ display: "none" }}
          />
        )}
      </div>

      {legendPosition === "bottom" && legend}

      {/* Group tooltip portal */}
      {tooltipMode === "group" &&
        groupTooltipPos &&
        groupTooltipEntries.length > 0 &&
        crosshairX != null &&
        createPortal(
          <div
            ref={groupTooltipRef}
            className="k-chart-tooltip"
            style={{
              position: "fixed",
              left: groupTooltipPos.x + 12,
              top: groupTooltipPos.y - 10,
              pointerEvents: "none",
              zIndex: 9999,
            }}
          >
            <div className="k-chart-tooltip__header">
              {xAxis?.categories?.[Math.round(crosshairX)] ??
                String(Math.round(crosshairX))}
            </div>
            {groupTooltipEntries.map(entry => (
              <div key={entry.name} className="k-chart-tooltip__row">
                <span
                  className="k-chart-tooltip__dot"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="k-chart-tooltip__name">{entry.name}</span>
                <span className="k-chart-tooltip__value">
                  {typeof entry.value === "number"
                    ? entry.value.toFixed(1)
                    : entry.value}
                  {entry.unit ? ` ${entry.unit}` : ""}
                </span>
              </div>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
};
