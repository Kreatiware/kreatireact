import type { Meta, StoryObj } from '@storybook/react';
import { NavigationBar } from '../../../../packages/react/src/components/NavigationBar';

const meta = {
  title: 'Components/NavigationBar',
  component: NavigationBar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A modern navigation bar with centered logo, dropdown menus, and responsive design. Supports transparent/solid modes, custom routing, and flexible item configuration.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    logo: {
      control: 'text',
      description: 'Logo content - can be a string or React component',
    },
    transparent: {
      control: 'boolean',
      description: 'Whether the navbar has a transparent background with blur effect',
    },
    mobileBreakpoint: {
      control: { type: 'number', min: 320, max: 1200, step: 10 },
      description: 'Breakpoint (px) at which mobile mode activates',
    },
    useRouter: {
      control: 'boolean',
      description: 'Whether to use router for navigation instead of url',
    },
    leftItems: {
      description: 'Array of navigation items displayed on the left side',
    },
    rightItems: {
      description: 'Array of navigation items displayed on the right side',
    },
  },
} satisfies Meta<typeof NavigationBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default navigation bar with basic configuration.
 * Shows centered logo with simple left and right navigation items.
 */
export const Default: Story = {
  args: {
    logo: 'KREATI',
    transparent: true,
  },
};

/**
 * Solid background variant without transparency.
 * Useful for pages with light backgrounds or when more contrast is needed.
 */
export const Solid: Story = {
  args: {
    logo: 'KREATI',
    transparent: false,
  },
};

/**
 * Navigation bar with dropdown menus.
 * Click on items with subitems to toggle the dropdown menu.
 * Supports nested navigation with disabled states.
 */
export const WithDropdowns: Story = {
  args: {
    logo: 'KREATI',
    transparent: false,
    leftItems: [
      {
        key: 'products',
        label: 'Products',
        items: [
          { key: 'laptops', label: 'Laptops', url: '/products/laptops' },
          { key: 'phones', label: 'Phones', url: '/products/phones' },
          { key: 'tablets', label: 'Tablets', url: '/products/tablets' },
          { key: 'accessories', label: 'Accessories', url: '/products/accessories' },
        ],
      },
      {
        key: 'services',
        label: 'Services',
        items: [
          { key: 'web', label: 'Web Development', url: '/services/web' },
          { key: 'mobile', label: 'Mobile Apps', url: '/services/mobile' },
          { key: 'consulting', label: 'Consulting', url: '/services/consulting', disabled: true },
        ],
      },
    ],
    rightItems: [
      {
        key: 'resources',
        label: 'Resources',
        items: [
          { key: 'docs', label: 'Documentation', url: '/docs' },
          { key: 'blog', label: 'Blog', url: '/blog' },
          { key: 'tutorials', label: 'Tutorials', url: '/tutorials' },
        ],
      },
      { key: 'contact', label: 'Contact', url: '/contact' },
    ],
  },
};

/**
 * Navigation items with different states.
 * Demonstrates disabled and external link states.
 */
export const WithStates: Story = {
  args: {
    logo: 'KREATI',
    transparent: false,
    leftItems: [
      { key: 'home', label: 'Home', url: '/' },
      { key: 'about', label: 'About', url: '/about' },
      { key: 'projects', label: 'Projects', url: '/projects' },
    ],
    rightItems: [
      { key: 'disabled', label: 'Disabled Item', url: '/disabled', disabled: true },
      { key: 'external', label: 'External Link', url: 'https://example.com', target: '_blank' },
    ],
  },
};

/**
 * Navigation with custom command handlers.
 * Items can have command callbacks instead of url for custom behavior.
 */
export const WithCommands: Story = {
  args: {
    logo: 'KREATI',
    transparent: false,
    leftItems: [
      {
        key: 'alert',
        label: 'Alert Demo',
        command: (item) => alert(`Clicked: ${item.label}`),
      },
      {
        key: 'console',
        label: 'Console Demo',
        command: (item) => console.log('Item clicked:', item),
      },
    ],
    rightItems: [
      { key: 'link', label: 'Regular Link', url: '/link' },
    ],
  },
};

/**
 * Navigation with separators between items.
 * Demonstrates the separator feature in menu items.
 */
export const WithSeparators: Story = {
  args: {
    logo: 'KREATI',
    transparent: false,
    leftItems: [
      {
        key: 'file',
        label: 'File',
        items: [
          { key: 'new', label: 'New', command: () => console.log('New') },
          { key: 'open', label: 'Open', command: () => console.log('Open') },
          { key: 'sep1', separator: true },
          { key: 'save', label: 'Save', command: () => console.log('Save') },
        ],
      },
    ],
    rightItems: [
      { key: 'help', label: 'Help', url: '/help' },
    ],
  },
};

/**
 * Transparent navbar variant.
 * Perfect for hero sections or pages with background images.
 */
export const Transparent: Story = {
  args: {
    logo: 'KREATI',
    transparent: true,
    leftItems: [
      { key: 'home', label: 'Home', url: '/' },
      { key: 'about', label: 'About', url: '/about' },
      { key: 'services', label: 'Services', url: '/services' },
    ],
    rightItems: [
      { key: 'blog', label: 'Blog', url: '/blog' },
      { key: 'contact', label: 'Contact', url: '/contact' },
    ],
  },
};
