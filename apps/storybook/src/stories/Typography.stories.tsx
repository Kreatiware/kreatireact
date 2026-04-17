import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Foundation/Typography',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Kreati typography system — font families (Inter, Raleway, JetBrains Mono), ' +
          'rem-based scale (xxs-5xl), presets, weights, tracking, and color combinations.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

/* ─── Theme selector ──────────────────────────────────────────────── */
const allThemes = ['light', 'dark', 'midnight', 'abyss', 'soft', 'arctic', 'high-contrast', 'kreati'] as const;

const Themed = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<string>('light');
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {allThemes.map((t) => (
          <button key={t} onClick={() => setTheme(t)} style={{
            background: theme === t ? '#0f78a5' : '#fff',
            color: theme === t ? '#fff' : '#374151',
            border: `1px solid ${theme === t ? '#0f78a5' : '#d1d5db'}`,
            padding: '4px 12px', borderRadius: 6, cursor: 'pointer',
            fontSize: 13, fontWeight: theme === t ? 600 : 400,
          }}>{t}</button>
        ))}
      </div>
      <div data-kreati-theme={theme === 'light' ? undefined : theme} style={{
        background: 'var(--kreati-background)', color: 'var(--kreati-gray-800)',
        padding: 'var(--kreati-space-4)', borderRadius: 'var(--kreati-radius-lg)',
      }}>{children}</div>
    </div>
  );
};

/* ─── Shared styles ───────────────────────────────────────────────── */
const cell: React.CSSProperties = { padding: '8px 12px', borderBottom: '1px solid var(--kreati-gray-200)' };
const th: React.CSSProperties = { ...cell, fontWeight: 600, fontSize: 'var(--kreati-font-size-xs)', color: 'var(--kreati-gray-500)', textTransform: 'uppercase', letterSpacing: 'var(--kreati-tracking-wider)', textAlign: 'left' };
const code: React.CSSProperties = { fontSize: 'var(--kreati-font-size-xxs)', color: 'var(--kreati-gray-400)', fontFamily: 'var(--kreati-font-family-mono)' };
const heading: React.CSSProperties = { fontFamily: 'var(--kreati-font-family-display)', fontSize: 'var(--kreati-font-size-lg)', fontWeight: 'var(--kreati-font-weight-semibold)' as any, color: 'var(--kreati-gray-900)', marginBottom: 16, paddingBottom: 8, borderBottom: '2px solid var(--kreati-gray-200)' };

const sample = 'The quick brown fox jumps over the lazy dog';

/* ─── Data ────────────────────────────────────────────────────────── */
const families = [
  { name: 'Display', var: '--kreati-font-family-display', desc: 'Headings, titles, hero text', font: 'Raleway' },
  { name: 'Body', var: '--kreati-font-family-body', desc: 'UI text, paragraphs, labels, inputs', font: 'Inter' },
  { name: 'Mono', var: '--kreati-font-family-mono', desc: 'Code, numeric data, masks', font: 'JetBrains Mono' },
];

const sizes = [
  { name: 'xxs', rem: '0.625rem', px: '10px' },
  { name: 'xs', rem: '0.75rem', px: '12px' },
  { name: 'sm', rem: '0.875rem', px: '14px' },
  { name: 'base', rem: '1rem', px: '16px' },
  { name: 'md', rem: '1.125rem', px: '18px' },
  { name: 'lg', rem: '1.25rem', px: '20px' },
  { name: 'xl', rem: '1.5rem', px: '24px' },
  { name: '2xl', rem: '1.875rem', px: '30px' },
  { name: '3xl', rem: '2.25rem', px: '36px' },
  { name: '4xl', rem: '3rem', px: '48px' },
  { name: '5xl', rem: '3.75rem', px: '60px' },
];

const lineHeights = [
  { name: 'xxs', value: '1.6' }, { name: 'xs', value: '1.5' }, { name: 'sm', value: '1.5' },
  { name: 'base', value: '1.5' }, { name: 'md', value: '1.45' }, { name: 'lg', value: '1.4' },
  { name: 'xl', value: '1.35' }, { name: '2xl', value: '1.3' }, { name: '3xl', value: '1.25' },
  { name: '4xl', value: '1.2' }, { name: '5xl', value: '1.15' },
];

const trackings = [
  { name: 'tighter', value: '-0.025em', use: 'Large headings (4xl+)' },
  { name: 'tight', value: '-0.01em', use: 'Medium headings (2xl-3xl)' },
  { name: 'normal', value: '0', use: 'Body text, UI' },
  { name: 'wide', value: '0.025em', use: 'Table headers, labels' },
  { name: 'wider', value: '0.05em', use: 'Overlines, categories' },
  { name: 'widest', value: '0.1em', use: 'Uppercase decorative' },
];

