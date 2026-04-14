import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Layout/Responsive',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Responsive utilities with breakpoint prefixes: sm: (640px), md: (768px), lg: (1024px), xl: (1280px). Resize the browser to see changes.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

const Cell = ({ children, color }: { children: React.ReactNode; color?: string }) => (
  <div style={{ background: color || 'var(--kreati-severity-primary)', color: 'var(--kreati-white)', padding: 'var(--kreati-space-3) var(--kreati-space-4)', borderRadius: 'var(--kreati-radius-sm)', fontFamily: 'var(--kreati-font-family)', fontSize: 'var(--kreati-font-size-xs)', textAlign: 'center' }}>
    {children}
  </div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontFamily: 'var(--kreati-font-family)', fontSize: 'var(--kreati-font-size-xs)', color: 'var(--kreati-gray-500)', margin: '0 0 var(--kreati-space-2) 0', fontWeight: 'var(--kreati-font-weight-semibold)' as string }}>
    {children}
  </p>
);

const Section = ({ children }: { children: React.ReactNode }) => (
  <div style={{ marginBottom: 'var(--kreati-space-8)' }}>{children}</div>
);

export const ResponsiveGrid: Story = {
  name: 'Responsive Grid Columns',
  render: () => (
    <Section>
      <Label>1 col (mobile) → 2 cols (sm) → 3 cols (md) → 4 cols (lg)</Label>
      <code style={{ fontFamily: 'monospace', fontSize: 'var(--kreati-font-size-xxs)', color: 'var(--kreati-gray-400)', display: 'block', marginBottom: 'var(--kreati-space-2)' }}>
        .k-grid .k-grid-cols-1 .k-sm:grid-cols-2 .k-md:grid-cols-3 .k-lg:grid-cols-4 .k-gap-3
      </code>
      <div className="k-grid k-grid-cols-1 k-sm:grid-cols-2 k-md:grid-cols-3 k-lg:grid-cols-4 k-gap-3">
        {Array.from({ length: 8 }, (_, i) => <Cell key={i}>Item {i + 1}</Cell>)}
      </div>
    </Section>
  ),
};

export const ResponsiveDirection: Story = {
  name: 'Responsive Flex Direction',
  render: () => (
    <Section>
      <Label>Column on mobile → Row on md</Label>
      <code style={{ fontFamily: 'monospace', fontSize: 'var(--kreati-font-size-xxs)', color: 'var(--kreati-gray-400)', display: 'block', marginBottom: 'var(--kreati-space-2)' }}>
        .k-flex .k-flex-col .k-md:flex-row .k-gap-3
      </code>
      <div className="k-flex k-flex-col k-md:flex-row k-gap-3">
        <Cell color="var(--kreati-severity-info)">Sidebar</Cell>
        <div className="k-grow">
          <Cell>Main Content (grows on desktop)</Cell>
        </div>
        <Cell color="var(--kreati-severity-info)">Aside</Cell>
      </div>
    </Section>
  ),
};

export const ResponsiveAlignment: Story = {
  name: 'Responsive Alignment',
  render: () => (
    <Section>
      <Label>Center on mobile → Space-between on md → End on lg</Label>
      <code style={{ fontFamily: 'monospace', fontSize: 'var(--kreati-font-size-xxs)', color: 'var(--kreati-gray-400)', display: 'block', marginBottom: 'var(--kreati-space-2)' }}>
        .k-flex .k-justify-center .k-md:justify-between .k-lg:justify-end .k-gap-2
      </code>
      <div className="k-flex k-justify-center k-md:justify-between k-lg:justify-end k-gap-2" style={{ background: 'var(--kreati-gray-50)', padding: 'var(--kreati-space-3)', borderRadius: 'var(--kreati-radius-sm)' }}>
        <Cell>A</Cell><Cell>B</Cell><Cell>C</Cell>
      </div>
    </Section>
  ),
};

export const ResponsiveGap: Story = {
  name: 'Responsive Gap',
  render: () => (
    <Section>
      <Label>Small gap on mobile → Larger gap on bigger screens</Label>
      <code style={{ fontFamily: 'monospace', fontSize: 'var(--kreati-font-size-xxs)', color: 'var(--kreati-gray-400)', display: 'block', marginBottom: 'var(--kreati-space-2)' }}>
        .k-grid .k-grid-cols-3 .k-gap-1 .k-sm:gap-2 .k-md:gap-4 .k-lg:gap-8
      </code>
      <div className="k-grid k-grid-cols-3 k-gap-1 k-sm:gap-2 k-md:gap-4 k-lg:gap-8">
        {Array.from({ length: 6 }, (_, i) => <Cell key={i}>{i + 1}</Cell>)}
      </div>
    </Section>
  ),
};

export const CardLayout: Story = {
  name: 'Real World: Card Layout',
  render: () => (
    <Section>
      <Label>Responsive card grid with Kreati components pattern</Label>
      <div className="k-grid k-grid-cols-1 k-sm:grid-cols-2 k-lg:grid-cols-3 k-gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} style={{ background: 'var(--kreati-white)', border: '1px solid var(--kreati-gray-200)', borderRadius: 'var(--kreati-radius-lg)', overflow: 'hidden', fontFamily: 'var(--kreati-font-family)' }}>
            <div style={{ background: 'var(--kreati-gray-100)', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--kreati-gray-400)', fontSize: 'var(--kreati-font-size-sm)' }}>
              Image {i + 1}
            </div>
            <div style={{ padding: 'var(--kreati-space-4)' }}>
              <div style={{ fontWeight: 'var(--kreati-font-weight-semibold)' as string, marginBottom: 'var(--kreati-space-1)' }}>Card Title {i + 1}</div>
              <div style={{ fontSize: 'var(--kreati-font-size-sm)', color: 'var(--kreati-gray-500)' }}>Description text for this card item.</div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  ),
};
