import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from '../../../../packages/react/src/components/Checkbox';
import { Radio } from '../../../../packages/react/src/components/Radio';

const meta = {
  title: 'Components/Radio & Checkbox Comparison',
  parameters: { layout: 'centered' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const SideBySide: Story = {
  name: 'Side by Side — All Sizes',
  render: () => (
    <div style={{ display: 'flex', gap: 48 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <strong style={{ fontSize: 12, color: '#6b7280' }}>Checkbox</strong>
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
          <Checkbox key={s} label={`Size ${s}`} size={s} defaultChecked />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <strong style={{ fontSize: 12, color: '#6b7280' }}>Radio</strong>
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
          <Radio key={s} label={`Size ${s}`} size={s} defaultChecked name={`radio-${s}`} />
        ))}
      </div>
    </div>
  ),
};

export const Unchecked: Story = {
  name: 'Unchecked — All Sizes',
  render: () => (
    <div style={{ display: 'flex', gap: 48 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <strong style={{ fontSize: 12, color: '#6b7280' }}>Checkbox</strong>
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
          <Checkbox key={s} label={`Size ${s}`} size={s} />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <strong style={{ fontSize: 12, color: '#6b7280' }}>Radio</strong>
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
          <Radio key={s} label={`Size ${s}`} size={s} name={`radio-unc-${s}`} />
        ))}
      </div>
    </div>
  ),
};

export const States: Story = {
  name: 'States Comparison',
  render: () => (
    <div style={{ display: 'flex', gap: 48 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <strong style={{ fontSize: 12, color: '#6b7280' }}>Checkbox</strong>
        <Checkbox label="Default" size="md" defaultChecked />
        <Checkbox label="Error" size="md" defaultChecked error="Error" />
        <Checkbox label="Success" size="md" defaultChecked success />
        <Checkbox label="Disabled" size="md" defaultChecked disabled />
        <Checkbox label="Indeterminate" size="md" indeterminate />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <strong style={{ fontSize: 12, color: '#6b7280' }}>Radio</strong>
        <Radio label="Default" size="md" defaultChecked name="state-1" />
        <Radio label="Error" size="md" defaultChecked error="Error" name="state-2" />
        <Radio label="Success" size="md" defaultChecked success name="state-3" />
        <Radio label="Disabled" size="md" defaultChecked disabled name="state-4" />
        <Radio label="Unchecked" size="md" name="state-5" />
      </div>
    </div>
  ),
};
