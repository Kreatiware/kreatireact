import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '../../../../packages/react/src/components/Badge';
import { Button } from '../../../../packages/react/src/components/Button';
import { Check } from '../../../../packages/icons/src/icons';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A small circular badge that can be positioned on any component using 8 cardinal directions (N, NE, E, SE, S, SW, W, NW).',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    position: { control: 'select', options: ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'] },
    severity: { control: 'select', options: ['primary', 'secondary', 'success', 'info', 'warning', 'help', 'danger'] },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

const DemoBox = ({ children }: { children?: React.ReactNode }) => (
  <div style={{
    width: 48,
    height: 48,
    borderRadius: 8,
    background: '#e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
  }}>
    {children || '📦'}
  </div>
);

export const Default: Story = {
  args: {
    value: '3',
    position: 'ne',
    severity: 'danger',
    children: <DemoBox />,
  },
};

export const AllPositions: Story = {
  args: { value: '5', children: <DemoBox /> },
  render: () => {
    const positions = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'] as const;
    return (
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        {positions.map((pos) => (
          <div key={pos} style={{ textAlign: 'center' }}>
            <Badge value="5" position={pos} severity="danger">
              <DemoBox />
            </Badge>
            <div style={{ marginTop: 12, fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>{pos}</div>
          </div>
        ))}
      </div>
    );
  },
};

export const AllSeverities: Story = {
  args: { value: '3', children: <DemoBox /> },
  render: () => {
    const severities = ['primary', 'secondary', 'success', 'info', 'warning', 'help', 'danger'] as const;
    return (
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {severities.map((s) => (
          <div key={s} style={{ textAlign: 'center' }}>
            <Badge value="3" severity={s}>
              <DemoBox />
            </Badge>
            <div style={{ marginTop: 12, fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>{s}</div>
          </div>
        ))}
      </div>
    );
  },
};

export const EmptyDot: Story = {
  args: { children: <DemoBox /> },
  render: () => (
    <div style={{ display: 'flex', gap: 24 }}>
      <Badge severity="danger">
        <DemoBox />
      </Badge>
      <Badge severity="success" position="nw">
        <DemoBox />
      </Badge>
      <Badge severity="info" position="sw">
        <DemoBox />
      </Badge>
    </div>
  ),
};

export const OnButton: Story = {
  args: { children: <DemoBox /> },
  render: () => (
    <div style={{ display: 'flex', gap: 24 }}>
      <Badge value="5" severity="danger">
        <Button label="Inbox" severity="primary" />
      </Badge>
      <Badge value="!" severity="warning">
        <Button iconLeft={<Check size={18} />} severity="info" />
      </Badge>
      <Badge severity="success">
        <Button iconLeft={<Check size={18} />} severity="secondary" rounded />
      </Badge>
    </div>
  ),
};

export const WithIcon: Story = {
  args: {
    value: <Check size={10} />,
    position: 'ne',
    severity: 'success',
    children: <DemoBox />,
  },
};
