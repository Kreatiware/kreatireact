import React, { forwardRef } from 'react';
import './Chip.css';

export interface ChipProps {
  /** Chip content */
  children: React.ReactNode;
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
  /** Chip size */
  size?: 'sm' | 'md' | 'lg';
  /** Leading icon */
  icon?: React.ReactNode;
  /** Raised shadow effect */
  raised?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * Chip component for displaying compact labels, tags, or status indicators.
 *
 * @description A small inline element with rounded pill shape, supporting
 * multiple color variants and optional leading icon. Useful for tags,
 * categories, filters, and status badges.
 *
 * @example
 * ```tsx
 * <Chip variant="primary">React</Chip>
 * <Chip variant="success" icon={<Check size={12} />}>Active</Chip>
 * <Chip variant="outline" size="sm">Draft</Chip>
 * ```
 */
export const Chip = forwardRef<HTMLSpanElement, ChipProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      icon,
      raised = false,
      className = '',
      style,
    },
    ref,
  ) => {
    const baseClass = 'k-chip';
    const classes = [
      baseClass,
      `${baseClass}--${variant}`,
      `${baseClass}--${size}`,
      raised && `${baseClass}--raised`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <span ref={ref} className={classes} style={style} role="status">
        {icon && <span className="k-chip__icon" aria-hidden="true">{icon}</span>}
        {children}
      </span>
    );
  },
);

Chip.displayName = 'Chip';
