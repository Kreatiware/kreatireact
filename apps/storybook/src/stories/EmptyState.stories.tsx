import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState, Button } from '@kreatiware/react';
import { Search, File, Folder, Mail, Settings } from '@kreatiware/icons';

const meta = {
  title: 'Components/EmptyState',
  component: EmptyState,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    icon: <Search size={48} />,
    title: 'No results found',
    description: 'Try adjusting your search or filters to find what you are looking for.',
    actions: <Button label="Clear filters" severity="primary" />,
  },
};

export const WithMultipleActions: Story = {
  args: {
    icon: <File size={48} />,
    title: 'No documents yet',
    description: 'Get started by creating your first document or importing from a file.',
    actions: (
      <>
        <Button label="Create document" severity="primary" />
        <Button label="Import" severity="secondary" buttonType="outlined" />
      </>
    ),
  },
};

export const Small: Story = {
  args: {
    icon: <Mail size={32} />,
    title: 'Inbox empty',
    description: 'No new messages.',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    icon: <Folder size={64} />,
    title: 'No projects',
    description: 'Create a new project to organize your work and collaborate with your team.',
    actions: <Button label="New project" severity="accent" />,
    size: 'lg',
  },
};

export const IconOnly: Story = {
  args: {
    icon: <Settings size={48} />,
    title: 'Coming soon',
  },
};

export const InCard: Story = {
  render: () => (
    <div style={{
      border: '1px solid var(--kreati-gray-200)',
      borderRadius: 'var(--kreati-radius-lg)',
      background: 'var(--kreati-white)',
      boxShadow: 'var(--kreati-shadow-sm)',
      maxWidth: 500,
    }}>
      <EmptyState
        icon={<Search size={40} />}
        title="No matches"
        description="We could not find any items matching your criteria."
        actions={<Button label="Reset" severity="primary" size="sm" />}
      />
    </div>
  ),
};
