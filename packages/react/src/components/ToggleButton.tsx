import React, { forwardRef } from 'react';
import './ToggleButton.css';

export interface ToggleButtonProps {
  /** Whether the button is active/on */
  active?: boolean;
  /** Value associated with this button — used by ToggleButtonGroup */
  value?: string | number;
  /** Button label */
  label?: string;
  /** Left icon */
  iconLeft?: React.ReactNode;
  /** Right icon */
  iconRight?: React.ReactNode;
  /** Button size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Disabled state */
  disabled?: boolean;
  /** Raised shadow effect */
  raised?: boolean;
  /** Click handler */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Additional CSS class names */
  className?: string;
}

/**
 * ToggleButton component for on/off state toggling.
 *
 * @description A button that toggles between active and inactive states.
 * Supports icons, 5 sizes aligned with Button, and can be grouped with
 * ToggleButtonGroup for single or multiple selection with connected borders.
 *
 * @example
 * ```tsx
 * <ToggleButton label="Bold" active={isBold} onClick={() => toggle()} />
 * <ToggleButton label="On" iconLeft={<Check size={14} />} active />
 * ```
 */
export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  (
    {
      active = false,
      value,
      label,
      iconLeft,
      iconRight,
      size = 'md',
      disabled = false,
      raised = false,
      onClick,
      className = '',
    },
    ref,
  ) => {
    const base = 'k-toggle-btn';
    const classes = [
      base,
      `${base}--${size}`,
      active && `${base}--active`,
      raised && `${base}--raised`,
      disabled && `${base}--disabled`,
      className,
    ].filter(Boolean).join(' ');

    return (
      <button
        ref={ref}
        type="button"
        className={classes}
        disabled={disabled}
        onClick={onClick}
        aria-pressed={active}
        data-value={value}
      >
        {iconLeft && <span className={`${base}__icon`}>{iconLeft}</span>}
        {label && <span className={`${base}__label`}>{label}</span>}
        {iconRight && <span className={`${base}__icon`}>{iconRight}</span>}
      </button>
    );
  },
);

ToggleButton.displayName = 'ToggleButton';
