import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import './Skeleton.css';

/** Shape of the skeleton placeholder */
export type SkeletonShape = 'rectangle' | 'circle' | 'text';

/** Animation style */
export type SkeletonAnimation = 'shimmer' | 'pulse' | 'none';

export interface SkeletonProps {
  /** Shape of the placeholder */
  shape?: SkeletonShape;
  /** Width — CSS value (default: '100%' for rectangle/text, size for circle) */
  width?: string | number;
  /** Height — CSS value (default: '1em' for rectangle, width for circle) */
  height?: string | number;
  /** Number of text lines to render (only for shape="text") */
  lines?: number;
  /** Gap between text lines */
  lineGap?: string | number;
  /** Border radius — CSS value (overrides shape default) */
  borderRadius?: string | number;
  /** Animation type */
  animation?: SkeletonAnimation;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * Skeleton component for content loading placeholders.
 *
 * @description Renders animated placeholder shapes that mimic the layout
 * of content while it loads. Supports rectangle, circle, and multi-line
 * text shapes with shimmer or pulse animations. Respects
 * prefers-reduced-motion by disabling animations automatically.
 *
 * @example
 * ```tsx
 * <Skeleton width={200} height={20} />
 * <Skeleton shape="circle" width={48} />
 * <Skeleton shape="text" lines={3} />
 * ```
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      shape = 'rectangle',
      width,
      height,
      lines = 3,
      lineGap,
      borderRadius,
      animation = 'shimmer',
      className = '',
      style,
    },
    ref,
  ) => {
    const elRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => elRef.current as HTMLDivElement);

    const base = 'k-skeleton';

    if (shape === 'text') {
      const cls = [base, `${base}--text`, className].filter(Boolean).join(' ');
      return (
        <div ref={elRef} className={cls} style={{ gap: lineGap, ...style }} aria-hidden="true">
          {Array.from({ length: lines }, (_, i) => (
            <div
              key={i}
              className={`${base}__line ${base}--${animation}`}
              style={{
                width: i === lines - 1 ? '60%' : '100%',
                borderRadius,
              }}
            />
          ))}
        </div>
      );
    }

    const isCircle = shape === 'circle';
    const resolvedWidth = width ?? (isCircle ? 48 : '100%');
    const resolvedHeight = height ?? (isCircle ? resolvedWidth : '1em');
    const resolvedRadius = borderRadius ?? (isCircle ? '50%' : undefined);

    const cls = [base, `${base}--${animation}`, className].filter(Boolean).join(' ');

    return (
      <div
        ref={elRef}
        className={cls}
        style={{
          width: resolvedWidth,
          height: resolvedHeight,
          borderRadius: resolvedRadius,
          ...style,
        }}
        aria-hidden="true"
      />
    );
  },
);

Skeleton.displayName = 'Skeleton';
