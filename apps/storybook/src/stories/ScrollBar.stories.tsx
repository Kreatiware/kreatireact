import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ScrollBar } from '../../../../packages/react/src/components/ScrollBar';

const LongContent = () => (
  <div style={{ fontFamily: 'sans-serif', fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
    {Array.from({ length: 30 }, (_, i) => (
      <p key={i} style={{ margin: '0 0 8px' }}>
        Line {i + 1} — Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor.
      </p>
    ))}
  </div>
);

const WideContent = () => (
  <div style={{ fontFamily: 'sans-serif', fontSize: 14, color: '#374151', whiteSpace: 'nowrap' }}>
    {Array.from({ length: 15 }, (_, i) => (
      <p key={i} style={{ margin: '0 0 8px' }}>
        Line {i + 1} — This is a very long line that extends far beyond the container to show horizontal scrolling behavior in the ScrollBar component.
      </p>
    ))}
  </div>
);

const GridContent = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 150px)', gap: 8, padding: 4 }}>
    {Array.from({ length: 80 }, (_, i) => (
      <div key={i} style={{ height: 60, borderRadius: 4, background: '#deeff7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#374151' }}>
        Cell {i + 1}
      </div>
    ))}
  </div>
);

const boxStyle: React.CSSProperties = { width: 350, border: '1px solid #e5e7eb', borderRadius: 6, padding: 12 };

const meta = {
  title: 'Components/ScrollBar',
  component: ScrollBar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Scrollable container with styled scrollbar. No arrows by default — just the thumb and track bars. Variants: `kreati` (thin, auto-hiding — default), `visible` (always shown), `native` (browser default). Supports custom colors, gradients, sizes, and optional arrows.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['kreati', 'visible', 'native'] },
    orientation: { control: 'select', options: ['vertical', 'horizontal', 'both'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    color: { control: 'color' },
    trackColor: { control: 'color' },
    arrows: { control: 'boolean' },
    thumbRadius: { control: 'text' },
  },
} satisfies Meta<typeof ScrollBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    maxHeight: '200px',
    style: boxStyle,
    children: undefined as unknown as React.ReactNode,
  },
  render: (args) => (
    <ScrollBar {...args}>
      <LongContent />
    </ScrollBar>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24 }}>
      {(['kreati', 'visible', 'native'] as const).map((v) => (
        <ScrollBar key={v} variant={v} maxHeight="200px" style={{ ...boxStyle, width: 280 }}>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>{v}</div>
          <LongContent />
        </ScrollBar>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24 }}>
      {(['sm', 'md', 'lg'] as const).map((s) => (
        <ScrollBar key={s} variant="visible" size={s} maxHeight="200px" style={{ ...boxStyle, width: 280 }}>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>Size: {s}</div>
          <LongContent />
        </ScrollBar>
      ))}
    </div>
  ),
};

export const CustomColors: Story = {
  render: () => (
    <ScrollBar variant="visible" color="#0f78a5" trackColor="#deeff7" size="md" maxHeight="200px" style={boxStyle}>
      <LongContent />
    </ScrollBar>
  ),
};

export const WithGradient: Story = {
  name: 'Gradient (vertical)',
  render: () => (
    <ScrollBar variant="visible" gradient={{ from: '#0f78a5', to: '#ffdb4f' }} size="lg" maxHeight="200px" style={boxStyle}>
      <LongContent />
    </ScrollBar>
  ),
};

export const GradientDiagonal: Story = {
  name: 'Gradient (diagonal 135°)',
  render: () => (
    <ScrollBar variant="visible" gradient={{ from: '#a855f7', to: '#0f78a5', angle: 135 }} size="lg" maxHeight="200px" style={boxStyle}>
      <LongContent />
    </ScrollBar>
  ),
};

export const CustomRadius: Story = {
  name: 'Custom thumb radius',
  render: () => (
    <div style={{ display: 'flex', gap: 24 }}>
      <ScrollBar variant="visible" thumbRadius="0px" size="md" maxHeight="200px" style={{ ...boxStyle, width: 280 }}>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>radius: 0px</div>
        <LongContent />
      </ScrollBar>
      <ScrollBar variant="visible" thumbRadius="4px" size="md" maxHeight="200px" style={{ ...boxStyle, width: 280 }}>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>radius: 4px</div>
        <LongContent />
      </ScrollBar>
    </div>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <ScrollBar orientation="horizontal" variant="visible" maxWidth="400px" maxHeight="250px" style={{ ...boxStyle, width: 'auto' }}>
      <WideContent />
    </ScrollBar>
  ),
};

