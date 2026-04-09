import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Foundation/Typography',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Kreati design system typography tokens — font sizes, line heights, letter spacing, and font weights.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

const fontSizes = [
  { name: 'xxs', var: '--kreati-font-size-xxs', value: '10px' },
  { name: 'xs', var: '--kreati-font-size-xs', value: '12px' },
  { name: 'sm', var: '--kreati-font-size-sm', value: '14px' },
  { name: 'base', var: '--kreati-font-size-base', value: '16px' },
  { name: 'md', var: '--kreati-font-size-md', value: '18px' },
  { name: 'lg', var: '--kreati-font-size-lg', value: '20px' },
  { name: 'xl', var: '--kreati-font-size-xl', value: '22px' },
  { name: 'xxl', var: '--kreati-font-size-xxl', value: '24px' },
];

const lineHeights = [
  { name: 'xxs', var: '--kreati-line-height-xxs', value: '1.12' },
  { name: 'xs', var: '--kreati-line-height-xs', value: '1.2' },
  { name: 'sm', var: '--kreati-line-height-sm', value: '1.3' },
  { name: 'base', var: '--kreati-line-height-base', value: '1.5' },
  { name: 'md', var: '--kreati-line-height-md', value: '1.55' },
  { name: 'lg', var: '--kreati-line-height-lg', value: '1.6' },
  { name: 'xl', var: '--kreati-line-height-xl', value: '1.6' },
  { name: 'xxl', var: '--kreati-line-height-xxl', value: '1.65' },
];

const letterSpacings = [
  { name: 'tighter', var: '--kreati-letter-spacing-tighter', value: '-0.02em' },
  { name: 'tight', var: '--kreati-letter-spacing-tight', value: '-0.01em' },
  { name: 'normal', var: '--kreati-letter-spacing-normal', value: '0' },
  { name: 'wide', var: '--kreati-letter-spacing-wide', value: '0.01em' },
  { name: 'wider', var: '--kreati-letter-spacing-wider', value: '0.025em' },
  { name: 'widest', var: '--kreati-letter-spacing-widest', value: '0.05em' },
  { name: 'caps', var: '--kreati-letter-spacing-caps', value: '0.1em' },
];

const fontWeights = [
  { name: 'light', var: '--kreati-font-weight-light', value: '300' },
  { name: 'regular', var: '--kreati-font-weight-regular', value: '400' },
  { name: 'medium', var: '--kreati-font-weight-medium', value: '500' },
  { name: 'semibold', var: '--kreati-font-weight-semibold', value: '600' },
  { name: 'bold', var: '--kreati-font-weight-bold', value: '700' },
  { name: 'extrabold', var: '--kreati-font-weight-extrabold', value: '800' },
];

const sampleText = 'The quick brown fox jumps over the lazy dog';

const cellStyle: React.CSSProperties = { padding: '8px 12px', borderBottom: '1px solid var(--kreati-gray-200, #e5e7eb)' };
const headerStyle: React.CSSProperties = { ...cellStyle, fontWeight: 600, fontSize: 12, color: 'var(--kreati-gray-500)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' };
const codeStyle: React.CSSProperties = { fontSize: 11, color: 'var(--kreati-gray-400)', fontFamily: 'monospace' };

/**
 * All font sizes with their corresponding line heights.
 */
export const FontSizes: Story = {
  render: () => (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--kreati-font-family)' }}>
      <thead>
        <tr>
          <th style={headerStyle}>Name</th>
          <th style={headerStyle}>Size</th>
          <th style={headerStyle}>Variable</th>
          <th style={headerStyle}>Sample</th>
        </tr>
      </thead>
      <tbody>
        {fontSizes.map((fs) => (
          <tr key={fs.name}>
            <td style={cellStyle}><strong>{fs.name}</strong></td>
            <td style={cellStyle}>{fs.value}</td>
            <td style={cellStyle}><code style={codeStyle}>{fs.var}</code></td>
            <td style={{ ...cellStyle, fontSize: `var(${fs.var})`, lineHeight: `var(--kreati-line-height-${fs.name})` }}>{sampleText}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

/**
 * Line heights applied to base font size.
 */
export const LineHeights: Story = {
  render: () => (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--kreati-font-family)' }}>
      <thead>
        <tr>
          <th style={headerStyle}>Name</th>
          <th style={headerStyle}>Value</th>
          <th style={headerStyle}>Variable</th>
          <th style={headerStyle}>Sample (16px base)</th>
        </tr>
      </thead>
      <tbody>
        {lineHeights.map((lh) => (
          <tr key={lh.name}>
            <td style={cellStyle}><strong>{lh.name}</strong></td>
            <td style={cellStyle}>{lh.value}</td>
            <td style={cellStyle}><code style={codeStyle}>{lh.var}</code></td>
            <td style={{ ...cellStyle, fontSize: 16, lineHeight: `var(${lh.var})` }}>
              {sampleText}<br />{sampleText}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

/**
 * Letter spacing applied to base font size.
 */
export const LetterSpacing: Story = {
  render: () => (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--kreati-font-family)' }}>
      <thead>
        <tr>
          <th style={headerStyle}>Name</th>
          <th style={headerStyle}>Value</th>
          <th style={headerStyle}>Variable</th>
          <th style={headerStyle}>Sample</th>
        </tr>
      </thead>
      <tbody>
        {letterSpacings.map((ls) => (
          <tr key={ls.name}>
            <td style={cellStyle}><strong>{ls.name}</strong></td>
            <td style={cellStyle}>{ls.value}</td>
            <td style={cellStyle}><code style={codeStyle}>{ls.var}</code></td>
            <td style={{ ...cellStyle, fontSize: 16, letterSpacing: `var(${ls.var})` }}>
              {ls.name === 'caps' ? sampleText.toUpperCase() : sampleText}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

/**
 * Font weights.
 */
export const FontWeights: Story = {
  render: () => (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--kreati-font-family)' }}>
      <thead>
        <tr>
          <th style={headerStyle}>Name</th>
          <th style={headerStyle}>Value</th>
          <th style={headerStyle}>Variable</th>
          <th style={headerStyle}>Sample</th>
        </tr>
      </thead>
      <tbody>
        {fontWeights.map((fw) => (
          <tr key={fw.name}>
            <td style={cellStyle}><strong>{fw.name}</strong></td>
            <td style={cellStyle}>{fw.value}</td>
            <td style={cellStyle}><code style={codeStyle}>{fw.var}</code></td>
            <td style={{ ...cellStyle, fontSize: 16, fontWeight: `var(${fw.var})` as any }}>{sampleText}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

/**
 * Combined — each font size with its matching line height, recommended letter spacing, and weight combinations.
 */
export const Combined: Story = {
  render: () => (
    <div style={{ fontFamily: 'var(--kreati-font-family)', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {fontSizes.map((fs) => (
        <div key={fs.name} style={{ borderBottom: '1px solid var(--kreati-gray-200)', paddingBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--kreati-primary-500)', minWidth: 40 }}>{fs.name}</span>
            <code style={codeStyle}>{fs.value} / line-height: var(--kreati-line-height-{fs.name})</code>
          </div>
          <div style={{ fontSize: `var(${fs.var})`, lineHeight: `var(--kreati-line-height-${fs.name})`, fontWeight: 400 }}>
            {sampleText}
          </div>
          <div style={{ fontSize: `var(${fs.var})`, lineHeight: `var(--kreati-line-height-${fs.name})`, fontWeight: 700, marginTop: 4 }}>
            {sampleText} <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--kreati-gray-400)' }}>(bold)</span>
          </div>
        </div>
      ))}
    </div>
  ),
};
