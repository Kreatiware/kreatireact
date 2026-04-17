import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Carousel } from '@kreatiware/react';

const meta = {
  title: 'Components/Carousel',
  component: Carousel,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof Carousel>;

const colors = ['#0f78a5', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#3b82f6', '#e6a817', '#d4603f'];

const makeSlide = (i: number, height = 220) => (
  <div style={{
    background: colors[i % colors.length],
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height,
    fontSize: 'var(--kreati-font-size-2xl)',
    fontWeight: 700,
    fontFamily: 'var(--kreati-font-family-display)',
    borderRadius: 'var(--kreati-radius-md)',
    width: '100%',
  }}>
    Slide {i + 1}
  </div>
);

const makeItems = (count: number, height = 220) =>
  Array.from({ length: count }, (_, i) => ({ key: `s-${i}`, content: makeSlide(i, height) }));

export const Default: Story = {
  args: { items: makeItems(5) },
};

export const MultipleVisible: Story = {
  args: {
    items: makeItems(8),
    visibleItems: 3,
    scrollStep: 1,
  },
};

export const Circular: Story = {
  args: {
    items: makeItems(5),
    circular: true,
  },
};

export const Autoplay: Story = {
  args: {
    items: makeItems(5),
    autoplay: 3000,
    circular: true,
  },
};

export const Vertical: Story = {
  args: {
    items: makeItems(5, 180),
    orientation: 'vertical',
    style: { height: 220 },
  },
};

export const FractionIndicator: Story = {
  args: {
    items: makeItems(6),
    indicatorType: 'fraction',
  },
};

export const NumberIndicator: Story = {
  args: {
    items: makeItems(6),
    indicatorType: 'numbers',
  },
};

export const NoIndicators: Story = {
  args: {
    items: makeItems(4),
    showIndicators: false,
  },
};

export const NoNavigation: Story = {
  args: {
    items: makeItems(4),
    showNavigation: false,
  },
};

export const CustomTemplate: Story = {
  args: {
    items: Array.from({ length: 6 }, (_, i) => ({ key: `card-${i}` })),
    visibleItems: 3,
    itemTemplate: (_item, index) => (
      <div style={{
        margin: '0 var(--kreati-space-2)',
        padding: 'var(--kreati-space-4)',
        background: 'var(--kreati-white)',
        border: '1px solid var(--kreati-gray-200)',
        borderRadius: 'var(--kreati-radius-md)',
        boxShadow: 'var(--kreati-shadow-sm)',
        textAlign: 'center',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 'var(--kreati-radius-full)',
          background: colors[index % colors.length],
          margin: '0 auto var(--kreati-space-3)',
        }} />
        <div style={{ fontWeight: 600, marginBottom: 'var(--kreati-space-1)' }}>Card {index + 1}</div>
        <div style={{ fontSize: 'var(--kreati-font-size-xs)', color: 'var(--kreati-gray-500)' }}>
          Description for item {index + 1}
        </div>
      </div>
    ),
  },
};
