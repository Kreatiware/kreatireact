import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { FieldWrapper } from './FieldWrapper';
import './InputGroup.css';

export interface InputGroupProps {
  /** Content before the input (text, icon, or button) */
  prefix?: React.ReactNode;
  /** Content after the input (text, icon, or button) */
  suffix?: React.ReactNode;
  /** Label text — rendered by FieldWrapper above the group */
  label?: string;
  /** Helper text — rendered below the entire group */
  helperText?: React.ReactNode;
  /** Error state — syncs addon border and shows error below group */
  error?: React.ReactNode | boolean;
  /** Success state — syncs addon border color */
  success?: boolean;
  /** Helper text severity */
  helperSeverity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'help' | 'danger';
  /** Component size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Required indicator */
  required?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Input element (Input, Select, AutoComplete, etc.) */
  children: React.ReactNode;
}

const base = 'k-input-group';

/**
 * InputGroup component for combining inputs with addons.
 *
 * @description Wraps an Input with prefix/suffix addons (text, icons,
 * or buttons). Fuses borders so the group appears as a single unit.
 * Handles label, helper text, and error at the group level via
 * FieldWrapper. The child Input should NOT have its own label/helper/error
 * when used inside InputGroup. Addon borders sync with focus, error,
 * and success states.
 *
 * @example
 * ```tsx
 * <InputGroup prefix="https://" suffix=".com" label="Website" error="Required">
 *   <Input fullWidth placeholder="domain" />
 * </InputGroup>
 * ```
 */
export const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(
  ({ prefix, suffix, label, helperText, error, success, helperSeverity, size, required, disabled, fullWidth, className = '', style, children }, ref) => {
    const elRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => elRef.current as HTMLDivElement);

    const hasError = !!error;
    const errorMessage = typeof error === 'boolean' ? undefined : error;

    const isButtonAddon = (node: React.ReactNode): boolean => {
      if (!React.isValidElement(node)) return false;
      const type = node.type as { displayName?: string };
      return type?.displayName === 'Button';
    };

    const groupCls = [
      `${base}__row`,
      hasError && `${base}__row--error`,
      !hasError && success && `${base}__row--success`,
      disabled && `${base}__row--disabled`,
    ].filter(Boolean).join(' ');

    const row = (
      <div className={groupCls} role="group" aria-label={label}>
        {prefix && (
          <span className={`${base}__addon ${base}__addon--prefix${isButtonAddon(prefix) ? ` ${base}__addon--button` : ''}`} aria-hidden={!isButtonAddon(prefix) || undefined}>
            {prefix}
          </span>
        )}
        <div className={`${base}__input${prefix ? ` ${base}__input--has-prefix` : ''}${suffix ? ` ${base}__input--has-suffix` : ''}`}>
          {children}
        </div>
        {suffix && (
          <span className={`${base}__addon ${base}__addon--suffix${isButtonAddon(suffix) ? ` ${base}__addon--button` : ''}`} aria-hidden={!isButtonAddon(suffix) || undefined}>
            {suffix}
          </span>
        )}
      </div>
    );

    const wrapperCls = [base, fullWidth && `${base}--full-width`, size && `${base}--${size}`, className].filter(Boolean).join(' ');
    const hasWrapper = !!(label || helperText || errorMessage || required);

    if (!hasWrapper) {
      return <div ref={elRef} className={wrapperCls} style={style}>{row}</div>;
    }

    return (
      <div ref={elRef} className={wrapperCls} style={style}>
        <FieldWrapper
          label={label}
          required={required}
          helperText={helperText}
          error={errorMessage}
          success={success}
          helperSeverity={helperSeverity}
          size={size}
          disabled={disabled}
          fullWidth={fullWidth}
        >
          {row}
        </FieldWrapper>
      </div>
    );
  },
);

InputGroup.displayName = 'InputGroup';
