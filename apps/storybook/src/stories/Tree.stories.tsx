import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tree } from '../../../../packages/react/src/components/Tree';
import { Dialog } from '../../../../packages/react/src/components/Dialog';
import { Button } from '../../../../packages/react/src/components/Button';
import type { TreeNode } from '../../../../packages/react/src/components/Tree';

const icon = (d: string, color: string) => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill={color}><path d={d} /></svg>
);

const folderPath = 'M10,4H4A2,2,0,0,0,2,6V18a2,2,0,0,0,2,2H20a2,2,0,0,0,2-2V8a2,2,0,0,0-2-2H12Z';
const filePath = 'M14,2H6A2,2,0,0,0,4,4V20a2,2,0,0,0,2,2H18a2,2,0,0,0,2-2V8ZM13,9V3.5L18.5,9Z';
const imgPath = 'M21,3H3A2,2,0,0,0,1,5V19a2,2,0,0,0,2,2H21a2,2,0,0,0,2-2V5A2,2,0,0,0,21,3ZM5,17l3.5-4.5,2.5,3L14.5,11,19,17Z';
const musicPath = 'M12,3v10.55A4,4,0,1,0,14,17V7h4V3Z';

const nodes: TreeNode[] = [
  { key: 'docs', label: 'Documents', icon: icon(folderPath, '#f59e0b'), children: [
    { key: 'resume', label: 'Resume.pdf', icon: icon(filePath, '#ef4444') },
    { key: 'cover', label: 'Cover Letter.docx', icon: icon(filePath, '#3b82f6') },
    { key: 'notes', label: 'Notes.txt', icon: icon(filePath, '#6b7280') },
  ]},
  { key: 'photos', label: 'Photos', icon: icon(folderPath, '#f59e0b'), children: [
    { key: 'vacation', label: 'Vacation', icon: icon(folderPath, '#f59e0b'), children: [
      { key: 'beach', label: 'beach.jpg', icon: icon(imgPath, '#10b981') },
      { key: 'mountain', label: 'mountain.jpg', icon: icon(imgPath, '#10b981') },
    ]},
    { key: 'profile', label: 'profile.png', icon: icon(imgPath, '#8b5cf6') },
  ]},
  { key: 'music', label: 'Music', icon: icon(folderPath, '#f59e0b'), children: [
    { key: 'song1', label: 'song1.mp3', icon: icon(musicPath, '#ec4899') },
    { key: 'song2', label: 'song2.mp3', icon: icon(musicPath, '#ec4899'), disabled: true },
  ]},
];

const meta = {
  title: 'Components/Tree',
  component: Tree,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Tree>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default tree with colored icons. */
export const Default: Story = {
  args: { nodes, defaultExpandedKeys: ['docs'] },
};

/** All nodes expanded. */
export const AllExpanded: Story = {
  args: { nodes, defaultExpandedKeys: ['docs', 'photos', 'vacation', 'music'] },
};

/** Multiple selection mode. */
export const MultipleSelection: Story = {
  args: { nodes, multiple: true, defaultExpandedKeys: ['docs', 'photos'] },
};

/** Custom node template with file sizes and colored badges. */
export const CustomTemplate: Story = {
  args: {} as any,
  render: () => {
    const sizes: Record<string, string> = { resume: '245 KB', cover: '128 KB', notes: '12 KB', beach: '3.2 MB', mountain: '4.1 MB', profile: '512 KB', song1: '5.4 MB', song2: '4.8 MB' };
    const colors: Record<string, string> = { resume: '#fef2f2', cover: '#eff6ff', notes: '#f9fafb', beach: '#ecfdf5', mountain: '#ecfdf5', profile: '#f5f3ff', song1: '#fdf2f8', song2: '#fdf2f8' };
    return (
      <Tree
        nodes={nodes}
        defaultExpandedKeys={['docs', 'photos', 'vacation', 'music']}
        nodeTemplate={(node, { selected }) => (
          <span style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%' }}>
            <span style={{ flex: 1, fontWeight: selected ? 600 : 400 }}>{node.label}</span>
            {sizes[node.key] && (
              <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 8, background: colors[node.key] || '#f3f4f6', color: '#6b7280' }}>
                {sizes[node.key]}
              </span>
            )}
          </span>
        )}
      />
    );
  },
};

/** Controlled selection with external display. */
export const Controlled: Story = {
  args: {} as any,
  render: () => {
    const [selected, setSelected] = useState<string[]>([]);
    return (
      <div style={{ display: 'flex', gap: 24 }}>
        <Tree nodes={nodes} selectedKeys={selected} onSelect={setSelected} defaultExpandedKeys={['docs', 'photos']} />
        <div style={{ fontSize: 13, color: '#6b7280' }}>Selected: {selected.join(', ') || 'none'}</div>
      </div>
    );
  },
};

/** Tree inside a Dialog. */
export const InsideDialog: Story = {
  args: {} as any,
  render: () => {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);
    return (
      <div>
        <Button onClick={() => setOpen(true)}>Open Dialog</Button>
        <Dialog visible={open} onHide={() => setOpen(false)} header="File Browser" style={{ width: 420 }}>
          <Tree nodes={nodes} selectedKeys={selected} onSelect={setSelected} defaultExpandedKeys={['docs', 'photos', 'vacation']} />
          <div style={{ marginTop: 12, fontSize: 13, color: '#6b7280' }}>Selected: {selected.join(', ') || 'none'}</div>
        </Dialog>
      </div>
    );
  },
};
