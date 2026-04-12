import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from '../../../../packages/react/src/components/Avatar';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [(Story: React.FC) => <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}><Story /></div>],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithImage: Story = {
  name: 'With Image',
  render: () => <Avatar image="https://i.pravatar.cc/150?img=3" alt="User" size="lg" />,
};

export const WithLabel: Story = {
  name: 'With Initials',
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <Avatar label="JD" severity="primary" />
      <Avatar label="AB" severity="success" />
      <Avatar label="XY" severity="danger" />
      <Avatar label="MN" severity="warning" />
    </div>
  ),
};

export const Placeholder: Story = {
  name: 'Default Placeholder',
  render: () => <Avatar size="lg" />,
};

export const Sizes: Story = {
  name: 'All Sizes',
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <Avatar key={s} label={s.toUpperCase()} severity="primary" size={s} />
      ))}
    </div>
  ),
};

export const Shapes: Story = {
  name: 'Circle vs Square',
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <Avatar label="CI" severity="info" size="lg" shape="circle" />
      <Avatar label="SQ" severity="info" size="lg" shape="square" />
    </div>
  ),
};

export const ImageFallback: Story = {
  name: 'Image Error Fallback',
  render: () => <Avatar image="https://broken-url.invalid/photo.jpg" label="FB" severity="danger" size="lg" />,
};

export const WithIcon: Story = {
  name: 'With Custom Icon',
  render: () => (
    <Avatar
      size="lg"
      severity="help"
      icon={<span style={{ fontSize: 20 }}>{'\u{1F464}'}</span>}
    />
  ),
};

export const AvatarGroup: Story = {
  name: 'Avatar Group',
  render: () => (
    <div style={{ display: 'flex' }}>
      {['JD', 'AB', 'MK', 'XY'].map((l, i) => (
        <Avatar key={l} label={l} severity={(['primary', 'success', 'warning', 'danger'] as const)[i]} size="md" style={{ marginLeft: i > 0 ? -8 : 0, border: '2px solid white' }} />
      ))}
      <Avatar label="+3" severity="secondary" size="md" style={{ marginLeft: -8, border: '2px solid white' }} />
    </div>
  ),
};
