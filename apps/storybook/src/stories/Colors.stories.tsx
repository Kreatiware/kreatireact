import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Foundation/Colors',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Kreati color system — primary, accent, gray scales, severity palette, ' +
          'semantic text colors, surfaces, and overlays. All values adapt per theme.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

const themes = ['light', 'dark', 'midnight', 'abyss', 'soft', 'arctic', 'high-contrast', 'kreati'] as const;

/* ─── Shared styles ───────────────────────────────────────────────── */
const cell: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid var(--kreati-gray-200)',
};
const code: React.CSSProperties = {
  fontSize: 'var(--kreati-font-size-xxs)',
  color: 'var(--kreati-gray-400)',
  fontFamily: 'var(--kreati-font-family-mono)',
};
const heading: React.CSSProperties = {
  fontFamily: 'var(--kreati-font-family-display)',
  fontSize: 'var(--kreati-font-size-lg)',
  fontWeight: 'var(--kreati-font-weight-semibold)' as any,
  color: 'var(--kreati-gray-900)',
  marginBottom: 16,
  paddingBottom: 8,
  borderBottom: '2px solid var(--kreati-gray-200)',
};

/* ─── Theme wrapper with selector ─────────────────────────────────── */
const Themed = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<string>('light');
  return (
    <div style={{ fontFamily: 'var(--kreati-font-family-body)' }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {themes.map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            style={{
              background: theme === t ? '#0f78a5' : '#fff',
              color: theme === t ? '#fff' : '#374151',
              border: `1px solid ${theme === t ? '#0f78a5' : '#d1d5db'}`,
              padding: '4px 12px',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 13,
              fontFamily: 'inherit',
              fontWeight: theme === t ? 600 : 400,
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <div
        data-kreati-theme={theme === 'light' ? undefined : theme}
        style={{
          background: 'var(--kreati-background)',
          color: 'var(--kreati-gray-800)',
          padding: 'var(--kreati-space-4)',
          borderRadius: 'var(--kreati-radius-lg)',
        }}
      >
        {children}
      </div>
    </div>
  );
};

const Swatch = ({ varName, label }: { varName: string; label?: string }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{
      width: 48, height: 48,
      borderRadius: 'var(--kreati-radius-sm)',
      background: `var(${varName})`,
      border: '1px solid var(--kreati-gray-200)',
      margin: '0 auto 4px',
    }} />
    <div style={{ fontSize: 'var(--kreati-font-size-xxs)', color: 'var(--kreati-gray-500)' }}>{label}</div>
  </div>
);

/* ─── Stories ─────────────────────────────────────────────────────── */

/** Primary color scale (50-900). */
export const PrimaryScale: Story = {
  render: () => (
    <Themed>
      <div style={heading}>Primary Scale</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((n) => (
          <Swatch key={n} varName={`--kreati-primary-${n}`} label={`${n}`} />
        ))}
      </div>
    </Themed>
  ),
};

/** Accent color scale — brand highlight, the 10% in 60-30-10. */
export const AccentScale: Story = {
  render: () => (
    <Themed>
      <div style={heading}>Accent Scale</div>
      <p style={{ fontSize: 'var(--kreati-font-size-sm)', color: 'var(--kreati-gray-500)', marginBottom: 16 }}>
        Brand highlight color. Used for CTAs, badges, and the 10% accent in the 60-30-10 rule.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[50, 100, 200, 300, 400, 500].map((n) => (
          <Swatch key={n} varName={`--kreati-accent-${n}`} label={`${n}`} />
        ))}
      </div>
    </Themed>
  ),
};

/** Gray scale (50-900). */
export const GrayScale: Story = {
  render: () => (
    <Themed>
      <div style={heading}>Gray Scale</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((n) => (
          <Swatch key={n} varName={`--kreati-gray-${n}`} label={`${n}`} />
        ))}
      </div>
      <div style={{ fontSize: 'var(--kreati-font-size-xs)', color: 'var(--kreati-gray-500)' }}>
        50-200: backgrounds, borders | 300: disabled borders | 400: placeholders |
        500: muted text | 600-700: body text | 800-900: headings
      </div>
    </Themed>
  ),
};

