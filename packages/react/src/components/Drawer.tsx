import React, { forwardRef, useRef, useState, useCallback, useEffect, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import { useKreatiLocale } from '../locale';
import { TIMES_PATH } from './iconPaths';
import { Button } from './Button';
import { LayerContext, nextLayer } from './LayerContext';
import './Drawer.css';

export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';

export interface DrawerProps {
  /** Whether the drawer is visible */
  visible?: boolean;
  /** Fires when the drawer should close */
  onHide?: () => void;
  /** Edge of the screen the drawer slides from */
  position?: DrawerPosition;
  /** Drawer size — controls width (left/right) or height (top/bottom) */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Header content — string renders as title, ReactNode for custom */
  header?: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Icon displayed in the header */
  headerIcon?: React.ReactNode;
  /** Custom render for the entire header section */
  headerTemplate?: (props: { title: React.ReactNode; close: () => void }) => React.ReactNode;
  /** Custom render for the entire footer section */
  footerTemplate?: (props: { close: () => void }) => React.ReactNode;
  /** Show close button in header (default: true) */
  closable?: boolean;
  /** Show overlay behind the drawer (default: true) */
  modal?: boolean;
  /** Close when pressing Escape (default: true) */
  closeOnEscape?: boolean;
  /** Close when clicking the overlay (default: true) */
  closeOnOverlay?: boolean;
  /** Block body scroll when open (default: true) */
  blockScroll?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Drawer body content */
  children?: React.ReactNode;
}

/**
 * Drawer component for slide-in panels from screen edges.
 *
 * @description A panel that slides in from left, right, top, or bottom.
 * Supports customizable header/footer with templates, overlay, focus trap,
 * Escape/click-outside to close, scroll blocking, and 6 size options.
 * Uses LayerContext for z-index stacking so nested drawers and child
 * overlays (Select, Popover, Calendar, Tooltip) render at the correct level.
 *
 * @example
 * ```tsx
 * <Drawer visible={open} onHide={() => setOpen(false)} header="Settings">
 *   <p>Drawer content here</p>
 * </Drawer>
 *
 * <Drawer visible={open} onHide={() => setOpen(false)} position="right" size="lg"
 *   header="Details" footer={<Button label="Save" onClick={save} />}>
 *   <form>...</form>
 * </Drawer>
 * ```
 */
export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(
  (
    {
      visible = false,
      onHide,
      position = 'left',
      size = 'md',
      header,
      footer,
      headerIcon,
      headerTemplate,
      footerTemplate,
      closable = true,
      modal = true,
      closeOnEscape = true,
      closeOnOverlay = true,
      blockScroll = true,
      className = '',
      children,
    },
    ref,
  ) => {
    const drawerRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);
    useImperativeHandle(ref, () => drawerRef.current as HTMLDivElement);

    const [layer] = useState(() => nextLayer());
    const zDrawer = 1000 + layer * 10;

    const kreatiLocale = useKreatiLocale();
    const base = 'k-drawer';

    const close = useCallback(() => onHide?.(), [onHide]);

    const titleId = `${base}-title-${layer}`;
    const bodyId = `${base}-body-${layer}`;

    // Block scroll
    useEffect(() => {
      if (!visible || !blockScroll) return;
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }, [visible, blockScroll]);

    // Escape key
    useEffect(() => {
      if (!visible || !closeOnEscape) return;
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') { e.preventDefault(); close(); }
      };
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }, [visible, closeOnEscape, close]);

    // Focus management
    useEffect(() => {
      if (!visible) return;
      previousFocusRef.current = document.activeElement as HTMLElement;
      requestAnimationFrame(() => drawerRef.current?.focus());
      return () => { previousFocusRef.current?.focus(); };
    }, [visible]);

    // Focus trap
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const el = drawerRef.current;
      if (!el) return;
      const focusable = el.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }, []);

    if (!visible) return null;

    const isHorizontal = position === 'left' || position === 'right';
    const hasHeader = !!(header || headerTemplate);
    const hasFooter = !!(footer || footerTemplate);

    const closeIcon = (
      <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d={TIMES_PATH} />
      </svg>
    );

    const headerEl = headerTemplate ? (
      <div className={`${base}__header`}>
        {headerTemplate({ title: header, close })}
      </div>
    ) : hasHeader ? (
      <div className={`${base}__header`}>
        <div className={`${base}__header-content`} id={titleId}>
          {headerIcon && <span className={`${base}__header-icon`}>{headerIcon}</span>}
          {typeof header === 'string' ? <h2 className={`${base}__title`}>{header}</h2> : header}
        </div>
        {closable && (
          <Button
            buttonType="text"
            severity="secondary"
            slim
            size="sm"
            iconLeft={closeIcon}
            ariaLabel={kreatiLocale.dialog.close}
            onClick={close}
          />
        )}
      </div>
    ) : closable ? (
      <div className={`${base}__header ${base}__header--close-only`}>
        <Button
          buttonType="text"
          severity="secondary"
          slim
          size="sm"
          iconLeft={closeIcon}
          ariaLabel={kreatiLocale.dialog.close}
          onClick={close}
        />
      </div>
    ) : null;

    const footerEl = footerTemplate ? (
      <div className={`${base}__footer`}>
        {footerTemplate({ close })}
      </div>
    ) : hasFooter ? (
      <div className={`${base}__footer`}>{footer}</div>
    ) : null;

    const drawerClasses = [
      base,
      `${base}--${position}`,
      isHorizontal ? `${base}--w-${size}` : `${base}--h-${size}`,
      !hasHeader && !closable && `${base}--no-header`,
      !hasFooter && `${base}--no-footer`,
      className,
    ].filter(Boolean).join(' ');

    const drawerContent = (
      <LayerContext.Provider value={layer}>
        {headerEl}
        <div className={`${base}__body`} id={bodyId}>{children}</div>
        {footerEl}
      </LayerContext.Provider>
    );

    const drawerEl = (
      <div
        ref={drawerRef}
        className={drawerClasses}
        role="dialog"
        aria-modal={modal ? 'true' : 'false'}
        aria-labelledby={hasHeader ? titleId : undefined}
        aria-describedby={bodyId}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        {drawerContent}
      </div>
    );

    const overlayEl = modal ? (
      <div
        className={`${base}-overlay`}
        style={{ zIndex: zDrawer }}
        onClick={closeOnOverlay ? (e) => { if (e.target === e.currentTarget) close(); } : undefined}
      >
        {drawerEl}
      </div>
    ) : (
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: zDrawer }}>
        <div style={{ pointerEvents: 'auto' }}>{drawerEl}</div>
      </div>
    );

    return createPortal(overlayEl, document.body);
  },
);

Drawer.displayName = 'Drawer';
