import React, { forwardRef, useId, useRef, useCallback, useImperativeHandle } from 'react';
import { FieldWrapper } from './FieldWrapper';
import { Tooltip } from './Tooltip';
import { useKreatiLocale } from '../locale';
import './Input.css';

export interface InputProps {
  /** Input type */
  type?: 'text' | 'password' | 'email' | 'number' | 'search' | 'tel' | 'url';
  /** Input size — matches Button sizes for visual consistency */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Visual variant: floating (label floats on border) or stacked (label above) */
  variant?: 'floating' | 'stacked';
  /** Label text */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Current value (controlled mode) */
  value?: string | number;
  /** Default value (uncontrolled mode) */
  defaultValue?: string | number;
  /** Helper text displayed below the input */
  helperText?: React.ReactNode;
  /** Error message or boolean — applies error styling */
  error?: React.ReactNode | boolean;
  /** Applies success border and helper color */
  success?: boolean;
  /** Severity color for the helper text */
  helperSeverity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'help' | 'danger';
  /** Icon rendered inside the input on the left */
  iconLeft?: React.ReactNode;
  /** Icon rendered inside the input on the right */
  iconRight?: React.ReactNode;
  /** Tooltip text for the left icon */
  iconLeftTooltip?: string;
  /** Tooltip text for the right icon */
  iconRightTooltip?: string;
  /** Tooltip text for the input container */
  tooltip?: string;
  /** Tooltip position for the input container */
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  /** Background color for the outer wrapper */
  background?: string;
  /** Background color for the input field only */
  inputBackground?: string;
  /** Text color for the input value */
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
  /** HTML autocomplete attribute */
  autoComplete?: string;
  /** Maximum character length */
  maxLength?: number;
  /** Minimum value (for number type) */
  min?: number | string;
  /** Maximum value (for number type) */
  max?: number | string;
  /** Step value (for number type) */
  step?: number | string;
  /** Hides the native stepper arrows on number inputs — when false, renders custom ChevronUp/ChevronDown buttons instead of native ones */
  hideSteppers?: boolean;
  /** Decimal separator for number inputs — uses text+inputMode internally when set to comma */
  decimalSeparator?: '.' | ',';
  /** Change handler */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Focus handler */
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** Blur handler */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** KeyDown handler */
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * Input component for text-based form fields.
 *
 * @description A versatile text input with 5 sizes aligned to Button,
 * two variants (floating with label on border, stacked with label above),
 * icon slots with optional tooltips, and full state management.
 * Floating is the default variant. Icons accept any ReactNode.
 *
 * @example
 * ```tsx
 * // Floating (default) — label floats to border on focus/value
 * <Input label="Email" type="email" size="md" required />
 *
 * // Stacked — label stays above the input
 * <Input label="Email" variant="stacked" type="email" size="md" />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      size = 'md',
      variant = 'floating',
      label,
      placeholder,
      value,
      defaultValue,
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
      autoComplete,
      maxLength,
      min,
      max,
      step,
      hideSteppers = false,
      decimalSeparator,
      onChange,
      onFocus,
      onBlur,
      onKeyDown,
      className = '',
      style,
    },
    ref,
  ) => {
    const autoId = useId();
    const inputId = name || autoId;
    const innerRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    const kreatiLocale = useKreatiLocale();
    const hasError = !!error;
    const errorMessage = typeof error === 'boolean' ? undefined : error;
    const isFloating = variant === 'floating';
    const isNumber = type === 'number';
    const useCommaSeparator = isNumber && decimalSeparator === ',';
    const resolvedType = useCommaSeparator ? 'text' : type;
    const resolvedInputMode = useCommaSeparator ? 'decimal' as const : undefined;
    const showCustomSteppers = isNumber && !hideSteppers && !useCommaSeparator;

    const commaPattern = /^-?\d*,?\d*$/;

    const handleBeforeInput = useCommaSeparator
      ? (e: React.FormEvent<HTMLInputElement>) => {
          const input = e.target as HTMLInputElement;
          const ev = e.nativeEvent as InputEvent;
          if (!ev.data) return;
          const { selectionStart, selectionEnd, value: cur } = input;
          const next = cur.slice(0, selectionStart ?? 0) + ev.data + cur.slice(selectionEnd ?? 0);
          if (!commaPattern.test(next)) e.preventDefault();
        }
      : undefined;

    const handleStepper = useCallback((direction: 1 | -1) => {
      const el = innerRef.current;
      if (!el || disabled || readOnly) return;
      const s = Number(step) || 1;
      const current = Number(el.value) || 0;
      let next = current + s * direction;
      if (min !== undefined && next < Number(min)) next = Number(min);
      if (max !== undefined && next > Number(max)) next = Number(max);
      const nativeSet = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      nativeSet?.call(el, String(next));
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, [disabled, readOnly, step, min, max]);

    const hasLabel = !!label;
    const hasWrapper = !isFloating && !!(label || helperText || errorMessage);
    const base = 'k-input';

    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;
    const describedBy = [hasError && errorId, (hasWrapper || isFloating) && helperId].filter(Boolean).join(' ') || undefined;

    const bgStyle = (() => {
      const s: React.CSSProperties = {};
      if (inputBackground) s.backgroundColor = inputBackground;
      if (color) s.color = color;
      return Object.keys(s).length ? s : undefined;
    })();
    const wrapperBgStyle = background ? { backgroundColor: background } as React.CSSProperties : undefined;

    const renderIcon = (icon: React.ReactNode, tooltipText?: string, side?: 'left' | 'right') => {
      const iconEl = (
        <span className={`${base}__icon ${base}__icon--${side}`} aria-hidden="true">
          {icon}
        </span>
      );
      return tooltipText ? <Tooltip content={tooltipText} position="top">{iconEl}</Tooltip> : iconEl;
    };

    const stepperButtons = showCustomSteppers ? (
      <span className={`${base}__steppers`}>
        <button
          type="button"
          className={`${base}__stepper`}
          onClick={() => handleStepper(1)}
          tabIndex={-1}
          aria-label={kreatiLocale.common.increment}
          disabled={disabled}
        >
          <svg width={10} height={10} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M11.31,6.96c-.34.07-.62.21-.83.41-1.36,1.27-2.69,2.52-3.95,3.71-1.26,1.19-2.56,2.41-3.85,3.62l-.32.29-.03.02c-.16.17-.24.37-.24.6,0,.27.14.52.4.75.24.21.27.18.4.24.43.21.29.13.6.24.39.16.35.16.56.21.32.05.6.02.85-.11.17-.09.34-.22.52-.38,1.83-1.84,6.02-6.17,6.47-6.45.27.11,2.8,2.42,3.39,3.01.23.23.44.44.63.62.97.93,1.7,1.96,2.65,2.88.18.16.34.29.51.37.24.13.53.16.86.11.2-.04.48-.13.86-.29.36-.14.08,0,.43-.17.14-.09.14-.05.39-.26.29-.24.42-.49.42-.78,0-.24-.11-.46-.3-.62l-.3-.26c-1.21-1.13-2.45-2.3-3.86-3.63-1.27-1.2-2.6-2.45-3.96-3.72-.18-.16-.41-.27-.7-.35-.24-.07-.51-.1-.79-.11-.29,0-.57.02-.84.08Z" />
          </svg>
        </button>
        <button
          type="button"
          className={`${base}__stepper`}
          onClick={() => handleStepper(-1)}
          tabIndex={-1}
          aria-label={kreatiLocale.common.decrement}
          disabled={disabled}
        >
          <svg width={10} height={10} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12.84,17.04c.34-.07.62-.21.83-.41,1.36-1.27,2.69-2.52,3.95-3.71,1.26-1.19,2.56-2.41,3.85-3.62l.32-.29.03-.02c.16-.17.24-.37.24-.6,0-.27-.14-.52-.4-.75-.24-.21-.27-.18-.4-.24-.43-.21-.29-.13-.6-.24-.39-.16-.35-.16-.56-.21-.32-.05-.6-.02-.85.11-.17.09-.34.22-.52.38-1.83,1.84-6.02,6.17-6.47,6.45-.27-.11-2.8-2.42-3.39-3.01-.23-.23-.44-.44-.63-.62-.97-.93-1.7-1.96-2.65-2.88-.18-.16-.34-.29-.51-.37-.24-.13-.53-.16-.86-.11-.2.04-.48.13-.86.29-.36.14-.08,0-.43.17-.14.09-.14.05-.39.26-.29.24-.42.49-.42.78,0,.24.11.46.3.62l.3.26c1.21,1.13,2.45,2.3,3.86,3.63,1.27,1.2,2.6,2.45,3.96,3.72.18.16.41.27.7.35.24.07.51.1.79.11.29,0,.57-.02.84-.08Z" />
          </svg>
        </button>
      </span>
    ) : null;

    const nativeInput = (
      <input
        ref={innerRef}
        id={inputId}
        className={[
          `${base}__native`,
          (hideSteppers || showCustomSteppers) && `${base}__native--no-steppers`,
        ].filter(Boolean).join(' ')}
        type={resolvedType}
        inputMode={resolvedInputMode}
        placeholder={isFloating && hasLabel ? ' ' : placeholder}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        name={name}
        autoComplete={autoComplete}
        maxLength={maxLength}
        min={useCommaSeparator ? undefined : min}
        max={useCommaSeparator ? undefined : max}
        step={useCommaSeparator ? undefined : step}
        onChange={onChange}
        onBeforeInput={handleBeforeInput}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        aria-required={required || undefined}
      />
    );

    /* ── Floating variant uses fieldset/legend ── */
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

      const wrapperClasses = [
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
            {nativeInput}
            {iconRight && renderIcon(iconRight, iconRightTooltip, 'right')}
            {stepperButtons}
          </div>
          {hasLabel && (
            <label className={`${base}__floating-label`} htmlFor={inputId}>
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
        <div className={wrapperClasses} style={wrapperBgStyle}>
          {inputElement}
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
        {nativeInput}
        {iconRight && renderIcon(iconRight, iconRightTooltip, 'right')}
        {stepperButtons}
      </div>
    );

    const inputElement = tooltip
      ? <Tooltip content={tooltip} position={tooltipPosition}>{containerEl}</Tooltip>
      : containerEl;

    if (!hasWrapper) return inputElement;

    return (
      <FieldWrapper
        style={style}
        label={label}
        htmlFor={inputId}
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
      </FieldWrapper>
    );
  },
);

Input.displayName = 'Input';
