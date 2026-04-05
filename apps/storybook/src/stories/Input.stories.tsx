import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '../../../../packages/react/src/components/Input';
import { FieldWrapper } from '../../../../packages/react/src/components/FieldWrapper';
import { Check, ArrowRight, Times, Icon } from '../../../../packages/icons/src';

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Text input with floating label (default), 5 sizes aligned to Button, icon slots with tooltips, helper text with severity colors, error/success states, transparent background with configurable `background` prop. Supports `stacked` variant (label above) with hybrid FieldWrapper.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    type: { control: 'select', options: ['text', 'password', 'email', 'number', 'search', 'tel', 'url'] },
    variant: { control: 'select', options: ['floating', 'stacked'] },
    helperSeverity: { control: 'select', options: ['primary', 'secondary', 'success', 'info', 'warning', 'help', 'danger'] },
    tooltipPosition: { control: 'select', options: ['top', 'bottom', 'left', 'right'] },
    background: { control: 'color' },
    inputBackground: { control: 'color' },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Name',
    size: 'md',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 320, paddingTop: 12 }}>
      <Input label="XS" size="xs" />
      <Input label="SM" size="sm" />
      <Input label="MD (default)" size="md" />
      <Input label="LG" size="lg" />
      <Input label="XL" size="xl" />
    </div>
  ),
};

export const WithHelperText: Story = {
  args: {
    label: 'Email',
    type: 'email',
    helperText: "We'll never share your email with anyone.",
    size: 'md',
  },
};

export const WithError: Story = {
  args: {
    label: 'Password',
    type: 'password',
    error: 'Password must be at least 8 characters.',
    helperText: 'Use a mix of letters, numbers and symbols.',
    size: 'md',
  },
};

export const WithSuccess: Story = {
  args: {
    label: 'Username',
    success: true,
    helperText: 'Username is available!',
    size: 'md',
    defaultValue: 'kreatiware',
  },
};

export const WithIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 320, paddingTop: 12 }}>
      <Input label="Left icon" iconLeft={<ArrowRight size={16} />} size="md" />
      <Input label="Right icon" iconRight={<Check size={16} />} success size="md" defaultValue="kreatiware" />
      <Input label="Both icons" iconLeft={<ArrowRight size={16} />} iconRight={<Times size={16} />} size="md" />
    </div>
  ),
};

export const WithIconResolver: Story = {
  name: 'Icons by name',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 320, paddingTop: 12 }}>
      <Input label="By name" iconLeft={<Icon name="arrow-right" size={16} />} iconRight={<Icon name="times" size={16} />} size="md" />
      <Input label="Check by name" iconRight={<Icon name="check" size={16} />} success size="md" defaultValue="kreatiware" />
    </div>
  ),
};

export const WithTooltips: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 320, paddingTop: 12 }}>
      <Input
        label="Icon tooltips"
        iconLeft={<ArrowRight size={16} />}
        iconLeftTooltip="Navigate"
        iconRight={<Times size={16} />}
        iconRightTooltip="Clear field"
        size="md"
      />
      <Input
        label="Container tooltip"
        tooltip="This field accepts your full legal name"
        tooltipPosition="top"
        size="md"
      />
    </div>
  ),
};

export const Required: Story = {
  args: {
    label: 'Full name',
    required: true,
    size: 'md',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled field',
    disabled: true,
    size: 'md',
    defaultValue: 'Locked value',
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Read only',
    readOnly: true,
    size: 'md',
    defaultValue: 'Cannot modify this',
  },
};

export const FullWidth: Story = {
  render: () => (
    <div style={{ width: 500, paddingTop: 12 }}>
      <Input label="Full width" fullWidth size="md" helperText="Stretches to fill container." />
    </div>
  ),
};

