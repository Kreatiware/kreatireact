import type { Meta, StoryObj } from '@storybook/react';
import { HeroSection } from '../../../../packages/react/src/components/HeroSection';
import { Chip } from '../../../../packages/react/src/components/Chip';
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
      options: ['single', 'split', 'split-full'],
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
    backgroundColor: {
      control: 'color',
    },
    gradientFrom: {
      control: 'color',
    },
    gradientTo: {
      control: 'color',
    },
    glassColor: {
      control: 'color',
    },
    glassOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
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
    badge: <Chip variant="primary">🚀 Nuevo</Chip>,
    actions: (
      <>
        <Button label="Comenzar" severity="primary" />
        <Button label="Ver demo" severity="primary" buttonType="outlined" />
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
    badge: <Chip variant="success">✅ Disponible</Chip>,
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
    actions: <Button label="Explorar" severity="primary" />,
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
        <Button label="Descubrir" severity="primary" />
        <Button label="Más info" severity="primary" buttonType="outlined" />
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
    badge: <Chip variant="outline">✨ Glass</Chip>,
    actions: <Button label="Comenzar" severity="primary" />,
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
    badge: <Chip variant="primary">🚀 Premium</Chip>,
    actions: (
      <>
        <Button label="Empezar" severity="primary" />
        <Button label="Demo" severity="primary" buttonType="outlined" />
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
    badge: <Chip variant="secondary">📝 Blog</Chip>,
    actions: <Button label="Leer más" severity="primary" />,
  },
};

// --- Split Full Stories ---

const fullMediaPlaceholder = (bg: string, label: string) => (
  <div style={{
    width: '100%',
    height: '100%',
    minHeight: '60vh',
    background: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: 20,
    fontWeight: 600,
  }}>
    {label}
  </div>
);

/**
 * Split Full layout — content and media each take a full half of the viewport.
 */
export const SplitFull: Story = {
  args: {
    title: 'Ocupa todo el espacio',
    subtitle: 'El contenido y la media se dividen en dos mitades completas del viewport.',
    layout: 'split-full',
    align: 'left',
    size: 'lg',
    background: 'solid',
    badge: <Chip variant="primary">🖥️ Full</Chip>,
    media: fullMediaPlaceholder('linear-gradient(135deg, #0f78a5, #06b6d4)', '📷 Media'),
    actions: (
      <>
        <Button label="Explorar" severity="primary" />
        <Button label="Demo" severity="primary" buttonType="outlined" />
      </>
    ),
  },
};

/**
 * Split Full reversed — media on the left, content on the right.
 */
export const SplitFullReversed: Story = {
  args: {
    ...SplitFull.args,
    reverse: true,
    title: 'Media a la izquierda',
    subtitle: 'Usa reverse para invertir el orden en split-full.',
  },
};

/**
 * Split Full with dark background using backgroundColor prop.
 */
export const SplitFullDarkBg: Story = {
  args: {
    title: 'Fondo oscuro',
    subtitle: 'Split full sobre un fondo oscuro para contraste dramático.',
    layout: 'split-full',
    align: 'left',
    size: 'lg',
    background: 'solid',
    backgroundColor: '#111827',
    badge: <Chip variant="outline">🌙 Dark</Chip>,
    media: fullMediaPlaceholder('linear-gradient(135deg, #7c3aed, #a855f7)', '🎨 Media'),
    actions: <Button label="Comenzar" severity="primary" />,
  },
};

/**
 * Split Full with glass on gradient background.
 */
export const SplitFullGlassGradient: Story = {
  args: {
    title: 'Glass sobre gradiente',
    subtitle: 'Glassmorphism en layout split-full con fondo gradiente.',
    layout: 'split-full',
    align: 'left',
    size: 'lg',
    background: 'gradient',
    glass: true,
    badge: <Chip variant="primary">✨ Glass</Chip>,
    media: fullMediaPlaceholder('linear-gradient(135deg, #f59e0b, #ef4444)', '🔥 Media'),
    actions: <Button label="Explorar" severity="primary" />,
  },
};

/**
 * Custom gradient colors using gradientFrom/gradientTo props.
 */
export const CustomGradient: Story = {
  args: {
    title: 'Gradiente personalizado',
    subtitle: 'Usa gradientFrom y gradientTo para definir colores custom.',
    background: 'gradient',
    gradientFrom: '#7c3aed',
    gradientTo: '#06b6d4',
    size: 'lg',
    badge: <Chip variant="primary">🎨 Custom</Chip>,
    actions: <Button label="Explorar" severity="primary" />,
  },
};

