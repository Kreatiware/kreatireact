import React from "react";
import "./FieldWrapper.css";

export interface FieldWrapperProps {
  /** Label text displayed above the content */
  label?: string;
  /** Associates the label with a form element by id */
  htmlFor?: string;
  /** Shows a required indicator (*) next to the label */
  required?: boolean;
  /** Helper text displayed below the content (always visible if provided) */
  helperText?: React.ReactNode;
  /** Error message displayed between content and helper text */
  error?: React.ReactNode;
  /** Applies success color to helper text */
  success?: boolean;
  /** Severity color for the helper text (overrides default gray) */
  helperSeverity?:
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "help"
    | "danger"
    | "accent";
  /** Size controls font sizes of label and helper */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Reduces opacity and disables interaction */
  disabled?: boolean;
  /** Full width mode */
  fullWidth?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Content (Input, Textarea, Select, etc.) */
  children: React.ReactNode;
}

/**
 * FieldWrapper provides label, helper text, and error messaging around form elements.
 *
 * @description A reusable wrapper that adds a label above and error/helper text
 * below any form element. Error and helper coexist — error shows directly below
 * the content, helper below the error. Colors adapt to the current state.
 * Supports helperSeverity to color the helper text with any severity.
 *
 * @example
 * ```tsx
 * <FieldWrapper label="Email" required error="Invalid email" helperText="We'll never share it">
 *   <Input size="md" type="email" />
 * </FieldWrapper>
 *
 * <FieldWrapper label="Note" helperText="Optional field" helperSeverity="info">
 *   <Input size="md" />
 * </FieldWrapper>
 * ```
 */
export const FieldWrapper = ({
  label,
  htmlFor,
  required = false,
  helperText,
  error,
  success = false,
  helperSeverity,
  size = "md",
  disabled = false,
  fullWidth = false,
  className = "",
  style,
  children,
  ref,
}: FieldWrapperProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const base = "k-field";
  const hasError = !!error;

  const classes = [
    base,
    `${base}--${size}`,
    hasError && `${base}--error`,
    !hasError && success && `${base}--success`,
    disabled && `${base}--disabled`,
    fullWidth && `${base}--full-width`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const helperClasses = [
    `${base}__helper`,
    !hasError && helperSeverity && `${base}__helper--${helperSeverity}`,
  ]
    .filter(Boolean)
    .join(" ");

  const errorId = htmlFor ? `${htmlFor}-error` : undefined;
  const helperId = htmlFor ? `${htmlFor}-helper` : undefined;

  return (
    <div ref={ref} className={classes} style={style}>
      {label && (
        <label className={`${base}__label`} htmlFor={htmlFor}>
          {label}
          {required && (
            <span className={`${base}__required`} aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <div className={`${base}__content`}>{children}</div>
      {hasError && (
        <span className={`${base}__error`} id={errorId} role="alert">
          {error}
        </span>
      )}
      {helperText && (
        <span className={helperClasses} id={helperId}>
          {helperText}
        </span>
      )}
    </div>
  );
};
