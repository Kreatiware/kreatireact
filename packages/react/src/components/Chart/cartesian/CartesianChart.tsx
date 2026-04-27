import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  forwardRef,
} from "react";
import { ChartCanvas } from "../core/ChartCanvas";
import { Axis } from "../core/Axis";
import "../Chart.css";
import { Legend } from "../core/Legend";
import { Crosshair } from "../core/Crosshair";
import { ConstantLine } from "../core/ConstantLine";
import { ShadedArea } from "../core/ShadedArea";
import { Annotation } from "../core/Annotation";
import { ChartNavigator } from "../core/ChartNavigator";
import { ContextMenu } from "../../ContextMenu";
import type { MenuItem } from "../../../types/navigation";
import { createScale, niceDomain } from "../core/scales";
import { resolveSeriesColor } from "../core/colors";
import { wheelZoom, panZoom, selectZoom, isZoomed } from "../core/zoom";
import type { ZoomState } from "../core/zoom";
import {
  exportPng,
  exportSvg,
  exportCsv,
  exportJsonTable,
  exportJsonSeries,
} from "../core/export";
import { useKreatiLocale } from "../../../locale/KreatiProvider";
import type {
  ChartSeries,
  ChartDataPoint,
  ChartAxisConfig,
  ChartConstant,
  ChartShadedArea,
  ChartAnnotation,
  ChartMargins,
  ScaleFunction,
} from "../core/types";

export interface CartesianChartProps {
  /** Data series */
  series: ChartSeries[];
  /** Chart title */
  title?: string;
  /** Chart subtitle */
  subtitle?: string;
  /** X axis config */
  xAxis?: ChartAxisConfig;
  /** Y axis config (or array for multi-axis) */
  yAxis?: ChartAxisConfig | ChartAxisConfig[];
  /** Reference lines */
  constants?: ChartConstant[];
  /** Highlighted regions */
  shadedAreas?: ChartShadedArea[];
  /** Annotations pointing to specific data coordinates */
  annotations?: ChartAnnotation[];
  /** Chart width */
  width?: number | string;
  /** Chart height in pixels. Default: 300 */
  height?: number;
  /** Minimum height in px when resizable. Default: none */
  minHeight?: number;
  /** Maximum height in px when resizable. Default: none */
  maxHeight?: number;
  /** Minimum width in px when resizable. Default: none */
  minWidth?: number;
  /** Maximum width in px when resizable. Default: none */
  maxWidth?: number;
  /** Allow user to resize the chart by dragging. 'vertical', 'horizontal', 'both', or false. Default: false */
  resizable?: "vertical" | "horizontal" | "both" | boolean;
  /** Show grid lines. Default: true */
  showGrid?: boolean;
  /** Show legend. Default: true */
  showLegend?: boolean;
  /** Legend position. Default: 'bottom' */
  legendPosition?:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "inside-top-right"
    | "inside-top-left";
  /** Legend layout direction. Default: 'horizontal' for top/bottom/inside, 'vertical' for left/right */
  legendDirection?: "horizontal" | "vertical";
  /** Show crosshair. Default: false */
  showCrosshair?: boolean;
  /** Custom palette */
  palette?: string[];
  /** Custom margins */
  margins?: Partial<ChartMargins>;
  /** ARIA label */
  ariaLabel?: string;
  /** Callback when a data point is clicked or activated via Enter key */
  onPointClick?: (point: ChartDataPoint, series: ChartSeries) => void;
  /** Zoom mode. Default: false (disabled) */
  zoomMode?: "select" | "wheel" | "both" | false;
  /** Controlled zoom state (for ChartGroup sync). When set, internal zoom is overridden. */
  controlledZoom?: ZoomState | null;
  /** Callback when zoom changes (for ChartGroup sync). */
  onZoomChange?: (zoom: ZoomState | null) => void;
  /** External crosshair X position in data coordinates (for ChartGroup sync). */
  syncCrosshairX?: number | null;
  /** Callback when mouse moves over chart, reports X in data coordinates (for ChartGroup sync). */
  onCrosshairChange?: (x: number | null) => void;
  /** Callback when drag selection changes (for ChartGroup overlay). Reports pixel X range relative to plot area. */
  onSelectChange?: (
    range: {
      x1: number;
      x2: number;
      plotLeft: number;
      plotWidth: number;
    } | null
  ) => void;
  /** Hide internal zoom selection rectangle (ChartGroup renders its own). Default: false */
  hideSelection?: boolean;
  /** Zoom axis constraint. Default: 'both' */
  zoomAxis?: "x" | "y" | "both";
  /** Export formats available in the context menu. Default: [] (no export) */
  exportFormats?: ("png" | "svg" | "csv" | "json-table" | "json-series")[];
  /** Include title and subtitle in PNG/SVG exports. Default: true */
  exportTitle?: boolean;
  /** CSV separator character. Default: ';' */
  csvSeparator?: string;
  /** Show the menu button. 'auto' shows when zoom active or exports available. Default: 'auto' */
  showMenuButton?: boolean | "auto";
  /** Additional items appended to the context menu (after built-in items) */
  contextMenuItems?: MenuItem[];
  /** Replaces the entire context menu. Receives the default items array and the built-in handler. Return your own ContextMenu or any wrapper. */
  contextMenuRender?: (
    defaultItems: MenuItem[],
    onSelect: (key: string) => void,
    children: React.ReactNode
  ) => React.ReactNode;
  /** Show range navigator. Default: false */
  showNavigator?: boolean;
  /** Navigator height in pixels. Default: 40 */
  navigatorHeight?: number;
  /** Navigator position. 'inside' renders over the chart bottom, 'bottom' renders below. Default: 'inside' */
  navigatorPosition?: "inside" | "bottom";
  /** Navigator visibility behavior. Default: 'auto' */
  navigatorVisibility?: "auto" | "fixed" | "zoom-fixed";
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Render function for chart content (receives scales and dimensions) */
  children: (ctx: CartesianContext) => React.ReactNode;
}

export interface CartesianContext {
  xScale: ScaleFunction;
  yScale: ScaleFunction;
  /** Map of axis id to scale — for multi-axis support */
  yScales: Record<string, ScaleFunction>;
  plotWidth: number;
  plotHeight: number;
  visibleSeries: ChartSeries[];
  getColor: (series: ChartSeries, index: number) => string;
  /** Index of the keyboard-focused data point */
  focusedPointIndex: number | null;
  /** Index of the keyboard-focused series */
  focusedSeriesIndex: number | null;
}

