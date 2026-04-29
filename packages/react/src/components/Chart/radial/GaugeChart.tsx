import React, {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { arcPath } from "../core/arc";
import type { ChartSeverity } from "../core/types";
import { exportPng, exportSvg } from "../core/export";
import { ContextMenu } from "../../ContextMenu";
import type { MenuItem } from "../../../types/navigation";
import { useKreatiLocale } from "../../../locale/KreatiProvider";
import "../Chart.css";

// ─── Types ──────────────────────────────────────────────────────────────────

/** A color zone for the Gauge arc. */
export interface GaugeZone {
  /** Start value of the zone. */
  from: number;
  /** End value of the zone. */
  to: number;
  /** Zone color. CSS variable or any valid CSS color. Required if severity is not set. */
  color?: string;
  /** Optional severity shortcut (overrides color). */
  severity?: ChartSeverity;
  /** Label displayed inside the zone arc. */
  label?: string;
}

/** Needle visual style. */
export type GaugeNeedleStyle = "classic" | "line" | "arrow";

/** Props for the GaugeChart component. */
export interface GaugeChartProps {
  /** Current value. */
  value: number;
  /** Minimum scale value. Default: 0 */
  min?: number;
  /** Maximum scale value. Default: 100 */
  max?: number;
  /** Color zones along the arc. When omitted, uses value + remaining. */
  zones?: GaugeZone[];
  /** Show needle indicator. Default: true */
  showNeedle?: boolean;
  /** Needle visual style. Default: "classic" */
  needleStyle?: GaugeNeedleStyle;
  /** Needle color. Default: "var(--kreati-chart-text)" */
  needleColor?: string;
  /** Custom needle render. Receives cx, cy, angle (radians), outerR, innerR. */
  needleRender?: (
    cx: number,
    cy: number,
    angle: number,
    outerR: number,
    innerR: number
  ) => React.ReactNode;
  /** Show value label near the needle tip. Default: false */
  showNeedleLabel?: boolean;
  /** Show the value display. Default: true */
  showValue?: boolean;
  /** Value display position. Default: "bottom" */
  valuePosition?: "center" | "bottom";
  /** Label displayed below the value. */
  label?: string;
  /** Format the value display. */
  valueFormat?: (value: number) => string;
  /** Unit suffix (e.g. "%", "km/h"). */
  unit?: string;
  /** Show zone labels inside the arc. Default: false */
  showZoneLabels?: boolean;
  /** Show min/max labels at arc extremes. Default: true */
  showMinMax?: boolean;
  /** Arc thickness as inner radius ratio (0-1). Default: 0.7 */
  innerRadius?: number;
  /** Arc span in degrees. Default: 180 */
  arcSpan?: number;
  /** Chart width. When omitted, fills container. */
  width?: number;
  /** Chart height. Default: 220 */
  height?: number;
  /** Chart title. */
  title?: string;
  /** Chart subtitle. */
  subtitle?: string;
  /** Export formats. Default: [] */
  exportFormats?: ("png" | "svg" | "csv" | "json")[];
  /** Include title in exports. Default: true */
  exportTitle?: boolean;
  /** Show menu button. Default: "auto" */
  showMenuButton?: boolean | "auto";
  /** Additional context menu items. */
  contextMenuItems?: MenuItem[];
  /** Additional CSS class. */
  className?: string;
  /** Inline styles. */
  style?: React.CSSProperties;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const SEVERITY_COLORS: Record<ChartSeverity, string> = {
  primary: "var(--kreati-severity-primary)",
  secondary: "var(--kreati-severity-secondary)",
  success: "var(--kreati-severity-success)",
  info: "var(--kreati-severity-info)",
  warning: "var(--kreati-severity-warning)",
  help: "var(--kreati-severity-help)",
  danger: "var(--kreati-severity-danger)",
  accent: "var(--kreati-severity-accent)",
};

const DEG_TO_RAD = Math.PI / 180;

const ELLIPSIS_V =
  "M12 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4z";

// ─── Needle renderers ───────────────────────────────────────────────────────

const renderNeedle = (
  style: GaugeNeedleStyle,
  cx: number,
  cy: number,
  angle: number,
  outerR: number,
  innerR: number,
  color: string
): React.ReactNode => {
  const perpAngle = angle + Math.PI / 2;

  switch (style) {
    case "classic": {
      const tipX = cx + (outerR + 2) * Math.cos(angle);
      const tipY = cy + (outerR + 2) * Math.sin(angle);
      const baseR = 5;
      const bx1 = cx + baseR * Math.cos(perpAngle);
      const by1 = cy + baseR * Math.sin(perpAngle);
      const bx2 = cx - baseR * Math.cos(perpAngle);
      const by2 = cy - baseR * Math.sin(perpAngle);
      return (
        <>
          <path
            d={`M ${tipX} ${tipY} L ${bx1} ${by1} L ${bx2} ${by2} Z`}
            fill={color}
            className="k-gauge-needle__shape"
          />
          <circle cx={cx} cy={cy} r={6} fill={color} />
          <circle cx={cx} cy={cy} r={2.5} fill="var(--kreati-chart-bg)" />
        </>
      );
    }
    case "arrow": {
      // Small chevron sitting on the arc, pointing outward from center
      const tipR = outerR;
      const baseR = outerR - 12;
      const spread = 6;
      const tipX = cx + tipR * Math.cos(angle);
      const tipY = cy + tipR * Math.sin(angle);
      const bx1 = cx + baseR * Math.cos(angle) + spread * Math.cos(perpAngle);
      const by1 = cy + baseR * Math.sin(angle) + spread * Math.sin(perpAngle);
      const bx2 = cx + baseR * Math.cos(angle) - spread * Math.cos(perpAngle);
      const by2 = cy + baseR * Math.sin(angle) - spread * Math.sin(perpAngle);
      return (
        <path
          d={`M ${tipX} ${tipY} L ${bx1} ${by1} L ${bx2} ${by2} Z`}
          fill={color}
          className="k-gauge-needle__shape"
        />
      );
    }
    case "line":
    default: {
      const startX = cx + (innerR - 4) * Math.cos(angle);
      const startY = cy + (innerR - 4) * Math.sin(angle);
      const tipX = cx + (outerR + 2) * Math.cos(angle);
      const tipY = cy + (outerR + 2) * Math.sin(angle);
      return (
        <>
          <line
            x1={startX}
            y1={startY}
            x2={tipX}
            y2={tipY}
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r={4} fill={color} />
        </>
      );
    }
  }
};

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * GaugeChart — semicircular indicator with needle, color zones, and value display.
 * Independent SVG component using arc geometry from core/arc.ts.
 *
 * @example
 * ```tsx
 * <GaugeChart value={72} unit="%" zones={[
 *   { from: 0, to: 40, severity: "danger" },
 *   { from: 40, to: 70, severity: "warning" },
 *   { from: 70, to: 100, severity: "success" },
 * ]} />
 * ```
 */
export const GaugeChart = forwardRef<HTMLDivElement, GaugeChartProps>(
  (
    {
      value,
      min = 0,
      max = 100,
      zones,
      showNeedle = true,
      needleStyle = "classic",
      needleColor = "var(--kreati-chart-text)",
      needleRender,
      showNeedleLabel = false,
      showValue = true,
      valuePosition = "bottom",
      label,
      valueFormat,
      unit,
      showZoneLabels = false,
      showMinMax = true,
      innerRadius = 0.7,
      arcSpan = 180,
      width,
      height = 220,
      title,
      subtitle,
      exportFormats = [],
      exportTitle = true,
      showMenuButton = "auto",
      contextMenuItems,
      className = "",
      style,
    },
    ref
  ) => {
    const locale = useKreatiLocale();
    const t = locale.chart;
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(width ?? 400);

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

    const range = max - min;
    const clampedValue = Math.max(min, Math.min(max, value));
    const ratio = range > 0 ? (clampedValue - min) / range : 0;

    // Angles
    const halfSpan = arcSpan / 2;
    const startAngle = -90 - halfSpan;
    const endAngle = -90 + halfSpan;
    const startRad = startAngle * DEG_TO_RAD;
    const endRad = endAngle * DEG_TO_RAD;
    const needleAngleRad = (startAngle + ratio * arcSpan) * DEG_TO_RAD;

    // Geometry
    const chartW = width ?? containerWidth;
    const outerR = Math.min(chartW / 2, height) - 16;
    const innerR = outerR * Math.max(0, Math.min(1, innerRadius));
    const midR = innerR + (outerR - innerR) / 2;

    // Bounding box of the arc to minimize empty space
    const startCos = Math.cos(startRad);
    const startSin = Math.sin(startRad);
    const endCos = Math.cos(endRad);
    const endSin = Math.sin(endRad);

    // Sample points along the arc to find actual bounds
    const steps = 36;
    let minY = 0;
    let maxY = 0;
    for (let i = 0; i <= steps; i++) {
      const a = startRad + (endRad - startRad) * (i / steps);
      const sy = Math.sin(a);
      if (sy < minY) minY = sy;
      if (sy > maxY) maxY = sy;
    }

    const topExtent = -minY * outerR; // how far above center
    const bottomExtent = maxY * outerR; // how far below center
    const padding = showNeedleLabel ? 28 : 16;
    const svgH = topExtent + bottomExtent + padding * 2;
    const cx = chartW / 2;
    const cy = topExtent + padding;

    // Display value
    const displayValue = valueFormat
      ? valueFormat(clampedValue)
      : `${Number.isInteger(clampedValue) ? clampedValue : clampedValue.toFixed(1)}`;

    // Build zone arcs
    const zoneArcs = useMemo(() => {
      if (zones && zones.length > 0) {
        const sorted = [...zones].sort((a, b) => a.from - b.from);
        const arcs: {
          d: string;
          color: string;
          label?: string;
          midAngle: number;
        }[] = [];

        for (const z of sorted) {
          const size = z.to - z.from;
          if (size <= 0) continue;
          const zStartRatio = range > 0 ? (z.from - min) / range : 0;
          const zEndRatio = range > 0 ? (z.to - min) / range : 0;
          const sa = (startAngle + zStartRatio * arcSpan) * DEG_TO_RAD;
          const ea = (startAngle + zEndRatio * arcSpan) * DEG_TO_RAD;
          const color = z.severity
            ? SEVERITY_COLORS[z.severity]
            : z.color || "var(--kreati-gray-300)";
          arcs.push({
            d: arcPath(cx, cy, outerR, innerR, sa, ea),
            color,
            label: z.label,
            midAngle: (sa + ea) / 2,
          });
        }

        // Fill remaining
        const lastTo = sorted[sorted.length - 1]?.to ?? min;
        if (lastTo < max) {
          const sa =
            (startAngle + ((lastTo - min) / range) * arcSpan) * DEG_TO_RAD;
          arcs.push({
            d: arcPath(cx, cy, outerR, innerR, sa, endRad),
            color: "var(--kreati-gray-200)",
            midAngle: (sa + endRad) / 2,
          });
        }

        return arcs;
      }

      // No zones: value + remaining
      const valueEndRad = (startAngle + ratio * arcSpan) * DEG_TO_RAD;
      return [
        {
          d: arcPath(cx, cy, outerR, innerR, startRad, valueEndRad),
          color: "var(--kreati-severity-primary)",
          midAngle: (startRad + valueEndRad) / 2,
        },
        {
          d: arcPath(cx, cy, outerR, innerR, valueEndRad, endRad),
          color: "var(--kreati-gray-200)",
          midAngle: (valueEndRad + endRad) / 2,
        },
      ];
    }, [
      zones,
      cx,
      cy,
      outerR,
      innerR,
      startAngle,
      arcSpan,
      min,
      max,
      range,
      ratio,
      startRad,
      endRad,
    ]);

    // Export
    const handleMenuSelect = useCallback(
      (key: string) => {
        const svg = containerRef.current?.querySelector(
          "svg.k-gauge-svg"
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
          const rows = [["Value", "Min", "Max", "Unit"].join(";")];
          rows.push(
            [String(value), String(min), String(max), unit || ""].join(";")
          );
          const blob = new Blob([rows.join("\n")], {
            type: "text/csv;charset=utf-8",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "gauge.csv";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
        if (key === "export-json") {
          const obj = { value, min, max, unit: unit || "", label: label || "" };
          const blob = new Blob([JSON.stringify(obj, null, 2)], {
            type: "application/json",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "gauge.json";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      },
      [title, subtitle, exportTitle, value, min, max, unit, label]
    );

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
        className={`k-gauge-chart${className ? ` ${className}` : ""}`}
        style={style}
        role="meter"
        aria-label={title || "Gauge"}
        aria-valuenow={clampedValue}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={`${displayValue}${unit || ""}${label ? `, ${label}` : ""}`}
      >
        {(title || subtitle) && (
          <div className="k-chart-header">
            {title && <div className="k-chart-header__title">{title}</div>}
            {subtitle && (
              <div className="k-chart-header__subtitle">{subtitle}</div>
            )}
          </div>
        )}

        <div className="k-gauge-chart__inner">
          <svg
            className="k-gauge-svg k-chart"
            viewBox={`0 0 ${chartW} ${svgH}`}
            width={width ? chartW : "100%"}
            height={svgH}
            role="img"
            aria-hidden="true"
          >
            {/* Background track */}
            <path
              d={arcPath(cx, cy, outerR, innerR, startRad, endRad)}
              fill="var(--kreati-gray-100)"
              fillRule="evenodd"
            />

            {/* Zone arcs */}
            {zoneArcs.map((arc, i) => (
              <path key={i} d={arc.d} fill={arc.color} fillRule="evenodd" />
            ))}

            {/* Zone labels */}
            {showZoneLabels &&
              zoneArcs.map((arc, i) => {
                if (!arc.label) return null;
                const lx = cx + midR * Math.cos(arc.midAngle);
                const ly = cy + midR * Math.sin(arc.midAngle);
                return (
                  <text
                    key={`zl-${i}`}
                    x={lx}
                    y={ly}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="k-gauge-zone-label"
                  >
                    {arc.label}
                  </text>
                );
              })}

            {/* Needle */}
            {showNeedle && (
              <g className="k-gauge-needle">
                {needleRender
                  ? needleRender(cx, cy, needleAngleRad, outerR, innerR)
                  : renderNeedle(
                      needleStyle,
                      cx,
                      cy,
                      needleAngleRad,
                      outerR,
                      innerR,
                      needleColor
                    )}
              </g>
            )}

            {/* Needle label */}
            {showNeedleLabel &&
              (() => {
                const labelR = outerR + 14;
                const lx = cx + labelR * Math.cos(needleAngleRad);
                const ly = cy + labelR * Math.sin(needleAngleRad);
                const isRight = Math.cos(needleAngleRad) > 0.01;
                const isLeft = Math.cos(needleAngleRad) < -0.01;
                const anchor = isRight ? "start" : isLeft ? "end" : "middle";
                return (
                  <text
                    x={lx}
                    y={ly}
                    textAnchor={anchor}
                    dominantBaseline="central"
                    className="k-gauge-needle-label"
                  >
                    {displayValue}
                    {unit || ""}
                  </text>
                );
              })()}

            {/* Center value */}
            {showValue && valuePosition === "center" && (
              <foreignObject
                x={cx - innerR * 0.7}
                y={cy - innerR * 0.5}
                width={innerR * 1.4}
                height={innerR}
                pointerEvents="none"
              >
                <div className="k-gauge-center">
                  <div className="k-gauge-center__value">
                    {displayValue}
                    {unit && (
                      <span className="k-gauge-center__unit">{unit}</span>
                    )}
                  </div>
                  {label && (
                    <div className="k-gauge-center__label">{label}</div>
                  )}
                </div>
              </foreignObject>
            )}
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

        {/* Min/Max */}
        {showMinMax && (
          <div className="k-gauge-minmax">
            <span className="k-gauge-minmax__label">{min}</span>
            <span className="k-gauge-minmax__label">{max}</span>
          </div>
        )}

        {/* Bottom value */}
        {showValue && valuePosition === "bottom" && (
          <div className="k-gauge-bottom-value">
            <span className="k-gauge-center__value">
              {displayValue}
              {unit && <span className="k-gauge-center__unit">{unit}</span>}
            </span>
            {label && <span className="k-gauge-center__label">{label}</span>}
          </div>
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

GaugeChart.displayName = "GaugeChart";
