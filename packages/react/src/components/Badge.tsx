import React from 'react';
import './Badge.css';

export type BadgePosition = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';

export interface BadgeProps {
  /** Content inside the badge (text, number, icon) */
  value?: React.ReactNode;
  /** Position using cardinal directions */
  position?: BadgePosition;
  /** Color severity */
  severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'help' | 'danger';
  /** The element the badge is attached to */
  children: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  value,
  position = 'ne',
  severity = 'danger',
  children,
  className = '',
}) => {
  const base = 'k-badge';
  const isEmpty = value == null || value === '';

  return (
    <span className={`${base} ${className}`.trim()}>
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
      >
        {!isEmpty && value}
      </span>
    </span>
  );
};
