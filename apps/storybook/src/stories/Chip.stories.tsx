import type { Meta, StoryObj } from '@storybook/react';
import { Chip } from '../../../../packages/react/src/components/Chip';

const meta = {
  title: 'Components/Chip',
  component: Chip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A small pill-shaped component for labels, tags and status indicators. Supports multiple color variants, sizes and optional icons.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'success', 'warning', 'error', 'outline'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    children: { control: 'text' },
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Chip', variant: 'primary', size: 'md' },
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Chip variant="primary">Primary</Chip>
      <Chip variant="secondary">Secondary</Chip>
      <Chip variant="success">Success</Chip>
      <Chip variant="warning">Warning</Chip>
      <Chip variant="error">Error</Chip>
      <Chip variant="outline">Outline</Chip>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Chip size="sm">Small</Chip>
      <Chip size="md">Medium</Chip>
      <Chip size="lg">Large</Chip>
    </div>
  ),
};

export const WithEmoji: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Chip variant="primary">🚀 Nuevo</Chip>
      <Chip variant="success">✅ Activo</Chip>
      <Chip variant="warning">⚠️ Pendiente</Chip>
      <Chip variant="error">🔴 Error</Chip>
      <Chip variant="outline">v1.0.0</Chip>
    </div>
  ),
};