const weights = [
  { name: 'light', value: '300', use: 'Decorative, large display' },
  { name: 'regular', value: '400', use: 'Body text, inputs' },
  { name: 'medium', value: '500', use: 'Labels, buttons, nav items' },
  { name: 'semibold', value: '600', use: 'Headings, active states' },
  { name: 'bold', value: '700', use: 'Hero titles, emphasis' },
  { name: 'extrabold', value: '800', use: 'Display, branding' },
];

const presets = [
  { name: 'Display', prefix: 'display', desc: 'Hero headlines', size: '5xl', weight: 'bold' },
  { name: 'Heading 1', prefix: 'h1', desc: 'Page titles', size: '4xl', weight: 'bold' },
  { name: 'Heading 2', prefix: 'h2', desc: 'Section titles', size: '3xl', weight: 'semibold' },
  { name: 'Heading 3', prefix: 'h3', desc: 'Card/Dialog titles', size: 'xl', weight: 'semibold' },
  { name: 'Heading 4', prefix: 'h4', desc: 'Panel/Accordion titles', size: 'md', weight: 'semibold' },
  { name: 'Body', prefix: 'body', desc: 'Default text', size: 'base', weight: 'regular' },
  { name: 'Body Small', prefix: 'body-sm', desc: 'Secondary text', size: 'sm', weight: 'regular' },
  { name: 'Label', prefix: 'label', desc: 'Form labels, nav', size: 'sm', weight: 'medium' },
  { name: 'Caption', prefix: 'caption', desc: 'Helpers, errors', size: 'xs', weight: 'regular' },
  { name: 'Overline', prefix: 'overline', desc: 'Categories (uppercase)', size: 'xxs', weight: 'semibold' },
  { name: 'Table Header', prefix: 'th', desc: 'DataTable headers', size: 'sm', weight: 'semibold' },
  { name: 'Table Cell', prefix: 'td', desc: 'DataTable cells', size: 'sm', weight: 'regular' },
  { name: 'Code', prefix: 'code', desc: 'Monospace content', size: 'sm', weight: 'regular' },
];

const textColors = [
  { name: 'gray-900', var: '--kreati-gray-900', label: 'Headings' },
  { name: 'gray-800', var: '--kreati-gray-800', label: 'Body text (default)' },
  { name: 'gray-700', var: '--kreati-gray-700', label: 'Strong secondary' },
  { name: 'gray-600', var: '--kreati-gray-600', label: 'Secondary text' },
  { name: 'gray-500', var: '--kreati-gray-500', label: 'Muted text' },
  { name: 'gray-400', var: '--kreati-gray-400', label: 'Placeholder, disabled' },
  { name: 'primary-500', var: '--kreati-primary-500', label: 'Links, active' },
  { name: 'severity-success', var: '--kreati-severity-success', label: 'Success messages' },
  { name: 'severity-warning', var: '--kreati-severity-warning', label: 'Warning messages' },
  { name: 'severity-danger', var: '--kreati-severity-danger', label: 'Error messages' },
  { name: 'severity-accent', var: '--kreati-severity-accent', label: 'Accent highlights' },
];

/* ─── Stories ─────────────────────────────────────────────────────── */

