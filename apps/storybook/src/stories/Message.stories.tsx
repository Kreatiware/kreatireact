import React, { useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Message } from '../../../../packages/react/src/components/Message';
import { MessageList } from '../../../../packages/react/src/components/MessageList';
import type { MessageListRef } from '../../../../packages/react/src/components/MessageList';
import { Button } from '../../../../packages/react/src/components/Button';

const meta = {
  title: 'Components/Message',
  component: Message,
  parameters: { layout: 'centered', docs: { description: { component: 'Inline feedback message with severity colors, icons, close button, auto-dismiss, border accent, and custom templates. Use MessageList for dynamic stacking.' } } },
  tags: ['autodocs'],
  decorators: [(Story: React.FC) => <div style={{ background: '#fff', padding: 24, borderRadius: 8, width: 500 }}><Story /></div>],
} satisfies Meta<typeof Message>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllSeverities: Story = {
  name: 'All Severities',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Message severity="primary" icon>Primary message</Message>
      <Message severity="secondary" icon>Secondary message</Message>
      <Message severity="success" icon>Success message</Message>
      <Message severity="info" icon>Info message</Message>
      <Message severity="warning" icon>Warning message</Message>
      <Message severity="help" icon>Help message</Message>
      <Message severity="danger" icon>Danger message</Message>
    </div>
  ),
};

export const WithBorderLeft: Story = {
  name: 'Border Left',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Message severity="success" icon borderPosition="left">Record saved successfully</Message>
      <Message severity="warning" icon borderPosition="left">Please review your input</Message>
      <Message severity="danger" icon borderPosition="left">An error occurred</Message>
    </div>
  ),
};

export const BorderPositions: Story = {
  name: 'Border Positions',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Message severity="info" icon borderPosition="left">Border left</Message>
      <Message severity="info" icon borderPosition="top">Border top</Message>
      <Message severity="info" icon borderPosition="right">Border right</Message>
      <Message severity="info" icon borderPosition="bottom">Border bottom</Message>
    </div>
  ),
};

export const Closable: Story = {
  name: 'Closable',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Message severity="info" icon closable>Click the X to close this message</Message>
      <Message severity="warning" icon closable borderPosition="left">Warning with close button</Message>
    </div>
  ),
};

export const AutoDismiss: Story = {
  name: 'Auto Dismiss (3s)',
  render: () => (
    <Message severity="success" icon sticky={false} life={3000}>This message will disappear in 3 seconds</Message>
  ),
};

export const CustomIcon: Story = {
  name: 'Custom Icon',
  render: () => (
    <Message
      severity="primary"
      icon={<span style={{ fontSize: 18 }}>{'\u{1F680}'}</span>}
      closable
    >
      Deployment started successfully
    </Message>
  ),
};

export const ContentTemplate: Story = {
  name: 'Content Template',
  render: () => (
    <Message
      severity="warning"
      borderPosition="left"
      contentTemplate={({ onClose }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
          <span style={{ fontSize: 24 }}>{'\u{26A0}\u{FE0F}'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>Subscription expiring</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Your plan expires in 3 days. Upgrade now to avoid interruption.</div>
          </div>
          <Button size="xs" severity="warning" onClick={onClose}>Upgrade</Button>
        </div>
      )}
    />
  ),
};

export const NoIcon: Story = {
  name: 'Without Icon',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Message severity="info">Simple info without icon</Message>
      <Message severity="success" closable>Success without icon, closable</Message>
    </div>
  ),
};

export const DynamicMessageList: Story = {
  name: 'MessageList — Dynamic',
  render: () => {
    const ref = useRef<MessageListRef>(null);
    let count = 0;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <MessageList ref={ref} />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button size="sm" severity="success" onClick={() => ref.current?.show({ severity: 'success', content: `Saved! (#${++count})`, icon: true, sticky: false, life: 4000 })}>Success</Button>
          <Button size="sm" severity="info" onClick={() => ref.current?.show({ severity: 'info', content: 'New update available', icon: true, closable: true, sticky: true })}>Info (sticky)</Button>
          <Button size="sm" severity="warning" onClick={() => ref.current?.show({ severity: 'warning', content: 'Check your connection', icon: true, borderPosition: 'left', sticky: false, life: 5000 })}>Warning</Button>
          <Button size="sm" severity="danger" onClick={() => ref.current?.show({ severity: 'danger', content: 'Something went wrong', icon: true, closable: true })}>Error</Button>
          <Button size="sm" severity="secondary" buttonType="outlined" onClick={() => ref.current?.clear()}>Clear all</Button>
        </div>
      </div>
    );
  },
};
