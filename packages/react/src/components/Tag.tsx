import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { TIMES_PATH } from './iconPaths';
import { useKreatiLocale } from '../locale';
import './Tag.css';

export interface TagProps {
  /** Tag content */
  children: React.ReactNode;
  /** Visual severity */
  severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'help' | 'danger';
  /** Icon before the text */
  icon?: React.ReactNode;
  /** Show remove button */
  removable?: boolean;
  /** Callback when remove is clicked */
  onRemove?: () => void;
  /** Rounded pill shape (default: true) */
  rounded?: boolean;
  /**
   * Custom render replacing the tag content.
   *
   * @param props - Object with severity and onRemove callback
   * @returns ReactNode to render inside the tag
   */
  contentTemplate?: (props: { severity: string; onRemove?: () => void }) => React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * Tag component for labels, categories, and metadata.
 *
 * @description A small inline label with severity colors, optional icon,
 * and removable functionality. Useful for categorization, filtering,
 * and status indicators.
 *
 * @example
 * ```tsx
 * <Tag severity="success">Active</Tag>
 * <Tag severity="danger" removable onRemove={() => {}}>Error</Tag>
 * <Tag icon={<MyIcon />}>Custom</Tag>
 * ```
 */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(
  ({ children, severity = 'primary', icon, removable = false, onRemove, rounded = false, contentTemplate, className = '', style }, ref) => {
    const elRef = useRef<HTMLSpanElement>(null);
    useImperativeHandle(ref, () => elRef.current as HTMLSpanElement);
    const locale = useKreatiLocale();

    const base = 'k-tag';
    const classes = [base, `${base}--${severity}`, rounded && `${base}--rounded`, className].filter(Boolean).join(' ');

    return (
      <span ref={elRef} className={classes} style={style}>
        {contentTemplate ? contentTemplate({ severity, onRemove }) : (
          <>
            {icon && <span className={`${base}__icon`}>{icon}</span>}
            <span className={`${base}__text`}>{children}</span>
            {removable && (
              <button type="button" className={`${base}__remove`} onClick={onRemove} aria-label={locale.common.close}>
                <svg width={10} height={10} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={TIMES_PATH} /></svg>
              </button>
            )}
          </>
        )}
      </span>
    );
  },
);

Tag.displayName = 'Tag';
