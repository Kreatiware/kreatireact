import React, { forwardRef, useState, useEffect, useCallback, useRef, useImperativeHandle } from 'react';
import { CHECK_PATH, TIMES_PATH, INFO_CIRCLE_PATH, EXCLAMATION_TRIANGLE_PATH, HELP_CIRCLE_PATH } from './iconPaths';
import { useKreatiLocale } from '../locale';
import './Message.css';

/** Severity types for Message */
export type MessageSeverity = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'help' | 'danger' | 'accent';

export interface MessageProps {
  /** Visual severity — determines background, border, and default icon */
  severity?: MessageSeverity;
  /** Message text content */
  children?: React.ReactNode;
  /** Show severity icon — true for preset, or pass ReactNode for custom */
  icon?: boolean | React.ReactNode;
  /** Show close button */
  closable?: boolean;
  /** Remains visible until manually closed — when false, auto-dismisses after `life` ms */
  sticky?: boolean;
  /** Auto-dismiss duration in milliseconds (requires sticky=false) */
  life?: number;
  /** Thick colored border position */
  borderPosition?: 'left' | 'top' | 'right' | 'bottom' | false;
  /**
   * Custom render replacing the entire message content.
   *
   * @param props - Object with severity, onClose callback
   * @returns ReactNode to render as the message body
   */
  contentTemplate?: (props: { severity: MessageSeverity; onClose: () => void }) => React.ReactNode;
  /** Callback when message is closed */
  onClose?: () => void;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

const SEVERITY_ICONS: Record<MessageSeverity, string> = {
  primary: INFO_CIRCLE_PATH,
  secondary: INFO_CIRCLE_PATH,
  success: CHECK_PATH,
  info: INFO_CIRCLE_PATH,
  warning: EXCLAMATION_TRIANGLE_PATH,
  help: HELP_CIRCLE_PATH,
  danger: TIMES_PATH,
};

const iconSvg = (path: string) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d={path} />
  </svg>
);

/**
 * Message component for inline feedback and alerts.
 *
 * @description Displays a styled message with severity-based colors,
 * optional icon (preset or custom), close button, auto-dismiss via
 * life/sticky, colored border accent, and custom content template.
 * Entry and exit animations use opacity + transform for GPU acceleration.
 * Respects prefers-reduced-motion.
 *
 * @example
 * ```tsx
 * <Message severity="success">Record saved successfully</Message>
 * <Message severity="warning" icon closable borderPosition="left">Check your input</Message>
 * <Message severity="info" sticky={false} life={3000}>This will disappear</Message>
 * ```
 */
export const Message = forwardRef<HTMLDivElement, MessageProps>(
  (
    {
      severity = 'info',
      children,
      icon = false,
      closable = false,
      sticky = true,
      life = 3000,
      borderPosition = false,
      contentTemplate,
      onClose,
      className = '',
      style,
    },
    ref,
  ) => {
    const elRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => elRef.current as HTMLDivElement);

    const locale = useKreatiLocale();
    const [visible, setVisible] = useState(true);
    const [exiting, setExiting] = useState(false);
    const base = 'k-message';

    const handleClose = useCallback(() => {
      setExiting(true);
    }, []);

    const handleAnimationEnd = useCallback(() => {
      if (exiting) {
        setVisible(false);
        onClose?.();
      }
    }, [exiting, onClose]);

    useEffect(() => {
      if (sticky || !visible || exiting) return;
      const timer = setTimeout(handleClose, life);
      return () => clearTimeout(timer);
    }, [sticky, life, visible, exiting, handleClose]);

    if (!visible) return null;

    const resolvedIcon = icon === true ? iconSvg(SEVERITY_ICONS[severity]) : icon || null;

    const classes = [
      base,
      `${base}--${severity}`,
      borderPosition && `${base}--border-${borderPosition}`,
      exiting && `${base}--exit`,
      className,
    ].filter(Boolean).join(' ');

    return (
      <div
        ref={elRef}
        className={classes}
        style={style}
        role="alert"
        aria-live="polite"
        onAnimationEnd={handleAnimationEnd}
      >
        {contentTemplate ? contentTemplate({ severity, onClose: handleClose }) : (
          <>
            {resolvedIcon && <span className={`${base}__icon`}>{resolvedIcon}</span>}
            <span className={`${base}__text`}>{children}</span>
            {closable && (
              <button
                type="button"
                className={`${base}__close`}
                onClick={handleClose}
                aria-label={locale.message.close}
              >
                {iconSvg(TIMES_PATH)}
              </button>
            )}
          </>
        )}
      </div>
    );
  },
);

Message.displayName = 'Message';
