import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  DoubleArrowRight,
  DoubleArrowLeft,
  Check,
  Hamburger,
  Times,
  Search,
  Minus,
  Plus,
  CalendarIcon,
  Maximize,
  Restore,
  InfoCircle,
  ExclamationTriangle,
  HelpCircle,
  User,
  KreatiIcon,
} from '../../../../packages/icons/src';
import type { IconProps } from '../../../../packages/icons/src';

const AllIcons: Record<string, React.FC<IconProps>> = {
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  DoubleArrowRight,
  DoubleArrowLeft,
  Check,
  Hamburger,
  Times,
  Search,
  Minus,
  Plus,
  CalendarIcon,
  Maximize,
  Restore,
  InfoCircle,
  ExclamationTriangle,
  HelpCircle,
  User,
};

const IconShowcase: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 16 }}>
    {Object.entries(AllIcons).map(([name, Icon]) => (
      <div
        key={name}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          padding: 12,
          borderRadius: 8,
          border: '1px solid #e5e7eb',
        }}
      >
        <Icon size={size} color={color} />
        <span style={{ fontSize: 11, color: '#6b7280', textAlign: 'center' }}>{name}</span>
      </div>
    ))}
  </div>
);

const meta = {
  title: 'Icons/Showcase',
  component: IconShowcase,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'All available icons from @kreatiware/icons. Each icon accepts size, color, and className props.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'range', min: 12, max: 64, step: 4 },
      description: 'Icon size in pixels',
    },
    color: {
      control: 'color',
      description: 'Icon color',
    },
  },
} satisfies Meta<typeof IconShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllIconsGrid: Story = {
  args: {
    size: 24,
    color: 'currentColor',
  },
};

export const WithKreatiIconWrapper: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      {Object.entries(AllIcons).map(([name, Icon]) => (
        <KreatiIcon key={name} size={args.size}>
          <Icon color={args.color} />
        </KreatiIcon>
      ))}
    </div>
  ),
  args: {
    size: 32,
    color: '#0f78a5',
  },
};
