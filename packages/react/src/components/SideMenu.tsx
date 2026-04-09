import React, { forwardRef, useState, useCallback } from 'react';
import './SideMenu.css';
import { MenuItem } from '../types/navigation';
import { renderMenuIcon } from './resolveIcon';
import { CHEVRON_DOWN_PATH } from './iconPaths';

/**
 * Props for the SideMenu component
 */
export interface SideMenuProps {
  /** Array of menu items */
  items: MenuItem[];
  /** Key of the currently active item */
  activeKey?: string;
  /** Callback when an item is selected */
  onItemSelect?: (key: string, item: MenuItem) => void;
  /** Whether all items are disabled */
  disabled?: boolean;
  /** Whether to allow multiple submenus open at once */
  multiple?: boolean;
  /** Position of the expand/collapse icon for parent items */
  iconPosition?: 'start' | 'end';
  /** Custom template for rendering parent items (items with children) */
  headerTemplate?: (item: MenuItem, isExpanded: boolean, toggle: () => void) => React.ReactNode;
  /** Enable expand/collapse animation */
  animated?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * SideMenu displays a vertical navigation menu with expandable submenus.
 *
 * @description A vertical menu component that renders MenuItem items with accordion-style
 * submenu expansion. Supports icons (string or ReactNode), disabled states, separators,
 * custom templates, and keyboard navigation. Can be used standalone or inside a Drawer
 * for mobile navigation. Fully accessible with ARIA tree/treeitem roles.
 *
 * @example
 * ```tsx
 * <SideMenu
 *   items={[
 *     { key: 'home', label: 'Home', icon: 'check' },
 *     { key: 'products', label: 'Products', items: [
 *       { key: 'web', label: 'Web' },
 *       { key: 'mobile', label: 'Mobile' },
 *     ]},
 *   ]}
 *   activeKey="home"
 *   onItemSelect={(key) => console.log(key)}
 * />
 * ```
 */
export const SideMenu = forwardRef<HTMLElement, SideMenuProps>(
  (
    {
      items,
      activeKey,
      onItemSelect,
      disabled = false,
      multiple = false,
      iconPosition = 'end',
      headerTemplate,
      animated = true,
      className = '',
      style,
    },
    ref,
  ) => {
    const base = 'k-sidemenu';
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => {
      const initial = new Set<string>();
      const findExpanded = (menuItems: MenuItem[]) => {
        for (const item of menuItems) {
          if (item.expanded && item.items) initial.add(item.key);
          if (item.items) findExpanded(item.items);
        }
      };
      findExpanded(items);
      return initial;
    });

    const classes = [base, disabled && `${base}--disabled`, className]
      .filter(Boolean)
      .join(' ');

    const toggleExpand = useCallback(
      (key: string) => {
        setExpandedKeys((prev) => {
          const next = new Set(prev);
          if (prev.has(key)) {
            // Collapse: remove this key and all descendant keys
            next.delete(key);
            const removeChildren = (menuItems: MenuItem[]) => {
              for (const item of menuItems) {
                if (item.items) {
                  next.delete(item.key);
                  removeChildren(item.items);
                }
              }
            };
            const findAndRemove = (menuItems: MenuItem[]) => {
              for (const item of menuItems) {
                if (item.key === key && item.items) {
                  removeChildren(item.items);
                  return;
                }
                if (item.items) findAndRemove(item.items);
              }
            };
            findAndRemove(items);
          } else {
            if (!multiple) {
              // Close siblings at the same level, keep ancestors
              const closeSiblings = (menuItems: MenuItem[]) => {
                for (const item of menuItems) {
                  if (item.key === key) return true;
                  if (item.items) {
                    if (closeSiblings(item.items)) return true;
                  }
                }
                return false;
              };
              const clearLevel = (menuItems: MenuItem[]) => {
                let found = false;
                for (const item of menuItems) {
                  if (item.key === key) {
                    found = true;
                  } else if (item.items && !closeSiblings(item.items)) {
                    next.delete(item.key);
                  }
                  if (item.items) clearLevel(item.items);
                }
                return found;
              };
              clearLevel(items);
            }
            next.add(key);
          }
          return next;
        });
      },
      [multiple, items],
    );

    const handleSelect = useCallback(
      (item: MenuItem) => {
        if (disabled || item.disabled) return;
        if (item.items && item.items.length > 0) {
          toggleExpand(item.key);
          return;
        }
        if (item.command) item.command(item);
        if (item.url) {
          if (item.target === '_blank') {
            window.open(item.url, '_blank', 'noopener');
          } else {
            window.location.href = item.url;
          }
        }
        onItemSelect?.(item.key, item);
      },
      [disabled, onItemSelect, toggleExpand],
    );

    const handleKeyDown = useCallback(
      (item: MenuItem, e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelect(item);
        }
        if (item.items && item.items.length > 0) {
          if (e.key === 'ArrowRight' && !expandedKeys.has(item.key)) {
            e.preventDefault();
            toggleExpand(item.key);
          }
          if (e.key === 'ArrowLeft' && expandedKeys.has(item.key)) {
            e.preventDefault();
            toggleExpand(item.key);
          }
        }
      },
      [handleSelect, expandedKeys, toggleExpand],
    );

