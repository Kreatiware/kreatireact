import React, { forwardRef, useRef, useState, useCallback, useEffect, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import { useKreatiLocale } from '../locale';
import { Button } from './Button';
import { useLayerZIndex } from './LayerContext';
import './Popover.css';

export type PopoverPosition = 'top' | 'bottom' | 'left' | 'right';

export interface PopoverProps {
  /** Popover variant — default shows content as-is, confirm shows message + accept/reject buttons */
  variant?: 'default' | 'confirm';
  /** Content rendered inside the popover panel */
  content?: React.ReactNode;
  /** Message text for confirm variant */
  message?: React.ReactNode;
  /** Icon displayed before the message in confirm variant */
  icon?: React.ReactNode;
  /** Accept button label — overrides locale default */
  acceptLabel?: string;
  /** Reject button label — overrides locale default */
  rejectLabel?: string;
  /** Accept button severity */
  acceptSeverity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'help' | 'danger' | 'accent';
  /** Reject button severity */
  rejectSeverity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'help' | 'danger' | 'accent';
  /** Fires when accept is clicked (confirm variant) */
  onAccept?: () => void;
  /** Fires when reject is clicked (confirm variant) */
  onReject?: () => void;
  /** Preferred position relative to the trigger */
  position?: PopoverPosition;
  /** Distance in px between trigger and panel */
  offset?: number;
  /** Render the panel in a portal (body) to avoid overflow clipping (default: true) */
  portal?: boolean;
  /** Close when clicking outside the popover (default: true) */
  closeOnClickOutside?: boolean;
  /** Close when pressing Escape (default: true) */
  closeOnEscape?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Fires when open state should change */
  onOpenChange?: (open: boolean) => void;
  /** Disable the popover */
  disabled?: boolean;
  /** Match panel minimum width to trigger width (default: true) */
  matchTriggerWidth?: boolean;
  /** Additional CSS class for the panel */
  panelClassName?: string;
  /** Additional CSS class for the wrapper */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Trigger element(s) */
  children: React.ReactNode;
}

/**
 * Popover component for floating panels anchored to a trigger element.
 *
 * @description A reusable overlay that positions a content panel relative to
 * its trigger. Supports portal rendering, auto-flip when near viewport edges,
 * click outside and Escape to close, and controlled/uncontrolled modes.
 * Used internally by DatePicker, TimePicker, etc. and available for
 * consumers to build custom floating UIs.
 *
 * @example
 * ```tsx
 * <Popover content={<div>Panel content</div>} position="bottom">
 *   <Button label="Open" />
 * </Popover>
 * ```
 */
export const Popover = forwardRef<HTMLDivElement, PopoverProps>(
  (
    {
      variant = 'default',
      content,
      message,
      icon,
      acceptLabel: acceptLabelProp,
      rejectLabel: rejectLabelProp,
      acceptSeverity = 'primary',
      rejectSeverity = 'secondary',
      onAccept,
      onReject,
      position = 'bottom',
      offset = 4,
      portal = true,
      closeOnClickOutside = true,
      closeOnEscape = true,
      open: controlledOpen,
      onOpenChange,
      disabled = false,
      panelClassName = '',
      matchTriggerWidth = true,
      className = '',
      style,
      children,
    },
    ref,
  ) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => wrapperRef.current as HTMLDivElement);

    const kreatiLocale = useKreatiLocale();
    const { child: childZ } = useLayerZIndex();

    const isControlled = controlledOpen !== undefined;
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = isControlled ? controlledOpen : internalOpen;
    const [positioned, setPositioned] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number; minWidth?: number }>({ top: -9999, left: -9999 });

    const setOpen = useCallback((next: boolean) => {
      if (!next) setPositioned(false);
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    }, [isControlled, onOpenChange]);

    const toggle = useCallback(() => {
      if (disabled) return;
      setOpen(!isOpen);
    }, [disabled, isOpen, setOpen]);

    const close = useCallback(() => setOpen(false), [setOpen]);

    const computePosition = useCallback(() => {
      const trigger = wrapperRef.current;
      const panel = panelRef.current;
      if (!trigger || !panel) return;

      const tr = trigger.getBoundingClientRect();
      const pr = panel.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let pos = position;
      if (pos === 'bottom' && tr.bottom + offset + pr.height > vh && tr.top - offset - pr.height > 0) pos = 'top';
      else if (pos === 'top' && tr.top - offset - pr.height < 0) pos = 'bottom';
      else if (pos === 'right' && tr.right + offset + pr.width > vw && tr.left - offset - pr.width > 0) pos = 'left';
      else if (pos === 'left' && tr.left - offset - pr.width < 0) pos = 'right';

      let top = 0;
      let left = 0;
      switch (pos) {
        case 'bottom': top = tr.bottom + offset; left = tr.left; break;
        case 'top': top = tr.top - pr.height - offset; left = tr.left; break;
        case 'right': top = tr.top; left = tr.right + offset; break;
        case 'left': top = tr.top; left = tr.left - pr.width - offset; break;
      }

      if (left + pr.width > vw) left = vw - pr.width - 8;
      if (left < 0) left = 8;
      if (top + pr.height > vh) top = vh - pr.height - 8;
      if (top < 0) top = 8;

      setCoords({ top, left, minWidth: matchTriggerWidth && (pos === 'bottom' || pos === 'top') ? tr.width : undefined });
      setPositioned(true);
    }, [position, offset]);

    useEffect(() => {
      if (!isOpen) return;
      const frame1 = requestAnimationFrame(() => {
        const frame2 = requestAnimationFrame(computePosition);
        return () => cancelAnimationFrame(frame2);
      });
      const onUpdate = computePosition;
      window.addEventListener('scroll', onUpdate, true);
      window.addEventListener('resize', onUpdate);
      return () => {
        cancelAnimationFrame(frame1);
        window.removeEventListener('scroll', onUpdate, true);
        window.removeEventListener('resize', onUpdate);
      };
    }, [isOpen, computePosition]);

    useEffect(() => {
      if (!isOpen || !closeOnClickOutside) return;
      const handler = (e: MouseEvent) => {
        const t = e.target as Node;
        if (wrapperRef.current?.contains(t) || panelRef.current?.contains(t)) return;
        close();
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, [isOpen, closeOnClickOutside, close]);

    useEffect(() => {
      if (!isOpen || !closeOnEscape) return;
      const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); close(); } };
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }, [isOpen, closeOnEscape, close]);

    const base = 'k-popover';

    const resolvedContent = variant === 'confirm' && !content ? (
      <div className={`${base}__confirm`}>
        <div className={`${base}__confirm-body`}>
          {icon && <span className={`${base}__confirm-icon`} aria-hidden="true">{icon}</span>}
          <span className={`${base}__confirm-message`}>{message}</span>
        </div>
        <div className={`${base}__confirm-actions`}>
          <Button label={rejectLabelProp || kreatiLocale.dialog.reject} buttonType="text" severity={rejectSeverity} size="sm" onClick={() => { onReject?.(); close(); }} />
          <Button label={acceptLabelProp || kreatiLocale.dialog.accept} severity={acceptSeverity} size="sm" onClick={() => { onAccept?.(); close(); }} />
        </div>
      </div>
    ) : content;

    const panelEl = isOpen ? (
      <div
        ref={panelRef}
        className={[`${base}__panel`, positioned && `${base}__panel--visible`, panelClassName].filter(Boolean).join(' ')}
        style={{ position: 'fixed', top: coords.top, left: coords.left, minWidth: coords.minWidth, zIndex: childZ }}
        role="dialog"
        aria-modal="false"
      >
        {resolvedContent}
      </div>
    ) : null;

    return (
      <div ref={wrapperRef} className={`${base} ${className}`.trim()} style={style}>
        <div className={`${base}__trigger`} onClick={toggle}>
          {children}
        </div>
        {portal ? (panelEl && createPortal(panelEl, document.body)) : panelEl}
      </div>
    );
  },
);

Popover.displayName = 'Popover';
