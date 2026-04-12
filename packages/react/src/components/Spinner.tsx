import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import './Spinner.css';

export interface SpinnerProps {
  /** Size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Stroke width */
  strokeWidth?: number;
  /** Color — CSS value or Kreati variable */
  color?: string;
  /** Accessible label for screen readers */
  label?: string;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * Spinner component for loading indication.
 *
 * @description An animated SVG spinner with configurable size, stroke width,
 * and color. Uses CSS animation for smooth rotation. Includes an accessible
 * label for screen readers via aria-label and role="status".
 * Respects prefers-reduced-motion.
 *
 * @example
 * ```tsx
 * <Spinner />
 * <Spinner size="lg" color="var(--kreati-severity-success)" />
 * ```
 */
export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', strokeWidth, color, label = 'Loading', className = '', style }, ref) => {
    const elRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => elRef.current as HTMLDivElement);

    const base = 'k-spinner';
    const classes = [base, `${base}--${size}`, className].filter(Boolean).join(' ');
    const sw = strokeWidth ?? 3;

    return (
      <div ref={elRef} className={classes} style={style} role="status" aria-label={label}>
        <svg className={`${base}__svg`} viewBox="0 0 50 50" style={color ? { color } : undefined}>
          <circle className={`${base}__track`} cx={25} cy={25} r={20} fill="none" strokeWidth={sw} />
          <circle className={`${base}__arc`} cx={25} cy={25} r={20} fill="none" strokeWidth={sw} strokeLinecap="round" />
        </svg>
      </div>
    );
  },
);

Spinner.displayName = 'Spinner';
