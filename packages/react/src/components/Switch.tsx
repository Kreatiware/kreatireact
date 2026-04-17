import React, { forwardRef, useId, useRef, useState, useImperativeHandle } from 'react';
import './Switch.css';

export interface SwitchProps {
  /** Checked (on) state — controlled */
  checked?: boolean;
  /** Default checked state — uncontrolled */
  defaultChecked?: boolean;
  /** Value submitted with forms */
  value?: string | number;
  /** Label text next to the switch */
  label?: React.ReactNode;
  /** Label position relative to the switch */
  labelPosition?: 'left' | 'right';
  /** Component size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Custom content rendered inside the thumb when on */
  thumbOnTemplate?: React.ReactNode;
  /** Custom content rendered inside the thumb when off */
  thumbOffTemplate?: React.ReactNode;
  /** Custom content rendered inside the track when on */
  trackOnTemplate?: React.ReactNode;
  /** Custom content rendered inside the track when off */
  trackOffTemplate?: React.ReactNode;
  /** Helper text below the switch */
  helperText?: React.ReactNode;
  /** Error message or boolean */
  error?: React.ReactNode | boolean;
  /** Success state */
  success?: boolean;
  /** Severity color for the helper text */
  helperSeverity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'help' | 'danger' | 'accent';
  /** Disabled state */
  disabled?: boolean;
  /** Read-only state */
  readOnly?: boolean;
  /** Required indicator */
  required?: boolean;
  /** HTML name attribute */
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
 * Switch component for toggling between on/off states.
 *
 * @description A toggle switch with a sliding thumb on a track. Supports
 * custom templates for both the thumb and track in on/off states, label on
 * either side, 5 sizes, error/success/helper text, and full ARIA switch
 * role + keyboard support. Compatible with Formik via name, value, onChange,
 * onBlur, and ref.
 *
 * @example
 * ```tsx
 * <Switch label="Dark mode" />
 * <Switch label="Notifications" checked onChange={(e) => set(e.target.checked)} />
 * <Switch label="Custom" thumbOnTemplate={<Check size={12} />} />
 * ```
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      checked: controlledChecked,
      defaultChecked,
      value,
      label,
      labelPosition = 'right',
      size = 'md',
      thumbOnTemplate,
      thumbOffTemplate,
      trackOnTemplate,
      trackOffTemplate,
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
    const inputId = name || autoId;
    const innerRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    const isControlled = controlledChecked !== undefined;
    const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false);
    const isOn = isControlled ? controlledChecked : internalChecked;

    const hasError = !!error;
    const errorMessage = typeof error === 'boolean' ? undefined : error;
    const base = 'k-switch';

    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;
    const describedBy = [hasError && errorId, helperText && helperId].filter(Boolean).join(' ') || undefined;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (readOnly) { e.preventDefault(); return; }
      if (!isControlled) setInternalChecked(e.target.checked);
      onChange?.(e);
    };

    const trackClasses = [
      `${base}__track`,
      `${base}__track--${size}`,
      isOn && !hasError && !success && `${base}__track--on`,
      isOn && success && `${base}__track--success`,
      isOn && hasError && `${base}__track--error`,
      !isOn && hasError && `${base}__track--error-off`,
      disabled && `${base}__track--disabled`,
    ].filter(Boolean).join(' ');

    const thumbClasses = [
      `${base}__thumb`,
      `${base}__thumb--${size}`,
      isOn && `${base}__thumb--on`,
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
            type="checkbox"
            role="switch"
            checked={isControlled ? controlledChecked : undefined}
            defaultChecked={isControlled ? undefined : defaultChecked}
            value={value}
            name={name}
            disabled={disabled}
            required={required}
            onChange={handleChange}
            onBlur={onBlur}
            aria-checked={isOn}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            aria-required={required || undefined}
          />
          <span className={trackClasses}>
            {isOn && trackOnTemplate && <span className={`${base}__track-content`}>{trackOnTemplate}</span>}
            {!isOn && trackOffTemplate && <span className={`${base}__track-content`}>{trackOffTemplate}</span>}
            <span className={thumbClasses}>
              {isOn ? thumbOnTemplate : thumbOffTemplate}
            </span>
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

Switch.displayName = 'Switch';
