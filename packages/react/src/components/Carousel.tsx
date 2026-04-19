import React, {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import "./Carousel.css";
import { Button } from "./Button";
import { useKreatiLocale } from "../locale";
import {
  CHEVRON_LEFT_PATH,
  CHEVRON_RIGHT_PATH,
  CHEVRON_DOWN_PATH,
  CHEVRON_UP_PATH,
} from "./iconPaths";

/** Single item in the carousel */
export interface CarouselItem {
  /** Unique key for the item */
  key?: string;
  /** Content to render — if using itemTemplate, this is passed as data */
  content?: React.ReactNode;
  /** Custom className per item */
  className?: string;
  /** Custom style per item */
  style?: React.CSSProperties;
}

export interface CarouselProps {
  /** Array of items to display */
  items: CarouselItem[];
  /** Custom template for each item. Receives item and index. */
  itemTemplate?: (item: CarouselItem, index: number) => React.ReactNode;
  /** Custom template for navigation arrows. Receives direction, onClick, disabled. */
  navigationTemplate?: (
    direction: "prev" | "next",
    onClick: () => void,
    disabled: boolean
  ) => React.ReactNode;
  /** Custom template for indicators. Receives total, active index, goTo function. */
  indicatorTemplate?: (
    total: number,
    activeIndex: number,
    goTo: (index: number) => void
  ) => React.ReactNode;
  /** Number of visible items at once. Default: 1 */
  visibleItems?: number;
  /** Number of items to scroll per step. Default: 1 */
  scrollStep?: number;
  /** Scroll direction. Default: 'horizontal' */
  orientation?: "horizontal" | "vertical";
  /** Enable infinite circular scrolling. Default: false */
  circular?: boolean;
  /** Autoplay interval in ms. 0 = disabled. Default: 0 */
  autoplay?: number;
  /** Pause autoplay on hover. Default: true */
  pauseOnHover?: boolean;
  /** Show navigation arrows. Default: true */
  showNavigation?: boolean;
  /** Show indicator dots/stepper. Default: true */
  showIndicators?: boolean;
  /** Indicator style. Default: 'dots' */
  indicatorType?: "dots" | "numbers" | "fraction";
  /** Callback when active page changes */
  onPageChange?: (page: number) => void;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

const iconSvg = (path: string) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d={path} />
  </svg>
);

/**
 * Carousel component for cycling through content items.
 * Supports horizontal/vertical orientation, circular scrolling,
 * autoplay, multiple visible items, custom templates, and full keyboard navigation.
 *
 * @example
 * ```tsx
 * <Carousel items={images} circular autoplay={5000} />
 * ```
 */
export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(
  (
    {
      items,
      itemTemplate,
      navigationTemplate,
      indicatorTemplate,
      visibleItems = 1,
      scrollStep = 1,
      orientation = "horizontal",
      circular = false,
      autoplay = 0,
      pauseOnHover = true,
      showNavigation = true,
      showIndicators = true,
      indicatorType = "dots",
      onPageChange,
      className,
      style,
    },
    ref
  ) => {
    const locale = useKreatiLocale();
    const isHorizontal = orientation === "horizontal";
    const total = items.length;
    const maxIndex = Math.max(0, total - visibleItems);

    /* State: realIndex is the logical index (0..total-1), trackPos is the physical offset used for clones */
    const [realIndex, setRealIndex] = useState(0);
    const [transitioning, setTransitioning] = useState(false);
    const [hovered, setHovered] = useState(false);
    const viewportRef = useRef<HTMLDivElement>(null);
    const autoplayRef = useRef<ReturnType<typeof setInterval>>();

    const displayIndex = ((realIndex % total) + total) % total;

    const goTo = useCallback(
      (next: number) => {
        if (transitioning) return;
        if (circular) {
          setTransitioning(true);
          setRealIndex(next);
          onPageChange?.(((next % total) + total) % total);
        } else {
          const clamped = Math.max(0, Math.min(maxIndex, next));
          setTransitioning(true);
          setRealIndex(clamped);
          onPageChange?.(clamped);
        }
      },
      [transitioning, circular, total, maxIndex, onPageChange]
    );

    const prev = useCallback(
      () => goTo(realIndex - scrollStep),
      [goTo, realIndex, scrollStep]
    );
    const next = useCallback(
      () => goTo(realIndex + scrollStep),
      [goTo, realIndex, scrollStep]
    );

    /* End of transition */
    const onTransitionEnd = useCallback(() => {
      setTransitioning(false);
      if (circular) {
        if (realIndex >= total) setRealIndex(realIndex - total);
        else if (realIndex < 0) setRealIndex(realIndex + total);
      }
    }, [circular, realIndex, total]);

    /* Autoplay */
    useEffect(() => {
      if (!autoplay || (pauseOnHover && hovered)) {
        clearInterval(autoplayRef.current);
        return;
      }
      autoplayRef.current = setInterval(() => {
        goTo(realIndex + scrollStep);
      }, autoplay);
      return () => clearInterval(autoplayRef.current);
    }, [autoplay, pauseOnHover, hovered, realIndex, scrollStep, goTo]);

    /* Keyboard */
    const onKeyDown = (e: React.KeyboardEvent) => {
      const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp";
      const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown";
      if (e.key === prevKey) {
        e.preventDefault();
        prev();
      } else if (e.key === nextKey) {
        e.preventDefault();
        next();
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(circular ? total - 1 : maxIndex);
      }
    };

    /* Build visible window of items */
    const getVisibleSlides = () => {
      if (!circular) return items.map((item, i) => ({ item, index: i }));
      /* For circular: render enough items to cover prev-clones + items + next-clones */
      const slides: { item: CarouselItem; index: number }[] = [];
      for (let i = -visibleItems; i < total + visibleItems; i++) {
        const idx = ((i % total) + total) % total;
        slides.push({ item: items[idx], index: idx });
      }
      return slides;
    };
    const slides = getVisibleSlides();
    const baseOffset = circular ? visibleItems : 0;

    /* Calculate pixel offset via viewport size for reliable vertical */
    const [viewportSize, setViewportSize] = useState(0);
    useEffect(() => {
      const el = viewportRef.current;
      if (!el) return;
      const measure = () =>
        setViewportSize(isHorizontal ? el.offsetWidth : el.offsetHeight);
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }, [isHorizontal]);

    const itemSize = viewportSize / visibleItems;
    const trackOffset = (realIndex + baseOffset) * itemSize;

    const trackStyle: React.CSSProperties = {
      display: "flex",
      flexDirection: isHorizontal ? "row" : "column",
      transform: isHorizontal
        ? `translateX(-${trackOffset}px)`
        : `translateY(-${trackOffset}px)`,
    };

    const itemBaseStyle: React.CSSProperties = isHorizontal
      ? { flex: `0 0 ${itemSize}px`, width: itemSize, maxWidth: itemSize }
      : { flex: `0 0 ${itemSize}px`, height: itemSize, maxHeight: itemSize };

    const prevDisabled = !circular && realIndex <= 0;
    const nextDisabled = !circular && realIndex >= maxIndex;
    const prevIconPath = isHorizontal ? CHEVRON_LEFT_PATH : CHEVRON_UP_PATH;
    const nextIconPath = isHorizontal ? CHEVRON_RIGHT_PATH : CHEVRON_DOWN_PATH;
    const pageCount = circular ? total : maxIndex + 1;

    const renderNav = (dir: "prev" | "next") => {
      const onClick = dir === "prev" ? prev : next;
      const disabled = dir === "prev" ? prevDisabled : nextDisabled;
      if (navigationTemplate) return navigationTemplate(dir, onClick, disabled);
      return (
        <Button
          className={`k-carousel__nav k-carousel__nav--${dir}`}
          iconLeft={iconSvg(dir === "prev" ? prevIconPath : nextIconPath)}
          buttonType="outlined"
          severity="secondary"
          size="sm"
          ariaLabel={
            dir === "prev"
              ? locale?.common?.previous || "Previous"
              : locale?.common?.next || "Next"
          }
          onClick={onClick}
          disabled={disabled}
        />
      );
    };

    return (
      <div
        ref={ref}
        className={`k-carousel k-carousel--${orientation} ${className || ""}`}
        style={style}
        role="region"
        aria-roledescription="carousel"
        aria-label={locale?.common?.carousel || "Carousel"}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onKeyDown={onKeyDown}
        tabIndex={0}
      >
        <div className="k-carousel__body">
          {showNavigation && renderNav("prev")}

          <div className="k-carousel__viewport" ref={viewportRef}>
            <div
              className={`k-carousel__track ${transitioning ? "k-carousel__track--moving" : ""}`}
              style={trackStyle}
              onTransitionEnd={onTransitionEnd}
              aria-live="off"
            >
              {slides.map((s, i) => (
                <div
                  key={`${s.index}-${i}`}
                  className={`k-carousel__item ${s.item.className || ""}`}
                  style={{ ...itemBaseStyle, ...s.item.style }}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${s.index + 1} / ${total}`}
                >
                  {itemTemplate
                    ? itemTemplate(s.item, s.index)
                    : s.item.content}
                </div>
              ))}
            </div>
          </div>

          {showNavigation && renderNav("next")}
        </div>

        {showIndicators &&
          indicatorTemplate &&
          indicatorTemplate(pageCount, displayIndex, i => goTo(i))}

        {showIndicators && !indicatorTemplate && (
          <div className="k-carousel__indicators" role="tablist">
            {indicatorType === "fraction" ? (
              <span className="k-carousel__fraction">
                {displayIndex + 1} / {total}
              </span>
            ) : (
              Array.from({ length: pageCount }).map((_, i) => (
                <button
                  key={i}
                  className={`k-carousel__indicator ${indicatorType === "numbers" ? "k-carousel__indicator--numbered" : ""} ${i === displayIndex ? "k-carousel__indicator--active" : ""}`}
                  onClick={() => goTo(i)}
                  role="tab"
                  aria-selected={i === displayIndex}
                  aria-label={`${locale?.common?.page || "Page"} ${i + 1}`}
                  type="button"
                >
                  {indicatorType === "numbers" ? i + 1 : null}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    );
  }
);

Carousel.displayName = "Carousel";
