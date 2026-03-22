import React from 'react';
import './Button.css';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ButtonType = 'filled' | 'outlined' | 'text';
export type ButtonSeverity = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'help' | 'danger';
export type ButtonBadgePosition = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';

export interface ButtonProps {
  /** Button label text */
  label?: string;
  /** Left icon (JSX element) */
  iconLeft?: React.ReactNode;
  /** Right icon (JSX element) */
  iconRight?: React.ReactNode;
  /** Button size */
  size?: ButtonSize;
  /** Button type style */
  buttonType?: ButtonType;
  /** Color severity */
  severity?: ButtonSeverity;
  /** Disabled state (keeps color, applies 40% opacity) */
  disabled?: boolean;
  /** Raised shadow effect */
  raised?: boolean;
  /** Extra rounded borders (pill shape / circle for icon-only) */
  rounded?: boolean;
  /** Slim mode — reduces vertical padding for a thinner button */
  slim?: boolean;
  /** Badge content */
  badge?: React.ReactNode;
  /** Badge position using cardinal directions */
  badgePosition?: ButtonBadgePosition;
  /** Click handler */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** HTML button type attribute */
  type?: 'button' | 'submit' | 'reset';
  /** Custom width (e.g. '100%', '200px', 'auto') */
  width?: string;
  /** Additional CSS class names */
  className?: string;
  /** Render custom content directly inside the button (template slot) */
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  iconLeft,
  iconRight,
  size = 'md',
  buttonType = 'filled',
  severity = 'primary',
  disabled = false,
  raised = false,
  rounded = false,
  slim = false,
  badge,
  badgePosition = 'ne',
  onClick,
  type = 'button',
  width,
  className = '',
  children,
}) => {
  const isIconOnly = !label && !children && (iconLeft || iconRight);
  const base = 'k-button';

  const classes = [
    base,
    `${base}--${size}`,
    `${base}--${buttonType}`,
    `${base}--${severity}`,
    isIconOnly && `${base}--icon-only`,
    raised && `${base}--raised`,
    rounded && `${base}--rounded`,
    slim && `${base}--slim`,
    disabled && `${base}--disabled`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classes}
      disabled={disabled}
      onClick={onClick}
      type={type}
      style={width ? { width } : undefined}
    >
      {children ? (
        children
      ) : (
        <>
          {iconLeft && <span className={`${base}__icon ${base}__icon--left`}>{iconLeft}</span>}
          {label && <span className={`${base}__label`}>{label}</span>}
          {iconRight && <span className={`${base}__icon ${base}__icon--right`}>{iconRight}</span>}
        </>
      )}
      {badge != null && (
        <span className={`${base}__badge ${base}__badge--${badgePosition}`}>
          {badge}
        </span>
      )}
    </button>
  );
};
