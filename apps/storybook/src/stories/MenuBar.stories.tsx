import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MenuBar } from '../../../../packages/react/src/components/MenuBar';
import { ContextMenu } from '../../../../packages/react/src/components/ContextMenu';
import { Dialog } from '../../../../packages/react/src/components/Dialog';
import { Button } from '../../../../packages/react/src/components/Button';
import type { MenuItem } from '../../../../packages/react/src/types/navigation';

const meta = {
  title: 'Components/MenuBar',
  component: MenuBar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A menu bar supporting horizontal and vertical orientations with three vertical variants: default (floating dropdowns), panel (accordion), and tree (inline expand). Supports start/end slots, icons, separators, templates, keyboard navigation, and mobile adaptive layout.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MenuBar>;

export default meta;
type Story = StoryObj<typeof meta>;

const appMenuItems: MenuItem[] = [
  { key: 'file', label: 'File', items: [
    { key: 'new', label: 'New', icon: 'check', items: [
      { key: 'project', label: 'Project' },
      { key: 'file', label: 'File' },
      { key: 'folder', label: 'Folder' },
    ]},
    { key: 'open', label: 'Open' },
    { key: 'sep1', separator: true },
    { key: 'save', label: 'Save' },
    { key: 'saveas', label: 'Save As...' },
    { key: 'sep2', separator: true },
    { key: 'exit', label: 'Exit' },
  ]},
  { key: 'edit', label: 'Edit', items: [
    { key: 'undo', label: 'Undo' },
    { key: 'redo', label: 'Redo', disabled: true },
    { key: 'sep3', separator: true },
    { key: 'cut', label: 'Cut' },
    { key: 'copy', label: 'Copy' },
    { key: 'paste', label: 'Paste' },
  ]},
  { key: 'view', label: 'View', items: [
    { key: 'zoom', label: 'Zoom', items: [
      { key: 'zoomin', label: 'Zoom In' },
      { key: 'zoomout', label: 'Zoom Out' },
      { key: 'reset', label: 'Reset Zoom' },
    ]},
    { key: 'sep4', separator: true },
    { key: 'fullscreen', label: 'Full Screen' },
  ]},
  { key: 'help', label: 'Help', items: [
    { key: 'docs', label: 'Documentation' },
    { key: 'about', label: 'About' },
  ]},
];

const settingsItems: MenuItem[] = [
  { key: 'general', label: 'General', icon: 'check', items: [
    { key: 'profile', label: 'Profile' },
    { key: 'account', label: 'Account' },
    { key: 'preferences', label: 'Preferences' },
  ]},
  { key: 'security', label: 'Security', icon: 'search', items: [
    { key: 'password', label: 'Password' },
    { key: 'twofa', label: 'Two-Factor Auth' },
    { key: 'sessions', label: 'Active Sessions' },
  ]},
  { key: 'notifications', label: 'Notifications', icon: 'calendar', items: [
    { key: 'email', label: 'Email' },
    { key: 'push', label: 'Push' },
    { key: 'sms', label: 'SMS', disabled: true },
  ]},
];

// ─── HORIZONTAL ─────────────────────────────────────────

/** Standard horizontal menu bar. */
export const Default: Story = {
  args: { items: appMenuItems },
};

/** With start and end slots. */
export const WithStartAndEnd: Story = {
  args: {
    start: [{ key: 'brand', template: () => <span style={{ fontWeight: 700, fontSize: 16, padding: '0 12px', color: 'var(--kreati-primary-500)' }}>Kreati IDE</span> }],
    items: appMenuItems,
    end: [
      { key: 'status', template: () => <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px', fontSize: 12, color: 'var(--kreati-gray-400)' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />Ready</span> },
      { key: 'settings', label: 'Settings', icon: 'search', command: () => console.log('Settings') },
    ],
  },
};

/** Chevrons disabled. */
export const NoChevrons: Story = {
  args: { items: appMenuItems, showChevron: false },
};

/** Custom chevron icons. */
export const CustomChevrons: Story = {
  args: { items: appMenuItems, chevronOpen: <span style={{ fontSize: 10 }}>▲</span>, chevronClosed: <span style={{ fontSize: 10 }}>▼</span> },
};

/** Some items disabled. */
export const WithDisabled: Story = {
  args: {
    items: [
      { key: 'file', label: 'File', items: [{ key: 'new', label: 'New' }] },
      { key: 'edit', label: 'Edit', disabled: true, items: [{ key: 'undo', label: 'Undo' }] },
      { key: 'run', label: 'Run', command: () => console.log('Run') },
    ],
  },
};

/** Items with templates. */
export const WithTemplates: Story = {
  args: {
    items: [
      { key: 'file', label: 'File', items: [{ key: 'new', label: 'New' }, { key: 'save', label: 'Save' }] },
      { key: 'status', template: () => <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', fontSize: 13, color: 'var(--kreati-gray-500)' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />Connected</div> },
      { key: 'help', label: 'Help', items: [{ key: 'about', label: 'About' }] },
    ],
  },
};

/** With command callbacks — check the console. */
export const WithCommands: Story = {
  args: {
    items: [
      { key: 'file', label: 'File', items: [
        { key: 'new', label: 'New', command: (item) => console.log('New', item) },
        { key: 'save', label: 'Save', icon: 'check', command: (item) => console.log('Save', item) },
      ]},
      { key: 'run', label: 'Run', command: () => console.log('Run!') },
    ],
  },
};

// ─── VERTICAL DEFAULT (TIERED) ──────────────────────────

/** Vertical — dropdowns open to the right. */
export const Vertical: Story = {
  render: () => (
    <div style={{ height: 350, display: 'flex' }}>
      <MenuBar orientation="vertical" items={appMenuItems} onItemSelect={(key) => console.log(key)} />
      <div style={{ flex: 1, padding: 16, color: 'var(--kreati-gray-500)' }}>Dropdowns open to the right.</div>
    </div>
  ),
};

/** Vertical with start, end, and fixed width. */
export const VerticalWithSlots: Story = {
  render: () => (
    <div style={{ height: 400, display: 'flex' }}>
      <MenuBar
        orientation="vertical"
        style={{ height: '100%', width: 200 }}
        start={[{ key: 'brand', template: () => <div style={{ padding: '12px', fontWeight: 700, color: 'var(--kreati-primary-500)', borderBottom: '1px solid var(--kreati-gray-200)' }}>Kreati</div> }]}
        items={[
          { key: 'file', label: 'File', icon: 'check', items: [{ key: 'new', label: 'New' }, { key: 'open', label: 'Open' }] },
          { key: 'edit', label: 'Edit', icon: 'search', items: [{ key: 'undo', label: 'Undo' }] },
          { key: 'sep', separator: true },
          { key: 'run', label: 'Run', command: () => console.log('Run') },
        ]}
        end={[{ key: 'logout', label: 'Sign Out', icon: 'times', command: () => console.log('Logout') }]}
        onItemSelect={(key) => console.log(key)}
      />
      <div style={{ flex: 1, padding: 16, color: 'var(--kreati-gray-500)' }}>Vertical with brand and sign out.</div>
    </div>
  ),
};

// ─── VERTICAL PANEL ─────────────────────────────────────

/** Panel variant — accordion-style sections (single open). */
export const VerticalPanel: Story = {
  render: () => (
    <div style={{ height: 450, display: 'flex' }}>
      <MenuBar
        orientation="vertical"
        variant="panel"
        style={{ height: '100%', width: 250 }}
        items={settingsItems}
        onItemSelect={(key) => console.log(key)}
      />
      <div style={{ flex: 1, padding: 16, color: 'var(--kreati-gray-500)' }}>Panel — only one section open at a time.</div>
    </div>
  ),
};

/** Panel variant — multiple sections open. */
export const VerticalPanelMultiple: Story = {
  render: () => (
    <div style={{ height: 450, display: 'flex' }}>
      <MenuBar
        orientation="vertical"
        variant="panel"
        multiple
        style={{ height: '100%', width: 250 }}
        items={settingsItems}
        onItemSelect={(key) => console.log(key)}
      />
      <div style={{ flex: 1, padding: 16, color: 'var(--kreati-gray-500)' }}>Panel with multiple — several sections can be open.</div>
    </div>
  ),
};

/** Panel with start and end slots. */
export const VerticalPanelWithSlots: Story = {
  render: () => (
    <div style={{ height: 500, display: 'flex' }}>
      <MenuBar
        orientation="vertical"
        variant="panel"
        style={{ height: '100%', width: 260 }}
        start={[{ key: 'brand', template: () => <div style={{ padding: '14px 16px', fontWeight: 700, fontSize: 16, color: 'var(--kreati-primary-500)', borderBottom: '1px solid var(--kreati-gray-200)' }}>⚙ Settings</div> }]}
        items={settingsItems}
        end={[{ key: 'version', template: () => <div style={{ padding: '10px 16px', fontSize: 11, color: 'var(--kreati-gray-400)', borderTop: '1px solid var(--kreati-gray-200)' }}>v0.9.0</div> }]}
        onItemSelect={(key) => console.log(key)}
      />
      <div style={{ flex: 1, padding: 16, color: 'var(--kreati-gray-500)' }}>Panel with header and footer.</div>
    </div>
  ),
};

/** Panel variant — nested submenus. */
export const VerticalPanelNested: Story = {
  render: () => (
    <div style={{ height: 500, display: 'flex' }}>
      <MenuBar
        orientation="vertical"
        variant="panel"
        style={{ height: '100%', width: 260 }}
        items={[
          { key: 'general', label: 'General', icon: 'check', items: [
            { key: 'profile', label: 'Profile' },
            { key: 'appearance', label: 'Appearance', items: [
              { key: 'theme', label: 'Theme' },
              { key: 'fonts', label: 'Fonts' },
              { key: 'colors', label: 'Colors', items: [
                { key: 'primary', label: 'Primary' },
                { key: 'secondary', label: 'Secondary' },
              ]},
            ]},
            { key: 'language', label: 'Language' },
          ]},
          { key: 'security', label: 'Security', icon: 'search', items: [
            { key: 'password', label: 'Password' },
            { key: 'advanced', label: 'Advanced', items: [
              { key: 'twofa', label: 'Two-Factor Auth' },
              { key: 'sessions', label: 'Active Sessions' },
            ]},
          ]},
          { key: 'about', label: 'About' },
        ]}
        onItemSelect={(key) => console.log(key)}
      />
      <div style={{ flex: 1, padding: 16, color: 'var(--kreati-gray-500)' }}>Panel with nested submenus — verify active styles on expanded headers.</div>
    </div>
  ),
};

// ─── VERTICAL TREE ──────────────────────────────────────

/** Tree variant — inline expand like a file explorer. */
export const VerticalTree: Story = {
  render: () => (
    <div style={{ height: 400, display: 'flex' }}>
      <MenuBar
        orientation="vertical"
        variant="tree"
        style={{ height: '100%', width: 220 }}
        items={[
          { key: 'src', label: 'src', icon: 'check', items: [
            { key: 'components', label: 'components', items: [
              { key: 'button', label: 'Button.tsx' },
              { key: 'input', label: 'Input.tsx' },
              { key: 'select', label: 'Select.tsx' },
            ]},
            { key: 'styles', label: 'styles', items: [
              { key: 'vars', label: 'variables.css' },
              { key: 'reset', label: 'reset.css' },
            ]},
            { key: 'index', label: 'index.ts' },
          ]},
          { key: 'tests', label: 'tests', icon: 'search', items: [
            { key: 'unit', label: 'unit', items: [
              { key: 'button-test', label: 'Button.test.tsx' },
            ]},
          ]},
          { key: 'package', label: 'package.json' },
          { key: 'readme', label: 'README.md' },
        ]}
        onItemSelect={(key) => console.log(key)}
      />
      <div style={{ flex: 1, padding: 16, color: 'var(--kreati-gray-500)' }}>Tree — items expand inline.</div>
    </div>
  ),
};

/** Tree variant — multiple open. */
export const VerticalTreeMultiple: Story = {
  render: () => (
    <div style={{ height: 400, display: 'flex' }}>
      <MenuBar
        orientation="vertical"
        variant="tree"
        multiple
        style={{ height: '100%', width: 220 }}
        items={settingsItems}
        onItemSelect={(key) => console.log(key)}
      />
      <div style={{ flex: 1, padding: 16, color: 'var(--kreati-gray-500)' }}>Tree with multiple sections open.</div>
    </div>
  ),
};

// ─── MEGA MENU ──────────────────────────────────────────

/** MegaMenu — horizontal bar with wide multi-column dropdown panel. */
export const MegaMenuStyle: Story = {
  render: () => {
    const categories: MenuItem[] = [
      { key: 'electronics', label: 'Electronics', items: [
        { key: 'phones', label: 'Phones' }, { key: 'laptops', label: 'Laptops' },
        { key: 'tablets', label: 'Tablets' }, { key: 'accessories', label: 'Accessories' },
      ]},
      { key: 'clothing', label: 'Clothing', items: [
        { key: 'men', label: 'Men' }, { key: 'women', label: 'Women' }, { key: 'kids', label: 'Kids' },
      ]},
      { key: 'home', label: 'Home & Garden', items: [
        { key: 'furniture', label: 'Furniture' }, { key: 'decor', label: 'Decor' },
        { key: 'garden', label: 'Garden' }, { key: 'kitchen', label: 'Kitchen' },
      ]},
      { key: 'sports', label: 'Sports', items: [
        { key: 'fitness', label: 'Fitness' }, { key: 'outdoor', label: 'Outdoor' }, { key: 'team', label: 'Team Sports' },
      ]},
    ];

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--kreati-white, #fff)', borderBottom: '1px solid var(--kreati-gray-200)', padding: '0 4px', minHeight: 36, fontFamily: 'var(--kreati-font-family)' }}>
          <span style={{ fontWeight: 700, fontSize: 16, padding: '0 12px', color: 'var(--kreati-primary-500)' }}>Store</span>
          <ContextMenu
            items={categories}
            trigger="click"
            panelTemplate={(cats, close) => (
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cats.length}, 1fr)`, gap: 24, padding: 20, minWidth: 500 }}>
                {cats.map((cat) => (
                  <div key={cat.key}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--kreati-primary-500)', marginBottom: 8, paddingBottom: 6, borderBottom: '2px solid var(--kreati-primary-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{cat.label}</div>
                    {cat.items?.map((item) => (
                      <button key={item.key} type="button" onClick={() => { console.log(item.label); close(); }}
                        style={{ display: 'block', width: '100%', padding: '6px 8px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 13, color: 'var(--kreati-gray-700)', borderRadius: 4, fontFamily: 'var(--kreati-font-family)' }}
                        onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'var(--kreati-gray-100)'; }}
                        onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'none'; }}
                      >{item.label}</button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          >
            <button type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--kreati-gray-700)', fontFamily: 'var(--kreati-font-family)', borderRadius: 4 }}>Products ▾</button>
          </ContextMenu>
          <MenuBar items={[{ key: 'deals', label: 'Deals', command: () => console.log('Deals') }, { key: 'new', label: "What's New", command: () => console.log('New') }]} style={{ border: 'none', minHeight: 'auto' }} />
          <div style={{ flex: 1 }} />
          <span style={{ padding: '0 12px', fontSize: 14 }}>Cart (0)</span>
        </div>
        <div style={{ padding: 24, color: 'var(--kreati-gray-500)' }}>Click "Products" to see the MegaMenu panel.</div>
      </div>
    );
  },
};

// ─── INSIDE DIALOGS ─────────────────────────────────────

/** MenuBar inside nested Dialogs — tests z-index stacking. */
export const InsideDialogs: Story = {
  render: () => {
    const [outerOpen, setOuterOpen] = useState(false);
    const [innerOpen, setInnerOpen] = useState(false);

    return (
      <div style={{ padding: 24 }}>
        <Button label="Open Editor Dialog" onClick={() => setOuterOpen(true)} />
        <Dialog visible={outerOpen} onHide={() => setOuterOpen(false)} header="Editor" style={{ width: 600 }}>
          <MenuBar
            items={appMenuItems}
            start={[{ key: 'brand', template: () => <span style={{ fontWeight: 700, fontSize: 14, padding: '0 8px', color: 'var(--kreati-primary-500)' }}>Editor</span> }]}
            onItemSelect={(key) => console.log('Outer:', key)}
          />
          <div style={{ padding: 16 }}>
            <p>Editor content. Try the menu bar above.</p>
            <Button label="Open Settings" severity="secondary" onClick={() => setInnerOpen(true)} style={{ marginTop: 8 }} />
          </div>
          <Dialog visible={innerOpen} onHide={() => setInnerOpen(false)} header="Settings" style={{ width: 450 }}>
            <MenuBar
              items={[{ key: 'actions', label: 'Actions', items: [{ key: 'apply', label: 'Apply' }, { key: 'revert', label: 'Revert' }] }, { key: 'help', label: 'Help', items: [{ key: 'about', label: 'About' }] }]}
              onItemSelect={(key) => console.log('Inner:', key)}
            />
            <div style={{ padding: 16 }}>Settings content with its own MenuBar.</div>
          </Dialog>
        </Dialog>
      </div>
    );
  },
};
