import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Layout/Display & Sizing',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Display, position, width, height, overflow, aspect ratio, and object-fit utilities.',
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
const box: React.CSSProperties = { background: 'var(--kreati-severity-primary)', color: 'var(--kreati-white)', padding: 'var(--kreati-space-3)', borderRadius: 'var(--kreati-radius-sm)', ...base, textAlign: 'center' };

export const Display: Story = {
  render: () => (
    <div>
      <div style={section}>
        <p style={label}>.k-block / .k-inline-block / .k-inline / .k-hidden</p>
        <div style={{ background: 'var(--kreati-gray-50)', padding: 'var(--kreati-space-3)', borderRadius: 'var(--kreati-radius-sm)' }}>
          <span className="k-block k-mb-2" style={box}>block (full width)</span>
          <span className="k-inline-block k-mr-2" style={box}>inline-block</span>
          <span className="k-inline-block k-mr-2" style={box}>inline-block</span>
          <span className="k-hidden" style={box}>hidden (not visible)</span>
          <span className="k-inline" style={{ ...base, color: 'var(--kreati-gray-500)' }}> -- the hidden element is here but not shown</span>
        </div>
      </div>
      <div style={section}>
        <p style={label}>.k-visible / .k-invisible (visibility, keeps space)</p>
        <div className="k-flex k-gap-2">
          <div className="k-visible" style={box}>Visible</div>
          <div className="k-invisible" style={box}>Invisible (space kept)</div>
          <div className="k-visible" style={box}>Visible</div>
        </div>
      </div>
    </div>
  ),
};

export const Position: Story = {
  render: () => (
    <div>
      <div style={section}>
        <p style={label}>.k-relative + .k-absolute .k-top-0 .k-right-0</p>
        <div className="k-relative" style={{ background: 'var(--kreati-gray-100)', padding: 'var(--kreati-space-8)', borderRadius: 'var(--kreati-radius-md)', height: '120px' }}>
          <div className="k-absolute k-top-0 k-right-0" style={{ background: 'var(--kreati-severity-danger)', color: 'var(--kreati-white)', padding: 'var(--kreati-space-2) var(--kreati-space-3)', borderRadius: '0 var(--kreati-radius-md) 0 var(--kreati-radius-sm)', ...base }}>
            Badge (absolute top-right)
          </div>
          <span style={{ ...base, color: 'var(--kreati-gray-500)' }}>Parent is relative</span>
        </div>
      </div>
      <div style={section}>
        <p style={label}>.k-absolute .k-inset-0 (fill parent)</p>
        <div className="k-relative" style={{ background: 'var(--kreati-gray-100)', borderRadius: 'var(--kreati-radius-md)', height: '80px' }}>
          <div className="k-absolute k-inset-0 k-flex k-items-center k-justify-center" style={{ background: 'var(--kreati-primary-alpha-8)', borderRadius: 'var(--kreati-radius-md)' }}>
            <span style={{ ...base, color: 'var(--kreati-severity-primary)' }}>Overlay fills parent with inset-0</span>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const Widths: Story = {
  render: () => {
    const widths = [
      'k-w-full', 'k-w-1\\/2', 'k-w-1\\/3', 'k-w-2\\/3', 'k-w-1\\/4', 'k-w-3\\/4', 'k-w-1\\/5', 'k-w-4\\/5',
    ];
    const labels = ['full (100%)', '1/2 (50%)', '1/3 (33%)', '2/3 (66%)', '1/4 (25%)', '3/4 (75%)', '1/5 (20%)', '4/5 (80%)'];
    return (
      <div>
        <p style={label}>Fractional widths</p>
        {widths.map((w, i) => (
          <div key={w} style={{ marginBottom: 'var(--kreati-space-2)' }}>
            <div className={w.replace(/\\\//g, '/')} style={{ background: 'var(--kreati-severity-primary)', color: 'var(--kreati-white)', padding: 'var(--kreati-space-2) var(--kreati-space-3)', borderRadius: 'var(--kreati-radius-sm)', ...base }}>
              .k-w-{labels[i]}
            </div>
          </div>
        ))}
      </div>
    );
  },
};

export const MaxWidth: Story = {
  name: 'Max Width',
  render: () => (
    <div>
      <p style={label}>Max-width constrains element width</p>
      {(['xs', 'sm', 'md', 'lg', 'xl', 'prose'] as const).map((size) => (
        <div key={size} style={{ marginBottom: 'var(--kreati-space-2)' }}>
          <div className={`k-max-w-${size} k-w-full`} style={{ background: 'var(--kreati-severity-primary)', color: 'var(--kreati-white)', padding: 'var(--kreati-space-2) var(--kreati-space-3)', borderRadius: 'var(--kreati-radius-sm)', ...base }}>
            .k-max-w-{size}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const AspectRatio: Story = {
  name: 'Aspect Ratio',
  render: () => (
    <div className="k-grid k-grid-cols-3 k-gap-4">
      {([['square', '1:1'], ['video', '16:9'], ['4/3', '4:3']] as const).map(([cls, ratio]) => (
        <div key={cls}>
          <p style={label}>.k-aspect-{cls} ({ratio})</p>
          <div className={`k-aspect-${cls.replace('/', '\\/')}`} style={{ background: 'var(--kreati-gray-100)', borderRadius: 'var(--kreati-radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ ...base, color: 'var(--kreati-gray-400)' }}>{ratio}</span>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const ObjectFit: Story = {
  name: 'Object Fit',
  render: () => (
    <div>
      <p style={label}>Object-fit on images (200x100 container, square image)</p>
      <div className="k-grid k-grid-cols-2 k-md:grid-cols-5 k-gap-4">
        {(['contain', 'cover', 'fill', 'none', 'scale-down'] as const).map((fit) => (
          <div key={fit}>
            <p style={{ ...label, fontSize: 'var(--kreati-font-size-xxs)' }}>.k-object-{fit}</p>
            <div style={{ width: '100%', height: '100px', background: 'var(--kreati-gray-100)', borderRadius: 'var(--kreati-radius-sm)', overflow: 'hidden' }}>
              <img
                className={`k-object-${fit} k-w-full k-h-full`}
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%230f78a5' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' fill='white' text-anchor='middle' dy='.3em' font-size='14'%3E200x200%3C/text%3E%3C/svg%3E"
                alt={`object-${fit} demo`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const ResponsiveDisplay: Story = {
  name: 'Responsive Show/Hide',
  render: () => (
    <div style={section}>
      <p style={label}>Elements that show/hide at breakpoints (resize to test)</p>
      <div className="k-flex k-flex-wrap k-gap-2">
        <div className="k-hidden k-sm:block" style={{ ...box, background: 'var(--kreati-severity-success)' }}>
          Hidden on mobile, visible sm+
        </div>
        <div className="k-hidden k-md:block" style={{ ...box, background: 'var(--kreati-severity-info)' }}>
          Hidden until md+
        </div>
        <div className="k-block k-md:hidden" style={{ ...box, background: 'var(--kreati-severity-warning)' }}>
          Visible on mobile, hidden md+
        </div>
        <div className="k-hidden k-lg:block" style={{ ...box, background: 'var(--kreati-severity-danger)' }}>
          Hidden until lg+
        </div>
      </div>
    </div>
  ),
};
