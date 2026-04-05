import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Select } from '../../../../packages/react/src/components/Select';
import type { SelectOption } from '../../../../packages/react/src/components/Select';
import { KreatiProvider } from '../../../../packages/react/src/locale';
import { es } from '../../../../packages/react/src/locale/es';
import { ArrowRight, Check } from '../../../../packages/icons/src';

const countries: SelectOption[] = [
  { value: 'us', label: 'United States' },
  { value: 'mx', label: 'Mexico' },
  { value: 'ca', label: 'Canada' },
  { value: 'br', label: 'Brazil' },
  { value: 'ar', label: 'Argentina' },
  { value: 'co', label: 'Colombia' },
  { value: 'cl', label: 'Chile' },
  { value: 'pe', label: 'Peru' },
];

const groupedOptions: SelectOption[] = [
  { value: 'us', label: 'United States', group: 'north' },
  { value: 'mx', label: 'Mexico', group: 'north' },
  { value: 'ca', label: 'Canada', group: 'north' },
  { value: 'br', label: 'Brazil', group: 'south' },
  { value: 'ar', label: 'Argentina', group: 'south' },
  { value: 'co', label: 'Colombia', group: 'south' },
];

const groups = [
  { key: 'north', label: 'North America' },
  { key: 'south', label: 'South America' },
];

const largeList: SelectOption[] = Array.from({ length: 5000 }, (_, i) => ({
  value: i,
  label: `Option ${i + 1}`,
}));

const meta = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Custom select with floating/stacked label, keyboard navigation, ARIA combobox, filterable, editable, clearable, grouped options, virtual scroll, and custom templates. Sizes and states match Input.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    variant: { control: 'select', options: ['floating', 'stacked'] },
    helperSeverity: { control: 'select', options: ['primary', 'secondary', 'success', 'info', 'warning', 'help', 'danger'] },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Country',
    options: countries,
    size: 'md',
  },
  decorators: [(Story) => <div style={{ width: 320, paddingTop: 12 }}><Story /></div>],
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 320, paddingTop: 12 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <Select key={s} label={`Size ${s.toUpperCase()}`} options={countries} size={s} />
      ))}
    </div>
  ),
};

export const Filterable: Story = {
  args: {
    label: 'Search country',
    options: countries,
    filterable: true,
    size: 'md',
    helperText: 'Filter bar appears inside the dropdown',
  },
  decorators: [(Story) => <div style={{ width: 320, paddingTop: 12 }}><Story /></div>],
};

export const Editable: Story = {
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState<string | number | null>(null);
      return (
        <div style={{ width: 320, paddingTop: 12 }}>
          <Select
            label="Country (editable)"
            options={countries}
            editable
            clearable
            size="md"
            value={value}
            onChange={(v) => setValue(v)}
            helperText={`Value: ${value !== null ? String(value) : '(null)'}`}
          />
        </div>
      );
    };
    return <Demo />;
  },
};

export const FilterableAndEditable: Story = {
  name: 'Filterable + Editable',
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState<string | number | null>(null);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 320, paddingTop: 12 }}>
          <Select
            label="Country"
            options={countries}
            filterable
            editable
            clearable
            size="md"
            value={value}
            onChange={(v) => setValue(v)}
            helperText={`Value: ${value !== null ? String(value) : '(null)'}`}
          />
        </div>
      );
    };
    return <Demo />;
  },
};

export const Clearable: Story = {
  args: {
    label: 'Country',
    options: countries,
    clearable: true,
    size: 'md',
    defaultValue: 'mx',
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Country',
    options: countries,
    iconLeft: <ArrowRight size={16} />,
    size: 'md',
  },
};

export const Grouped: Story = {
  args: {
    label: 'Country',
    options: groupedOptions,
    groups,
    size: 'md',
  },
};

export const CustomTemplates: Story = {
  name: 'Custom templates',
  render: () => {
    const flagMap: Record<string, string> = { us: '🇺🇸', mx: '🇲🇽', ca: '🇨🇦', br: '🇧🇷', ar: '🇦🇷', co: '🇨🇴', cl: '🇨🇱', pe: '🇵🇪' };
    const popMap: Record<string, string> = { us: '331M', mx: '128M', ca: '38M', br: '214M', ar: '46M', co: '51M', cl: '19M', pe: '33M' };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 360, paddingTop: 12 }}>
        <Select
          label="With flags and check"
          options={countries}
          size="md"
          clearable
          defaultValue="mx"
          optionTemplate={(opt, { selected }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
              <span>{flagMap[opt.value as string] || ''}</span>
              <span style={{ flex: 1 }}>{opt.label}</span>
              {selected && <Check size={14} color="var(--kreati-severity-primary)" />}
            </div>
          )}
          selectedTemplate={(opt) => (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{flagMap[opt.value as string] || ''}</span>
              <span>{opt.label}</span>
            </span>
          )}
        />
        <Select
          label="With description"
          options={countries}
          size="lg"
          optionTemplate={(opt) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontWeight: 500 }}>{opt.label}</span>
              <span style={{ fontSize: 11, color: 'var(--kreati-gray-500)' }}>Population: {popMap[opt.value as string] || 'N/A'}</span>
            </div>
          )}
        />
        <Select
          label="Grouped with custom header"
          options={groupedOptions}
          groups={groups}
          size="md"
          filterable
          groupTemplate={(g) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 2, background: 'var(--kreati-severity-primary)', borderRadius: 1 }} />
              <span>{g.label}</span>
            </div>
          )}
        />
      </div>
    );
  },
};

