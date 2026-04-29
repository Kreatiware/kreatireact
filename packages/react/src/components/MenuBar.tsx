import React, {
  forwardRef,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import "./MenuBar.css";
import { MenuItem } from "../types/navigation";
import { renderMenuIcon } from "./resolveIcon";
import {
  CHEVRON_DOWN_PATH,
  CHEVRON_UP_PATH,
  HAMBURGER_RECTS,
} from "./iconPaths";
import { ContextMenu } from "./ContextMenu";
import { Drawer } from "./Drawer";
import { SideMenu } from "./SideMenu";
import { sanitizeUrl } from "./sanitizeUrl";

/**
 * Props for the MenuBar component
 */
export interface MenuBarProps {
  /** Array of top-level menu items */
  items: MenuItem[];
  /** Orientation of the menu bar */
  orientation?: "horizontal" | "vertical";
  /** Variant for vertical orientation — default opens submenus as floating panels, panel/tree expand inline */
  variant?: "default" | "panel" | "tree";
  /** Allow multiple sections open at once in panel/tree variants (default: false) */
  multiple?: boolean;
  /** Items rendered at the start of the bar */
  start?: MenuItem[];
  /** Items rendered at the end of the bar */
  end?: MenuItem[];
  /** Callback when a leaf item is selected */
  onItemSelect?: (key: string, item: MenuItem) => void;
  /** Whether all items are disabled */
  disabled?: boolean;
  /** Show chevron indicator on items with dropdowns (default: true) */
  showChevron?: boolean;
  /** Custom chevron for open state — icon name string or ReactNode */
  chevronOpen?: React.ReactNode;
  /** Custom chevron for closed state — icon name string or ReactNode */
  chevronClosed?: React.ReactNode;
  /** Enable mobile layout — hamburger + Drawer with SideMenu (default: true) */
  mobileAdaptive?: boolean;
  /** Breakpoint (px) at which mobile mode activates */
  mobileBreakpoint?: number;
  /** Position of the hamburger button in mobile mode */
  hamburgerPosition?: "start" | "end";
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * MenuBar displays a horizontal application menu bar (File, Edit, View...).
 *
 * @description A horizontal menu bar with dropdown panels for top-level items.
 * Uses ContextMenu internally for dropdown rendering with nested submenus.
 * Supports icons (string or ReactNode), disabled states, separators, custom
 * templates, start/end slots, and keyboard navigation. Once a menu is open,
 * hovering other top-level items switches the dropdown instantly.
 * Fully accessible with ARIA menubar/menuitem roles.
 *
 * @example
 * ```tsx
 * <MenuBar
 *   start={<span>MyApp</span>}
 *   items={[
 *     { key: 'file', label: 'File', items: [
 *       { key: 'new', label: 'New' },
 *       { key: 'open', label: 'Open' },
 *     ]},
 *     { key: 'edit', label: 'Edit', items: [
 *       { key: 'undo', label: 'Undo' },
 *     ]},
 *   ]}
 *   end={<Button label="Sign Out" />}
 * />
 * ```
 */
export const MenuBar = forwardRef<HTMLDivElement, MenuBarProps>(
  (
    {
      items,
      orientation = "horizontal",
      variant = "default",
      multiple: multipleOpen = false,
      start,
      end,
      onItemSelect,
      disabled = false,
      showChevron = true,
      chevronOpen,
      chevronClosed,
      mobileAdaptive = true,
      mobileBreakpoint = 768,
      hamburgerPosition = "start",
      className = "",
      style,
    },
    ref
  ) => {
    const base = "k-menubar";
    const [openKey, setOpenKey] = useState<string | null>(null);
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
    const [isMobile, setIsMobile] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const barRef = useRef<HTMLDivElement>(null);

    const visibleItems = items.filter(i => i.visible !== false);

    useEffect(() => {
      if (!mobileAdaptive) {
        setIsMobile(false);
        return;
      }
      const mq = window.matchMedia(`(max-width: ${mobileBreakpoint}px)`);
      const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
        setIsMobile(e.matches);
        if (e.matches) {
          setOpenKey(null);
          setDrawerOpen(false);
        }
      };
      onChange(mq);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }, [mobileAdaptive, mobileBreakpoint]);

    const isVertical = orientation === "vertical";
    const useInline = isVertical && (variant === "panel" || variant === "tree");

    const classes = [
      base,
      isVertical && `${base}--vertical`,
      useInline && `${base}--${variant}`,
      disabled && `${base}--disabled`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const closeAll = useCallback(() => setOpenKey(null), []);

    useEffect(() => {
      if (!openKey) return;
      const handle = (e: MouseEvent) => {
        if (barRef.current && !barRef.current.contains(e.target as Node))
          closeAll();
      };
      document.addEventListener("mousedown", handle);
      return () => document.removeEventListener("mousedown", handle);
    }, [openKey, closeAll]);

    useEffect(() => {
      if (!openKey) return;
      const handle = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeAll();
      };
      document.addEventListener("keydown", handle);
      return () => document.removeEventListener("keydown", handle);
    }, [openKey, closeAll]);

    const handleTopClick = useCallback(
      (item: MenuItem) => {
        if (disabled || item.disabled) return;
        if (!item.items || item.items.length === 0) {
          if (item.command) item.command(item);
          if (item.url) {
            const safe = sanitizeUrl(item.url);
            if (safe) {
              if (item.target === "_blank")
                window.open(safe, "_blank", "noopener");
              else window.location.href = safe;
            }
          }
          onItemSelect?.(item.key, item);
          closeAll();
          return;
        }
        setOpenKey(prev => (prev === item.key ? null : item.key));
      },
      [disabled, onItemSelect, closeAll]
    );

    const handleTopEnter = useCallback(
      (item: MenuItem) => {
        if (openKey && item.items && item.items.length > 0) {
          setOpenKey(item.key);
        }
      },
      [openKey]
    );

    const handleBarKeyDown = useCallback(
      (e: React.KeyboardEvent, item: MenuItem) => {
        const enabled = visibleItems.filter(i => !i.separator && !i.disabled);
        const idx = enabled.findIndex(i => i.key === item.key);

        if (e.key === "ArrowRight") {
          e.preventDefault();
          const next = enabled[(idx + 1) % enabled.length];
          (
            document.getElementById(`${base}-top-${next.key}`) as HTMLElement
          )?.focus();
          if (openKey) setOpenKey(next.key);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          const prev = enabled[(idx - 1 + enabled.length) % enabled.length];
          (
            document.getElementById(`${base}-top-${prev.key}`) as HTMLElement
          )?.focus();
          if (openKey) setOpenKey(prev.key);
        } else if (
          e.key === "ArrowDown" &&
          item.items &&
          item.items.length > 0
        ) {
          e.preventDefault();
          setOpenKey(item.key);
        } else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleTopClick(item);
        } else if (e.key === "Escape") {
          closeAll();
        }
      },
      [visibleItems, openKey, handleTopClick, closeAll]
    );

    const renderTopItem = (item: MenuItem) => {
      if (item.separator)
        return (
          <div
            key={item.key}
            className={`${base}__top-separator`}
            role="separator"
          />
        );
      if (item.template)
        return (
          <React.Fragment key={item.key}>{item.template(item)}</React.Fragment>
        );

      const hasDropdown = item.items && item.items.length > 0;
      const isOpen = openKey === item.key;
      const isExpanded = expandedKeys.has(item.key);
      const isDisabled = disabled || item.disabled;

      // Inline variants (panel/tree) — expand inside the bar
      if (useInline && hasDropdown) {
        const panelCls = [
          `${base}__top-item`,
          `${base}__top-item--${variant}`,
          isExpanded && `${base}__top-item--expanded`,
          isDisabled && `${base}__top-item--disabled`,
          item.className,
        ]
          .filter(Boolean)
          .join(" ");

        const toggleExpand = () => {
          if (isDisabled) return;
          setExpandedKeys(prev => {
            const next = new Set(multipleOpen ? prev : []);
            if (prev.has(item.key)) next.delete(item.key);
            else next.add(item.key);
            return next;
          });
        };

        return (
          <div key={item.key} className={`${base}__inline-group`}>
            <button
              type="button"
              className={panelCls}
              style={item.style}
              tabIndex={isDisabled ? -1 : 0}
              aria-expanded={isExpanded}
              aria-disabled={isDisabled || undefined}
              disabled={isDisabled}
              onClick={toggleExpand}
            >
              {item.icon && (
                <span className={`${base}__icon`} aria-hidden="true">
                  {renderMenuIcon(item.icon)}
                </span>
              )}
              <span className={`${base}__label`}>{item.label}</span>
              <span
                className={`${base}__chevron ${isExpanded ? `${base}__chevron--open` : ""}`}
                aria-hidden="true"
              >
                <svg
                  width={12}
                  height={12}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d={CHEVRON_DOWN_PATH} />
                </svg>
              </span>
            </button>
            {isExpanded && (
              <div className={`${base}__inline-submenu`}>
                <SideMenu
                  items={item.items!}
                  disabled={isDisabled}
                  animated={variant === "panel"}
                  onItemSelect={(key, selectedItem) =>
                    onItemSelect?.(key, selectedItem)
                  }
                />
              </div>
            )}
          </div>
        );
      }

      const topCls = [
        `${base}__top-item`,
        isOpen && `${base}__top-item--open`,
        isDisabled && `${base}__top-item--disabled`,
        item.className,
      ]
        .filter(Boolean)
        .join(" ");

      const defaultChevronOpen = (
        <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor">
          <path d={CHEVRON_UP_PATH} />
        </svg>
      );
      const defaultChevronClosed = (
        <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor">
          <path d={CHEVRON_DOWN_PATH} />
        </svg>
      );

      const resolvedChevronOpen = chevronOpen
        ? typeof chevronOpen === "string"
          ? renderMenuIcon(chevronOpen, 12)
          : chevronOpen
        : defaultChevronOpen;
      const resolvedChevronClosed = chevronClosed
        ? typeof chevronClosed === "string"
          ? renderMenuIcon(chevronClosed, 12)
          : chevronClosed
        : defaultChevronClosed;

      const chevron = showChevron && hasDropdown && (
        <span className={`${base}__chevron`} aria-hidden="true">
          {isOpen ? resolvedChevronOpen : resolvedChevronClosed}
        </span>
      );

      if (hasDropdown) {
        return (
          <ContextMenu
            key={item.key}
            items={item.items!}
            trigger="click"
            placement={isVertical ? "right" : "bottom"}
            open={isOpen}
            onOpenChange={v => {
              if (v) setOpenKey(item.key);
              else if (openKey === item.key) setOpenKey(null);
            }}
            onItemSelect={(key, selectedItem) => {
              onItemSelect?.(key, selectedItem);
              closeAll();
            }}
            disabled={isDisabled}
            className={`${base}__top-wrapper`}
          >
            <button
              id={`${base}-top-${item.key}`}
              type="button"
              role="menuitem"
              className={topCls}
              style={item.style}
              tabIndex={isDisabled ? -1 : 0}
              aria-haspopup="true"
              aria-expanded={isOpen}
              aria-disabled={isDisabled || undefined}
              disabled={isDisabled}
              onMouseEnter={() => handleTopEnter(item)}
              onKeyDown={e => handleBarKeyDown(e, item)}
            >
              {item.icon && (
                <span className={`${base}__icon`} aria-hidden="true">
                  {renderMenuIcon(item.icon)}
                </span>
              )}
              <span className={`${base}__label`}>{item.label}</span>
              {chevron}
            </button>
          </ContextMenu>
        );
      }

      return (
        <button
          key={item.key}
          id={`${base}-top-${item.key}`}
          type="button"
          role="menuitem"
          className={topCls}
          style={item.style}
          tabIndex={isDisabled ? -1 : 0}
          aria-disabled={isDisabled || undefined}
          disabled={isDisabled}
          onClick={() => handleTopClick(item)}
          onKeyDown={e => handleBarKeyDown(e, item)}
        >
          {item.icon && (
            <span className={`${base}__icon`} aria-hidden="true">
              {renderMenuIcon(item.icon)}
            </span>
          )}
          <span className={`${base}__label`}>{item.label}</span>
        </button>
      );
    };
    /** Collect all items for mobile SideMenu (start + items + end) */
    const allMobileItems: MenuItem[] = [
      ...(start ? start.filter(i => i.visible !== false) : []),
      ...visibleItems,
      ...(end ? end.filter(i => i.visible !== false) : []),
    ];

    if (isMobile) {
      return (
        <div
          ref={ref as React.Ref<HTMLDivElement>}
          className={`${base} ${base}--mobile ${hamburgerPosition === "end" ? `${base}--mobile-end` : ""} ${className}`}
          style={style}
          role="menubar"
          aria-label="Menu bar"
        >
          <button
            type="button"
            className={`${base}__hamburger`}
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
          >
            <svg
              width={22}
              height={22}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              {HAMBURGER_RECTS.map((r, i) => (
                <rect
                  key={i}
                  x={r.x}
                  y={r.y}
                  width={r.width}
                  height={r.height}
                  rx=".57"
                  ry=".57"
                />
              ))}
            </svg>
          </button>
          <Drawer
            visible={drawerOpen}
            onHide={() => setDrawerOpen(false)}
            position="left"
            size="sm"
            closable
          >
            <SideMenu
              items={allMobileItems}
              disabled={disabled}
              onItemSelect={(key, item) => {
                onItemSelect?.(key, item);
                if (!item.items || item.items.length === 0)
                  setDrawerOpen(false);
              }}
            />
          </Drawer>
        </div>
      );
    }
    return (
      <div
        ref={el => {
          (barRef as React.MutableRefObject<HTMLDivElement | null>).current =
            el;
          if (typeof ref === "function") ref(el);
          else if (ref)
            (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
        className={classes}
        style={style}
        role="menubar"
        aria-label="Menu bar"
      >
        {start &&
          start
            .filter(i => i.visible !== false)
            .map(item => renderTopItem(item))}
        {visibleItems.map(item => renderTopItem(item))}
        {end && (
          <>
            <div className={`${base}__spacer`} />
            {end
              .filter(i => i.visible !== false)
              .map(item => renderTopItem(item))}
          </>
        )}
      </div>
    );
  }
);

MenuBar.displayName = "MenuBar";
