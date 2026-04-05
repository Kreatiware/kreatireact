import React, { forwardRef, useState, useRef, useCallback, useEffect } from 'react';
import './Tooltip.css';

export interface TooltipProps {
  /** Tooltip text or content */
  content: React.ReactNode;
  /** Position relative to the trigger element */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Show arrow pointing to the trigger */
  arrow?: boolean;
  /** Delay before showing (ms) */
  delay?: number;
  /** Whether the tooltip is disabled */
  disabled?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Trigger element */
  children: React.ReactElement;
}

/**
 * Tooltip component that displays contextual information on hover or focus.
 *
 * @description A lightweight tooltip that wraps any element and shows a
 * floating label on hover/focus. Supports 4 positions with optional arrow.
 * Built with pure CSS positioning and accessible via keyboard focus.
 *
 * @example
 * ```tsx
 * <Tooltip content="Delete this item" position="top">
 *   <Button iconLeft={<Times size={16} />} ariaLabel="Delete" />
 * </Tooltip>
 *
 * <Tooltip content="More info" position="right" arrow>
 *   <span>Hover me</span>
 * </Tooltip>
 * ```
 */
export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      content,
      position = 'top',
      arrow = true,
      delay = 200,
      disabled = false,
      className = '',
      children,
    },
    ref,
  ) => {
    const [visible, setVisible] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const base = 'k-tooltip';

    const show = useCallback(() => {
      if (disabled) return;
      timeoutRef.current = setTimeout(() => setVisible(true), delay);
    }, [disabled, delay]);

    const hide = useCallback(() => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setVisible(false);
    }, []);

    useEffect(() => {
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }, []);

    const wrapperClasses = [
      `${base}__wrapper`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const bubbleClasses = [
      `${base}__bubble`,
      `${base}__bubble--${position}`,
      arrow && `${base}__bubble--arrow`,
      visible && `${base}__bubble--visible`,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        ref={ref}
        className={wrapperClasses}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
        <div className={bubbleClasses} role="tooltip" aria-hidden={!visible}>
          {content}
        </div>
      </div>
    );
  },
);

Tooltip.displayName = 'Tooltip';
