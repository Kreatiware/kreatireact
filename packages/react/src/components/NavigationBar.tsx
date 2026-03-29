import React, { useState, useRef, useEffect, useCallback } from 'react';
import './NavigationBar.css';
import { MenuItem, NavigationRouter } from '../types/navigation';
import { KreatiIcon, ChevronDown, Menu, Times } from '@kreatiware/icons';

/**
 * Props for the NavigationBar component
 */
export interface NavigationBarProps {
  /** Logo content - can be a string or React component */
  logo?: React.ReactNode | string;
  /** Array of navigation items displayed on the left side */
  leftItems?: MenuItem[];
  /** Array of navigation items displayed on the right side */
  rightItems?: MenuItem[];
  /** Router instance for programmatic navigation */
  router?: NavigationRouter;
  /** Whether to use router for navigation instead of href */
  useRouter?: boolean;
  /** Whether the navigation bar should have a transparent background with blur effect */
  transparent?: boolean;
  /** Breakpoint (px) at which mobile mode activates */
  mobileBreakpoint?: number;
  /** Additional CSS class names */
  className?: string;
}

/**
 * NavigationBar component with centered logo and split navigation items
 * 
 * @description A modern navigation bar with a centered logo flanked by decorative separators.
 * Items are split into left and right sections around the logo. Supports both transparent
 * and solid background modes with smooth hover effects. Uses the universal MenuItem interface
 * for consistent navigation across all components.
 * 
 * @example
 * ```tsx
 * const menuItems = [
 *   { 
 *     label: 'Products', 
 *     href: '/products',
 *     icon: <ShopIcon />,
 *     items: [
 *       { label: 'Laptops', href: '/products/laptops' },
 *       { label: 'Phones', href: '/products/phones' }
 *     ]
 *   },
 *   { 
 *     label: 'About', 
 *     onClick: (item) => console.log('About clicked'),
 *     icon: <InfoIcon />
 *   }
 * ];
 * 
 * <NavigationBar
 *   logo="BRAND"
 *   leftItems={menuItems}
 *   rightItems={[{ label: 'Contact', href: '/contact' }]}
 *   router={useRouter()}
 *   useRouter={true}
 *   transparent={true}
 * />
 * ```
 * 
 * @param props - NavigationBar component props
 * @returns JSX.Element
 */
