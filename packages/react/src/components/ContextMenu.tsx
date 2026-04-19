import React, {
  forwardRef,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import "./ContextMenu.css";
import { MenuItem } from "../types/navigation";
import { renderMenuIcon } from "./resolveIcon";
import { CHEVRON_RIGHT_PATH } from "./iconPaths";
import { useLayerZIndex } from "./LayerContext";

/**
 * Props for the ContextMenu component
 */
export interface ContextMenuProps {
  /** Array of menu items */
  items: MenuItem[];
  /** How the menu is triggered */
  trigger?: "contextmenu" | "click" | "both";
  /** Callback when an item is selected */
  onItemSelect?: (key: string, item: MenuItem) => void;
  /** Whether the menu is disabled */
  disabled?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Default position of submenus relative to their parent item */
  submenuPosition?: "right" | "left" | "top" | "bottom";
  /** Disable mobile layout — always show desktop floating submenus */
  mobileAdaptive?: boolean;
  /** Additional CSS class name for the menu panel */
  panelClassName?: string;
  /** Custom panel template — replaces the default item list rendering. Receives items and a close function */
  panelTemplate?: (items: MenuItem[], close: () => void) => React.ReactNode;
  /** Where the panel opens relative to the trigger on click (default: 'bottom') */
  placement?: "bottom" | "right" | "left" | "top";
  /** Additional CSS class name for the wrapper */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Trigger element(s) */
  children: React.ReactNode;
}

/** Submenu panel that auto-flips when it overflows the viewport */
const SubmenuPanel: React.FC<{
  base: string;
  position: "right" | "left" | "top" | "bottom";
  children: React.ReactNode;
}> = ({ base, position, children }) => {
  const subRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(position);

  useEffect(() => {
    const el = subRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let resolved = position;
    if (position === "right" && rect.right > window.innerWidth)
      resolved = "left";
    else if (position === "left" && rect.left < 0) resolved = "right";
    else if (position === "bottom" && rect.bottom > window.innerHeight)
      resolved = "top";
    else if (position === "top" && rect.top < 0) resolved = "bottom";
    // Secondary axis overflow
    if (
      (resolved === "right" || resolved === "left") &&
      rect.bottom > window.innerHeight
    ) {
      setPos(resolved);
      el.style.top = "auto";
      el.style.bottom = "0";
      return;
    }
    setPos(resolved);
  }, [position]);

  const cls = [`${base}__submenu`, `${base}__submenu--${pos}`]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={subRef} className={cls} role="menu">
      {children}
    </div>
  );
};

/**
 * ContextMenu displays a floating menu triggered by right-click or click.
 *
 * @description A context menu component that renders MenuItem items in a floating
 * panel positioned at the cursor (right-click) or anchored to the trigger (click).
 * Supports nested submenus, icons (string or ReactNode), disabled states, separators,
 * custom templates, and keyboard navigation. On mobile, submenus open inline via tap.
 * Fully accessible with ARIA menu roles.
 *
 * @example
 * ```tsx
 * <ContextMenu
 *   items={[
 *     { key: 'cut', label: 'Cut', icon: 'times' },
 *     { key: 'copy', label: 'Copy' },
 *     { key: 'sep', separator: true },
 *     { key: 'paste', label: 'Paste' },
 *   ]}
 *   trigger="contextmenu"
 * >
 *   <div>Right-click me</div>
 * </ContextMenu>
 * ```
 */
