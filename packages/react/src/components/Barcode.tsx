import React, {
  useImperativeHandle,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  type BarcodeFormat,
  type BarcodeData,
  encodeBarcode,
} from "./barcode/encoders";
import { sanitizeCssValue } from "./sanitizeUrl";
import { useKreatiLocale } from "../locale";
import "./Barcode.css";

export type { BarcodeFormat } from "./barcode/encoders";

export interface BarcodeProps {
  /** The data to encode */
  value: string;
  /** Barcode format. Default "code128" */
  format?: BarcodeFormat;
  /** Width of the SVG in pixels */
  width?: number;
  /** Height of the SVG in pixels */
  height?: number;
  /** Show human-readable text below the barcode */
  showText?: boolean;
  /** Font size for the text in pixels */
  textSize?: number;
  /** Foreground color (bars) */
  fgColor?: string;
  /** Background color */
  bgColor?: string;
  /** Quiet zone (margin) in pixels on each side */
  quietZone?: number;
  /** Accessible label for screen readers */
  ariaLabel?: string;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/** Imperative handle for Barcode export operations */
export interface BarcodeRef {
  /** Export the barcode as a data URL (PNG or JPEG) */
  toDataURL: (format?: "png" | "jpeg", quality?: number) => Promise<string>;
  /** Export the barcode as an SVG string */
  toSvgString: () => string;
}

/**
 * Barcode generator component.
 *
 * @description Renders a barcode as an SVG element. Supports Code128 (auto
 * subset selection), EAN-13, EAN-8, UPC-A, and Code39 formats. Includes
 * optional human-readable text, customizable colors, quiet zone, and
 * imperative ref for exporting as PNG or SVG string.
 *
 * Built from scratch — no external dependencies.
 *
 * @example
 * ```tsx
 * <Barcode value="Hello World" />
 * <Barcode value="5901234123457" format="ean13" />
 * <Barcode value="96385074" format="code39" />
 * ```
 */
export const Barcode = ({
  value,
  format = "code128",
  width = 200,
  height = 80,
  showText = true,
  textSize = 14,
  fgColor,
  bgColor,
  quietZone = 10,
  ariaLabel,
  className = "",
  style,
  ref,
}: BarcodeProps & { ref?: React.Ref<BarcodeRef> }) => {
  const locale = useKreatiLocale();
  const svgRef = useRef<SVGSVGElement>(null);

  const encoded = useMemo((): BarcodeData | null => {
    if (!value) return null;
    try {
      return encodeBarcode(value, format);
    } catch {
      return null;
    }
  }, [value, format]);

  /** Resolve CSS variables to computed values for export */
  const resolveColor = useCallback((color: string): string => {
    if (!color.startsWith("var(") || !svgRef.current) return color;
    return (
      getComputedStyle(svgRef.current)
        .getPropertyValue(color.slice(4, -1).trim())
        .trim() || "#000000"
    );
  }, []);

  const getSvgString = useCallback((): string => {
    if (!svgRef.current) return "";
    const clone = svgRef.current.cloneNode(true) as SVGSVGElement;
    clone.querySelectorAll("[fill]").forEach(el => {
      const fill = el.getAttribute("fill") || "";
      if (fill.startsWith("var(")) el.setAttribute("fill", resolveColor(fill));
    });
    return new XMLSerializer().serializeToString(clone);
  }, [resolveColor]);

  useImperativeHandle(
    ref,
    () => ({
      toSvgString: getSvgString,
      toDataURL: (fmt = "png", quality = 1) =>
        new Promise<string>((resolve, reject) => {
          const svgStr = getSvgString();
          if (!svgStr) {
            reject(new Error("SVG element not available"));
            return;
          }
          const blob = new Blob([svgStr], {
            type: "image/svg+xml;charset=utf-8",
          });
          const url = URL.createObjectURL(blob);
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const scale = 2;
            canvas.width = width * scale;
            canvas.height = height * scale;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              URL.revokeObjectURL(url);
              reject(new Error("Canvas context not available"));
              return;
            }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL(`image/${fmt}`, quality));
          };
          img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Failed to load SVG for export"));
          };
          img.src = url;
        }),
    }),
    [getSvgString, width, height]
  );

  if (!encoded) return null;

  const { bars, text } = encoded;
  const resolvedFg = sanitizeCssValue(fgColor) || "var(--kreati-barcode-fg)";
  const resolvedBg = sanitizeCssValue(bgColor) || "var(--kreati-barcode-bg)";

  // Calculate total units
  const totalUnits = bars.reduce((sum, b) => sum + Math.abs(b), 0);
  const barAreaWidth = width - quietZone * 2;
  const textHeight = showText ? textSize + 4 : 0;
  const barHeight = height - textHeight;
  const unitWidth = barAreaWidth / totalUnits;

  const base = "k-barcode";
  const classes = [base, className].filter(Boolean).join(" ");

  // Build bar rects
  const rects: React.ReactNode[] = [];
  let x = quietZone;
  for (let i = 0; i < bars.length; i++) {
    const w = Math.abs(bars[i]) * unitWidth;
    if (bars[i] > 0) {
      rects.push(
        <rect
          key={i}
          x={x}
          y={0}
          width={w}
          height={barHeight}
          fill={resolvedFg}
        />
      );
    }
    x += w;
  }

  return (
    <svg
      ref={svgRef}
      className={classes}
      style={style}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel || `${locale.barcode.label}: ${value}`}
    >
      <title>{ariaLabel || `${locale.barcode.label}: ${value}`}</title>
      <rect width={width} height={height} fill={resolvedBg} />
      {rects}
      {showText && (
        <text
          x={width / 2}
          y={height - 2}
          textAnchor="middle"
          className={`${base}__text`}
          fill={resolvedFg}
          fontSize={textSize}
        >
          {text}
        </text>
      )}
    </svg>
  );
};
