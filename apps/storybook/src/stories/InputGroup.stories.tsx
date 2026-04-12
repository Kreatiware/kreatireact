import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { InputGroup } from '../../../../packages/react/src/components/InputGroup';
import { Input } from '../../../../packages/react/src/components/Input';
import { Button } from '../../../../packages/react/src/components/Button';

const meta = {
  title: 'Components/InputGroup',
  component: InputGroup,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Text prefix and suffix addons. */
export const TextAddons: Story = {
  args: {} as any,
  render: () => (
    <InputGroup prefix="https://" suffix=".com" label="Website" style={{ width: 350 }}>
      <Input fullWidth placeholder="domain" />
    </InputGroup>
  ),
};

/** Currency prefix. */
export const Currency: Story = {
  args: {} as any,
  render: () => (
    <InputGroup prefix="$" label="Price" style={{ width: 200 }}>
      <Input fullWidth type="number" placeholder="0.00" />
    </InputGroup>
  ),
};

/** Button as suffix. */
export const WithButton: Story = {
  args: {} as any,
  render: () => (
    <InputGroup suffix={<Button>Search</Button>} style={{ width: 350 }}>
      <Input fullWidth placeholder="Search..." />
    </InputGroup>
  ),
};

/** Floating label — placeholder shows only on focus. */
export const FloatingLabel: Story = {
  args: {} as any,
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <InputGroup prefix="https://" suffix=".com" style={{ width: 350 }}>
        <Input fullWidth label="Domain" placeholder="my-website" />
      </InputGroup>
      <InputGroup prefix="@" style={{ width: 300 }}>
        <Input fullWidth label="Username" placeholder="john_doe" />
      </InputGroup>
      <InputGroup prefix="$" style={{ width: 200 }}>
        <Input fullWidth label="Amount" type="number" />
      </InputGroup>
    </div>
  ),
};

/** Error and success — label, helper, and error below the entire group. */
export const States: Story = {
  args: {} as any,
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <InputGroup prefix="https://" label="Website" error="Invalid domain" helperText="Enter your website URL" required style={{ width: 350 }}>
        <Input fullWidth placeholder="domain" />
      </InputGroup>
      <InputGroup prefix="https://" label="Website" success helperText="Looks good!" style={{ width: 350 }}>
        <Input fullWidth defaultValue="kreatiware" />
      </InputGroup>
    </div>
  ),
};

/** Full width mode. */
export const FullWidth: Story = {
  args: {} as any,
  render: () => (
    <InputGroup prefix="@" label="Username" fullWidth>
      <Input fullWidth placeholder="username" />
    </InputGroup>
  ),
};
