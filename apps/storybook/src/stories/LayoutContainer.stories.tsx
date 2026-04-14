import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Layout/Container',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Responsive container utilities. Centers content with max-width and horizontal padding.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

const Box = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={className} style={{ background: 'var(--kreati-primary-alpha-8)', padding: 'var(--kreati-space-4)', borderRadius: 'var(--kreati-radius-md)', fontFamily: 'var(--kreati-font-family)', fontSize: 'var(--kreati-font-size-sm)' }}>
    {children}
  </div>
);

export const Containers: Story = {
  render: () => (
    <div style={{ fontFamily: 'var(--kreati-font-family)' }}>
      <div style={{ background: 'var(--kreati-gray-100)', padding: 'var(--kreati-space-4)', marginBottom: 'var(--kreati-space-4)' }}>
        <div className="k-container k-container-sm">
          <Box>.k-container.k-container-sm (max-width: 640px)</Box>
        </div>
      </div>
      <div style={{ background: 'var(--kreati-gray-100)', padding: 'var(--kreati-space-4)', marginBottom: 'var(--kreati-space-4)' }}>
        <div className="k-container k-container-md">
          <Box>.k-container.k-container-md (max-width: 768px)</Box>
        </div>
      </div>
      <div style={{ background: 'var(--kreati-gray-100)', padding: 'var(--kreati-space-4)', marginBottom: 'var(--kreati-space-4)' }}>
        <div className="k-container k-container-lg">
          <Box>.k-container.k-container-lg (max-width: 1024px)</Box>
        </div>
      </div>
      <div style={{ background: 'var(--kreati-gray-100)', padding: 'var(--kreati-space-4)' }}>
        <div className="k-container k-container-xl">
          <Box>.k-container.k-container-xl (max-width: 1280px)</Box>
        </div>
      </div>
    </div>
  ),
};
