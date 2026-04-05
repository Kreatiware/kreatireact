import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from '../../../../packages/react/src/components/Switch';
import { Check, Times } from '../../../../packages/icons/src';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Toggle switch with sliding thumb on a track. Supports custom templates for thumb and track in on/off states, label positioning, 5 sizes, error/success/helper text, ARIA switch role, and keyboard navigation. Compatible with Formik.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    labelPosition: { control: 'select', options: ['left', 'right'] },
    helperSeverity: { control: 'select', options: ['primary', 'secondary', 'success', 'info', 'warning', 'help', 'danger'] },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Dark mode',
    size: 'md',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <Switch key={s} label={`Size ${s.toUpperCase()}`} size={s} defaultChecked />
      ))}
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Switch label="Off" size="md" />
      <Switch label="On" size="md" defaultChecked />
      <Switch label="Disabled off" size="md" disabled />
      <Switch label="Disabled on" size="md" disabled defaultChecked />
      <Switch label="Read only" size="md" readOnly defaultChecked />
      <Switch label="Required" size="md" required />
      <Switch label="Error off" size="md" error="Required" />
      <Switch label="Error on" size="md" error defaultChecked />
      <Switch label="Success" size="md" success defaultChecked />
    </div>
  ),
};

export const LabelPosition: Story = {
  name: 'Label position',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Switch label="Label on the right (default)" size="md" labelPosition="right" />
      <Switch label="Label on the left" size="md" labelPosition="left" />
    </div>
  ),
};

export const WithHelperText: Story = {
  name: 'Helper text',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Switch label="Notifications" size="md" helperText="Receive push notifications" />
      <Switch label="Analytics" size="md" helperText="Shares anonymous usage data" helperSeverity="warning" />
    </div>
  ),
};

export const Controlled: Story = {
  name: 'Controlled mode',
  render: () => {
    const Demo = () => {
      const [on, setOn] = useState(false);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Switch
            label="Toggle me"
            size="md"
            checked={on}
            onChange={(e) => setOn(e.target.checked)}
          />
          <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>
            checked: {String(on)}
          </span>
        </div>
      );
    };
    return <Demo />;
  },
};

export const ThumbTemplates: Story = {
  name: 'Custom thumb templates',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Switch
        label="Check / Times icons"
        size="lg"
        defaultChecked
        thumbOnTemplate={<Check size={14} color="var(--kreati-severity-success)" />}
        thumbOffTemplate={<Times size={14} color="var(--kreati-gray-400)" />}
      />
      <Switch
        label="Sun / Moon"
        size="xl"
        defaultChecked
        thumbOnTemplate={
          <svg width={16} height={16} viewBox="0 0 24 24" fill="#f59e0b" aria-hidden="true">
            <circle cx="12" cy="12" r="5" />
            <g stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="2" x2="12" y2="5" />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="2" y1="12" x2="5" y2="12" />
              <line x1="19" y1="12" x2="22" y2="12" />
            </g>
          </svg>
        }
        thumbOffTemplate={
          <svg width={16} height={16} viewBox="0 0 24 24" fill="#6366f1" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
          </svg>
        }
      />
    </div>
  ),
};

export const TrackTemplates: Story = {
  name: 'Custom track templates',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Switch
        label="ON / OFF text"
        size="xl"
        defaultChecked
        trackOnTemplate={<span style={{ fontSize: 10, fontWeight: 600, marginRight: 20 }}>ON</span>}
        trackOffTemplate={<span style={{ fontSize: 10, fontWeight: 600, color: '#6b7280', marginLeft: 20 }}>OFF</span>}
      />
      <Switch
        label="Icons in track"
        size="xl"
        defaultChecked
        trackOnTemplate={<span style={{ marginRight: 22 }}><Check size={12} color="#fff" /></span>}
        trackOffTemplate={<span style={{ marginLeft: 22 }}><Times size={12} color="#6b7280" /></span>}
      />
    </div>
  ),
};

export const FullCustom: Story = {
  name: 'Full custom (thumb + track)',
  render: () => {
    const Demo = () => {
      const [on, setOn] = useState(true);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Switch
            label="Airplane mode"
            size="xl"
            checked={on}
            onChange={(e) => setOn(e.target.checked)}
            thumbOnTemplate={
              <svg width={16} height={16} viewBox="0 0 24 24" fill="var(--kreati-severity-primary)" aria-hidden="true">
                <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
            }
            thumbOffTemplate={
              <svg width={16} height={16} viewBox="0 0 24 24" fill="var(--kreati-gray-400)" aria-hidden="true">
                <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
            }
            trackOnTemplate={<span style={{ fontSize: 9, fontWeight: 600, marginRight: 22 }}>ON</span>}
            trackOffTemplate={<span style={{ fontSize: 9, fontWeight: 600, color: '#6b7280', marginLeft: 22 }}>OFF</span>}
          />
          <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>
            checked: {String(on)}
          </span>
        </div>
      );
    };
    return <Demo />;
  },
};
