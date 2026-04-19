import React, {
  forwardRef,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import "./DockMenu.css";
import { MenuItem } from "../types/navigation";
import { renderMenuIcon } from "./resolveIcon";

/**
 * Props for the DockMenu component
 */
export interface DockMenuProps {
  /** Array of menu items */
  items: MenuItem[];
  /** Position of the dock */
  position?: "bottom" | "top" | "left" | "right";
  /** Base icon size in pixels */
  iconSize?: number;
  /** Maximum magnified size in pixels */
  maxIconSize?: number;
  /** Distance in pixels at which magnification starts */
  magnifyRange?: number;
  /** Whether magnification effect is enabled */
  magnify?: boolean;
  /** Show item labels on hover */
  showLabels?: boolean;
  /** Callback when an item is selected */
  onItemSelect?: (key: string, item: MenuItem) => void;
  /** Whether all items are disabled */
  disabled?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * DockMenu displays a macOS-style dock with magnification effect.
 *
 * @description A dock menu component that renders MenuItem items as icons with
 * a proximity-based magnification effect. Supports 4 positions (bottom, top, left, right),
 * configurable icon sizes, labels on hover, separators, and custom templates.
 * Fully accessible with ARIA toolbar role and keyboard navigation.
 *
 * @example
 * ```tsx
 * <DockMenu
 *   items={[
 *     { key: 'home', label: 'Home', icon: 'check' },
 *     { key: 'search', label: 'Search', icon: 'search' },
 *     { key: 'sep', separator: true },
 *     { key: 'settings', label: 'Settings', icon: 'calendar' },
 *   ]}
 *   position="bottom"
 * />
 * ```
 */
export const DockMenu = forwardRef<HTMLDivElement, DockMenuProps>(
  (
    {
      items,
      position = "bottom",
      iconSize = 56,
      maxIconSize = 84,
      magnifyRange = 180,
      magnify = true,
      showLabels = true,
      onItemSelect,
      disabled = false,
      className = "",
      style,
    },
    ref
  ) => {
    const base = "k-dock";
    const dockRef = useRef<HTMLDivElement>(null);
    const [scales, setScales] = useState<number[]>([]);
    const [hoveredKey, setHoveredKey] = useState<string | null>(null);
    const [focusedIndex, setFocusedIndex] = useState(-1);

    const visibleItems = items.filter(i => i.visible !== false);
    const isVertical = position === "left" || position === "right";

    const classes = [
      base,
      `${base}--${position}`,
      disabled && `${base}--disabled`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const calcScales = useCallback(
      (mousePos: number) => {
        if (!magnify || !dockRef.current) return;
        const items = dockRef.current.querySelectorAll(`.${base}__item`);
        const newScales: number[] = [];

        items.forEach(el => {
          const rect = el.getBoundingClientRect();
          const center = isVertical
            ? rect.top + rect.height / 2
            : rect.left + rect.width / 2;
          const distance = Math.abs(mousePos - center);
          const scale =
            distance < magnifyRange
              ? 1 +
                ((maxIconSize - iconSize) / iconSize) *
                  (1 - distance / magnifyRange)
              : 1;
          newScales.push(scale);
        });

        setScales(newScales);
      },
      [magnify, iconSize, maxIconSize, magnifyRange, isVertical]
    );

    const handleMouseMove = useCallback(
      (e: React.MouseEvent) => {
        if (!magnify || !dockRef.current) return;
        const mousePos = isVertical ? e.clientY : e.clientX;
        const itemEls = dockRef.current.querySelectorAll(`.${base}__item`);
        const newScales: number[] = [];

        itemEls.forEach(el => {
          const isItemDisabled = (el as HTMLElement).hasAttribute("disabled");
          if (isItemDisabled) {
            newScales.push(1);
            return;
          }

          const rect = el.getBoundingClientRect();
          const start = isVertical ? rect.top : rect.left;
          const end = isVertical ? rect.bottom : rect.right;
          const size = end - start;
          const center = start + size / 2;

          // If mouse is within the inner 75% of the item, keep at max
          const innerStart = start + size * 0.25;
          const innerEnd = end - size * 0.25;
          if (mousePos >= innerStart && mousePos <= innerEnd) {
            newScales.push(maxIconSize / iconSize);
            return;
          }

          const distance = Math.abs(mousePos - center);
          const scale =
            distance < magnifyRange
              ? 1 +
                ((maxIconSize - iconSize) / iconSize) *
                  Math.cos((distance / magnifyRange) * (Math.PI / 2))
              : 1;
          newScales.push(scale);
        });

        setScales(newScales);
      },
      [magnify, iconSize, maxIconSize, magnifyRange, isVertical]
    );

    const handleMouseLeave = useCallback(() => {
      setScales([]);
      setHoveredKey(null);
    }, []);

    const handleSelect = useCallback(
      (item: MenuItem) => {
        if (disabled || item.disabled) return;
        if (item.command) item.command(item);
        if (item.url) {
          if (item.target === "_blank")
            window.open(item.url, "_blank", "noopener");
          else window.location.href = item.url;
        }
        onItemSelect?.(item.key, item);
      },
      [disabled, onItemSelect]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        const navigable = visibleItems.filter(i => !i.separator && !i.disabled);
        if (navigable.length === 0) return;

        const nextKey = isVertical
          ? e.key === "ArrowDown"
            ? 1
            : e.key === "ArrowUp"
              ? -1
              : 0
          : e.key === "ArrowRight"
            ? 1
            : e.key === "ArrowLeft"
              ? -1
              : 0;

        if (e.key === "Home") {
          e.preventDefault();
          setFocusedIndex(0);
        } else if (e.key === "End") {
          e.preventDefault();
          setFocusedIndex(navigable.length - 1);
        } else if (nextKey !== 0) {
          e.preventDefault();
          setFocusedIndex(prev => {
            const next = prev + nextKey;
            if (next < 0) return navigable.length - 1;
            if (next >= navigable.length) return 0;
            return next;
          });
        } else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < navigable.length) {
            handleSelect(navigable[focusedIndex]);
          }
        }
      },
      [visibleItems, isVertical, focusedIndex, handleSelect]
    );

    useEffect(() => {
      if (focusedIndex < 0 || !dockRef.current) return;
      const navigable = visibleItems.filter(i => !i.separator && !i.disabled);
      if (focusedIndex >= navigable.length) return;
      const key = navigable[focusedIndex].key;
      const el = dockRef.current.querySelector(
        `[data-dock-key="${key}"]`
      ) as HTMLElement;
      el?.focus();
    }, [focusedIndex, visibleItems]);

    let itemIndex = 0;

    const labelPosition =
      position === "bottom"
        ? "top"
        : position === "top"
          ? "bottom"
          : position === "left"
            ? "right"
            : "left";

    return (
      <div
        ref={el => {
          (dockRef as React.MutableRefObject<HTMLDivElement | null>).current =
            el;
          if (typeof ref === "function") ref(el);
          else if (ref)
            (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
        className={classes}
        style={
          {
            ...style,
            "--kreati-dock-glass-height": `${iconSize + 20}px`,
          } as React.CSSProperties
        }
        role="toolbar"
        aria-label="Dock"
        aria-orientation={isVertical ? "vertical" : "horizontal"}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
      >
        <div className={`${base}__track`}>
          {visibleItems.map(item => {
            if (item.separator) {
              return (
                <div
                  key={item.key}
                  className={`${base}__separator`}
                  role="separator"
                />
              );
            }

            if (item.template) {
              return (
                <React.Fragment key={item.key}>
                  {item.template(item)}
                </React.Fragment>
              );
            }

            const idx = itemIndex++;
            const scale = scales[idx] || 1;
            const size = iconSize * scale;
            const isDisabled = disabled || item.disabled;
            const isHovered = hoveredKey === item.key;

            const itemClasses = [
              `${base}__item`,
              isDisabled && `${base}__item--disabled`,
              item.className,
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button
                key={item.key}
                data-dock-key={item.key}
                type="button"
                role="button"
                className={itemClasses}
                style={{
                  ...item.style,
                  width: size,
                  height: size,
                }}
                tabIndex={isDisabled ? -1 : 0}
                aria-label={item.label}
                aria-disabled={isDisabled || undefined}
                disabled={isDisabled}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setHoveredKey(item.key)}
                onMouseLeave={() => setHoveredKey(null)}
                onFocus={() => setHoveredKey(item.key)}
                onBlur={() => setHoveredKey(null)}
              >
                <span
                  className={`${base}__icon`}
                  style={{ fontSize: size * 0.6 }}
                >
                  {item.icon
                    ? renderMenuIcon(item.icon, Math.round(size * 0.6))
                    : null}
                </span>
                {showLabels && item.label && isHovered && (
                  <span
                    className={`${base}__label ${base}__label--${labelPosition}`}
                  >
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
);

DockMenu.displayName = "DockMenu";
