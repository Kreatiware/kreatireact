import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from '../../../../packages/react/src/components/Checkbox';
import { CheckboxGroup } from '../../../../packages/react/src/components/CheckboxGroup';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Custom checkbox with checked, unchecked, and indeterminate states. Uses Kreati Check icon. Supports label positioning, 5 sizes, error/helper text, and full ARIA + keyboard navigation. Compatible with Formik.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    labelPosition: { control: 'select', options: ['left', 'right'] },
    helperSeverity: { control: 'select', options: ['primary', 'secondary', 'success', 'info', 'warning', 'help', 'danger'] },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Accept terms and conditions',
    size: 'md',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <Checkbox key={s} label={`Size ${s.toUpperCase()}`} size={s} defaultChecked />
      ))}
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Checkbox label="Unchecked" size="md" />
      <Checkbox label="Checked" size="md" defaultChecked />
      <Checkbox label="Indeterminate" size="md" indeterminate />
      <Checkbox label="Disabled unchecked" size="md" disabled />
      <Checkbox label="Disabled checked" size="md" disabled defaultChecked />
      <Checkbox label="Disabled indeterminate" size="md" disabled indeterminate />
      <Checkbox label="Read only" size="md" readOnly defaultChecked />
      <Checkbox label="Required" size="md" required />
      <Checkbox label="With error" size="md" error="This field is required" />
      <Checkbox label="Error checked" size="md" error defaultChecked />
      <Checkbox label="Success" size="md" success defaultChecked />
    </div>
  ),
};

export const LabelPosition: Story = {
  name: 'Label position',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Checkbox label="Label on the right (default)" size="md" labelPosition="right" />
      <Checkbox label="Label on the left" size="md" labelPosition="left" />
    </div>
  ),
};

export const WithHelperText: Story = {
  name: 'Helper text',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Checkbox label="Newsletter" size="md" helperText="We send updates once a week" />
      <Checkbox label="Terms" size="md" error="You must accept the terms" helperText="Read the full terms" />
      <Checkbox label="Beta" size="md" helperText="Experimental features" helperSeverity="warning" />
    </div>
  ),
};

export const Controlled: Story = {
  name: 'Controlled mode',
  render: () => {
    const Demo = () => {
      const [checked, setChecked] = useState(false);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Checkbox
            label="Toggle me"
            size="md"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>
            checked: {String(checked)}
          </span>
        </div>
      );
    };
    return <Demo />;
  },
};

export const Indeterminate: Story = {
  name: 'Indeterminate (select all)',
  render: () => {
    const Demo = () => {
      const items = ['Music', 'Sports', 'Reading'];
      const [selected, setSelected] = useState<string[]>(['Music']);

      const allChecked = selected.length === items.length;
      const someChecked = selected.length > 0 && !allChecked;

      const toggleAll = () => {
        setSelected(allChecked ? [] : [...items]);
      };

      const toggle = (item: string) => {
        setSelected((prev) =>
          prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
        );
      };

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Checkbox
            label="Select all"
            size="md"
            checked={allChecked}
            indeterminate={someChecked}
            onChange={toggleAll}
          />
          <div style={{ paddingLeft: 28, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((item) => (
              <Checkbox
                key={item}
                label={item}
                size="md"
                checked={selected.includes(item)}
                onChange={() => toggle(item)}
              />
            ))}
          </div>
        </div>
      );
    };
    return <Demo />;
  },
};

export const GroupMultiple: Story = {
  name: 'CheckboxGroup (multiple)',
  render: () => {
    const Demo = () => {
      const [values, setValues] = useState<Array<string | number>>(['music']);
      return (
        <div style={{ width: 320 }}>
          <CheckboxGroup
            label="Interests"
            options={[
              { value: 'music', label: 'Music' },
              { value: 'sports', label: 'Sports' },
              { value: 'reading', label: 'Reading' },
              { value: 'cooking', label: 'Cooking' },
            ]}
            value={values}
            onChange={setValues}
            size="md"
            helperText={`Selected: ${values.join(', ') || '(none)'}`}
          />
        </div>
      );
    };
    return <Demo />;
  },
};

