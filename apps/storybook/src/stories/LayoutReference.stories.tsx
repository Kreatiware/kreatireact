import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Layout/Class Reference',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Complete reference of all @kreatiware/layout CSS utility classes. All classes support responsive prefixes: k-sm:, k-md:, k-lg:, k-xl:',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--kreati-font-family)', fontSize: 'var(--kreati-font-size-sm)', marginBottom: 'var(--kreati-space-8)' };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: 'var(--kreati-space-2) var(--kreati-space-3)', borderBottom: '2px solid var(--kreati-gray-200)', color: 'var(--kreati-gray-700)', fontSize: 'var(--kreati-font-size-xs)' };
const tdStyle: React.CSSProperties = { padding: 'var(--kreati-space-1) var(--kreati-space-3)', borderBottom: '1px solid var(--kreati-gray-100)' };
const codeStyle: React.CSSProperties = { fontFamily: 'monospace', fontSize: 'var(--kreati-font-size-xs)', background: 'var(--kreati-gray-50)', padding: '2px 6px', borderRadius: 'var(--kreati-radius-sm)' };
const headingStyle: React.CSSProperties = { fontFamily: 'var(--kreati-font-family)', fontSize: 'var(--kreati-font-size-md)', fontWeight: 'var(--kreati-font-weight-bold)' as string, marginBottom: 'var(--kreati-space-3)', color: 'var(--kreati-gray-800)' };

