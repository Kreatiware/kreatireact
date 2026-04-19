import React, {
  forwardRef,
  useId,
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
} from "react";
import { CHECK_PATH, MINUS_PATH } from "./iconPaths";
import "./Checkbox.css";

export interface CheckboxProps {
  /** Checked state (controlled) */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Indeterminate (partial) state — visual only, does not affect checked */
  indeterminate?: boolean;
  /** Value submitted with forms and passed to CheckboxGroup */
  value?: string | number;
  /** Label text next to the checkbox */
  label?: React.ReactNode;
  /** Label position relative to the box */
  labelPosition?: "left" | "right";
  /** Component size */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Custom content rendered inside the box when checked — replaces the default Check icon */
  checkedTemplate?: React.ReactNode;
  /** Custom content rendered inside the box when unchecked — empty by default */
  uncheckedTemplate?: React.ReactNode;
  /** Custom content rendered inside the box when indeterminate — replaces the default Minus icon */
  indeterminateTemplate?: React.ReactNode;
  /** Helper text below the checkbox */
  helperText?: React.ReactNode;
  /** Error message or boolean */
  error?: React.ReactNode | boolean;
  /** Severity color for the helper text */
  helperSeverity?:
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "help"
    | "danger"
    | "accent";
  /** Success state — applies success border color */
  success?: boolean;
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
 * Checkbox component for boolean or indeterminate selection.
 *
 * @description A custom checkbox with three visual states: unchecked, checked
 * (shows Check icon from kreatiicons), and indeterminate (shows Minus icon).
 * Supports custom templates for all three states, label on either side,
 * 5 sizes aligned with Input/Button, error/helper text, and full ARIA +
 * keyboard support. Compatible with Formik via name, value, onChange,
 * onBlur, and ref.
 *
 * @example
 * ```tsx
 * <Checkbox label="Accept terms" required />
 * <Checkbox label="Select all" indeterminate />
 * <Checkbox label="Custom" checkedTemplate={<img src="star.svg" />} />
 * ```
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked: controlledChecked,
      defaultChecked,
      indeterminate = false,
      value,
      label,
      labelPosition = "right",
      size = "md",
      checkedTemplate,
      uncheckedTemplate,
      indeterminateTemplate,
      helperText,
      error,
      helperSeverity,
      success = false,
      disabled = false,
      readOnly = false,
      required = false,
      name,
      onChange,
      onBlur,
      className = "",
      style,
    },
    ref
  ) => {
    const autoId = useId();
    const inputId = name || autoId;
    const innerRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    const isControlled = controlledChecked !== undefined;
    const [internalChecked, setInternalChecked] = useState(
      defaultChecked ?? false
    );
    const isChecked = isControlled ? controlledChecked : internalChecked;

    const hasError = !!error;
    const errorMessage = typeof error === "boolean" ? undefined : error;
    const base = "k-checkbox";

    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;
    const describedBy =
      [hasError && errorId, helperText && helperId].filter(Boolean).join(" ") ||
      undefined;

    useEffect(() => {
      if (innerRef.current) innerRef.current.indeterminate = indeterminate;
    }, [indeterminate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (readOnly) {
        e.preventDefault();
        return;
      }
      if (!isControlled) setInternalChecked(e.target.checked);
      onChange?.(e);
    };

    const iconSize: Record<string, number> = {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 18,
      xl: 22,
    };

    const defaultCheckIcon = (
      <svg
        width={iconSize[size]}
        height={iconSize[size]}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d={CHECK_PATH} />
      </svg>
    );

    const defaultMinusIcon = (
      <svg
        width={iconSize[size]}
        height={iconSize[size]}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d={MINUS_PATH} />
      </svg>
    );

    const renderBoxContent = () => {
      if (indeterminate) return indeterminateTemplate ?? defaultMinusIcon;
      if (isChecked) return checkedTemplate ?? defaultCheckIcon;
      return uncheckedTemplate ?? null;
    };

    const isActive = isChecked || indeterminate;
    const hasCustomUnchecked = !!uncheckedTemplate;

    const boxClasses = [
      `${base}__box`,
      `${base}__box--${size}`,
      isActive && !hasError && !success && `${base}__box--active`,
      isActive && success && `${base}__box--success`,
      !isActive && hasCustomUnchecked && `${base}__box--has-unchecked`,
      hasError && isActive && `${base}__box--error-active`,
      hasError && !isActive && `${base}__box--error`,
      disabled && `${base}__box--disabled`,
    ]
      .filter(Boolean)
      .join(" ");

    const wrapperClasses = [
      base,
      `${base}--${labelPosition}`,
      disabled && `${base}--disabled`,
      readOnly && `${base}--readonly`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const labelEl = label ? (
      <span className={`${base}__label ${base}__label--${size}`}>
        {label}
        {required && (
          <span className={`${base}__required`} aria-hidden="true">
            *
          </span>
        )}
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
            aria-checked={indeterminate ? "mixed" : undefined}
          />
          <span className={boxClasses}>{renderBoxContent()}</span>
          {labelEl}
        </label>
        {hasError && errorMessage && (
          <span className={`${base}__error`} id={errorId} role="alert">
            {errorMessage}
          </span>
        )}
        {helperText && (
          <span
            className={[
              `${base}__helper`,
              helperSeverity && `${base}__helper--${helperSeverity}`,
            ]
              .filter(Boolean)
              .join(" ")}
            id={helperId}
          >
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
