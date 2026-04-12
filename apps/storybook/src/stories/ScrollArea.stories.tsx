import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ScrollArea } from '../../../../packages/react/src/components/ScrollArea';
import { ScrollBar } from '../../../../packages/react/src/components/ScrollBar';

const meta = {
  title: 'Components/ScrollArea',
  component: ScrollArea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A scrollable content container that uses ScrollBar internally. Customize the scrollbar via `scrollBarProps` or replace it entirely with a custom `scrollBar` render function.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

const SampleContent = () => (
  <div style={{ padding: 16 }}>
    {Array.from({ length: 20 }, (_, i) => (
      <p key={i} style={{ margin: '0 0 12px' }}>
        Line {i + 1} — Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </p>
    ))}
  </div>
);

const WideContent = () => (
  <div style={{ width: 1200, padding: 16 }}>
    <p>This content is 1200px wide to demonstrate horizontal scrolling.</p>
    <div style={{ display: 'flex', gap: 16 }}>
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} style={{ minWidth: 100, height: 80, background: 'var(--kreati-primary-50)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Item {i + 1}
        </div>
      ))}
    </div>
  </div>
);

/** Default vertical scroll area with auto-hide scrollbar. */
export const Default: Story = {
  args: {
    maxHeight: '250px',
    children: <SampleContent />,
    style: { width: 400, border: '1px solid var(--kreati-gray-200)', borderRadius: 8 },
  },
};

/** Always-visible scrollbar with medium size. */
export const VisibleScrollbar: Story = {
  args: {
    maxHeight: '250px',
    scrollBarProps: { variant: 'visible', size: 'md' },
    children: <SampleContent />,
    style: { width: 400, border: '1px solid var(--kreati-gray-200)', borderRadius: 8 },
  },
};

/** Custom scrollbar color and arrows. */
export const CustomColor: Story = {
  args: {
    maxHeight: '250px',
    scrollBarProps: { variant: 'visible', size: 'lg', color: 'var(--kreati-primary-500)', arrows: true },
    children: <SampleContent />,
    style: { width: 400, border: '1px solid var(--kreati-gray-200)', borderRadius: 8 },
  },
};

/** Gradient scrollbar thumb. */
export const GradientThumb: Story = {
  args: {
    maxHeight: '250px',
    scrollBarProps: { variant: 'visible', size: 'md', gradient: { from: '#0f78a5', to: '#ffdb4f' } },
    children: <SampleContent />,
    style: { width: 400, border: '1px solid var(--kreati-gray-200)', borderRadius: 8 },
  },
};

/** Horizontal scroll area. */
export const Horizontal: Story = {
  args: {
    maxWidth: '400px',
    orientation: 'horizontal',
    scrollBarProps: { variant: 'visible', size: 'sm' },
    children: <WideContent />,
    style: { border: '1px solid var(--kreati-gray-200)', borderRadius: 8 },
  },
};

/** Native browser scrollbar. */
export const NativeScrollbar: Story = {
  args: {
    maxHeight: '250px',
    scrollBarProps: { variant: 'native' },
    children: <SampleContent />,
    style: { width: 400, border: '1px solid var(--kreati-gray-200)', borderRadius: 8 },
  },
};

/** Custom scrollBar render function replacing the internal ScrollBar. */
export const CustomScrollBar: Story = {
  args: {} as any,
  render: () => (
    <ScrollArea
      maxHeight="250px"
      scrollBar={(children) => (
        <ScrollBar
          maxHeight="250px"
          variant="visible"
          size="lg"
          gradient={{ from: '#a855f7', to: '#ec4899' }}
          trackColor="var(--kreati-gray-100)"
          arrows
        >
          {children}
        </ScrollBar>
      )}
      style={{ width: 400, border: '1px solid var(--kreati-gray-200)', borderRadius: 8 }}
    >
      <SampleContent />
    </ScrollArea>
  ),
};
