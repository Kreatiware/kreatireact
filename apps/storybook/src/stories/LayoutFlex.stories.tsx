import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Layout/Flex',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Flexbox utility classes for direction, wrap, justify, align, grow/shrink.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

const Cell = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: 'var(--kreati-severity-primary)', color: 'var(--kreati-white)', padding: 'var(--kreati-space-3) var(--kreati-space-4)', borderRadius: 'var(--kreati-radius-sm)', fontFamily: 'var(--kreati-font-family)', fontSize: 'var(--kreati-font-size-sm)', textAlign: 'center' }}>
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

export const Direction: Story = {
  render: () => (
    <div>
      <Section>
        <Label>.k-flex .k-flex-row (default)</Label>
        <div className="k-flex k-flex-row k-gap-2">
          <Cell>1</Cell><Cell>2</Cell><Cell>3</Cell>
        </div>
      </Section>
      <Section>
        <Label>.k-flex .k-flex-row-reverse</Label>
        <div className="k-flex k-flex-row-reverse k-gap-2">
          <Cell>1</Cell><Cell>2</Cell><Cell>3</Cell>
        </div>
      </Section>
      <Section>
        <Label>.k-flex .k-flex-col</Label>
        <div className="k-flex k-flex-col k-gap-2" style={{ maxWidth: '200px' }}>
          <Cell>1</Cell><Cell>2</Cell><Cell>3</Cell>
        </div>
      </Section>
    </div>
  ),
};

export const JustifyContent: Story = {
  render: () => (
    <div>
      {(['start', 'end', 'center', 'between', 'around', 'evenly'] as const).map((j) => (
        <Section key={j}>
          <Label>.k-flex .k-justify-{j}</Label>
          <div className={`k-flex k-justify-${j} k-gap-2`} style={{ background: 'var(--kreati-gray-50)', padding: 'var(--kreati-space-2)', borderRadius: 'var(--kreati-radius-sm)' }}>
            <Cell>A</Cell><Cell>B</Cell><Cell>C</Cell>
          </div>
        </Section>
      ))}
    </div>
  ),
};

export const AlignItems: Story = {
  render: () => (
    <div>
      {(['start', 'end', 'center', 'stretch', 'baseline'] as const).map((a) => (
        <Section key={a}>
          <Label>.k-flex .k-items-{a}</Label>
          <div className={`k-flex k-items-${a} k-gap-2`} style={{ background: 'var(--kreati-gray-50)', padding: 'var(--kreati-space-2)', borderRadius: 'var(--kreati-radius-sm)', minHeight: '80px' }}>
            <Cell>Short</Cell>
            <div style={{ background: 'var(--kreati-severity-primary)', color: 'var(--kreati-white)', padding: 'var(--kreati-space-6) var(--kreati-space-4)', borderRadius: 'var(--kreati-radius-sm)', fontFamily: 'var(--kreati-font-family)', fontSize: 'var(--kreati-font-size-sm)' }}>Tall</div>
            <Cell>Short</Cell>
          </div>
        </Section>
      ))}
    </div>
  ),
};

export const WrapAndGrow: Story = {
  render: () => (
    <div>
      <Section>
        <Label>.k-flex .k-flex-wrap .k-gap-2 (resize to see wrap)</Label>
        <div className="k-flex k-flex-wrap k-gap-2">
          {Array.from({ length: 8 }, (_, i) => <Cell key={i}>Item {i + 1}</Cell>)}
        </div>
      </Section>
      <Section>
        <Label>.k-flex-1 (equal width children)</Label>
        <div className="k-flex k-gap-2">
          <div className="k-flex-1"><Cell>flex-1</Cell></div>
          <div className="k-flex-1"><Cell>flex-1</Cell></div>
          <div className="k-flex-1"><Cell>flex-1</Cell></div>
        </div>
      </Section>
      <Section>
        <Label>.k-grow + .k-shrink-0</Label>
        <div className="k-flex k-gap-2">
          <div className="k-shrink-0"><Cell>Fixed</Cell></div>
          <div className="k-grow"><Cell>Grows to fill</Cell></div>
          <div className="k-shrink-0"><Cell>Fixed</Cell></div>
        </div>
      </Section>
    </div>
  ),
};
