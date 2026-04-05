import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from '../../../../packages/react/src/components/Slider';

const meta = {
  title: 'Components/Slider',
  component: Slider,
  parameters: { layout: 'padded', docs: { description: { component: 'Numeric slider with single/range mode, horizontal/vertical orientation, marks, tooltips, custom templates, and full keyboard navigation.' } } },
  tags: ['autodocs'],
  decorators: [(Story: React.FC) => <div style={{ background: '#fff', padding: 32, borderRadius: 8 }}><Story /></div>],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    showTooltip: { control: 'select', options: ['always', 'hover', 'never'] },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  name: 'Basic',
  render: () => {
    const Demo = () => {
      const [val, setVal] = useState(40);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Slider label="Volume" value={val} onChange={(v) => setVal(v as number)} showTooltip="hover" />
          <span style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>{val}</span>
        </div>
      );
    };
    return <Demo />;
  },
};

export const Sizes: Story = {
  name: 'All sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <Slider key={s} label={s.toUpperCase()} size={s} defaultValue={50} showTooltip="hover" />
      ))}
    </div>
  ),
};

export const Range: Story = {
  name: 'Range mode',
  render: () => {
    const Demo = () => {
      const [val, setVal] = useState<[number, number]>([20, 80]);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Slider label="Price range" range value={val} onChange={(v) => setVal(v as [number, number])} showTooltip="always" tooltipFormat={(v) => `$${v}`} />
          <span style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>${val[0]} - ${val[1]}</span>
        </div>
      );
    };
    return <Demo />;
  },
};

export const WithMarks: Story = {
  name: 'With marks',
  render: () => {
    const Demo = () => {
      const [val, setVal] = useState(50);
      return (
        <Slider
          label="Temperature"
          value={val}
          onChange={(v) => setVal(v as number)}
          min={0}
          max={100}
          step={10}
          showTooltip="hover"
          tooltipFormat={(v) => `${v}\u00B0C`}
          marks={[
            { value: 0, label: '0\u00B0' },
            { value: 25, label: '25\u00B0' },
            { value: 50, label: '50\u00B0' },
            { value: 75, label: '75\u00B0' },
            { value: 100, label: '100\u00B0' },
          ]}
        />
      );
    };
    return <Demo />;
  },
};

export const Vertical: Story = {
  name: 'Vertical',
  render: () => {
    const Demo = () => {
      const [single, setSingle] = useState(60);
      const [rangeVal, setRangeVal] = useState<[number, number]>([30, 70]);
      return (
        <div style={{ display: 'flex', gap: 48, height: 250 }}>
          <Slider
            orientation="vertical"
            value={single}
            onChange={(v) => setSingle(v as number)}
            showTooltip="hover"
            marks={[{ value: 0, label: '0' }, { value: 50, label: '50' }, { value: 100, label: '100' }]}
          />
          <Slider
            orientation="vertical"
            range
            value={rangeVal}
            onChange={(v) => setRangeVal(v as [number, number])}
            showTooltip="always"
          />
        </div>
      );
    };
    return <Demo />;
  },
};

export const States: Story = {
  name: 'States',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Slider label="Default" defaultValue={50} />
      <Slider label="Error" defaultValue={30} error="Value too low" />
      <Slider label="Success" defaultValue={80} success helperText="Good range" />
      <Slider label="Disabled" defaultValue={50} disabled />
    </div>
  ),
};

export const Steps: Story = {
  name: 'Custom step',
  render: () => {
    const Demo = () => {
      const [val, setVal] = useState(50);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Slider label="Step 25" value={val} onChange={(v) => setVal(v as number)} step={25} showTooltip="always" marks={[{ value: 0, label: '0' }, { value: 25, label: '25' }, { value: 50, label: '50' }, { value: 75, label: '75' }, { value: 100, label: '100' }]} />
          <span style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>{val}</span>
        </div>
      );
    };
    return <Demo />;
  },
};

export const CustomTemplates: Story = {
  name: 'Custom templates',
  render: () => {
    const Demo = () => {
      const [val, setVal] = useState(60);
      return (
        <div style={{ width: '100%' }}>
          <Slider
            label="Rating"
            value={val}
            onChange={(v) => setVal(v as number)}
            min={0}
            max={100}
            step={20}
            showTooltip="never"
            thumbTemplate={(v) => (
              <span style={{ fontSize: 20, lineHeight: 1, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                {v >= 80 ? '⭐' : v >= 40 ? '👍' : '👎'}
              </span>
            )}
            markTemplate={(mark, active) => (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: active ? '#0f78a5' : '#d1d5db' }} />
                {mark.label && <span style={{ fontSize: 12, color: active ? '#0f78a5' : '#9ca3af' }}>{mark.label}</span>}
              </div>
            )}
            marks={[{ value: 0, label: 'Bad' }, { value: 20, label: 'Poor' }, { value: 40, label: 'OK' }, { value: 60, label: 'Good' }, { value: 80, label: 'Great' }, { value: 100, label: 'Best' }]}
          />
        </div>
      );
    };
    return <Demo />;
  },
};
