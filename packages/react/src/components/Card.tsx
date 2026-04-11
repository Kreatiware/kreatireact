import React, { forwardRef, useId } from 'react';
import './Card.css';

/**
 * Props for the Card component
 */
export interface CardProps {
  /** Card title */
  title?: string;
  /** Card subtitle displayed below the title */
  subtitle?: string;
  /** Image source (string URL) or custom ReactNode for the image zone */
  image?: string | React.ReactNode;
  /** Alt text for the image when `image` is a string (required for accessibility) */
  imageAlt?: string;
  /** Custom header template — replaces the image zone when no image is provided */
  header?: React.ReactNode;
  /** Custom footer template */
  footer?: React.ReactNode;
  /** Visual variant */
  variant?: 'default' | 'outlined' | 'elevated';
  /** Card body content */
  children?: React.ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * Card is a flexible content container with optional title, subtitle, image, header, and footer slots.
 *
 * @description Renders a card panel that adapts to its content. The image zone accepts a URL string
 * or a ReactNode and occupies the top of the card. When no image is provided, the header slot
 * takes its place. Title and subtitle render inside the body area above children. The footer
 * slot renders at the bottom separated by a border. Supports three visual variants: default
 * (border), outlined (stronger border), and elevated (shadow). Fully accessible with
 * role="region" and aria-labelledby linked to the title.
 *
 * @example
 * ```tsx
 * <Card
 *   title="Project Alpha"
 *   subtitle="Last updated 2 days ago"
 *   image="/images/alpha.jpg"
 *   imageAlt="Project Alpha cover"
 *   footer={<Button label="View Details" />}
 * >
 *   <p>A brief description of the project.</p>
 * </Card>
 * ```
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ title, subtitle, image, imageAlt = '', header, footer, variant = 'default', children, className = '', style }, ref) => {
    const base = 'k-card';
    const generatedId = useId();
    const titleId = title ? `${base}-title-${generatedId}` : undefined;

    const classes = [base, `${base}--${variant}`, className].filter(Boolean).join(' ');

    const imageZone = image ? (
      <div className={`${base}__image`}>
        {typeof image === 'string' ? <img src={image} alt={imageAlt} /> : image}
      </div>
    ) : header ? (
      <div className={`${base}__header`}>{header}</div>
    ) : null;

    return (
      <div
        ref={ref}
        className={classes}
        style={style}
        role="region"
        aria-labelledby={titleId}
      >
        {imageZone}
        {(title || subtitle || children) && (
          <div className={`${base}__body`}>
            {title && <div id={titleId} className={`${base}__title`}>{title}</div>}
            {subtitle && <div className={`${base}__subtitle`}>{subtitle}</div>}
            {children}
          </div>
        )}
        {footer && <div className={`${base}__footer`}>{footer}</div>}
      </div>
    );
  },
);

Card.displayName = 'Card';
