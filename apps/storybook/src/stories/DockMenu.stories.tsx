import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DockMenu } from '../../../../packages/react/src/components/DockMenu';
import type { MenuItem } from '../../../../packages/react/src/types/navigation';

const meta = {
  title: 'Components/DockMenu',
  component: DockMenu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A macOS-style dock menu with proximity-based magnification effect. Supports 4 positions (bottom, top, left, right), configurable icon/magnification sizes, labels on hover, separators, and keyboard navigation. Fully accessible with ARIA toolbar role.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DockMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const dockItems: MenuItem[] = [
  { key: 'home', label: 'Home', icon: 'check' },
  { key: 'search', label: 'Search', icon: 'search' },
  { key: 'calendar', label: 'Calendar', icon: 'calendar' },
  { key: 'maximize', label: 'Maximize', icon: 'maximize' },
  { key: 'restore', label: 'Restore', icon: 'restore' },
  { key: 'minus', label: 'Minimize', icon: 'minus' },
  { key: 'close', label: 'Close', icon: 'times' },
];

/** Bottom dock (default). */
export const Default: Story = {
  args: {
    items: dockItems,
    position: 'bottom',
  },
};

/** Top dock. */
export const Top: Story = {
  args: {
    items: dockItems,
    position: 'top',
  },
};

/** Left dock. */
export const Left: Story = {
  args: {
    items: dockItems,
    position: 'left',
  },
};

/** Right dock. */
export const Right: Story = {
  args: {
    items: dockItems,
    position: 'right',
  },
};

/** Magnification disabled. */
export const NoMagnify: Story = {
  args: {
    items: dockItems,
    magnify: false,
  },
};

/** Labels hidden. */
export const NoLabels: Story = {
  args: {
    items: dockItems,
    showLabels: false,
  },
};

/** Custom sizes — smaller base, larger magnification. */
export const CustomSizes: Story = {
  args: {
    items: dockItems,
    iconSize: 48,
    maxIconSize: 72,
    magnifyRange: 150,
  },
};

/** Large dock. */
export const Large: Story = {
  args: {
    items: dockItems,
    iconSize: 64,
    maxIconSize: 96,
  },
};

/** With disabled items. */
export const WithDisabled: Story = {
  args: {
    items: [
      { key: 'home', label: 'Home', icon: 'check' },
      { key: 'search', label: 'Search', icon: 'search', disabled: true },
      { key: 'calendar', label: 'Calendar', icon: 'calendar' },
      { key: 'close', label: 'Close', icon: 'times', disabled: true },
    ],
  },
};

/** With commands — check the console. */
export const WithCommands: Story = {
  args: {
    items: [
      { key: 'home', label: 'Home', icon: 'check', command: (item) => console.log('Home', item) },
      { key: 'search', label: 'Search', icon: 'search', command: (item) => console.log('Search', item) },
      { key: 'sep', separator: true },
      { key: 'settings', label: 'Settings', icon: 'calendar', command: (item) => console.log('Settings', item) },
    ],
  },
};

/** Fixed to bottom of viewport — typical dock placement with dark background. */
export const FixedBottom: Story = {
  args: {} as any,
  render: () => (
    <div style={{ position: 'relative', height: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
        <DockMenu
          items={dockItems}
          position="bottom"
          onItemSelect={(key) => console.log(key)}
        />
      </div>
    </div>
  ),
};

/** Fixed to left of viewport with gradient background. */
export const FixedLeft: Story = {
  args: {} as any,
  render: () => (
    <div style={{ position: 'relative', height: '100vh', background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)' }}>
      <div style={{ position: 'fixed', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 100 }}>
        <DockMenu
          items={dockItems}
          position="left"
          onItemSelect={(key) => console.log(key)}
        />
      </div>
    </div>
  ),
};

/** Fixed to top of viewport. */
export const FixedTop: Story = {
  args: {} as any,
  render: () => (
    <div style={{ position: 'relative', height: '100vh', background: 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)' }}>
      <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
        <DockMenu
          items={dockItems}
          position="top"
          onItemSelect={(key) => console.log(key)}
        />
      </div>
    </div>
  ),
};

/** Fixed to right of viewport. */
export const FixedRight: Story = {
  args: {} as any,
  render: () => (
    <div style={{ position: 'relative', height: '100vh', background: 'linear-gradient(135deg, #11998e, #38ef7d)' }}>
      <div style={{ position: 'fixed', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 100 }}>
        <DockMenu
          items={dockItems}
          position="right"
          onItemSelect={(key) => console.log(key)}
        />
      </div>
    </div>
  ),
};

/** All four positions side by side. */
export const AllPositions: Story = {
  args: {} as any,
  render: () => {
    const smallItems: MenuItem[] = [
      { key: 'a', label: 'Home', icon: 'check' },
      { key: 'b', label: 'Search', icon: 'search' },
      { key: 'c', label: 'Close', icon: 'times' },
    ];
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, padding: 32 }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: 8, fontSize: 13, color: 'var(--kreati-gray-500)' }}>bottom</p>
          <DockMenu items={smallItems} position="bottom" iconSize={48} maxIconSize={72} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: 8, fontSize: 13, color: 'var(--kreati-gray-500)' }}>top</p>
          <DockMenu items={smallItems} position="top" iconSize={48} maxIconSize={72} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ marginBottom: 8, fontSize: 13, color: 'var(--kreati-gray-500)' }}>left</p>
            <DockMenu items={smallItems} position="left" iconSize={48} maxIconSize={72} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ marginBottom: 8, fontSize: 13, color: 'var(--kreati-gray-500)' }}>right</p>
            <DockMenu items={smallItems} position="right" iconSize={48} maxIconSize={72} />
          </div>
        </div>
      </div>
    );
  },
};
