import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ItemPicker } from '../../../../packages/react/src/components/ItemPicker';
import type { ItemPickerItem } from '../../../../packages/react/src/components/ItemPicker';

const meta = {
  title: 'Components/ItemPicker',
  component: ItemPicker,
  parameters: { layout: 'centered', docs: { description: { component: 'Dual-panel list for moving and reordering items between source and target. Supports checkboxes, filtering, drag and drop (between and within panels), reorder, custom templates, FieldWrapper integration, and form compatibility.' } } },
  tags: ['autodocs'],
  decorators: [(Story: React.FC) => <div style={{ background: '#fff', padding: 24, borderRadius: 8, width: 700 }}><Story /></div>],
} satisfies Meta<typeof ItemPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleItems: ItemPickerItem[] = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'SolidJS', disabled: true },
  { value: 'preact', label: 'Preact' },
  { value: 'lit', label: 'Lit' },
  { value: 'qwik', label: 'Qwik', disabled: true },
];

export const Basic: Story = {
  name: 'Basic',
  args: {} as any,
  render: () => {
    const [val, setVal] = useState<string[]>(['react']);
    return <ItemPicker items={sampleItems} value={val} onChange={setVal} />;
  },
};

export const WithLabelAndHelper: Story = {
  name: 'Label & Helper Text',
  args: {} as any,
  render: () => {
    const [val, setVal] = useState<string[]>([]);
    return (
      <ItemPicker
        items={sampleItems}
        value={val}
        onChange={setVal}
        label="Tech Stack"
        helperText="Select the frameworks for your project"
        required
      />
    );
  },
};

export const WithError: Story = {
  name: 'Error State',
  args: {} as any,
  render: () => {
    const [val, setVal] = useState<string[]>([]);
    return (
      <ItemPicker
        items={sampleItems}
        value={val}
        onChange={setVal}
        label="Tech Stack"
        error={val.length === 0 ? 'You must select at least one framework' : undefined}
        helperText="Pick at least one"
        required
      />
    );
  },
};

export const WithSuccess: Story = {
  name: 'Success State',
  args: {} as any,
  render: () => {
    const [val, setVal] = useState<string[]>(['react', 'vue']);
    return (
      <ItemPicker
        items={sampleItems}
        value={val}
        onChange={setVal}
        label="Tech Stack"
        success
        helperText="Looks good!"
      />
    );
  },
};

export const Filterable: Story = {
  name: 'Filterable',
  args: {} as any,
  render: () => {
    const [val, setVal] = useState<string[]>([]);
    return <ItemPicker items={sampleItems} value={val} onChange={setVal} filterable />;
  },
};

export const DragAndDrop: Story = {
  name: 'Drag & Drop Between Panels',
  args: {} as any,
  render: () => {
    const [val, setVal] = useState<string[]>(['vue', 'qwik', 'svelte']);
    return (
      <div>
        <ItemPicker items={sampleItems} value={val} onChange={setVal} dragDrop reorderable="both" label="Drag & Drop" helperText="Drag between panels or reorder within. Qwik is disabled but participates in order." />
        <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8, fontFamily: 'monospace' }}>value: [{val.join(', ')}]</p>
      </div>
    );
  },
};

export const DragReorderWithin: Story = {
  name: 'Drag to Reorder Within Panels',
  args: {} as any,
  render: () => {
    const [val, setVal] = useState<string[]>(['react', 'vue', 'angular', 'svelte']);
    return (
      <ItemPicker
        items={sampleItems}
        value={val}
        onChange={setVal}
        dragDrop
        reorderable="both"
        label="Drag & Drop Reorder"
        helperText="Drag items within a panel to reorder, or between panels to move. Blue line shows drop position."
      />
    );
  },
};

export const ReorderTarget: Story = {
  name: 'Reorder Target (Buttons)',
  args: {} as any,
  render: () => {
    const [val, setVal] = useState<string[]>(['react', 'vue', 'angular', 'svelte']);
    return (
      <ItemPicker
        items={sampleItems}
        value={val}
        onChange={setVal}
        reorderable="target"
        label="Reorder Target"
        helperText="Select items in the target panel and use the arrows to reorder"
      />
    );
  },
};

export const ReorderBoth: Story = {
  name: 'Reorder Both Panels',
  args: {} as any,
  render: () => {
    const [val, setVal] = useState<string[]>(['react', 'vue']);
    return (
      <ItemPicker
        items={sampleItems}
        value={val}
        onChange={setVal}
        reorderable="both"
        filterable
        label="Reorder Both"
        helperText="Both panels have reorder arrows. Source order is maintained locally."
      />
    );
  },
};

export const CustomHeaders: Story = {
  name: 'Custom Headers',
  args: {} as any,
  render: () => {
    const [val, setVal] = useState<string[]>([]);
    return <ItemPicker items={sampleItems} value={val} onChange={setVal} sourceHeader="Frameworks" targetHeader="My Stack" filterable />;
  },
};

export const HeaderTemplates: Story = {
  name: 'Header Templates (JSX)',
  args: {} as any,
  render: () => {
    const [val, setVal] = useState<string[]>([]);
    return (
      <ItemPicker
        items={sampleItems}
        value={val}
        onChange={setVal}
        sourceHeader={
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
            Available Frameworks
          </span>
        }
        targetHeader={
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
            Selected Stack
          </span>
        }
        filterable
      />
    );
  },
};

export const CustomTemplate: Story = {
  name: 'Custom Item Template',
  args: {} as any,
  render: () => {
    const [val, setVal] = useState<string[]>([]);
    const items: ItemPickerItem[] = sampleItems.map((i) => ({
      ...i,
      icon: (
        <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#deeff7', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
          {i.label[0]}
        </span>
      ),
    }));
    return <ItemPicker items={items} value={val} onChange={setVal} filterable dragDrop />;
  },
};

export const Disabled: Story = {
  name: 'Disabled',
  args: {} as any,
  render: () => {
    const [val, setVal] = useState<string[]>(['react']);
    return <ItemPicker items={sampleItems} value={val} onChange={setVal} disabled label="Disabled Picker" />;
  },
};
