import React, { forwardRef, useId, useState, useCallback } from 'react';
import { Checkbox } from './Checkbox';
import { FieldWrapper } from './FieldWrapper';
import { useKreatiLocale } from '../locale';
import './CheckboxGroup.css';

export interface CheckboxGroupOption {
  /** Unique value */
  value: string | number;
  /** Display label */
  label: React.ReactNode;
  /** Disabled state for this option */
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  /** Array of options for dynamic checkbox creation */
  options: CheckboxGroupOption[];
  /** Selected values (controlled) */
  value?: Array<string | number>;
  /** Default selected values (uncontrolled) */
  defaultValue?: Array<string | number>;
  /** Fires when selection changes with the new array of selected values */
  onChange?: (values: Array<string | number>) => void;
  /** Exclusive mode — only one option can be selected at a time */
  exclusive?: boolean;
  /** Show a "Select all" checkbox above the options */
  selectAll?: boolean;
  /** Custom label for the select all checkbox (default from locale) */
  selectAllLabel?: React.ReactNode;
  /** Layout direction */
  orientation?: 'horizontal' | 'vertical';
  /** Component size — passed to each Checkbox */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Group label */
  label?: string;
  /** Helper text below the group */
  helperText?: React.ReactNode;
  /** Error message or boolean */
  error?: React.ReactNode | boolean;
  /** Severity color for the helper text */
  helperSeverity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'help' | 'danger' | 'accent';
  /** Success state */
  success?: boolean;
  /** Disabled state for all checkboxes */
  disabled?: boolean;
  /** Required indicator on the group label */
  required?: boolean;
  /** Full width mode */
  fullWidth?: boolean;
  /** HTML name attribute — shared by all checkboxes in the group */
  name?: string;
  /** Blur handler — fires when focus leaves the group */
  onBlur?: () => void;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * CheckboxGroup component for managing multiple related checkboxes.
 *
 * @description Renders a group of Checkbox components from an options array.
 * Supports multiple selection (default) or exclusive selection (one at a time).
 * Uses FieldWrapper for label, error, and helper text. Compatible with Formik
 * via name, value, onChange, and onBlur.
 *
 * @example
 * ```tsx
 * // Multiple selection
 * <CheckboxGroup
 *   label="Interests"
 *   options={[
 *     { value: 'music', label: 'Music' },
 *     { value: 'sports', label: 'Sports' },
 *     { value: 'reading', label: 'Reading' },
 *   ]}
 *   onChange={(values) => console.log(values)}
 * />
 *
 * // Exclusive selection (radio-like behavior)
 * <CheckboxGroup
 *   label="Priority"
 *   exclusive
 *   options={[
 *     { value: 'low', label: 'Low' },
 *     { value: 'medium', label: 'Medium' },
 *     { value: 'high', label: 'High' },
 *   ]}
 * />
 * ```
 */
export const CheckboxGroup = forwardRef<HTMLDivElement, CheckboxGroupProps>(
  (
    {
      options,
      value: controlledValue,
      defaultValue,
      onChange,
      exclusive = false,
      selectAll = false,
      selectAllLabel,
      orientation = 'vertical',
      size = 'md',
      label,
      helperText,
      error,
      helperSeverity,
      success = false,
      disabled = false,
      required = false,
      fullWidth = false,
      name,
      onBlur,
      className = '',
      style,
    },
    ref,
  ) => {
    const autoId = useId();
    const groupId = name || autoId;
    const locale = useKreatiLocale();
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState<Array<string | number>>(defaultValue ?? []);
    const selected = isControlled ? controlledValue : internalValue;

    const hasError = !!error;
    const errorMessage = typeof error === 'boolean' ? undefined : error;
    const base = 'k-checkbox-group';

    const handleChange = useCallback((optionValue: string | number, checked: boolean) => {
      let next: Array<string | number>;

      if (exclusive) {
        next = checked ? [optionValue] : [];
      } else {
        next = checked
          ? [...selected, optionValue]
          : selected.filter((v) => v !== optionValue);
      }

      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    }, [selected, exclusive, isControlled, onChange]);

    const groupClasses = [
      `${base}__options`,
      `${base}__options--${orientation}`,
    ].filter(Boolean).join(' ');

    const enabledOptions = options.filter((opt) => !opt.disabled && !disabled);
    const allSelected = enabledOptions.length > 0 && enabledOptions.every((opt) => selected.includes(opt.value));
    const someSelected = !allSelected && enabledOptions.some((opt) => selected.includes(opt.value));

    const handleSelectAll = useCallback(() => {
      const next = allSelected
        ? selected.filter((v) => !enabledOptions.some((opt) => opt.value === v))
        : [...new Set([...selected, ...enabledOptions.map((opt) => opt.value)])];
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    }, [allSelected, selected, enabledOptions, isControlled, onChange]);

    const content = (
      <div
        className={groupClasses}
        role="group"
        aria-labelledby={label ? `${groupId}-label` : undefined}
        aria-required={required || undefined}
        aria-invalid={hasError || undefined}
      >
        {selectAll && !exclusive ? (
          <>
            <Checkbox
              label={selectAllLabel ?? locale.common.selectAll}
              size={size}
              checked={allSelected}
              indeterminate={someSelected}
              disabled={disabled}
              onChange={handleSelectAll}
            />
            <div className={`${base}__select-all-children`}>
              {options.map((opt) => (
                <Checkbox
                  key={opt.value}
                  value={opt.value}
                  label={opt.label}
                  name={name}
                  size={size}
                  checked={selected.includes(opt.value)}
                  disabled={disabled || opt.disabled}
                  onChange={(e) => handleChange(opt.value, e.target.checked)}
                  onBlur={onBlur}
                />
              ))}
            </div>
          </>
        ) : (
          options.map((opt) => (
            <Checkbox
              key={opt.value}
              value={opt.value}
              label={opt.label}
              name={name}
              size={size}
              checked={selected.includes(opt.value)}
              disabled={disabled || opt.disabled}
              onChange={(e) => handleChange(opt.value, e.target.checked)}
              onBlur={onBlur}
            />
          ))
        )}
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
      <div ref={ref} className={`${base} ${fullWidth ? `${base}--full-width` : ''} ${className}`.trim()} style={style}>
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
  },
);

CheckboxGroup.displayName = 'CheckboxGroup';
