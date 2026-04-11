import React, { forwardRef, useState, useCallback, Children, isValidElement } from 'react';
import { TabMenu } from './TabMenu';
import type { TabMenuProps } from './TabMenu';
import type { MenuItem } from '../types/navigation';
import './Tabs.css';

/**
 * Props for the TabPanel component
 */
export interface TabPanelProps {
  /** Unique key identifying this panel */
  tabKey: string;
  /** Tab label text */
  header?: string;
  /** Tab icon — string name resolved internally or ReactNode */
  icon?: React.ReactNode;
  /** Whether this tab is disabled */
  disabled?: boolean;
  /** Panel content */
  children?: React.ReactNode;
  /** Additional CSS class name for the panel */
  className?: string;
  /** Inline styles for the panel */
  style?: React.CSSProperties;
}

/**
 * TabPanel defines a single content panel within Tabs.
 *
 * @description Must be used as a direct child of Tabs. Each panel requires a unique
 * `tabKey` prop. The `header` and `icon` props generate the corresponding tab in the
 * TabMenu navigation. Content is only rendered when the panel is active.
 *
 * @example
 * ```tsx
 * <Tabs>
 *   <TabPanel tabKey="home" header="Home">Home content</TabPanel>
 *   <TabPanel tabKey="profile" header="Profile">Profile content</TabPanel>
 * </Tabs>
 * ```
 */
export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(
  (_props, _ref) => null,
);

TabPanel.displayName = 'TabPanel';

/**
 * Props for the Tabs component
 */
export interface TabsProps {
  /** Controlled active tab key */
  activeKey?: string;
  /** Default active tab key for uncontrolled mode */
  defaultActiveKey?: string;
  /** Callback when active tab changes */
  onTabChange?: (key: string) => void;
  /** Props forwarded to the internal TabMenu component */
  tabMenuProps?: Omit<TabMenuProps, 'items' | 'activeKey' | 'onTabChange'>;
  /** TabPanel children */
  children: React.ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * Tabs combines TabMenu navigation with TabPanel content panels.
 *
 * @description Renders TabPanel children as content areas switched by a TabMenu header.
 * Tab items are generated automatically from each TabPanel's `header`, `icon`, and
 * `disabled` props. Supports controlled (`activeKey` + `onTabChange`) and uncontrolled
 * (`defaultActiveKey`) modes. Use `tabMenuProps` to customize the internal TabMenu.
 * Only the active panel is rendered.
 *
 * @example
 * ```tsx
 * <Tabs defaultActiveKey="home">
 *   <TabPanel tabKey="home" header="Home"><p>Home content</p></TabPanel>
 *   <TabPanel tabKey="profile" header="Profile"><p>Profile content</p></TabPanel>
 * </Tabs>
 * ```
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ activeKey: controlledKey, defaultActiveKey, onTabChange, tabMenuProps, children, className = '', style }, ref) => {
    const panels = Children.toArray(children).filter(
      (child): child is React.ReactElement<TabPanelProps> =>
        isValidElement(child) && (child.type as { displayName?: string }).displayName === 'TabPanel',
    );

    const firstKey = panels[0]?.props.tabKey;
    const isControlled = controlledKey !== undefined;
    const [internalKey, setInternalKey] = useState(defaultActiveKey ?? firstKey);
    const activeTabKey = isControlled ? controlledKey : internalKey;

    const handleChange = useCallback((key: string) => {
      if (!isControlled) setInternalKey(key);
      onTabChange?.(key);
    }, [isControlled, onTabChange]);

    const items: MenuItem[] = panels.map((p) => ({
      key: p.props.tabKey,
      label: p.props.header,
      icon: p.props.icon,
      disabled: p.props.disabled,
    }));

    const activePanel = panels.find((p) => p.props.tabKey === activeTabKey);
    const classes = ['k-tabs', className].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classes} style={style}>
        <TabMenu
          items={items}
          activeKey={activeTabKey}
          onTabChange={(key) => handleChange(key)}
          {...tabMenuProps}
        />
        {activePanel && (
          <div
            className={`k-tabs__panels ${activePanel.props.className ?? ''}`}
            style={activePanel.props.style}
            role="tabpanel"
            id={`k-tabmenu-panel-${activeTabKey}`}
            aria-labelledby={`k-tabmenu-tab-${activeTabKey}`}
          >
            {activePanel.props.children}
          </div>
        )}
      </div>
    );
  },
);

Tabs.displayName = 'Tabs';
