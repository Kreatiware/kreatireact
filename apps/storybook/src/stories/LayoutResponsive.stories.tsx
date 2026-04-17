import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Layout/Responsive',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Responsive utilities with breakpoint prefixes: sm: (40rem), md: (48rem), lg: (64rem), xl: (80rem). Resize the browser to see changes.',
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

export const ResponsiveOrder: Story = {
  name: 'Responsive Order',
  render: () => (
    <div style={{ marginBottom: 'var(--kreati-space-8)' }}>
      <Label>Sidebar last on mobile, first on md+ (.k-order-last .md:k-order-first)</Label>
      <div className="k-flex k-flex-col md:k-flex-row k-gap-3">
        <div className="k-order-last md:k-order-first" style={{ background: 'var(--kreati-gray-100)', padding: 'var(--kreati-space-4)', borderRadius: 'var(--kreati-radius-sm)', minWidth: 150, fontFamily: 'var(--kreati-font-family)', fontSize: 'var(--kreati-font-size-xs)' }}>
          Sidebar (order-last on mobile, order-first on md+)
        </div>
        <div style={{ flex: 1, background: 'var(--kreati-severity-primary-light)', padding: 'var(--kreati-space-4)', borderRadius: 'var(--kreati-radius-sm)', fontFamily: 'var(--kreati-font-family)', fontSize: 'var(--kreati-font-size-xs)' }}>
          Main Content
        </div>
      </div>
    </div>
  ),
};

export const ResponsiveGridRows: Story = {
  name: 'Responsive Grid Rows',
  render: () => (
    <div>
      <Label>1 col on mobile, 2x3 bento on md+ (.k-grid-cols-1 .md:k-grid-cols-2 .md:k-grid-rows-3)</Label>
      <div className="k-grid k-grid-cols-1 md:k-grid-cols-2 md:k-grid-rows-3 k-gap-3" style={{ height: 300 }}>
        <Cell color="var(--kreati-severity-primary)">1</Cell>
        <div className="md:k-row-span-2" style={{ background: 'var(--kreati-severity-accent)', color: 'var(--kreati-severity-accent-text)', padding: 'var(--kreati-space-3)', borderRadius: 'var(--kreati-radius-sm)', fontFamily: 'var(--kreati-font-family)', fontSize: 'var(--kreati-font-size-xs)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Featured (row-span-2 on md+)
        </div>
        <Cell color="var(--kreati-severity-info)">3</Cell>
        <Cell color="var(--kreati-severity-success)">4</Cell>
      </div>
    </div>
  ),
};

export const BreakpointParity: Story = {
  name: 'Breakpoint Parity',
  render: () => {
    const features = [
      'flex, inline-flex, direction, wrap, justify, align',
      'grid, grid-cols 1-12, grid-rows 1-6',
      'col-span 1-12+full, row-span 1-6+full',
      'order-first, order-last, order-none',
      'gap 0-8',
      'text sm-5xl, text-left/center/right',
    ];
    return (
      <div>
        <Label>All 4 breakpoints (sm, md, lg, xl) have identical feature coverage:</Label>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--kreati-font-family)', fontSize: 'var(--kreati-font-size-xs)' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 'var(--kreati-space-2)', borderBottom: '2px solid var(--kreati-gray-200)' }}>Feature</th>
              {['sm', 'md', 'lg', 'xl'].map((bp) => (
                <th key={bp} style={{ textAlign: 'center', padding: 'var(--kreati-space-2)', borderBottom: '2px solid var(--kreati-gray-200)' }}>{bp}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((f) => (
              <tr key={f}>
                <td style={{ padding: 'var(--kreati-space-2)', borderBottom: '1px solid var(--kreati-gray-100)' }}>{f}</td>
                {['sm', 'md', 'lg', 'xl'].map((bp) => (
                  <td key={bp} style={{ textAlign: 'center', padding: 'var(--kreati-space-2)', borderBottom: '1px solid var(--kreati-gray-100)', color: 'var(--kreati-severity-success)' }}>Yes</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
};
