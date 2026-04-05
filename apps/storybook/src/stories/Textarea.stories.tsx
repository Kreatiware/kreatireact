import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from '../../../../packages/react/src/components/Textarea';
import { ArrowRight, Times } from '../../../../packages/icons/src';

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Multi-line text input with floating label (default), auto-resize, character count, 5 sizes, icon slots, tooltips, helper/error text with severity colors, and stacked variant with FieldWrapper support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    variant: { control: 'select', options: ['floating', 'stacked'] },
    resize: { control: 'select', options: ['none', 'vertical', 'horizontal', 'both'] },
    helperSeverity: { control: 'select', options: ['primary', 'secondary', 'success', 'info', 'warning', 'help', 'danger'] },
    tooltipPosition: { control: 'select', options: ['top', 'bottom', 'left', 'right'] },
    background: { control: 'color' },
    inputBackground: { control: 'color' },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Description',
    size: 'md',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 400, paddingTop: 12 }}>
      <Textarea label="XS" size="xs" />
      <Textarea label="SM" size="sm" />
      <Textarea label="MD (default)" size="md" />
      <Textarea label="LG" size="lg" />
      <Textarea label="XL" size="xl" />
    </div>
  ),
};

export const FixedRows: Story = {
  args: {
    label: 'Bio',
    size: 'md',
    rows: 6,
    helperText: 'Fixed at 6 rows.',
  },
};

export const AutoSize: Story = {
  name: 'Auto-resize',
  args: {
    label: 'Comments',
    size: 'md',
    autoSize: true,
    minRows: 2,
    maxRows: 8,
    helperText: 'Grows with content (2-8 rows).',
  },
};

export const WithCharacterCount: Story = {
  name: 'Character count',
  args: {
    label: 'Tweet',
    size: 'md',
    maxLength: 280,
    showCount: true,
    helperText: 'Keep it short.',
  },
};

export const WithError: Story = {
  args: {
    label: 'Feedback',
    size: 'md',
    error: 'Feedback is required.',
    helperText: 'Tell us what you think.',
  },
};

export const WithSuccess: Story = {
  args: {
    label: 'Notes',
    size: 'md',
    success: true,
    helperText: 'Saved successfully.',
    defaultValue: 'Everything looks great!',
  },
};

export const WithIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 400, paddingTop: 12 }}>
      <Textarea label="With left icon" iconLeft={<ArrowRight size={16} />} size="md" />
      <Textarea label="With right icon" iconRight={<Times size={16} />} size="md" />
    </div>
  ),
};

export const Required: Story = {
  args: {
    label: 'Message',
    required: true,
    size: 'md',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    disabled: true,
    size: 'md',
    defaultValue: 'Cannot edit this.',
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Read only',
    readOnly: true,
    size: 'md',
    defaultValue: 'This content is read-only.',
  },
};

export const FullWidth: Story = {
  render: () => (
    <div style={{ width: 500, paddingTop: 12 }}>
      <Textarea label="Full width" fullWidth size="md" helperText="Stretches to fill container." />
    </div>
  ),
};

export const ResizeOptions: Story = {
  name: 'Resize options',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', maxWidth: 800, paddingTop: 12 }}>
      <Textarea label="Vertical (default)" size="md" resize="vertical" />
      <Textarea label="Horizontal" size="md" resize="horizontal" />
      <Textarea label="Both" size="md" resize="both" />
      <Textarea label="None" size="md" resize="none" />
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 400, paddingTop: 12 }}>
      <Textarea label="Default" size="md" helperText="Default state" />
      <Textarea label="Error" size="md" error="This field is required" helperText="Check your input" />
      <Textarea label="Success" size="md" success helperText="Looks good!" defaultValue="Valid content" />
      <Textarea label="Disabled" size="md" disabled defaultValue="Cannot edit" />
      <Textarea label="Read only" size="md" readOnly defaultValue="Read only value" />
      <Textarea label="Required" size="md" required helperText="Mandatory field" />
    </div>
  ),
};

export const StackedVariant: Story = {
  name: 'Stacked variant (label above)',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 400 }}>
      <Textarea label="Bio" variant="stacked" size="md" helperText="Label stays above" />
      <Textarea label="With error" variant="stacked" size="md" error="Required" helperText="Helper visible" />
    </div>
  ),
};
