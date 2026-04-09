import React from 'react';

/**
 * Base menu item interface for all menu and navigation components.
 * Used by NavigationBar, ContextMenu, MenuBar, SideMenu, Breadcrumb, etc.
 */
export interface MenuItem {
  /** Unique identifier for the menu item */
  key: string;
  /** Display text for the menu item */
  label?: string;
  /** Icon as string name or JSX element */
  icon?: React.ReactNode;
  /** URL for navigation */
  url?: string;
  /** Link target — '_blank' opens in new tab */
  target?: '_blank' | '_self';
  /** Nested submenu items */
  items?: MenuItem[];
  /** Whether this submenu is expanded (controlled) */
  expanded?: boolean;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Whether the item is visible — defaults to true */
  visible?: boolean;
  /** Renders a separator line instead of an item */
  separator?: boolean;
  /** Click handler */
  command?: (item: MenuItem) => void;
  /** Custom render for this item */
  template?: (item: MenuItem) => React.ReactNode;
  /** Arbitrary data attached to the item */
  data?: Record<string, unknown>;
  /** Position of submenu relative to this item (overrides component default) */
  submenuPosition?: 'right' | 'left' | 'top' | 'bottom';
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * Navigation router interface for handling navigation
 */
export interface NavigationRouter {
  /** Function to navigate to a route */
  push: (url: string) => void;
  /** Function to replace current route */
  replace?: (url: string) => void;
  /** Current pathname */
  pathname?: string;
}