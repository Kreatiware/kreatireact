import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Dial } from '../../../../packages/react/src/components/Dial';
import { Button } from '../../../../packages/react/src/components/Button';

const meta = {
  title: 'Components/Dial',
  component: Dial,
  parameters: { layout: 'centered', docs: { description: { component: 'Circular input for numeric value selection. Supports drag interaction, keyboard navigation, custom track/thumb/value templates, min/max labels, and form compatibility.' } } },
  tags: ['autodocs'],
  decorators: [(Story: React.FC) => <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}><Story /></div>],
} satisfies Meta<typeof Dial>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  name: 'Basic',
  render: () => {
    const [val, setVal] = useState(50);
    return <Dial value={val} onChange={setVal} />;
  },
};

export const WithLabelAndHelper: Story = {
  name: 'Label & Helper',
  render: () => {
    const [val, setVal] = useState(30);
    return <Dial value={val} onChange={setVal} label="Volume" helperText="Drag or use arrow keys" />;
  },
};

export const MinMaxLabels: Story = {
  name: 'Min / Max Labels',
  render: () => {
    const [val, setVal] = useState(40);
    return <Dial value={val} onChange={setVal} min={0} max={100} showMinMax label="With Min/Max" size="lg" />;
  },
};

export const CustomRange: Story = {
  name: 'Custom Range (20-50)',
  render: () => {
    const [val, setVal] = useState(35);
    return <Dial value={val} onChange={setVal} min={20} max={50} showMinMax label="Range 20-50" size="lg" />;
  },
};

export const NegativeRange: Story = {
  name: 'Negative Values (-50 to 50)',
  render: () => {
    const [val, setVal] = useState(0);
    const color = val < 0 ? 'var(--kreati-severity-danger)' : val > 0 ? 'var(--kreati-severity-success)' : 'var(--kreati-gray-400)';
    return (
      <Dial
        value={val}
        onChange={setVal}
        min={-50}
        max={50}
        showMinMax
        scrollable
        label="Temperature"
        size="xl"
        valueColor={color}
        thumbTemplate={({ x, y }) => (
          <circle cx={x} cy={y} r={6} fill={color} stroke="var(--kreati-white)" strokeWidth={2} />
        )}
        valueTemplate={(v) => (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: 24, fontWeight: 700, color }}>{v > 0 ? '+' : ''}{v}</span>
            <span style={{ fontSize: 9, color: 'var(--kreati-gray-400)' }}>{v < 0 ? 'Below zero' : v > 0 ? 'Above zero' : 'Zero'}</span>
          </div>
        )}
      />
    );
  },
};

export const Scrollable: Story = {
  name: 'Scrollable (Mouse Wheel)',
  render: () => {
    const [val, setVal] = useState(50);
    return <Dial value={val} onChange={setVal} scrollable label="Scroll to change" helperText="Hover and use mouse wheel" size="lg" showMinMax />;
  },
};

export const FullTemplateDemo: Story = {
  name: 'Full Template (Track + Thumb + Center)',
  render: () => {
    const [val, setVal] = useState(45);
    return (
      <Dial
        value={val}
        onChange={setVal}
        min={0}
        max={100}
        size="xl"
        strokeWidth={12}
        scrollable
        showMinMax
        label="Mood Dial"
        helperText="Drag, scroll, or use arrow keys"
        trackTemplate={({ rangePath, valuePath, strokeWidth: sw }) => (
          <>
            <defs>
              <linearGradient id="mood-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="33%" stopColor="#10b981" />
                <stop offset="66%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            <path d={rangePath} fill="none" stroke="var(--kreati-gray-100)" strokeWidth={sw} strokeLinecap="round" />
            {valuePath && <path d={valuePath} fill="none" stroke="url(#mood-grad)" strokeWidth={sw} strokeLinecap="round" />}
          </>
        )}
        thumbTemplate={({ x, y }) => (
          <circle cx={x} cy={y} r={10} fill="var(--kreati-white)" stroke="var(--kreati-gray-300)" strokeWidth={1.5} />
        )}
        valueTemplate={(v) => {
          const face = v < 25 ? '\u{1F976}' : v < 50 ? '\u{1F60A}' : v < 75 ? '\u{1F60E}' : '\u{1F525}';
          return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: 32 }}>{face}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--kreati-gray-700)' }}>{v}%</span>
            </div>
          );
        }}
      />
    );
  },
};