/** All 8 severity colors with their 6 variants each. */
export const Severities: Story = {
  render: () => {
    const sevs = ['primary', 'secondary', 'success', 'info', 'warning', 'help', 'danger', 'accent'];
    const variants = ['base', 'hover', 'active', 'text', 'light', 'light-hover'];
    return (
      <Themed>
        <div style={heading}>Severity Colors</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...cell, fontWeight: 600, fontSize: 'var(--kreati-font-size-xs)', textAlign: 'left' }}>Severity</th>
              {variants.map((v) => (
                <th key={v} style={{ ...cell, fontWeight: 600, fontSize: 'var(--kreati-font-size-xxs)', textAlign: 'center' }}>{v}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sevs.map((s) => (
              <tr key={s}>
                <td style={{ ...cell, fontWeight: 600, color: 'var(--kreati-severity-primary)' }}>{s}</td>
                {variants.map((v) => {
                  const varName = v === 'base' ? `--kreati-severity-${s}` : `--kreati-severity-${s}-${v}`;
                  return (
                    <td key={v} style={{ ...cell, textAlign: 'center' }}>
                      <div style={{
                        width: 36, height: 36, margin: '0 auto',
                        borderRadius: 'var(--kreati-radius-sm)',
                        background: `var(${varName})`,
                        border: v === 'text' ? '1px solid var(--kreati-gray-200)' : 'none',
                      }} title={varName} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Themed>
    );
  },
};

/** Semantic text color tokens. */
export const TextColors: Story = {
  render: () => {
    const tokens = [
      { name: 'text-primary', var: '--kreati-text-primary', desc: 'Headings, strong emphasis' },
      { name: 'text-body', var: '--kreati-text-body', desc: 'Default body text' },
      { name: 'text-secondary', var: '--kreati-text-secondary', desc: 'Secondary descriptions' },
      { name: 'text-muted', var: '--kreati-text-muted', desc: 'Muted, less important' },
      { name: 'text-disabled', var: '--kreati-text-disabled', desc: 'Disabled states' },
      { name: 'text-on-primary', var: '--kreati-text-on-primary', desc: 'Text on primary bg' },
      { name: 'text-on-accent', var: '--kreati-text-on-accent', desc: 'Text on accent bg' },
    ];
    return (
      <Themed>
        <div style={heading}>Semantic Text Colors</div>
        {tokens.map((t) => (
          <div key={t.name} style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '8px 0', borderBottom: '1px solid var(--kreati-gray-100)',
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: 4, flexShrink: 0,
              background: t.name.includes('on-') ? `var(--kreati-severity-${t.name.includes('accent') ? 'accent' : 'primary'})` : 'var(--kreati-surface, var(--kreati-white))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--kreati-gray-200)',
            }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: `var(${t.var})` }} />
            </div>
            <div style={{ minWidth: 140, fontWeight: 600 }}>{t.name}</div>
            <code style={code}>{t.var}</code>
            <span style={{ fontSize: 'var(--kreati-font-size-xs)', color: `var(${t.var})` }}>{t.desc}</span>
          </div>
        ))}
      </Themed>
    );
  },
};

/** Surface tokens — backgrounds for cards, inputs, interactive states. */
export const Surfaces: Story = {
  render: () => {
    const surfaces = [
      { name: 'background', var: '--kreati-background', desc: 'Page background' },
      { name: 'surface', var: '--kreati-surface', desc: 'Cards, panels, dropdowns' },
      { name: 'surface-hover', var: '--kreati-surface-hover', desc: 'Row/option hover' },
      { name: 'surface-active', var: '--kreati-surface-active', desc: 'Selected state' },
      { name: 'white', var: '--kreati-white', desc: 'Pure white (warm in Kreati)' },
    ];
    return (
      <Themed>
        <div style={heading}>Surfaces</div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {surfaces.map((s) => (
            <div key={s.name} style={{ textAlign: 'center' }}>
              <div style={{
                width: 80, height: 80,
                borderRadius: 'var(--kreati-radius-md)',
                background: `var(${s.var})`,
                border: '1px solid var(--kreati-gray-200)',
                boxShadow: 'var(--kreati-shadow-sm)',
                margin: '0 auto 8px',
              }} />
              <div style={{ fontWeight: 600, fontSize: 'var(--kreati-font-size-xs)' }}>{s.name}</div>
              <code style={{ ...code, display: 'block' }}>{s.var}</code>
              <div style={{ fontSize: 'var(--kreati-font-size-xxs)', color: 'var(--kreati-gray-500)' }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </Themed>
    );
  },
};

/** 60-30-10 rule visualization for the current theme. */
export const Rule603010: Story = {
  name: '60-30-10 Rule',
  render: () => (
    <Themed>
      <div style={heading}>60-30-10 Color Distribution</div>
      <div style={{ display: 'flex', height: 60, borderRadius: 'var(--kreati-radius-md)', overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ flex: 60, background: 'var(--kreati-background)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--kreati-font-size-xs)', fontWeight: 600, border: '1px solid var(--kreati-gray-200)' }}>
          60% Neutral
        </div>
        <div style={{ flex: 30, background: 'var(--kreati-severity-primary)', color: 'var(--kreati-severity-primary-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--kreati-font-size-xs)', fontWeight: 600 }}>
          30% Primary
        </div>
        <div style={{ flex: 10, background: 'var(--kreati-severity-accent)', color: 'var(--kreati-severity-accent-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--kreati-font-size-xs)', fontWeight: 600 }}>
          10%
        </div>
      </div>
      <div style={{ fontSize: 'var(--kreati-font-size-sm)', color: 'var(--kreati-gray-600)', lineHeight: 'var(--kreati-line-height-base)' }}>
        <strong>60% Neutral:</strong> Page backgrounds, card surfaces, white space.<br />
        <strong>30% Primary:</strong> Headers, navigation, buttons, active states, links.<br />
        <strong>10% Accent:</strong> CTAs, highlights, badges, notification dots, special emphasis.
      </div>
    </Themed>
  ),
};