export const BothDirections: Story = {
  name: 'Both directions',
  render: () => (
    <ScrollBar orientation="both" variant="visible" size="md" maxHeight="250px" maxWidth="400px" style={{ ...boxStyle, width: 'auto' }}>
      <GridContent />
    </ScrollBar>
  ),
};

export const WithArrows: Story = {
  name: 'With arrows (optional)',
  render: () => (
    <ScrollBar variant="visible" arrows size="lg" trackColor="#f3f4f6" maxHeight="200px" style={boxStyle}>
      <LongContent />
    </ScrollBar>
  ),
};

export const TrackGradient: Story = {
  name: 'Track gradient',
  render: () => (
    <ScrollBar
      variant="visible"
      size="lg"
      trackGradient={{ from: '#deeff7', to: '#fff7d7' }}
      color="#0f78a5"
      maxHeight="200px"
      style={boxStyle}
    >
      <LongContent />
    </ScrollBar>
  ),
};

export const TrackTemplate: Story = {
  name: 'Track template (custom content)',
  render: () => (
    <ScrollBar
      variant="visible"
      size="lg"
      trackColor="#f3f4f6"
      color="#0f78a5"
      maxHeight="200px"
      style={boxStyle}
      trackTemplate={
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', padding: '4px 0' }}>
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} style={{ width: '100%', height: 1, backgroundColor: '#d1d5db' }} />
          ))}
        </div>
      }
    >
      <LongContent />
    </ScrollBar>
  ),
};

export const ThumbIcon: Story = {
  name: 'Custom thumb icon',
  render: () => (
    <div style={{ display: 'flex', gap: 24 }}>
      <ScrollBar
        variant="visible"
        size="sm"
        trackColor="#e5e7eb"
        maxHeight="200px"
        style={{ ...boxStyle, width: 280 }}
        thumbIcon={
          <svg viewBox="0 0 20 24" width={20} height={24} fill="#0f78a5">
            <circle cx="6" cy="8" r="1.5" />
            <circle cx="6" cy="12" r="1.5" />
            <circle cx="6" cy="16" r="1.5" />
            <circle cx="14" cy="8" r="1.5" />
            <circle cx="14" cy="12" r="1.5" />
            <circle cx="14" cy="16" r="1.5" />
          </svg>
        }
      >
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>Grip dots (wide)</div>
        <LongContent />
      </ScrollBar>
      <ScrollBar
        variant="visible"
        size="md"
        trackColor="#e5e7eb"
        maxHeight="200px"
        style={{ ...boxStyle, width: 280 }}
        thumbIcon={
          <svg viewBox="0 0 24 16" width={24} height={16} fill="none" stroke="#0f78a5" strokeWidth={2} strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="10" x2="20" y2="10" />
          </svg>
        }
      >
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>Handle lines (wide)</div>
        <LongContent />
      </ScrollBar>
      <ScrollBar
        variant="visible"
        size="sm"
        trackColor="#e5e7eb"
        arrows
        maxHeight="200px"
        style={{ ...boxStyle, width: 280 }}
        thumbIcon={
          <svg viewBox="0 0 20 24" width={20} height={24} fill="#0f78a5">
            <circle cx="6" cy="8" r="1.5" />
            <circle cx="6" cy="12" r="1.5" />
            <circle cx="6" cy="16" r="1.5" />
            <circle cx="14" cy="8" r="1.5" />
            <circle cx="14" cy="12" r="1.5" />
            <circle cx="14" cy="16" r="1.5" />
          </svg>
        }
      >
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>Grip dots + arrows</div>
        <LongContent />
      </ScrollBar>
      <ScrollBar
        variant="visible"
        size="md"
        trackColor="#e5e7eb"
        arrows
        maxHeight="200px"
        style={{ ...boxStyle, width: 280 }}
        thumbIcon={
          <svg viewBox="0 0 24 16" width={24} height={16} fill="none" stroke="#0f78a5" strokeWidth={2} strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="10" x2="20" y2="10" />
          </svg>
        }
      >
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>Handle lines + arrows</div>
        <LongContent />
      </ScrollBar>
    </div>
  ),
};
