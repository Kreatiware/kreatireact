import React, {
  useImperativeHandle,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { sanitizeUrl } from "./sanitizeUrl";
import {
  PLUS_PATH,
  MINUS_PATH,
  MAXIMIZE_PATH,
  RESTORE_PATH,
  DOWNLOAD_PATH,
  PRINT_PATH,
  REFRESH_PATH,
  ROTATE_PATH,
} from "./iconPaths";
import { useKreatiLocale } from "../locale";
import "./DocumentViewer.css";

/** Supported document types */
export type DocumentType = "pdf" | "image" | "text";

export interface DocumentViewerProps {
  /** URL of the document to display. Sanitized against unsafe protocols */
  src: string;
  /** Document type. Auto-detected from src extension if not provided */
  type?: DocumentType;
  /** Title displayed in the toolbar */
  title?: string;
  /** Width of the viewer */
  width?: number | string;
  /** Height of the viewer */
  height?: number | string;
  /** Show the toolbar. Default true */
  showToolbar?: boolean;
  /** Allow downloading the document. Default true */
  allowDownload?: boolean;
  /** Allow printing the document. Default true */
  allowPrint?: boolean;
  /** Initial zoom level (1 = 100%). Only applies to image type */
  initialZoom?: number;
  /** Plain text content (alternative to src for text type) */
  textContent?: string;
  /** Show line numbers for text type. Default false */
  lineNumbers?: boolean;
  /** Accessible label for screen readers */
  ariaLabel?: string;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/** Imperative handle for DocumentViewer */
export interface DocumentViewerRef {
  /** Set the zoom level (image mode only) */
  setZoom: (zoom: number) => void;
  /** Reset zoom to fit */
  resetZoom: () => void;
  /** Toggle fullscreen */
  toggleFullscreen: () => void;
}

/** Detect document type from URL extension */
const detectType = (src: string): DocumentType => {
  const ext = src.split("?")[0].split(".").pop()?.toLowerCase() || "";
  if (ext === "pdf") return "pdf";
  if (["png", "jpg", "jpeg", "gif", "svg", "webp", "bmp", "ico"].includes(ext))
    return "image";
  return "text";
};

const IconBtn = ({
  path,
  label,
  onClick,
  disabled,
}: {
  path: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    className="k-docviewer__btn"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    title={label}
    type="button"
  >
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d={path} fill="currentColor" />
    </svg>
  </button>
);

/**
 * Document viewer component.
 *
 * @description A unified viewer for PDFs, images, and text content.
 * PDFs render in an iframe with native browser controls. Images support
 * zoom (wheel + buttons), pan (drag), and rotate. Text content renders
 * with optional line numbers. Includes a toolbar with zoom, fullscreen,
 * download, and print controls that adapt to the document type.
 *
 * Built from scratch — no external dependencies.
 *
 * @example
 * ```tsx
 * <DocumentViewer src="/report.pdf" title="Annual Report" />
 * <DocumentViewer src="/photo.jpg" />
 * <DocumentViewer type="text" textContent="Hello World" lineNumbers />
 * ```
 */
export const DocumentViewer = ({
  src,
  type,
  title,
  width = "100%",
  height = 500,
  showToolbar = true,
  allowDownload = true,
  allowPrint = true,
  initialZoom = 1,
  textContent,
  lineNumbers = false,
  ariaLabel,
  className = "",
  style,
  ref,
}: DocumentViewerProps & { ref?: React.Ref<DocumentViewerRef> }) => {
  const locale = useKreatiLocale();
  const t = locale.documentViewer;
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const safeSrc = sanitizeUrl(src);
  const resolvedType = type || (textContent ? "text" : detectType(safeSrc));

  const resetView = useCallback(() => {
    setZoom(initialZoom);
    setPan({ x: 0, y: 0 });
    setRotation(0);
  }, [initialZoom]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      setZoom: (z: number) => setZoom(Math.max(0.1, Math.min(10, z))),
      resetZoom: resetView,
      toggleFullscreen,
    }),
    [resetView, toggleFullscreen]
  );

  // Image zoom via wheel
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (resolvedType !== "image") return;
      e.preventDefault();
      setZoom(z => Math.max(0.1, Math.min(10, z - e.deltaY * 0.001)));
    },
    [resolvedType]
  );

  // Image pan via drag
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (resolvedType !== "image" || zoom <= 1) return;
      setIsDragging(true);
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
    },
    [resolvedType, zoom, pan]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPan({
        x: dragStart.current.panX + (e.clientX - dragStart.current.x),
        y: dragStart.current.panY + (e.clientY - dragStart.current.y),
      });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleDownload = useCallback(() => {
    if (!safeSrc) return;
    const a = document.createElement("a");
    a.href = safeSrc;
    a.download = title || safeSrc.split("/").pop() || "document";
    a.rel = "noopener noreferrer";
    a.click();
  }, [safeSrc, title]);

  const handlePrint = useCallback(() => {
    const w = window.open("", "_blank");
    if (!w) return;
    if (resolvedType === "pdf" && safeSrc) {
      w.location.href = safeSrc;
      w.addEventListener("load", () => {
        w.print();
      });
    } else {
      const doc = w.document;
      const safeTitle = (title || t.print).replace(/[<>&"]/g, "");
      doc.title = safeTitle;
      doc.body.style.margin = "1rem";
      if (resolvedType === "image" && safeSrc) {
        const img = doc.createElement("img");
        img.src = safeSrc;
        img.style.maxWidth = "100%";
        img.style.height = "auto";
        img.alt = safeTitle;
        doc.body.appendChild(img);
      } else {
        const pre = doc.createElement("pre");
        pre.style.fontFamily = "monospace";
        pre.style.whiteSpace = "pre";
        pre.style.fontSize = "14px";
        pre.textContent = textContent || "";
        doc.body.appendChild(pre);
      }
      w.addEventListener("load", () => {
        w.print();
      });
    }
  }, [resolvedType, safeSrc, textContent, title]);

  const base = "k-docviewer";
  const classes = [base, isFullscreen && `${base}--fullscreen`, className]
    .filter(Boolean)
    .join(" ");

  const zoomPct = Math.round(zoom * 100);

  // Text content with optional line numbers
  const renderText = () => {
    const content = textContent || "";
    const lines = content.split("\n");
    return (
      <div className={`${base}__text`}>
        {lineNumbers && (
          <div className={`${base}__line-numbers`} aria-hidden="true">
            {lines.map((_, i) => (
              <span key={i}>{i + 1}</span>
            ))}
          </div>
        )}
        <pre className={`${base}__text-content`}>
          <code>{content}</code>
        </pre>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={classes}
      style={{ width, height, ...style }}
      role="document"
      aria-label={ariaLabel || title || t.viewerLabel}
    >
      {showToolbar && (
        <div
          className={`${base}__toolbar`}
          role="toolbar"
          aria-label={t.controls}
        >
          {title && <span className={`${base}__title`}>{title}</span>}
          <div className={`${base}__actions`}>
            {resolvedType === "image" && (
              <>
                <IconBtn
                  path={MINUS_PATH}
                  label={t.zoomOut}
                  onClick={() => setZoom(z => Math.max(0.1, z - 0.25))}
                />
                <span className={`${base}__zoom-label`}>{zoomPct}%</span>
                <IconBtn
                  path={PLUS_PATH}
                  label={t.zoomIn}
                  onClick={() => setZoom(z => Math.min(10, z + 0.25))}
                />
                <IconBtn
                  path={ROTATE_PATH}
                  label={t.rotate}
                  onClick={() => setRotation(r => (r + 90) % 360)}
                />
                <IconBtn
                  path={REFRESH_PATH}
                  label={t.resetView}
                  onClick={resetView}
                />
              </>
            )}
            {allowDownload && safeSrc && resolvedType !== "text" && (
              <IconBtn
                path={DOWNLOAD_PATH}
                label={t.download}
                onClick={handleDownload}
              />
            )}
            {allowPrint && (
              <IconBtn
                path={PRINT_PATH}
                label={t.print}
                onClick={handlePrint}
              />
            )}
            <IconBtn
              path={isFullscreen ? RESTORE_PATH : MAXIMIZE_PATH}
              label={isFullscreen ? t.exitFullscreen : t.fullscreen}
              onClick={toggleFullscreen}
            />
          </div>
        </div>
      )}

      <div
        className={`${base}__content`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          cursor:
            resolvedType === "image" && zoom > 1
              ? isDragging
                ? "grabbing"
                : "grab"
              : undefined,
        }}
      >
        {resolvedType === "pdf" && safeSrc && (
          <iframe
            className={`${base}__iframe`}
            src={safeSrc}
            title={title || t.viewerLabel}
            sandbox="allow-same-origin allow-scripts allow-popups"
          />
        )}

        {resolvedType === "image" && safeSrc && (
          <img
            ref={imgRef}
            className={`${base}__image`}
            src={safeSrc}
            alt={title || t.viewerLabel}
            draggable={false}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            }}
          />
        )}

        {resolvedType === "text" && renderText()}

        {!safeSrc && !textContent && (
          <div className={`${base}__empty`}>{t.noDocument}</div>
        )}
      </div>
    </div>
  );
};
