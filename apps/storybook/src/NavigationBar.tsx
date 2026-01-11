import React from 'react';
import './NavigationBar.css';

export interface MenuItem {
  id?: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
  onClick?: (item: MenuItem) => void;
  active?: boolean;
  disabled?: boolean;
  target?: string;
  className?: string;
  data?: Record<string, any>;
}

export interface NavigationBarProps {
  logo?: React.ReactNode | string;
  leftItems?: MenuItem[];
  rightItems?: MenuItem[];
  useRouter?: boolean;
  transparent?: boolean;
  className?: string;
}

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
  };

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
      </div>
    </nav>
  );
};