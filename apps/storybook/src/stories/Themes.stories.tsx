import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Foundation/Themes',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Kreati theme system — 8 built-in themes. Each theme overrides CSS variables via ' +
          '`data-kreati-theme` attribute. Includes severity accent (brand highlight color).',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

const themes = ['light', 'dark', 'midnight', 'abyss', 'soft', 'arctic', 'high-contrast', 'kreati'] as const;
const severities = ['primary', 'secondary', 'success', 'info', 'warning', 'help', 'danger', 'accent'] as const;

const base: React.CSSProperties = {
  fontFamily: 'var(--kreati-font-family-body)',
  fontSize: 'var(--kreati-font-size-sm)',
};

const ThemeBox = ({ theme, children }: { theme: string; children: React.ReactNode }) => (
  <div
    data-kreati-theme={theme === 'light' ? undefined : theme}
    style={{
      background: 'var(--kreati-background)',
      color: 'var(--kreati-gray-800)',
      padding: 'var(--kreati-space-6)',
      borderRadius: 'var(--kreati-radius-lg)',
      border: '1px solid var(--kreati-gray-200)',
      ...base,
    }}
  >
    {children}
  </div>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    fontSize: 'var(--kreati-font-size-xxs)',
    fontWeight: 'var(--kreati-font-weight-semibold)' as any,
    color: 'var(--kreati-gray-500)',
    textTransform: 'uppercase',
    letterSpacing: 'var(--kreati-tracking-wider)',
    marginBottom: 'var(--kreati-space-2)',
    marginTop: 'var(--kreati-space-4)',
  }}>
    {children}
  </div>
);

/** Full component showcase per theme — buttons, severities, inputs, cards, chips, badges. */
const FullCard = ({ theme }: { theme: string }) => (
  <ThemeBox theme={theme}>
    <div style={{
      fontFamily: 'var(--kreati-font-family-display)',
      fontWeight: 'var(--kreati-font-weight-bold)' as any,
      fontSize: 'var(--kreati-font-size-lg)',
      marginBottom: 'var(--kreati-space-2)',
    }}>
      {theme.charAt(0).toUpperCase() + theme.slice(1)}
    </div>

    {/* Severity swatches */}
    <SectionLabel>Severities</SectionLabel>
    <div style={{ display: 'flex', gap: 'var(--kreati-space-1)', flexWrap: 'wrap' }}>
      {severities.map((s) => (
        <div key={s} style={{ textAlign: 'center' }}>
          <div style={{
            width: 36, height: 36,
            borderRadius: 'var(--kreati-radius-sm)',
            background: `var(--kreati-severity-${s})`,
          }} />
          <div style={{ fontSize: 'var(--kreati-font-size-xxs)', color: 'var(--kreati-gray-500)', marginTop: 2 }}>{s}</div>
        </div>
      ))}
    </div>

    {/* Filled buttons */}
    <SectionLabel>Buttons (Filled)</SectionLabel>
    <div style={{ display: 'flex', gap: 'var(--kreati-space-2)', flexWrap: 'wrap' }}>
      {severities.map((s) => (
        <button key={s} style={{
          background: `var(--kreati-severity-${s})`,
          color: `var(--kreati-severity-${s}-text)`,
          border: 'none',
          padding: 'var(--kreati-space-2) var(--kreati-space-4)',
          borderRadius: 'var(--kreati-radius-sm)',
          cursor: 'pointer',
          fontWeight: 'var(--kreati-font-weight-medium)' as any,
          ...base,
        }}>
          {s}
        </button>
      ))}
    </div>

    {/* Outlined buttons */}
    <SectionLabel>Buttons (Outlined)</SectionLabel>
    <div style={{ display: 'flex', gap: 'var(--kreati-space-2)', flexWrap: 'wrap' }}>
      {severities.map((s) => (
        <button key={s} style={{
          background: 'transparent',
          color: `var(--kreati-severity-${s})`,
          border: `2px solid var(--kreati-severity-${s})`,
          padding: 'var(--kreati-space-2) var(--kreati-space-4)',
          borderRadius: 'var(--kreati-radius-sm)',
          cursor: 'pointer',
          ...base,
        }}>
          {s}
        </button>
      ))}
    </div>

    {/* Chips / Tags */}
    <SectionLabel>Tags (Light variant)</SectionLabel>
    <div style={{ display: 'flex', gap: 'var(--kreati-space-2)', flexWrap: 'wrap' }}>
      {severities.map((s) => (
        <span key={s} style={{
          background: `var(--kreati-severity-${s}-light)`,
          color: `var(--kreati-severity-${s})`,
          padding: 'var(--kreati-space-1) var(--kreati-space-3)',
          borderRadius: 'var(--kreati-radius-full)',
          fontSize: 'var(--kreati-font-size-xs)',
          fontWeight: 'var(--kreati-font-weight-medium)' as any,
        }}>
          {s}
        </span>
      ))}
    </div>

    {/* Card + Input */}
    <SectionLabel>Surface / Card</SectionLabel>
    <div style={{
      background: 'var(--kreati-white)',
      border: '1px solid var(--kreati-gray-200)',
      borderRadius: 'var(--kreati-radius-md)',
      padding: 'var(--kreati-space-4)',
      boxShadow: 'var(--kreati-shadow-md)',
    }}>
      <div style={{ fontWeight: 'var(--kreati-font-weight-semibold)' as any, marginBottom: 'var(--kreati-space-1)' }}>
        Card Title
      </div>
      <div style={{ color: 'var(--kreati-gray-500)', fontSize: 'var(--kreati-font-size-xs)', marginBottom: 'var(--kreati-space-3)' }}>
        Surface color, text hierarchy, borders, and shadows.
      </div>
      <div style={{
        padding: 'var(--kreati-space-2) var(--kreati-space-3)',
        border: '1px solid var(--kreati-gray-300)',
        borderRadius: 'var(--kreati-radius-sm)',
        color: 'var(--kreati-gray-400)',
        fontSize: 'var(--kreati-font-size-sm)',
        background: 'var(--kreati-white)',
      }}>
        Input placeholder...
      </div>
    </div>

    {/* Gray scale */}
    <SectionLabel>Gray Scale</SectionLabel>
    <div style={{ display: 'flex', gap: 2 }}>
      {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((g, i, arr) => (
        <div key={g} style={{
          flex: 1, height: 24,
          background: `var(--kreati-gray-${g})`,
          borderRadius: i === 0 ? 'var(--kreati-radius-sm) 0 0 var(--kreati-radius-sm)' : i === arr.length - 1 ? '0 var(--kreati-radius-sm) var(--kreati-radius-sm) 0' : '0',
        }} title={`gray-${g}`} />
      ))}
    </div>

    {/* Text hierarchy */}
    <SectionLabel>Text Hierarchy</SectionLabel>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ color: 'var(--kreati-gray-900)', fontWeight: 'var(--kreati-font-weight-semibold)' as any }}>Heading — gray-900</span>
      <span style={{ color: 'var(--kreati-gray-800)' }}>Body text — gray-800</span>
      <span style={{ color: 'var(--kreati-gray-600)' }}>Secondary — gray-600</span>
      <span style={{ color: 'var(--kreati-gray-500)' }}>Muted — gray-500</span>
      <span style={{ color: 'var(--kreati-gray-400)' }}>Disabled — gray-400</span>
    </div>
  </ThemeBox>
);