export const NavigationBar: React.FC<NavigationBarProps> = ({
  logo = 'LOGO',
  leftItems = [
    { label: 'About', href: '#about' },
    { label: 'Projects', href: '#projects' }
  ],
  rightItems = [
    { label: 'Shop', href: '#shop' },
    { label: 'Contact', href: '#contact' }
  ],
  router,
  useRouter = false,
  transparent = true,
  mobileBreakpoint = 768,
  className = '',
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const baseClass = 'kreati-navbar';
  const classes = [
    baseClass,
    transparent ? `${baseClass}--transparent` : `${baseClass}--solid`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Detect mobile viewport
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
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [mobileBreakpoint]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutside = Object.values(dropdownRefs.current).every(
        (ref) => ref && !ref.contains(target)
      );
      if (isOutside) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, []);

  /**
   * Handle navigation item click
   */
  const handleItemClick = (item: MenuItem, event: React.MouseEvent) => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    // Toggle dropdown if item has subitems
    if (item.items && item.items.length > 0) {
      event.preventDefault();
      const itemId = item.id || item.label;
      setOpenDropdown(openDropdown === itemId ? null : itemId);
      return;
    }

    if (item.onClick) {
      event.preventDefault();
      item.onClick(item);
      setOpenDropdown(null);
      return;
    }

    if (useRouter && router && item.href) {
      event.preventDefault();
      router.push(item.href);
      setOpenDropdown(null);
      return;
    }

    // Close dropdown on navigation
    setOpenDropdown(null);
    if (isMobile) closeMobile();
  };

  /**
   * Render navigation item
   */
  const renderNavItem = (item: MenuItem, index: number) => {
    const itemId = item.id || item.label;
    const hasDropdown = item.items && item.items.length > 0;
    const isOpen = openDropdown === itemId;

    const itemClasses = [
      'kreati-navbar__link',
      item.active && 'kreati-navbar__link--active',
      item.disabled && 'kreati-navbar__link--disabled',
      hasDropdown && 'kreati-navbar__link--has-dropdown',
      item.className,
    ]
      .filter(Boolean)
      .join(' ');

    const content = (
      <>
        {item.icon && <span className="kreati-navbar__link-icon">{item.icon}</span>}
        <span className="kreati-navbar__link-text">{item.label}</span>
        {hasDropdown && (
          <span className={`kreati-navbar__link-arrow ${isOpen ? 'kreati-navbar__link-arrow--open' : ''}`}>
            <KreatiIcon size={18}>
              <ChevronDown />
            </KreatiIcon>
          </span>
        )}
      </>
    );

    const linkElement = item.href && !item.onClick && !useRouter && !hasDropdown ? (
      <a
        key={item.id || index}
        href={item.href}
        target={item.target}
        className={itemClasses}
        onClick={(e) => handleItemClick(item, e)}
        aria-haspopup={hasDropdown ? 'true' : undefined}
        aria-expanded={hasDropdown ? isOpen : undefined}
        {...item.data}
      >
        {content}
      </a>
    ) : (
      <button
        key={item.id || index}
        type="button"
        className={itemClasses}
        onClick={(e) => handleItemClick(item, e)}
        disabled={item.disabled}
        aria-haspopup={hasDropdown ? 'true' : undefined}
        aria-expanded={hasDropdown ? isOpen : undefined}
        {...item.data}
      >
        {content}
      </button>
    );

    // Wrap with dropdown container if has subitems
    if (hasDropdown) {
      return (
        <div
          key={item.id || index}
          className="kreati-navbar__dropdown-wrapper"
          ref={(el) => (dropdownRefs.current[itemId] = el)}
        >
          {linkElement}
          {isOpen && (
            <div className="kreati-navbar__dropdown">
              {item.items!.map((subItem, subIndex) => (
                <a
                  key={subItem.id || subIndex}
                  href={subItem.href || '#'}
                  className={`kreati-navbar__dropdown-item ${
                    subItem.active ? 'kreati-navbar__dropdown-item--active' : ''
                  } ${
                    subItem.disabled ? 'kreati-navbar__dropdown-item--disabled' : ''
                  }`}
                  onClick={(e) => {
                    if (subItem.disabled) {
                      e.preventDefault();
                      return;
                    }
                    if (subItem.onClick) {
                      e.preventDefault();
                      subItem.onClick(subItem);
                      setOpenDropdown(null);
                    } else if (useRouter && router && subItem.href) {
                      e.preventDefault();
                      router.push(subItem.href);
                      setOpenDropdown(null);
                    } else {
                      setOpenDropdown(null);
                      if (isMobile) closeMobile();
                    }
                  }}
                >
                  {subItem.icon && <span className="kreati-navbar__dropdown-item-icon">{subItem.icon}</span>}
                  <span>{subItem.label}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      );
    }

    return linkElement;
  };

  const allItems = [...leftItems, ...rightItems];

  return (
    <nav className={classes}>
      <div className="kreati-navbar__container">
        {/* Desktop layout */}
        {!isMobile && (
          <>
            <div className="kreati-navbar__section kreati-navbar__section--left">
              {leftItems.map((item, index) => renderNavItem(item, index))}
            </div>

            <div className="kreati-navbar__logo">
              {typeof logo === 'string' ? (
                <span className="kreati-navbar__logo-text">{logo}</span>
              ) : (
                logo
              )}
            </div>

            <div className="kreati-navbar__section kreati-navbar__section--right">
              {rightItems.map((item, index) => renderNavItem(item, index))}
            </div>
          </>
        )}

        {/* Mobile layout */}
        {isMobile && (
          <>
            <span className="kreati-navbar__spacer" aria-hidden="true" />

            <div className="kreati-navbar__logo">
              {typeof logo === 'string' ? (
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
            >
              <KreatiIcon size={24}><Menu /></KreatiIcon>
            </button>
          </>
        )}
      </div>

      {/* Mobile Drawer */}
      {isMobile && (
        <>
          <div
            className={`kreati-navbar__overlay ${mobileOpen ? 'kreati-navbar__overlay--visible' : ''}`}
            onClick={closeMobile}
          />
          <div className={`kreati-navbar__drawer ${mobileOpen ? 'kreati-navbar__drawer--open' : ''}`}>
            <div className="kreati-navbar__drawer-header">
              <button
                type="button"
                className="kreati-navbar__drawer-close"
                onClick={closeMobile}
                aria-label="Close menu"
              >
                <KreatiIcon size={20}><Times /></KreatiIcon>
              </button>
            </div>
            <div className="kreati-navbar__drawer-items">
              {allItems.map((item, index) => renderNavItem(item, index))}
            </div>
          </div>
        </>
      )}
    </nav>
  );
};