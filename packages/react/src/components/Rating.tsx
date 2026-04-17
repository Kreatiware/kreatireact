import React, { forwardRef, useState, useCallback, useRef, useImperativeHandle, useId } from 'react';
import { STAR_PATH, TIMES_CIRCLE_PATH } from './iconPaths';
import { FieldWrapper } from './FieldWrapper';
import { useKreatiLocale } from '../locale';
import './Rating.css';

export interface RatingProps {
  /** Current value (controlled) */
  value?: number;
  /** Default value (uncontrolled) */
  defaultValue?: number;
  /** Fires when value changes */
  onChange?: (value: number) => void;
  /** Number of icons (default: 5) */
  count?: number;
  /** Allow half-value selection */
  allowHalf?: boolean;
  /** Allow clearing by clicking the current value again */
  allowClear?: boolean;
  /** Show a cancel/clear icon before the stars */
  showCancel?: boolean;
  /** Component size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Active color — overrides the CSS variable */
  color?: string;
  /** Custom icon ReactNode — rendered for every star position */
  icon?: React.ReactNode;
  /** Custom cancel icon */
  cancelIcon?: React.ReactNode;
  /** Read-only display */
  readOnly?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Required indicator */
  required?: boolean;
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: React.ReactNode;
  /** Error state */
  error?: React.ReactNode | boolean;
  /** Success state */
  success?: boolean;
  /** Helper text severity color */
  helperSeverity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'help' | 'danger' | 'accent';
  /** HTML name for hidden input (form compatibility) */
  name?: string;
  /** Blur handler */
  onBlur?: (e: React.FocusEvent) => void;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

const base = 'k-rating';

const StarSvg = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d={STAR_PATH} />
  </svg>
);

const CancelSvg = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d={TIMES_CIRCLE_PATH} />
  </svg>
);

/**
 * Rating component for star-based or custom icon scoring.
 *
 * @description An interactive rating input with configurable icon count,
 * half-value support via clip-path, custom icons, keyboard navigation,
 * and FieldWrapper integration. Compatible with Formik and React Hook
 * Form via name, value, onChange, onBlur, ref.
 *
 * @example
 * ```tsx
 * <Rating label="Score" defaultValue={3} />
 * <Rating value={rating} onChange={setRating} count={10} allowHalf />
 * <Rating readOnly value={4.5} allowHalf size="lg" />
 * ```
 */
export const Rating = forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      value: controlledValue,
      defaultValue = 0,
      onChange,
      count = 5,
      allowHalf = false,
      allowClear = true,
      showCancel = false,
      size = 'md',
      color,
      icon,
      cancelIcon,
      readOnly = false,
      disabled = false,
      required,
      label,
      helperText,
      error,
      success,
      helperSeverity,
      name,
      onBlur,
      className = '',
      style,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);
    const locale = useKreatiLocale();
    const uid = useId();
    const raterId = `${uid}-rater`;

    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [hoverValue, setHoverValue] = useState<number | null>(null);

    const currentValue = isControlled ? controlledValue : internalValue;
    const displayValue = hoverValue ?? currentValue;

    const setValue = useCallback(
      (val: number) => {
        const next = allowClear && val === currentValue ? 0 : val;
        if (!isControlled) setInternalValue(next);
        onChange?.(next);
      },
      [allowClear, currentValue, isControlled, onChange],
    );

    const handleClick = useCallback(
      (val: number) => {
        if (readOnly || disabled) return;
        setValue(val);
      },
      [readOnly, disabled, setValue],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (readOnly || disabled) return;
        const step = allowHalf ? 0.5 : 1;
        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowUp':
            e.preventDefault();
            setValue(Math.min(currentValue + step, count));
            break;
          case 'ArrowLeft':
          case 'ArrowDown':
            e.preventDefault();
            setValue(Math.max(currentValue - step, 0));
            break;
          case 'Home':
            e.preventDefault();
            setValue(0);
            break;
          case 'End':
            e.preventDefault();
            setValue(count);
            break;
        }
      },
      [readOnly, disabled, allowHalf, currentValue, count, setValue],
    );

    const iconEl = icon || <StarSvg />;

    const renderStar = (index: number) => {
      const starNum = index + 1;
      const isFull = displayValue >= starNum;
      const isHalf = !isFull && allowHalf && displayValue >= starNum - 0.5;

      if (isHalf) {
        return (
          <span className={`${base}__icon ${base}__icon--half`}>
            <span className={`${base}__icon-bg`}>{iconEl}</span>
            <span className={`${base}__icon-fg`}>{iconEl}</span>
          </span>
        );
      }

      return (
        <span className={`${base}__icon ${isFull ? `${base}__icon--on` : `${base}__icon--off`}`}>
          {iconEl}
        </span>
      );
    };

    const items = Array.from({ length: count }, (_, i) => {
      const starNum = i + 1;
      return (
        <span
          key={i}
          className={`${base}__item`}
          onMouseEnter={() => !readOnly && !disabled && setHoverValue(starNum)}
          onMouseLeave={() => setHoverValue(null)}
          onClick={() => handleClick(starNum)}
        >
          {renderStar(i)}
          {allowHalf && !readOnly && !disabled && (
            <>
              <span
                className={`${base}__half-left`}
                onMouseEnter={(e) => { e.stopPropagation(); setHoverValue(starNum - 0.5); }}
                onClick={(e) => { e.stopPropagation(); handleClick(starNum - 0.5); }}
              />
              <span
                className={`${base}__half-right`}
                onMouseEnter={(e) => { e.stopPropagation(); setHoverValue(starNum); }}
                onClick={(e) => { e.stopPropagation(); handleClick(starNum); }}
              />
            </>
          )}
        </span>
      );
    });

    const hasError = !!error;
    const errorMessage = typeof error === 'boolean' ? undefined : error;

    const cls = [
      base,
      `${base}--${size}`,
      readOnly && `${base}--readonly`,
      disabled && `${base}--disabled`,
    ].filter(Boolean).join(' ');

    const cssVars = color ? { '--kreati-rating-color': color } as React.CSSProperties : undefined;

    const rater = (
      <div
        ref={containerRef}
        id={raterId}
        className={cls}
        style={cssVars}
        role="slider"
        aria-valuenow={currentValue}
        aria-valuemin={0}
        aria-valuemax={count}
        aria-label={label ?? locale.rating.ariaLabel}
        aria-disabled={disabled || undefined}
        aria-required={required || undefined}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
      >
        {showCancel && !readOnly && !disabled && (
          <span
            className={`${base}__cancel`}
            role="button"
            tabIndex={0}
            aria-label={locale.rating.clear}
            onClick={() => setValue(0)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setValue(0); } }}
          >
            {cancelIcon || <CancelSvg />}
          </span>
        )}
        {items}
        {name && <input type="hidden" name={name} value={currentValue} />}
      </div>
    );

    const hasWrapper = !!(label || helperText || errorMessage || required);

    if (!hasWrapper) {
      return <div className={className} style={style}>{rater}</div>;
    }

    return (
      <div className={className} style={style}>
        <FieldWrapper
          label={label}
          htmlFor={raterId}
          required={required}
          helperText={helperText}
          error={errorMessage}
          success={success}
          helperSeverity={helperSeverity}
          size={size}
          disabled={disabled}
        >
          {rater}
        </FieldWrapper>
      </div>
    );
  },
);

Rating.displayName = 'Rating';
