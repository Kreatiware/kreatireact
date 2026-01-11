import React from 'react';
import './Button.css';

/**
 * Props for the Button component
 */
export interface ButtonProps {
  /** Button content */
  children: React.ReactNode;
  /** Visual style variant of the button */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Size of the button */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Click handler function */
  onClick?: () => void;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Button component with multiple variants and sizes
 * 
 * @description A versatile button component that supports different visual styles,
 * sizes, and states. Built with accessibility in mind and includes hover/focus effects.
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={() => console.log('clicked')}>
 *   Click me
 * </Button>
 * ```
 * 
 * @param props - Button component props
 * @returns JSX.Element
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
}) => {
  const baseClass = 'kreati-button';
  const classes = [
    baseClass,
    `${baseClass}--${variant}`,
    `${baseClass}--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classes}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
};