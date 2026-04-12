import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Image } from '../../../../packages/react/src/components/Image';

const meta = {
  title: 'Components/Image',
  component: Image,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Image>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Basic image with width constraint. */
export const Default: Story = {
  args: { src: 'https://picsum.photos/400/260', alt: 'Landscape photo', width: 400 },
};

/** Click to open a fullscreen preview overlay. Press Escape to close. */
export const Preview: Story = {
  args: { src: 'https://picsum.photos/600/400', alt: 'Click to preview', width: 300, preview: true },
};

/** Rounded avatar style. */
export const Rounded: Story = {
  args: { src: 'https://picsum.photos/150/150', alt: 'Avatar', width: 120, height: 120, rounded: true },
};

/** Object-fit modes on a fixed container. */
export const ObjectFit: Story = {
  args: {} as any,
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      {(['cover', 'contain', 'fill', 'scale-down'] as const).map((fit) => (
        <div key={fit} style={{ textAlign: 'center' }}>
          <Image src="https://picsum.photos/400/260" alt={`${fit} example`} width={160} height={120} objectFit={fit} />
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{fit}</div>
        </div>
      ))}
    </div>
  ),
};

/** Broken URL shows alt text as fallback. */
export const BrokenImage: Story = {
  args: { src: 'https://invalid-url-that-will-fail.com/img.jpg', alt: 'Missing photo', width: 300, height: 200 },
};

/** Custom fallback content when image fails. */
export const CustomFallback: Story = {
  args: {
    src: 'https://invalid-url.com/x.jpg',
    alt: 'Custom fallback',
    width: 300,
    height: 200,
    fallback: (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', gap: 8 }}>
        <span style={{ fontSize: 32 }}>?</span>
        <span style={{ fontSize: 13, color: '#9ca3af' }}>Image not available</span>
      </div>
    ),
  },
};

/** Lazy loading — image loads when scrolled into view. */
export const LazyLoading: Story = {
  args: {} as any,
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 13, color: '#6b7280' }}>Scroll down to trigger lazy load</p>
      <div style={{ height: 400, overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
        <div style={{ height: 500 }} />
        <Image src="https://picsum.photos/300/200?random=lazy" alt="Lazy loaded" width={300} lazy />
      </div>
    </div>
  ),
};

/** Multiple images in a gallery layout with preview. */
export const Gallery: Story = {
  args: {} as any,
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, maxWidth: 500 }}>
      {Array.from({ length: 6 }, (_, i) => (
        <Image key={i} src={`https://picsum.photos/200/200?random=${i}`} alt={`Gallery image ${i + 1}`} width="100%" height={140} objectFit="cover" preview />
      ))}
    </div>
  ),
};
