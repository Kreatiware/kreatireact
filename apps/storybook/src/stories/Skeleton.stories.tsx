import React, { useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from '../../../../packages/react/src/components/Skeleton';

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  parameters: { layout: 'centered', docs: { description: { component: 'Animated placeholder for loading content. Supports rectangle, circle, and multi-line text shapes with shimmer or pulse animations.' } } },
  tags: ['autodocs'],
  decorators: [(Story: React.FC) => <div style={{ background: '#fff', padding: 24, borderRadius: 8, width: 400 }}><Story /></div>],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Rectangle: Story = {
  name: 'Rectangle',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Skeleton width="100%" height={20} />
      <Skeleton width="75%" height={20} />
      <Skeleton width={200} height={40} borderRadius={8} />
    </div>
  ),
};

export const Circle: Story = {
  name: 'Circle',
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Skeleton shape="circle" width={32} />
      <Skeleton shape="circle" width={48} />
      <Skeleton shape="circle" width={64} />
    </div>
  ),
};

export const TextLines: Story = {
  name: 'Text Lines',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Skeleton shape="text" lines={2} />
      <Skeleton shape="text" lines={4} />
    </div>
  ),
};

export const PulseAnimation: Story = {
  name: 'Pulse Animation',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Skeleton width="100%" height={20} animation="pulse" />
      <Skeleton shape="circle" width={48} animation="pulse" />
      <Skeleton shape="text" lines={3} animation="pulse" />
    </div>
  ),
};

export const NoAnimation: Story = {
  name: 'No Animation',
  render: () => <Skeleton width="100%" height={40} animation="none" />,
};

export const CardSkeleton: Story = {
  name: 'Card Skeleton',
  render: () => (
    <div style={{ border: '1px solid var(--kreati-gray-200)', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Skeleton width="100%" height={160} borderRadius={8} />
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Skeleton shape="circle" width={40} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Skeleton width="60%" height={14} />
          <Skeleton width="40%" height={12} />
        </div>
      </div>
      <Skeleton shape="text" lines={3} />
    </div>
  ),
};

export const ListSkeleton: Story = {
  name: 'List Skeleton',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 0' }}>
          <Skeleton shape="circle" width={36} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Skeleton width={`${70 + (i % 3) * 10}%`} height={12} />
            <Skeleton width={`${40 + (i % 2) * 20}%`} height={10} />
          </div>
        </div>
      ))}
    </div>
  ),
};

export const LoadingToggle: Story = {
  name: 'Loading Toggle (real use case)',
  render: () => {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      if (!loading) return;
      const t = setTimeout(() => setLoading(false), 2000);
      return () => clearTimeout(t);
    }, [loading]);
    return (
      <div>
        <button onClick={() => setLoading(true)} style={{ marginBottom: 16, padding: '6px 12px', cursor: 'pointer' }}>Reload</button>
        {loading ? (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Skeleton shape="circle" width={48} />
            <div style={{ flex: 1 }}>
              <Skeleton width="50%" height={16} style={{ marginBottom: 8 }} />
              <Skeleton shape="text" lines={2} />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--kreati-primary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>JD</div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>John Doe</div>
              <div style={{ fontSize: 13, color: 'var(--kreati-gray-500)' }}>Software engineer with 10 years of experience building scalable web applications.</div>
            </div>
          </div>
        )}
      </div>
    );
  },
};
