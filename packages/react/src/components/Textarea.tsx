import React, { forwardRef, useId, useRef, useEffect, useCallback, useImperativeHandle } from 'react';
import { FieldWrapper } from './FieldWrapper';
import { Tooltip } from './Tooltip';
import './Textarea.css';

export interface TextareaProps {
  /** Textarea size — matches Input/Button sizes for visual consistency */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Visual variant: floating (label floats on border) or stacked (label above) */
  variant?: 'floating' | 'stacked';
  /** Label text */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Current value (controlled mode) */
  value?: string;
  /** Default value (uncontrolled mode) */
  defaultValue?: string;
  /** Number of visible rows (default: 3) */
  rows?: number;
  /** Auto-resize to fit content */
  autoSize?: boolean;
  /** Minimum rows when autoSize is enabled */
  minRows?: number;
  /** Maximum rows when autoSize is enabled (scrolls after) */
  maxRows?: number;
  /** CSS resize behavior */
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  /** Helper text displayed below the textarea */
  helperText?: React.ReactNode;
  /** Error message or boolean — applies error styling */
  error?: React.ReactNode | boolean;
  /** Applies success border and helper color */
  success?: boolean;
  /** Severity color for the helper text */
  helperSeverity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'help' | 'danger';
  /** Icon rendered inside on the left */
  iconLeft?: React.ReactNode;
  /** Icon rendered inside on the right */
  iconRight?: React.ReactNode;
  /** Tooltip text for the left icon */
  iconLeftTooltip?: string;
  /** Tooltip text for the right icon */
  iconRightTooltip?: string;
  /** Tooltip text for the container */
  tooltip?: string;
  /** Tooltip position */
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  /** Background color for the outer wrapper */
  background?: string;
  /** Background color for the textarea field only */
  inputBackground?: string;
  /** Text color for the textarea value */
  color?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Read-only state */
  readOnly?: boolean;
  /** Shows required indicator (*) on label */
  required?: boolean;
  /** Full width mode */
  fullWidth?: boolean;
  /** HTML name attribute */
  name?: string;
  /** Maximum character length */
  maxLength?: number;
  /** Show character count */
  showCount?: boolean;
  /** Change handler */
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  /** Focus handler */
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  /** Blur handler */
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  /** KeyDown handler */
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Textarea component for multi-line text input.
 *
 * @description A multi-line text input with the same design system as Input:
 * floating/stacked variants, 5 sizes, icon slots, tooltips, helper/error text,
 * and full state management. Supports auto-resize with minRows/maxRows limits,
 * optional character count, and configurable CSS resize behavior.
 *
 * @example
 * ```tsx
 * // Fixed height
 * <Textarea label="Bio" size="md" rows={4} />
 *
 * // Auto-resize with limits
 * <Textarea label="Comments" size="md" autoSize minRows={2} maxRows={8} />
 *
 * // With character count
 * <Textarea label="Description" size="md" maxLength={200} showCount />
 * ```
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      size = 'md',
      variant = 'floating',
      label,
      placeholder,
      value,
      defaultValue,
      rows = 3,
      autoSize = false,
      minRows,
      maxRows,
      resize = 'vertical',
      helperText,
      error,
      success = false,
      helperSeverity,
      iconLeft,
      iconRight,
      iconLeftTooltip,
      iconRightTooltip,
      tooltip,
      tooltipPosition = 'top',
      background,
      inputBackground,
      color,
      disabled = false,
      readOnly = false,
      required = false,
      fullWidth = false,
      name,
      maxLength,
      showCount = false,
      onChange,
      onFocus,
      onBlur,
      onKeyDown,
      className = '',
    },
    ref,
  ) => {
    const autoId = useId();
    const textareaId = name || autoId;
    const innerRef = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);

    const hasError = !!error;
    const errorMessage = typeof error === 'boolean' ? undefined : error;
    const isFloating = variant === 'floating';
    const hasLabel = !!label;
    const hasWrapper = !isFloating && !!(label || helperText || errorMessage);
    const base = 'k-textarea';

    const helperId = `${textareaId}-helper`;
    const errorId = `${textareaId}-error`;
    const describedBy = [hasError && errorId, (hasWrapper || isFloating) && helperId].filter(Boolean).join(' ') || undefined;

    const bgStyle = (() => {
      const s: React.CSSProperties = {};
      if (inputBackground) s.backgroundColor = inputBackground;
      if (color) s.color = color;
      return Object.keys(s).length ? s : undefined;
    })();
    const wrapperBgStyle = background ? { backgroundColor: background } as React.CSSProperties : undefined;

    /** Calculate line-height in px based on size for autoSize */
    const getLineHeight = useCallback(() => {
      const map: Record<string, number> = { xs: 16, sm: 18, md: 20, lg: 24, xl: 28 };
      return map[size] || 20;
    }, [size]);

    /** Auto-resize the textarea to fit content */
    const adjustHeight = useCallback(() => {
      const el = innerRef.current;
      if (!el || !autoSize) return;

      const lineHeight = getLineHeight();
      const minH = minRows ? minRows * lineHeight : undefined;
      const maxH = maxRows ? maxRows * lineHeight : undefined;

      el.style.height = 'auto';
      let newHeight = el.scrollHeight;

      if (minH && newHeight < minH) newHeight = minH;
      if (maxH && newHeight > maxH) newHeight = maxH;

      el.style.height = `${newHeight}px`;
      el.style.overflowY = maxH && el.scrollHeight > maxH ? 'auto' : 'hidden';
    }, [autoSize, minRows, maxRows, getLineHeight]);

    useEffect(() => {
      adjustHeight();
    }, [value, defaultValue, adjustHeight]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      adjustHeight();
      onChange?.(e);
    };

    const currentLength = (value ?? innerRef.current?.value ?? defaultValue ?? '').toString().length;

    const renderIcon = (icon: React.ReactNode, tooltipText?: string, side?: 'left' | 'right') => {
      const iconEl = (
        <span className={`${base}__icon ${base}__icon--${side}`} aria-hidden="true">
          {icon}
        </span>
      );
      return tooltipText ? <Tooltip content={tooltipText} position="top">{iconEl}</Tooltip> : iconEl;
    };

    const resizeStyle = autoSize ? 'none' : resize;

    const nativeTextarea = (
      <textarea
        ref={innerRef}
        id={textareaId}
        className={`${base}__native`}
        placeholder={isFloating && hasLabel ? ' ' : placeholder}
        value={value}
        defaultValue={defaultValue}
        rows={autoSize ? (minRows || rows) : rows}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        name={name}
        maxLength={maxLength}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        style={{ resize: resizeStyle }}
      />
    );

    const countEl = showCount && maxLength ? (
      <span className={`${base}__count`}>{currentLength}/{maxLength}</span>
    ) : showCount ? (
      <span className={`${base}__count`}>{currentLength}</span>
    ) : null;

    /* ── Floating variant ── */
    if (isFloating) {
      const fieldsetClasses = [
        `${base}__fieldset`,
        `${base}__fieldset--${size}`,
        hasError && `${base}__fieldset--error`,
        !hasError && success && `${base}__fieldset--success`,
        disabled && `${base}__fieldset--disabled`,
        readOnly && `${base}__fieldset--readonly`,
        fullWidth && `${base}__fieldset--full-width`,
        iconLeft && `${base}__fieldset--has-icon-left`,
        className,
      ]
        .filter(Boolean)
        .join(' ');

      const floatWrapperClasses = [
        `${base}__floating-wrapper`,
        fullWidth && `${base}__floating-wrapper--full-width`,
      ]
        .filter(Boolean)
        .join(' ');

      const legendText = hasLabel ? `${label}${required ? ' *' : ''}` : '';

      const fieldsetEl = (
        <fieldset className={fieldsetClasses} disabled={disabled} style={bgStyle}>
          {hasLabel && (
            <legend className={`${base}__legend`}>
              <span className={`${base}__legend-text`}>{legendText}</span>
            </legend>
          )}
          <div className={`${base}__fieldset-inner`}>
            {iconLeft && renderIcon(iconLeft, iconLeftTooltip, 'left')}
            {nativeTextarea}
            {iconRight && renderIcon(iconRight, iconRightTooltip, 'right')}
          </div>
          {hasLabel && (
            <label className={`${base}__floating-label`} htmlFor={textareaId}>
              {label}
              {required && <span className={`${base}__floating-required`} aria-hidden="true">*</span>}
            </label>
          )}
        </fieldset>
      );

      const inputElement = tooltip
        ? <Tooltip content={tooltip} position={tooltipPosition}>{fieldsetEl}</Tooltip>
        : fieldsetEl;

      return (
        <div className={floatWrapperClasses} style={wrapperBgStyle}>
          {inputElement}
          {countEl}
          {hasError && errorMessage && (
            <span className={`${base}__floating-error`} id={errorId} role="alert">{errorMessage}</span>
          )}
          {helperText && (
            <span
              className={[
                `${base}__floating-helper`,
                helperSeverity && `${base}__floating-helper--${helperSeverity}`,
              ].filter(Boolean).join(' ')}
              id={helperId}
            >
              {helperText}
            </span>
          )}
        </div>
      );
    }

    /* ── Stacked variant ── */
    const containerClasses = [
      `${base}__container`,
      `${base}__container--${size}`,
      hasError && `${base}__container--error`,
      !hasError && success && `${base}__container--success`,
      disabled && `${base}__container--disabled`,
      readOnly && `${base}__container--readonly`,
      fullWidth && `${base}__container--full-width`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const containerEl = (
      <div className={containerClasses} style={bgStyle}>
        {iconLeft && renderIcon(iconLeft, iconLeftTooltip, 'left')}
        {nativeTextarea}
        {iconRight && renderIcon(iconRight, iconRightTooltip, 'right')}
      </div>
    );

    const inputElement = tooltip
      ? <Tooltip content={tooltip} position={tooltipPosition}>{containerEl}</Tooltip>
      : containerEl;

    if (!hasWrapper && !countEl) return inputElement;

    if (!hasWrapper && countEl) {
      return (
        <div className={`${base}__standalone-wrapper`}>
          {inputElement}
          {countEl}
        </div>
      );
    }

    return (
      <FieldWrapper
        label={label}
        htmlFor={textareaId}
        required={required}
        helperText={helperText}
        error={errorMessage}
        success={success}
        helperSeverity={helperSeverity}
        size={size}
        disabled={disabled}
        fullWidth={fullWidth}
      >
        {inputElement}
        {countEl}
      </FieldWrapper>
    );
  },
);

Textarea.displayName = 'Textarea';