const Table = ({ title, rows }: { title: string; rows: [string, string][] }) => (
  <div>
    <div style={headingStyle}>{title}</div>
    <table style={tableStyle}>
      <thead>
        <tr><th style={thStyle}>Class</th><th style={thStyle}>CSS</th></tr>
      </thead>
      <tbody>
        {rows.map(([cls, css]) => (
          <tr key={cls}>
            <td style={tdStyle}><code style={codeStyle}>.{cls}</code></td>
            <td style={tdStyle}><code style={{ ...codeStyle, background: 'transparent', color: 'var(--kreati-gray-500)' }}>{css}</code></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const FlexReference: Story = {
  name: 'Flex',
  render: () => (
    <div>
      <Table title="Display" rows={[
        ['k-flex', 'display: flex'],
        ['k-inline-flex', 'display: inline-flex'],
      ]} />
      <Table title="Direction" rows={[
        ['k-flex-row', 'flex-direction: row'],
        ['k-flex-row-reverse', 'flex-direction: row-reverse'],
        ['k-flex-col', 'flex-direction: column'],
        ['k-flex-col-reverse', 'flex-direction: column-reverse'],
      ]} />
      <Table title="Wrap" rows={[
        ['k-flex-wrap', 'flex-wrap: wrap'],
        ['k-flex-nowrap', 'flex-wrap: nowrap'],
        ['k-flex-wrap-reverse', 'flex-wrap: wrap-reverse'],
      ]} />
      <Table title="Justify Content" rows={[
        ['k-justify-start', 'justify-content: flex-start'],
        ['k-justify-end', 'justify-content: flex-end'],
        ['k-justify-center', 'justify-content: center'],
        ['k-justify-between', 'justify-content: space-between'],
        ['k-justify-around', 'justify-content: space-around'],
        ['k-justify-evenly', 'justify-content: space-evenly'],
      ]} />
      <Table title="Align Items" rows={[
        ['k-items-start', 'align-items: flex-start'],
        ['k-items-end', 'align-items: flex-end'],
        ['k-items-center', 'align-items: center'],
        ['k-items-baseline', 'align-items: baseline'],
        ['k-items-stretch', 'align-items: stretch'],
      ]} />
      <Table title="Flex Sizing" rows={[
        ['k-flex-1', 'flex: 1 1 0%'],
        ['k-flex-auto', 'flex: 1 1 auto'],
        ['k-flex-initial', 'flex: 0 1 auto'],
        ['k-flex-none', 'flex: none'],
        ['k-grow', 'flex-grow: 1'],
        ['k-grow-0', 'flex-grow: 0'],
        ['k-shrink', 'flex-shrink: 1'],
        ['k-shrink-0', 'flex-shrink: 0'],
      ]} />
    </div>
  ),
};

export const GridReference: Story = {
  name: 'Grid',
  render: () => (
    <div>
      <Table title="Display" rows={[
        ['k-grid', 'display: grid'],
        ['k-inline-grid', 'display: inline-grid'],
      ]} />
      <Table title="Columns (1-12)" rows={
        [1,2,3,4,5,6,7,8,9,10,11,12].map(n => [`k-grid-cols-${n}`, `grid-template-columns: repeat(${n}, minmax(0, 1fr))`] as [string, string])
      } />
      <Table title="Column Span" rows={[
        ...([1,2,3,4,5,6,7,8,9,10,11,12].map(n => [`k-col-span-${n}`, `grid-column: span ${n} / span ${n}`] as [string, string])),
        ['k-col-span-full', 'grid-column: 1 / -1'],
      ]} />
      <Table title="Row Span" rows={[
        ...([1,2,3,4,5,6].map(n => [`k-row-span-${n}`, `grid-row: span ${n} / span ${n}`] as [string, string])),
        ['k-row-span-full', 'grid-row: 1 / -1'],
      ]} />
      <Table title="Auto Flow" rows={[
        ['k-grid-flow-row', 'grid-auto-flow: row'],
        ['k-grid-flow-col', 'grid-auto-flow: column'],
        ['k-grid-flow-dense', 'grid-auto-flow: dense'],
        ['k-grid-flow-row-dense', 'grid-auto-flow: row dense'],
        ['k-grid-flow-col-dense', 'grid-auto-flow: column dense'],
      ]} />
    </div>
  ),
};

export const GapReference: Story = {
  name: 'Gap',
  render: () => (
    <Table title="Gap (uses --kreati-space-*)" rows={[
      ...([0,1,2,3,4,5,6,8,10,12,16].map(n => [`k-gap-${n}`, `gap: var(--kreati-space-${n})`] as [string, string])),
      ['k-gap-x-{n}', 'column-gap: var(--kreati-space-{n})'],
      ['k-gap-y-{n}', 'row-gap: var(--kreati-space-{n})'],
    ]} />
  ),
};

export const ContainerReference: Story = {
  name: 'Container',
  render: () => (
    <Table title="Container" rows={[
      ['k-container', 'width: 100%; margin: 0 auto; padding: 0 var(--kreati-space-4)'],
      ['k-container-sm', 'max-width: var(--kreati-max-width-sm) [40rem]'],
      ['k-container-md', 'max-width: var(--kreati-max-width-md) [48rem]'],
      ['k-container-lg', 'max-width: var(--kreati-max-width-lg) [64rem]'],
      ['k-container-xl', 'max-width: var(--kreati-max-width-xl) [75rem]'],
    ]} />
  ),
};

export const SpacingReference: Story = {
  name: 'Spacing',
  render: () => (
    <div>
      <Table title="Padding" rows={[
        ['k-p-{0-16}', 'padding: var(--kreati-space-{n})'],
        ['k-px-{0-8}', 'padding-left + padding-right'],
        ['k-py-{0-8}', 'padding-top + padding-bottom'],
        ['k-pt-{0-8}', 'padding-top'],
        ['k-pr-{0-8}', 'padding-right'],
        ['k-pb-{0-8}', 'padding-bottom'],
        ['k-pl-{0-8}', 'padding-left'],
      ]} />
      <Table title="Margin" rows={[
        ['k-m-{0-16}', 'margin: var(--kreati-space-{n})'],
        ['k-m-auto', 'margin: auto'],
        ['k-mx-{0-8}', 'margin-left + margin-right'],
        ['k-mx-auto', 'margin-left: auto; margin-right: auto'],
        ['k-my-{0-8}', 'margin-top + margin-bottom'],
        ['k-my-auto', 'margin-top: auto; margin-bottom: auto'],
        ['k-mt-{0-16}', 'margin-top'],
        ['k-mt-auto', 'margin-top: auto'],
        ['k-mr-{0-8}', 'margin-right'],
        ['k-mr-auto', 'margin-right: auto'],
        ['k-mb-{0-16}', 'margin-bottom'],
        ['k-ml-{0-8}', 'margin-left'],
        ['k-ml-auto', 'margin-left: auto'],
      ]} />
      <Table title="Negative Margin" rows={[
        ['k--mt-{1-8}', 'margin-top: calc(var(--kreati-space-{n}) * -1)'],
        ['k--mr-{1-4}', 'margin-right: negative'],
        ['k--mb-{1-8}', 'margin-bottom: negative'],
        ['k--ml-{1-4}', 'margin-left: negative'],
      ]} />
      <Table title="Space Between" rows={[
        ['k-space-x-{1-8}', '> * + * { margin-left: var(--kreati-space-{n}) }'],
        ['k-space-y-{1-8}', '> * + * { margin-top: var(--kreati-space-{n}) }'],
      ]} />
    </div>
  ),
};

export const DisplaySizingReference: Story = {
  name: 'Display & Sizing',
  render: () => (
    <div>
      <Table title="Display" rows={[
        ['k-block', 'display: block'],
        ['k-inline-block', 'display: inline-block'],
        ['k-inline', 'display: inline'],
        ['k-hidden', 'display: none'],
        ['k-visible', 'visibility: visible'],
        ['k-invisible', 'visibility: hidden'],
      ]} />
      <Table title="Position" rows={[
        ['k-relative', 'position: relative'],
        ['k-absolute', 'position: absolute'],
        ['k-fixed', 'position: fixed'],
        ['k-sticky', 'position: sticky'],
        ['k-static', 'position: static'],
        ['k-inset-0', 'top/right/bottom/left: 0'],
        ['k-inset-x-0', 'left: 0; right: 0'],
        ['k-inset-y-0', 'top: 0; bottom: 0'],
        ['k-top-0 / k-right-0 / k-bottom-0 / k-left-0', 'Individual sides'],
      ]} />
      <Table title="Width" rows={[
        ['k-w-full', 'width: 100%'],
        ['k-w-screen', 'width: 100vw'],
        ['k-w-auto / k-w-min / k-w-max / k-w-fit', 'Intrinsic sizing'],
        ['k-w-1/2, 1/3, 2/3, 1/4, 3/4, 1/5, 2/5, 3/5, 4/5', 'Fractional widths'],
        ['k-max-w-{xs,sm,md,lg,xl,2xl,3xl,full,screen,prose}', 'Max width constraints'],
        ['k-min-w-{0,full,min,max,fit}', 'Min width'],
      ]} />
      <Table title="Height" rows={[
        ['k-h-full / k-h-screen / k-h-auto', 'Height'],
        ['k-h-min / k-h-max / k-h-fit', 'Intrinsic height'],
        ['k-min-h-{0,full,screen}', 'Min height'],
        ['k-max-h-{full,screen}', 'Max height'],
      ]} />
      <Table title="Overflow" rows={[
        ['k-overflow-{auto,hidden,visible,scroll}', 'Both axes'],
        ['k-overflow-x-{auto,hidden}', 'Horizontal'],
        ['k-overflow-y-{auto,hidden}', 'Vertical'],
      ]} />
      <Table title="Aspect Ratio" rows={[
        ['k-aspect-auto', 'aspect-ratio: auto'],
        ['k-aspect-square', 'aspect-ratio: 1/1'],
        ['k-aspect-video', 'aspect-ratio: 16/9'],
        ['k-aspect-4/3', 'aspect-ratio: 4/3'],
      ]} />
      <Table title="Object Fit" rows={[
        ['k-object-{contain,cover,fill,none,scale-down}', 'object-fit'],
        ['k-object-{center,top,bottom}', 'object-position'],
      ]} />
    </div>
  ),
};