/**
 * CartesianChart — base component for X/Y axis charts.
 *
 * @description Composes ChartCanvas with axes, grid, legend, crosshair,
 * constants, and shaded areas. Delegates actual chart content rendering
 * to children via render prop with scales and dimensions.
 */
export const CartesianChart = forwardRef<HTMLDivElement, CartesianChartProps>(
  (
    {
      series,
      title,
      subtitle,
      xAxis: xAxisConfig,
      yAxis: yAxisConfig,
      constants,
      shadedAreas,
      annotations,
      width = "100%",
      height = 300,
      minHeight,
      maxHeight,
      minWidth,
      maxWidth,
      resizable = false,
      showGrid = true,
      showLegend = true,
      legendPosition = "bottom",
      legendDirection,
      showCrosshair = false,
      palette,
      margins,
      ariaLabel,
      onPointClick,
      zoomMode = false,
      controlledZoom,
      onZoomChange,
      syncCrosshairX,
      onCrosshairChange,
      onSelectChange,
      hideSelection = false,
      zoomAxis = "both",
      exportFormats = [],
      exportTitle = true,
      csvSeparator = ";",
      showMenuButton = "auto",
      contextMenuItems,
      contextMenuRender,
      showNavigator = false,
      navigatorHeight = 40,
      navigatorPosition = "inside",
      navigatorVisibility = "auto",
      className = "",
      style,
      children,
    },
    forwardedRef
  ) => {
    const locale = useKreatiLocale();
    const t = locale.chart;

    const [hiddenIds, setHiddenIds] = useState<Set<string>>(
      () => new Set(series.filter(s => s.hidden).map(s => s.id))
    );

    // Sync hiddenIds when series.hidden changes externally (e.g. ChartGroup)
    useEffect(() => {
      setHiddenIds(new Set(series.filter(s => s.hidden).map(s => s.id)));
    }, [series.map(s => `${s.id}:${s.hidden}`).join()]);
    const [mousePos, setMousePos] = useState<{
      plotX: number;
      plotY: number;
    } | null>(null);
    const [focusedSeriesIndex, setFocusedSeriesIndex] = useState<number | null>(
      null
    );
    const [focusedPointIndex, setFocusedPointIndex] = useState<number | null>(
      null
    );
    const [announcement, setAnnouncement] = useState("");
    const [internalZoom, setInternalZoom] = useState<ZoomState | null>(null);
    const zoomState =
      controlledZoom !== undefined ? controlledZoom : internalZoom;
    const setZoomState = useCallback(
      (
        v: ZoomState | null | ((prev: ZoomState | null) => ZoomState | null)
      ) => {
        const next = typeof v === "function" ? v(zoomState) : v;
        if (onZoomChange) onZoomChange(next);
        if (controlledZoom === undefined) setInternalZoom(next);
      },
      [zoomState, onZoomChange, controlledZoom]
    );
    const [selectStart, setSelectStart] = useState<{
      x: number;
      y: number;
    } | null>(null);
    const [selectCurrent, setSelectCurrent] = useState<{
      x: number;
      y: number;
    } | null>(null);
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(
      null
    );
    const [ctrlHeld, setCtrlHeld] = useState(false);
    const [navVisible, setNavVisible] = useState(false);

    useEffect(() => {
      const down = (e: KeyboardEvent) => {
        if (e.key === "Control") setCtrlHeld(true);
      };
      const up = (e: KeyboardEvent) => {
        if (e.key === "Control") setCtrlHeld(false);
      };
      window.addEventListener("keydown", down);
      window.addEventListener("keyup", up);
      window.addEventListener("blur", () => setCtrlHeld(false));
      return () => {
        window.removeEventListener("keydown", down);
        window.removeEventListener("keyup", up);
        window.removeEventListener("blur", () => setCtrlHeld(false));
      };
    }, []);
    const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const toggleSeries = useCallback((id: string) => {
      setHiddenIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }, []);

    const visibleSeries = useMemo(
      () => series.filter(s => !hiddenIds.has(s.id)),
      [series, hiddenIds]
    );

    // Normalize yAxis to array
    const yAxes: ChartAxisConfig[] = useMemo(() => {
      if (!yAxisConfig) return [{}];
      return Array.isArray(yAxisConfig)
        ? yAxisConfig.length
          ? yAxisConfig
          : [{}]
        : [yAxisConfig];
    }, [yAxisConfig]);

    const yConfig = yAxes[0];

    // Compute domains — primary Y from all series, per-axis from matched series
    const {
      xDomain: fullXDomain,
      yDomain: fullYDomain,
      yDomains,
    } = useMemo(() => {
      let xMin = Infinity,
        xMax = -Infinity;
      // Per-axis min/max
      const axisRanges: Record<string, { min: number; max: number }> = {};
      for (const ax of yAxes) {
        const id = ax.id ?? "default";
        axisRanges[id] = { min: Infinity, max: -Infinity };
      }
      for (const s of visibleSeries) {
        const axId = s.yAxisId ?? "default";
        if (!axisRanges[axId])
          axisRanges[axId] = { min: Infinity, max: -Infinity };
        for (const p of s.data) {
          if (p.x < xMin) xMin = p.x;
          if (p.x > xMax) xMax = p.x;
          const r = axisRanges[axId];
          if (p.y < r.min) r.min = p.y;
          if (p.y > r.max) r.max = p.y;
        }
      }
      if (!isFinite(xMin)) {
        xMin = 0;
        xMax = 1;
      }
      // Build per-axis domains
      const domains: Record<string, [number, number]> = {};
      for (const ax of yAxes) {
        const id = ax.id ?? "default";
        const r = axisRanges[id] ?? { min: 0, max: 1 };
        if (!isFinite(r.min)) {
          r.min = 0;
          r.max = 1;
        }
        domains[id] = niceDomain(ax.min ?? r.min, ax.max ?? r.max);
      }
      const primaryId = yAxes[0].id ?? "default";
      return {
        xDomain: [xAxisConfig?.min ?? xMin, xAxisConfig?.max ?? xMax] as [
          number,
          number,
        ],
        yDomain: domains[primaryId],
        yDomains: domains,
      };
    }, [visibleSeries, xAxisConfig, yAxes]);

    const fullDomain: ZoomState = useMemo(
      () => ({
        xMin: fullXDomain[0],
        xMax: fullXDomain[1],
        yMin: fullYDomain[0],
        yMax: fullYDomain[1],
      }),
      [fullXDomain, fullYDomain]
    );

    const activeZoom = zoomState ?? fullDomain;
    // When zoom is controlled externally with zoomAxis="x", only apply X zoom — keep own Y domain
    const xDomain: [number, number] = [activeZoom.xMin, activeZoom.xMax];
    const yDomain: [number, number] =
      controlledZoom !== undefined && zoomAxis === "x"
        ? fullYDomain
        : [activeZoom.yMin, activeZoom.yMax];
    const zoomed =
      zoomState != null &&
      (controlledZoom !== undefined && zoomAxis === "x"
        ? Math.abs(zoomState.xMin - fullDomain.xMin) > 0.001 ||
          Math.abs(zoomState.xMax - fullDomain.xMax) > 0.001
        : isZoomed(zoomState, fullDomain));

    // Auto-expand margins for extra axes (only count axes with visible series)
    const visibleYAxes = yAxes.filter((ax, i) => {
      const id = ax.id ?? "default";
      const has = visibleSeries.some(s => (s.yAxisId ?? "default") === id);
      const othersHave = yAxes.some(
        (a, j) =>
          j !== i &&
          visibleSeries.some(
            s => (s.yAxisId ?? "default") === (a.id ?? "default")
          )
      );
      return has || !othersHave;
    });
    const rightAxesCount = visibleYAxes.filter(a => a.side === "right").length;
    const leftAxesCount = Math.max(
      1,
      visibleYAxes.filter(a => a.side !== "right").length
    );
    const effectiveMargins: ChartMargins = {
      top: margins?.top ?? 20,
      right:
        margins?.right ?? 20 + (rightAxesCount > 0 ? 60 * rightAxesCount : 0),
      bottom: margins?.bottom ?? 40,
      left: margins?.left ?? 50 + (leftAxesCount - 1) * 60,
    };

    // We need actual pixel dimensions — use a wrapper to measure
    const containerRef = useRef<HTMLDivElement>(null);
    const svgWrapRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [measuredWidth, setMeasuredWidth] = useState(0);
    const [resizeHeight, setResizeHeight] = useState<number | null>(null);
    const [resizeWidth, setResizeWidth] = useState<number | null>(null);

    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const observer = new ResizeObserver(entries => {
        const entry = entries[0];
        if (entry) setMeasuredWidth(entry.contentRect.width);
      });
      observer.observe(el);
      setMeasuredWidth(el.clientWidth);
      return () => observer.disconnect();
    }, []);

    const svgWidth =
      resizeWidth ?? (typeof width === "number" ? width : measuredWidth);
    const clampedWidth = Math.max(
      minWidth ?? 0,
      Math.min(svgWidth, maxWidth ?? Infinity)
    );
    const resolvedHeight = resizeHeight ?? height;
    const clampedHeight = Math.max(
      minHeight ?? 0,
      Math.min(resolvedHeight, maxHeight ?? Infinity)
    );
    const plotWidth = Math.max(
      clampedWidth - effectiveMargins.left - effectiveMargins.right,
      0
    );
    const plotHeight = Math.max(
      clampedHeight - effectiveMargins.top - effectiveMargins.bottom,
      0
    );

    const xScale = useMemo(
      () =>
        createScale(
          xAxisConfig?.type || "linear",
          xDomain,
          [0, Math.max(plotWidth, 0)],
          xAxisConfig?.categories
        ),
      [xDomain, plotWidth, xAxisConfig]
    );

    // Build scales for all Y axes
    const yScales = useMemo(() => {
      const scales: Record<string, ScaleFunction> = {};
      for (const ax of yAxes) {
        const id = ax.id ?? "default";
        const domain = yDomains[id] ?? yDomain;
        // Apply zoom proportionally to secondary axes
        let d: [number, number] = domain;
        if (zoomState && id !== (yAxes[0].id ?? "default")) {
          const primaryDomain = yDomains[yAxes[0].id ?? "default"];
          const zoomFracMin =
            (activeZoom.yMin - primaryDomain[0]) /
            (primaryDomain[1] - primaryDomain[0]);
          const zoomFracMax =
            (activeZoom.yMax - primaryDomain[0]) /
            (primaryDomain[1] - primaryDomain[0]);
          const span = domain[1] - domain[0];
          d = [domain[0] + zoomFracMin * span, domain[0] + zoomFracMax * span];
        } else if (id === (yAxes[0].id ?? "default")) {
          d = yDomain;
        }
        const range: [number, number] = ax.inverted
          ? [0, Math.max(plotHeight, 0)]
          : [Math.max(plotHeight, 0), 0];
        scales[id] = createScale(ax.type || "linear", d, range);
      }
      return scales;
    }, [yAxes, yDomains, yDomain, plotHeight, zoomState, activeZoom]);

    const yScale = yScales[yAxes[0].id ?? "default"];

    const getColor = useCallback(
      (s: ChartSeries, i: number) => resolveSeriesColor(s, i, palette),
      [palette]
    );

    const announcePoint = useCallback(
      (si: number, pi: number) => {
        const s = visibleSeries[si];
        if (!s) return;
        const p = s.data[pi];
        if (!p) return;
        const xLabel = xAxisConfig?.categories?.[p.x] ?? String(p.x);
        const yLabel = `${p.y}${s.unit ? " " + s.unit : ""}`;
        setAnnouncement(`${s.name}, ${xLabel}, ${yLabel}`);
      },
      [visibleSeries, xAxisConfig]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (visibleSeries.length === 0) return;
        const maxPoints = Math.max(...visibleSeries.map(s => s.data.length));
        if (maxPoints === 0) return;

        let si = focusedSeriesIndex ?? 0;
        let pi = focusedPointIndex ?? -1;
        let handled = true;

        switch (e.key) {
          case "ArrowRight":
            pi = Math.min(pi + 1, visibleSeries[si].data.length - 1);
            break;
          case "ArrowLeft":
            pi = Math.max(pi - 1, 0);
            break;
          case "ArrowDown":
            si = Math.min(si + 1, visibleSeries.length - 1);
            pi = Math.min(pi, visibleSeries[si].data.length - 1);
            break;
          case "ArrowUp":
            si = Math.max(si - 1, 0);
            pi = Math.min(pi, visibleSeries[si].data.length - 1);
            break;
          case "Home":
            pi = 0;
            break;
          case "End":
            pi = visibleSeries[si].data.length - 1;
            break;
          case "Enter":
          case " ":
            if (pi >= 0 && onPointClick) {
              onPointClick(visibleSeries[si].data[pi], visibleSeries[si]);
            }
            handled = pi >= 0;
            break;
          case "Escape":
            setFocusedSeriesIndex(null);
            setFocusedPointIndex(null);
            setAnnouncement("");
            e.preventDefault();
            return;
          default:
            handled = false;
        }

        if (handled) {
          e.preventDefault();
          if (pi < 0) pi = 0;
          setFocusedSeriesIndex(si);
          setFocusedPointIndex(pi);
          announcePoint(si, pi);
        }
      },
      [
        visibleSeries,
        focusedSeriesIndex,
        focusedPointIndex,
        onPointClick,
        announcePoint,
      ]
    );

    const handleWheel = useCallback(
      (e: React.WheelEvent) => {
        if (!zoomMode || (zoomMode !== "wheel" && zoomMode !== "both")) return;
        e.preventDefault();
        const svg = (e.target as Element).closest("svg");
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const fracX =
          (e.clientX - rect.left - effectiveMargins.left) / plotWidth;
        const fracY =
          (e.clientY - rect.top - effectiveMargins.top) / plotHeight;
        setZoomState(prev =>
          wheelZoom(
            prev ?? fullDomain,
            fullDomain,
            fracX,
            fracY,
            e.deltaY,
            zoomAxis
          )
        );
      },
      [zoomMode, zoomAxis, fullDomain, effectiveMargins, plotWidth, plotHeight]
    );

    // Global mouseup/mousemove to handle selection even if mouse leaves the chart
    const globalMouseUpRef = useRef<(() => void) | null>(null);
    const globalMouseMoveRef = useRef<((e: MouseEvent) => void) | null>(null);
    const svgMouseUpRef = useRef<() => void>(() => {});
    const dragSvgRef = useRef<SVGSVGElement | null>(null);

    const handleSvgMouseDown = useCallback(
      (e: React.MouseEvent) => {
        if (!zoomMode || e.button !== 0) return;
        const svg = (e.target as Element).closest(
          "svg"
        ) as SVGSVGElement | null;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const px = e.clientX - rect.left - effectiveMargins.left;
        const py = e.clientY - rect.top - effectiveMargins.top;

        const canSelect = zoomMode === "select" || zoomMode === "both";
        let isSelecting = false;

        if (e.ctrlKey && canSelect) {
          setSelectStart({
            x: zoomAxis === "y" ? 0 : px,
            y: zoomAxis === "x" ? 0 : py,
          });
          setSelectCurrent({
            x: zoomAxis === "y" ? plotWidth : px,
            y: zoomAxis === "x" ? plotHeight : py,
          });
          isSelecting = true;
        } else if (zoomed) {
          setIsPanning(true);
          setPanStart({ x: e.clientX, y: e.clientY });
        } else if (canSelect) {
          setSelectStart({
            x: zoomAxis === "y" ? 0 : px,
            y: zoomAxis === "x" ? 0 : py,
          });
          setSelectCurrent({
            x: zoomAxis === "y" ? plotWidth : px,
            y: zoomAxis === "x" ? plotHeight : py,
          });
          isSelecting = true;
        }

        // Register global listeners for drag outside panel
        if (isSelecting) {
          dragSvgRef.current = svg;
          const moveHandler = (ev: MouseEvent) => {
            const r = dragSvgRef.current?.getBoundingClientRect();
            if (!r) return;
            const mx = ev.clientX - r.left - effectiveMargins.left;
            const my = ev.clientY - r.top - effectiveMargins.top;
            const cx =
              zoomAxis === "y"
                ? plotWidth
                : Math.max(0, Math.min(mx, plotWidth));
            const cy =
              zoomAxis === "x"
                ? plotHeight
                : Math.max(0, Math.min(my, plotHeight));
            setSelectCurrent({ x: cx, y: cy });
            // Report to ChartGroup overlay directly
            const cb = onSelectChangeRef.current;
            const ss = selectStartRef.current;
            if (cb && ss) {
              cb({
                x1: Math.min(ss.x, cx),
                x2: Math.max(ss.x, cx),
                plotLeft: effectiveMargins.left,
                plotWidth,
              });
            }
          };
          if (globalMouseMoveRef.current)
            document.removeEventListener(
              "mousemove",
              globalMouseMoveRef.current
            );
          globalMouseMoveRef.current = moveHandler;
          document.addEventListener("mousemove", moveHandler);
        }

        if (globalMouseUpRef.current)
          document.removeEventListener("mouseup", globalMouseUpRef.current);
        const upHandler = () => {
          svgMouseUpRef.current();
          if (globalMouseMoveRef.current) {
            document.removeEventListener(
              "mousemove",
              globalMouseMoveRef.current
            );
            globalMouseMoveRef.current = null;
          }
          document.removeEventListener("mouseup", upHandler);
          globalMouseUpRef.current = null;
          dragSvgRef.current = null;
        };
        globalMouseUpRef.current = upHandler;
        document.addEventListener("mouseup", upHandler);
      },
      [zoomMode, zoomed, effectiveMargins, zoomAxis, plotWidth, plotHeight]
    );

    const handleSvgMouseMove = useCallback(
      (e: React.MouseEvent) => {
        if (isPanning && panStart) {
          const dx = (e.clientX - panStart.x) / plotWidth;
          const dy = (e.clientY - panStart.y) / plotHeight;
          setPanStart({ x: e.clientX, y: e.clientY });
          setZoomState(prev => panZoom(prev ?? fullDomain, fullDomain, dx, dy));
        } else if (selectStart) {
          const svg = (e.target as Element).closest("svg");
          if (!svg) return;
          const rect = svg.getBoundingClientRect();
          const px = e.clientX - rect.left - effectiveMargins.left;
          const py = e.clientY - rect.top - effectiveMargins.top;
          setSelectCurrent({
            x:
              zoomAxis === "y"
                ? plotWidth
                : Math.max(0, Math.min(px, plotWidth)),
            y:
              zoomAxis === "x"
                ? plotHeight
                : Math.max(0, Math.min(py, plotHeight)),
          });
        }
      },
      [
        isPanning,
        panStart,
        selectStart,
        plotWidth,
        plotHeight,
        fullDomain,
        effectiveMargins,
        zoomAxis,
      ]
    );

    const handleSvgMouseUp = useCallback(() => {
      if (isPanning) {
        setIsPanning(false);
        setPanStart(null);
      } else if (selectStart && selectCurrent) {
        const dx = Math.abs(selectCurrent.x - selectStart.x);
        const dy = Math.abs(selectCurrent.y - selectStart.y);
        const hasDrag =
          zoomAxis === "x"
            ? dx > 5
            : zoomAxis === "y"
              ? dy > 5
              : dx > 5 || dy > 5;
        if (hasDrag) {
          let x1 = selectStart.x / plotWidth;
          let y1 = selectStart.y / plotHeight;
          let x2 = selectCurrent.x / plotWidth;
          let y2 = selectCurrent.y / plotHeight;
          if (zoomAxis === "x") {
            y1 = 0;
            y2 = 1;
          }
          if (zoomAxis === "y") {
            x1 = 0;
            x2 = 1;
          }
          const newZoom = selectZoom(zoomState ?? fullDomain, x1, y1, x2, y2);
          if (isZoomed(newZoom, fullDomain)) setZoomState(newZoom);
        }
        setSelectStart(null);
        setSelectCurrent(null);
        if (onSelectChange) onSelectChange(null);
      }
    }, [
      isPanning,
      selectStart,
      selectCurrent,
      plotWidth,
      plotHeight,
      fullDomain,
      zoomState,
      zoomAxis,
      onSelectChange,
    ]);

    svgMouseUpRef.current = handleSvgMouseUp;

    const resetZoom = useCallback(() => {
      setZoomState(null);
      setSelectStart(null);
      setSelectCurrent(null);
      setIsPanning(false);
      setPanStart(null);
    }, []);

    // Report selection range to parent during drag (ChartGroup overlay)
    const onSelectChangeRef = useRef(onSelectChange);
    onSelectChangeRef.current = onSelectChange;
    const selectStartRef = useRef(selectStart);
    selectStartRef.current = selectStart;

    // Touch state refs (avoid re-renders during gestures)
    // Clean up pan state when zoom is reset (e.g. externally via ChartGroup)
    useEffect(() => {
      if (!zoomed) {
        setIsPanning(false);
        setPanStart(null);
      }
    }, [zoomed]);

    const touchRef = useRef<{
      startTouches: { clientX: number; clientY: number }[];
      startZoom: ZoomState;
    } | null>(null);

    const handleTouchStart = useCallback(
      (e: React.TouchEvent) => {
        if (!zoomMode || e.touches.length < 1) return;
        touchRef.current = {
          startTouches: Array.from(e.touches).map(t => ({
            clientX: t.clientX,
            clientY: t.clientY,
          })),
          startZoom: zoomState ?? fullDomain,
        };
      },
      [zoomMode, zoomState, fullDomain]
    );

    const handleTouchMove = useCallback(
      (e: React.TouchEvent) => {
        if (!touchRef.current || !zoomMode) return;
        const { startTouches, startZoom } = touchRef.current;

        if (e.touches.length === 1 && startTouches.length === 1 && zoomed) {
          // Single finger pan
          e.preventDefault();
          const dx =
            (e.touches[0].clientX - startTouches[0].clientX) / plotWidth;
          const dy =
            (e.touches[0].clientY - startTouches[0].clientY) / plotHeight;
          setZoomState(panZoom(startZoom, fullDomain, dx, dy));
        } else if (e.touches.length === 2 && startTouches.length === 2) {
          // Pinch to zoom
          e.preventDefault();
          const startDist = Math.hypot(
            startTouches[1].clientX - startTouches[0].clientX,
            startTouches[1].clientY - startTouches[0].clientY
          );
          const curDist = Math.hypot(
            e.touches[1].clientX - e.touches[0].clientX,
            e.touches[1].clientY - e.touches[0].clientY
          );
          const scale = startDist / Math.max(curDist, 1);
          const midX = (startTouches[0].clientX + startTouches[1].clientX) / 2;
          const svg = (e.target as Element).closest?.("svg");
          const rect = svg?.getBoundingClientRect();
          const fracX = rect
            ? (midX - rect.left - effectiveMargins.left) / plotWidth
            : 0.5;
          const rangeX = startZoom.xMax - startZoom.xMin;
          const newRangeX = rangeX * scale;
          const cx = startZoom.xMin + fracX * rangeX;
          let xMin = cx - fracX * newRangeX;
          let xMax = cx + (1 - fracX) * newRangeX;
          xMin = Math.max(xMin, fullDomain.xMin);
          xMax = Math.min(xMax, fullDomain.xMax);
          setZoomState({
            xMin,
            xMax,
            yMin: startZoom.yMin,
            yMax: startZoom.yMax,
          });
        }
      },
      [zoomMode, zoomed, plotWidth, plotHeight, fullDomain, effectiveMargins]
    );

    const handleTouchEnd = useCallback(() => {
      touchRef.current = null;
    }, []);

    const navigatorRange: [number, number] = useMemo(() => {
      const fullRange = fullDomain.xMax - fullDomain.xMin;
      if (fullRange === 0) return [0, 1];
      return [
        (activeZoom.xMin - fullDomain.xMin) / fullRange,
        (activeZoom.xMax - fullDomain.xMin) / fullRange,
      ];
    }, [activeZoom, fullDomain]);

    const handleNavigatorChange = useCallback(
      (fraction: [number, number]) => {
        const fullRange = fullDomain.xMax - fullDomain.xMin;
        setZoomState({
          xMin: fullDomain.xMin + fraction[0] * fullRange,
          xMax: fullDomain.xMin + fraction[1] * fullRange,
          yMin: fullDomain.yMin,
          yMax: fullDomain.yMax,
        });
      },
      [fullDomain]
    );

    const isNavVisible =
      navigatorVisibility === "fixed" ||
      (navigatorVisibility === "zoom-fixed" && zoomed) ||
      (navigatorVisibility === "auto" && navVisible);

    const showNav = useCallback(() => {
      setNavVisible(true);
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
      navTimerRef.current = setTimeout(() => setNavVisible(false), 3500);
    }, []);

    const handleChartMouseMove = useCallback(
      (e: React.MouseEvent) => {
        if (!showNavigator || navigatorVisibility !== "auto") return;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const bottomZone = rect.bottom - navigatorHeight - 20;
        if (e.clientY > bottomZone) showNav();
      },
      [showNavigator, navigatorVisibility, navigatorHeight, showNav]
    );

    const ctx: CartesianContext = {
      xScale,
      yScale,
      yScales,
      plotWidth: Math.max(plotWidth, 0),
      plotHeight: Math.max(plotHeight, 0),
      visibleSeries,
      getColor,
      focusedPointIndex,
      focusedSeriesIndex,
    };

    const xAxisCfg: ChartAxisConfig = {
      ...xAxisConfig,
      showGrid: xAxisConfig?.showGrid ?? false,
    };

    const isInsideLegend = legendPosition?.startsWith("inside");
    const legend =
      showLegend && series.length > 1 ? (
        <Legend
          series={series}
          hiddenIds={hiddenIds}
          onToggle={toggleSeries}
          position={
            isInsideLegend
              ? "top"
              : (legendPosition as "top" | "bottom" | "left" | "right")
          }
          direction={legendDirection}
          palette={palette}
        />
      ) : null;

    const resizeDir = resizable === true ? "vertical" : resizable || null;
    const canResizeV = resizeDir === "vertical" || resizeDir === "both";
    const canResizeH = resizeDir === "horizontal" || resizeDir === "both";

    // Resize drag handler
    const handleResizeStart = useCallback(
      (axis: "vertical" | "horizontal" | "both", e: React.MouseEvent) => {
        e.preventDefault();
        const startX = e.clientX;
        const startY = e.clientY;
        const startH = clampedHeight;
        const startW = clampedWidth;
        const onMove = (ev: MouseEvent) => {
          if (axis !== "horizontal") {
            const newH = startH + (ev.clientY - startY);
            setResizeHeight(
              Math.max(minHeight ?? 100, Math.min(newH, maxHeight ?? Infinity))
            );
          }
          if (axis !== "vertical") {
            const newW = startW + (ev.clientX - startX);
            setResizeWidth(
              Math.max(minWidth ?? 200, Math.min(newW, maxWidth ?? Infinity))
            );
          }
        };
        const onUp = () => {
          document.removeEventListener("mousemove", onMove);
          document.removeEventListener("mouseup", onUp);
        };
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
      },
      [clampedHeight, clampedWidth, minHeight, maxHeight, minWidth, maxWidth]
    );

    const containerStyle: React.CSSProperties = {
      ...(resizeWidth ? { width: clampedWidth } : {}),
      ...style,
    };

    return (
      <div
        ref={node => {
          (
            containerRef as React.MutableRefObject<HTMLDivElement | null>
          ).current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef)
            (
              forwardedRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = node;
        }}
        className={`k-cartesian-chart ${resizable ? "k-cartesian-chart--resizable" : ""} ${className}`}
        style={containerStyle}
        tabIndex={0}
        role="figure"
        aria-label={ariaLabel ?? title ?? "Chart"}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          setFocusedSeriesIndex(null);
          setFocusedPointIndex(null);
        }}
      >
        {/* Screen reader announcements */}
        <div aria-live="polite" aria-atomic="true" className="k-sr-only">
          {announcement}
        </div>
        {/* Title / Subtitle */}
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
          className="k-cartesian-chart__body"
          style={
            legendPosition === "left" || legendPosition === "right"
              ? { display: "flex" }
              : undefined
          }
        >
          {legendPosition === "left" && legend}
          {(() => {
            const defaultItems: MenuItem[] = [
              ...(zoomed
                ? [
                    { key: "reset-zoom", label: t.resetZoom },
                    ...(exportFormats.length > 0 || contextMenuItems?.length
                      ? [{ key: "divider-1", separator: true }]
                      : []),
                  ]
                : []),
              ...(exportFormats.includes("png")
                ? [{ key: "export-png", label: t.exportPng }]
                : []),
              ...(exportFormats.includes("svg")
                ? [{ key: "export-svg", label: t.exportSvg }]
                : []),
              ...(exportFormats.includes("csv")
                ? [{ key: "export-csv", label: t.exportCsv }]
                : []),
              ...(exportFormats.includes("json-table")
                ? [{ key: "export-json-table", label: t.exportJsonTable }]
                : []),
              ...(exportFormats.includes("json-series")
                ? [{ key: "export-json-series", label: t.exportJsonSeries }]
                : []),
              ...(contextMenuItems?.length
                ? [
                    ...(exportFormats.length > 0
                      ? [{ key: "divider-custom", separator: true }]
                      : []),
                    ...contextMenuItems,
                  ]
                : []),
            ];
            const handleMenuSelect = (key: string) => {
              if (key === "reset-zoom") resetZoom();
              const svg = containerRef.current?.querySelector(
                "svg.k-chart"
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
              if (key === "export-csv")
                exportCsv(
                  visibleSeries,
                  xAxisConfig?.categories,
                  xAxisConfig?.label,
                  csvSeparator
                );
              if (key === "export-json-table")
                exportJsonTable(
                  visibleSeries,
                  xAxisConfig?.categories,
                  xAxisConfig?.label
                );
              if (key === "export-json-series") exportJsonSeries(visibleSeries);
            };
            const hasMenu = defaultItems.some(i => !i.separator);
            const svgWrapContent = (
              <div
                ref={svgWrapRef}
                className="k-cartesian-chart__svg-wrap"
                style={{
                  flex: 1,
                  position: "relative",
                  cursor: isPanning
                    ? "grabbing"
                    : zoomed && ctrlHeld
                      ? "crosshair"
                      : zoomed
                        ? "grab"
                        : zoomMode
                          ? "crosshair"
                          : onPointClick
                            ? "pointer"
                            : undefined,
                }}
                onWheel={handleWheel}
                onMouseDown={handleSvgMouseDown}
                onMouseUp={handleSvgMouseUp}
                onMouseLeave={() => {
                  if (!selectStart) handleSvgMouseUp();
                  setMousePos(null);
                  if (onCrosshairChange) onCrosshairChange(null);
                }}
                onMouseMove={e => {
                  handleSvgMouseMove(e);
                  handleChartMouseMove(e);
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Chart menu button */}
                {(showMenuButton === true ||
                  (showMenuButton === "auto" &&
                    (zoomed ||
                      exportFormats.length > 0 ||
                      (contextMenuItems && contextMenuItems.length > 0)))) && (
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
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="5" r="2" fill="currentColor" />
                      <circle cx="12" cy="12" r="2" fill="currentColor" />
                      <circle cx="12" cy="19" r="2" fill="currentColor" />
                    </svg>
                  </button>
                )}
                <ChartCanvas
                  width={resizeWidth ? clampedWidth : svgWidth || "100%"}
                  height={clampedHeight}
                  margins={effectiveMargins}
                  ariaLabel={ariaLabel}
                  onMouseMove={e => {
                    setMousePos({ plotX: e.plotX, plotY: e.plotY });
                    if (onCrosshairChange) {
                      // Snap to nearest data X for aligned crosshair across panels
                      const [d0, d1] = xScale.domain();
                      const [r0, r1] = xScale.range();
                      const rawX =
                        d0 + ((e.plotX - r0) / (r1 - r0)) * (d1 - d0);
                      // Find nearest X value in visible series
                      let nearest = rawX;
                      let minDist = Infinity;
                      for (const s of visibleSeries) {
                        for (const p of s.data) {
                          const dist = Math.abs(p.x - rawX);
                          if (dist < minDist) {
                            minDist = dist;
                            nearest = p.x;
                          }
                        }
                      }
                      onCrosshairChange(nearest);
                    }
                  }}
                  onMouseLeave={() => {
                    setMousePos(null);
                    if (onCrosshairChange) onCrosshairChange(null);
                  }}
                >
                  {/* Y Axes */}
                  {(() => {
                    const rendered: React.ReactNode[] = [];
                    let hasLeftAxis = false;
                    let gridAssigned = false;

                    yAxes.forEach((ax, axIdx) => {
                      const id = ax.id ?? "default";
                      const hasVis = visibleSeries.some(
                        s => (s.yAxisId ?? "default") === id
                      );
                      const othersHave = yAxes.some(
                        (a, i) =>
                          i !== axIdx &&
                          visibleSeries.some(
                            s =>
                              (s.yAxisId ?? "default") === (a.id ?? "default")
                          )
                      );
                      if (!hasVis && othersHave) return;

                      const side = ax.side ?? (axIdx === 0 ? "left" : "right");
                      if (side === "left") hasLeftAxis = true;
                      const orientation = side === "right" ? "right" : "left";
                      const scale = yScales[id] ?? yScale;
                      // Grid only on left axes
                      const shouldShowGrid =
                        side === "left" &&
                        !gridAssigned &&
                        (ax.showGrid ?? showGrid);
                      if (shouldShowGrid) gridAssigned = true;
                      const axCfg: ChartAxisConfig = {
                        ...ax,
                        showGrid: shouldShowGrid,
                      };

                      const visibleAxesBefore = yAxes
                        .slice(0, axIdx)
                        .filter((a, ai) => {
                          const aId = a.id ?? "default";
                          const aSide = a.side ?? (ai === 0 ? "left" : "right");
                          if (aSide !== side) return false;
                          const aHas = visibleSeries.some(
                            s => (s.yAxisId ?? "default") === aId
                          );
                          const oHave = yAxes.some(
                            (o, oi) =>
                              oi !== ai &&
                              visibleSeries.some(
                                s =>
                                  (s.yAxisId ?? "default") ===
                                  (o.id ?? "default")
                              )
                          );
                          return aHas || !oHave;
                        }).length;
                      const offset = visibleAxesBefore * 60;

                      rendered.push(
                        <g
                          key={id}
                          transform={
                            side === "right"
                              ? `translate(${plotWidth + offset},0)`
                              : `translate(${-offset},0)`
                          }
                        >
                          <Axis
                            orientation={orientation}
                            scale={scale}
                            config={axCfg}
                            plotWidth={Math.max(plotWidth, 0)}
                            plotHeight={Math.max(plotHeight, 0)}
                          />
                        </g>
                      );
                    });

                    // If no left axis is visible, render a ghost left axis (line + grid only)
                    if (!hasLeftAxis && rendered.length > 0) {
                      const firstVisibleScale =
                        yScales[
                          yAxes.find(a =>
                            visibleSeries.some(
                              s =>
                                (s.yAxisId ?? "default") === (a.id ?? "default")
                            )
                          )?.id ?? "default"
                        ] ?? yScale;
                      rendered.unshift(
                        <g key="__ghost-left">
                          <Axis
                            orientation="left"
                            scale={firstVisibleScale}
                            config={{ showGrid: showGrid }}
                            plotWidth={Math.max(plotWidth, 0)}
                            plotHeight={Math.max(plotHeight, 0)}
                            hideLabels
                          />
                        </g>
                      );
                    }

                    return rendered;
                  })()}

                  {/* X Axis */}
                  <Axis
                    orientation="bottom"
                    scale={xScale}
                    config={xAxisCfg}
                    plotWidth={Math.max(plotWidth, 0)}
                    plotHeight={Math.max(plotHeight, 0)}
                  />

                  {/* Shaded areas */}
                  {shadedAreas?.map(area => (
                    <ShadedArea
                      key={area.id}
                      area={area}
                      xScale={xScale}
                      yScale={yScale}
                      plotHeight={Math.max(plotHeight, 0)}
                    />
                  ))}

                  {/* Chart content */}
                  <g clipPath="url(#k-chart-clip)">{children(ctx)}</g>

                  {/* Constants */}
                  {constants?.map(c => (
                    <ConstantLine
                      key={c.id}
                      constant={c}
                      xScale={xScale}
                      yScale={yScale}
                      plotWidth={Math.max(plotWidth, 0)}
                      plotHeight={Math.max(plotHeight, 0)}
                    />
                  ))}

                  {/* Annotations */}
                  {annotations?.map(a => (
                    <Annotation
                      key={a.id}
                      annotation={a}
                      xScale={xScale}
                      yScale={yScale}
                      plotWidth={Math.max(plotWidth, 0)}
                      plotHeight={Math.max(plotHeight, 0)}
                    />
                  ))}

                  {/* Arrow marker definition for annotations */}
                  {annotations && annotations.length > 0 && (
                    <defs>
                      <marker
                        id="k-annotation-arrow"
                        viewBox="0 0 10 10"
                        refX={10}
                        refY={5}
                        markerWidth={6}
                        markerHeight={6}
                        orient="auto-start-reverse"
                      >
                        <path
                          d="M 0 0 L 10 5 L 0 10 Z"
                          fill="var(--kreati-chart-text)"
                        />
                      </marker>
                    </defs>
                  )}

                  {/* Crosshair */}
                  {showCrosshair && mousePos && (
                    <Crosshair
                      x={mousePos.plotX}
                      y={mousePos.plotY}
                      plotWidth={Math.max(plotWidth, 0)}
                      plotHeight={Math.max(plotHeight, 0)}
                    />
                  )}
                  {/* Synced crosshair from ChartGroup */}
                  {syncCrosshairX != null && !mousePos && (
                    <Crosshair
                      x={xScale(syncCrosshairX)}
                      y={0}
                      plotWidth={Math.max(plotWidth, 0)}
                      plotHeight={Math.max(plotHeight, 0)}
                    />
                  )}

                  {/* Zoom selection rectangle */}
                  {!hideSelection && selectStart && selectCurrent && (
                    <rect
                      className="k-chart-zoom-select"
                      x={Math.min(selectStart.x, selectCurrent.x)}
                      y={Math.min(selectStart.y, selectCurrent.y)}
                      width={Math.abs(selectCurrent.x - selectStart.x)}
                      height={Math.abs(selectCurrent.y - selectStart.y)}
                      pointerEvents="none"
                    />
                  )}
                </ChartCanvas>
                {/* Inside legend overlay */}
                {isInsideLegend && legend && (
                  <div
                    className={`k-chart-legend--inside k-chart-legend--${legendPosition}`}
                    style={
                      {
                        "--k-chart-margin-left": `${effectiveMargins.left}px`,
                      } as React.CSSProperties
                    }
                  >
                    {legend}
                  </div>
                )}
                {/* Range navigator — inside position */}
                {showNavigator &&
                  navigatorPosition === "inside" &&
                  svgWidth > 0 && (
                    <div
                      className={`k-chart-navigator-wrap k-chart-navigator-wrap--inside ${isNavVisible ? "k-chart-navigator-wrap--visible" : ""}`}
                      onMouseEnter={() => {
                        setNavVisible(true);
                        if (navTimerRef.current)
                          clearTimeout(navTimerRef.current);
                      }}
                      onMouseLeave={() => {
                        if (navigatorVisibility === "auto")
                          navTimerRef.current = setTimeout(
                            () => setNavVisible(false),
                            3500
                          );
                      }}
                    >
                      <ChartNavigator
                        series={series}
                        xDomain={fullXDomain}
                        yDomain={fullYDomain}
                        rangeFraction={navigatorRange}
                        onRangeChange={handleNavigatorChange}
                        width={svgWidth}
                        height={navigatorHeight}
                        palette={palette}
                      />
                    </div>
                  )}
              </div>
            );
            return contextMenuRender ? (
              contextMenuRender(defaultItems, handleMenuSelect, svgWrapContent)
            ) : (
              <ContextMenu
                items={defaultItems}
                trigger="contextmenu"
                onItemSelect={(key: string) => handleMenuSelect(key)}
                disabled={!hasMenu}
                style={{ flex: 1 }}
              >
                {svgWrapContent}
              </ContextMenu>
            );
          })()}
          {legendPosition === "right" && legend}
        </div>
        {legendPosition === "bottom" && legend}

        {/* Range navigator — bottom position */}
        {showNavigator && navigatorPosition === "bottom" && svgWidth > 0 && (
          <div
            className={`k-chart-navigator-wrap ${isNavVisible ? "k-chart-navigator-wrap--visible" : ""}`}
            onMouseEnter={() => {
              setNavVisible(true);
              if (navTimerRef.current) clearTimeout(navTimerRef.current);
            }}
            onMouseLeave={() => {
              if (navigatorVisibility === "auto")
                navTimerRef.current = setTimeout(
                  () => setNavVisible(false),
                  3500
                );
            }}
          >
            <ChartNavigator
              series={series}
              xDomain={fullXDomain}
              yDomain={fullYDomain}
              rangeFraction={navigatorRange}
              onRangeChange={handleNavigatorChange}
              width={svgWidth}
              height={navigatorHeight}
              palette={palette}
            />
          </div>
        )}

        {/* Accessible data table for screen readers */}
        <table
          className="k-sr-only"
          role="table"
          aria-label={`${title ?? "Chart"} data`}
        >
          <thead>
            <tr>
              <th scope="col">{xAxisConfig?.label ?? "X"}</th>
              {visibleSeries.map(s => (
                <th key={s.id} scope="col">
                  {s.name}
                  {s.unit ? ` (${s.unit})` : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(() => {
              const maxLen = Math.max(
                ...visibleSeries.map(s => s.data.length),
                0
              );
              const rows: React.ReactNode[] = [];
              for (let i = 0; i < maxLen; i++) {
                const xVal = visibleSeries[0]?.data[i]?.x;
                const xLabel =
                  xAxisConfig?.categories?.[xVal ?? i] ?? String(xVal ?? i);
                rows.push(
                  <tr key={i}>
                    <td>{xLabel}</td>
                    {visibleSeries.map(s => (
                      <td key={s.id}>{s.data[i]?.y ?? ""}</td>
                    ))}
                  </tr>
                );
              }
              return rows;
            })()}
          </tbody>
        </table>

        {/* Resize handles */}
        {canResizeV && (
          <div
            className="k-cartesian-chart__resize-handle k-cartesian-chart__resize-handle--bottom"
            onMouseDown={e => handleResizeStart("vertical", e)}
            role="separator"
            aria-orientation="horizontal"
            aria-label="Resize chart height"
          />
        )}
        {canResizeH && (
          <div
            className="k-cartesian-chart__resize-handle k-cartesian-chart__resize-handle--right"
            onMouseDown={e => handleResizeStart("horizontal", e)}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize chart width"
          />
        )}
        {canResizeV && canResizeH && (
          <div
            className="k-cartesian-chart__resize-handle k-cartesian-chart__resize-handle--corner"
            onMouseDown={e => handleResizeStart("both", e)}
            role="separator"
            aria-label="Resize chart"
          />
        )}
      </div>
    );
  }
);

CartesianChart.displayName = "CartesianChart";
