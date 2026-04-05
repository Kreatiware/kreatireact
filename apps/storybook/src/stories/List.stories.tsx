import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { List } from '../../../../packages/react/src/components/List';
import type { ListItem } from '../../../../packages/react/src/components/List';

const meta = {
  title: 'Components/List',
  component: List,
  parameters: { layout: 'centered', docs: { description: { component: 'Keyboard-navigable list with ARIA listbox pattern. Supports groups, filter, commands, icons, and custom templates.' } } },
  tags: ['autodocs'],
  decorators: [(Story: React.FC) => <div style={{ background: '#fff', padding: 24, borderRadius: 8, width: 300 }}><Story /></div>],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
} satisfies Meta<typeof List>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicItems: ListItem[] = [
  { key: 'copy', label: 'Copy', command: 'Ctrl+C' },
  { key: 'cut', label: 'Cut', command: 'Ctrl+X' },
  { key: 'paste', label: 'Paste', command: 'Ctrl+V' },
  { key: 'delete', label: 'Delete', disabled: true },
  { key: 'select-all', label: 'Select all', command: 'Ctrl+A' },
];

export const Basic: Story = {
  name: 'Basic',
  render: () => {
    const Demo = () => {
      const [selected, setSelected] = useState<string | null>(null);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <List items={basicItems} value={selected} onSelect={(key) => setSelected(key)} />
          <span style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>Selected: {selected ?? '(none)'}</span>
        </div>
      );
    };
    return <Demo />;
  },
};

const groupedItems: ListItem[] = [
  { key: 'undo', label: 'Undo', command: 'Ctrl+Z', group: 'Edit' },
  { key: 'redo', label: 'Redo', command: 'Ctrl+Y', group: 'Edit' },
  { key: 'copy', label: 'Copy', command: 'Ctrl+C', group: 'Clipboard' },
  { key: 'paste', label: 'Paste', command: 'Ctrl+V', group: 'Clipboard' },
  { key: 'zoom-in', label: 'Zoom in', command: 'Ctrl++', group: 'View' },
  { key: 'zoom-out', label: 'Zoom out', command: 'Ctrl+-', group: 'View' },
  { key: 'fullscreen', label: 'Fullscreen', command: 'F11', group: 'View' },
];

export const Grouped: Story = {
  name: 'Grouped',
  render: () => {
    const Demo = () => {
      const [selected, setSelected] = useState<string | null>(null);
      return <List items={groupedItems} value={selected} onSelect={(key) => setSelected(key)} />;
    };
    return <Demo />;
  },
};

export const GroupTemplate: Story = {
  name: 'Group template',
  render: () => {
    const Demo = () => {
      const [selected, setSelected] = useState<string | null>(null);
      return (
        <List
          items={groupedItems}
          value={selected}
          onSelect={(key) => setSelected(key)}
          groupTemplate={(group) => (
            <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 3, height: 14, borderRadius: 2, backgroundColor: '#0f78a5' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#0f78a5' }}>{group}</span>
            </div>
          )}
        />
      );
    };
    return <Demo />;
  },
};

export const MultiSelect: Story = {
  name: 'Multiple selection',
  render: () => {
    const Demo = () => {
      const [selected, setSelected] = useState<string[]>([]);
      const toggle = (key: string) => {
        setSelected((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
      };
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <List items={basicItems} value={selected} onSelect={toggle} multiple />
          <span style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>{selected.length ? selected.join(', ') : '(none)'}</span>
        </div>
      );
    };
    return <Demo />;
  },
};

export const Filterable: Story = {
  name: 'Filterable',
  render: () => {
    const Demo = () => {
      const [selected, setSelected] = useState<string | null>(null);
      const items: ListItem[] = [
        { key: 'ar', label: 'Argentina', searchKey: 'argentina ar south america' },
        { key: 'br', label: 'Brazil', searchKey: 'brazil br south america' },
        { key: 'cl', label: 'Chile', searchKey: 'chile cl south america' },
        { key: 'co', label: 'Colombia', searchKey: 'colombia co south america' },
        { key: 'mx', label: 'Mexico', searchKey: 'mexico mx north america' },
        { key: 'pe', label: 'Peru', searchKey: 'peru pe south america' },
        { key: 'uy', label: 'Uruguay', searchKey: 'uruguay uy south america' },
      ];
      return <List items={items} value={selected} onSelect={(key) => setSelected(key)} filterable maxHeight={200} />;
    };
    return <Demo />;
  },
};

export const Sizes: Story = {
  name: 'All sizes',
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <div key={s} style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 200 }}>
          <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>{s.toUpperCase()}</span>
          <List items={basicItems.slice(0, 3)} size={s} onSelect={() => {}} />
        </div>
      ))}
    </div>
  ),
};

export const CustomTemplate: Story = {
  name: 'Custom template',
  render: () => {
    const Demo = () => {
      const [selected, setSelected] = useState<string | null>(null);
      const items: ListItem[] = [
        {
          key: 'online', label: 'Online',
          template: (item, { selected: sel }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span style={{ fontWeight: sel ? 700 : 400 }}>{item.label}</span>
            </div>
          ),
        },
        {
          key: 'away', label: 'Away',
          template: (item, { selected: sel }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              <span style={{ fontWeight: sel ? 700 : 400 }}>{item.label}</span>
            </div>
          ),
        },
        {
          key: 'offline', label: 'Offline',
          template: (item, { selected: sel }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <span style={{ fontWeight: sel ? 700 : 400 }}>{item.label}</span>
            </div>
          ),
        },
      ];
      return <List items={items} value={selected} onSelect={(key) => setSelected(key)} />;
    };
    return <Demo />;
  },
};
