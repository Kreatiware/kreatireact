import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TabMenu } from '../../../../packages/react/src/components/TabMenu';
import type { MenuItem } from '../../../../packages/react/src/types/navigation';

const meta = {
  title: 'Components/TabMenu',
  component: TabMenu,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A horizontal tab-based navigation menu with animated ink bar indicator. Supports icons, disabled states, separators, keyboard navigation (Arrow keys, Home, End), and custom templates. Fully accessible with ARIA tablist/tab roles.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    activeKey: {
      control: 'text',
      description: 'Key of the currently active tab',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether all tabs are disabled',
    },
  },
} satisfies Meta<typeof TabMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicItems: MenuItem[] = [
  { key: 'home', label: 'Home' },
  { key: 'profile', label: 'Profile' },
  { key: 'messages', label: 'Messages' },
  { key: 'settings', label: 'Settings' },
];

/**
 * Basic tab menu with simple text labels.
 */
export const Default: Story = {
  args: {
    items: basicItems,
    activeKey: 'home',
  },
};

/**
 * Controlled tab menu with state management.
 * Click tabs to see the active indicator animate.
 */
export const Controlled: Story = {
  args: {} as any,
  render: () => {
    const [active, setActive] = useState('home');
    return (
      <TabMenu
        items={basicItems}
        activeKey={active}
        onTabChange={(key) => setActive(key)}
      />
    );
  },
};

/**
 * Tabs with icons alongside labels.
 * Icons can be passed as string names (resolved internally) or as ReactNode.
 */
export const WithIcons: Story = {
  args: {} as any,
  render: () => {
    const items: MenuItem[] = [
      { key: 'home', label: 'Home', icon: 'check' },
      { key: 'search', label: 'Search', icon: 'search' },
      { key: 'calendar', label: 'Calendar', icon: 'calendar' },
      { key: 'settings', label: 'Settings', icon: <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1115.6 12 3.6 3.6 0 0112 15.6z"/></svg> },
    ];
    const [active, setActive] = useState('home');
    return <TabMenu items={items} activeKey={active} onTabChange={(key) => setActive(key)} />;
  },
};

/**
 * Some tabs can be individually disabled.
 */
export const WithDisabledTabs: Story = {
  args: {} as any,
  render: () => {
    const items: MenuItem[] = [
      { key: 'home', label: 'Home' },
      { key: 'profile', label: 'Profile' },
      { key: 'admin', label: 'Admin', disabled: true },
      { key: 'settings', label: 'Settings' },
    ];
    const [active, setActive] = useState('home');
    return <TabMenu items={items} activeKey={active} onTabChange={(key) => setActive(key)} />;
  },
};

/**
 * All tabs disabled via the component-level disabled prop.
 */
export const AllDisabled: Story = {
  args: {
    items: basicItems,
    activeKey: 'home',
    disabled: true,
  },
};

/**
 * Tabs with separators between groups.
 */
export const WithSeparators: Story = {
  args: {} as any,
  render: () => {
    const items: MenuItem[] = [
      { key: 'home', label: 'Home' },
      { key: 'profile', label: 'Profile' },
      { key: 'sep1', separator: true },
      { key: 'settings', label: 'Settings' },
      { key: 'help', label: 'Help' },
    ];
    const [active, setActive] = useState('home');
    return <TabMenu items={items} activeKey={active} onTabChange={(key) => setActive(key)} />;
  },
};

/**
 * Tabs with command callbacks.
 * Open the browser console to see the output.
 */
export const WithCommands: Story = {
  args: {} as any,
  render: () => {
    const items: MenuItem[] = [
      { key: 'save', label: 'Save', command: (item) => console.log('Save clicked', item) },
      { key: 'export', label: 'Export', command: (item) => console.log('Export clicked', item) },
      { key: 'print', label: 'Print', command: (item) => console.log('Print clicked', item) },
    ];
    const [active, setActive] = useState('save');
    return <TabMenu items={items} activeKey={active} onTabChange={(key) => setActive(key)} />;
  },
};

/**
 * Many tabs — scrolls horizontally with visible scrollbar.
 */
export const ManyTabs: Story = {
  args: {} as any,
  render: () => {
    const items: MenuItem[] = Array.from({ length: 15 }, (_, i) => ({
      key: `tab-${i}`,
      label: `Tab ${i + 1}`,
    }));
    const [active, setActive] = useState('tab-0');
    return (
      <div style={{ maxWidth: 500 }}>
        <TabMenu items={items} activeKey={active} onTabChange={(key) => setActive(key)} />
      </div>
    );
  },
};

/**
 * Tab with custom template rendering.
 */
export const WithTemplate: Story = {
  args: {} as any,
  render: () => {
    const items: MenuItem[] = [
      { key: 'home', label: 'Home' },
      {
        key: 'notifications',
        label: 'Notifications',
        template: (item) => (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {item.label}
            <span style={{
              background: 'var(--kreati-severity-danger, #ef4444)',
              color: '#fff',
              borderRadius: '9999px',
              padding: '0 6px',
              fontSize: '12px',
              lineHeight: '18px',
            }}>
              3
            </span>
          </span>
        ),
      },
      { key: 'settings', label: 'Settings' },
    ];
    const [active, setActive] = useState('home');
    return <TabMenu items={items} activeKey={active} onTabChange={(key) => setActive(key)} />;
  },
};

/**
 * Tabs with hidden items using the visible prop.
 * The "Secret" tab is hidden.
 */
export const WithHiddenItems: Story = {
  args: {} as any,
  render: () => {
    const items: MenuItem[] = [
      { key: 'home', label: 'Home' },
      { key: 'secret', label: 'Secret', visible: false },
      { key: 'profile', label: 'Profile' },
      { key: 'settings', label: 'Settings' },
    ];
    const [active, setActive] = useState('home');
    return <TabMenu items={items} activeKey={active} onTabChange={(key) => setActive(key)} />;
  },
};
