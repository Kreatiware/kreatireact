import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { InputMask } from '../../../../packages/react/src/components/InputMask';

const meta = {
  title: 'Components/InputMask',
  component: InputMask,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Masked input that wraps the base Input. Mask characters: `9` = digit, `a` = letter, `*` = alphanumeric. All other characters are literals inserted automatically. Shows a placeholder with the mask pattern by default.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    variant: { control: 'select', options: ['floating', 'stacked'] },
    mask: { control: 'text' },
  },
} satisfies Meta<typeof InputMask>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    mask: '+99 999 9999 99',
    label: 'Phone',
    size: 'md',
  },
};

export const Masks: Story = {
  name: 'Common masks',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 320, paddingTop: 12 }}>
      <InputMask mask="+99 999 9999 99" label="Phone" size="md" helperText="Mask: +99 999 9999 99" />
      <InputMask mask="9999 9999 9999 9999" label="Credit card" size="md" helperText="Mask: 9999 9999 9999 9999" />
      <InputMask mask="99/99/9999" label="Date" size="md" helperText="Mask: 99/99/9999" />
      <InputMask mask="999.999.999-99" label="CPF (Brazil)" size="md" helperText="Mask: 999.999.999-99" />
      <InputMask mask="aaa-9999" label="License plate" size="md" helperText="Mask: aaa-9999" />
      <InputMask mask="**-****-**" label="Mixed" size="md" helperText="Mask: **-****-** (alphanumeric)" />
    </div>
  ),
};

export const Controlled: Story = {
  name: 'Controlled mode',
  render: () => {
    const ControlledDemo = () => {
      const [raw, setRaw] = useState('');
      const [formatted, setFormatted] = useState('');

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 320, paddingTop: 12 }}>
          <InputMask
            mask="+99 999 9999 99"
            label="Phone (controlled)"
            size="md"
            value={raw}
            onChange={(r, f) => { setRaw(r); setFormatted(f); }}
          />
          <div style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>
            <div>Raw: {raw || '(empty)'}</div>
            <div>Formatted: {formatted || '(empty)'}</div>
          </div>
        </div>
      );
    };
    return <ControlledDemo />;
  },
};

export const CustomPlaceholder: Story = {
  name: 'Custom placeholder char',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 320, paddingTop: 12 }}>
      <InputMask mask="99/99/9999" label="Underscore (default)" size="md" placeholderChar="_" />
      <InputMask mask="99/99/9999" label="Dot placeholder" size="md" placeholderChar="." />
      <InputMask mask="99/99/9999" label="No mask placeholder" size="md" showMaskPlaceholder={false} placeholder="Enter date" />
    </div>
  ),
};

export const WithStates: Story = {
  name: 'States',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 320, paddingTop: 12 }}>
      <InputMask mask="+99 999 9999 99" label="Default" size="md" />
      <InputMask mask="+99 999 9999 99" label="With error" size="md" error="Invalid phone number" />
      <InputMask mask="+99 999 9999 99" label="Success" size="md" success defaultValue="12345678901" />
      <InputMask mask="+99 999 9999 99" label="Disabled" size="md" disabled defaultValue="12345678901" />
      <InputMask mask="+99 999 9999 99" label="Required" size="md" required />
    </div>
  ),
};
