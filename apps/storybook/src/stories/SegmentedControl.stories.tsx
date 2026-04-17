import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SegmentedControl } from '../../../../packages/react/src/components/SegmentedControl';
import { Button } from '../../../../packages/react/src/components/Button';
import { Grid, ListIcon, Home, Settings, User } from '../../../../packages/icons/src';

const meta = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string | number>('grid');
    return (
      <SegmentedControl
        options={[
          { label: 'Grid', value: 'grid' },
          { label: 'List', value: 'list' },
          { label: 'Table', value: 'table' },
        ]}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const Rounded: Story = {
  render: () => {
    const [value, setValue] = useState<string | number>('grid');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
        <SegmentedControl
          options={[
            { label: 'Grid', value: 'grid' },
            { label: 'List', value: 'list' },
            { label: 'Table', value: 'table' },
          ]}
          value={value}
          onChange={setValue}
        />
        <SegmentedControl
          options={[
            { label: 'Grid', value: 'grid' },
            { label: 'List', value: 'list' },
            { label: 'Table', value: 'table' },
          ]}
          value={value}
          onChange={setValue}
          rounded
        />
      </div>
    );
  },
};

export const WithIcons: Story = {
  name: 'With icons',
  render: () => {
    const [value, setValue] = useState<string | number>('grid');
    return (
      <SegmentedControl
        options={[
          { label: 'Grid', value: 'grid', icon: <Grid /> },
          { label: 'List', value: 'list', icon: <ListIcon /> },
        ]}
        value={value}
        onChange={setValue}
        rounded
      />
    );
  },
};

export const IconOnly: Story = {
  name: 'Icon only',
  render: () => {
    const [value, setValue] = useState<string | number>('home');
    return (
      <SegmentedControl
        options={[
          { value: 'home', icon: <Home /> },
          { value: 'user', icon: <User /> },
          { value: 'settings', icon: <Settings /> },
        ]}
        value={value}
        onChange={setValue}
        rounded
      />
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const opts = [
      { label: 'Daily', value: 'daily' },
      { label: 'Weekly', value: 'weekly' },
      { label: 'Monthly', value: 'monthly' },
    ];
    const sizes = ['xs', 'sm', 'md', 'lg'] as const;
    const variants = [
      { label: 'Default', rounded: false, slim: false },
      { label: 'Slim', rounded: false, slim: true },
      { label: 'Rounded', rounded: true, slim: false },
      { label: 'Rounded + Slim', rounded: true, slim: true },
    ];
    return (
      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
        {variants.map((v) => (
          <div key={v.label} style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
            <strong style={{ fontSize: 'var(--kreati-font-size-xs)', color: 'var(--kreati-gray-500)' }}>{v.label}</strong>
            {sizes.map((s) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 24, fontSize: 'var(--kreati-font-size-xs)', color: 'var(--kreati-gray-500)' }}>{s}</span>
                <SegmentedControl options={opts} defaultValue="weekly" size={s} rounded={v.rounded} slim={v.slim} />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
};

export const Severities: Story = {
  render: () => {
    const opts = [
      { label: 'On', value: 'on' },
      { label: 'Off', value: 'off' },
    ];
    const sevs = ['primary', 'secondary', 'success', 'info', 'warning', 'help', 'danger', 'accent'] as const;
    return (
      <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
          <strong style={{ fontSize: 'var(--kreati-font-size-xs)', color: 'var(--kreati-gray-500)' }}>Default</strong>
          {sevs.map((s) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 80, fontSize: 'var(--kreati-font-size-xs)', color: 'var(--kreati-gray-500)' }}>{s}</span>
              <SegmentedControl options={opts} defaultValue="on" severity={s} rounded />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
          <strong style={{ fontSize: 'var(--kreati-font-size-xs)', color: 'var(--kreati-gray-500)' }}>Subtle</strong>
          {sevs.map((s) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 80, fontSize: 'var(--kreati-font-size-xs)', color: 'var(--kreati-gray-500)' }}>{s}</span>
              <SegmentedControl options={opts} defaultValue="on" severity={s} variant="subtle" rounded />
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export const FullWidth: Story = {
  name: 'Full width',
  render: () => (
    <div style={{ width: 400 }}>
      <SegmentedControl
        options={[
          { label: 'Light', value: 'light' },
          { label: 'Dark', value: 'dark' },
          { label: 'System', value: 'system' },
        ]}
        defaultValue="system"
        fullWidth
        rounded
      />
    </div>
  ),
};

export const DisabledOption: Story = {
  name: 'Disabled option',
  render: () => (
    <SegmentedControl
      options={[
        { label: 'S', value: 's' },
        { label: 'M', value: 'm' },
        { label: 'L', value: 'l', disabled: true },
        { label: 'XL', value: 'xl' },
      ]}
      defaultValue="m"
      rounded
    />
  ),
};

export const DisabledAll: Story = {
  name: 'Disabled (all)',
  render: () => (
    <SegmentedControl
      options={[
        { label: 'Card', value: 'card' },
        { label: 'Transfer', value: 'transfer' },
        { label: 'Cash', value: 'cash' },
      ]}
      defaultValue="card"
      disabled
      rounded
    />
  ),
};

export const FormCompatibility: Story = {
  name: 'Form compatibility',
  render: () => {
    const [value, setValue] = useState<string | number>('weekly');
    return (
      <form onSubmit={(e) => { e.preventDefault(); alert(`Submitted: ${new FormData(e.currentTarget).get('frequency')}`); }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
          <SegmentedControl
            name="frequency"
            options={[
              { label: 'Daily', value: 'daily' },
              { label: 'Weekly', value: 'weekly' },
              { label: 'Monthly', value: 'monthly' },
            ]}
            value={value}
            onChange={setValue}
            rounded
          />
          <Button label="Submit" buttonType="filled" size="sm" onClick={() => {}} />
          <span style={{ fontSize: 'var(--kreati-font-size-xs)', color: 'var(--kreati-gray-500)' }}>
            Hidden input value: {value}
          </span>
        </div>
      </form>
    );
  },
};

export const CustomTemplates: Story = {
  name: 'Custom templates',
  render: () => {
    const [value, setValue] = useState<string | number>('pro');
    const options = [
      { value: 'free', label: 'Free', icon: <Home /> },
      { value: 'pro', label: 'Pro', icon: <User /> },
      { value: 'enterprise', label: 'Enterprise', icon: <Settings /> },
    ];
    return (
      <SegmentedControl
        options={options}
        value={value}
        onChange={setValue}
        rounded
        pillTemplate={(_, style) => (
          <div
            style={{
              ...style,
              position: 'absolute',
              background: 'linear-gradient(135deg, var(--kreati-severity-primary), var(--kreati-severity-accent))',
              borderRadius: 'var(--kreati-radius-full)',
              boxShadow: 'var(--kreati-shadow-md)',
            }}
            aria-hidden="true"
          />
        )}
        optionTemplate={(opt, _, active) => (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '0.25rem 1rem' }}>
            <span style={{ lineHeight: 0 }}>{opt.icon}</span>
            <span style={{ fontSize: 'var(--kreati-font-size-xxs)', fontWeight: active ? 'var(--kreati-font-weight-bold)' : 'var(--kreati-font-weight-regular)' }}>
              {opt.label}
            </span>
          </div>
        )}
      />
    );
  },
};
