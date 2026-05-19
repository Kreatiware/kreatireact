import React, {
  useImperativeHandle,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { type ECLevel } from "./qr/tables";
import { detectMode, getMinVersion, encodeData } from "./qr/encode";
import { computeEC } from "./qr/errorCorrection";
import { buildMatrix } from "./qr/matrix";
import { sanitizeUrl, sanitizeCssValue } from "./sanitizeUrl";
import { useKreatiLocale } from "../locale";
import "./QRCode.css";

export interface QRCodeProps {
  /** The data to encode in the QR code */
  value: string;
  /** Error correction level. Higher levels allow more damage but increase size */
  ecLevel?: ECLevel;
  /** Size of the SVG in pixels */
  size?: number;
  /** Foreground color (modules) */
  fgColor?: string;
  /** Background color */
  bgColor?: string;
  /** Module corner radius (0 = square, 0.5 = circle) as fraction of module size */
  moduleRadius?: number;
  /** Quiet zone (margin) in number of modules. QR spec recommends 4 */
  quietZone?: number;
  /** Image URL to render as a centered logo. Sanitized against unsafe protocols. Requires ecLevel "H" for best results */
  imageSrc?: string;
  /** Alt text for the imageSrc logo */
  imageAlt?: string;
  /** Custom content to render in the center of the QR code. Takes precedence over imageSrc */
  logo?: React.ReactNode;
  /** Logo area size as fraction of the QR code (0-0.3). Default 0.2 */
  logoSize?: number;
  /** Logo background color. Default matches bgColor */
  logoBgColor?: string;
  /** Logo area corner radius in pixels */
  logoRadius?: number;
  /** Accessible label for screen readers */
  ariaLabel?: string;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/** Imperative handle for QRCode export operations */
export interface QRCodeRef {
  /** Export the QR code as a data URL (PNG or JPEG) */
  toDataURL: (format?: "png" | "jpeg", quality?: number) => Promise<string>;
  /** Export the QR code as an SVG string */
  toSvgString: () => string;
}

/**
 * QR Code generator component.
 *
 * @description Renders a QR code as an SVG element with full customization:
 * colors, module shape, quiet zone, and optional center logo. Supports all
 * 40 QR versions with automatic version selection, 4 error correction levels,
 * and numeric/alphanumeric/byte encoding modes. Includes imperative ref for
 * exporting as PNG or SVG string.
 *
 * Built from scratch — Reed-Solomon error correction over GF(256),
 * no external dependencies.
 *
 * @example
 * ```tsx
 * <QRCode value="https://kreatiware.com" />
 * <QRCode value="Hello" ecLevel="H" imageSrc="/logo.png" />
 * <QRCode value="Hello" ecLevel="H" moduleRadius={0.5} fgColor="var(--kreati-primary-600)" />
 * ```
 */
export const QRCode = ({
  value,
  ecLevel = "M",
  size = 200,
  fgColor,
  bgColor,
  moduleRadius = 0,
  quietZone = 4,
  imageSrc,
  imageAlt = "",
  logo,
  logoSize = 0.2,
  logoBgColor,
  logoRadius = 0,
  ariaLabel,
  className = "",
  style,
  ref,
}: QRCodeProps & { ref?: React.Ref<QRCodeRef> }) => {
  const locale = useKreatiLocale();
  const svgRef = useRef<SVGSVGElement>(null);

  const matrix = useMemo(() => {
    if (!value) return [];
    const mode = detectMode(value);
    const version = getMinVersion(value, mode, ecLevel);
    const dataCodewords = encodeData(value, mode, version, ecLevel);
    const allCodewords = computeEC(dataCodewords, version, ecLevel);
    return buildMatrix(allCodewords, version, ecLevel);
  }, [value, ecLevel]);

  const moduleCount = matrix.length;
  const totalModules = moduleCount + quietZone * 2;

  // Sanitize imageSrc against unsafe protocols
  const safeImageSrc = imageSrc ? sanitizeUrl(imageSrc) : "";
  const hasLogo = !!(logo || safeImageSrc);

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
      toDataURL: (format = "png", quality = 1) =>
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
            canvas.width = size * scale;
            canvas.height = size * scale;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              URL.revokeObjectURL(url);
              reject(new Error("Canvas context not available"));
              return;
            }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL(`image/${format}`, quality));
          };
          img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Failed to load SVG for export"));
          };
          img.src = url;
        }),
    }),
    [getSvgString, size]
  );

  if (!value || moduleCount === 0) return null;

  const cellSize = size / totalModules;
  const r = Math.max(0, Math.min(0.5, moduleRadius)) * cellSize;

  // Build a single <path> for all dark modules
  const pathParts: string[] = [];
  const logoExclusion = hasLogo ? logoSize * moduleCount * 0.5 : 0;
  const center = moduleCount / 2;

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!matrix[row][col]) continue;

      if (
        hasLogo &&
        Math.abs(row - center) < logoExclusion &&
        Math.abs(col - center) < logoExclusion
      ) {
        continue;
      }

      const x = (col + quietZone) * cellSize;
      const y = (row + quietZone) * cellSize;

      if (r > 0) {
        pathParts.push(
          `M${x + r},${y}` +
            `h${cellSize - 2 * r}` +
            `a${r},${r},0,0,1,${r},${r}` +
            `v${cellSize - 2 * r}` +
            `a${r},${r},0,0,1,${-r},${r}` +
            `h${-(cellSize - 2 * r)}` +
            `a${r},${r},0,0,1,${-r},${-r}` +
            `v${-(cellSize - 2 * r)}` +
            `a${r},${r},0,0,1,${r},${-r}Z`
        );
      } else {
        pathParts.push(`M${x},${y}h${cellSize}v${cellSize}h${-cellSize}Z`);
      }
    }
  }

  const resolvedFg = sanitizeCssValue(fgColor) || "var(--kreati-qr-fg)";
  const resolvedBg = sanitizeCssValue(bgColor) || "var(--kreati-qr-bg)";
  const resolvedLogoBg = sanitizeCssValue(logoBgColor) || resolvedBg;

  const logoAreaPx = logoSize * size;
  const logoOffset = (size - logoAreaPx) / 2;

  // Resolve logo content: explicit logo prop takes precedence over imageSrc
  const logoContent =
    logo ||
    (safeImageSrc ? (
      <img src={safeImageSrc} alt={imageAlt} className="k-qrcode__logo-img" />
    ) : null);

  const base = "k-qrcode";
  const classes = [base, className].filter(Boolean).join(" ");

  return (
    <svg
      ref={svgRef}
      className={classes}
      style={style}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel || `${locale.qrCode.label}: ${value}`}
    >
      <title>{ariaLabel || `${locale.qrCode.label}: ${value}`}</title>
      <rect width={size} height={size} fill={resolvedBg} />
      <path d={pathParts.join("")} fill={resolvedFg} />
      {logoContent && (
        <>
          <rect
            x={logoOffset}
            y={logoOffset}
            width={logoAreaPx}
            height={logoAreaPx}
            rx={logoRadius}
            ry={logoRadius}
            fill={resolvedLogoBg}
          />
          <foreignObject
            x={logoOffset}
            y={logoOffset}
            width={logoAreaPx}
            height={logoAreaPx}
          >
            <div
              className={`${base}__logo`}
              style={{
                width: logoAreaPx,
                height: logoAreaPx,
                borderRadius: logoRadius > 0 ? logoRadius : undefined,
              }}
            >
              {logoContent}
            </div>
          </foreignObject>
        </>
      )}
    </svg>
  );
};
