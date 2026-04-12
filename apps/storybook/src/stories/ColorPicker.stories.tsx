import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ColorPicker } from '../../../../packages/react/src/components/ColorPicker';

const meta = {
  title: 'Components/ColorPicker',
  component: ColorPicker,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof ColorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default hex color picker. */
export const Default: Story = {
  args: { label: 'Brand color' },
};

/** With alpha channel slider and RGBA output. */
export const WithAlpha: Story = {
  args: { label: 'Background', showAlpha: true, format: 'rgba', defaultValue: 'rgba(59, 130, 246, 0.75)' },
};

/** Controlled with live preview. */
export const Controlled: Story = {
  args: {} as any,
  render: () => {
    const [color, setColor] = useState('#3b82f6');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'start' }}>
        <ColorPicker label="Theme color" value={color} onChange={setColor} />
        <div style={{ width: 200, height: 48, borderRadius: 8, background: color, border: '1px solid #e5e7eb' }} />
        <span style={{ fontSize: 13, color: '#6b7280', fontFamily: 'monospace' }}>{color}</span>
      </div>
    );
  },
};

/** RGB format output. */
export const RGBFormat: Story = {
  args: { label: 'Color (RGB)', format: 'rgb', defaultValue: '#ef4444' },
};

/** Custom preset palette. */
export const CustomPresets: Story = {
  args: {
    label: 'Grayscale',
    presets: ['#000000', '#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9', '#ffffff'],
  },
};

/** No presets — only the picker area. */
export const NoPresets: Story = {
  args: { label: 'Pick a color', presets: [] },
};

/** Validation states. */
export const Validation: Story = {
  args: {} as any,
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ColorPicker label="Required" required error="Please select a color" />
      <ColorPicker label="Success" defaultValue="#22c55e" success helperText="Color accepted" />
    </div>
  ),
};

/** Disabled state. */
export const Disabled: Story = {
  args: { label: 'Color', disabled: true, defaultValue: '#ef4444' },
};
