import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Radio } from '../../../../packages/react/src/components/Radio';
import { RadioGroup } from '../../../../packages/react/src/components/RadioGroup';

const meta = {
  title: 'Components/Radio',
  component: Radio,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Custom radio button with circular shape, filled dot when checked. Supports custom templates for checked/unchecked, label positioning, 5 sizes, error/success/helper text, and full ARIA + keyboard navigation. Compatible with Formik.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    labelPosition: { control: 'select', options: ['left', 'right'] },
    helperSeverity: { control: 'select', options: ['primary', 'secondary', 'success', 'info', 'warning', 'help', 'danger'] },
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Option A',
    name: 'default-demo',
    size: 'md',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <Radio key={s} label={`Size ${s.toUpperCase()}`} name={`size-${s}`} size={s} defaultChecked />
      ))}
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Radio label="Unchecked" name="states-1" size="md" />
      <Radio label="Checked" name="states-2" size="md" defaultChecked />
      <Radio label="Disabled unchecked" name="states-3" size="md" disabled />
      <Radio label="Disabled checked" name="states-4" size="md" disabled defaultChecked />
      <Radio label="Read only" name="states-5" size="md" readOnly defaultChecked />
      <Radio label="Required" name="states-6" size="md" required />
      <Radio label="With error" name="states-7" size="md" error="Selection required" />
      <Radio label="Error checked" name="states-8" size="md" error defaultChecked />
      <Radio label="Success" name="states-9" size="md" success defaultChecked />
    </div>
  ),
};

export const LabelPosition: Story = {
  name: 'Label position',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Radio label="Label on the right (default)" name="pos-1" size="md" labelPosition="right" />
      <Radio label="Label on the left" name="pos-2" size="md" labelPosition="left" />
    </div>
  ),
};

export const WithHelperText: Story = {
  name: 'Helper text',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Radio label="Standard" name="help-1" size="md" helperText="Default shipping (3-5 days)" />
      <Radio label="Express" name="help-2" size="md" helperText="Next day delivery" helperSeverity="warning" />
    </div>
  ),
};

export const Controlled: Story = {
  name: 'Controlled mode',
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState<string>('a');
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {['a', 'b', 'c'].map((v) => (
            <Radio
              key={v}
              label={`Option ${v.toUpperCase()}`}
              name="controlled"
              value={v}
              size="md"
              checked={value === v}
              onChange={() => setValue(v)}
            />
          ))}
          <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>
            value: {value}
          </span>
        </div>
      );
    };
    return <Demo />;
  },
};

export const GroupBasic: Story = {
  name: 'RadioGroup',
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState<string | number | null>('medium');
      return (
        <div style={{ width: 320 }}>
          <RadioGroup
            label="Priority"
            name="priority"
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]}
            value={value}
            onChange={(v) => setValue(v)}
            size="md"
            helperText={`Selected: ${value ?? '(none)'}`}
          />
        </div>
      );
    };
    return <Demo />;
  },
};

export const GroupHorizontal: Story = {
  name: 'RadioGroup (horizontal)',
  render: () => (
    <div style={{ width: 400 }}>
      <RadioGroup
        label="Plan"
        name="plan"
        orientation="horizontal"
        options={[
          { value: 'free', label: 'Free' },
          { value: 'pro', label: 'Pro' },
          { value: 'enterprise', label: 'Enterprise' },
        ]}
        defaultValue="pro"
        size="md"
      />
    </div>
  ),
};

export const GroupStates: Story = {
  name: 'RadioGroup states',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 320 }}>
      <RadioGroup
        label="With error"
        name="err"
        options={[
          { value: 'a', label: 'Option A' },
          { value: 'b', label: 'Option B' },
        ]}
        size="md"
        error="Please select an option"
        required
      />
      <RadioGroup
        label="Disabled group"
        name="dis"
        options={[
          { value: 'a', label: 'Option A' },
          { value: 'b', label: 'Option B' },
        ]}
        defaultValue="a"
        size="md"
        disabled
      />
      <RadioGroup
        label="Mixed disabled"
        name="mix"
        options={[
          { value: 'a', label: 'Available' },
          { value: 'b', label: 'Unavailable', disabled: true },
          { value: 'c', label: 'Available' },
        ]}
        size="md"
        helperText="Some options are disabled individually"
      />
      <RadioGroup
        label="Success"
        name="suc"
        options={[
          { value: 'a', label: 'Option A' },
          { value: 'b', label: 'Option B' },
        ]}
        defaultValue="a"
        size="md"
        success
        helperText="Valid selection"
      />
    </div>
  ),
};

export const GroupSizes: Story = {
  name: 'RadioGroup sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 320 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <RadioGroup
          key={s}
          label={`Size ${s.toUpperCase()}`}
          name={`size-group-${s}`}
          options={[
            { value: 'a', label: 'Option A' },
            { value: 'b', label: 'Option B' },
          ]}
          defaultValue="a"
          size={s}
        />
      ))}
    </div>
  ),
};

export const CustomTemplates: Story = {
  name: 'Custom templates',
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState<string>('sun');
      const opts = ['sun', 'moon', 'star'];

      const templates: Record<string, { checked: React.ReactNode; unchecked: React.ReactNode; label: string }> = {
        sun: {
          label: 'Sun',
          checked: (
            <svg width={18} height={18} viewBox="0 0 24 24" fill="#f59e0b" aria-hidden="true">
              <circle cx="12" cy="12" r="5" />
              <g stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="1" x2="12" y2="4" />
                <line x1="12" y1="20" x2="12" y2="23" />
                <line x1="1" y1="12" x2="4" y2="12" />
                <line x1="20" y1="12" x2="23" y2="12" />
              </g>
            </svg>
          ),
          unchecked: (
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="5" />
            </svg>
          ),
        },
        moon: {
          label: 'Moon',
          checked: (
            <svg width={18} height={18} viewBox="0 0 24 24" fill="#6366f1" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
            </svg>
          ),
          unchecked: (
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
            </svg>
          ),
        },
        star: {
          label: 'Star',
          checked: (
            <svg width={18} height={18} viewBox="0 0 24 24" fill="#ffdb4f" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
            </svg>
          ),
          unchecked: (
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
            </svg>
          ),
        },
      };

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {opts.map((o) => (
            <Radio
              key={o}
              label={templates[o].label}
              name="custom-tpl"
              value={o}
              size="xl"
              checked={value === o}
              onChange={() => setValue(o)}
              checkedTemplate={templates[o].checked}
              uncheckedTemplate={templates[o].unchecked}
            />
          ))}
          <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>
            value: {value}
          </span>
        </div>
      );
    };
    return <Demo />;
  },
};