export const HelperSeverity: Story = {
  name: 'Helper severity colors',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 320, paddingTop: 12 }}>
      <Input label="Info" size="md" helperText="Informational hint" helperSeverity="info" />
      <Input label="Warning" size="md" helperText="Cannot be undone" helperSeverity="warning" />
      <Input label="Success" size="md" helperText="Input is valid" helperSeverity="success" />
      <Input label="Danger" size="md" helperText="Will delete data" helperSeverity="danger" />
    </div>
  ),
};

export const WithBackground: Story = {
  name: 'Custom background',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ background: '#f3f4f6', padding: 24, borderRadius: 8 }}>
        <Input label="Red wrapper, white input" size="md" background="#fee2e2" inputBackground="#ffffff" helperText="Wrapper is red, input is white" />
      </div>
      <div style={{ background: '#f3f4f6', padding: 24, borderRadius: 8 }}>
        <Input label="Blue wrapper, yellow input" size="md" background="#deeff7" inputBackground="#fff7d7" helperText="Different colors to see the difference" />
      </div>
      <div style={{ background: '#f3f4f6', padding: 24, borderRadius: 8 }}>
        <Input label="Only input bg" size="md" inputBackground="#d1fae5" helperText="No wrapper background" />
      </div>
      <div style={{ background: '#f3f4f6', padding: 24, borderRadius: 8 }}>
        <Input label="Transparent (default)" size="md" helperText="Both transparent" />
      </div>
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 320, paddingTop: 12 }}>
      <Input label="Default" size="md" helperText="Default state" />
      <Input label="Error" size="md" error="This field is required" helperText="Check your input" />
      <Input label="Success" size="md" success helperText="Looks good!" defaultValue="kreatiware" />
      <Input label="Disabled" size="md" disabled defaultValue="Cannot edit" />
      <Input label="Read only" size="md" readOnly defaultValue="Read only value" />
      <Input label="Required" size="md" required helperText="Mandatory field" />
    </div>
  ),
};

export const StackedVariant: Story = {
  name: 'Stacked variant (label above)',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 320 }}>
      <Input label="Email" variant="stacked" type="email" size="md" helperText="Label stays above" />
      <Input label="With error" variant="stacked" size="md" error="Required" helperText="Helper stays visible" />
      <Input label="With icon" variant="stacked" size="md" iconLeft={<ArrowRight size={16} />} />
    </div>
  ),
};

export const FieldWrapperCustom: Story = {
  name: 'FieldWrapper (custom layout)',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 320 }}>
      <FieldWrapper label="Custom layout" helperText="Using FieldWrapper directly" size="md">
        <Input variant="stacked" size="md" placeholder="Inside FieldWrapper" />
      </FieldWrapper>
      <FieldWrapper label="With error" error="Something went wrong" size="md">
        <Input variant="stacked" size="md" placeholder="Error state" error={true} />
      </FieldWrapper>
      <FieldWrapper label="Side by side" helperText="Flexible layout" size="md">
        <div style={{ display: 'flex', gap: 8 }}>
          <Input variant="stacked" size="md" placeholder="First" />
          <Input variant="stacked" size="md" placeholder="Last" />
        </div>
      </FieldWrapper>
    </div>
  ),
};

export const WithoutLabel: Story = {
  name: 'Without label (no border cut)',
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingTop: 12 }}>
      <Input size="sm" placeholder="Compact" />
      <Input size="md" placeholder="Default" />
      <Input size="lg" placeholder="Large" />
    </div>
  ),
};

export const HideSteppers: Story = {
  name: 'Number: steppers',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 320, paddingTop: 12 }}>
      <Input label="Custom steppers (default)" type="number" size="md" helperText="ChevronUp/Down buttons" />
      <Input label="Hidden steppers" type="number" size="md" hideSteppers helperText="No stepper arrows" />
    </div>
  ),
};

export const DecimalSeparator: Story = {
  name: 'Number: decimal separator',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 320, paddingTop: 12 }}>
      <Input label="Dot (default)" type="number" size="md" step="0.01" helperText="Type 3.14" />
      <Input label="Comma" type="number" size="md" decimalSeparator="," helperText="Type 3,14 — only digits and comma allowed" />
    </div>
  ),
};
