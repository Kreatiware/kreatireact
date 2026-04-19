import React, { forwardRef, Children, cloneElement, isValidElement } from 'react';
import type { AvatarProps } from './Avatar';
import { useKreatiLocale } from '../locale';
import './AvatarGroup.css';

export interface AvatarGroupProps {
  /** Maximum number of avatars to display before showing "+N" */
  max?: number;
  /** Uniform size applied to all children */
  size?: AvatarProps['size'];
  /** Uniform shape applied to all children */
  shape?: AvatarProps['shape'];
  /** Custom render for the overflow indicator */
  overflowTemplate?: (count: number) => React.ReactNode;
  /** Fires when the overflow indicator is clicked */
  onOverflowClick?: (count: number) => void;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Avatar children */
  children: React.ReactNode;
}

/**
 * AvatarGroup component for displaying stacked avatars with overflow indicator.
 *
 * @description Renders a group of Avatar components with negative margin overlap.
 * When the number of children exceeds `max`, the remaining are hidden and a "+N"
 * indicator is shown. Supports uniform size/shape override and custom overflow template.
 *
 * @example
 * ```tsx
 * <AvatarGroup max={3} size="md">
 *   <Avatar image="/user1.jpg" alt="User 1" />
 *   <Avatar image="/user2.jpg" alt="User 2" />
 *   <Avatar label="JD" severity="primary" />
 *   <Avatar label="AB" severity="success" />
 * </AvatarGroup>
 * ```
 */
export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ max, size, shape, overflowTemplate, onOverflowClick, className = '', style, children }, ref) => {
    const locale = useKreatiLocale();
    const base = 'k-avatar-group';
    const items = Children.toArray(children).filter(isValidElement);
    const total = items.length;
    const visible = max != null && max < total ? items.slice(0, max) : items;
    const overflowCount = max != null && max < total ? total - max : 0;

    return (
      <div
        ref={ref}
        className={`${base} ${className}`}
        style={style}
        role="group"
        aria-label={locale.avatarGroup.groupLabel.replace('{count}', String(total))}
      >
        {visible.map((child, i) =>
          cloneElement(child as React.ReactElement<AvatarProps>, {
            key: i,
            ...(size && { size }),
            ...(shape && { shape }),
          }),
        )}
        {overflowCount > 0 && (
          <span
            className={`${base}__overflow k-avatar k-avatar--${size || 'md'} k-avatar--${shape || 'circle'}`}
            role="button"
            tabIndex={onOverflowClick ? 0 : undefined}
            aria-label={locale.avatarGroup.overflowLabel.replace('{count}', String(overflowCount))}
            onClick={onOverflowClick ? () => onOverflowClick(overflowCount) : undefined}
            onKeyDown={onOverflowClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOverflowClick(overflowCount); } } : undefined}
          >
            {overflowTemplate ? overflowTemplate(overflowCount) : `+${overflowCount}`}
          </span>
        )}
      </div>
    );
  },
);

AvatarGroup.displayName = 'AvatarGroup';
