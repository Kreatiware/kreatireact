import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Card } from '../../../../packages/react/src/components/Card';
import { Button } from '../../../../packages/react/src/components/Button';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible content container with optional title, subtitle, image, header, footer, and body slots. Supports default, outlined, and elevated variants.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Basic card with title and content. */
export const Default: Story = {
  args: {
    title: 'Card Title',
    subtitle: 'Supporting description text',
    children: <p style={{ margin: 0 }}>This is the card body content. It can contain any React elements.</p>,
    style: { width: 320 },
  },
};

/** Card with a string image source. */
export const WithImage: Story = {
  args: {
    title: 'Mountain View',
    subtitle: 'Nature photography',
    image: 'https://picsum.photos/seed/kreati/400/200',
    imageAlt: 'Mountain landscape',
    children: <p style={{ margin: 0 }}>A beautiful mountain landscape captured at sunrise.</p>,
    footer: (
      <div style={{ display: 'flex', gap: 8 }}>
        <Button label="View" size="sm" />
        <Button label="Share" size="sm" buttonType="outlined" />
      </div>
    ),
    style: { width: 320 },
  },
};

/** Card with a ReactNode as image (e.g. gradient placeholder). */
export const WithCustomImage: Story = {
  render: () => (
    <Card
      title="Custom Visual"
      subtitle="ReactNode in image slot"
      image={
        <div style={{ height: 160, background: 'linear-gradient(135deg, var(--kreati-primary-500), var(--kreati-primary-300, #5bb8d4))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 24, fontWeight: 700 }}>
          Kreati
        </div>
      }
      style={{ width: 320 }}
    >
      <p style={{ margin: 0 }}>The image slot accepts any ReactNode.</p>
    </Card>
  ),
};

/** Card with header slot instead of image. */
export const WithHeader: Story = {
  render: () => (
    <Card
      title="Dashboard"
      header={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600 }}>Analytics</span>
          <Button label="Refresh" size="sm" buttonType="text" />
        </div>
      }
      footer={<span style={{ fontSize: 12, color: 'var(--kreati-gray-400)' }}>Last updated: 5 min ago</span>}
      style={{ width: 360 }}
    >
      <p style={{ margin: 0 }}>Header slot replaces the image zone when no image is provided.</p>
    </Card>
  ),
};

/** Card with footer actions. */
export const WithFooter: Story = {
  args: {
    title: 'Confirm Action',
    children: <p style={{ margin: 0 }}>Are you sure you want to proceed with this operation?</p>,
    footer: (
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button label="Cancel" buttonType="text" size="sm" />
        <Button label="Confirm" size="sm" />
      </div>
    ),
    style: { width: 340 },
  },
};

/** Outlined variant. */
export const Outlined: Story = {
  args: {
    title: 'Outlined Card',
    subtitle: 'Stronger border style',
    variant: 'outlined',
    children: <p style={{ margin: 0 }}>This card uses the outlined variant with a 2px border.</p>,
    style: { width: 320 },
  },
};

/** Elevated variant with shadow. */
export const Elevated: Story = {
  args: {
    title: 'Elevated Card',
    subtitle: 'Shadow instead of border',
    variant: 'elevated',
    children: <p style={{ margin: 0 }}>This card uses the elevated variant with a box shadow.</p>,
    style: { width: 320 },
  },
};

/** All three variants side by side. */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      {(['default', 'outlined', 'elevated'] as const).map((v) => (
        <Card key={v} title={v.charAt(0).toUpperCase() + v.slice(1)} variant={v} style={{ width: 220 }}>
          <p style={{ margin: 0, fontSize: 14 }}>Variant: {v}</p>
        </Card>
      ))}
    </div>
  ),
};

/** Minimal card — title only. */
export const TitleOnly: Story = {
  args: {
    title: 'Simple Card',
    style: { width: 280 },
  },
};

/** Card with only children — no title. */
export const BodyOnly: Story = {
  args: {
    children: <p style={{ margin: 0 }}>A card with just body content, no title or subtitle.</p>,
    style: { width: 280 },
  },
};
