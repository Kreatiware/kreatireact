import React, { forwardRef, useState, useRef, useCallback, useEffect, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import { useLayerZIndex } from './LayerContext';
import './Tooltip.css';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type TooltipEvent = 'hover' | 'focus' | 'both';

export interface TooltipProps {
  /** Tooltip text or content */
  content: React.ReactNode;
  /** Preferred position relative to the trigger element — auto-flips if not enough space */
  position?: TooltipPosition;
  /** Show arrow pointing to the trigger */
  arrow?: boolean;
  /** Delay before showing (ms) */
  showDelay?: number;
  /** Delay before hiding (ms) */
  hideDelay?: number;
  /** Auto-hide after a duration (ms) — 0 means no auto-hide */
  autoHide?: number;
  /** Which events trigger the tooltip */
  event?: TooltipEvent;
  /** Whether the tooltip is disabled */
  disabled?: boolean;
  /** Follow the mouse cursor instead of anchoring to the trigger center */
  mouseTrack?: boolean;
  /** Horizontal offset when mouseTrack is enabled */
  mouseTrackLeft?: number;
  /** Vertical offset when mouseTrack is enabled */
  mouseTrackTop?: number;
  /** Custom render for the tooltip content — receives the content prop */
  template?: (content: React.ReactNode) => React.ReactNode;
  /** Additional CSS class names for the tooltip bubble */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Trigger element */
  children: React.ReactElement;
}

/**
 * Tooltip component that displays contextual information on hover or focus.
 *
 * @description A portal-based tooltip that wraps any element and shows a
 * floating label on hover/focus. Supports 4 positions with auto-flip when
 * near viewport edges, optional arrow, mouse tracking, auto-hide timer,
 * custom templates, and configurable show/hide delays. Renders via portal
 * to avoid overflow clipping. Inherits z-index from LayerContext so it
 * works correctly inside Dialog and other stacked overlays.
 * Fully accessible with ARIA describedby pattern and keyboard focus support.
 *
 * @example
 * ```tsx
 * <Tooltip content="Delete this item" position="top">
 *   <Button iconLeft={<Times size={16} />} ariaLabel="Delete" />
 * </Tooltip>
 *
 * <Tooltip content="Follows cursor" mouseTrack mouseTrackTop={10}>
 *   <span>Hover me</span>
 * </Tooltip>
 *
 * <Tooltip content="Auto-hides" autoHide={2000}>
 *   <Button label="Peek" />
 * </Tooltip>
 * ```
 */
export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      content,
      position = 'top',
      arrow = true,
      showDelay = 200,
      hideDelay = 0,
      autoHide = 0,
      event = 'both',
      disabled = false,
      mouseTrack = false,
      mouseTrackLeft = 0,
      mouseTrackTop = 10,
      template,
      className = '',
      style,
      children,
    },
    ref,
  ) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const bubbleRef = useRef<HTMLDivElement>(null);
    const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const autoHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    useImperativeHandle(ref, () => wrapperRef.current as HTMLDivElement);

    const [visible, setVisible] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number }>({ top: -9999, left: -9999 });
    const [resolvedPosition, setResolvedPosition] = useState<TooltipPosition>(position);
    const [positioned, setPositioned] = useState(false);

    const { child: childZ } = useLayerZIndex();
    const tooltipId = useRef(`k-tooltip-${Math.random().toString(36).slice(2, 9)}`).current;
    const base = 'k-tooltip';

    const clearTimers = useCallback(() => {
      if (showTimerRef.current) { clearTimeout(showTimerRef.current); showTimerRef.current = null; }
      if (hideTimerRef.current) { clearTimeout(hideTimerRef.current); hideTimerRef.current = null; }
      if (autoHideTimerRef.current) { clearTimeout(autoHideTimerRef.current); autoHideTimerRef.current = null; }
    }, []);

    const computePosition = useCallback(() => {
      const trigger = wrapperRef.current;
      const bubble = bubbleRef.current;
      if (!trigger || !bubble) return;

      const tr = trigger.getBoundingClientRect();
      const br = bubble.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const gap = 8;

      if (mouseTrack) {
        setCoords({ top: mouseRef.current.y + mouseTrackTop, left: mouseRef.current.x + mouseTrackLeft });
        setResolvedPosition(position);
        setPositioned(true);
        return;
      }

      // Auto-flip logic
      let pos = position;
      if (pos === 'top' && tr.top - gap - br.height < 0) pos = 'bottom';
      else if (pos === 'bottom' && tr.bottom + gap + br.height > vh) pos = 'top';
      else if (pos === 'left' && tr.left - gap - br.width < 0) pos = 'right';
      else if (pos === 'right' && tr.right + gap + br.width > vw) pos = 'left';

      let top = 0;
      let left = 0;

      switch (pos) {
        case 'top':
          top = tr.top - br.height - gap;
          left = tr.left + tr.width / 2 - br.width / 2;
          break;
        case 'bottom':
          top = tr.bottom + gap;
          left = tr.left + tr.width / 2 - br.width / 2;
          break;
        case 'left':
          top = tr.top + tr.height / 2 - br.height / 2;
          left = tr.left - br.width - gap;
          break;
        case 'right':
          top = tr.top + tr.height / 2 - br.height / 2;
          left = tr.right + gap;
          break;
      }

      // Clamp to viewport
      if (left + br.width > vw) left = vw - br.width - 4;
      if (left < 4) left = 4;
      if (top + br.height > vh) top = vh - br.height - 4;
      if (top < 4) top = 4;

      setCoords({ top, left });
      setResolvedPosition(pos);
      setPositioned(true);
    }, [position, mouseTrack, mouseTrackLeft, mouseTrackTop]);

    const show = useCallback(() => {
      if (disabled) return;
      if (hideTimerRef.current) { clearTimeout(hideTimerRef.current); hideTimerRef.current = null; }
      showTimerRef.current = setTimeout(() => {
        setVisible(true);
        if (autoHide > 0) {
          autoHideTimerRef.current = setTimeout(() => setVisible(false), autoHide);
        }
      }, showDelay);
    }, [disabled, showDelay, autoHide]);

    const hide = useCallback(() => {
      if (showTimerRef.current) { clearTimeout(showTimerRef.current); showTimerRef.current = null; }
      if (autoHideTimerRef.current) { clearTimeout(autoHideTimerRef.current); autoHideTimerRef.current = null; }
      if (hideDelay > 0) {
        hideTimerRef.current = setTimeout(() => { setVisible(false); setPositioned(false); }, hideDelay);
      } else {
        setVisible(false);
        setPositioned(false);
      }
    }, [hideDelay]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
      if (!mouseTrack) return;
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (visible) computePosition();
    }, [mouseTrack, visible, computePosition]);

    // Position computation when visible
    useEffect(() => {
      if (!visible) return;
      const frame = requestAnimationFrame(() => requestAnimationFrame(computePosition));
      if (!mouseTrack) {
        window.addEventListener('scroll', computePosition, true);
        window.addEventListener('resize', computePosition);
      }
      return () => {
        cancelAnimationFrame(frame);
        if (!mouseTrack) {
          window.removeEventListener('scroll', computePosition, true);
          window.removeEventListener('resize', computePosition);
        }
      };
    }, [visible, computePosition, mouseTrack]);

    // Cleanup on unmount
    useEffect(() => clearTimers, [clearTimers]);

    // Detect disabled children — wrap in span so hover/focus events still fire
    const childDisabled = React.isValidElement(children) && (children.props as Record<string, unknown>).disabled === true;

    const hoverHandlers = (event === 'hover' || event === 'both') ? {
      onMouseEnter: disabled ? undefined : show,
      onMouseLeave: hide,
      onMouseMove: mouseTrack && !disabled ? handleMouseMove : undefined,
    } : {};

    const focusHandlers = (event === 'focus' || event === 'both') ? {
      onFocus: disabled ? undefined : show,
      onBlur: hide,
    } : {};

    const renderedContent = template ? template(content) : content;

    const bubbleClasses = [
      `${base}__bubble`,
      `${base}__bubble--${resolvedPosition}`,
      arrow && !mouseTrack && `${base}__bubble--arrow`,
      positioned && visible && `${base}__bubble--visible`,
    ].filter(Boolean).join(' ');

    const bubble = visible ? createPortal(
      <div
        ref={bubbleRef}
        id={tooltipId}
        className={[bubbleClasses, className].filter(Boolean).join(' ')}
        role="tooltip"
        style={{ position: 'fixed', top: coords.top, left: coords.left, zIndex: childZ + 2 }}
      >
        {renderedContent}
      </div>,
      document.body,
    ) : null;

    return (
      <div
        ref={wrapperRef}
        className={`${base}__wrapper`}
        style={style}
        aria-describedby={visible ? tooltipId : undefined}
        tabIndex={childDisabled ? 0 : undefined}
        {...hoverHandlers}
        {...focusHandlers}
      >
        {children}
        {bubble}
      </div>
    );
  },
);

Tooltip.displayName = 'Tooltip';
