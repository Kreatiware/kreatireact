import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TreeSelect } from '../../../../packages/react/src/components/TreeSelect';
import { Dialog } from '../../../../packages/react/src/components/Dialog';
import { Button } from '../../../../packages/react/src/components/Button';
import type { TreeNode } from '../../../../packages/react/src/components/Tree';

const nodes: TreeNode[] = [
  { key: 'electronics', label: 'Electronics', children: [
    { key: 'phones', label: 'Phones', children: [
      { key: 'iphone', label: 'iPhone' },
      { key: 'samsung', label: 'Samsung' },
      { key: 'pixel', label: 'Pixel' },
    ]},
    { key: 'laptops', label: 'Laptops', children: [
      { key: 'macbook', label: 'MacBook' },
      { key: 'thinkpad', label: 'ThinkPad' },
    ]},
    { key: 'tablets', label: 'Tablets' },
  ]},
  { key: 'clothing', label: 'Clothing', children: [
    { key: 'men', label: 'Men' },
    { key: 'women', label: 'Women' },
    { key: 'kids', label: 'Kids', disabled: true },
  ]},
  { key: 'books', label: 'Books' },
];

const meta = {
  title: 'Components/TreeSelect',
  component: TreeSelect,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof TreeSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Single selection — navigate sub-levels by clicking parent nodes. */
export const Default: Story = {
  args: { nodes, label: 'Category', placeholder: 'Select a category', style: { width: 300 } },
};

/** With filter — disabled nodes visible (default). */
export const Filterable: Story = {
  args: { nodes, label: 'Category', filterable: true, placeholder: 'Select...', style: { width: 300 } },
};

/** With filter — disabled nodes hidden. */
export const FilterHideDisabled: Story = {
  args: { nodes, label: 'Category', filterable: true, filterDisabled: true, placeholder: 'Select...', style: { width: 300 } },
};

/** Multiple selection mode. */
export const Multiple: Story = {
  args: { nodes, label: 'Categories', multiple: true, placeholder: 'Select categories', style: { width: 300 } },
};

/** Stacked variant with validation. */
export const Validation: Story = {
  args: {} as any,
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <TreeSelect nodes={nodes} label="Category" variant="stacked" error="Required field" required style={{ width: 300 }} />
      <TreeSelect nodes={nodes} label="Category" value="macbook" success style={{ width: 300 }} />
    </div>
  ),
};

/** Controlled with external value display. */
export const Controlled: Story = {
  args: {} as any,
  render: () => {
    const [val, setVal] = useState<string>('');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <TreeSelect nodes={nodes} label="Category" value={val} onChange={(v) => setVal(v as string)} placeholder="Select..." style={{ width: 300 }} />
        <span style={{ fontSize: 13, color: '#6b7280' }}>Selected: {val || 'none'}</span>
      </div>
    );
  },
};

/** TreeSelect inside nested Dialogs — tests overlay z-index stacking with sub-levels. */
export const InsideDialog: Story = {
  args: {} as any,
  render: () => {
    const [d1, setD1] = useState(false);
    const [d2, setD2] = useState(false);
    return (
      <div>
        <Button onClick={() => setD1(true)}>Open Dialog</Button>
        <Dialog visible={d1} onHide={() => setD1(false)} header="Level 1" style={{ width: 480 }}>
          <TreeSelect nodes={nodes} label="Category L1" placeholder="Select..." fullWidth filterable />
          <div style={{ marginTop: 16 }}>
            <Button onClick={() => setD2(true)}>Open Nested Dialog</Button>
          </div>
          <Dialog visible={d2} onHide={() => setD2(false)} header="Level 2" style={{ width: 400 }}>
            <TreeSelect nodes={nodes} label="Category L2" placeholder="Select..." fullWidth filterable />
          </Dialog>
        </Dialog>
      </div>
    );
  },
};
