import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SideMenu } from '../../../../packages/react/src/components/SideMenu';
import { renderMenuIcon } from '../../../../packages/react/src/components/resolveIcon';
import { Drawer } from '../../../../packages/react/src/components/Drawer';
import { Button } from '../../../../packages/react/src/components/Button';
import type { MenuItem } from '../../../../packages/react/src/types/navigation';

const meta = {
  title: 'Components/SideMenu',
  component: SideMenu,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A vertical navigation menu with accordion-style expandable submenus. Supports icons (string name or ReactNode), disabled states, separators, templates, and keyboard navigation (Enter, Space, ArrowRight/Left). Uses ARIA tree/treeitem roles. Can be used standalone or inside a Drawer for mobile navigation.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SideMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicItems: MenuItem[] = [
  { key: 'home', label: 'Home', icon: 'check' },
  { key: 'products', label: 'Products', icon: 'search', items: [
    { key: 'web', label: 'Web Development' },
    { key: 'mobile', label: 'Mobile Apps' },
    { key: 'consulting', label: 'Consulting', disabled: true },
  ]},
  { key: 'sep1', separator: true },
  { key: 'about', label: 'About' },
  { key: 'contact', label: 'Contact' },
];

/**
 * Basic vertical side menu with submenus.
 */
export const Default: Story = {
  args: {
    items: basicItems,
    activeKey: 'home',
  },
};

/**
 * Controlled side menu with active state tracking.
 */
export const Controlled: Story = {
  args: {} as any,
  render: () => {
    const [active, setActive] = useState('home');
    return (
      <div style={{ maxWidth: 280 }}>
        <SideMenu items={basicItems} activeKey={active} onItemSelect={(key) => setActive(key)} />
      </div>
    );
  },
};

/**
 * Nested submenus up to multiple levels deep.
 */
export const DeepNesting: Story = {
  args: {} as any,
  render: () => {
    const items: MenuItem[] = [
      { key: 'settings', label: 'Settings', icon: 'times', items: [
        { key: 'general', label: 'General' },
        { key: 'appearance', label: 'Appearance', items: [
          { key: 'theme', label: 'Theme' },
          { key: 'fonts', label: 'Fonts' },
          { key: 'colors', label: 'Colors' },
        ]},
        { key: 'privacy', label: 'Privacy' },
      ]},
      { key: 'help', label: 'Help' },
    ];
    const [active, setActive] = useState('');
    return (
      <div style={{ maxWidth: 280 }}>
        <SideMenu items={items} activeKey={active} onItemSelect={(key) => setActive(key)} />
      </div>
    );
  },
};

/**
 * Multiple submenus can be open at the same time.
 */
export const MultipleOpen: Story = {
  args: {} as any,
  render: () => {
    const items: MenuItem[] = [
      { key: 'section1', label: 'Section 1', items: [
        { key: 'item1a', label: 'Item 1A' },
        { key: 'item1b', label: 'Item 1B' },
      ]},
      { key: 'section2', label: 'Section 2', items: [
        { key: 'item2a', label: 'Item 2A' },
        { key: 'item2b', label: 'Item 2B' },
      ]},
    ];
    const [active, setActive] = useState('');
    return (
      <div style={{ maxWidth: 280 }}>
        <SideMenu items={items} activeKey={active} onItemSelect={(key) => setActive(key)} multiple />
      </div>
    );
  },
};

/**
 * Pre-expanded submenus using the expanded prop on items.
 */
export const PreExpanded: Story = {
  args: {
    items: [
      { key: 'home', label: 'Home' },
      { key: 'products', label: 'Products', expanded: true, items: [
        { key: 'web', label: 'Web' },
        { key: 'mobile', label: 'Mobile' },
      ]},
      { key: 'contact', label: 'Contact' },
    ],
    activeKey: 'web',
  },
};

/**
 * All items disabled via the component-level prop.
 */
export const AllDisabled: Story = {
  args: {
    items: basicItems,
    activeKey: 'home',
    disabled: true,
  },
};

/**
 * SideMenu inside a Drawer — typical mobile navigation pattern.
 */
export const InsideDrawer: Story = {
  args: {} as any,
  render: () => {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState('home');
    return (
      <>
        <Button label="Open Menu" onClick={() => setOpen(true)} />
        <Drawer visible={open} onHide={() => setOpen(false)} position="left" size="sm" header="Navigation">
          <SideMenu
            items={basicItems}
            activeKey={active}
            onItemSelect={(key, item) => {
              setActive(key);
              if (!item.items || item.items.length === 0) setOpen(false);
            }}
          />
        </Drawer>
      </>
    );
  },
};

/**
 * With command callbacks. Open the console to see output.
 */
export const WithCommands: Story = {
  args: {} as any,
  render: () => {
    const items: MenuItem[] = [
      { key: 'save', label: 'Save', icon: 'check', command: (item) => console.log('Save', item) },
      { key: 'export', label: 'Export', command: (item) => console.log('Export', item) },
      { key: 'sep', separator: true },
      { key: 'delete', label: 'Delete', icon: 'times', command: (item) => console.log('Delete', item) },
    ];
    const [active, setActive] = useState('');
    return (
      <div style={{ maxWidth: 280 }}>
        <SideMenu items={items} activeKey={active} onItemSelect={(key) => setActive(key)} />
      </div>
    );
  },
};

/**
 * Animation disabled.
 */
export const NoAnimation: Story = {
  args: {} as any,
  render: () => {
    const [active, setActive] = useState('home');
    return (
      <div style={{ maxWidth: 280 }}>
        <SideMenu items={basicItems} activeKey={active} onItemSelect={(key) => setActive(key)} animated={false} />
      </div>
    );
  },
};

/**
 * Icon position at the start (left of label).
 */
export const IconPositionStart: Story = {
  args: {} as any,
  render: () => {
    const [active, setActive] = useState('home');
    return (
      <div style={{ maxWidth: 280 }}>
        <SideMenu items={basicItems} activeKey={active} onItemSelect={(key) => setActive(key)} iconPosition="start" />
      </div>
    );
  },
};

/**
 * Custom header template for parent items — PanelMenu style.
 */
export const PanelMenuStyle: Story = {
  args: {} as any,
  render: () => {
    const items: MenuItem[] = [
      { key: 'general', label: 'General', icon: 'check', items: [
        { key: 'profile', label: 'Profile' },
        { key: 'account', label: 'Account' },
      ]},
      { key: 'security', label: 'Security', icon: 'search', items: [
        { key: 'password', label: 'Password' },
        { key: 'twofa', label: 'Two-Factor Auth' },
      ]},
      { key: 'notifications', label: 'Notifications', icon: 'calendar', items: [
        { key: 'email', label: 'Email' },
        { key: 'push', label: 'Push' },
        { key: 'sms', label: 'SMS', disabled: true },
      ]},
    ];
    const [active, setActive] = useState('');
    return (
      <div style={{ maxWidth: 300 }}>
        <SideMenu
          items={items}
          activeKey={active}
          onItemSelect={(key) => setActive(key)}
          headerTemplate={(item, isExpanded, toggle) => (
            <button
              type="button"
              onClick={toggle}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                borderBottom: '1px solid var(--kreati-gray-200, #e5e7eb)',
                background: isExpanded ? 'var(--kreati-primary-50, #e0f2fe)' : 'var(--kreati-gray-50, #f9fafb)',
                color: isExpanded ? 'var(--kreati-primary-500)' : 'var(--kreati-gray-700, #374151)',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: 'var(--kreati-font-family)',
                textAlign: 'left',
              }}
            >
              <span style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', display: 'inline-flex' }}>▶</span>
              {item.icon && <span>{renderMenuIcon(item.icon)}</span>}
              <span style={{ flex: 1 }}>{item.label}</span>
            </button>
          )}
        />
      </div>
    );
  },
};
