import React from 'react';

/**
 * Props for icon components
 */
export interface IconProps {
  /** Size of the icon in pixels or CSS units */
  size?: number | string;
  /** Color of the icon - defaults to currentColor */
  color?: string;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Arrow Right icon component
 * 
 * @description A right-pointing arrow icon, commonly used for navigation,
 * call-to-action buttons, or indicating direction.
 * 
 * @example
 * ```tsx
 * <ArrowRight size={24} color="#0f78a5" />
 * ```
 * 
 * @param props - Icon component props
 * @returns JSX.Element
 */
export const ArrowRight: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '' 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M5 12H19M19 12L12 5M19 12L12 19" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Check icon component
 * 
 * @description A checkmark icon, commonly used to indicate completion,
 * success states, or selected items.
 * 
 * @example
 * ```tsx
 * <Check size={16} color="green" />
 * ```
 * 
 * @param props - Icon component props
 * @returns JSX.Element
 */
export const Check: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '' 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M20 6L9 17L4 12" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);