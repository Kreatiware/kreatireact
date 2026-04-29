import React, {
  forwardRef,
  useCallback,
  useRef,
  useEffect,
  useState,
} from "react";
import "./TabMenu.css";
import { MenuItem } from "../types/navigation";
import { renderMenuIcon } from "./resolveIcon";
import { sanitizeUrl } from "./sanitizeUrl";

/**
 * Props for the TabMenu component
 */
export interface TabMenuProps {
  /** Array of menu items to display as tabs */
  items: MenuItem[];
  /** Key of the currently active tab */
  activeKey?: string;
  /** Callback when a tab is selected */
  onTabChange?: (key: string, item: MenuItem) => void;
  /** Whether all tabs are disabled */
  disabled?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * TabMenu displays a horizontal tab-based navigation bar.
 *
 * @description A tab menu component that renders MenuItem items as horizontal tabs
 * with an animated active indicator. Supports icons (string name or ReactNode),
 * disabled states, separators, custom templates, and keyboard navigation.
 * Scrolls horizontally when tabs overflow the container.
 * Fully accessible with ARIA tablist/tab roles and arrow key navigation.
 *
 * @example
 * ```tsx
 * const items: MenuItem[] = [
 *   { key: 'home', label: 'Home', icon: 'search' },
 *   { key: 'profile', label: 'Profile' },
 *   { key: 'settings', label: 'Settings', disabled: true },
 * ];
 *
 * <TabMenu items={items} activeKey="home" onTabChange={(key) => setActive(key)} />
 * ```
 */
export const TabMenu = forwardRef<HTMLDivElement, TabMenuProps>(
  (
    { items, activeKey, onTabChange, disabled = false, className = "", style },
    ref
  ) => {
    const base = "k-tabmenu";
    const listRef = useRef<HTMLDivElement>(null);
    const [inkStyle, setInkStyle] = useState<React.CSSProperties>({});
    const tabRefs = useRef<Map<string, HTMLElement>>(new Map());

    const visibleItems = items.filter(item => item.visible !== false);

    const classes = [base, disabled && `${base}--disabled`, className]
      .filter(Boolean)
      .join(" ");

    /** Update the ink bar position to match the active tab */
    const updateInk = useCallback(() => {
      if (!activeKey) {
        setInkStyle({ width: 0 });
        return;
      }
      const el = tabRefs.current.get(activeKey);
      if (el && listRef.current) {
        const listRect = listRef.current.getBoundingClientRect();
        const tabRect = el.getBoundingClientRect();
        setInkStyle({
          width: tabRect.width,
          transform: `translateX(${tabRect.left - listRect.left + listRef.current.scrollLeft}px)`,
        });
      }
    }, [activeKey]);

    useEffect(() => {
      updateInk();
    }, [updateInk, visibleItems.length]);

    useEffect(() => {
      const observer = new ResizeObserver(() => updateInk());
      if (listRef.current) observer.observe(listRef.current);
      return () => observer.disconnect();
    }, [updateInk]);

    /** Scroll active tab into view */
    const scrollIntoView = useCallback((key: string) => {
      const el = tabRefs.current.get(key);
      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
      }
    }, []);

    useEffect(() => {
      if (activeKey) scrollIntoView(activeKey);
    }, [activeKey, scrollIntoView]);

    const handleSelect = useCallback(
      (item: MenuItem) => {
        if (disabled || item.disabled) return;
        if (item.command) item.command(item);
        if (item.url) {
          const safe = sanitizeUrl(item.url);
          if (safe) {
            if (item.target === "_blank") {
              window.open(safe, "_blank", "noopener");
            } else {
              window.location.href = safe;
            }
          }
        }
        onTabChange?.(item.key, item);
      },
      [disabled, onTabChange]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        const enabledItems = visibleItems.filter(
          i => !i.separator && !i.disabled
        );
        if (enabledItems.length === 0) return;

        const currentIndex = enabledItems.findIndex(i => i.key === activeKey);
        let nextIndex = -1;

        if (e.key === "ArrowRight") {
          e.preventDefault();
          nextIndex =
            currentIndex < enabledItems.length - 1 ? currentIndex + 1 : 0;
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          nextIndex =
            currentIndex > 0 ? currentIndex - 1 : enabledItems.length - 1;
        } else if (e.key === "Home") {
          e.preventDefault();
          nextIndex = 0;
        } else if (e.key === "End") {
          e.preventDefault();
          nextIndex = enabledItems.length - 1;
        }

        if (nextIndex >= 0) {
          const nextItem = enabledItems[nextIndex];
          tabRefs.current.get(nextItem.key)?.focus();
          handleSelect(nextItem);
        }
      },
      [visibleItems, activeKey, handleSelect]
    );

    const renderItem = (item: MenuItem) => {
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
          <React.Fragment key={item.key}>{item.template(item)}</React.Fragment>
        );
      }

      const isActive = activeKey === item.key;
      const isDisabled = disabled || item.disabled;

      const tabClasses = [
        `${base}__tab`,
        isActive && `${base}__tab--active`,
        isDisabled && `${base}__tab--disabled`,
        item.className,
      ]
        .filter(Boolean)
        .join(" ");

      return (
        <button
          key={item.key}
          ref={el => {
            if (el) tabRefs.current.set(item.key, el);
            else tabRefs.current.delete(item.key);
          }}
          type="button"
          role="tab"
          id={`${base}-tab-${item.key}`}
          className={tabClasses}
          style={item.style}
          tabIndex={isActive ? 0 : -1}
          aria-selected={isActive}
          aria-disabled={isDisabled || undefined}
          disabled={isDisabled}
          onClick={() => handleSelect(item)}
          onKeyDown={handleKeyDown}
        >
          {item.icon && (
            <span className={`${base}__icon`} aria-hidden="true">
              {renderMenuIcon(item.icon)}
            </span>
          )}
          {item.label && <span className={`${base}__label`}>{item.label}</span>}
        </button>
      );
    };

    return (
      <div ref={ref} className={classes} style={style}>
        <div
          ref={listRef}
          className={`${base}__list`}
          role="tablist"
          aria-orientation="horizontal"
        >
          {visibleItems.map(renderItem)}
          <span className={`${base}__ink`} style={inkStyle} />
        </div>
      </div>
    );
  }
);

TabMenu.displayName = "TabMenu";
