import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../Button';

const meta = {
  title: 'Kreati/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Button Primary',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Button Secondary',
    variant: 'secondary',
  },
};

export const Outline: Story = {
  args: {
    children: 'Button Outline',
    variant: 'outline',
  },
};

export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};