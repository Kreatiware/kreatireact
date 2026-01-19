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
    useRouter: {
      control: 'boolean',
      description: 'Whether to use router for navigation instead of href',
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
 * Supports nested navigation with active and disabled states.
 */
export const WithDropdowns: Story = {
  args: {
    logo: 'KREATI',
    transparent: false,
    leftItems: [
      {
        label: 'Products',
        items: [
          { label: 'Laptops', href: '/products/laptops' },
          { label: 'Phones', href: '/products/phones' },
          { label: 'Tablets', href: '/products/tablets' },
          { label: 'Accessories', href: '/products/accessories' }
        ]
      },
      {
        label: 'Services',
        items: [
          { label: 'Web Development', href: '/services/web' },
          { label: 'Mobile Apps', href: '/services/mobile' },
          { label: 'Consulting', href: '/services/consulting', disabled: true }
        ]
      }
    ],
    rightItems: [
      {
        label: 'Resources',
        items: [
          { label: 'Documentation', href: '/docs' },
          { label: 'Blog', href: '/blog' },
          { label: 'Tutorials', href: '/tutorials' }
        ]
      },
      { label: 'Contact', href: '/contact' }
    ],
  },
};

/**
 * Navigation items with different states.
 * Demonstrates active, disabled, and external link states.
 */
export const WithStates: Story = {
  args: {
    logo: 'KREATI',
    transparent: false,
    leftItems: [
      { 
        label: 'Home', 
        href: '/',
        active: true
      },
      { 
        label: 'About', 
        href: '/about'
      },
      { 
        label: 'Projects', 
        href: '/projects'
      }
    ],
    rightItems: [
      { 
        label: 'Disabled Item', 
        href: '/disabled',
        disabled: true
      },
      { 
        label: 'External Link', 
        href: 'https://example.com',
        target: '_blank'
      }
    ],
  },
};

/**
 * Navigation with custom click handlers.
 * Items can have onClick callbacks instead of href for custom behavior.
 */
export const WithClickHandlers: Story = {
  args: {
    logo: 'KREATI',
    transparent: false,
    leftItems: [
      {
        label: 'Alert Demo',
        onClick: (item) => alert(`Clicked: ${item.label}`)
      },
      {
        label: 'Console Demo',
        onClick: (item) => console.log('Item clicked:', item)
      }
    ],
    rightItems: [
      { label: 'Regular Link', href: '/link' }
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
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about' },
      { label: 'Services', href: '/services' }
    ],
    rightItems: [
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '/contact' }
    ],
  },
};