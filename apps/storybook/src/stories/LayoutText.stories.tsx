import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Layout/Text Utilities',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Text overflow, line clamping, word breaking, hyphens, and screen reader utilities.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

const base: React.CSSProperties = { fontFamily: 'var(--kreati-font-family)', fontSize: 'var(--kreati-font-size-sm)' };
const label: React.CSSProperties = { ...base, fontSize: 'var(--kreati-font-size-xs)', color: 'var(--kreati-gray-500)', margin: '0 0 var(--kreati-space-2) 0', fontWeight: 'var(--kreati-font-weight-semibold)' as string };
const section: React.CSSProperties = { marginBottom: 'var(--kreati-space-8)' };
const sampleText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.';

export const LineClamp: Story = {
  name: 'Line Clamp',
  render: () => (
    <div className="k-grid k-grid-cols-1 k-md:grid-cols-3 k-gap-4">
      {[1, 2, 3, 4, 5].map((n) => (
        <div key={n}>
          <p style={label}>.k-line-clamp-{n}</p>
          <div className={`k-line-clamp-${n} k-border k-rounded-md k-p-3`} style={base}>
            {sampleText}
          </div>
        </div>
      ))}
      <div>
        <p style={label}>.k-line-clamp-none (removes clamp)</p>
        <div className="k-line-clamp-none k-border k-rounded-md k-p-3" style={base}>
          {sampleText}
        </div>
      </div>
    </div>
  ),
};

export const Truncate: Story = {
  render: () => (
    <div>
      <div style={section}>
        <p style={label}>.k-truncate (single line ellipsis — already existed)</p>
        <div className="k-truncate k-border k-rounded-md k-p-3" style={{ ...base, maxWidth: '300px' }}>
          {sampleText}
        </div>
      </div>
      <div style={section}>
        <p style={label}>.k-text-ellipsis + .k-overflow-hidden + .k-whitespace-nowrap (manual combo)</p>
        <div className="k-text-ellipsis k-overflow-hidden k-whitespace-nowrap k-border k-rounded-md k-p-3" style={{ ...base, maxWidth: '300px' }}>
          {sampleText}
        </div>
      </div>
      <div style={section}>
        <p style={label}>.k-text-clip (clips without ellipsis)</p>
        <div className="k-text-clip k-overflow-hidden k-whitespace-nowrap k-border k-rounded-md k-p-3" style={{ ...base, maxWidth: '300px' }}>
          {sampleText}
        </div>
      </div>
    </div>
  ),
};

export const WordBreak: Story = {
  name: 'Word Breaking',
  render: () => (
    <div className="k-grid k-grid-cols-1 k-md:grid-cols-3 k-gap-4">
      <div>
        <p style={label}>.k-break-words (overflow-wrap)</p>
        <div className="k-break-words k-border k-rounded-md k-p-3" style={{ ...base, width: '150px' }}>
          Superlongwordthatwontfitinasmallcontainerandneedstobebrokensomehow
        </div>
      </div>
      <div>
        <p style={label}>.k-break-all (break anywhere)</p>
        <div className="k-break-all k-border k-rounded-md k-p-3" style={{ ...base, width: '150px' }}>
          Superlongwordthatwontfitinasmallcontainerandneedstobebrokensomehow
        </div>
      </div>
      <div>
        <p style={label}>.k-hyphens-auto (auto hyphenation)</p>
        <div className="k-hyphens-auto k-border k-rounded-md k-p-3" style={{ ...base, width: '150px' }} lang="en">
          Internationalization and accessibility are important considerations for modern applications.
        </div>
      </div>
    </div>
  ),
};

export const ScreenReaderOnly: Story = {
  name: 'Screen Reader Only',
  render: () => (
    <div>
      <div style={section}>
        <p style={label}>.k-sr-only (visually hidden, accessible to screen readers)</p>
        <div className="k-border k-rounded-md k-p-4" style={base}>
          <p>The button below has a visually hidden label for screen readers:</p>
          <button className="k-bg-primary k-text-white k-rounded-md k-px-4 k-py-2 k-border-0 k-cursor-pointer k-mt-2" style={base}>
            X <span className="k-sr-only">Close dialog</span>
          </button>
          <p className="k-mt-2 k-text-muted" style={{ fontSize: 'var(--kreati-font-size-xs)' }}>
            The &quot;X&quot; button visually shows &quot;X&quot; but screen readers announce &quot;X Close dialog&quot;
          </p>
        </div>
      </div>
      <div style={section}>
        <p style={label}>Common use: skip navigation link</p>
        <div className="k-border k-rounded-md k-p-4 k-relative" style={base}>
          <a href="#main" className="k-sr-only" style={{ ...base, position: 'absolute' }}>Skip to main content</a>
          <p className="k-text-muted" style={{ fontSize: 'var(--kreati-font-size-xs)' }}>
            There is a &quot;Skip to main content&quot; link here, only visible to screen readers (or when focused via Tab).
          </p>
        </div>
      </div>
    </div>
  ),
};