    const renderItem = (item: MenuItem, depth: number): React.ReactNode => {
      if (item.visible === false) return null;

      if (item.separator) {
        return <hr key={item.key} className={`${base}__separator`} />;
      }

      if (item.template) {
        return <React.Fragment key={item.key}>{item.template(item)}</React.Fragment>;
      }

      const hasChildren = item.items && item.items.length > 0;
      const isExpanded = expandedKeys.has(item.key);
      const isActive = activeKey === item.key;
      const isDisabled = disabled || item.disabled;
      const toggleItem = () => handleSelect(item);

      if (hasChildren && headerTemplate) {
        return (
          <li key={item.key} role="none">
            {headerTemplate(item, isExpanded, toggleItem)}
            {isExpanded && (
              <ul className={`${base}__submenu ${animated ? `${base}__submenu--animated` : ''}`} role="group">
                {item.items!.map((child) => renderItem(child, depth + 1))}
              </ul>
            )}
          </li>
        );
      }

      const itemClasses = [
        `${base}__item`,
        isActive && `${base}__item--active`,
        isDisabled && `${base}__item--disabled`,
        hasChildren && `${base}__item--parent`,
        item.className,
      ]
        .filter(Boolean)
        .join(' ');

      const arrow = hasChildren && (
        <span
          className={`${base}__arrow ${isExpanded ? `${base}__arrow--open` : ''}`}
          aria-hidden="true"
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
            <path d={CHEVRON_DOWN_PATH} />
          </svg>
        </span>
      );

      return (
        <li key={item.key} role="none">
          <button
            type="button"
            role="treeitem"
            className={itemClasses}
            style={{ ...item.style, paddingLeft: `${(depth * 16) + 12}px` }}
            tabIndex={isDisabled ? -1 : 0}
            aria-expanded={hasChildren ? isExpanded : undefined}
            aria-selected={isActive}
            aria-disabled={isDisabled || undefined}
            disabled={isDisabled}
            onClick={toggleItem}
            onKeyDown={(e) => handleKeyDown(item, e)}
          >
            {iconPosition === 'start' && arrow}
            {item.icon && (
              <span className={`${base}__icon`} aria-hidden="true">
                {renderMenuIcon(item.icon)}
              </span>
            )}
            <span className={`${base}__label`}>{item.label}</span>
            {iconPosition === 'end' && arrow}
          </button>
          {hasChildren && isExpanded && (
            <ul className={`${base}__submenu ${animated ? `${base}__submenu--animated` : ''}`} role="group">
              {item.items!.map((child) => renderItem(child, depth + 1))}
            </ul>
          )}
        </li>
      );
    };

    return (
      <nav ref={ref} className={classes} style={style} aria-label="Side menu">
        <ul className={`${base}__list`} role="tree">
          {items.map((item) => renderItem(item, 0))}
        </ul>
      </nav>
    );
  },
);

SideMenu.displayName = 'SideMenu';