export const AllThemes: Story = {
  name: 'All Themes',
  render: () => (
    <div style={{
      padding: 'var(--kreati-space-4)',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
      gap: 'var(--kreati-space-4)',
      ...base,
    }}>
      {themes.map((t) => <FullCard key={t} theme={t} />)}
    </div>
  ),
};

const InteractiveDemo = () => {
  const [theme, setTheme] = useState<string>('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-kreati-theme', theme === 'light' ? '' : theme);
    return () => document.documentElement.removeAttribute('data-kreati-theme');
  }, [theme]);

  return (
    <div style={{
      padding: 'var(--kreati-space-6)',
      background: 'var(--kreati-background)',
      minHeight: '100vh',
      transition: 'background 0.3s ease',
      ...base,
    }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Theme selector */}
        <div style={{ marginBottom: 'var(--kreati-space-6)' }}>
          <div style={{
            fontFamily: 'var(--kreati-font-family-display)',
            fontWeight: 'var(--kreati-font-weight-bold)' as any,
            fontSize: 'var(--kreati-font-size-xl)',
            color: 'var(--kreati-gray-900)',
            marginBottom: 'var(--kreati-space-3)',
          }}>
            Theme Switcher
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--kreati-space-2)' }}>
            {themes.map((t) => (
              <button key={t} onClick={() => setTheme(t)} style={{
                background: theme === t ? 'var(--kreati-severity-primary)' : 'var(--kreati-white)',
                color: theme === t ? 'var(--kreati-severity-primary-text)' : 'var(--kreati-gray-700)',
                border: `2px solid ${theme === t ? 'var(--kreati-severity-primary)' : 'var(--kreati-gray-300)'}`,
                padding: 'var(--kreati-space-2) var(--kreati-space-4)',
                borderRadius: 'var(--kreati-radius-sm)',
                cursor: 'pointer',
                ...base,
                fontWeight: theme === t ? 'var(--kreati-font-weight-semibold)' as any : 'normal',
              }}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard card */}
        <div style={{
          background: 'var(--kreati-white)',
          border: '1px solid var(--kreati-gray-200)',
          borderRadius: 'var(--kreati-radius-lg)',
          padding: 'var(--kreati-space-6)',
          boxShadow: 'var(--kreati-shadow-lg)',
          marginBottom: 'var(--kreati-space-4)',
        }}>
          <div style={{
            fontFamily: 'var(--kreati-font-family-display)',
            fontWeight: 'var(--kreati-font-weight-semibold)' as any,
            fontSize: 'var(--kreati-font-size-md)',
            marginBottom: 'var(--kreati-space-4)',
            color: 'var(--kreati-gray-900)',
          }}>
            Dashboard
          </div>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--kreati-space-3)', marginBottom: 'var(--kreati-space-4)' }}>
            {[
              { label: 'Revenue', value: '$12,450', sev: 'success' },
              { label: 'Users', value: '1,234', sev: 'info' },
              { label: 'Issues', value: '23', sev: 'danger' },
            ].map(({ label, value, sev }) => (
              <div key={label} style={{
                background: `var(--kreati-severity-${sev}-light)`,
                padding: 'var(--kreati-space-3)',
                borderRadius: 'var(--kreati-radius-md)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 'var(--kreati-font-size-lg)', fontWeight: 'var(--kreati-font-weight-bold)' as any, color: `var(--kreati-severity-${sev})` }}>{value}</div>
                <div style={{ fontSize: 'var(--kreati-font-size-xs)', color: 'var(--kreati-gray-500)' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{
            padding: 'var(--kreati-space-2) var(--kreati-space-3)',
            border: '1px solid var(--kreati-gray-300)',
            borderRadius: 'var(--kreati-radius-sm)',
            color: 'var(--kreati-gray-400)',
            marginBottom: 'var(--kreati-space-4)',
          }}>
            Search...
          </div>

          {/* All severity buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--kreati-space-2)', marginBottom: 'var(--kreati-space-4)' }}>
            {severities.map((s) => (
              <button key={s} style={{
                background: `var(--kreati-severity-${s})`,
                color: `var(--kreati-severity-${s}-text)`,
                border: 'none',
                padding: 'var(--kreati-space-2) var(--kreati-space-4)',
                borderRadius: 'var(--kreati-radius-sm)',
                cursor: 'pointer',
                fontWeight: 'var(--kreati-font-weight-medium)' as any,
                ...base,
              }}>
                {s}
              </button>
            ))}
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--kreati-space-2)' }}>
            {severities.map((s) => (
              <span key={s} style={{
                background: `var(--kreati-severity-${s}-light)`,
                color: `var(--kreati-severity-${s})`,
                padding: 'var(--kreati-space-1) var(--kreati-space-3)',
                borderRadius: 'var(--kreati-radius-full)',
                fontSize: 'var(--kreati-font-size-xs)',
              }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Interactive: Story = {
  name: 'Interactive Switcher',
  render: () => <InteractiveDemo />,
};

export const Usage: Story = {
  name: 'Usage Guide',
  render: () => (
    <div style={{ padding: 'var(--kreati-space-6)', maxWidth: 700, ...base }}>
      <div style={{
        fontFamily: 'var(--kreati-font-family-display)',
        fontWeight: 'var(--kreati-font-weight-bold)' as any,
        fontSize: 'var(--kreati-font-size-lg)',
        marginBottom: 'var(--kreati-space-4)',
      }}>
        Theme Usage
      </div>

      <div style={{
        background: 'var(--kreati-gray-50)',
        padding: 'var(--kreati-space-4)',
        borderRadius: 'var(--kreati-radius-md)',
        marginBottom: 'var(--kreati-space-4)',
        fontFamily: 'var(--kreati-font-family-mono)',
        fontSize: 'var(--kreati-font-size-xs)',
        whiteSpace: 'pre',
        overflowX: 'auto',
      }}>
{`// 1. Import theme CSS
import '@kreatiware/react/themes/dark.css';

// 2. Set theme on provider
<KreatiProvider theme="dark" locale={es}>
  <App />
</KreatiProvider>

// 3. Auto dark mode
<KreatiProvider theme="auto">

// 4. Programmatic switching
const { resolvedTheme, setTheme } = useKreatiTheme();`}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--kreati-font-size-xs)' }}>
        <thead>
          <tr>
            {['Theme', 'Type', 'Import'].map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: 'var(--kreati-space-2)', borderBottom: '2px solid var(--kreati-gray-200)', fontWeight: 'var(--kreati-font-weight-semibold)' as any }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            ['light', 'Default', '(built-in)'],
            ['dark', 'Dark', 'themes/dark.css'],
            ['midnight', 'Dark (blue)', 'themes/midnight.css'],
            ['abyss', 'Dark (OLED)', 'themes/abyss.css'],
            ['soft', 'Light (warm)', 'themes/soft.css'],
            ['arctic', 'Light (cool)', 'themes/arctic.css'],
            ['high-contrast', 'Accessibility', 'themes/high-contrast.css'],
            ['kreati', 'Brand', 'themes/kreati.css'],
          ].map(([name, type, imp]) => (
            <tr key={name}>
              <td style={{ padding: 'var(--kreati-space-2)', borderBottom: '1px solid var(--kreati-gray-100)', fontWeight: 'var(--kreati-font-weight-medium)' as any }}>{name}</td>
              <td style={{ padding: 'var(--kreati-space-2)', borderBottom: '1px solid var(--kreati-gray-100)', color: 'var(--kreati-gray-500)' }}>{type}</td>
              <td style={{ padding: 'var(--kreati-space-2)', borderBottom: '1px solid var(--kreati-gray-100)', fontFamily: 'var(--kreati-font-family-mono)' }}>{imp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
};
