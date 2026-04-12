import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from '../../../../packages/react/src/components/Spinner';

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [(Story: React.FC) => <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}><Story /></div>],
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  name: 'Basic',
  render: () => <Spinner />,
};

export const Sizes: Story = {
  name: 'All Sizes',
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <Spinner key={s} size={s} />
      ))}
    </div>
  ),
};

export const Colors: Story = {
  name: 'Custom Colors',
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Spinner color="var(--kreati-severity-success)" />
      <Spinner color="var(--kreati-severity-danger)" />
      <Spinner color="var(--kreati-severity-warning)" />
      <Spinner color="var(--kreati-severity-info)" />
    </div>
  ),
};

export const StrokeWidths: Story = {
  name: 'Stroke Widths',
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Spinner size="lg" strokeWidth={2} />
      <Spinner size="lg" strokeWidth={4} />
      <Spinner size="lg" strokeWidth={6} />
    </div>
  ),
};

export const InlineWithText: Story = {
  name: 'Inline with Text',
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontFamily: 'var(--kreati-font-family)' }}>
      <Spinner size="sm" /> Loading data...
    </div>
  ),
};
