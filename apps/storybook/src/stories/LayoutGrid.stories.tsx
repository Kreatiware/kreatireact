import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Layout/Grid',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'CSS Grid utility classes. Columns 1-12, spans, row spans, col start/end, auto flow.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

const Cell = ({ children, span }: { children: React.ReactNode; span?: string }) => (
  <div className={span} style={{ background: 'var(--kreati-severity-primary)', color: 'var(--kreati-white)', padding: 'var(--kreati-space-3)', borderRadius: 'var(--kreati-radius-sm)', fontFamily: 'var(--kreati-font-family)', fontSize: 'var(--kreati-font-size-xs)', textAlign: 'center' }}>
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

export const Columns: Story = {
  render: () => (
    <div>
      {[1, 2, 3, 4, 5, 6].map((cols) => (
        <Section key={cols}>
          <Label>.k-grid .k-grid-cols-{cols} .k-gap-2</Label>
          <div className={`k-grid k-grid-cols-${cols} k-gap-2`}>
            {Array.from({ length: cols }, (_, i) => <Cell key={i}>{i + 1}</Cell>)}
          </div>
        </Section>
      ))}
    </div>
  ),
};

export const TwelveColumnGrid: Story = {
  name: '12-Column Grid',
  render: () => (
    <div>
      <Section>
        <Label>.k-grid .k-grid-cols-12 .k-gap-1</Label>
        <div className="k-grid k-grid-cols-12 k-gap-1">
          {Array.from({ length: 12 }, (_, i) => <Cell key={i}>{i + 1}</Cell>)}
        </div>
      </Section>
      <Section>
        <Label>Spans: 4 + 8, 6 + 6, 3 + 9</Label>
        <div className="k-grid k-grid-cols-12 k-gap-2" style={{ marginBottom: 'var(--kreati-space-2)' }}>
          <Cell span="k-col-span-4">span-4</Cell>
          <Cell span="k-col-span-8">span-8</Cell>
        </div>
        <div className="k-grid k-grid-cols-12 k-gap-2" style={{ marginBottom: 'var(--kreati-space-2)' }}>
          <Cell span="k-col-span-6">span-6</Cell>
          <Cell span="k-col-span-6">span-6</Cell>
        </div>
        <div className="k-grid k-grid-cols-12 k-gap-2">
          <Cell span="k-col-span-3">span-3</Cell>
          <Cell span="k-col-span-9">span-9</Cell>
        </div>
      </Section>
    </div>
  ),
};

export const ColumnStartEnd: Story = {
  render: () => (
    <div>
      <Section>
        <Label>.k-col-start-3 .k-col-end-11 (offset columns)</Label>
        <div className="k-grid k-grid-cols-12 k-gap-1">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} style={{ background: 'var(--kreati-gray-100)', padding: 'var(--kreati-space-1)', borderRadius: 'var(--kreati-radius-sm)', textAlign: 'center', fontFamily: 'var(--kreati-font-family)', fontSize: 'var(--kreati-font-size-xxs)', color: 'var(--kreati-gray-400)' }}>{i + 1}</div>
          ))}
        </div>
        <div className="k-grid k-grid-cols-12 k-gap-1" style={{ marginTop: 'var(--kreati-space-1)' }}>
          <div className="k-col-start-3 k-col-end-11" style={{ background: 'var(--kreati-severity-primary)', color: 'var(--kreati-white)', padding: 'var(--kreati-space-3)', borderRadius: 'var(--kreati-radius-sm)', fontFamily: 'var(--kreati-font-family)', fontSize: 'var(--kreati-font-size-xs)', textAlign: 'center' }}>
            col-start-3 col-end-11
          </div>
        </div>
      </Section>
    </div>
  ),
};

export const RowSpans: Story = {
  render: () => (
    <Section>
      <Label>.k-row-span-2 (sidebar pattern)</Label>
      <div className="k-grid k-grid-cols-4 k-gap-2" style={{ gridAutoRows: 'minmax(60px, auto)' }}>
        <div className="k-row-span-2" style={{ background: 'var(--kreati-severity-info)', color: 'var(--kreati-white)', padding: 'var(--kreati-space-3)', borderRadius: 'var(--kreati-radius-sm)', fontFamily: 'var(--kreati-font-family)', fontSize: 'var(--kreati-font-size-xs)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Sidebar (row-span-2)
        </div>
        <Cell span="k-col-span-3">Content 1</Cell>
        <Cell span="k-col-span-3">Content 2</Cell>
      </div>
    </Section>
  ),
};

export const AutoFlow: Story = {
  render: () => (
    <div>
      <Section>
        <Label>.k-grid-flow-col (items flow into columns)</Label>
        <div className="k-grid k-gap-2" style={{ gridTemplateRows: 'repeat(3, 1fr)' }}>
          <div className="k-grid-flow-col k-gap-2" style={{ display: 'grid', gridTemplateRows: 'repeat(3, 1fr)', gridAutoFlow: 'column', gridAutoColumns: 'minmax(0, 1fr)' }}>
            {Array.from({ length: 6 }, (_, i) => <Cell key={i}>{i + 1}</Cell>)}
          </div>
        </div>
      </Section>
      <Section>
        <Label>.k-grid-flow-dense (fills gaps)</Label>
        <div className="k-grid k-grid-cols-3 k-grid-flow-dense k-gap-2">
          <Cell span="k-col-span-2">Span 2</Cell>
          <Cell>1</Cell>
          <Cell>2</Cell>
          <Cell span="k-col-span-2">Span 2</Cell>
          <Cell>3</Cell>
        </div>
      </Section>
    </div>
  ),
};
