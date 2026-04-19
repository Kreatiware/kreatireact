import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Rating } from '../../../../packages/react/src/components/Rating';
import { HEART_PATH } from '../../../../packages/react/src/components/iconPaths';

const meta = {
  title: 'Components/Rating',
  component: Rating,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Rating>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Basic 5-star rating with label. */
export const Default: Story = {
  args: { label: 'Rating', defaultValue: 3 },
};

/** Half-star support with controlled value. */
export const HalfStars: Story = {
  args: {} as any,
  render: () => {
    const [val, setVal] = useState(3.5);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        <Rating label="Score" value={val} onChange={setVal} allowHalf />
        <span style={{ fontSize: 14, color: '#6b7280' }}>Value: {val}</span>
      </div>
    );
  },
};

/** Read-only and disabled states. */
export const ReadOnlyDisabled: Story = {
  args: {} as any,
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Rating label="Read only" value={4} readOnly />
      <Rating label="Read only half" value={3.5} readOnly allowHalf />
      <Rating label="Disabled" value={2} disabled />
    </div>
  ),
};

/** All sizes. */
export const Sizes: Story = {
  args: {} as any,
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <Rating key={s} label={s.toUpperCase()} defaultValue={3} size={s} />
      ))}
    </div>
  ),
};

/** Validation states with FieldWrapper. */
export const Validation: Story = {
  args: {} as any,
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Rating label="Required" required error="Please provide a rating" />
      <Rating label="Success" defaultValue={4} success helperText="Thanks for your feedback" />
      <Rating label="With helper" defaultValue={3} helperText="Rate from 1 to 5" helperSeverity="info" />
    </div>
  ),
};

/** Cancel button and custom color/icon. */
export const CustomAppearance: Story = {
  args: {} as any,
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Rating label="With cancel" defaultValue={3} showCancel />
      <Rating label="Custom color" defaultValue={4} color="#ef4444" />
      <Rating
        label="Hearts"
        defaultValue={3}
        color="#ec4899"
        icon={<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={HEART_PATH} /></svg>}
      />
      <Rating label="10 stars" count={10} defaultValue={7} size="sm" />
    </div>
  ),
};

export const CustomIconHalf: Story = {
  name: 'Custom Icon + Allow Half',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Rating
        label="Hearts (half)"
        allowHalf
        defaultValue={3.5}
        size="lg"
        color="#ef4444"
        icon={
          <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
            <path d={HEART_PATH} />
          </svg>
        }
      />
      <Rating
        label="Hearts (half, read-only)"
        allowHalf
        value={2.5}
        readOnly
        size="md"
        color="#ef4444"
        icon={
          <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
            <path d={HEART_PATH} />
          </svg>
        }
      />
    </div>
  ),
};
