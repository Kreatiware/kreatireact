import React, {
  forwardRef,
  useRef,
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
} from "react";
import {
  TRIANGLE_UP_PATH,
  TRIANGLE_DOWN_PATH,
  TRIANGLE_LEFT_PATH,
  TRIANGLE_RIGHT_PATH,
} from "./iconPaths";
import "./ScrollBar.css";

export interface ScrollBarProps {
  /** Scroll direction */
  orientation?: "vertical" | "horizontal" | "both";
  /** Scrollbar variant: kreati (auto-hide), visible (always shown), native (browser default) */
  variant?: "kreati" | "visible" | "native";
  /** Scrollbar thickness */
  size?: "sm" | "md" | "lg";
  /** Thumb color */
  color?: string;
  /** Track color */
  trackColor?: string;
  /** Thumb border radius */
  thumbRadius?: string;
  /** Thumb gradient (overrides color) */
  gradient?: { from: string; to: string; angle?: number };
  /** Track gradient (overrides trackColor) */
  trackGradient?: { from: string; to: string; angle?: number };
  /** Custom content rendered behind the thumb inside the track */
  trackTemplate?: React.ReactNode;
  /** Custom icon/element rendered inside the thumb — replaces the solid bar */
  thumbIcon?: React.ReactNode;
  /** Show arrow buttons at ends */
  arrows?: boolean;
  /** Maximum height before vertical scroll activates */
  maxHeight?: string;
  /** Maximum width before horizontal scroll activates */
  maxWidth?: string;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Content */
  children: React.ReactNode;
}

const SIZE_MAP: Record<string, number> = { sm: 6, md: 8, lg: 12 };

/**
 * ScrollBar component with fully custom scrollbar rendering.
 *
 * @description A scrollable container that hides the native scrollbar and
 * renders a custom one using positioned divs. This gives full control over
 * appearance: no arrows by default, gradient support, auto-hide, and
 * consistent cross-browser rendering. Three variants: `kreati` (auto-hide,
 * default), `visible` (always shown), `native` (browser default).
 *
 * @example
 * ```tsx
 * <ScrollBar maxHeight="300px">
 *   <LongContent />
 * </ScrollBar>
 *
 * <ScrollBar variant="visible" color="#0f78a5" size="md">
 *   <LongContent />
 * </ScrollBar>
 *
 * <ScrollBar gradient={{ from: '#0f78a5', to: '#ffdb4f' }} size="lg">
 *   <LongContent />
 * </ScrollBar>
 * ```
 */
