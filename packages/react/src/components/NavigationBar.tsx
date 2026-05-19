import React, { useState, useRef, useEffect, useCallback } from "react";
import "./NavigationBar.css";
import { MenuItem, NavigationRouter } from "../types/navigation";
import { CHEVRON_DOWN_PATH, HAMBURGER_RECTS } from "./iconPaths";
import { sanitizeUrl } from "./sanitizeUrl";
import { Drawer } from "./Drawer";
import { SideMenu } from "./SideMenu";

/**
 * Props for the NavigationBar component
 */
export interface NavigationBarProps {
  /** Logo content - can be a string or React component */
  logo?: React.ReactNode | string;
  /** Array of navigation items displayed at the start (left) */
  start?: MenuItem[];
  /** Array of navigation items displayed at the end (right) */
  end?: MenuItem[];
  /** Router instance for programmatic navigation */
  router?: NavigationRouter;
  /** Whether to use router for navigation instead of url */
  useRouter?: boolean;
  /** Whether the navigation bar should have a transparent background with blur effect */
  transparent?: boolean;
  /** Breakpoint (px) at which mobile mode activates */
  mobileBreakpoint?: number;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * NavigationBar component with centered logo and split navigation items.
 *
 * @description A modern navigation bar with a centered logo flanked by decorative separators.
 * Items are split into left and right sections around the logo. Supports both transparent
 * and solid background modes with smooth hover effects. Uses the universal MenuItem interface
 * for consistent navigation across all components. Fully accessible with keyboard navigation
 * (Escape to close, Tab/Shift+Tab to navigate).
 *
 * @example
 * ```tsx
 * <NavigationBar
 *   logo="BRAND"
 *   start={[
 *     { key: 'products', label: 'Products', items: [{ key: 'web', label: 'Web', url: '/web' }] },
 *     { key: 'about', label: 'About', url: '/about' },
 *   ]}
 *   end={[{ key: 'contact', label: 'Contact', url: '/contact' }]}
 *   transparent={true}
 * />
 * ```
 */
export const NavigationBar = ({
  logo = "LOGO",
  start = [
    { key: "about", label: "About", url: "#about" },
    { key: "projects", label: "Projects", url: "#projects" },
  ],
  end = [
    { key: "shop", label: "Shop", url: "#shop" },
    { key: "contact", label: "Contact", url: "#contact" },
  ],
  router,
  useRouter = false,
  transparent = true,
  mobileBreakpoint = 768,
  className = "",
  style,
  ref,
}: NavigationBarProps & { ref?: React.Ref<HTMLElement> }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const baseClass = "kreati-navbar";
  const classes = [
    baseClass,
    transparent ? `${baseClass}--transparent` : `${baseClass}--solid`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${mobileBreakpoint}px)`);
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
      if (!e.matches) {
        setMobileOpen(false);
        setOpenDropdown(null);
      }
    };
    onChange(mq);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mobileBreakpoint]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutside = Object.values(dropdownRefs.current).every(
        r => r && !r.contains(target)
      );
      if (isOutside) setOpenDropdown(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (openDropdown) setOpenDropdown(null);
        if (mobileOpen) closeMobile();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [openDropdown, mobileOpen]);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, []);

  const handleItemClick = (item: MenuItem, event: React.MouseEvent) => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    if (item.items && item.items.length > 0) {
      event.preventDefault();
      setOpenDropdown(openDropdown === item.key ? null : item.key);
      return;
    }

    if (item.command) {
      event.preventDefault();
      item.command(item);
      setOpenDropdown(null);
      return;
    }

    if (useRouter && router && item.url) {
      const safe = sanitizeUrl(item.url);
      if (!safe) return;
      event.preventDefault();
      router.push(safe);
      setOpenDropdown(null);
      return;
    }

    setOpenDropdown(null);
    if (isMobile) closeMobile();
  };

  const handleItemKeyDown = (item: MenuItem, event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleItemClick(item, event as unknown as React.MouseEvent);
    }
  };

  const renderNavItem = (item: MenuItem, index: number) => {
    if (item.visible === false) return null;
    if (item.separator)
      return (
        <hr
          key={item.key || `sep-${index}`}
          className="kreati-navbar__separator"
        />
      );

    const hasDropdown = item.items && item.items.length > 0;
    const isOpen = openDropdown === item.key;

    if (item.template) {
      return (
        <React.Fragment key={item.key}>{item.template(item)}</React.Fragment>
      );
    }

    const itemClasses = [
      "kreati-navbar__link",
      item.disabled && "kreati-navbar__link--disabled",
      hasDropdown && "kreati-navbar__link--has-dropdown",
      item.className,
    ]
      .filter(Boolean)
      .join(" ");

    const content = (
      <>
        {item.icon && (
          <span className="kreati-navbar__link-icon" aria-hidden="true">
            {item.icon}
          </span>
        )}
        <span className="kreati-navbar__link-text">{item.label}</span>
        {hasDropdown && (
          <span
            className={`kreati-navbar__link-arrow ${isOpen ? "kreati-navbar__link-arrow--open" : ""}`}
            aria-hidden="true"
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d={CHEVRON_DOWN_PATH} />
            </svg>
          </span>
        )}
      </>
    );

    const linkElement =
      item.url && !item.command && !useRouter && !hasDropdown ? (
        <a
          key={item.key}
          href={sanitizeUrl(item.url)}
          target={item.target}
          rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
          className={itemClasses}
          style={item.style}
          onClick={e => handleItemClick(item, e)}
          onKeyDown={e => handleItemKeyDown(item, e)}
          aria-haspopup={hasDropdown ? "true" : undefined}
          aria-expanded={hasDropdown ? isOpen : undefined}
        >
          {content}
        </a>
      ) : (
        <button
          key={item.key}
          type="button"
          className={itemClasses}
          style={item.style}
          onClick={e => handleItemClick(item, e)}
          onKeyDown={e => handleItemKeyDown(item, e)}
          disabled={item.disabled}
          aria-haspopup={hasDropdown ? "true" : undefined}
          aria-expanded={hasDropdown ? isOpen : undefined}
        >
          {content}
        </button>
      );

    if (hasDropdown) {
      return (
        <div
          key={item.key}
          className="kreati-navbar__dropdown-wrapper"
          ref={el => {
            dropdownRefs.current[item.key] = el;
          }}
        >
          {linkElement}
          {isOpen && (
            <div
              className="kreati-navbar__dropdown"
              role="menu"
              aria-label={item.label}
            >
              {item.items!.map((subItem, subIndex) => {
                if (subItem.visible === false) return null;
                if (subItem.separator)
                  return (
                    <hr
                      key={subItem.key || `sep-${subIndex}`}
                      className="kreati-navbar__dropdown-separator"
                    />
                  );
                if (subItem.template)
                  return (
                    <React.Fragment key={subItem.key}>
                      {subItem.template(subItem)}
                    </React.Fragment>
                  );

                return (
                  <a
                    key={subItem.key}
                    href={sanitizeUrl(subItem.url) || "#"}
                    target={subItem.target}
                    rel={
                      subItem.target === "_blank"
                        ? "noopener noreferrer"
                        : undefined
                    }
                    role="menuitem"
                    className={`kreati-navbar__dropdown-item ${
                      subItem.disabled
                        ? "kreati-navbar__dropdown-item--disabled"
                        : ""
                    } ${subItem.className || ""}`}
                    style={subItem.style}
                    tabIndex={subItem.disabled ? -1 : 0}
                    aria-disabled={subItem.disabled || undefined}
                    onClick={e => {
                      if (subItem.disabled) {
                        e.preventDefault();
                        return;
                      }
                      if (subItem.command) {
                        e.preventDefault();
                        subItem.command(subItem);
                        setOpenDropdown(null);
                      } else if (useRouter && router && subItem.url) {
                        e.preventDefault();
                        router.push(subItem.url);
                        setOpenDropdown(null);
                      } else {
                        setOpenDropdown(null);
                        if (isMobile) closeMobile();
                      }
                    }}
                  >
                    {subItem.icon && (
                      <span
                        className="kreati-navbar__dropdown-item-icon"
                        aria-hidden="true"
                      >
                        {subItem.icon}
                      </span>
                    )}
                    <span>{subItem.label}</span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return linkElement;
  };

  const allItems = [...start, ...end];

  return (
    <nav
      ref={ref}
      className={classes}
      style={style}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="kreati-navbar__container">
        {!isMobile && (
          <>
            <div className="kreati-navbar__section kreati-navbar__section--left">
              {start.map((item, index) => renderNavItem(item, index))}
            </div>

            <div className="kreati-navbar__logo">
              {typeof logo === "string" ? (
                <span className="kreati-navbar__logo-text">{logo}</span>
              ) : (
                logo
              )}
            </div>

            <div className="kreati-navbar__section kreati-navbar__section--right">
              {end.map((item, index) => renderNavItem(item, index))}
            </div>
          </>
        )}

        {isMobile && (
          <>
            <span className="kreati-navbar__spacer" aria-hidden="true" />

            <div className="kreati-navbar__logo">
              {typeof logo === "string" ? (
                <span className="kreati-navbar__logo-text">{logo}</span>
              ) : (
                logo
              )}
            </div>

            <button
              type="button"
              className="kreati-navbar__hamburger"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              <svg
                width={24}
                height={24}
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
          </>
        )}
      </div>

      {isMobile && (
        <Drawer
          visible={mobileOpen}
          onHide={closeMobile}
          position="right"
          size="sm"
          closable
        >
          <SideMenu
            items={allItems}
            onItemSelect={(key, item) => {
              if (!item.items || item.items.length === 0) {
                closeMobile();
              }
            }}
          />
        </Drawer>
      )}
    </nav>
  );
};
