import React from 'react';
import './Badge.css';

/**
 * Props for the Badge component
 */
export interface BadgeProps {
  /** Badge content */
  children: React.ReactNode;
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
  /** Size of the badge */
  size?: 'sm' | 'md' | 'lg';
  /** Icon to display before the text */
  icon?: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Badge component for labels, tags and status indicators
 *
 * @description A small pill-shaped component used to highlight status,
 * categories or labels. Supports multiple color variants and optional icons.
 *
 * @example
 * ```tsx
 * <Badge variant="primary">Nuevo</Badge>
 * <Badge variant="success" icon={<Check size={12} />}>Activo</Badge>
 * <Badge variant="outline" size="sm">v1.0</Badge>
 * ```
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
}) => {
  const baseClass = 'kreati-badge';
  const classes = [
    baseClass,
    `${baseClass}--${variant}`,
    `${baseClass}--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes}>
      {icon && <span className="kreati-badge__icon">{icon}</span>}
      {children}
    </span>
  );
};