export const ScrollBar = forwardRef<HTMLDivElement, ScrollBarProps>(
  (
    {
      orientation = "vertical",
      variant = "kreati",
      size = "sm",
      color,
      trackColor,
      thumbRadius,
      gradient,
      trackGradient,
      trackTemplate,
      thumbIcon,
      arrows = false,
      maxHeight,
      maxWidth,
      className = "",
      style,
      children,
    },
    ref
  ) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const trackVRef = useRef<HTMLDivElement>(null);
    const thumbVRef = useRef<HTMLDivElement>(null);
    const thumbZoneVRef = useRef<HTMLDivElement>(null);
    const trackHRef = useRef<HTMLDivElement>(null);
    const thumbHRef = useRef<HTMLDivElement>(null);
    const thumbZoneHRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => wrapperRef.current as HTMLDivElement);

    const [hovered, setHovered] = useState(false);
    const [dragging, setDragging] = useState<"v" | "h" | null>(null);
    const [hasVScroll, setHasVScroll] = useState(false);
    const [hasHScroll, setHasHScroll] = useState(false);
    const dragStartRef = useRef({ y: 0, x: 0, scrollTop: 0, scrollLeft: 0 });
    const hasVScrollRef = useRef(false);
    const hasHScrollRef = useRef(false);

    const isNative = variant === "native";
    const showV = orientation !== "horizontal";
    const showH = orientation !== "vertical";
    const base = "k-scrollbar";
    const barSize = SIZE_MAP[size];
    const arrowSize = Math.max(barSize, 12);

    const thumbBg = gradient
      ? `linear-gradient(${gradient.angle ?? 180}deg, ${gradient.from}, ${gradient.to})`
      : color || "var(--kreati-scroll-thumb-color)";
    const trackBg = trackGradient
      ? `linear-gradient(${trackGradient.angle ?? 180}deg, ${trackGradient.from}, ${trackGradient.to})`
      : trackColor || "var(--kreati-scroll-track-color)";
    const tRadius = thumbRadius || "var(--kreati-scroll-thumb-radius)";

    /** Detect whether content overflows — only needs contentRef */
    const detectOverflow = useCallback(() => {
      const el = contentRef.current;
      if (!el) return;

      if (showV) {
        const canScroll = el.scrollHeight > el.clientHeight;
        if (hasVScrollRef.current !== canScroll) {
          hasVScrollRef.current = canScroll;
          setHasVScroll(canScroll);
        }
      }

      if (showH) {
        const canScroll = el.scrollWidth > el.clientWidth;
        if (hasHScrollRef.current !== canScroll) {
          hasHScrollRef.current = canScroll;
          setHasHScroll(canScroll);
        }
      }
    }, [showV, showH]);

    /** Position thumbs inside tracks — needs track/thumb refs to exist */
    const positionThumbs = useCallback(() => {
      const el = contentRef.current;
      if (!el) return;

      if (thumbVRef.current) {
        const zone = thumbZoneVRef.current || trackVRef.current;
        if (zone) {
          const ratio = el.clientHeight / el.scrollHeight;
          const zoneH = zone.clientHeight;
          const thumbH = Math.max(zoneH * ratio, 24);
          const scrollRatio =
            el.scrollTop / (el.scrollHeight - el.clientHeight);
          const actualH = thumbIcon
            ? Math.max(thumbVRef.current.scrollHeight, thumbH)
            : thumbH;
          const thumbTop = scrollRatio * (zoneH - actualH);
          if (thumbIcon) {
            thumbVRef.current.style.minHeight = `${thumbH}px`;
          } else {
            thumbVRef.current.style.height = `${thumbH}px`;
          }
          thumbVRef.current.style.transform = `translateY(${thumbTop}px)`;
        }
      }

      if (thumbHRef.current) {
        const zone = thumbZoneHRef.current || trackHRef.current;
        if (zone) {
          const ratio = el.clientWidth / el.scrollWidth;
          const zoneW = zone.clientWidth;
          const thumbW = Math.max(zoneW * ratio, 24);
          const scrollRatio = el.scrollLeft / (el.scrollWidth - el.clientWidth);
          const actualW = thumbIcon
            ? Math.max(thumbHRef.current.scrollWidth, thumbW)
            : thumbW;
          const thumbLeft = scrollRatio * (zoneW - actualW);
          if (thumbIcon) {
            thumbHRef.current.style.minWidth = `${thumbW}px`;
          } else {
            thumbHRef.current.style.width = `${thumbW}px`;
          }
          thumbHRef.current.style.transform = `translateX(${thumbLeft}px)`;
        }
      }
    }, [thumbIcon]);

    /** Detect overflow + resize observer (mounts tracks) */
    useEffect(() => {
      const el = contentRef.current;
      if (!el || isNative) return;

      detectOverflow();

      const ro = new ResizeObserver(detectOverflow);
      ro.observe(el);
      if (el.firstElementChild) ro.observe(el.firstElementChild);

      return () => ro.disconnect();
    }, [detectOverflow, isNative]);

    /** Once tracks are mounted, position thumbs + listen to scroll */
    useEffect(() => {
      const el = contentRef.current;
      if (!el || isNative) return;
      if (!hasVScroll && !hasHScroll) return;

      const onScroll = () => {
        detectOverflow();
        positionThumbs();
      };

      // Position immediately after tracks mount
      positionThumbs();

      el.addEventListener("scroll", onScroll, { passive: true });

      const ro = new ResizeObserver(onScroll);
      ro.observe(el);
      if (el.firstElementChild) ro.observe(el.firstElementChild);

      return () => {
        el.removeEventListener("scroll", onScroll);
        ro.disconnect();
      };
    }, [hasVScroll, hasHScroll, isNative, detectOverflow, positionThumbs]);

    const startDragV = useCallback((e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const el = contentRef.current;
      if (!el) return;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      setDragging("v");
      dragStartRef.current = {
        y: clientY,
        x: 0,
        scrollTop: el.scrollTop,
        scrollLeft: 0,
      };
    }, []);

    const startDragH = useCallback((e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const el = contentRef.current;
      if (!el) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      setDragging("h");
      dragStartRef.current = {
        y: 0,
        x: clientX,
        scrollTop: 0,
        scrollLeft: el.scrollLeft,
      };
    }, []);

    useEffect(() => {
      if (!dragging) return;

      document.body.style.userSelect = "none";

      const onMove = (e: MouseEvent | TouchEvent) => {
        const el = contentRef.current;
        if (!el) return;
        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
        const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

        if (dragging === "v" && trackVRef.current) {
          const trackH = trackVRef.current.clientHeight;
          const ratio = el.scrollHeight / trackH;
          const delta = clientY - dragStartRef.current.y;
          el.scrollTop = dragStartRef.current.scrollTop + delta * ratio;
        }

        if (dragging === "h" && trackHRef.current) {
          const trackW = trackHRef.current.clientWidth;
          const ratio = el.scrollWidth / trackW;
          const delta = clientX - dragStartRef.current.x;
          el.scrollLeft = dragStartRef.current.scrollLeft + delta * ratio;
        }
      };

      const onUp = () => {
        document.body.style.userSelect = "";
        setDragging(null);
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
      document.addEventListener("touchmove", onMove, { passive: false });
      document.addEventListener("touchend", onUp);
      return () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        document.removeEventListener("touchmove", onMove);
        document.removeEventListener("touchend", onUp);
        document.body.style.userSelect = "";
      };
    }, [dragging]);

    const onTrackClickV = useCallback((e: React.MouseEvent) => {
      const el = contentRef.current;
      const thumb = thumbVRef.current;
      const zone = thumbZoneVRef.current || trackVRef.current;
      if (!el || !zone || !thumb) return;
      if (e.target !== zone && e.target !== trackVRef.current) return;
      const rect = zone.getBoundingClientRect();
      const thumbH = thumb.clientHeight;
      const clickY = e.clientY - rect.top - thumbH / 2;
      const scrollable = rect.height - thumbH;
      const ratio = Math.max(0, Math.min(clickY / scrollable, 1));
      el.scrollTop = ratio * (el.scrollHeight - el.clientHeight);
    }, []);

    const onTrackClickH = useCallback((e: React.MouseEvent) => {
      const el = contentRef.current;
      const thumb = thumbHRef.current;
      const zone = thumbZoneHRef.current || trackHRef.current;
      if (!el || !zone || !thumb) return;
      if (e.target !== zone && e.target !== trackHRef.current) return;
      const rect = zone.getBoundingClientRect();
      const thumbW = thumb.clientWidth;
      const clickX = e.clientX - rect.left - thumbW / 2;
      const scrollable = rect.width - thumbW;
      const ratio = Math.max(0, Math.min(clickX / scrollable, 1));
      el.scrollLeft = ratio * (el.scrollWidth - el.clientWidth);
    }, []);

    const scrollBy = useCallback((dir: "up" | "down" | "left" | "right") => {
      const el = contentRef.current;
      if (!el) return;
      const amount = 40;
      const map = {
        up: [0, -amount],
        down: [0, amount],
        left: [-amount, 0],
        right: [amount, 0],
      };
      el.scrollBy({ left: map[dir][0], top: map[dir][1], behavior: "smooth" });
    }, []);

    if (isNative) {
      const nativeClasses = [
        base,
        `${base}--native`,
        `${base}--${orientation}`,
        className,
      ]
        .filter(Boolean)
        .join(" ");
      return (
        <div
          ref={wrapperRef}
          className={nativeClasses}
          style={{ ...style, maxHeight, maxWidth }}
          role="region"
          aria-label="Scrollable content"
        >
          {children}
        </div>
      );
    }

    const isVisible = variant === "visible" || hovered || !!dragging;
    const wrapperClasses = [
      base,
      `${base}--custom`,
      !thumbIcon && `${base}--clip`,
      dragging && `${base}--dragging`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div
        ref={wrapperRef}
        className={wrapperClasses}
        style={{ ...style, maxHeight, maxWidth }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        role="region"
        aria-label="Scrollable content"
      >
        <div
          ref={contentRef}
          className={`${base}__content ${base}__content--${orientation}`}
        >
          {children}
        </div>

        {showV && hasVScroll && (
          <div
            ref={trackVRef}
            className={`${base}__track ${base}__track--v`}
            style={{
              width: barSize,
              background: trackBg,
              borderRadius: tRadius,
              opacity: isVisible ? 1 : 0,
            }}
            onClick={onTrackClickV}
          >
            {trackTemplate && (
              <div className={`${base}__track-template`}>{trackTemplate}</div>
            )}
            {arrows && (
              <button
                className={`${base}__arrow ${base}__arrow--up`}
                onClick={() => scrollBy("up")}
                aria-label="Scroll up"
                tabIndex={-1}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width={arrowSize}
                  height={arrowSize}
                >
                  <path d={TRIANGLE_UP_PATH} />
                </svg>
              </button>
            )}
            <div
              ref={arrows ? thumbZoneVRef : undefined}
              className={arrows ? `${base}__thumb-zone` : undefined}
              style={arrows ? { flex: 1, position: "relative" } : undefined}
            >
              <div
                ref={thumbVRef}
                className={`${base}__thumb ${base}__thumb--v ${thumbIcon ? `${base}__thumb--custom` : ""}`}
                style={
                  thumbIcon
                    ? { borderRadius: tRadius }
                    : {
                        width: barSize,
                        background: thumbBg,
                        borderRadius: tRadius,
                      }
                }
                onMouseDown={startDragV}
                onTouchStart={startDragV}
              >
                {thumbIcon}
              </div>
            </div>
            {arrows && (
              <button
                className={`${base}__arrow ${base}__arrow--down`}
                onClick={() => scrollBy("down")}
                aria-label="Scroll down"
                tabIndex={-1}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width={arrowSize}
                  height={arrowSize}
                >
                  <path d={TRIANGLE_DOWN_PATH} />
                </svg>
              </button>
            )}
          </div>
        )}

        {showH && hasHScroll && (
          <div
            ref={trackHRef}
            className={`${base}__track ${base}__track--h`}
            style={{
              height: barSize,
              background: trackBg,
              borderRadius: tRadius,
              opacity: isVisible ? 1 : 0,
            }}
            onClick={onTrackClickH}
          >
            {trackTemplate && (
              <div className={`${base}__track-template`}>{trackTemplate}</div>
            )}
            {arrows && (
              <button
                className={`${base}__arrow ${base}__arrow--left`}
                onClick={() => scrollBy("left")}
                aria-label="Scroll left"
                tabIndex={-1}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width={arrowSize}
                  height={arrowSize}
                >
                  <path d={TRIANGLE_LEFT_PATH} />
                </svg>
              </button>
            )}
            <div
              ref={arrows ? thumbZoneHRef : undefined}
              className={arrows ? `${base}__thumb-zone` : undefined}
              style={arrows ? { flex: 1, position: "relative" } : undefined}
            >
              <div
                ref={thumbHRef}
                className={`${base}__thumb ${base}__thumb--h ${thumbIcon ? `${base}__thumb--custom` : ""}`}
                style={
                  thumbIcon
                    ? { borderRadius: tRadius }
                    : {
                        height: barSize,
                        background: thumbBg,
                        borderRadius: tRadius,
                      }
                }
                onMouseDown={startDragH}
                onTouchStart={startDragH}
              >
                {thumbIcon}
              </div>
            </div>
            {arrows && (
              <button
                className={`${base}__arrow ${base}__arrow--right`}
                onClick={() => scrollBy("right")}
                aria-label="Scroll right"
                tabIndex={-1}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width={arrowSize}
                  height={arrowSize}
                >
                  <path d={TRIANGLE_RIGHT_PATH} />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
);

ScrollBar.displayName = "ScrollBar";
