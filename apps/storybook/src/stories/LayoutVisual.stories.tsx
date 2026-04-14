import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Layout/Visual',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Visual utilities: border radius, shadow, opacity, z-index, cursor, colors, and borders.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

const base: React.CSSProperties = { fontFamily: 'var(--kreati-font-family)', fontSize: 'var(--kreati-font-size-xs)' };
const label: React.CSSProperties = { ...base, color: 'var(--kreati-gray-500)', margin: '0 0 var(--kreati-space-2) 0', fontWeight: 'var(--kreati-font-weight-semibold)' as string };
const section: React.CSSProperties = { marginBottom: 'var(--kreati-space-8)' };

export const BorderRadius: Story = {
  render: () => (
    <div style={section}>
      <p style={label}>Border Radius</p>
      <div className="k-flex k-flex-wrap k-gap-4 k-items-end">
        {(['none', 'sm', 'md', 'lg', 'xl', 'full'] as const).map((r) => (
          <div key={r} className="k-flex k-flex-col k-items-center k-gap-1">
            <div className={`k-rounded-${r} k-bg-primary k-p-4`} style={{ width: '64px', height: '64px' }} />
            <span style={{ ...base, color: 'var(--kreati-gray-500)' }}>{r}</span>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const Shadows: Story = {
  render: () => (
    <div style={section}>
      <p style={label}>Box Shadow</p>
      <div className="k-flex k-flex-wrap k-gap-6 k-items-end">
        {(['none', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
          <div key={s} className="k-flex k-flex-col k-items-center k-gap-2">
            <div className={`k-shadow-${s} k-rounded-md k-bg-white k-p-6`} style={{ width: '100px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ ...base, color: 'var(--kreati-gray-500)' }}>{s}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const Opacity: Story = {
  render: () => (
    <div style={section}>
      <p style={label}>Opacity</p>
      <div className="k-flex k-gap-4">
        {[0, 25, 50, 75, 100].map((o) => (
          <div key={o} className="k-flex k-flex-col k-items-center k-gap-1">
            <div className={`k-opacity-${o} k-bg-primary k-rounded-md k-p-4`} style={{ width: '64px', height: '64px' }} />
            <span style={{ ...base, color: 'var(--kreati-gray-500)' }}>{o}%</span>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const TextColors: Story = {
  name: 'Text Colors',
  render: () => {
    const colors = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'black', 'muted', 'gray-300', 'gray-500', 'gray-700', 'gray-900'];
    return (
      <div style={section}>
        <p style={label}>Text Colors</p>
        <div className="k-flex k-flex-col k-gap-1">
          {colors.map((c) => (
            <span key={c} className={`k-text-${c} k-font-medium`} style={{ ...base, fontSize: 'var(--kreati-font-size-sm)' }}>
              .k-text-{c} — The quick brown fox jumps over the lazy dog
            </span>
          ))}
          <span className="k-text-white k-bg-gray-800 k-rounded-sm k-px-2 k-py-1 k-font-medium" style={{ ...base, fontSize: 'var(--kreati-font-size-sm)', display: 'inline-block' }}>
            .k-text-white (on dark bg)
          </span>
        </div>
      </div>
    );
  },
};

export const BackgroundColors: Story = {
  name: 'Background Colors',
  render: () => {
    const semantic = ['primary', 'secondary', 'success', 'warning', 'danger', 'info'];
    const grays = ['gray-50', 'gray-100', 'gray-200', 'gray-300', 'gray-400', 'gray-500', 'gray-600', 'gray-700', 'gray-800', 'gray-900'];
    return (
      <div>
        <div style={section}>
          <p style={label}>Semantic</p>
          <div className="k-flex k-flex-wrap k-gap-2">
            {semantic.map((c) => (
              <div key={c} className={`k-bg-${c} k-text-white k-rounded-md k-px-4 k-py-3`} style={base}>
                .k-bg-{c}
              </div>
            ))}
          </div>
        </div>
        <div style={section}>
          <p style={label}>Gray Scale</p>
          <div className="k-flex k-flex-wrap k-gap-1">
            {grays.map((c) => {
              const dark = parseInt(c.split('-')[1]) >= 500;
              return (
                <div key={c} className={`k-bg-${c} ${dark ? 'k-text-white' : 'k-text-gray-800'} k-rounded-sm k-px-3 k-py-2`} style={{ ...base, minWidth: '80px', textAlign: 'center' }}>
                  {c.split('-')[1]}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
};

export const Borders: Story = {
  render: () => (
    <div>
      <div style={section}>
        <p style={label}>Border utilities</p>
        <div className="k-flex k-flex-wrap k-gap-4">
          {[
            ['k-border', 'border (all)'],
            ['k-border-t', 'border-t'],
            ['k-border-r', 'border-r'],
            ['k-border-b', 'border-b'],
            ['k-border-l', 'border-l'],
          ].map(([cls, desc]) => (
            <div key={cls} className={`${cls} k-rounded-md k-p-4 k-bg-white`} style={{ ...base, minWidth: '100px', textAlign: 'center' }}>
              {desc}
            </div>
          ))}
        </div>
      </div>
      <div style={section}>
        <p style={label}>Border colors</p>
        <div className="k-flex k-flex-wrap k-gap-4">
          {['k-border k-border-primary', 'k-border k-border-gray-300', 'k-border k-border-gray-400'].map((cls) => (
            <div key={cls} className={`${cls} k-rounded-md k-p-4 k-bg-white`} style={{ ...base, minWidth: '120px', textAlign: 'center' }}>
              {cls.split(' ')[1]}
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};

export const Cursors: Story = {
  render: () => (
    <div style={section}>
      <p style={label}>Cursor (hover to see)</p>
      <div className="k-flex k-flex-wrap k-gap-2">
        {['pointer', 'default', 'wait', 'text', 'move', 'not-allowed', 'grab', 'grabbing'].map((c) => (
          <div key={c} className={`k-cursor-${c} k-border k-rounded-md k-px-4 k-py-3 k-bg-white`} style={base}>
            {c}
          </div>
        ))}
      </div>
    </div>
  ),
};
