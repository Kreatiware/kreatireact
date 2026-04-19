import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AvatarGroup } from '../../../../packages/react/src/components/AvatarGroup';
import { Avatar } from '../../../../packages/react/src/components/Avatar';

const meta = {
  title: 'Components/AvatarGroup',
  component: AvatarGroup,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: { children: null },
} satisfies Meta<typeof AvatarGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Default',
  render: () => (
    <AvatarGroup>
      <Avatar image="https://i.pravatar.cc/150?img=1" alt="User 1" />
      <Avatar image="https://i.pravatar.cc/150?img=2" alt="User 2" />
      <Avatar image="https://i.pravatar.cc/150?img=3" alt="User 3" />
      <Avatar label="JD" severity="primary" />
    </AvatarGroup>
  ),
};

export const WithMax: Story = {
  name: 'With Max',
  render: () => (
    <AvatarGroup max={3}>
      <Avatar image="https://i.pravatar.cc/150?img=1" alt="User 1" />
      <Avatar image="https://i.pravatar.cc/150?img=2" alt="User 2" />
      <Avatar image="https://i.pravatar.cc/150?img=3" alt="User 3" />
      <Avatar label="AB" severity="success" />
      <Avatar label="CD" severity="warning" />
      <Avatar label="EF" severity="danger" />
    </AvatarGroup>
  ),
};

export const Sizes: Story = {
  name: 'Sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <AvatarGroup size="xs">
        <Avatar image="https://i.pravatar.cc/150?img=4" alt="User" />
        <Avatar label="A" severity="primary" />
        <Avatar label="B" severity="info" />
      </AvatarGroup>
      <AvatarGroup size="sm">
        <Avatar image="https://i.pravatar.cc/150?img=4" alt="User" />
        <Avatar label="A" severity="primary" />
        <Avatar label="B" severity="info" />
      </AvatarGroup>
      <AvatarGroup size="md">
        <Avatar image="https://i.pravatar.cc/150?img=4" alt="User" />
        <Avatar label="A" severity="primary" />
        <Avatar label="B" severity="info" />
      </AvatarGroup>
      <AvatarGroup size="lg">
        <Avatar image="https://i.pravatar.cc/150?img=4" alt="User" />
        <Avatar label="A" severity="primary" />
        <Avatar label="B" severity="info" />
      </AvatarGroup>
      <AvatarGroup size="xl">
        <Avatar image="https://i.pravatar.cc/150?img=4" alt="User" />
        <Avatar label="A" severity="primary" />
        <Avatar label="B" severity="info" />
      </AvatarGroup>
    </div>
  ),
};

export const SquareShape: Story = {
  name: 'Square Shape',
  render: () => (
    <AvatarGroup shape="square" max={4}>
      <Avatar image="https://i.pravatar.cc/150?img=5" alt="User 1" />
      <Avatar image="https://i.pravatar.cc/150?img=6" alt="User 2" />
      <Avatar label="MK" severity="accent" />
      <Avatar label="RS" severity="help" />
      <Avatar label="TU" severity="danger" />
    </AvatarGroup>
  ),
};

export const CustomOverflow: Story = {
  name: 'Custom Overflow Template',
  render: () => (
    <AvatarGroup max={2} size="lg" overflowTemplate={(count) => <span style={{ fontSize: '0.75rem' }}>{count} more</span>}>
      <Avatar image="https://i.pravatar.cc/150?img=7" alt="User 1" />
      <Avatar image="https://i.pravatar.cc/150?img=8" alt="User 2" />
      <Avatar image="https://i.pravatar.cc/150?img=9" alt="User 3" />
      <Avatar label="XY" severity="primary" />
    </AvatarGroup>
  ),
};

export const ClickableOverflow: Story = {
  name: 'Clickable Overflow',
  render: () => (
    <AvatarGroup max={3} onOverflowClick={(count) => alert(`${count} more users`)}>
      <Avatar image="https://i.pravatar.cc/150?img=10" alt="User 1" />
      <Avatar image="https://i.pravatar.cc/150?img=11" alt="User 2" />
      <Avatar image="https://i.pravatar.cc/150?img=12" alt="User 3" />
      <Avatar label="P" severity="info" />
      <Avatar label="Q" severity="warning" />
    </AvatarGroup>
  ),
};
