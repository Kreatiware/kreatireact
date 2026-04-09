import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ContextMenu } from '../../../../packages/react/src/components/ContextMenu';
import { Button } from '../../../../packages/react/src/components/Button';
import { Dialog } from '../../../../packages/react/src/components/Dialog';
import type { MenuItem } from '../../../../packages/react/src/types/navigation';

const meta = {
  title: 'Components/ContextMenu',
  component: ContextMenu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A floating context menu triggered by right-click or click. Supports nested submenus with hover/keyboard expansion, icons (string or ReactNode), disabled states, separators, templates, and keyboard navigation (Arrow keys, Enter, Escape). Renders via portal with viewport boundary detection. Uses ARIA menu/menuitem roles.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicItems: MenuItem[] = [
  { key: 'cut', label: 'Cut', icon: 'times' },
  { key: 'copy', label: 'Copy' },
  { key: 'paste', label: 'Paste' },
  { key: 'sep1', separator: true },
  { key: 'delete', label: 'Delete', icon: 'minus' },
];

/**
 * Right-click the area to open the context menu.
 */
export const Default: Story = {
  args: {
    items: basicItems,
    trigger: 'contextmenu',
    children: (
      <div style={{
        width: 300,
        height: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px dashed var(--kreati-gray-300, #d1d5db)',
        borderRadius: 8,
        color: 'var(--kreati-gray-500, #6b7280)',
        userSelect: 'none',
      }}>
        Right-click here
      </div>
    ),
  },
};

/**
 * Click to open the context menu.
 */
export const ClickTrigger: Story = {
  args: {
    items: basicItems,
    trigger: 'click',
    children: <Button label="Click me" />,
  },
};

/**
 * Both right-click and click open the menu.
 */
export const BothTriggers: Story = {
  args: {
    items: basicItems,
    trigger: 'both',
    children: <Button label="Right-click or click" buttonType="outlined" />,
  },
};

/**
 * Nested submenus — hover or ArrowRight to expand.
 */
export const WithSubmenus: Story = {
  args: {
    items: [
      { key: 'new', label: 'New', items: [
        { key: 'file', label: 'File' },
        { key: 'folder', label: 'Folder' },
        { key: 'project', label: 'Project', items: [
          { key: 'react', label: 'React App' },
          { key: 'vue', label: 'Vue App' },
        ]},
      ]},
      { key: 'open', label: 'Open' },
      { key: 'sep', separator: true },
      { key: 'save', label: 'Save', icon: 'check' },
      { key: 'saveas', label: 'Save As...' },
    ],
    trigger: 'contextmenu',
    children: (
      <div style={{
        width: 300,
        height: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px dashed var(--kreati-gray-300, #d1d5db)',
        borderRadius: 8,
        color: 'var(--kreati-gray-500, #6b7280)',
        userSelect: 'none',
      }}>
        Right-click for nested menu
      </div>
    ),
  },
};

/**
 * Items with disabled states.
 */
export const WithDisabled: Story = {
  args: {
    items: [
      { key: 'undo', label: 'Undo' },
      { key: 'redo', label: 'Redo', disabled: true },
      { key: 'sep', separator: true },
      { key: 'cut', label: 'Cut' },
      { key: 'copy', label: 'Copy', disabled: true },
      { key: 'paste', label: 'Paste' },
    ],
    trigger: 'contextmenu',
    children: (
      <div style={{
        width: 300,
        height: 150,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px dashed var(--kreati-gray-300, #d1d5db)',
        borderRadius: 8,
        color: 'var(--kreati-gray-500, #6b7280)',
        userSelect: 'none',
      }}>
        Right-click here
      </div>
    ),
  },
};

/**
 * With command callbacks — open the console to see output.
 */
export const WithCommands: Story = {
  args: {
    items: [
      { key: 'copy', label: 'Copy', command: (item) => console.log('Copy', item) },
      { key: 'paste', label: 'Paste', command: (item) => console.log('Paste', item) },
      { key: 'sep', separator: true },
      { key: 'settings', label: 'Settings', icon: 'search', command: (item) => console.log('Settings', item) },
    ],
    trigger: 'contextmenu',
    children: (
      <div style={{
        width: 300,
        height: 150,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px dashed var(--kreati-gray-300, #d1d5db)',
        borderRadius: 8,
        color: 'var(--kreati-gray-500, #6b7280)',
        userSelect: 'none',
      }}>
        Right-click here (check console)
      </div>
    ),
  },
};

/**
 * Deep nested submenus triggered by a button — test on mobile.
 */
export const DeepSubmenus: Story = {
  args: {
    items: [
      { key: 'file', label: 'File', icon: 'check', items: [
        { key: 'new', label: 'New', items: [
          { key: 'project', label: 'Project', items: [
            { key: 'react', label: 'React App' },
            { key: 'vue', label: 'Vue App' },
            { key: 'angular', label: 'Angular App' },
            { key: 'more', label: 'More Frameworks', items: [
              { key: 'svelte', label: 'Svelte App' },
              { key: 'solid', label: 'Solid App' },
              { key: 'experimental', label: 'Experimental', items: [
                { key: 'qwik', label: 'Qwik App' },
                { key: 'astro', label: 'Astro App' },
              ]},
            ]},
          ]},
          { key: 'file', label: 'Empty File' },
          { key: 'folder', label: 'Folder' },
        ]},
        { key: 'open', label: 'Open' },
        { key: 'sep1', separator: true },
        { key: 'save', label: 'Save' },
        { key: 'saveas', label: 'Save As...' },
      ]},
      { key: 'edit', label: 'Edit', items: [
        { key: 'undo', label: 'Undo' },
        { key: 'redo', label: 'Redo', disabled: true },
        { key: 'sep2', separator: true },
        { key: 'find', label: 'Find', icon: 'search' },
      ]},
      { key: 'sep3', separator: true },
      { key: 'settings', label: 'Settings', icon: 'search' },
    ],
    trigger: 'click',
    children: <Button label="Open Menu" severity="primary" />,
  },
};

/**
 * Submenus open to the left by default.
 */
export const SubmenuLeft: Story = {
  args: {
    items: [
      { key: 'file', label: 'File', items: [
        { key: 'new', label: 'New', items: [
          { key: 'doc', label: 'Document' },
          { key: 'sheet', label: 'Spreadsheet' },
        ]},
        { key: 'open', label: 'Open' },
      ]},
      { key: 'edit', label: 'Edit' },
    ],
    submenuPosition: 'left',
    trigger: 'click',
    children: <Button label="Submenus Left" />,
  },
};

/**
 * Submenus open downward (below the parent item).
 */
export const SubmenuBottom: Story = {
  args: {
    items: [
      { key: 'actions', label: 'Actions', items: [
        { key: 'copy', label: 'Copy' },
        { key: 'paste', label: 'Paste' },
        { key: 'delete', label: 'Delete' },
      ]},
      { key: 'help', label: 'Help' },
    ],
    submenuPosition: 'bottom',
    trigger: 'click',
    children: <Button label="Submenus Bottom" />,
  },
};

/**
 * Submenus open upward (above the parent item).
 */
export const SubmenuTop: Story = {
  args: {
    items: [
      { key: 'actions', label: 'Actions', items: [
        { key: 'copy', label: 'Copy' },
        { key: 'paste', label: 'Paste' },
        { key: 'delete', label: 'Delete' },
      ]},
      { key: 'help', label: 'Help' },
    ],
    submenuPosition: 'top',
    trigger: 'click',
    children: <Button label="Submenus Top" />,
  },
};

/**
 * Mixed submenu positions — each item overrides the default.
 */
export const MixedPositions: Story = {
  args: {
    items: [
      { key: 'right', label: 'Right (default)', submenuPosition: 'right', items: [
        { key: 'r1', label: 'Sub Item 1' },
        { key: 'r2', label: 'Sub Item 2' },
      ]},
      { key: 'left', label: 'Left', submenuPosition: 'left', items: [
        { key: 'l1', label: 'Sub Item 1' },
        { key: 'l2', label: 'Sub Item 2' },
      ]},
      { key: 'bottom', label: 'Bottom', submenuPosition: 'bottom', items: [
        { key: 'b1', label: 'Sub Item 1' },
        { key: 'b2', label: 'Sub Item 2' },
      ]},
      { key: 'top', label: 'Top', submenuPosition: 'top', items: [
        { key: 't1', label: 'Sub Item 1' },
        { key: 't2', label: 'Sub Item 2' },
      ]},
    ],
    trigger: 'click',
    children: <Button label="Mixed Positions" severity="secondary" />,
  },
};

/**
 * Auto-flip test — place the button near the right edge.
 * Submenus should flip to the left automatically.
 */
export const AutoFlip: Story = {
  render: () => (
    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px' }}>
      <ContextMenu
        items={[
          { key: 'file', label: 'File', items: [
            { key: 'new', label: 'New', items: [
              { key: 'doc', label: 'Document' },
              { key: 'sheet', label: 'Spreadsheet' },
              { key: 'deep', label: 'Deep', items: [
                { key: 'd1', label: 'Level 4 A' },
                { key: 'd2', label: 'Level 4 B' },
              ]},
            ]},
            { key: 'open', label: 'Open' },
          ]},
          { key: 'edit', label: 'Edit' },
        ]}
        trigger="click"
      >
        <Button label="Near Right Edge" severity="warning" />
      </ContextMenu>
    </div>
  ),
};

/**
 * Mobile adaptive disabled — always shows desktop floating submenus, even on touch devices.
 */
export const NoMobileAdaptive: Story = {
  args: {
    items: [
      { key: 'file', label: 'File', items: [
        { key: 'new', label: 'New', items: [
          { key: 'doc', label: 'Document' },
          { key: 'sheet', label: 'Spreadsheet' },
        ]},
        { key: 'open', label: 'Open' },
        { key: 'save', label: 'Save' },
      ]},
      { key: 'edit', label: 'Edit', items: [
        { key: 'undo', label: 'Undo' },
        { key: 'redo', label: 'Redo' },
      ]},
      { key: 'help', label: 'Help' },
    ],
    mobileAdaptive: false,
    trigger: 'click',
    children: <Button label="No Mobile Layout" severity="info" />,
  },
};

/**
 * Mixed positions across 3 levels of nesting.
 * Each level uses a different submenu direction.
 */
export const MixedDeepPositions: Story = {
  args: {
    items: [
      { key: 'level1-right', label: 'Level 1 → Right', submenuPosition: 'right', items: [
        { key: 'l2-bottom', label: 'Level 2 ↓ Bottom', submenuPosition: 'bottom', items: [
          { key: 'l3a', label: 'Level 3 Item A' },
          { key: 'l3b', label: 'Level 3 Item B' },
        ]},
        { key: 'l2-left', label: 'Level 2 ← Left', submenuPosition: 'left', items: [
          { key: 'l3c', label: 'Level 3 Item C' },
          { key: 'l3d', label: 'Level 3 Item D' },
        ]},
      ]},
      { key: 'level1-left', label: 'Level 1 ← Left', submenuPosition: 'left', items: [
        { key: 'l2-top', label: 'Level 2 ↑ Top', submenuPosition: 'top', items: [
          { key: 'l3e', label: 'Level 3 Item E' },
          { key: 'l3f', label: 'Level 3 Item F' },
        ]},
        { key: 'l2-right', label: 'Level 2 → Right', submenuPosition: 'right', items: [
          { key: 'l3g', label: 'Level 3 Item G' },
          { key: 'l3h', label: 'Level 3 Item H' },
        ]},
      ]},
      { key: 'level1-bottom', label: 'Level 1 ↓ Bottom', submenuPosition: 'bottom', items: [
        { key: 'l2-right2', label: 'Level 2 → Right', submenuPosition: 'right', items: [
          { key: 'l3i', label: 'Level 3 Item I' },
          { key: 'l3j', label: 'Level 3 Item J' },
        ]},
      ]},
    ],
    trigger: 'click',
    children: <Button label="Mixed Deep Positions" severity="secondary" />,
  },
};

/**
 * ContextMenu inside a Dialog, with a nested Dialog.
 * Tests z-index stacking and portal behavior in overlay layers.
 */
export const InsideDialog: Story = {
  render: () => {
    const [outerOpen, setOuterOpen] = useState(false);
    const [innerOpen, setInnerOpen] = useState(false);

    const menuItems: MenuItem[] = [
      { key: 'copy', label: 'Copy', icon: 'check' },
      { key: 'paste', label: 'Paste' },
      { key: 'sep', separator: true },
      { key: 'actions', label: 'Actions', items: [
        { key: 'duplicate', label: 'Duplicate' },
        { key: 'archive', label: 'Archive' },
        { key: 'more', label: 'More', items: [
          { key: 'export', label: 'Export' },
          { key: 'print', label: 'Print' },
        ]},
      ]},
      { key: 'delete', label: 'Delete', icon: 'times' },
    ];

    return (
      <>
        <Button label="Open Dialog" onClick={() => setOuterOpen(true)} />
        <Dialog visible={outerOpen} onHide={() => setOuterOpen(false)} header="Outer Dialog" style={{ width: '500px' }}>
          <p style={{ marginBottom: 16 }}>Right-click the area below or use the button:</p>

          <ContextMenu items={menuItems} trigger="both">
            <div style={{
              padding: 24,
              border: '2px dashed var(--kreati-gray-300, #d1d5db)',
              borderRadius: 8,
              textAlign: 'center',
              color: 'var(--kreati-gray-500)',
              marginBottom: 16,
            }}>
              Right-click or click here
            </div>
          </ContextMenu>

          <ContextMenu items={menuItems} trigger="click">
            <Button label="Click Menu" buttonType="outlined" />
          </ContextMenu>

          <div style={{ marginTop: 16 }}>
            <Button label="Open Inner Dialog" severity="secondary" onClick={() => setInnerOpen(true)} />
          </div>

          <Dialog visible={innerOpen} onHide={() => setInnerOpen(false)} header="Inner Dialog" style={{ width: '400px' }}>
            <p style={{ marginBottom: 16 }}>Context menu inside a nested dialog:</p>
            <ContextMenu items={menuItems} trigger="click">
              <Button label="Menu in Inner Dialog" severity="info" />
            </ContextMenu>
          </Dialog>
        </Dialog>
      </>
    );
  },
};

/**
 * MegaMenu-style wide panel using panelTemplate.
 * Renders items in a multi-column grid layout instead of a vertical list.
 */
export const MegaPanel: Story = {
  render: () => {
    const items: MenuItem[] = [
      { key: 'electronics', label: 'Electronics', items: [
        { key: 'phones', label: 'Phones' },
        { key: 'laptops', label: 'Laptops' },
        { key: 'tablets', label: 'Tablets' },
      ]},
      { key: 'clothing', label: 'Clothing', items: [
        { key: 'men', label: 'Men' },
        { key: 'women', label: 'Women' },
        { key: 'kids', label: 'Kids' },
      ]},
      { key: 'home', label: 'Home & Garden', items: [
        { key: 'furniture', label: 'Furniture' },
        { key: 'decor', label: 'Decor' },
        { key: 'garden', label: 'Garden' },
      ]},
    ];

    return (
      <ContextMenu
        items={items}
        trigger="click"
        panelTemplate={(menuItems, close) => (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${menuItems.length}, 1fr)`,
            gap: 16,
            padding: 16,
            minWidth: 400,
          }}>
            {menuItems.map((category) => (
              <div key={category.key}>
                <div style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: 'var(--kreati-primary-500)',
                  marginBottom: 8,
                  paddingBottom: 4,
                  borderBottom: '2px solid var(--kreati-primary-500)',
                }}>
                  {category.label}
                </div>
                {category.items?.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => { console.log('Selected:', item.label); close(); }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '6px 8px',
                      border: 'none',
                      background: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: 13,
                      color: 'var(--kreati-gray-700)',
                      borderRadius: 4,
                      fontFamily: 'var(--kreati-font-family)',
                    }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'var(--kreati-gray-100, #f3f4f6)'; }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'none'; }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      >
        <Button label="Shop Categories" severity="primary" />
      </ContextMenu>
    );
  },
};