export const GroupExclusive: Story = {
  name: 'CheckboxGroup (exclusive)',
  render: () => {
    const Demo = () => {
      const [values, setValues] = useState<Array<string | number>>(['medium']);
      return (
        <div style={{ width: 320 }}>
          <CheckboxGroup
            label="Priority"
            exclusive
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]}
            value={values}
            onChange={setValues}
            size="md"
            helperText={`Selected: ${values.join(', ') || '(none)'}`}
          />
        </div>
      );
    };
    return <Demo />;
  },
};

export const GroupHorizontal: Story = {
  name: 'CheckboxGroup (horizontal)',
  render: () => (
    <div style={{ width: 400 }}>
      <CheckboxGroup
        label="Tags"
        orientation="horizontal"
        options={[
          { value: 'react', label: 'React' },
          { value: 'vue', label: 'Vue' },
          { value: 'angular', label: 'Angular' },
          { value: 'svelte', label: 'Svelte' },
        ]}
        defaultValue={['react']}
        size="md"
      />
    </div>
  ),
};

export const GroupStates: Story = {
  name: 'CheckboxGroup states',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 320 }}>
      <CheckboxGroup
        label="With error"
        options={[
          { value: 'a', label: 'Option A' },
          { value: 'b', label: 'Option B' },
        ]}
        size="md"
        error="Select at least one option"
        required
      />
      <CheckboxGroup
        label="Disabled group"
        options={[
          { value: 'a', label: 'Option A' },
          { value: 'b', label: 'Option B' },
        ]}
        defaultValue={['a']}
        size="md"
        disabled
      />
      <CheckboxGroup
        label="Mixed disabled"
        options={[
          { value: 'a', label: 'Available' },
          { value: 'b', label: 'Unavailable', disabled: true },
          { value: 'c', label: 'Available' },
        ]}
        size="md"
        helperText="Some options are disabled individually"
      />
    </div>
  ),
};

export const GroupSizes: Story = {
  name: 'CheckboxGroup sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 320 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <CheckboxGroup
          key={s}
          label={`Size ${s.toUpperCase()}`}
          options={[
            { value: 'a', label: 'Option A' },
            { value: 'b', label: 'Option B' },
          ]}
          defaultValue={['a']}
          size={s}
        />
      ))}
    </div>
  ),
};

export const CustomTemplates: Story = {
  name: 'Custom templates',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Checkbox
        label="Star rating"
        size="lg"
        defaultChecked
        checkedTemplate={
          <svg width={18} height={18} viewBox="0 0 24 24" fill="#ffdb4f" aria-hidden="true">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
          </svg>
        }
        uncheckedTemplate={
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth={2} aria-hidden="true">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
          </svg>
        }
      />
      <Checkbox
        label="Heart toggle"
        size="lg"
        defaultChecked
        checkedTemplate={
          <svg width={18} height={18} viewBox="0 0 24 24" fill="#ef4444" aria-hidden="true">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        }
        uncheckedTemplate={
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth={2} aria-hidden="true">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        }
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>Sun / Moon / Planet</span>
        <Checkbox
          label="Checked (sun)"
          size="xl"
          defaultChecked
          checkedTemplate={
            <svg width={22} height={22} viewBox="0 0 24 24" fill="#f59e0b" aria-hidden="true">
              <circle cx="12" cy="12" r="5" />
              <g stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="1" x2="12" y2="4" />
                <line x1="12" y1="20" x2="12" y2="23" />
                <line x1="1" y1="12" x2="4" y2="12" />
                <line x1="20" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
                <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
                <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
                <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
              </g>
            </svg>
          }
          uncheckedTemplate={
            <svg width={22} height={22} viewBox="0 0 24 24" fill="#6b7280" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
            </svg>
          }
        />
        <Checkbox
          label="Unchecked (moon)"
          size="xl"
          uncheckedTemplate={
            <svg width={22} height={22} viewBox="0 0 24 24" fill="#6b7280" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
            </svg>
          }
        />
        <Checkbox
          label="Indeterminate (planet)"
          size="xl"
          indeterminate
          indeterminateTemplate={
            <svg width={22} height={22} viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="7" fill="#a855f7" />
              <circle cx="9" cy="10" r="1.2" fill="#f3e8ff" />
              <circle cx="15" cy="11" r="1.8" fill="#f3e8ff" />
              <circle cx="11" cy="15" r="1" fill="#f3e8ff" />
            </svg>
          }
        />
      </div>
    </div>
  ),
};