/**
 * Custom background color with glass and custom glass settings.
 */
export const CustomBgWithGlass: Story = {
  args: {
    title: 'Fondo custom con glass',
    subtitle: 'backgroundColor + glassColor + glassOpacity para control total.',
    background: 'solid',
    backgroundColor: '#1e1b4b',
    glass: true,
    glassColor: '#818cf8',
    glassOpacity: 0.25,
    size: 'lg',
    badge: <Chip variant="outline">💎 Custom Glass</Chip>,
    actions: <Button label="Comenzar" severity="primary" />,
  },
};

/**
 * Glass opacity test — high opacity red glass to verify glassColor and glassOpacity work correctly.
 */
export const GlassOpacityTest: Story = {
  args: {
    title: 'Test de Glass Opacity',
    subtitle: 'Glass rojo con opacidad alta (0.6) para verificar que glassColor y glassOpacity funcionan en todos los layouts.',
    background: 'gradient',
    glass: true,
    glassColor: '#ff0000',
    glassOpacity: 0.6,
    size: 'md',
    badge: <Chip variant="error">🔴 Test</Chip>,
    actions: <Button label="Verificar" severity="danger" />,
  },
};

/**
 * Glass opacity test on split-full layout.
 */
export const GlassOpacityTestSplitFull: Story = {
  args: {
    title: 'Test Glass en Split Full',
    subtitle: 'Mismo test de glass rojo pero en layout split-full.',
    layout: 'split-full',
    align: 'left',
    background: 'gradient',
    glass: true,
    glassColor: '#ff0000',
    glassOpacity: 0.6,
    size: 'md',
    badge: <Chip variant="error">🔴 Split Full</Chip>,
    media: fullMediaPlaceholder('linear-gradient(135deg, #0f78a5, #06b6d4)', '📷 Media'),
    actions: <Button label="Verificar" severity="danger" />,
  },
};

/**
 * Split Full with glass on dark background using props.
 */
export const SplitFullGlassDark: Story = {
  args: {
    title: 'Glass sobre fondo oscuro',
    subtitle: 'Efecto glass con contraste sobre fondo oscuro.',
    layout: 'split-full',
    align: 'left',
    size: 'lg',
    background: 'solid',
    backgroundColor: '#111827',
    glass: true,
    glassColor: '#ffffff',
    glassOpacity: 0.08,
    badge: <Chip variant="outline">🌙 Glass Dark</Chip>,
    media: fullMediaPlaceholder('linear-gradient(135deg, #06b6d4, #3b82f6)', '💎 Media'),
    actions: <Button label="Ver más" severity="primary" />,
  },
};

/**
 * Split Full with glass on warm colored background using props.
 */
export const SplitFullGlassWarm: Story = {
  args: {
    title: 'Glass sobre fondo cálido',
    subtitle: 'Glassmorphism sobre un fondo de color cálido.',
    layout: 'split-full',
    align: 'left',
    size: 'lg',
    background: 'solid',
    backgroundColor: '#fef3c7',
    glass: true,
    glassColor: '#ffffff',
    glassOpacity: 0.4,
    badge: <Chip variant="secondary">🌅 Warm</Chip>,
    media: fullMediaPlaceholder('linear-gradient(135deg, #dc2626, #f97316)', '☀️ Media'),
    actions: <Button label="Descubrir" severity="primary" />,
  },
};

/**
 * Split Full with glass on blue/purple background using props.
 */
export const SplitFullGlassCool: Story = {
  args: {
    title: 'Glass sobre fondo frío',
    subtitle: 'Glassmorphism sobre un fondo azul/púrpura vibrante.',
    layout: 'split-full',
    align: 'left',
    size: 'lg',
    background: 'gradient',
    gradientFrom: '#4f46e5',
    gradientTo: '#7c3aed',
    glass: true,
    glassColor: '#ffffff',
    glassOpacity: 0.1,
    badge: <Chip variant="primary">❄️ Cool</Chip>,
    media: fullMediaPlaceholder('linear-gradient(135deg, #10b981, #059669)', '🌊 Media'),
    actions: (
      <>
        <Button label="Explorar" severity="primary" />
        <Button label="Demo" severity="primary" buttonType="outlined" />
      </>
    ),
  },
};
