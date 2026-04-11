import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Divider } from '../../../../packages/react/src/components/Divider';
import { Chip } from '../../../../packages/react/src/components/Chip';
import { Button } from '../../../../packages/react/src/components/Button';

const meta = {
  title: 'Components/Divider',
  component: Divider,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A horizontal or vertical separator line with optional label or custom template content. Supports solid, dashed, and dotted variants with configurable alignment, color, and thickness.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Simple horizontal line. */
export const Default: Story = {
  args: {},
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
};

/** Divider with a text label centered. */
export const WithLabel: Story = {
  args: { label: 'OR' },
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
};

/** Label aligned to the start. */
export const AlignStart: Story = {
  args: { label: 'Section', align: 'start' },
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
};

/** Label aligned to the end. */
export const AlignEnd: Story = {
  args: { label: 'End', align: 'end' },
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
};

/** Dashed line variant. */
export const Dashed: Story = {
  args: { variant: 'dashed', label: 'Dashed' },
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
};

/** Dotted line variant. */
export const Dotted: Story = {
  args: { variant: 'dotted', label: 'Dotted' },
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
};

/** Custom color and thickness. */
export const CustomStyle: Story = {
  args: { label: 'Custom', color: 'var(--kreati-primary-500)', width: '2px' },
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
};

/** Custom template content instead of a text label. */
export const WithTemplate: Story = {
  args: { template: <Chip variant="primary" size="sm">New</Chip> },
  decorators: [(Story) => <div style={{ width: 400 }}><Story /></div>],
};

/** Vertical divider between elements. */
export const Vertical: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, height: 40 }}>
      <Button label="Left" buttonType="text" size="sm" />
      <Divider orientation="vertical" />
      <Button label="Right" buttonType="text" size="sm" />
    </div>
  ),
};

/** Vertical divider with label. */
export const VerticalWithLabel: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'stretch', height: 120 }}>
      <div style={{ padding: 16 }}>Left content</div>
      <Divider orientation="vertical" label="OR" />
      <div style={{ padding: 16 }}>Right content</div>
    </div>
  ),
};

/** Multiple dividers separating content sections. */
export const InContext: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <p style={{ margin: '0 0 12px' }}>First section with some content.</p>
      <Divider />
      <p style={{ margin: '12px 0' }}>Second section with more content.</p>
      <Divider label="Options" variant="dashed" />
      <p style={{ margin: '12px 0 0' }}>Third section below a labeled divider.</p>
    </div>
  ),
};
