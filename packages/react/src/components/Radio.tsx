import React, { forwardRef, useId, useRef, useState, useImperativeHandle } from 'react';
import './Radio.css';

export interface RadioProps {
  /** Checked state (controlled) */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Value submitted with forms and passed to RadioGroup */
  value?: string | number;
  /** Label text next to the radio */
  label?: React.ReactNode;
  /** Label position relative to the circle */
  labelPosition?: 'left' | 'right';
  /** Component size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Custom content rendered inside the circle when checked — replaces the default dot */
  checkedTemplate?: React.ReactNode;
  /** Custom content rendered inside the circle when unchecked — empty by default */
  uncheckedTemplate?: React.ReactNode;
  /** Helper text below the radio */
  helperText?: React.ReactNode;
  /** Error message or boolean */
  error?: React.ReactNode | boolean;
  /** Success state — applies success border color */
  success?: boolean;
  /** Severity color for the helper text */
  helperSeverity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'help' | 'danger';
  /** Disabled state */
  disabled?: boolean;
  /** Read-only state */
  readOnly?: boolean;
  /** Required indicator */
  required?: boolean;
  /** HTML name attribute — shared within a RadioGroup */
  name?: string;
  /** Change handler */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Blur handler */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * Radio component for single-option selection.
 *
 * @description A custom radio button with two visual states: unchecked (empty
 * circle) and checked (filled dot). Supports custom templates for both states,
 * label on either side, 5 sizes aligned with Input/Button, error/success/helper
 * text, and full ARIA + keyboard support. Compatible with Formik via name,
 * value, onChange, onBlur, and ref.
 *
 * @example
 * ```tsx
 * <Radio label="Option A" name="choice" value="a" />
 * <Radio label="Custom" checkedTemplate={<img src="star.svg" />} />
 * ```
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      checked: controlledChecked,
      defaultChecked,
      value,
      label,
      labelPosition = 'right',
      size = 'md',
      checkedTemplate,
      uncheckedTemplate,
      helperText,
      error,
      success = false,
      helperSeverity,
      disabled = false,
      readOnly = false,
      required = false,
      name,
      onChange,
      onBlur,
      className = '',
      style,
    },
    ref,
  ) => {
    const autoId = useId();
    const inputId = `${name || autoId}-${value ?? 'radio'}`;
    const innerRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    const isControlled = controlledChecked !== undefined;
    const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false);
    const isChecked = isControlled ? controlledChecked : internalChecked;

    const hasError = !!error;
    const errorMessage = typeof error === 'boolean' ? undefined : error;
    const base = 'k-radio';

    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;
    const describedBy = [hasError && errorId, helperText && helperId].filter(Boolean).join(' ') || undefined;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (readOnly) { e.preventDefault(); return; }
      if (!isControlled) setInternalChecked(e.target.checked);
      onChange?.(e);
    };

    const dotSize: Record<string, number> = { xs: 8, sm: 8, md: 10, lg: 14, xl: 16 };

    const defaultDot = (
      <svg width={dotSize[size]} height={dotSize[size]} viewBox={`0 0 ${dotSize[size]} ${dotSize[size]}`} aria-hidden="true">
        <circle cx={dotSize[size] / 2} cy={dotSize[size] / 2} r={dotSize[size] / 2} fill="currentColor" />
      </svg>
    );

    const renderContent = () => {
      if (isChecked) return checkedTemplate ?? defaultDot;
      return uncheckedTemplate ?? null;
    };

    const hasCustomUnchecked = !!uncheckedTemplate;

    const circleClasses = [
      `${base}__circle`,
      `${base}__circle--${size}`,
      isChecked && !hasError && !success && `${base}__circle--active`,
      isChecked && success && `${base}__circle--success`,
      !isChecked && hasCustomUnchecked && `${base}__circle--has-unchecked`,
      hasError && isChecked && `${base}__circle--error-active`,
      hasError && !isChecked && `${base}__circle--error`,
      disabled && `${base}__circle--disabled`,
    ].filter(Boolean).join(' ');

    const wrapperClasses = [
      base,
      `${base}--${labelPosition}`,
      disabled && `${base}--disabled`,
      readOnly && `${base}--readonly`,
      className,
    ].filter(Boolean).join(' ');

    const labelEl = label ? (
      <span className={`${base}__label ${base}__label--${size}`}>
        {label}
        {required && <span className={`${base}__required`} aria-hidden="true">*</span>}
      </span>
    ) : null;

    return (
      <div className={wrapperClasses} style={style}>
        <label className={`${base}__control`} htmlFor={inputId}>
          <input
            ref={innerRef}
            id={inputId}
            className={`${base}__native`}
            type="radio"
            checked={isControlled ? controlledChecked : undefined}
            defaultChecked={isControlled ? undefined : defaultChecked}
            value={value}
            name={name}
            disabled={disabled}
            required={required}
            onChange={handleChange}
            onBlur={onBlur}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            aria-required={required || undefined}
          />
          <span className={circleClasses}>
            {renderContent()}
          </span>
          {labelEl}
        </label>
        {hasError && errorMessage && (
          <span className={`${base}__error`} id={errorId} role="alert">{errorMessage}</span>
        )}
        {helperText && (
          <span
            className={[
              `${base}__helper`,
              helperSeverity && `${base}__helper--${helperSeverity}`,
            ].filter(Boolean).join(' ')}
            id={helperId}
          >
            {helperText}
          </span>
        )}
      </div>
    );
  },
);

Radio.displayName = 'Radio';