export const ContextMenu = forwardRef<HTMLDivElement, ContextMenuProps>(
  (
    {
      items,
      trigger = "contextmenu",
      onItemSelect,
      disabled = false,
      open: controlledOpen,
      onOpenChange,
      submenuPosition = "right",
      mobileAdaptive = true,
      panelClassName = "",
      panelTemplate,
      placement = "bottom",
      className = "",
      style,
      children,
    },
    ref
  ) => {
    const base = "k-contextmenu";
    const wrapperRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const [internalOpen, setInternalOpen] = useState(false);
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = useCallback(
      (v: boolean | ((prev: boolean) => boolean)) => {
        const next = typeof v === "function" ? v(open) : v;
        setInternalOpen(next);
        onOpenChange?.(next);
      },
      [open, onOpenChange]
    );
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set());
    const [isMobile, setIsMobile] = useState(false);
    const { child: zIndex } = useLayerZIndex();

    const visibleItems = items.filter(item => item.visible !== false);

    useEffect(() => {
      if (!mobileAdaptive) {
        setIsMobile(false);
        return;
      }
      const mq = window.matchMedia("(hover: none)");
      setIsMobile(mq.matches);
      const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }, [mobileAdaptive]);

    const close = useCallback(() => {
      setOpen(false);
      setOpenSubmenus(new Set());
    }, []);

    const calcPosition = useCallback(
      (rect: DOMRect) => {
        switch (placement) {
          case "right":
            return { x: rect.right + 2, y: rect.top };
          case "left":
            return { x: rect.left, y: rect.top };
          case "top":
            return { x: rect.left, y: rect.top };
          default:
            return { x: rect.left, y: rect.bottom + 2 };
        }
      },
      [placement]
    );

    const handleContextMenu = useCallback(
      (e: React.MouseEvent) => {
        if (disabled) return;
        if (trigger === "contextmenu" || trigger === "both") {
          e.preventDefault();
          setPosition({ x: e.clientX, y: e.clientY });
          setOpen(true);
          setOpenSubmenus(new Set());
        }
      },
      [disabled, trigger]
    );

    const handleClick = useCallback(() => {
      if (disabled) return;
      if (trigger === "click" || trigger === "both") {
        const rect = wrapperRef.current?.getBoundingClientRect();
        if (rect) {
          setPosition(calcPosition(rect));
        }
        setOpen(prev => {
          if (prev) setOpenSubmenus(new Set());
          return !prev;
        });
      }
    }, [disabled, trigger]);

    useEffect(() => {
      if (!open || controlledOpen !== undefined) return;
      const handleMouseDown = (e: MouseEvent) => {
        if (
          panelRef.current &&
          !panelRef.current.contains(e.target as Node) &&
          wrapperRef.current &&
          !wrapperRef.current.contains(e.target as Node)
        ) {
          close();
        }
      };
      document.addEventListener("mousedown", handleMouseDown);
      return () => document.removeEventListener("mousedown", handleMouseDown);
    }, [open, close, controlledOpen]);

    useEffect(() => {
      if (!open) return;
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") close();
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, close]);

    /** Reposition when opened via controlled prop (e.g. MenuBar hover) */
    useEffect(() => {
      if (!open || controlledOpen === undefined) return;
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      setPosition(calcPosition(rect));
    }, [open, controlledOpen]);

    useEffect(() => {
      if (!open || !panelRef.current) return;
      const rect = panelRef.current.getBoundingClientRect();
      let { x, y } = position;
      let changed = false;
      if (x + rect.width > window.innerWidth) {
        x = window.innerWidth - rect.width - 8;
        changed = true;
      }
      if (y + rect.height > window.innerHeight) {
        y = window.innerHeight - rect.height - 8;
        changed = true;
      }
      if (x < 0) {
        x = 8;
        changed = true;
      }
      if (y < 0) {
        y = 8;
        changed = true;
      }
      if (changed) setPosition({ x, y });
    }, [open]);

    const handleSelect = useCallback(
      (item: MenuItem) => {
        if (item.disabled) return;
        if (item.items && item.items.length > 0) {
          // Toggle submenu on click/tap
          setOpenSubmenus(prev => {
            const next = new Set(prev);
            if (prev.has(item.key)) next.delete(item.key);
            else next.add(item.key);
            return next;
          });
          return;
        }
        if (item.command) item.command(item);
        if (item.url) {
          if (item.target === "_blank")
            window.open(item.url, "_blank", "noopener");
          else window.location.href = item.url;
        }
        onItemSelect?.(item.key, item);
        close();
      },
      [onItemSelect, close]
    );

    const handleItemKeyDown = useCallback(
      (item: MenuItem, e: React.KeyboardEvent, siblings: MenuItem[]) => {
        const enabled = siblings.filter(
          i => !i.separator && !i.disabled && i.visible !== false
        );
        const idx = enabled.findIndex(i => i.key === item.key);

        if (e.key === "ArrowDown") {
          e.preventDefault();
          const next = enabled[(idx + 1) % enabled.length];
          (
            document.getElementById(`${base}-item-${next.key}`) as HTMLElement
          )?.focus();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          const prev = enabled[(idx - 1 + enabled.length) % enabled.length];
          (
            document.getElementById(`${base}-item-${prev.key}`) as HTMLElement
          )?.focus();
        } else if (
          e.key === "ArrowRight" &&
          item.items &&
          item.items.length > 0
        ) {
          e.preventDefault();
          setOpenSubmenus(prev => new Set(prev).add(item.key));
          setTimeout(() => {
            const first = item.items!.find(
              i => !i.separator && !i.disabled && i.visible !== false
            );
            if (first)
              (
                document.getElementById(
                  `${base}-item-${first.key}`
                ) as HTMLElement
              )?.focus();
          }, 0);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          setOpenSubmenus(prev => {
            const next = new Set(prev);
            next.delete(item.key);
            return next;
          });
        } else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleSelect(item);
        }
      },
      [handleSelect]
    );

    const renderItems = (menuItems: MenuItem[], depth = 0) => {
      const visible = menuItems.filter(i => i.visible !== false);
      return visible.map(item => {
        if (item.separator) {
          return <hr key={item.key} className={`${base}__separator`} />;
        }
        if (item.template) {
          return (
            <React.Fragment key={item.key}>
              {item.template(item)}
            </React.Fragment>
          );
        }

        const hasChildren = item.items && item.items.length > 0;
        const isDisabled = item.disabled;
        const isSubOpen = openSubmenus.has(item.key);

        const itemClasses = [
          `${base}__item`,
          isDisabled && `${base}__item--disabled`,
          hasChildren && `${base}__item--parent`,
          isSubOpen && `${base}__item--open`,
          item.className,
        ]
          .filter(Boolean)
          .join(" ");

        if (isMobile) {
          // Mobile: submenus expand inline
          return (
            <React.Fragment key={item.key}>
              <button
                id={`${base}-item-${item.key}`}
                type="button"
                role="menuitem"
                className={itemClasses}
                style={{ ...item.style, paddingLeft: `${depth * 12 + 12}px` }}
                tabIndex={isDisabled ? -1 : 0}
                aria-disabled={isDisabled || undefined}
                aria-haspopup={hasChildren || undefined}
                aria-expanded={hasChildren ? isSubOpen : undefined}
                disabled={isDisabled}
                onClick={() => handleSelect(item)}
                onKeyDown={e => handleItemKeyDown(item, e, visible)}
              >
                {item.icon && (
                  <span className={`${base}__icon`} aria-hidden="true">
                    {renderMenuIcon(item.icon)}
                  </span>
                )}
                <span className={`${base}__label`}>{item.label}</span>
                {hasChildren && (
                  <span
                    className={`${base}__arrow ${isSubOpen ? `${base}__arrow--open` : ""}`}
                    aria-hidden="true"
                  >
                    <svg
                      width={12}
                      height={12}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d={CHEVRON_RIGHT_PATH} />
                    </svg>
                  </span>
                )}
              </button>
              {hasChildren && isSubOpen && renderItems(item.items!, depth + 1)}
            </React.Fragment>
          );
        }

        // Desktop: submenus float to the right on hover
        return (
          <div
            key={item.key}
            className={`${base}__item-wrapper`}
            onMouseEnter={() => {
              if (hasChildren && !("ontouchstart" in window)) {
                setOpenSubmenus(prev => new Set(prev).add(item.key));
              }
            }}
            onMouseLeave={() => {
              if (hasChildren && !("ontouchstart" in window)) {
                setOpenSubmenus(prev => {
                  const n = new Set(prev);
                  n.delete(item.key);
                  return n;
                });
              }
            }}
          >
            <button
              id={`${base}-item-${item.key}`}
              type="button"
              role="menuitem"
              className={itemClasses}
              style={item.style}
              tabIndex={isDisabled ? -1 : 0}
              aria-disabled={isDisabled || undefined}
              aria-haspopup={hasChildren || undefined}
              aria-expanded={hasChildren ? isSubOpen : undefined}
              disabled={isDisabled}
              onClick={() => handleSelect(item)}
              onKeyDown={e => handleItemKeyDown(item, e, visible)}
            >
              {item.icon && (
                <span className={`${base}__icon`} aria-hidden="true">
                  {renderMenuIcon(item.icon)}
                </span>
              )}
              <span className={`${base}__label`}>{item.label}</span>
              {hasChildren && (
                <span className={`${base}__arrow`} aria-hidden="true">
                  <svg
                    width={12}
                    height={12}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d={CHEVRON_RIGHT_PATH} />
                  </svg>
                </span>
              )}
            </button>
            {hasChildren && isSubOpen && (
              <SubmenuPanel
                base={base}
                position={item.submenuPosition || submenuPosition}
              >
                {renderItems(item.items!, depth + 1)}
              </SubmenuPanel>
            )}
          </div>
        );
      });
    };

    const panelClasses = [
      `${base}__panel`,
      isMobile && `${base}__panel--mobile`,
      panelClassName,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div
        ref={el => {
          (
            wrapperRef as React.MutableRefObject<HTMLDivElement | null>
          ).current = el;
          if (typeof ref === "function") ref(el);
          else if (ref)
            (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
        className={`${base} ${className}`}
        style={style}
        onContextMenu={handleContextMenu}
        onClick={handleClick}
      >
        {children}
        {open &&
          createPortal(
            <div
              ref={panelRef}
              className={panelClasses}
              style={
                isMobile
                  ? { zIndex }
                  : { left: position.x, top: position.y, zIndex }
              }
              role="menu"
              aria-label="Context menu"
              onClick={e => e.stopPropagation()}
              onContextMenu={e => e.stopPropagation()}
            >
              {panelTemplate
                ? panelTemplate(visibleItems, close)
                : renderItems(visibleItems)}
            </div>,
            document.body
          )}
      </div>
    );
  }
);

ContextMenu.displayName = "ContextMenu";