export const VirtualScroll: Story = {
  name: 'Virtual scroll (5000 items)',
  args: {
    label: 'Large list',
    options: largeList,
    filterable: true,
    virtualScroll: true,
    size: 'md',
    helperText: '5000 options with virtual scrolling',
  },
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 320, paddingTop: 12 }}>
      <Select label="Default" options={countries} size="md" />
      <Select label="With error" options={countries} size="md" error="Please select a country" />
      <Select label="Success" options={countries} size="md" success defaultValue="mx" />
      <Select label="Disabled" options={countries} size="md" disabled defaultValue="us" />
      <Select label="Read only" options={countries} size="md" readOnly defaultValue="ca" />
      <Select label="Required" options={countries} size="md" required />
    </div>
  ),
};

export const StackedVariant: Story = {
  name: 'Stacked variant (FieldWrapper)',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 320 }}>
      <Select label="Country" variant="stacked" options={countries} size="md" helperText="Uses FieldWrapper for label + helper" />
      <Select label="With error" variant="stacked" options={countries} size="md" error="Required field" helperText="Helper stays visible below error" />
      <Select label="Success" variant="stacked" options={countries} size="md" success defaultValue="mx" helperText="Valid selection" />
      <Select label="With severity" variant="stacked" options={countries} size="md" helperText="Informational hint" helperSeverity="info" />
      <Select label="Disabled" variant="stacked" options={countries} size="md" disabled defaultValue="us" />
      <Select label="Required" variant="stacked" options={countries} size="md" required helperText="Mandatory field" />
    </div>
  ),
};

export const Controlled: Story = {
  name: 'Controlled mode',
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState<string | number | null>('mx');
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 320, paddingTop: 12 }}>
          <Select
            label="Country"
            options={countries}
            value={value}
            onChange={(v) => setValue(v)}
            clearable
            size="md"
          />
          <div style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>
            Value: {value !== null ? String(value) : '(null)'}
          </div>
        </div>
      );
    };
    return <Demo />;
  },
};

export const DisabledOptions: Story = {
  name: 'Disabled options',
  args: {
    label: 'Country',
    options: [
      { value: 'us', label: 'United States' },
      { value: 'mx', label: 'Mexico', disabled: true },
      { value: 'ca', label: 'Canada' },
      { value: 'br', label: 'Brazil', disabled: true },
    ],
    size: 'md',
  },
  decorators: [(Story) => <div style={{ width: 320, paddingTop: 12 }}><Story /></div>],
};

export const SpanishLocale: Story = {
  name: 'Locale: Spanish',
  render: () => (
    <KreatiProvider locale={es}>
      <div style={{ width: 320, paddingTop: 12 }}>
        <Select
          label="Pais"
          options={countries}
          filterable
          clearable
          size="md"
          helperText="Textos del componente en espanol via KreatiProvider"
        />
      </div>
    </KreatiProvider>
  ),
};

export const FormIntegration: Story = {
  name: 'Form integration (native)',
  render: () => {
    const Demo = () => {
      const [submitted, setSubmitted] = useState<Record<string, string> | null>(null);

      const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setSubmitted(Object.fromEntries(data.entries()) as Record<string, string>);
      };

      return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 320, paddingTop: 12 }}>
          <Select
            label="Country"
            name="country"
            options={countries}
            size="md"
            required
            helperText="Has hidden input with name='country'"
          />
          <Select
            label="Region"
            name="region"
            variant="stacked"
            options={groupedOptions}
            groups={groups}
            size="md"
          />
          <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>Submit</button>
          {submitted && (
            <pre style={{ fontSize: 12, color: '#6b7280', background: '#f3f4f6', padding: 12, borderRadius: 4, margin: 0 }}>
              {JSON.stringify(submitted, null, 2)}
            </pre>
          )}
        </form>
      );
    };
    return <Demo />;
  },
};
