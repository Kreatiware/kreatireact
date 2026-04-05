import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MultiSelect } from '../../../../packages/react/src/components/MultiSelect';
import type { SelectOption } from '../../../../packages/react/src/components/SelectDropdown';
import { KreatiProvider } from '../../../../packages/react/src/locale';
import { es } from '../../../../packages/react/src/locale/es';

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

const meta = {
  title: 'Components/MultiSelect',
  component: MultiSelect,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Multi-value select with checkboxes, chip display, select all, group selection, max limit, filterable, and custom templates. Compatible with Formik.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    variant: { control: 'select', options: ['floating', 'stacked'] },
    checkboxPosition: { control: 'select', options: ['left', 'right'] },
  },
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: 'Countries', options: countries, size: 'md' },
  decorators: [(Story) => <div style={{ width: 320, paddingTop: 12 }}><Story /></div>],
};

export const WithChips: Story = {
  name: 'Chip display',
  render: () => {
    const Demo = () => {
      const [val, setVal] = useState<Array<string | number>>(['us', 'mx']);
      return (
        <div style={{ width: 360, paddingTop: 12 }}>
          <MultiSelect label="Countries" options={countries} chipDisplay clearable value={val} onChange={(v) => setVal(v)} size="md" helperText={`${val.length} selected`} />
        </div>
      );
    };
    return <Demo />;
  },
};

export const SelectAllOption: Story = {
  name: 'Select all',
  args: { label: 'Countries', options: countries, selectAll: true, chipDisplay: true, size: 'md' },
  decorators: [(Story) => <div style={{ width: 360, paddingTop: 12 }}><Story /></div>],
};

export const Filterable: Story = {
  args: { label: 'Countries', options: countries, filterable: true, selectAll: true, size: 'md' },
  decorators: [(Story) => <div style={{ width: 320, paddingTop: 12 }}><Story /></div>],
};

export const MaxSelection: Story = {
  name: 'Max selection (3)',
  render: () => {
    const Demo = () => {
      const [val, setVal] = useState<Array<string | number>>([]);
      return (
        <div style={{ width: 360, paddingTop: 12 }}>
          <MultiSelect label="Pick up to 3" options={countries} chipDisplay maxSelection={3} value={val} onChange={(v) => setVal(v)} size="md" helperText={`${val.length}/3 selected`} helperSeverity={val.length >= 3 ? 'warning' : undefined} />
        </div>
      );
    };
    return <Demo />;
  },
};

export const Grouped: Story = {
  name: 'Grouped with group selection',
  args: { label: 'Countries', options: groupedOptions, groups, selectGroup: true, selectAll: true, chipDisplay: true, size: 'md' },
  decorators: [(Story) => <div style={{ width: 360, paddingTop: 12 }}><Story /></div>],
};

export const CheckboxRight: Story = {
  name: 'Checkbox on right',
  args: { label: 'Countries', options: countries, checkboxPosition: 'right', size: 'md' },
  decorators: [(Story) => <div style={{ width: 320, paddingTop: 12 }}><Story /></div>],
};

export const WithIcon: Story = {
  name: 'With left icon',
  args: { label: 'Countries', options: countries, iconLeft: <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" opacity={0.2} /><circle cx="12" cy="12" r="5" /></svg>, chipDisplay: true, size: 'md', defaultValue: ['us'] },
  decorators: [(Story) => <div style={{ width: 360, paddingTop: 12 }}><Story /></div>],
};

export const MaxSelectedLabels: Story = {
  name: 'Max selected labels',
  render: () => {
    const Demo = () => {
      const [val, setVal] = useState<Array<string | number>>(['us', 'mx', 'ca', 'br']);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 360, paddingTop: 12 }}>
          <MultiSelect label="Default (3 labels)" options={countries} value={val} onChange={(v) => setVal(v)} size="md" helperText="Shows names up to 3, then count" />
          <MultiSelect label="Max 1 label" options={countries} maxSelectedLabels={1} value={val} onChange={(v) => setVal(v)} size="md" />
          <MultiSelect label="Max 5 labels" options={countries} maxSelectedLabels={5} value={val} onChange={(v) => setVal(v)} size="md" />
        </div>
      );
    };
    return <Demo />;
  },
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 360, paddingTop: 12 }}>
      <MultiSelect label="Default" options={countries} size="md" />
      <MultiSelect label="With error" options={countries} size="md" error="Select at least one" required />
      <MultiSelect label="Success" options={countries} size="md" success defaultValue={['us']} chipDisplay />
      <MultiSelect label="Disabled" options={countries} size="md" disabled defaultValue={['us', 'mx']} chipDisplay />
      <MultiSelect label="Read only" options={countries} size="md" readOnly defaultValue={['ca']} chipDisplay />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 360, paddingTop: 12 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <MultiSelect key={s} label={`Size ${s.toUpperCase()}`} options={countries} size={s} chipDisplay defaultValue={['us']} />
      ))}
    </div>
  ),
};

