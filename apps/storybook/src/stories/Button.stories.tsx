import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../../../packages/react/src/components/Button';
import { Check, ArrowRight, ChevronDown } from '../../../../packages/icons/src/icons';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Full-featured button with severity colors, 3 types (filled/outlined/text), 5 sizes, icons, badges, rounded, raised and slim variants.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    buttonType: { control: 'select', options: ['filled', 'outlined', 'text'] },
    severity: { control: 'select', options: ['primary', 'secondary', 'success', 'info', 'warning', 'help', 'danger'] },
    badgePosition: { control: 'select', options: ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'] },
    width: { control: 'text' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: 'Button' },
};

export const AllSeverities: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button label="Primary" severity="primary" />
      <Button label="Secondary" severity="secondary" />
      <Button label="Success" severity="success" />
      <Button label="Info" severity="info" />
      <Button label="Warning" severity="warning" />
      <Button label="Help" severity="help" />
      <Button label="Danger" severity="danger" />
    </div>
  ),
};

export const Outlined: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button label="Primary" severity="primary" buttonType="outlined" />
      <Button label="Secondary" severity="secondary" buttonType="outlined" />
      <Button label="Success" severity="success" buttonType="outlined" />
      <Button label="Info" severity="info" buttonType="outlined" />
      <Button label="Warning" severity="warning" buttonType="outlined" />
      <Button label="Help" severity="help" buttonType="outlined" />
      <Button label="Danger" severity="danger" buttonType="outlined" />
    </div>
  ),
};

export const Text: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button label="Primary" severity="primary" buttonType="text" />
      <Button label="Secondary" severity="secondary" buttonType="text" />
      <Button label="Success" severity="success" buttonType="text" />
      <Button label="Info" severity="info" buttonType="text" />
      <Button label="Warning" severity="warning" buttonType="text" />
      <Button label="Help" severity="help" buttonType="text" />
      <Button label="Danger" severity="danger" buttonType="text" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Button label="XS" size="xs" />
      <Button label="SM" size="sm" />
      <Button label="MD" size="md" />
      <Button label="LG" size="lg" />
      <Button label="XL" size="xl" />
    </div>
  ),
};

export const Slim: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, color: '#6b7280', fontFamily: 'sans-serif' }}>Normal</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Button label="XS" size="xs" />
        <Button label="SM" size="sm" />
        <Button label="MD" size="md" />
        <Button label="LG" size="lg" />
        <Button label="XL" size="xl" />
      </div>
      <div style={{ fontSize: 13, color: '#6b7280', fontFamily: 'sans-serif' }}>Slim</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Button label="XS" size="xs" slim />
        <Button label="SM" size="sm" slim />
        <Button label="MD" size="md" slim />
        <Button label="LG" size="lg" slim />
        <Button label="XL" size="xl" slim />
      </div>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button label="Confirm" iconLeft={<Check size={16} />} severity="success" />
      <Button label="Next" iconRight={<ArrowRight size={16} />} severity="primary" />
      <Button label="Options" iconLeft={<ChevronDown size={16} />} iconRight={<ChevronDown size={16} />} severity="info" />
    </div>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Button iconLeft={<Check size={16} />} size="xs" severity="success" />
      <Button iconLeft={<Check size={16} />} size="sm" severity="success" />
      <Button iconLeft={<Check size={18} />} size="md" severity="success" />
      <Button iconLeft={<ArrowRight size={20} />} size="lg" severity="primary" />
      <Button iconLeft={<ArrowRight size={22} />} size="xl" severity="primary" />
    </div>
  ),
};

export const IconOnlyRounded: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Button iconLeft={<Check size={16} />} size="xs" severity="success" rounded />
      <Button iconLeft={<Check size={16} />} size="sm" severity="info" rounded />
      <Button iconLeft={<Check size={18} />} size="md" severity="warning" rounded />
      <Button iconLeft={<ArrowRight size={20} />} size="lg" severity="danger" rounded />
      <Button iconLeft={<ArrowRight size={22} />} size="xl" severity="help" rounded />
    </div>
  ),
};

export const Rounded: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button label="Primary" severity="primary" rounded />
      <Button label="Success" severity="success" rounded buttonType="outlined" />
      <Button label="Danger" severity="danger" rounded buttonType="text" />
    </div>
  ),
};

export const Raised: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button label="Raised" severity="primary" raised />
      <Button label="Raised" severity="success" raised />
      <Button label="Raised" severity="danger" raised rounded />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button label="Filled" severity="primary" disabled />
      <Button label="Outlined" severity="primary" buttonType="outlined" disabled />
      <Button label="Text" severity="primary" buttonType="text" disabled />
      <Button label="Danger" severity="danger" disabled />
    </div>
  ),
};

export const WithBadge: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button label="Inbox" severity="primary" badge="3" badgePosition="ne" />
      <Button label="Alerts" severity="danger" buttonType="outlined" badge="99+" badgePosition="ne" />
      <Button iconLeft={<Check size={18} />} severity="info" badge="!" badgePosition="ne" />
      <Button iconLeft={<Check size={18} />} severity="success" rounded badge="2" badgePosition="nw" />
    </div>
  ),
};

export const CustomChildren: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Button severity="primary" size="lg">
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <strong>Custom</strong>
          <em>JSX</em>
          <ArrowRight size={16} />
        </span>
      </Button>
    </div>
  ),
};

export const Width: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 400 }}>
      <Button label="100%" severity="primary" width="100%" />
      <Button label="75%" severity="info" width="75%" />
      <Button label="50%" severity="success" width="50%" />
      <Button label="200px" severity="warning" width="200px" />
      <Button label="Auto (default)" severity="secondary" />
    </div>
  ),
};

export const FullShowcase: Story = {
  render: () => {
    const severities = ['primary', 'secondary', 'success', 'info', 'warning', 'help', 'danger'] as const;
    const types = ['filled', 'outlined', 'text'] as const;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {types.map((t) => (
          <div key={t}>
            <div style={{ marginBottom: 8, fontWeight: 600, textTransform: 'capitalize', fontFamily: 'sans-serif', fontSize: 13, color: '#6b7280' }}>{t}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {severities.map((s) => (
                <Button key={s} label={s} severity={s} buttonType={t} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};
