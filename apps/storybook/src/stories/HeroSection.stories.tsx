import type { Meta, StoryObj } from '@storybook/react';
import { HeroSection } from '../../../../packages/react/src/components/HeroSection';
import { Badge } from '../../../../packages/react/src/components/Badge';
import { Button } from '../../../../packages/react/src/components/Button';

const meta = {
  title: 'Components/HeroSection',
  component: HeroSection,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A flexible hero section for landing pages. Supports single/split layouts, multiple backgrounds, glassmorphism effect, and responsive design.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    align: {
      control: 'select',
      options: ['left', 'center', 'right'],
    },
    layout: {
      control: 'select',
      options: ['single', 'split'],
    },
    background: {
      control: 'select',
      options: ['solid', 'gradient', 'image'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'fullscreen'],
    },
    glass: {
      control: 'boolean',
    },
    overlay: {
      control: 'boolean',
    },
    reverse: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof HeroSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default centered hero with gradient background.
 */
export const Default: Story = {
  args: {
    title: 'Construye interfaces increíbles',
    subtitle: 'Componentes React modernos, tipados y listos para producción.',
    background: 'gradient',
    size: 'lg',
    badge: <Badge variant="primary">🚀 Nuevo</Badge>,
    actions: (
      <>
        <Button variant="primary">Comenzar</Button>
        <Button variant="outline">Ver demo</Button>
      </>
    ),
  },
};

/**
 * Split layout with content on the left and media on the right.
 */
export const SplitLayout: Story = {
  args: {
    title: 'Diseño moderno y flexible',
    subtitle: 'Combina contenido y media lado a lado con el layout split.',
    layout: 'split',
    align: 'left',
    background: 'gradient',
    size: 'md',
    badge: <Badge variant="success">✅ Disponible</Badge>,
    media: (
      <div style={{
        width: '100%',
        height: 300,
        borderRadius: 8,
        background: 'linear-gradient(135deg, #0f78a5 0%, #0d6b94 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: 18,
      }}>
        Media Placeholder
      </div>
    ),
    actions: <Button variant="primary">Explorar</Button>,
  },
};

/**
 * Split layout with reversed order (media on the left).
 */
export const SplitReversed: Story = {
  args: {
    ...SplitLayout.args,
    reverse: true,
    title: 'Media a la izquierda',
    subtitle: 'Usa reverse para invertir el orden del contenido y la media.',
  },
};

/**
 * Hero with background image and dark overlay.
 */
export const BackgroundImage: Story = {
  args: {
    title: 'Explora nuevos horizontes',
    subtitle: 'Hero con imagen de fondo y overlay oscuro para legibilidad.',
    background: 'image',
    backgroundImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80',
    overlay: true,
    size: 'lg',
    actions: (
      <>
        <Button variant="primary">Descubrir</Button>
        <Button variant="outline">Más info</Button>
      </>
    ),
  },
};

/**
 * Glassmorphism effect on gradient background.
 */
export const GlassOnGradient: Story = {
  args: {
    title: 'Efecto Glassmorphism',
    subtitle: 'El contenido se muestra dentro de un panel con efecto de vidrio sobre el gradiente.',
    background: 'gradient',
    glass: true,
    size: 'lg',
    badge: <Badge variant="outline">✨ Glass</Badge>,
    actions: <Button variant="primary">Comenzar</Button>,
  },
};

/**
 * Glassmorphism effect on background image with overlay.
 */
export const GlassOnImage: Story = {
  args: {
    title: 'Glass sobre imagen',
    subtitle: 'Combina glassmorphism con imagen de fondo para un efecto visual premium.',
    background: 'image',
    backgroundImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80',
    overlay: true,
    glass: true,
    size: 'lg',
    badge: <Badge variant="primary">🚀 Premium</Badge>,
    actions: (
      <>
        <Button variant="primary">Empezar</Button>
        <Button variant="outline">Demo</Button>
      </>
    ),
  },
};

/**
 * Small hero section, useful for inner pages.
 */
export const SmallSize: Story = {
  args: {
    title: 'Hero compacto',
    subtitle: 'Ideal para páginas internas o secciones secundarias.',
    size: 'sm',
    background: 'solid',
  },
};

/**
 * Left-aligned hero content.
 */
export const LeftAligned: Story = {
  args: {
    title: 'Alineado a la izquierda',
    subtitle: 'Contenido alineado al inicio para un estilo más editorial.',
    align: 'left',
    background: 'gradient',
    size: 'md',
    badge: <Badge variant="secondary">📝 Blog</Badge>,
    actions: <Button variant="primary">Leer más</Button>,
  },
};