export const StrokeWidths: Story = {
  name: 'Stroke Width Variations',
  render: () => {
    const [vals, setVals] = useState([60, 60, 60]);
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24 }}>
        <Dial value={vals[0]} onChange={(v) => setVals((p) => [v, p[1], p[2]])} strokeWidth={4} label="Thin (4)" />
        <Dial value={vals[1]} onChange={(v) => setVals((p) => [p[0], v, p[2]])} strokeWidth={10} label="Default (10)" />
        <Dial value={vals[2]} onChange={(v) => setVals((p) => [p[0], p[1], v])} strokeWidth={18} label="Thick (18)" />
      </div>
    );
  },
};

export const JSXValueTemplate: Story = {
  name: 'JSX Value Template',
  render: () => {
    const [val, setVal] = useState(72);
    return (
      <Dial
        value={val}
        onChange={setVal}
        size="lg"
        label="Completion"
        valueTemplate={(v) => (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--kreati-severity-primary)' }}>{v}%</span>
            <span style={{ fontSize: 10, color: 'var(--kreati-gray-400)' }}>complete</span>
          </div>
        )}
      />
    );
  },
};

export const CustomThumb: Story = {
  name: 'Custom Thumb',
  render: () => {
    const [val, setVal] = useState(65);
    return (
      <Dial
        value={val}
        onChange={setVal}
        size="lg"
        label="With Thumb"
        thumbTemplate={({ x, y }) => (
          <circle cx={x} cy={y} r={6} fill="var(--kreati-severity-primary)" stroke="var(--kreati-white)" strokeWidth={2} />
        )}
      />
    );
  },
};

export const GradientTrack: Story = {
  name: 'Gradient Track',
  render: () => {
    const [val, setVal] = useState(70);
    return (
      <Dial
        value={val}
        onChange={setVal}
        size="lg"
        label="Gradient Track"
        trackTemplate={({ rangePath, valuePath, strokeWidth: sw }) => (
          <>
            <defs>
              <linearGradient id="dial-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--kreati-severity-info)" />
                <stop offset="100%" stopColor="var(--kreati-severity-success)" />
              </linearGradient>
            </defs>
            <path d={rangePath} fill="none" stroke="var(--kreati-gray-200)" strokeWidth={sw} strokeLinecap="round" />
            {valuePath && <path d={valuePath} fill="none" stroke="url(#dial-grad)" strokeWidth={sw} strokeLinecap="round" />}
          </>
        )}
      />
    );
  },
};

export const ScrollbarStyleGradient: Story = {
  name: 'Scrollbar-Style Gradient',
  render: () => {
    const [val, setVal] = useState(60);
    return (
      <Dial
        value={val}
        onChange={setVal}
        size="xl"
        strokeWidth={14}
        label="Scrollbar Style"
        trackTemplate={({ rangePath, valuePath, strokeWidth: sw }) => (
          <>
            <defs>
              <linearGradient id="dial-scroll-range" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--kreati-gray-100)" />
                <stop offset="100%" stopColor="var(--kreati-gray-200)" />
              </linearGradient>
              <linearGradient id="dial-scroll-value" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--kreati-primary-300)" />
                <stop offset="50%" stopColor="var(--kreati-primary-500)" />
                <stop offset="100%" stopColor="var(--kreati-primary-700)" />
              </linearGradient>
            </defs>
            <path d={rangePath} fill="none" stroke="url(#dial-scroll-range)" strokeWidth={sw} strokeLinecap="round" />
            {valuePath && <path d={valuePath} fill="none" stroke="url(#dial-scroll-value)" strokeWidth={sw} strokeLinecap="round" />}
          </>
        )}
        thumbTemplate={({ x, y }) => (
          <>
            <circle cx={x} cy={y} r={9} fill="var(--kreati-white)" stroke="var(--kreati-primary-500)" strokeWidth={2} />
            <circle cx={x} cy={y} r={4} fill="var(--kreati-primary-500)" />
          </>
        )}
        valueTemplate={(v) => (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--kreati-primary-500)' }}>{v}</span>
            <span style={{ fontSize: 9, color: 'var(--kreati-gray-400)', letterSpacing: 1, textTransform: 'uppercase' }}>level</span>
          </div>
        )}
      />
    );
  },
};

