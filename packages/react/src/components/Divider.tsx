import React, { forwardRef } from 'react';
import './Divider.css';

/**
 * Props for the Divider component
 */
export interface DividerProps {
  /** Divider orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Line style */
  variant?: 'solid' | 'dashed' | 'dotted';
  /** Text label displayed in the divider */
  label?: string;
  /** Custom content — replaces label when provided */
  template?: React.ReactNode;
  /** Content alignment along the divider */
  align?: 'start' | 'center' | 'end';
  /** Line color — must be a Kreati CSS variable or valid CSS color */
  color?: string;
  /** Line thickness */
  width?: string;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * Divider renders a horizontal or vertical line to separate content.
 *
 * @description Supports solid, dashed, and dotted line variants. An optional label or
 * custom template can be placed along the divider with start, center, or end alignment.
 * Line color and thickness are customizable via props that map to CSS variables.
 * Uses a semantic `separator` role for accessibility.
 *
 * @example
 * ```tsx
 * <Divider />
 * <Divider label="OR" />
 * <Divider variant="dashed" align="start" label="Section" />
 * <Divider orientation="vertical" />
 * <Divider template={<Chip label="New" />} />
 * ```
 */
export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  ({ orientation = 'horizontal', variant = 'solid', label, template, align = 'center', color, width, className = '', style }, ref) => {
    const base = 'k-divider';
    const content = template ?? (label ? <span>{label}</span> : null);
    const classes = [base, `${base}--${orientation}`, content && `${base}--${align}`, className].filter(Boolean).join(' ');

    const cssVars: React.CSSProperties = {
      ...style,
      ...(color ? { '--kreati-divider-color': color } as React.CSSProperties : {}),
      ...(width ? { '--kreati-divider-width': width } as React.CSSProperties : {}),
      ...(variant !== 'solid' ? { '--kreati-divider-style': variant } as React.CSSProperties : {}),
    };

    return (
      <div
        ref={ref}
        className={classes}
        style={cssVars}
        role="separator"
        aria-orientation={orientation}
      >
        <div className={`${base}__line`} />
        {content && <div className={`${base}__content`}>{content}</div>}
        {content && <div className={`${base}__line`} />}
      </div>
    );
  },
);

Divider.displayName = 'Divider';
