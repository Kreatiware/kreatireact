import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from '../../../../packages/react/src/components/Tooltip';
import { Button } from '../../../../packages/react/src/components/Button';
import { Times, Check } from '../../../../packages/icons/src/icons';

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Lightweight tooltip that shows contextual information on hover/focus. Supports 4 positions with optional arrow.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    position: { control: 'select', options: ['top', 'bottom', 'left', 'right'] },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: 'This is a tooltip',
    position: 'top',
    children: <Button label="Hover me" size="md" />,
  },
};

export const Positions: Story = {
  args: {
    content: 'Tooltip',
    children: <Button label="Trigger" size="sm" />,
  },
  render: () => (
    <div style={{ display: 'flex', gap: 24, padding: 60 }}>
      <Tooltip content="Top tooltip" position="top">
        <Button label="Top" size="sm" />
      </Tooltip>
      <Tooltip content="Bottom tooltip" position="bottom">
        <Button label="Bottom" size="sm" />
      </Tooltip>
      <Tooltip content="Left tooltip" position="left">
        <Button label="Left" size="sm" />
      </Tooltip>
      <Tooltip content="Right tooltip" position="right">
        <Button label="Right" size="sm" />
      </Tooltip>
    </div>
  ),
};

export const WithoutArrow: Story = {
  args: {
    content: 'No arrow',
    position: 'top',
    arrow: false,
    children: <Button label="No arrow" size="md" />,
  },
};

export const OnIconButton: Story = {
  args: {
    content: 'Action',
    children: <Button label="Trigger" size="sm" />,
  },
  render: () => (
    <div style={{ display: 'flex', gap: 16, padding: 40 }}>
      <Tooltip content="Delete" position="top">
        <Button iconLeft={<Times size={16} />} severity="danger" size="sm" ariaLabel="Delete" />
      </Tooltip>
      <Tooltip content="Confirm" position="top">
        <Button iconLeft={<Check size={16} />} severity="success" size="sm" ariaLabel="Confirm" />
      </Tooltip>
    </div>
  ),
};

export const WithDelay: Story = {
  args: {
    content: 'Appears after 500ms',
    position: 'top',
    delay: 500,
    children: <Button label="Slow tooltip" size="md" />,
  },
};
