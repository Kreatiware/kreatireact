import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Layout/Spacing',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Padding, margin, negative margin, and space-between utilities. All values use --kreati-space-* variables.',
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

export const PaddingScale: Story = {
  name: 'Padding Scale',
  render: () => (
    <div>
      {[0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16].map((n) => (
        <div key={n} style={section}>
          <p style={label}>.k-p-{n}</p>
          <div style={{ background: 'var(--kreati-primary-alpha-8)', borderRadius: 'var(--kreati-radius-sm)', display: 'inline-block' }}>
            <div className={`k-p-${n}`}>
              <div style={{ background: 'var(--kreati-severity-primary)', color: 'var(--kreati-white)', padding: 'var(--kreati-space-2) var(--kreati-space-3)', borderRadius: 'var(--kreati-radius-sm)', ...base }}>
                Content
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const PaddingDirections: Story = {
  name: 'Padding Directions',
  render: () => {
    const dirs = [
      { cls: 'k-px-6', desc: 'px-6 (horizontal)' },
      { cls: 'k-py-6', desc: 'py-6 (vertical)' },
      { cls: 'k-pt-6', desc: 'pt-6 (top)' },
      { cls: 'k-pr-6', desc: 'pr-6 (right)' },
      { cls: 'k-pb-6', desc: 'pb-6 (bottom)' },
      { cls: 'k-pl-6', desc: 'pl-6 (left)' },
    ];
    return (
      <div className="k-grid k-grid-cols-2 k-md:grid-cols-3 k-gap-4">
        {dirs.map(({ cls, desc }) => (
          <div key={cls}>
            <p style={label}>.{cls}</p>
            <div style={{ background: 'var(--kreati-primary-alpha-8)', borderRadius: 'var(--kreati-radius-sm)', display: 'inline-block' }}>
              <div className={cls}>
                <div style={{ background: 'var(--kreati-severity-primary)', color: 'var(--kreati-white)', padding: 'var(--kreati-space-2)', borderRadius: 'var(--kreati-radius-sm)', ...base, textAlign: 'center', minWidth: '60px' }}>
                  {desc}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  },
};

export const MarginAuto: Story = {
  name: 'Margin Auto (Centering)',
  render: () => (
    <div>
      <div style={section}>
        <p style={label}>.k-mx-auto (center horizontally)</p>
        <div style={{ background: 'var(--kreati-gray-50)', padding: 'var(--kreati-space-2)', borderRadius: 'var(--kreati-radius-sm)' }}>
          <div className="k-mx-auto" style={{ background: 'var(--kreati-severity-primary)', color: 'var(--kreati-white)', padding: 'var(--kreati-space-3)', borderRadius: 'var(--kreati-radius-sm)', width: '200px', textAlign: 'center', ...base }}>
            Centered
          </div>
        </div>
      </div>
      <div style={section}>
        <p style={label}>.k-ml-auto (push right)</p>
        <div style={{ background: 'var(--kreati-gray-50)', padding: 'var(--kreati-space-2)', borderRadius: 'var(--kreati-radius-sm)' }}>
          <div className="k-ml-auto" style={{ background: 'var(--kreati-severity-info)', color: 'var(--kreati-white)', padding: 'var(--kreati-space-3)', borderRadius: 'var(--kreati-radius-sm)', width: '200px', textAlign: 'center', ...base }}>
            Pushed right
          </div>
        </div>
      </div>
      <div style={section}>
        <p style={label}>.k-flex with .k-mt-auto (push to bottom)</p>
        <div className="k-flex k-flex-col" style={{ background: 'var(--kreati-gray-50)', padding: 'var(--kreati-space-2)', borderRadius: 'var(--kreati-radius-sm)', height: '150px' }}>
          <div style={{ background: 'var(--kreati-severity-primary)', color: 'var(--kreati-white)', padding: 'var(--kreati-space-2)', borderRadius: 'var(--kreati-radius-sm)', ...base, textAlign: 'center' }}>Top</div>
          <div className="k-mt-auto" style={{ background: 'var(--kreati-severity-success)', color: 'var(--kreati-white)', padding: 'var(--kreati-space-2)', borderRadius: 'var(--kreati-radius-sm)', ...base, textAlign: 'center' }}>mt-auto (bottom)</div>
        </div>
      </div>
    </div>
  ),
};

export const NegativeMargin: Story = {
  name: 'Negative Margin',
  render: () => (
    <div style={section}>
      <p style={label}>.k--mt-4 (pull element up by overlapping)</p>
      <div style={{ background: 'var(--kreati-gray-100)', padding: 'var(--kreati-space-4)', borderRadius: 'var(--kreati-radius-sm)' }}>
        <div style={{ background: 'var(--kreati-severity-primary)', color: 'var(--kreati-white)', padding: 'var(--kreati-space-4)', borderRadius: 'var(--kreati-radius-sm)', ...base, textAlign: 'center' }}>
          Base element
        </div>
        <div className="k--mt-4 k-mx-4" style={{ background: 'var(--kreati-severity-warning)', color: 'var(--kreati-white)', padding: 'var(--kreati-space-3)', borderRadius: 'var(--kreati-radius-sm)', ...base, textAlign: 'center', position: 'relative' }}>
          Overlapping with k--mt-4
        </div>
      </div>
    </div>
  ),
};

export const SpaceBetween: Story = {
  name: 'Space Between',
  render: () => (
    <div>
      <div style={section}>
        <p style={label}>.k-space-y-3 (vertical spacing between children)</p>
        <div className="k-space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} style={{ background: 'var(--kreati-severity-primary)', color: 'var(--kreati-white)', padding: 'var(--kreati-space-3)', borderRadius: 'var(--kreati-radius-sm)', ...base, textAlign: 'center' }}>
              Item {n}
            </div>
          ))}
        </div>
      </div>
      <div style={section}>
        <p style={label}>.k-flex .k-space-x-4 (horizontal spacing without gap)</p>
        <div className="k-flex k-space-x-4">
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ background: 'var(--kreati-severity-info)', color: 'var(--kreati-white)', padding: 'var(--kreati-space-3) var(--kreati-space-4)', borderRadius: 'var(--kreati-radius-sm)', ...base }}>
              Item {n}
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};

export const ResponsiveSpacing: Story = {
  name: 'Responsive Spacing',
  render: () => (
    <div style={section}>
      <p style={label}>Padding grows with screen: .k-p-2 .k-sm:p-4 .k-md:p-6 .k-lg:p-8</p>
      <code style={{ fontFamily: 'monospace', fontSize: 'var(--kreati-font-size-xxs)', color: 'var(--kreati-gray-400)', display: 'block', marginBottom: 'var(--kreati-space-2)' }}>
        Resize the browser to see padding change
      </code>
      <div style={{ background: 'var(--kreati-primary-alpha-8)', borderRadius: 'var(--kreati-radius-md)', display: 'inline-block' }}>
        <div className="k-p-2 k-sm:p-4 k-md:p-6 k-lg:p-8">
          <div style={{ background: 'var(--kreati-severity-primary)', color: 'var(--kreati-white)', padding: 'var(--kreati-space-4)', borderRadius: 'var(--kreati-radius-sm)', ...base, textAlign: 'center' }}>
            Responsive padding
          </div>
        </div>
      </div>
    </div>
  ),
};
