import React from 'react';

/**
 * Base menu item interface for all navigation components
 */
export interface MenuItem {
  /** Unique identifier for the menu item */
  id?: string;
  /** Display text for the menu item */
  label: string;
  /** URL for navigation - if not provided, will use onClick */
  href?: string;
  /** Icon component to display alongside the label */
  icon?: React.ReactNode;
  /** Submenu items for dropdown/nested navigation */
  items?: MenuItem[];
  /** Custom click handler - used when href is not provided */
  onClick?: (item: MenuItem) => void;
  /** Whether the item is currently active/selected */
  active?: boolean;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Target for link (_blank, _self, etc.) */
  target?: string;
  /** Additional CSS class names */
  className?: string;
  /** Custom data attributes */
  data?: Record<string, any>;
}

/**
 * Navigation router interface for handling navigation
 */
export interface NavigationRouter {
  /** Function to navigate to a route */
  push: (href: string) => void;
  /** Function to replace current route */
  replace?: (href: string) => void;
  /** Current pathname */
  pathname?: string;
}

/**
 * Base props for navigation components
 */
export interface BaseNavigationProps {
  /** Array of menu items */
  items: MenuItem[];
  /** Router instance for programmatic navigation */
  router?: NavigationRouter;
  /** Whether to use router for navigation instead of href */
  useRouter?: boolean;
  /** Additional CSS class names */
  className?: string;
}