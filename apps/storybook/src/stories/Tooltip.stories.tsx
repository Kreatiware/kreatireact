import React, { useState } from 'react';
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
          'Portal-based tooltip with auto-flip, mouse tracking, auto-hide, custom templates, and full ARIA support. Works correctly inside Dialog and stacked overlays.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    position: { control: 'select', options: ['top', 'bottom', 'left', 'right'] },
    event: { control: 'select', options: ['hover', 'focus', 'both'] },
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

export const ShowDelay: Story = {
  name: 'Show delay (500ms)',
  args: {
    content: 'Appears after 500ms',
    position: 'top',
    showDelay: 500,
    children: <Button label="Slow tooltip" size="md" />,
  },
};

export const HideDelay: Story = {
  name: 'Hide delay (300ms)',
  args: {
    content: 'Stays 300ms after mouse leaves',
    position: 'top',
    hideDelay: 300,
    children: <Button label="Sticky tooltip" size="md" />,
  },
};

export const AutoHide: Story = {
  name: 'Auto-hide after 2s',
  args: {
    content: 'This will disappear in 2 seconds',
    position: 'top',
    autoHide: 2000,
    children: <Button label="Auto-hide" size="md" />,
  },
};

export const MouseTrack: Story = {
  name: 'Mouse tracking',
  args: {
    content: 'Following your cursor',
    mouseTrack: true,
    children: <div style={{ padding: 24, border: '2px dashed var(--kreati-gray-300)', borderRadius: 8, cursor: 'default' }}>Move your mouse around this area</div>,
  },
};

export const MouseTrackWithOffset: Story = {
  name: 'Mouse tracking with offset',
  args: {
    content: 'Offset cursor tooltip',
    mouseTrack: true,
    mouseTrackLeft: 15,
    mouseTrackTop: 15,
    children: <div style={{ padding: 24, border: '2px dashed var(--kreati-gray-300)', borderRadius: 8, cursor: 'crosshair' }}>Custom offset from cursor</div>,
  },
};

export const EventHoverOnly: Story = {
  name: 'Event: hover only',
  args: {
    content: 'Only shows on hover, not focus',
    event: 'hover',
    children: <Button label="Hover only" size="md" />,
  },
};

export const EventFocusOnly: Story = {
  name: 'Event: focus only',
  args: {
    content: 'Only shows on focus (Tab to trigger)',
    event: 'focus',
    children: <Button label="Focus only (Tab here)" size="md" />,
  },
};

export const DisabledTooltip: Story = {
  name: 'Disabled tooltip',
  args: {
    content: 'You should not see this',
    disabled: true,
    children: <Button label="Tooltip disabled" size="md" />,
  },
};

export const OnDisabledButton: Story = {
  name: 'On disabled button (still shows)',
  args: {
    content: 'This action is not available',
    children: <Button label="Disabled button" size="md" disabled />,
  },
};

export const CustomTemplate: Story = {
  name: 'Custom template',
  args: {
    content: 'Template content',
    children: <Button label="Trigger" size="sm" />,
  },
  render: () => (
    <Tooltip
      content="Custom styled"
      template={(content) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Check size={14} color="#22c55e" />
          <span>{content}</span>
        </div>
      )}
    >
      <Button label="With template" size="md" />
    </Tooltip>
  ),
};

export const RichContent: Story = {
  name: 'Rich content',
  args: {
    content: (
      <div style={{ maxWidth: 180 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>Keyboard shortcut</strong>
        <span style={{ opacity: 0.8 }}>Press Ctrl+S to save your changes</span>
      </div>
    ),
    position: 'bottom',
    children: <Button label="Rich tooltip" size="md" />,
  },
};

export const AutoFlip: Story = {
  name: 'Auto-flip (scroll to edge)',
  args: {
    content: 'Tooltip',
    children: <Button label="Trigger" size="sm" />,
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 200, padding: '8px 60px' }}>
      <div>
        <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>This tooltip prefers top but will flip to bottom if near the top edge:</p>
        <Tooltip content="I auto-flip!" position="top">
          <Button label="Top (auto-flips)" size="sm" />
        </Tooltip>
      </div>
      <div>
        <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>This tooltip prefers bottom but will flip to top if near the bottom edge:</p>
        <Tooltip content="I auto-flip!" position="bottom">
          <Button label="Bottom (auto-flips)" size="sm" />
        </Tooltip>
      </div>
    </div>
  ),
};

export const ReactiveContent: Story = {
  name: 'Reactive content (updates while visible)',
  args: {
    content: 'Reactive',
    children: <Button label="Trigger" size="sm" />,
  },
  render: () => {
    const Demo = () => {
      const [count, setCount] = useState(0);
      return (
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Tooltip content={`Clicked ${count} times`} position="top" hideDelay={200}>
            <Button label={`Count: ${count}`} size="md" onClick={() => setCount((c) => c + 1)} />
          </Tooltip>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Hover and click — tooltip updates in real time</span>
        </div>
      );
    };
    return <Demo />;
  },
};
