import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumb } from '../../../../packages/react/src/components/Breadcrumb';
import type { MenuItem } from '../../../../packages/react/src/types/navigation';

const meta = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A breadcrumb navigation trail showing the current page location. Supports configurable separators (icon name, ReactNode, or text), icons, disabled states, custom templates, and URL navigation. The last item is rendered as the current page. Fully accessible with ARIA breadcrumb role and aria-current="page".',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicItems: MenuItem[] = [
  { key: 'home', label: 'Home', url: '/' },
  { key: 'products', label: 'Products', url: '/products' },
  { key: 'laptops', label: 'Laptops', url: '/products/laptops' },
  { key: 'macbook', label: 'MacBook Pro' },
];

/**
 * Basic breadcrumb with ChevronRight separator (default).
 */
export const Default: Story = {
  args: {
    items: basicItems,
  },
};

/**
 * Breadcrumb with icons on items.
 */
export const WithIcons: Story = {
  args: {
    items: [
      { key: 'home', label: 'Home', icon: 'check', url: '/' },
      { key: 'settings', label: 'Settings', icon: 'search', url: '/settings' },
      { key: 'profile', label: 'Profile' },
    ],
  },
};

/**
 * Custom text separator.
 */
export const TextSeparator: Story = {
  args: {
    items: basicItems,
    separator: '/',
  },
};

/**
 * Custom icon separator using an icon name string.
 */
export const IconSeparator: Story = {
  args: {
    items: basicItems,
    separator: 'chevron-down',
  },
};

/**
 * Custom ReactNode separator.
 */
export const CustomSeparator: Story = {
  args: {
    items: basicItems,
    separator: <span style={{ margin: '0 2px' }}>→</span>,
  },
};

/**
 * Breadcrumb with a disabled item.
 */
export const WithDisabled: Story = {
  args: {
    items: [
      { key: 'home', label: 'Home', url: '/' },
      { key: 'archived', label: 'Archived', url: '/archived', disabled: true },
      { key: 'item', label: 'Item' },
    ],
  },
};

/**
 * Breadcrumb with command callbacks.
 */
export const WithCommands: Story = {
  args: {
    items: [
      { key: 'home', label: 'Home', command: () => console.log('Home clicked') },
      { key: 'products', label: 'Products', command: () => console.log('Products clicked') },
      { key: 'current', label: 'Current Page' },
    ],
  },
};

/**
 * Single item breadcrumb — just the current page.
 */
export const SingleItem: Story = {
  args: {
    items: [{ key: 'home', label: 'Home' }],
  },
};
