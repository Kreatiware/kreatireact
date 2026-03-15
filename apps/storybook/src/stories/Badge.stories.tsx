import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '../../../../packages/react/src/components/Badge';

const meta = {
  title: 'Components/Badge',
  component: Badge,
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
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'warning', 'error', 'outline'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    children: {
      control: 'text',
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default badge with primary variant.
 */
export const Default: Story = {
  args: {
    children: 'Badge',
    variant: 'primary',
    size: 'md',
  },
};

/**
 * All available badge variants.
 */
export const Variants: Story = {
  args: { children: 'Badge' },
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

/**
 * Badge sizes comparison.
 */
export const Sizes: Story = {
  args: { children: 'Badge' },
  render: () => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
};

/**
 * Badges with emoji icons for visual emphasis.
 */
export const WithEmoji: Story = {
  args: { children: 'Badge' },
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge variant="primary">🚀 Nuevo</Badge>
      <Badge variant="success">✅ Activo</Badge>
      <Badge variant="warning">⚠️ Pendiente</Badge>
      <Badge variant="error">🔴 Error</Badge>
      <Badge variant="outline">v1.0.0</Badge>
    </div>
  ),
};
