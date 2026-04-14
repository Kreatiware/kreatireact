import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Foundation/Themes',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Kreati theme system. 6 built-in themes + Light default. Use `KreatiProvider theme="..."` or `useKreatiTheme()` to switch. Import themes individually or all at once.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

const themes = ['light', 'dark', 'midnight', 'abyss', 'soft', 'arctic', 'high-contrast', 'kreati'] as const;

const base: React.CSSProperties = { fontFamily: 'var(--kreati-font-family)', fontSize: 'var(--kreati-font-size-sm)' };

/** Wrapper that applies a theme via data attribute */
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

/** Sample component card to preview theme colors */
const SampleCard = ({ theme }: { theme: string }) => (
  <ThemeBox theme={theme}>
    <div style={{ marginBottom: 'var(--kreati-space-4)', fontWeight: 'var(--kreati-font-weight-bold)' as string, fontSize: 'var(--kreati-font-size-md)' }}>
      {theme.charAt(0).toUpperCase() + theme.slice(1)}
    </div>

    {/* Color swatches */}
    <div style={{ display: 'flex', gap: 'var(--kreati-space-1)', marginBottom: 'var(--kreati-space-3)', flexWrap: 'wrap' }}>
      {['primary', 'success', 'info', 'warning', 'danger', 'help'].map((s) => (
        <div key={s} style={{ width: '32px', height: '32px', borderRadius: 'var(--kreati-radius-sm)', background: `var(--kreati-severity-${s})` }} title={s} />
      ))}
    </div>

    {/* Buttons */}
    <div style={{ display: 'flex', gap: 'var(--kreati-space-2)', marginBottom: 'var(--kreati-space-3)', flexWrap: 'wrap' }}>
      <button style={{ background: 'var(--kreati-severity-primary)', color: 'var(--kreati-severity-primary-text)', border: 'none', padding: 'var(--kreati-space-2) var(--kreati-space-4)', borderRadius: 'var(--kreati-radius-sm)', cursor: 'pointer', ...base }}>
        Primary
      </button>
      <button style={{ background: 'transparent', color: 'var(--kreati-severity-primary)', border: '2px solid var(--kreati-severity-primary)', padding: 'var(--kreati-space-2) var(--kreati-space-4)', borderRadius: 'var(--kreati-radius-sm)', cursor: 'pointer', ...base }}>
        Outlined
      </button>
      <button style={{ background: 'var(--kreati-severity-secondary)', color: 'var(--kreati-severity-secondary-text)', border: 'none', padding: 'var(--kreati-space-2) var(--kreati-space-4)', borderRadius: 'var(--kreati-radius-sm)', cursor: 'pointer', ...base }}>
        Secondary
      </button>
    </div>

    {/* Card surface */}
    <div style={{ background: 'var(--kreati-white)', border: '1px solid var(--kreati-gray-200)', borderRadius: 'var(--kreati-radius-md)', padding: 'var(--kreati-space-4)', boxShadow: 'var(--kreati-shadow-md)' }}>
      <div style={{ fontWeight: 'var(--kreati-font-weight-semibold)' as string, marginBottom: 'var(--kreati-space-1)' }}>Card Surface</div>
      <div style={{ color: 'var(--kreati-gray-500)', fontSize: 'var(--kreati-font-size-xs)' }}>
        This shows the card/surface color, text, borders, and shadow for this theme.
      </div>
      {/* Input mock */}
      <div style={{ marginTop: 'var(--kreati-space-3)', padding: 'var(--kreati-space-2) var(--kreati-space-3)', border: '1px solid var(--kreati-gray-300)', borderRadius: 'var(--kreati-radius-sm)', color: 'var(--kreati-gray-400)', fontSize: 'var(--kreati-font-size-xs)' }}>
        Input placeholder...
      </div>
    </div>

    {/* Gray scale */}
    <div style={{ display: 'flex', gap: '2px', marginTop: 'var(--kreati-space-3)' }}>
      {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((g) => (
        <div key={g} style={{ flex: 1, height: '24px', background: `var(--kreati-gray-${g})`, borderRadius: g === 50 ? 'var(--kreati-radius-sm) 0 0 var(--kreati-radius-sm)' : g === 900 ? '0 var(--kreati-radius-sm) var(--kreati-radius-sm) 0' : '0' }} title={`gray-${g}`} />
      ))}
    </div>
  </ThemeBox>
);

