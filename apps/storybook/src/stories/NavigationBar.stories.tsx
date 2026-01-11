import type { Meta, StoryObj } from '@storybook/react';
import { NavigationBar } from '../NavigationBar';
import { Check, ArrowRight } from '../icons';

const meta = {
  title: 'Kreati/NavigationBar',
  component: NavigationBar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    transparent: {
      control: { type: 'boolean' },
    },
    useRouter: {
      control: { type: 'boolean' },
    },
  },
} satisfies Meta<typeof NavigationBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Solid: Story = {
  args: {
    transparent: false,
  },
};

export const WithIcons: Story = {
  args: {
    leftItems: [
      { 
        label: 'About', 
        href: '/about',
        icon: <Check size={14} />
      },
      { 
        label: 'Projects', 
        href: '/projects',
        icon: <ArrowRight size={14} />
      }
    ],
    rightItems: [
      { 
        label: 'Shop', 
        href: '/shop',
        icon: <ArrowRight size={14} />
      },
      { 
        label: 'Contact', 
        href: '/contact',
        icon: <Check size={14} />
      }
    ],
  },
};

export const WithSubmenus: Story = {
  args: {
    leftItems: [
      {
        label: 'Products',
        href: '/products',
        icon: <ArrowRight size={14} />,
        items: [
          { label: 'Laptops', href: '/products/laptops' },
          { label: 'Phones', href: '/products/phones' },
          { label: 'Tablets', href: '/products/tablets' }
        ]
      },
      {
        label: 'Services',
        onClick: (item) => console.log('Services clicked:', item),
        icon: <Check size={14} />,
        items: [
          { label: 'Web Development', href: '/services/web' },
          { label: 'Mobile Apps', href: '/services/mobile' }
        ]
      }
    ],
    rightItems: [
      { label: 'Support', href: '/support' },
      { label: 'Contact', href: '/contact' }
    ],
  },
};

export const WithStates: Story = {
  args: {
    leftItems: [
      { 
        label: 'Home', 
        href: '/',
        active: true,
        icon: <Check size={14} />
      },
      { 
        label: 'About', 
        href: '/about'
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
        target: '_blank',
        icon: <ArrowRight size={14} />
      }
    ],
  },
};

export const WithClickHandlers: Story = {
  args: {
    leftItems: [
      {
        label: 'Alert Demo',
        onClick: (item) => alert(`Clicked: ${item.label}`),
        icon: <Check size={14} />
      },
      {
        label: 'Console Demo',
        onClick: (item) => console.log('Item clicked:', item),
        icon: <ArrowRight size={14} />
      }
    ],
    rightItems: [
      { label: 'Regular Link', href: '/link' }
    ],
  },
};

export const CustomLogo: Story = {
  args: {
    logo: 'KREATI',
    leftItems: [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about' }
    ],
    rightItems: [
      { label: 'Contact', href: '/contact' }
    ],
  },
};