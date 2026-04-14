import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Layout/Gap',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Gap utilities using Kreati spacing variables. Supports gap, gap-x (column-gap), and gap-y (row-gap).',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

const Cell = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: 'var(--kreati-severity-primary)', color: 'var(--kreati-white)', padding: 'var(--kreati-space-3) var(--kreati-space-4)', borderRadius: 'var(--kreati-radius-sm)', fontFamily: 'var(--kreati-font-family)', fontSize: 'var(--kreati-font-size-xs)', textAlign: 'center' }}>
    {children}
  </div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontFamily: 'var(--kreati-font-family)', fontSize: 'var(--kreati-font-size-xs)', color: 'var(--kreati-gray-500)', margin: '0 0 var(--kreati-space-2) 0', fontWeight: 'var(--kreati-font-weight-semibold)' as string }}>
    {children}
  </p>
);

const Section = ({ children }: { children: React.ReactNode }) => (
  <div style={{ marginBottom: 'var(--kreati-space-6)' }}>{children}</div>
);

export const GapScale: Story = {
  name: 'Gap Scale',
  render: () => (
    <div>
      {[0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16].map((g) => (
        <Section key={g}>
          <Label>.k-gap-{g} (--kreati-space-{g})</Label>
          <div className={`k-flex k-gap-${g}`}>
            <Cell>A</Cell><Cell>B</Cell><Cell>C</Cell><Cell>D</Cell>
          </div>
        </Section>
      ))}
    </div>
  ),
};

export const GapXY: Story = {
  name: 'Column & Row Gap',
  render: () => (
    <div>
      <Section>
        <Label>.k-gap-x-8 .k-gap-y-2 (wide columns, tight rows)</Label>
        <div className="k-grid k-grid-cols-3 k-gap-x-8 k-gap-y-2">
          {Array.from({ length: 9 }, (_, i) => <Cell key={i}>{i + 1}</Cell>)}
        </div>
      </Section>
      <Section>
        <Label>.k-gap-x-1 .k-gap-y-6 (tight columns, wide rows)</Label>
        <div className="k-grid k-grid-cols-3 k-gap-x-1 k-gap-y-6">
          {Array.from({ length: 9 }, (_, i) => <Cell key={i}>{i + 1}</Cell>)}
        </div>
      </Section>
    </div>
  ),
};