export const StackedVariant: Story = {
  name: 'Stacked variant',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 360 }}>
      <MultiSelect label="Countries" variant="stacked" options={countries} size="md" chipDisplay helperText="Uses FieldWrapper" />
      <MultiSelect label="With error" variant="stacked" options={countries} size="md" error="Required" required />
    </div>
  ),
};

export const SpanishLocale: Story = {
  name: 'Locale: Spanish',
  render: () => (
    <KreatiProvider locale={es}>
      <div style={{ width: 360, paddingTop: 12 }}>
        <MultiSelect label="Paises" options={countries} filterable selectAll clearable chipDisplay size="md" helperText="Textos en español via KreatiProvider" />
      </div>
    </KreatiProvider>
  ),
};

export const CustomSelectedTemplate: Story = {
  name: 'Custom selected template (override)',
  render: () => (
    <div style={{ width: 360, paddingTop: 12 }}>
      <MultiSelect
        label="Countries"
        options={countries}
        defaultValue={['us', 'mx', 'ca']}
        size="md"
        selectedTemplate={(opts, count) => (
          <span style={{ color: 'var(--kreati-severity-primary)', fontWeight: 500 }}>
            {opts.map((o) => o.label).join(' + ')} ({count})
          </span>
        )}
        helperText="selectedTemplate overrides maxSelectedLabels"
      />
    </div>
  ),
};

export const CustomCheckboxTemplates: Story = {
  name: 'Custom checkbox templates',
  render: () => {
    const flagMap: Record<string, string> = { us: '\ud83c\uddfa\ud83c\uddf8', mx: '\ud83c\uddf2\ud83c\uddfd', ca: '\ud83c\udde8\ud83c\udde6', br: '\ud83c\udde7\ud83c\uddf7', ar: '\ud83c\udde6\ud83c\uddf7', co: '\ud83c\udde8\ud83c\uddf4', cl: '\ud83c\udde8\ud83c\uddf1', pe: '\ud83c\uddf5\ud83c\uddea' };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 400, paddingTop: 12 }}>
        <MultiSelect
          label="Flags as checkboxes"
          options={countries}
          size="lg"
          chipDisplay
          clearable
          defaultValue={['us', 'mx']}
          optionTemplate={(opt, { selected }) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
              <span style={{ fontSize: 18 }}>{flagMap[opt.value as string] || ''}</span>
              <span style={{ flex: 1 }}>{opt.label}</span>
            </div>
          )}
          checkedTemplate={
            <svg width={14} height={14} viewBox="0 0 24 24" fill="#10b981" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.86,18.21c-.28,0-.54-.12-.74-.33l-5.56-5.78c-.19-.2-.29-.47-.28-.75.01-.28.13-.54.33-.74.41-.39,1.07-.38,1.48.03l4.73,4.92L19.78,5.79c.38-.42,1.04-.46,1.47-.08.42.38.46,1.04.08,1.47L10.63,17.85c-.19.21-.46.34-.74.36h-.03Z" fill="#fff" />
            </svg>
          }
          uncheckedTemplate={
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="#d1d5db" strokeWidth="2" />
            </svg>
          }
          helperText="Green circle check / gray circle unchecked"
        />
        <MultiSelect
          label="Star rating checkboxes"
          options={countries}
          size="lg"
          chipDisplay
          defaultValue={['br']}
          checkedTemplate={
            <svg width={14} height={14} viewBox="0 0 24 24" fill="#ffdb4f" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
            </svg>
          }
          uncheckedTemplate={
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
            </svg>
          }
          helperText="Star filled / star outline"
        />
        <MultiSelect
          label="Heart checkboxes"
          options={countries}
          size="lg"
          selectAll
          defaultValue={['cl', 'pe']}
          checkedTemplate={
            <svg width={14} height={14} viewBox="0 0 24 24" fill="#ef4444" aria-hidden="true">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          }
          uncheckedTemplate={
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" aria-hidden="true">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          }
          helperText="Heart filled / heart outline"
        />
      </div>
    );
  },
};
