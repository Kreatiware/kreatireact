import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Pagination } from '../../../../packages/react/src/components/Pagination';

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { totalItems: 100, itemsPerPage: 10, defaultPage: 1 } };
export const WithFirstLast: Story = { args: { totalItems: 200, itemsPerPage: 10, showFirstLast: true, defaultPage: 5 } };
export const FewPages: Story = { args: { totalItems: 30, itemsPerPage: 10 } };
export const ManyPages: Story = { args: { totalItems: 500, itemsPerPage: 10, defaultPage: 15 } };

export const Sizes: Story = {
  args: {} as any,
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <Pagination key={s} totalItems={100} itemsPerPage={10} size={s} defaultPage={3} />
      ))}
    </div>
  ),
};

export const Controlled: Story = {
  args: {} as any,
  render: () => {
    const [page, setPage] = useState(1);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        <Pagination totalItems={100} itemsPerPage={10} page={page} onPageChange={setPage} />
        <span style={{ fontSize: 14, color: '#6b7280' }}>Page: {page}</span>
      </div>
    );
  },
};
