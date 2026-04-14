import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Layout/Patterns',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Advanced layout patterns: auto-fit/fill grids, CSS columns (masonry), and layout shortcuts (center, stack, cluster, sidebar, sticky footer).',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

const base: React.CSSProperties = { fontFamily: 'var(--kreati-font-family)', fontSize: 'var(--kreati-font-size-xs)' };
const label: React.CSSProperties = { ...base, color: 'var(--kreati-gray-500)', margin: '0 0 var(--kreati-space-2) 0', fontWeight: 'var(--kreati-font-weight-semibold)' as string };
const code: React.CSSProperties = { fontFamily: 'monospace', fontSize: 'var(--kreati-font-size-xxs)', color: 'var(--kreati-gray-400)', display: 'block', marginBottom: 'var(--kreati-space-2)' };
const section: React.CSSProperties = { marginBottom: 'var(--kreati-space-8)' };
const card: React.CSSProperties = { background: 'var(--kreati-white)', border: '1px solid var(--kreati-gray-200)', borderRadius: 'var(--kreati-radius-md)', padding: 'var(--kreati-space-4)', ...base };

export const AutoFitGrid: Story = {
  name: 'Auto-fit Grid',
  render: () => (
    <div>
      <div style={section}>
        <p style={label}>auto-fit: columns auto-adjust to available space (resize to see)</p>
        {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
          <div key={size} style={{ marginBottom: 'var(--kreati-space-4)' }}>
            <span style={code}>.k-grid .k-grid-auto-fit-{size} .k-gap-3</span>
            <div className={`k-grid k-grid-auto-fit-${size} k-gap-3`}>
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} style={{ ...card, textAlign: 'center' }}>Item {i + 1}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const AutoFillGrid: Story = {
  name: 'Auto-fill Grid',
  render: () => (
    <div style={section}>
      <p style={label}>auto-fill: creates empty columns if space allows (vs auto-fit which stretches)</p>
      <span style={code}>.k-grid .k-grid-auto-fill-md .k-gap-3 (3 items, but grid keeps empty slots)</span>
      <div className="k-grid k-grid-auto-fill-md k-gap-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} style={{ ...card, textAlign: 'center' }}>Item {i + 1}</div>
        ))}
      </div>
    </div>
  ),
};

export const CSSColumns: Story = {
  name: 'CSS Columns (Masonry)',
  render: () => {
    const heights = [120, 80, 150, 60, 130, 90, 110, 70, 140, 100];
    return (
      <div style={section}>
        <p style={label}>CSS columns create a masonry-like layout without JS</p>
        <span style={code}>.k-columns-3 .k-column-gap-4</span>
        <div className="k-columns-3 k-column-gap-4">
          {heights.map((h, i) => (
            <div key={i} className="k-break-inside-avoid k-mb-4" style={{ ...card, height: `${h}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--kreati-primary-alpha-8)' }}>
              Item {i + 1} ({h}px)
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export const Center: Story = {
  render: () => (
    <div style={section}>
      <p style={label}>.k-center (flex center both axes)</p>
      <div className="k-center k-bg-gray-100 k-rounded-lg" style={{ height: '200px' }}>
        <div style={{ ...card, textAlign: 'center' }}>Perfectly centered</div>
      </div>
    </div>
  ),
};

export const StackAndCluster: Story = {
  name: 'Stack & Cluster',
  render: () => (
    <div className="k-grid k-grid-cols-1 k-md:grid-cols-2 k-gap-8">
      <div>
        <p style={label}>.k-stack-3 (vertical with gap)</p>
        <div className="k-stack-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} style={{ ...card, background: 'var(--kreati-primary-alpha-8)' }}>Stack item {n}</div>
          ))}
        </div>
      </div>
      <div>
        <p style={label}>.k-cluster-2 (horizontal wrap with gap)</p>
        <div className="k-cluster-2">
          {['Tag', 'Another', 'Short', 'Longer tag', 'X', 'Medium', 'Tag', 'More'].map((t, i) => (
            <div key={i} className="k-bg-primary k-text-white k-rounded-full k-px-3 k-py-1" style={base}>{t}</div>
          ))}
        </div>
      </div>
    </div>
  ),
};

export const SidebarLayout: Story = {
  name: 'Sidebar Layout',
  render: () => (
    <div style={section}>
      <p style={label}>.k-with-sidebar (sidebar + main content, wraps on small screens)</p>
      <span style={code}>Sidebar has fixed basis (250px), main content grows to fill</span>
      <div className="k-with-sidebar">
        <aside className="k-bg-gray-100 k-rounded-md k-p-4" style={base}>
          <div className="k-stack-2">
            <strong>Sidebar</strong>
            <div>Nav item 1</div>
            <div>Nav item 2</div>
            <div>Nav item 3</div>
          </div>
        </aside>
        <main className="k-border k-rounded-md k-p-4" style={base}>
          <strong>Main Content</strong>
          <p style={{ marginTop: 'var(--kreati-space-2)', color: 'var(--kreati-gray-500)' }}>
            This area grows to fill the remaining space. On small screens, the sidebar wraps above the content.
          </p>
        </main>
      </div>
    </div>
  ),
};

export const StickyFooter: Story = {
  name: 'Sticky Footer',
  render: () => (
    <div style={section}>
      <p style={label}>.k-sticky-footer (footer sticks to bottom even with little content)</p>
      <div className="k-sticky-footer k-border k-rounded-md k-overflow-hidden" style={{ height: '300px' }}>
        <header className="k-bg-primary k-text-white k-p-3" style={base}>Header</header>
        <main className="k-p-4" style={base}>
          <p style={{ color: 'var(--kreati-gray-500)' }}>Short content — footer still at bottom.</p>
        </main>
        <footer className="k-bg-gray-800 k-text-white k-p-3" style={base}>Footer (pushed to bottom via mt-auto)</footer>
      </div>
    </div>
  ),
};