export const FullCustom: Story = {
  name: 'Thumb + Gradient + Dynamic Color',
  render: () => {
    const [val, setVal] = useState(55);
    const color = val < 30 ? 'var(--kreati-severity-danger)' : val < 70 ? 'var(--kreati-severity-warning)' : 'var(--kreati-severity-success)';
    return (
      <Dial
        value={val}
        onChange={setVal}
        size="xl"
        label="Full Custom"
        valueColor={color}
        showMinMax
        thumbTemplate={({ x, y }) => (
          <circle cx={x} cy={y} r={7} fill={color} stroke="var(--kreati-white)" strokeWidth={2} />
        )}
        valueTemplate={(v) => (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: 28, fontWeight: 700, color }}>{v}</span>
            <span style={{ fontSize: 10, color: 'var(--kreati-gray-400)' }}>{v < 30 ? 'Low' : v < 70 ? 'Medium' : 'High'}</span>
          </div>
        )}
      />
    );
  },
};

export const StepAndRange: Story = {
  name: 'Step & Custom Range',
  render: () => {
    const [val, setVal] = useState(20);
    return <Dial value={val} onChange={setVal} min={0} max={200} step={10} showMinMax label="0-200, step 10" size="lg" />;
  },
};

export const CustomColors: Story = {
  name: 'Custom Colors',
  render: () => {
    const [val, setVal] = useState(60);
    return (
      <Dial
        value={val}
        onChange={setVal}
        valueColor="var(--kreati-severity-warning)"
        rangeColor="var(--kreati-severity-warning-light)"
        label="Custom Colors"
      />
    );
  },
};

export const Sizes: Story = {
  name: 'All Sizes',
  render: () => {
    const [vals, setVals] = useState([25, 40, 55, 70, 85]);
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s, i) => (
          <Dial key={s} value={vals[i]} onChange={(v) => setVals((p) => { const n = [...p]; n[i] = v; return n; })} size={s} label={s.toUpperCase()} />
        ))}
      </div>
    );
  },
};

export const ResponsiveWithButtons: Story = {
  name: 'Responsive with Buttons',
  render: () => {
    const [val, setVal] = useState(50);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, maxWidth: 200 }}>
        <Dial value={val} onChange={setVal} size="lg" label="Volume" showMinMax valueTemplate={(v) => <span style={{ fontSize: 20, fontWeight: 700 }}>{v}%</span>} />
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="sm" severity="secondary" buttonType="outlined" onClick={() => setVal((v) => Math.max(0, v - 5))}>-5</Button>
          <Button size="sm" severity="primary" onClick={() => setVal(50)}>Reset</Button>
          <Button size="sm" severity="secondary" buttonType="outlined" onClick={() => setVal((v) => Math.min(100, v + 5))}>+5</Button>
        </div>
      </div>
    );
  },
};

export const ResponsiveContainer: Story = {
  name: 'Responsive — Adapts to Container',
  render: () => {
    const [val, setVal] = useState(65);
    const [containerWidth, setContainerWidth] = useState(200);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
        <div style={{ width: containerWidth, border: '1px dashed var(--kreati-gray-300)', padding: 12, borderRadius: 8, display: 'flex', justifyContent: 'center' }}>
          <Dial value={val} onChange={setVal} width="100%" label="Resize me" showMinMax />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="xs" severity="secondary" buttonType="outlined" onClick={() => setContainerWidth(80)}>80px</Button>
          <Button size="xs" severity="secondary" buttonType="outlined" onClick={() => setContainerWidth(150)}>150px</Button>
          <Button size="xs" severity="secondary" buttonType="outlined" onClick={() => setContainerWidth(250)}>250px</Button>
        </div>
      </div>
    );
  },
};

export const WithError: Story = {
  name: 'Error State',
  render: () => {
    const [val, setVal] = useState(0);
    return <Dial value={val} onChange={setVal} label="Temperature" error={val === 0 ? 'Value cannot be zero' : undefined} required />;
  },
};

export const WithSuccess: Story = {
  name: 'Success State',
  render: () => {
    const [val, setVal] = useState(75);
    return <Dial value={val} onChange={setVal} label="Progress" success helperText="On track" />;
  },
};

export const ReadOnly: Story = {
  name: 'Read Only',
  render: () => <Dial value={65} readOnly label="Read Only" />,
};

export const Disabled: Story = {
  name: 'Disabled',
  render: () => <Dial value={40} disabled label="Disabled" />,
};

export const HiddenValue: Story = {
  name: 'Hidden Value',
  render: () => {
    const [val, setVal] = useState(50);
    return <Dial value={val} onChange={setVal} showValue={false} label="No center text" />;
  },
};
