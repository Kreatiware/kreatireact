import React from 'react';
import './NavigationBar.css';
import { MenuItem, NavigationRouter } from '../types/navigation';

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
  className = '',
}) => {
  const baseClass = 'kreati-navbar';
  const classes = [
    baseClass,
    transparent ? `${baseClass}--transparent` : `${baseClass}--solid`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  /**
   * Handle navigation item click
   */
  const handleItemClick = (item: MenuItem, event: React.MouseEvent) => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    if (item.onClick) {
      event.preventDefault();
      item.onClick(item);
      return;
    }

    if (useRouter && router && item.href) {
      event.preventDefault();
      router.push(item.href);
      return;
    }
  };

  /**
   * Render navigation item
   */
  const renderNavItem = (item: MenuItem, index: number) => {
    const itemClasses = [
      'kreati-navbar__link',
      item.active && 'kreati-navbar__link--active',
      item.disabled && 'kreati-navbar__link--disabled',
      item.className,
    ]
      .filter(Boolean)
      .join(' ');

    const content = (
      <>
        {item.icon && <span className="kreati-navbar__link-icon">{item.icon}</span>}
        <span className="kreati-navbar__link-text">{item.label}</span>
        {item.items && item.items.length > 0 && (
          <span className="kreati-navbar__link-arrow">▼</span>
        )}
      </>
    );

    if (item.href && !item.onClick && !useRouter) {
      return (
        <a
          key={item.id || index}
          href={item.href}
          target={item.target}
          className={itemClasses}
          onClick={(e) => handleItemClick(item, e)}
          {...item.data}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        key={item.id || index}
        type="button"
        className={itemClasses}
        onClick={(e) => handleItemClick(item, e)}
        disabled={item.disabled}
        {...item.data}
      >
        {content}
      </button>
    );
  };

  return (
    <nav className={classes}>
      <div className="kreati-navbar__container">
        {/* Left Items */}
        <div className="kreati-navbar__section kreati-navbar__section--left">
          {leftItems.map((item, index) => renderNavItem(item, index))}
        </div>

        {/* Logo Center */}
        <div className="kreati-navbar__logo">
          {typeof logo === 'string' ? (
            <span className="kreati-navbar__logo-text">{logo}</span>
          ) : (
            logo
          )}
        </div>

        {/* Right Items */}
        <div className="kreati-navbar__section kreati-navbar__section--right">
          {rightItems.map((item, index) => renderNavItem(item, index))}
        </div>
      </div>
    </nav>
  );
};