import React, { forwardRef } from 'react';
import './Badge.css';

export interface BadgeProps {
  /** Content inside the badge (text, number, icon) */
  value?: React.ReactNode;
  /** Position using cardinal directions */
  position?: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';
  /** Color severity */
  severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'help' | 'danger';
  /** The element the badge is attached to */
  children: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Badge component that overlays a small indicator on its child element.
 *
 * @description Displays a colored dot or value badge positioned around a child
 * element using cardinal directions. Supports severity colors and empty dot mode
 * when no value is provided.
 *
 * @example
 * ```tsx
 * <Badge value={3} severity="danger" position="ne">
 *   <Button label="Inbox" />
 * </Badge>
 * <Badge severity="success" position="ne">
 *   <Avatar />
 * </Badge>
 * ```
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      value,
      position = 'ne',
      severity = 'danger',
      children,
      className = '',
    },
    ref,
  ) => {
    const base = 'k-badge';
    const isEmpty = value == null || value === '';

    return (
      <span ref={ref} className={`${base} ${className}`.trim()}>
        {children}
        <span
          className={[
            `${base}__dot`,
            `${base}__dot--${position}`,
            `${base}__dot--${severity}`,
            isEmpty && `${base}__dot--empty`,
          ]
            .filter(Boolean)
            .join(' ')}
          role="status"
          aria-label={!isEmpty ? `${value}` : undefined}
        >
          {!isEmpty && value}
        </span>
      </span>
    );
  },
);

Badge.displayName = 'Badge';
