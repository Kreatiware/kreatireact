import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  ChevronRight, ChevronLeft, ChevronUp, ChevronDown,
  ArrowRight, ArrowLeft, DoubleArrowRight, DoubleArrowLeft,
  Check, Hamburger, Times, Search, Minus, Plus,
  CalendarIcon, Maximize, Restore,
  InfoCircle, ExclamationTriangle, HelpCircle,
  User, Star, StarHalf, TimesCircle, Heart, Upload,
  Filter, Pencil, Trash, EllipsisV, Download, GripVertical,
  Copy, Print,
  Eye, EyeOff, Mail, Lock, Phone, Clock, Sort,
  Bell, BellOff, Refresh, ExternalLink, CheckCircle,
  Home, Settings, Grid, ListIcon, ImageIcon, Folder, File, Share,
  KreatiIcon,
} from '../../../../packages/icons/src';
import type { IconProps } from '../../../../packages/icons/src';

const AllIcons: Record<string, React.FC<IconProps>> = {
  ChevronRight, ChevronLeft, ChevronUp, ChevronDown,
  ArrowRight, ArrowLeft, DoubleArrowRight, DoubleArrowLeft,
  Check, Hamburger, Times, Search, Minus, Plus,
  CalendarIcon, Maximize, Restore,
  InfoCircle, ExclamationTriangle, HelpCircle, CheckCircle, TimesCircle,
  User, Star, StarHalf, Heart,
  Eye, EyeOff, Mail, Lock, Phone, Clock,
  Bell, BellOff,
  Home, Settings, Grid, ListIcon, ImageIcon,
  Folder, File, Upload, Download, Share,
  Filter, Sort, Refresh, ExternalLink,
  Pencil, Trash, Copy, Print, EllipsisV, GripVertical,
};

const IconShowcase: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
    {Object.entries(AllIcons).map(([name, Icon]) => (
      <div
        key={name}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          padding: 10,
          borderRadius: 8,
          border: '1px solid #e5e7eb',
        }}
      >
        <Icon size={size} color={color} />
        <span style={{ fontSize: 10, color: '#6b7280', textAlign: 'center' }}>{name}</span>
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
        component: `All ${Object.keys(AllIcons).length} icons from @kreatiware/icons. Each icon accepts size, color, and className props. Use the Icon resolver component for dynamic name-based rendering.`,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: { control: { type: 'range', min: 12, max: 64, step: 4 }, description: 'Icon size in pixels' },
    color: { control: 'color', description: 'Icon color' },
  },
} satisfies Meta<typeof IconShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllIconsGrid: Story = {
  args: { size: 24, color: 'currentColor' },
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
  args: { size: 32, color: '#0f78a5' },
};
