import React, { forwardRef, useRef, useState, useCallback, useEffect, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import { useKreatiLocale } from '../locale';
import { TIMES_PATH, MAXIMIZE_PATH, RESTORE_PATH } from './iconPaths';
import { Button } from './Button';
import { LayerContext, nextLayer } from './LayerContext';
import './Dialog.css';

export type DialogPosition = 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface DialogProps {
  /** Whether the dialog is visible */
  visible?: boolean;
  /** Fires when the dialog should close */
  onHide?: () => void;
  /** Dialog variant — dialog is a generic modal, confirm adds accept/reject buttons */
  variant?: 'dialog' | 'confirm';
  /** Header content — string renders as title, ReactNode for custom */
  header?: React.ReactNode;
  /** Footer content — overrides default footer */
  footer?: React.ReactNode;
  /** Icon displayed in the header */
  headerIcon?: React.ReactNode;
  /** Custom render for the entire header section */
  headerTemplate?: (props: { title: React.ReactNode; close: () => void }) => React.ReactNode;
  /** Custom render for the entire footer section */
  footerTemplate?: (props: { accept: () => void; reject: () => void; close: () => void }) => React.ReactNode;
  /** Show close button in header (default: true) */
  closable?: boolean;
  /** Show maximize/restore button in header */
  maximizable?: boolean;
  /** Position of the dialog on screen */
  position?: DialogPosition;
  /** Show overlay behind the dialog (default: true) */
  modal?: boolean;
  /** Close when pressing Escape (default: true) */
  closeOnEscape?: boolean;
  /** Close when clicking the overlay (default: false) */
  closeOnOverlay?: boolean;
  /** Block body scroll when open (default: true) */
  blockScroll?: boolean;
  /** Dialog size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Full screen mode */
  fullScreen?: boolean;
  /** Responsive — becomes fullscreen on small screens */
  responsive?: boolean;
  /** Message text for confirm variant body */
  message?: React.ReactNode;
  /** Icon displayed in confirm variant body */
  icon?: React.ReactNode;
  /** Accept button label — overrides locale */
  acceptLabel?: string;
  /** Reject button label — overrides locale */
  rejectLabel?: string;
  /** Accept button severity */
  acceptSeverity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'help' | 'danger';
  /** Reject button severity */
  rejectSeverity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'help' | 'danger';
  /** Fires when accept is clicked (confirm variant) */
  onAccept?: () => void;
  /** Fires when reject is clicked (confirm variant) */
  onReject?: () => void;
  /** Additional CSS class names */
  className?: string;
  /** Dialog body content */
  children?: React.ReactNode;
}

/**
 * Dialog component for modal windows and confirmation prompts.
 *
 * @description A versatile modal dialog supporting two variants: generic dialog
 * with customizable header/body/footer, and confirm dialog with accept/reject
 * buttons. Features include maximizable, multiple positions, responsive
 * fullscreen on mobile, overlay click/Escape to close, scroll blocking,
 * focus trap, and full ARIA dialog pattern. Uses LayerContext for z-index
 * stacking so nested dialogs and child overlays (Select, Popover, Calendar)
 * always render at the correct level.
 *
 * @example
 * ```tsx
 * <Dialog visible={open} onHide={() => setOpen(false)} header="Settings">
 *   <p>Dialog content here</p>
 * </Dialog>
 *
 * <Dialog variant="confirm" visible={open} onHide={() => setOpen(false)}
 *   message="Are you sure?" onAccept={handleDelete} />
 * ```
 */
export const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  (
    {
      visible = false, onHide, variant = 'dialog',
      header, footer, headerIcon, headerTemplate, footerTemplate,
      closable = true, maximizable = false, position = 'center',
      modal = true, closeOnEscape = true, closeOnOverlay = false, blockScroll = true,
      size = 'md', fullScreen = false, responsive = true,
      message, icon,
      acceptLabel: acceptLabelProp, rejectLabel: rejectLabelProp,
      acceptSeverity = 'primary', rejectSeverity = 'secondary',
      onAccept, onReject, className = '', children,
    },
    ref,
  ) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);
    useImperativeHandle(ref, () => dialogRef.current as HTMLDivElement);

    const [layer] = useState(() => nextLayer());
    const zDialog = 1000 + layer * 10;

    const [maximized, setMaximized] = useState(false);
    const kreatiLocale = useKreatiLocale();
    const base = 'k-dialog';

    const close = useCallback(() => onHide?.(), [onHide]);
    const accept = useCallback(() => { onAccept?.(); close(); }, [onAccept, close]);
    const reject = useCallback(() => { onReject?.(); close(); }, [onReject, close]);

    const titleId = `${base}-title-${layer}`;
    const bodyId = `${base}-body-${layer}`;

    useEffect(() => {
      if (!visible || !blockScroll) return;
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }, [visible, blockScroll]);

    useEffect(() => {
      if (!visible || !closeOnEscape) return;
      const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); close(); } };
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }, [visible, closeOnEscape, close]);

    useEffect(() => {
      if (!visible) return;
      previousFocusRef.current = document.activeElement as HTMLElement;
      requestAnimationFrame(() => dialogRef.current?.focus());
      return () => { previousFocusRef.current?.focus(); };
    }, [visible]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const el = dialogRef.current;
      if (!el) return;
      const focusable = el.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }, []);

    if (!visible) return null;

    const closeIcon = <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={TIMES_PATH} /></svg>;
    const maximizeIcon = <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={maximized ? RESTORE_PATH : MAXIMIZE_PATH} /></svg>;

    const isConfirm = variant === 'confirm';
    const hasHeader = !!(header || isConfirm || headerTemplate);
    const resolvedHeader = isConfirm && !header ? kreatiLocale.dialog.confirmation : header;

    const headerEl = headerTemplate ? (
      <div className={`${base}__header`}>{headerTemplate({ title: resolvedHeader, close })}</div>
    ) : hasHeader ? (
      <div className={`${base}__header`}>
        <div className={`${base}__header-content`} id={titleId}>
          {headerIcon && <span className={`${base}__header-icon`}>{headerIcon}</span>}
          {typeof resolvedHeader === 'string' ? <h2 className={`${base}__title`}>{resolvedHeader}</h2> : resolvedHeader}
        </div>
        <div className={`${base}__header-actions`}>
          {maximizable && <Button buttonType="text" severity="secondary" slim size="sm" iconLeft={maximizeIcon} ariaLabel={maximized ? kreatiLocale.dialog.restore : kreatiLocale.dialog.maximize} onClick={() => setMaximized((p) => !p)} />}
          {closable && <Button buttonType="text" severity="secondary" slim size="sm" iconLeft={closeIcon} ariaLabel={kreatiLocale.dialog.close} onClick={close} />}
        </div>
      </div>
    ) : null;

    const bodyContent = children ?? (isConfirm ? (
      <div className={`${base}__confirm-body`}>
        {icon && <span className={`${base}__confirm-icon`}>{icon}</span>}
        <span className={`${base}__confirm-message`}>{message}</span>
      </div>
    ) : null);

    const footerEl = footerTemplate ? (
      <div className={`${base}__footer`}>{footerTemplate({ accept, reject, close })}</div>
    ) : footer ? (
      <div className={`${base}__footer`}>{footer}</div>
    ) : isConfirm ? (
      <div className={`${base}__footer`}>
        <Button label={rejectLabelProp || kreatiLocale.dialog.reject} buttonType="text" severity={rejectSeverity} size="sm" onClick={reject} />
        <Button label={acceptLabelProp || kreatiLocale.dialog.accept} severity={acceptSeverity} size="sm" onClick={accept} />
      </div>
    ) : null;

    const dialogClasses = [
      base, `${base}--${size}`,
      fullScreen && `${base}--full-screen`,
      maximized && !fullScreen && `${base}--maximized`,
      responsive && `${base}--responsive`,
      !hasHeader && `${base}--no-header`,
      !footerEl && `${base}--no-footer`,
      !modal && `${base}--non-modal`,
      !modal && `${base}--pos-${position}`,
      className,
    ].filter(Boolean).join(' ');

    const overlayClasses = [
      `${base}-overlay`,
      position !== 'center' && `${base}-overlay--${position}`,
      responsive && `${base}-overlay--responsive`,
    ].filter(Boolean).join(' ');

    const dialogContent = (
      <>
        {headerEl}
        <div className={`${base}__body`} id={bodyId}>{bodyContent}</div>
        {footerEl}
      </>
    );

    const dialogEl = modal ? (
      <div className={overlayClasses} style={{ zIndex: zDialog }} onClick={closeOnOverlay ? (e) => { if (e.target === e.currentTarget) close(); } : undefined}>
        <div ref={dialogRef} className={dialogClasses} role="dialog" aria-modal="true" aria-labelledby={hasHeader ? titleId : undefined} aria-describedby={bodyId} tabIndex={-1} onKeyDown={handleKeyDown}>
          <LayerContext.Provider value={layer}>
            {dialogContent}
          </LayerContext.Provider>
        </div>
      </div>
    ) : (
      <div ref={dialogRef} className={dialogClasses} style={{ zIndex: zDialog }} role="dialog" aria-modal="false" aria-labelledby={hasHeader ? titleId : undefined} aria-describedby={bodyId} tabIndex={-1} onKeyDown={handleKeyDown}>
        <LayerContext.Provider value={layer}>
          {dialogContent}
        </LayerContext.Provider>
      </div>
    );

    return createPortal(dialogEl, document.body);
  },
);

Dialog.displayName = 'Dialog';
