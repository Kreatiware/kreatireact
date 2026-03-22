import React from 'react';
import './HeroSection.css';

/**
 * Props for the HeroSection component
 */
export interface HeroSectionProps {
  /** Main heading text (renders as h1) */
  title: string;
  /** Descriptive text below the title */
  subtitle?: string;
  /** Badge text displayed above the title */
  badge?: React.ReactNode;
  /** Action buttons (CTA area) */
  actions?: React.ReactNode;
  /** Visual media content (image, video, component) */
  media?: React.ReactNode;
  /** Content alignment */
  align?: 'left' | 'center' | 'right';
  /** Layout mode: single (content only), split (content + media), or split-full (full-width halves) */
  layout?: 'single' | 'split' | 'split-full';
  /** Reverse content/media order in split layout */
  reverse?: boolean;
  /** Background style */
  background?: 'solid' | 'gradient' | 'image';
  /** Background image URL (when background is 'image') */
  backgroundImage?: string;
  /** Custom solid background color (overrides default) */
  backgroundColor?: string;
  /** Gradient start color (overrides theme default) */
  gradientFrom?: string;
  /** Gradient end color (overrides theme default) */
  gradientTo?: string;
  /** Dark overlay on background image for text readability */
  overlay?: boolean;
  /** Height of the hero section */
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
  /** Glassmorphism effect on the content container */
  glass?: boolean;
  /** Custom glass panel background color */
  glassColor?: string;
  /** Custom glass panel opacity (0-1) */
  glassOpacity?: number;
  /** HTML id attribute for anchor links */
  id?: string;
  /** Additional CSS class names */
  className?: string;
}

/**
 * HeroSection component for landing page hero areas
 *
 * @description A flexible hero section container that handles layout,
 * background and sizing. Supports single column (centered content) and
 * split layout (content + media side by side). Built with semantic HTML
 * and CSS BEM methodology.
 *
 * @example
 * ```tsx
 * <HeroSection
 *   align="center"
 *   layout="split"
 *   background="gradient"
 *   size="lg"
 *   title="Construye más rápido"
 *   subtitle="Componentes React modernos y tipados"
 *   badge={<Badge variant="primary">🚀 v1.0</Badge>}
 *   media={<img src="/hero.png" alt="Hero" />}
 *   actions={
 *     <>
 *       <Button variant="primary">Comenzar</Button>
 *       <Button variant="outline">Ver demo</Button>
 *     </>
 *   }
 * />
 * ```
 */
export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  badge,
  actions,
  media,
  align = 'center',
  layout = 'single',
  reverse = false,
  background = 'solid',
  backgroundImage,
  backgroundColor,
  gradientFrom,
  gradientTo,
  overlay = false,
  size = 'lg',
  glass = false,
  glassColor,
  glassOpacity,
  id,
  className = '',
}) => {
  const baseClass = 'kreati-hero';
  const classes = [
    baseClass,
    `${baseClass}--${align}`,
    `${baseClass}--${layout.replace('-', '-')}`,
    `${baseClass}--${size}`,
    `${baseClass}--bg-${background}`,
    reverse && `${baseClass}--reverse`,
    overlay && `${baseClass}--overlay`,
    glass && `${baseClass}--glass`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Convert hex color + opacity to rgba for glass background
  const getGlassBg = (): string | undefined => {
    if (!glass) return undefined;
    const hex = glassColor || (background === 'image' ? '#000000' : '#ffffff');
    const opacity = glassOpacity ?? (background === 'gradient' ? 0.3 : background === 'image' ? 0.2 : 0.15);
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const sectionStyle: React.CSSProperties = {
    ...(background === 'image' && backgroundImage && { backgroundImage: `url(${backgroundImage})` }),
    ...(backgroundColor && { '--kreati-hero-bg': backgroundColor } as React.CSSProperties),
    ...(gradientFrom && { '--kreati-hero-gradient-from': gradientFrom } as React.CSSProperties),
    ...(gradientTo && { '--kreati-hero-gradient-to': gradientTo } as React.CSSProperties),
    ...(glass && { '--kreati-hero-glass-bg': getGlassBg() } as React.CSSProperties),
  };

  return (
    <section className={classes} id={id} style={sectionStyle}>
      <div className="kreati-hero__container">
        <div className="kreati-hero__content">
          {badge && <div className="kreati-hero__badge">{badge}</div>}
          <h1 className="kreati-hero__title">{title}</h1>
          {subtitle && <p className="kreati-hero__subtitle">{subtitle}</p>}
          {actions && <div className="kreati-hero__actions">{actions}</div>}
        </div>
        {(layout === 'split' || layout === 'split-full') && media && (
          <div className="kreati-hero__media">{media}</div>
        )}
      </div>
    </section>
  );
};
