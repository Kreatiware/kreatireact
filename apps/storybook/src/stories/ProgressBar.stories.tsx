import React, { useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ProgressBar } from '../../../../packages/react/src/components/ProgressBar';

const meta = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [(Story: React.FC) => <div style={{ background: '#fff', padding: 24, borderRadius: 8, width: 400 }}><Story /></div>],
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  name: 'Basic',
  render: () => <ProgressBar value={60} />,
};

export const LabelOutside: Story = {
  name: 'Label Outside (default)',
  render: () => <ProgressBar value={45} showValue />,
};

export const LabelInside: Story = {
  name: 'Label Inside',
  render: () => <ProgressBar value={72} showValue labelPosition="inside" />,
};

export const CustomTemplate: Story = {
  name: 'Custom Value Template',
  render: () => <ProgressBar value={75} showValue valueTemplate={(v) => <span>{v} of 100</span>} />,
};

export const Severities: Story = {
  name: 'All Severities',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {(['primary', 'secondary', 'success', 'info', 'warning', 'help', 'danger'] as const).map((s) => (
        <ProgressBar key={s} value={60} severity={s} showValue />
      ))}
    </div>
  ),
};

export const Indeterminate: Story = {
  name: 'Indeterminate',
  render: () => <ProgressBar />,
};

export const CustomHeights: Story = {
  name: 'Custom Heights',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <ProgressBar value={50} height={4} showValue />
      <ProgressBar value={50} height={8} showValue />
      <ProgressBar value={50} height={14} showValue />
      <ProgressBar value={50} showValue labelPosition="inside" />
    </div>
  ),
};

export const Animated: Story = {
  name: 'Animated Progress',
  render: () => {
    const [val, setVal] = useState(0);
    useEffect(() => {
      const t = setInterval(() => setVal((v) => v >= 100 ? 0 : v + 2), 100);
      return () => clearInterval(t);
    }, []);
    return <ProgressBar value={val} severity={val < 50 ? 'info' : val < 80 ? 'warning' : 'success'} showValue labelPosition="inside" />;
  },
};

export const FillTemplate: Story = {
  name: 'Custom Fill Template',
  render: () => (
    <ProgressBar
      value={65}
      height={24}
      showValue
      labelPosition="inside"
      fillTemplate={({ value: v }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 6, fontSize: 11, color: '#fff' }}>
          {'\u{1F525}'} {v}% complete
        </div>
      )}
    />
  ),
};
