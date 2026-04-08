import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ToggleButton } from '../../../../packages/react/src/components/ToggleButton';
import { ToggleButtonGroup } from '../../../../packages/react/src/components/ToggleButtonGroup';
import { Check, Times, Search } from '../../../../packages/icons/src';

const meta = {
  title: 'Components/ToggleButton',
  component: ToggleButton,
  parameters: { layout: 'centered', docs: { description: { component: 'Toggle button with on/off states. Can be grouped with ToggleButtonGroup for single or multiple selection with connected borders.' } } },
  tags: ['autodocs'],
  argTypes: { size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] } },
  decorators: [(Story: React.FC) => <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}><Story /></div>],
} satisfies Meta<typeof ToggleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const Demo = () => {
      const [on, setOn] = useState(false);
      return <ToggleButton label={on ? 'On' : 'Off'} active={on} onClick={() => setOn(!on)} />;
    };
    return <Demo />;
  },
};

export const WithIcons: Story = {
  name: 'With icons',
  render: () => {
    const Demo = () => {
      const [bold, setBold] = useState(false);
      return (
        <div style={{ display: 'flex', gap: 8 }}>
          <ToggleButton label="Bold" iconLeft={<span style={{ fontWeight: 700 }}>B</span>} active={bold} onClick={() => setBold(!bold)} />
          <ToggleButton iconLeft={<Check size={14} />} active onClick={() => {}} />
          <ToggleButton iconLeft={<Search size={14} />} onClick={() => {}} />
        </div>
      );
    };
    return <Demo />;
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <ToggleButton key={s} label={s.toUpperCase()} size={s} active />
      ))}
    </div>
  ),
};

export const GroupSingle: Story = {
  name: 'Group (single selection)',
  render: () => {
    const Demo = () => {
      const [val, setVal] = useState<string | number>('center');
      return (
        <ToggleButtonGroup
          options={[
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
          ]}
          value={val}
          onChange={(v) => setVal(v as string)}
          size="md"
        />
      );
    };
    return <Demo />;
  },
};

export const GroupMultiple: Story = {
  name: 'Group (multiple selection)',
  render: () => {
    const Demo = () => {
      const [val, setVal] = useState<Array<string | number>>(['bold']);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ToggleButtonGroup
            options={[
              { value: 'bold', label: 'B' },
              { value: 'italic', label: 'I' },
              { value: 'underline', label: 'U' },
              { value: 'strike', label: 'S' },
            ]}
            value={val}
            onChange={(v) => setVal(v as Array<string | number>)}
            multiple
            size="sm"
          />
          <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>
            {JSON.stringify(val)}
          </span>
        </div>
      );
    };
    return <Demo />;
  },
};

export const GroupVertical: Story = {
  name: 'Group (vertical)',
  render: () => {
    const Demo = () => {
      const [val, setVal] = useState<string | number>('list');
      return (
        <ToggleButtonGroup
          options={[
            { value: 'grid', label: 'Grid' },
            { value: 'list', label: 'List' },
            { value: 'table', label: 'Table' },
          ]}
          value={val}
          onChange={(v) => setVal(v as string)}
          orientation="vertical"
          size="sm"
        />
      );
    };
    return <Demo />;
  },
};

export const GroupWithIcons: Story = {
  name: 'Group with icons',
  render: () => {
    const Demo = () => {
      const [val, setVal] = useState<string | number>('check');
      return (
        <ToggleButtonGroup
          options={[
            { value: 'check', iconLeft: <Check size={14} /> },
            { value: 'times', iconLeft: <Times size={14} /> },
            { value: 'search', iconLeft: <Search size={14} /> },
          ]}
          value={val}
          onChange={(v) => setVal(v as string)}
          size="md"
        />
      );
    };
    return <Demo />;
  },
};

export const GroupSizes: Story = {
  name: 'Group sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <ToggleButtonGroup
          key={s}
          options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }, { value: 'c', label: 'C' }]}
          value="b"
          size={s}
        />
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <ToggleButton label="Disabled off" disabled />
      <ToggleButton label="Disabled on" active disabled />
      <ToggleButtonGroup
        options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B', disabled: true }, { value: 'c', label: 'C' }]}
        value="a"
        size="md"
      />
    </div>
  ),
};

export const Raised: Story = {
  name: 'Raised',
  render: () => (
    <div style={{ display: 'flex', gap: 16, padding: 16 }}>
      <ToggleButton label="Normal" active />
      <ToggleButton label="Raised" active raised />
      <ToggleButton label="Raised off" raised />
    </div>
  ),
};