export const AllThemes: Story = {
  name: 'All Themes',
  render: () => (
    <div style={{ padding: 'var(--kreati-space-4)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--kreati-space-4)', ...base }}>
      {themes.map((t) => (
        <SampleCard key={t} theme={t} />
      ))}
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
    <div style={{ padding: 'var(--kreati-space-6)', background: 'var(--kreati-background)', minHeight: '100vh', transition: 'background 0.3s ease', ...base }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ marginBottom: 'var(--kreati-space-6)' }}>
          <div style={{ fontWeight: 'var(--kreati-font-weight-bold)' as string, fontSize: 'var(--kreati-font-size-lg)', color: 'var(--kreati-gray-900)', marginBottom: 'var(--kreati-space-3)' }}>
            Theme Switcher
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--kreati-space-2)' }}>
            {themes.map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                style={{
                  background: theme === t ? 'var(--kreati-severity-primary)' : 'var(--kreati-white)',
                  color: theme === t ? 'var(--kreati-severity-primary-text)' : 'var(--kreati-gray-700)',
                  border: `2px solid ${theme === t ? 'var(--kreati-severity-primary)' : 'var(--kreati-gray-300)'}`,
                  padding: 'var(--kreati-space-2) var(--kreati-space-4)',
                  borderRadius: 'var(--kreati-radius-sm)',
                  cursor: 'pointer',
                  ...base,
                  fontWeight: theme === t ? 'var(--kreati-font-weight-semibold)' as string : 'normal',
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Sample content */}
        <div style={{ background: 'var(--kreati-white)', border: '1px solid var(--kreati-gray-200)', borderRadius: 'var(--kreati-radius-lg)', padding: 'var(--kreati-space-6)', boxShadow: 'var(--kreati-shadow-lg)', marginBottom: 'var(--kreati-space-4)' }}>
          <div style={{ fontWeight: 'var(--kreati-font-weight-semibold)' as string, fontSize: 'var(--kreati-font-size-md)', marginBottom: 'var(--kreati-space-2)', color: 'var(--kreati-gray-900)' }}>
            Dashboard Card
          </div>
          <div style={{ color: 'var(--kreati-gray-500)', marginBottom: 'var(--kreati-space-4)', fontSize: 'var(--kreati-font-size-sm)' }}>
            This card adapts to the selected theme. All colors, shadows, and surfaces change automatically.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--kreati-space-3)', marginBottom: 'var(--kreati-space-4)' }}>
            {[
              { label: 'Revenue', value: '$12,450', color: 'success' },
              { label: 'Users', value: '1,234', color: 'info' },
              { label: 'Issues', value: '23', color: 'danger' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: `var(--kreati-severity-${color}-light)`, padding: 'var(--kreati-space-3)', borderRadius: 'var(--kreati-radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--kreati-font-size-lg)', fontWeight: 'var(--kreati-font-weight-bold)' as string, color: `var(--kreati-severity-${color})` }}>{value}</div>
                <div style={{ fontSize: 'var(--kreati-font-size-xs)', color: 'var(--kreati-gray-500)' }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: 'var(--kreati-space-3)', border: '1px solid var(--kreati-gray-200)', borderRadius: 'var(--kreati-radius-sm)', color: 'var(--kreati-gray-400)', fontSize: 'var(--kreati-font-size-sm)' }}>
            Search...
          </div>
        </div>

        {/* Severity badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--kreati-space-2)' }}>
          {['primary', 'success', 'info', 'warning', 'danger', 'help'].map((s) => (
            <span key={s} style={{ background: `var(--kreati-severity-${s})`, color: `var(--kreati-severity-${s}-text)`, padding: 'var(--kreati-space-1) var(--kreati-space-3)', borderRadius: 'var(--kreati-radius-full)', fontSize: 'var(--kreati-font-size-xs)' }}>
              {s}
            </span>
          ))}
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
    <div style={{ padding: 'var(--kreati-space-6)', maxWidth: '700px', ...base }}>
      <div style={{ fontWeight: 'var(--kreati-font-weight-bold)' as string, fontSize: 'var(--kreati-font-size-lg)', marginBottom: 'var(--kreati-space-4)' }}>
        Theme Usage
      </div>

      <div style={{ background: 'var(--kreati-gray-50)', padding: 'var(--kreati-space-4)', borderRadius: 'var(--kreati-radius-md)', marginBottom: 'var(--kreati-space-4)', fontFamily: 'monospace', fontSize: 'var(--kreati-font-size-xs)', whiteSpace: 'pre', overflowX: 'auto' }}>
{`// 1. Import theme CSS (pick one or all)
import '@kreatiware/react/themes/dark.css';
// or: import '@kreatiware/react/themes/all.css';

// 2. Set theme on provider
<KreatiProvider theme="dark" locale={es}>
  <App />
</KreatiProvider>

// 3. Auto dark mode (follows system preference)
<KreatiProvider theme="auto">
  <App />
</KreatiProvider>

// 4. Toggle programmatically
const { resolvedTheme, setTheme } = useKreatiTheme();
<button onClick={() => setTheme(
  resolvedTheme === 'dark' ? 'light' : 'dark'
)}>
  Toggle
</button>`}
      </div>

      <div style={{ fontWeight: 'var(--kreati-font-weight-semibold)' as string, marginBottom: 'var(--kreati-space-2)' }}>Available themes:</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--kreati-font-size-xs)' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: 'var(--kreati-space-2)', borderBottom: '2px solid var(--kreati-gray-200)' }}>Theme</th>
            <th style={{ textAlign: 'left', padding: 'var(--kreati-space-2)', borderBottom: '2px solid var(--kreati-gray-200)' }}>Description</th>
            <th style={{ textAlign: 'left', padding: 'var(--kreati-space-2)', borderBottom: '2px solid var(--kreati-gray-200)' }}>Import</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['light', 'Default — no import needed', '(built-in)'],
            ['dark', 'Standard dark mode', 'themes/dark.css'],
            ['midnight', 'Deep dark, blue undertones', 'themes/midnight.css'],
            ['abyss', 'Pure black OLED', 'themes/abyss.css'],
            ['soft', 'Warm pastel light', 'themes/soft.css'],
            ['arctic', 'Cool blue-gray light', 'themes/arctic.css'],
            ['high-contrast', 'WCAG AAA accessibility', 'themes/high-contrast.css'],
            ['kreati', 'Kreatiware brand identity', 'themes/kreati.css'],
          ].map(([name, desc, imp]) => (
            <tr key={name}>
              <td style={{ padding: 'var(--kreati-space-2)', borderBottom: '1px solid var(--kreati-gray-100)', fontWeight: 'var(--kreati-font-weight-medium)' as string }}>{name}</td>
              <td style={{ padding: 'var(--kreati-space-2)', borderBottom: '1px solid var(--kreati-gray-100)', color: 'var(--kreati-gray-500)' }}>{desc}</td>
              <td style={{ padding: 'var(--kreati-space-2)', borderBottom: '1px solid var(--kreati-gray-100)', fontFamily: 'monospace' }}>{imp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
};
