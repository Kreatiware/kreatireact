import React, { useId, useState, useCallback } from "react";
import { Radio } from "./Radio";
import { FieldWrapper } from "./FieldWrapper";

export interface RadioGroupOption {
  /** Unique value */
  value: string | number;
  /** Display label */
  label: React.ReactNode;
  /** Disabled state for this option */
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** Array of options for dynamic radio creation */
  options: RadioGroupOption[];
  /** Selected value (controlled) */
  value?: string | number | null;
  /** Default selected value (uncontrolled) */
  defaultValue?: string | number | null;
  /** Fires when selection changes */
  onChange?: (value: string | number) => void;
  /** Layout direction */
  orientation?: "horizontal" | "vertical";
  /** Component size — passed to each Radio */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Group label */
  label?: string;
  /** Helper text below the group */
  helperText?: React.ReactNode;
  /** Error message or boolean */
  error?: React.ReactNode | boolean;
  /** Success state */
  success?: boolean;
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
  /** Disabled state for all radios */
  disabled?: boolean;
  /** Required indicator on the group label */
  required?: boolean;
  /** Full width mode */
  fullWidth?: boolean;
  /** HTML name attribute — shared by all radios in the group */
  name?: string;
  /** Blur handler — fires when focus leaves the group */
  onBlur?: () => void;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * RadioGroup component for single-value selection from a list.
 *
 * @description Renders a group of Radio components from an options array.
 * Only one option can be selected at a time. Uses FieldWrapper for label,
 * error, and helper text. Compatible with Formik via name, value, onChange,
 * and onBlur.
 *
 * @example
 * ```tsx
 * <RadioGroup
 *   label="Priority"
 *   name="priority"
 *   options={[
 *     { value: 'low', label: 'Low' },
 *     { value: 'medium', label: 'Medium' },
 *     { value: 'high', label: 'High' },
 *   ]}
 *   onChange={(value) => console.log(value)}
 * />
 * ```
 */
export const RadioGroup = ({
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  orientation = "vertical",
  size = "md",
  label,
  helperText,
  error,
  success = false,
  helperSeverity,
  disabled = false,
  required = false,
  fullWidth = false,
  name,
  onBlur,
  className = "",
  style,
  ref,
}: RadioGroupProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const autoId = useId();
  const groupId = name || autoId;
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<string | number | null>(
    defaultValue ?? null
  );
  const selected = isControlled ? controlledValue : internalValue;

  const hasError = !!error;
  const errorMessage = typeof error === "boolean" ? undefined : error;
  const base = "k-radio-group";

  const handleChange = useCallback(
    (optionValue: string | number) => {
      if (!isControlled) setInternalValue(optionValue);
      onChange?.(optionValue);
    },
    [isControlled, onChange]
  );

  const groupClasses = [`${base}__options`, `${base}__options--${orientation}`]
    .filter(Boolean)
    .join(" ");

  const content = (
    <div
      className={groupClasses}
      role="radiogroup"
      aria-labelledby={label ? `${groupId}-label` : undefined}
      aria-required={required || undefined}
      aria-invalid={hasError || undefined}
    >
      {options.map(opt => (
        <Radio
          key={opt.value}
          value={opt.value}
          label={opt.label}
          name={name || groupId}
          size={size}
          checked={selected === opt.value}
          disabled={disabled || opt.disabled}
          onChange={() => handleChange(opt.value)}
          onBlur={onBlur}
        />
      ))}
    </div>
  );

  const hasWrapper = !!(label || helperText || errorMessage);

  if (!hasWrapper) {
    return (
      <div ref={ref} className={`${base} ${className}`.trim()} style={style}>
        {content}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`${base} ${fullWidth ? `${base}--full-width` : ""} ${className}`.trim()}
      style={style}
    >
      <FieldWrapper
        label={label}
        htmlFor={groupId}
        required={required}
        helperText={helperText}
        error={errorMessage}
        success={success}
        helperSeverity={helperSeverity}
        size={size}
        disabled={disabled}
        fullWidth={fullWidth}
      >
        {content}
      </FieldWrapper>
    </div>
  );
};
