import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Timeline } from '../../../../packages/react/src/components/Timeline';
import type { TimelineEvent } from '../../../../packages/react/src/components/Timeline';

const events: TimelineEvent[] = [
  { key: '1', content: <div><strong>Order placed</strong><p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>Your order has been received.</p></div>, opposite: <span style={{ fontSize: 12, color: '#9ca3af' }}>Jan 1, 2026</span> },
  { key: '2', content: <div><strong>Payment confirmed</strong><p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>Payment processed.</p></div>, opposite: <span style={{ fontSize: 12, color: '#9ca3af' }}>Jan 2, 2026</span>, color: '#10b981' },
  { key: '3', content: <div><strong>Shipped</strong><p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>Package on its way.</p></div>, opposite: <span style={{ fontSize: 12, color: '#9ca3af' }}>Jan 5, 2026</span>, color: '#3b82f6' },
  { key: '4', content: <div><strong>Delivered</strong><p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>Package delivered.</p></div>, opposite: <span style={{ fontSize: 12, color: '#9ca3af' }}>Jan 8, 2026</span>, color: '#10b981' },
];

const meta = {
  title: 'Components/Timeline',
  component: Timeline,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default — content on the right. */
export const Default: Story = { args: { events } };

/** Alternate — content alternates left/right with dates on the opposite side. */
export const Alternate: Story = { args: { events, alternate: true } };

/** Custom numbered markers. */
export const CustomMarker: Story = {
  args: {
    events: events.map((e, i) => ({
      ...e,
      marker: <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>{i + 1}</span>,
    })),
    alternate: true,
  },
};

/** Custom content template with card-style items. */
export const ContentTemplate: Story = {
  args: {} as any,
  render: () => (
    <Timeline
      events={events}
      contentTemplate={(event, index) => (
        <div style={{ padding: '8px 12px', background: index % 2 === 0 ? '#f0f9ff' : '#f0fdf4', borderRadius: 8, border: '1px solid #e5e7eb' }}>
          {event.content}
        </div>
      )}
    />
  ),
};