/** The three font families and their roles. */
export const FontFamilies: Story = {
  render: () => (
    <Themed>
      <div style={heading}>Font Families</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {families.map((f) => (
          <div key={f.name} style={{ borderBottom: '1px solid var(--kreati-gray-100)', paddingBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
              <span style={{ fontWeight: 600, color: 'var(--kreati-severity-primary)', minWidth: 70 }}>{f.name}</span>
              <span style={{ color: 'var(--kreati-gray-500)', fontSize: 'var(--kreati-font-size-sm)' }}>{f.font}</span>
              <code style={code}>{f.var}</code>
            </div>
            <p style={{ fontSize: 'var(--kreati-font-size-sm)', color: 'var(--kreati-gray-500)', margin: '0 0 12px' }}>{f.desc}</p>
            <div style={{ fontFamily: `var(${f.var})`, fontSize: 'var(--kreati-font-size-xl)' }}>{sample}</div>
            <div style={{ fontFamily: `var(${f.var})`, fontSize: 'var(--kreati-font-size-xl)', fontWeight: 700, marginTop: 4 }}>{sample}</div>
            <div style={{ fontFamily: `var(${f.var})`, fontSize: 'var(--kreati-font-size-sm)', marginTop: 8, color: 'var(--kreati-gray-600)' }}>
              ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
            </div>
          </div>
        ))}
      </div>
    </Themed>
  ),
};

/** Full rem-based type scale from xxs to 5xl. */
export const FontScale: Story = {
  render: () => (
    <Themed>
      <div style={heading}>Font Scale</div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th style={th}>Token</th><th style={th}>rem</th><th style={th}>px</th><th style={th}>Sample</th></tr></thead>
        <tbody>
          {sizes.map((s) => (
            <tr key={s.name}>
              <td style={cell}><strong>{s.name}</strong></td>
              <td style={cell}>{s.rem}</td>
              <td style={{ ...cell, color: 'var(--kreati-gray-400)' }}>{s.px}</td>
              <td style={{ ...cell, fontFamily: `var(--kreati-font-family-${parseInt(s.px) >= 24 ? 'display' : 'body'})`, fontSize: `var(--kreati-font-size-${s.name})`, lineHeight: `var(--kreati-line-height-${s.name})` }}>{sample}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Themed>
  ),
};

/** Line heights descend from 1.6 (small) to 1.15 (display). */
export const LineHeights: Story = {
  render: () => (
    <Themed>
      <div style={heading}>Line Heights</div>
      <p style={{ fontSize: 'var(--kreati-font-size-sm)', color: 'var(--kreati-gray-500)', marginBottom: 16 }}>Small text gets more breathing room. Large headings stay compact.</p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th style={th}>Token</th><th style={th}>Value</th><th style={th}>Sample</th></tr></thead>
        <tbody>
          {lineHeights.map((lh, i) => (
            <tr key={lh.name}>
              <td style={cell}><strong>{lh.name}</strong></td>
              <td style={cell}>{lh.value}</td>
              <td style={{ ...cell, fontSize: `var(--kreati-font-size-${sizes[i]?.name || 'base'})`, lineHeight: `var(--kreati-line-height-${lh.name})` }}>{sample}<br />{sample}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Themed>
  ),
};

/** Letter spacing (tracking) tokens. */
export const Tracking: Story = {
  render: () => (
    <Themed>
      <div style={heading}>Letter Spacing (Tracking)</div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th style={th}>Token</th><th style={th}>Value</th><th style={th}>Usage</th><th style={th}>Sample</th></tr></thead>
        <tbody>
          {trackings.map((t) => (
            <tr key={t.name}>
              <td style={cell}><strong>{t.name}</strong></td>
              <td style={cell}>{t.value}</td>
              <td style={{ ...cell, fontSize: 'var(--kreati-font-size-xs)', color: 'var(--kreati-gray-500)' }}>{t.use}</td>
              <td style={{ ...cell, letterSpacing: `var(--kreati-tracking-${t.name})`, textTransform: t.name === 'widest' ? 'uppercase' : undefined }}>{sample}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Themed>
  ),
};

/** Font weights across both families. */
export const FontWeights: Story = {
  render: () => (
    <Themed>
      <div style={heading}>Font Weights</div>
      {weights.map((w) => (
        <div key={w.name} style={{ borderBottom: '1px solid var(--kreati-gray-100)', padding: '12px 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
            <span style={{ fontWeight: 600, color: 'var(--kreati-severity-primary)', minWidth: 80 }}>{w.name}</span>
            <span style={{ color: 'var(--kreati-gray-400)', fontSize: 'var(--kreati-font-size-xs)' }}>{w.value}</span>
            <span style={{ fontSize: 'var(--kreati-font-size-xs)', color: 'var(--kreati-gray-500)' }}>{w.use}</span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ fontFamily: 'var(--kreati-font-family-display)', fontSize: 'var(--kreati-font-size-lg)', fontWeight: w.value as any }}>Raleway {w.value}</div>
            <div style={{ fontFamily: 'var(--kreati-font-family-body)', fontSize: 'var(--kreati-font-size-lg)', fontWeight: w.value as any }}>Inter {w.value}</div>
          </div>
        </div>
      ))}
    </Themed>
  ),
};

/** Typography presets — predefined combinations used across components. */
export const Presets: Story = {
  render: () => (
    <Themed>
      <div style={heading}>Typography Presets</div>
      <p style={{ fontSize: 'var(--kreati-font-size-sm)', color: 'var(--kreati-gray-500)', marginBottom: 24 }}>
        Each preset defines font-family, size, weight, line-height, and tracking. Components reference these instead of individual tokens.
      </p>
      {presets.map((p) => (
        <div key={p.prefix} style={{ borderBottom: '1px solid var(--kreati-gray-100)', padding: '16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
            <span style={{ fontWeight: 600, color: 'var(--kreati-severity-primary)', minWidth: 110 }}>{p.name}</span>
            <code style={code}>--kreati-preset-{p.prefix}-*</code>
            <span style={{ fontSize: 'var(--kreati-font-size-xs)', color: 'var(--kreati-gray-400)' }}>{p.size} / {p.weight}</span>
          </div>
          <div style={{ fontSize: 'var(--kreati-font-size-xs)', color: 'var(--kreati-gray-500)', marginBottom: 8 }}>{p.desc}</div>
          <div style={{
            fontFamily: `var(--kreati-preset-${p.prefix}-family)`,
            fontSize: `var(--kreati-preset-${p.prefix}-size)`,
            fontWeight: `var(--kreati-preset-${p.prefix}-weight)` as any,
            lineHeight: `var(--kreati-preset-${p.prefix}-line-height)`,
            letterSpacing: `var(--kreati-preset-${p.prefix}-tracking)`,
            textTransform: p.prefix === 'overline' ? 'uppercase' : undefined,
          }}>{sample}</div>
        </div>
      ))}
    </Themed>
  ),
};

/** Text colors for different contexts. */
export const TextColors: Story = {
  render: () => (
    <Themed>
      <div style={heading}>Text Colors</div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th style={th}>Color</th><th style={th}>Variable</th><th style={th}>Usage</th><th style={th}>Sample</th></tr></thead>
        <tbody>
          {textColors.map((c) => (
            <tr key={c.name}>
              <td style={cell}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, background: `var(${c.var})`, flexShrink: 0 }} />
                  <strong>{c.name}</strong>
                </div>
              </td>
              <td style={cell}><code style={code}>{c.var}</code></td>
              <td style={{ ...cell, fontSize: 'var(--kreati-font-size-xs)', color: 'var(--kreati-gray-500)' }}>{c.label}</td>
              <td style={{ ...cell, color: `var(${c.var})` }}>{sample}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Themed>
  ),
};

/** Preset to component mapping. */
export const ComponentMapping: Story = {
  render: () => {
    const mappings = [
      { preset: 'Display', components: 'HeroSection title' },
      { preset: 'Heading 3', components: 'Card title, Dialog title, Drawer title' },
      { preset: 'Heading 4', components: 'Panel title, Accordion title' },
      { preset: 'Label', components: 'FieldWrapper label, Button text, Nav items' },
      { preset: 'Body', components: 'Dialog body, Drawer body, general text' },
      { preset: 'Body Small', components: 'Card subtitle, Breadcrumb, Stepper' },
      { preset: 'Caption', components: 'FieldWrapper helper/error, Badge, Tooltip' },
      { preset: 'Overline', components: 'DataTable group headers, Tag' },
      { preset: 'Table Header', components: 'DataTable th' },
      { preset: 'Table Cell', components: 'DataTable td, List items' },
      { preset: 'Code', components: 'InputMask, numeric data' },
    ];
    return (
      <Themed>
        <div style={heading}>Preset to Component Mapping</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={th}>Preset</th><th style={th}>Components</th><th style={th}>Visual</th></tr></thead>
          <tbody>
            {mappings.map((m) => {
              const p = presets.find((pr) => pr.name === m.preset);
              return (
                <tr key={m.preset}>
                  <td style={{ ...cell, fontWeight: 600, color: 'var(--kreati-severity-primary)' }}>{m.preset}</td>
                  <td style={{ ...cell, fontSize: 'var(--kreati-font-size-xs)', color: 'var(--kreati-gray-600)' }}>{m.components}</td>
                  <td style={{
                    ...cell,
                    fontFamily: p ? `var(--kreati-preset-${p.prefix}-family)` : undefined,
                    fontSize: p ? `var(--kreati-preset-${p.prefix}-size)` : undefined,
                    fontWeight: p ? `var(--kreati-preset-${p.prefix}-weight)` as any : undefined,
                    lineHeight: p ? `var(--kreati-preset-${p.prefix}-line-height)` : undefined,
                    textTransform: p?.prefix === 'overline' ? 'uppercase' : undefined,
                  }}>Sample text</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Themed>
    );
  },
};

/** Typography on dark surfaces — primary vs accent usage. */
export const OnDarkBackground: Story = {
  render: () => (
    <Themed>
      <div style={{
        background: 'var(--kreati-gray-900)', borderRadius: 'var(--kreati-radius-lg)',
        padding: 32, display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        <div style={{ fontFamily: 'var(--kreati-preset-display-family)', fontSize: 'var(--kreati-font-size-4xl)', fontWeight: 'var(--kreati-font-weight-bold)' as any, lineHeight: 'var(--kreati-line-height-4xl)', letterSpacing: 'var(--kreati-tracking-tighter)', color: 'var(--kreati-white-alpha-70)' }}>
          Display on dark
        </div>
        <div style={{ fontFamily: 'var(--kreati-font-family-body)', fontSize: 'var(--kreati-font-size-base)', lineHeight: 'var(--kreati-line-height-base)', color: 'var(--kreati-white-alpha-60)' }}>
          Body text on dark surfaces uses reduced opacity for comfortable reading.
        </div>

        {/* Primary vs Accent comparison */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 'var(--kreati-font-size-xxs)', color: 'var(--kreati-gray-400)', textTransform: 'uppercase', letterSpacing: 'var(--kreati-tracking-wider)', marginBottom: 8 }}>Primary color</div>
            <div style={{ fontFamily: 'var(--kreati-font-family-display)', fontSize: 'var(--kreati-font-size-xl)', fontWeight: 'var(--kreati-font-weight-semibold)' as any, color: 'var(--kreati-severity-primary)', marginBottom: 4 }}>
              Heading with primary
            </div>
            <div style={{ fontSize: 'var(--kreati-font-size-sm)', color: 'var(--kreati-severity-primary)' }}>
              Link or interactive text
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 'var(--kreati-font-size-xxs)', color: 'var(--kreati-gray-400)', textTransform: 'uppercase', letterSpacing: 'var(--kreati-tracking-wider)', marginBottom: 8 }}>Accent color</div>
            <div style={{ fontFamily: 'var(--kreati-font-family-display)', fontSize: 'var(--kreati-font-size-xl)', fontWeight: 'var(--kreati-font-weight-semibold)' as any, color: 'var(--kreati-severity-accent)', marginBottom: 4 }}>
              Heading with accent
            </div>
            <div style={{ fontSize: 'var(--kreati-font-size-sm)', color: 'var(--kreati-severity-accent)' }}>
              Highlight or CTA text
            </div>
          </div>
        </div>

        {/* Badges/Tags on dark */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ background: 'var(--kreati-severity-primary)', color: 'var(--kreati-severity-primary-text)', padding: '4px 12px', borderRadius: 'var(--kreati-radius-full)', fontSize: 'var(--kreati-font-size-xs)' }}>Primary badge</span>
          <span style={{ background: 'var(--kreati-severity-accent)', color: 'var(--kreati-severity-accent-text)', padding: '4px 12px', borderRadius: 'var(--kreati-radius-full)', fontSize: 'var(--kreati-font-size-xs)' }}>Accent badge</span>
        </div>

        {/* Caption + Code */}
        <div style={{ fontFamily: 'var(--kreati-font-family-body)', fontSize: 'var(--kreati-font-size-xs)', color: 'var(--kreati-gray-400)' }}>
          Caption text — muted gray for secondary information
        </div>
        <div style={{ fontFamily: 'var(--kreati-font-family-mono)', fontSize: 'var(--kreati-font-size-sm)', color: 'var(--kreati-severity-accent)', background: 'var(--kreati-white-alpha-12)', padding: '8px 12px', borderRadius: 'var(--kreati-radius-sm)' }}>
          const highlight = 'accent'; // Monospace with accent
        </div>
      </div>
    </Themed>
  ),
};

/** Raleway vs Inter side by side. */
export const FamilyComparison: Story = {
  render: () => (
    <Themed>
      <div style={heading}>Raleway vs Inter</div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th style={th}>Size</th><th style={th}>Raleway (Display)</th><th style={th}>Inter (Body)</th></tr></thead>
        <tbody>
          {['sm', 'base', 'lg', 'xl', '2xl', '3xl'].map((s) => (
            <tr key={s}>
              <td style={{ ...cell, fontWeight: 600, minWidth: 60 }}>{s}</td>
              <td style={{ ...cell, fontFamily: 'var(--kreati-font-family-display)', fontSize: `var(--kreati-font-size-${s})`, lineHeight: `var(--kreati-line-height-${s})` }}>{sample}</td>
              <td style={{ ...cell, fontFamily: 'var(--kreati-font-family-body)', fontSize: `var(--kreati-font-size-${s})`, lineHeight: `var(--kreati-line-height-${s})` }}>{sample}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Themed>
  ),
};
