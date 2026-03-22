import type { Meta, StoryObj } from '@storybook/react';
import { DynamicSvg } from '../../../../packages/react/src/components/DynamicSvg';

/**
 * Inline SVG used as a data URI for stories (avoids needing actual SVG files).
 * Contains elements with ids and classes for testing overrides.
 */
const testSvg = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect id="bg" x="0" y="0" width="200" height="200" fill="#f0f0f0" rx="12" />
  <circle id="sun" cx="150" cy="50" r="25" fill="#ffdb4f" />
  <path id="hull" d="M30 140 Q100 180 170 140 L160 160 Q100 190 40 160 Z" fill="#095172" />
  <polygon id="sail" points="100,40 100,130 50,130" fill="#0f78a5" />
  <polygon class="accent" points="100,50 100,130 140,130" fill="#b3d9ed" />
  <line class="detail" x1="100" y1="40" x2="100" y2="130" stroke="#074461" stroke-width="2" />
  <circle class="detail" cx="100" cy="38" r="3" fill="#ef4444" />
</svg>
`)}`;

const meta = {
  title: 'Components/DynamicSvg',
  component: DynamicSvg,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Loads an SVG from a local asset (src) or external URL (url) and renders it inline with support for per-element style overrides by id or class, global defaults, CSS animations, and accessibility.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    width: { control: 'text' },
    height: { control: 'text' },
    fill: { control: 'color' },
    stroke: { control: 'color' },
    strokeWidth: { control: 'number' },
    opacity: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
  },
} satisfies Meta<typeof DynamicSvg>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default — renders the SVG as-is without modifications.
 */
export const Default: Story = {
  args: {
    src: testSvg,
    width: 300,
  },
};

/**
 * Global fill — applies a single fill color to all elements.
 */
export const GlobalFill: Story = {
  args: {
    src: testSvg,
    width: 300,
    fill: '#0f78a5',
  },
};

/**
 * Global stroke — adds stroke to all elements.
 */
export const GlobalStroke: Story = {
  args: {
    src: testSvg,
    width: 300,
    stroke: '#095172',
    strokeWidth: 1.5,
  },
};

/**
 * Override by ID — targets specific elements by their id attribute.
 */
export const OverrideById: Story = {
  args: {
    src: testSvg,
    width: 300,
    overrides: {
      hull: { fill: '#ef4444', strokeWidth: 2, stroke: '#b91c1c' },
      sail: { fill: '#ffdb4f' },
      sun: { fill: '#10b981' },
    },
  },
};

/**
 * Override by class — targets elements by their CSS class.
 */
export const OverrideByClass: Story = {
  args: {
    src: testSvg,
    width: 300,
    overrides: {
      '.accent': { fill: '#a855f7', opacity: 0.7 },
      '.detail': { stroke: '#ffdb4f', fill: '#ffdb4f' },
    },
  },
};

/**
 * Mixed overrides — combines id and class targeting with global defaults.
 */
export const MixedOverrides: Story = {
  args: {
    src: testSvg,
    width: 300,
    fill: '#6b7280',
    overrides: {
      sun: { fill: '#f59e0b' },
      hull: { fill: '#095172' },
      '.accent': { fill: '#deeff7' },
    },
  },
};

/**
 * Animation — pulse animation on the sun element.
 */
export const AnimationPulse: Story = {
  args: {
    src: testSvg,
    width: 300,
    overrides: {
      sun: {
        fill: '#ffdb4f',
        animation: {
          keyframes: {
            '0%, 100%': { transform: 'scale(1)', opacity: '1' },
            '50%': { transform: 'scale(1.2)', opacity: '0.7' },
          },
          duration: '2s',
          easing: 'ease-in-out',
          iterations: 'infinite',
        },
      },
    },
  },
};

/**
 * Animation — sail sway with alternate direction.
 */
export const AnimationSway: Story = {
  args: {
    src: testSvg,
    width: 300,
    overrides: {
      sail: {
        fill: '#0f78a5',
        animation: {
          keyframes: {
            '0%, 100%': { transform: 'rotate(0deg)' },
            '50%': { transform: 'rotate(3deg)' },
          },
          duration: '3s',
          easing: 'ease-in-out',
          iterations: 'infinite',
          direction: 'alternate',
        },
      },
    },
  },
};

/**
 * Multiple animations — different animations on different elements.
 */
export const MultipleAnimations: Story = {
  args: {
    src: testSvg,
    width: 300,
    overrides: {
      sun: {
        fill: '#ffdb4f',
        animation: {
          keyframes: {
            '0%, 100%': { opacity: '0.6' },
            '50%': { opacity: '1' },
          },
          duration: '2s',
          iterations: 'infinite',
        },
      },
      hull: {
        fill: '#095172',
        animation: {
          keyframes: {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(3px)' },
          },
          duration: '4s',
          easing: 'ease-in-out',
          iterations: 'infinite',
        },
      },
      '.accent': {
        fill: '#b3d9ed',
        animation: {
          keyframes: {
            '0%': { fillOpacity: '0.5' },
            '100%': { fillOpacity: '1' },
          },
          duration: '1.5s',
          iterations: 'infinite',
          direction: 'alternate',
        },
      },
    },
  },
};

/**
 * Custom size — demonstrates width/height props.
 */
export const CustomSize: Story = {
  args: {
    src: testSvg,
    width: 500,
    height: 500,
  },
};

/**
 * Kreatiware themed — using the brand color palette.
 */
export const KreatiwareThemed: Story = {
  args: {
    src: testSvg,
    width: 300,
    overrides: {
      bg: { fill: '#deeff7' },
      hull: { fill: '#095172' },
      sail: { fill: '#0f78a5' },
      '.accent': { fill: '#ffdb4f' },
      sun: {
        fill: '#ffdb4f',
        animation: {
          keyframes: {
            '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
            '50%': { opacity: '1', transform: 'scale(1.1)' },
          },
          duration: '3s',
          easing: 'ease-in-out',
          iterations: 'infinite',
        },
      },
    },
  },
};
