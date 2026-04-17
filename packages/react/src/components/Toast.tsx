import React, { forwardRef, useState, useEffect, useCallback, useRef, useImperativeHandle } from 'react';
import { CHECK_PATH, TIMES_PATH, INFO_CIRCLE_PATH, EXCLAMATION_TRIANGLE_PATH, HELP_CIRCLE_PATH } from './iconPaths';
import { useKreatiLocale } from '../locale';
import './Toast.css';

/** Severity types for Toast */
export type ToastSeverity = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'help' | 'danger' | 'accent';

export interface ToastItem {
  /** Unique key — auto-generated if not provided */
  id?: string;
  /** Visual severity */
  severity?: ToastSeverity;
  /** Title / header text */
  summary?: React.ReactNode;
  /** Body / detail text */
  detail?: React.ReactNode;
  /** Show severity icon — true for preset, or ReactNode for custom */
  icon?: boolean | React.ReactNode;
  /** Show close button */
  closable?: boolean;
  /** Show countdown progress bar */
  showProgress?: boolean;
  /** Remains visible until manually closed */
  sticky?: boolean;
  /** Auto-dismiss duration in ms (requires sticky=false) */
  life?: number;
  /**
   * Custom render replacing the entire toast content.
   *
   * @param props - Object with the toast item data and onClose callback
   * @returns ReactNode to render as the toast body
   */
  contentTemplate?: (props: { item: ToastItem; onClose: () => void }) => React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/** Position of the ToastContainer on screen */
export type ToastPosition = 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center';

const SEVERITY_ICONS: Record<ToastSeverity, string> = {
  primary: INFO_CIRCLE_PATH,
  secondary: INFO_CIRCLE_PATH,
  success: CHECK_PATH,
  info: INFO_CIRCLE_PATH,
  warning: EXCLAMATION_TRIANGLE_PATH,
  help: HELP_CIRCLE_PATH,
  danger: TIMES_PATH,
};

const iconSvg = (path: string) => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d={path} />
  </svg>
);

/* ── Individual Toast ── */

interface ToastEntryProps {
  item: ToastItem & { id: string };
  onClose: (id: string) => void;
  position: ToastPosition;
}

const ToastEntry: React.FC<ToastEntryProps> = ({ item, onClose, position }) => {
  const [exiting, setExiting] = useState(false);
  const locale = useKreatiLocale();
  const base = 'k-toast';
  const severity = item.severity ?? 'info';

  const handleClose = useCallback(() => setExiting(true), []);

  const handleAnimationEnd = useCallback(() => {
    if (exiting) onClose(item.id);
  }, [exiting, item.id, onClose]);

  useEffect(() => {
    if (item.sticky !== false || exiting) return;
    const timer = setTimeout(handleClose, item.life ?? 3000);
    return () => clearTimeout(timer);
  }, [item.sticky, item.life, exiting, handleClose]);

  const resolvedIcon = item.icon === true ? iconSvg(SEVERITY_ICONS[severity]) : item.icon || null;
  const closable = item.closable ?? true;
  const showProgress = item.showProgress === true && item.sticky === false;

  // Determine slide direction from position
  const slideClass = position.includes('left') ? `${base}--slide-left`
    : position.includes('right') ? `${base}--slide-right`
    : `${base}--slide-top`;

  const classes = [
    `${base}__item`,
    `${base}__item--${severity}`,
    slideClass,
    exiting && `${base}__item--exit`,
    item.className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      style={{ ...item.style, '--k-toast-life': `${item.life ?? 3000}ms` } as React.CSSProperties}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      onAnimationEnd={handleAnimationEnd}
    >
      {item.contentTemplate ? item.contentTemplate({ item, onClose: handleClose }) : (
        <>
          {resolvedIcon && <span className={`${base}__icon`}>{resolvedIcon}</span>}
          <div className={`${base}__content`}>
            {item.summary && <div className={`${base}__summary`}>{item.summary}</div>}
            {item.detail && <div className={`${base}__detail`}>{item.detail}</div>}
          </div>
          {closable && (
            <button
              type="button"
              className={`${base}__close`}
              onClick={handleClose}
              aria-label={locale.toast.close}
            >
              {iconSvg(TIMES_PATH)}
            </button>
          )}
        </>
      )}
      {showProgress && !exiting && <div className={`${base}__progress ${base}__progress--${severity}`} />}
    </div>
  );
};

/* ── ToastContainer ── */

export interface ToastContainerProps {
  /** Screen position */
  position?: ToastPosition;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

export interface ToastContainerRef {
  /** Show one or more toasts */
  show: (items: ToastItem | ToastItem[]) => void;
  /** Remove a toast by id */
  remove: (id: string) => void;
  /** Clear all toasts */
  clear: () => void;
}

let counter = 0;
const nextId = () => `kt-${++counter}`;

/**
 * ToastContainer component for overlay notification toasts.
 *
 * @description A fixed-position container that manages stacked toast
 * notifications via an imperative ref API. Toasts slide in from the
 * edge based on position, support auto-dismiss with progress bar,
 * custom templates, severity icons, and all standard severity colors.
 * Uses high z-index to render above dialogs and drawers.
 *
 * @example
 * ```tsx
 * const toast = useRef<ToastContainerRef>(null);
 *
 * <ToastContainer ref={toast} position="top-right" />
 * <Button onClick={() => toast.current?.show({
 *   severity: 'success',
 *   summary: 'Saved',
 *   detail: 'Your changes have been saved.',
 *   icon: true,
 *   life: 3000,
 *   sticky: false,
 * })}>Save</Button>
 * ```
 */
export const ToastContainer = forwardRef<ToastContainerRef, ToastContainerProps>(
  ({ position = 'top-right', className = '', style }, ref) => {
    const [toasts, setToasts] = useState<(ToastItem & { id: string })[]>([]);

    const show = useCallback((input: ToastItem | ToastItem[]) => {
      const items = Array.isArray(input) ? input : [input];
      setToasts((prev) => [...prev, ...items.map((t) => ({ ...t, id: t.id ?? nextId() }))]);
    }, []);

    const remove = useCallback((id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const clear = useCallback(() => setToasts([]), []);

    useImperativeHandle(ref, () => ({ show, remove, clear }), [show, remove, clear]);

    const base = 'k-toast';

    return (
      <div
        className={[`${base}__container`, `${base}__container--${position}`, className].filter(Boolean).join(' ')}
        style={style}
        aria-live="polite"
        aria-relevant="additions removals"
      >
        {toasts.map((t) => (
          <ToastEntry key={t.id} item={t} onClose={remove} position={position} />
        ))}
      </div>
    );
  },
);

ToastContainer.displayName = 'ToastContainer';
