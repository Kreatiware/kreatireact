import React from 'react';

/**
 * Base props for all icon components
 */
export interface IconProps {
  /** Size of the icon in pixels */
  size?: number;
  /** Color of the icon - defaults to currentColor */
  color?: string;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Wrapper component for icons with common styling and props
 * 
 * @description KreatiIcon is a wrapper component that provides consistent sizing
 * and styling for icons. It can wrap single or multiple icon components and
 * automatically passes the size prop to all children.
 * 
 * @example
 * ```tsx
 * // Single icon with custom size
 * <KreatiIcon size={16}>
 *   <ChevronDown />
 * </KreatiIcon>
 * 
 * // Multiple icons in the same container (for icon groups)
 * <KreatiIcon size={24}>
 *   <ChevronUp />
 *   <ChevronDown />
 * </KreatiIcon>
 * 
 * // With custom className
 * <KreatiIcon size={20} className="my-icon">
 *   <Check />
 * </KreatiIcon>
 * ```
 * 
 * @param props - KreatiIcon component props
 * @returns JSX.Element
 */
export interface KreatiIconProps {
  /** Size of the icon in pixels (default: 24) */
  size?: number;
  /** Additional CSS class names */
  className?: string;
  /** Icon component(s) to render */
  children: React.ReactNode;
}

export const KreatiIcon: React.FC<KreatiIconProps> = ({
  size = 24,
  className = '',
  children,
}) => (
  <span
    className={`kreati-icon ${className}`}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size,
      height: size,
    }}
  >
    {React.Children.map(children, (child) =>
      React.isValidElement(child)
        ? React.cloneElement(child as React.ReactElement<IconProps>, { size })
        : child
    )}
  </span>
);

// ============================================
// CHEVRON ICONS
// ============================================

/**
 * Chevron Right icon
 * 
 * @example
 * ```tsx
 * <ChevronRight size={24} color="#0f78a5" />
 * // Or with KreatiIcon wrapper
 * <KreatiIcon size={24}>
 *   <ChevronRight color="red" />
 * </KreatiIcon>
 * ```
 */
export const ChevronRight: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    className={className}
  >
    <path d="M17.12,11.23h0c-.07-.34-.21-.62-.41-.83-1.27-1.36-2.52-2.69-3.71-3.95-1.19-1.26-2.41-2.56-3.62-3.85l-.29-.32-.02-.03c-.17-.16-.37-.24-.6-.24-.27,0-.52.14-.75.4-.21.24-.18.27-.24.4-.21.43-.13.29-.24.6-.16.39-.16.35-.21.56-.05.32-.02.6.11.85.09.17.22.34.38.52,1.84,1.83,6.17,6.02,6.45,6.47-.11.27-2.42,2.8-3.01,3.39-.23.23-.44.44-.62.63-.93.97-1.96,1.7-2.88,2.65-.16.18-.29.34-.37.51-.13.24-.16.53-.11.86.04.2.13.48.29.86.14.36,0,.08.17.43.09.14.05.14.26.39.24.29.49.42.78.42.24,0,.46-.11.62-.3l.26-.3c1.13-1.21,2.3-2.45,3.63-3.86,1.2-1.27,2.45-2.6,3.72-3.96.16-.18.27-.41.35-.7.07-.24.1-.51.11-.79,0-.29-.02-.57-.08-.84Z"/>
  </svg>
);

/**
 * Chevron Left icon
 * 
 * @example
 * ```tsx
 * <ChevronLeft size={24} color="#0f78a5" />
 * ```
 */
export const ChevronLeft: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    className={className}
  >
    <path d="M7.04,12.77h0c.07.34.21.62.41.83,1.27,1.36,2.52,2.69,3.71,3.95,1.19,1.26,2.41,2.56,3.62,3.85l.29.32.02.03c.17.16.37.24.6.24.27,0,.52-.14.75-.4.21-.24.18-.27.24-.4.21-.43.13-.29.24-.6.16-.39.16-.35.21-.56.05-.32.02-.6-.11-.85-.09-.17-.22-.34-.38-.52-1.84-1.83-6.17-6.02-6.45-6.47.11-.27,2.42-2.8,3.01-3.39.23-.23.44-.44.62-.63.93-.97,1.96-1.7,2.88-2.65.16-.18.29-.34.37-.51.13-.24.16-.53.11-.86-.04-.2-.13-.48-.29-.86-.14-.36,0-.08-.17-.43-.09-.14-.05-.14-.26-.39-.24-.29-.49-.42-.78-.42-.24,0-.46.11-.62.3l-.26.3c-1.13,1.21-2.3,2.45-3.63,3.86-1.2,1.27-2.45,2.6-3.72,3.96-.16.18-.27.41-.35.7-.07.24-.1.51-.11.79,0,.29.02.57.08.84Z"/>
  </svg>
);

/**
 * Chevron Up icon
 * 
 * @example
 * ```tsx
 * <ChevronUp size={24} color="#0f78a5" />
 * ```
 */
export const ChevronUp: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    className={className}
  >
    <path d="M11.31,6.96h0c-.34.07-.62.21-.83.41-1.36,1.27-2.69,2.52-3.95,3.71-1.26,1.19-2.56,2.41-3.85,3.62l-.32.29-.03.02c-.16.17-.24.37-.24.6,0,.27.14.52.4.75.24.21.27.18.4.24.43.21.29.13.6.24.39.16.35.16.56.21.32.05.6.02.85-.11.17-.09.34-.22.52-.38,1.83-1.84,6.02-6.17,6.47-6.45.27.11,2.8,2.42,3.39,3.01.23.23.44.44.63.62.97.93,1.7,1.96,2.65,2.88.18.16.34.29.51.37.24.13.53.16.86.11.2-.04.48-.13.86-.29.36-.14.08,0,.43-.17.14-.09.14-.05.39-.26.29-.24.42-.49.42-.78,0-.24-.11-.46-.3-.62l-.3-.26c-1.21-1.13-2.45-2.3-3.86-3.63-1.27-1.2-2.6-2.45-3.96-3.72-.18-.16-.41-.27-.7-.35-.24-.07-.51-.1-.79-.11-.29,0-.57.02-.84.08Z"/>
  </svg>
);

/**
 * Chevron Down icon
 * 
 * @example
 * ```tsx
 * <ChevronDown size={24} color="#0f78a5" />
 * // Or with KreatiIcon wrapper
 * <KreatiIcon size={12}>
 *   <ChevronDown />
 * </KreatiIcon>
 * ```
 */
export const ChevronDown: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    className={className}
  >
    <path d="M12.84,17.04h0c.34-.07.62-.21.83-.41,1.36-1.27,2.69-2.52,3.95-3.71,1.26-1.19,2.56-2.41,3.85-3.62l.32-.29.03-.02c.16-.17.24-.37.24-.6,0-.27-.14-.52-.4-.75-.24-.21-.27-.18-.4-.24-.43-.21-.29-.13-.6-.24-.39-.16-.35-.16-.56-.21-.32-.05-.6-.02-.85.11-.17.09-.34.22-.52.38-1.83,1.84-6.02,6.17-6.47,6.45-.27-.11-2.8-2.42-3.39-3.01-.23-.23-.44-.44-.63-.62-.97-.93-1.7-1.96-2.65-2.88-.18-.16-.34-.29-.51-.37-.24-.13-.53-.16-.86-.11-.2.04-.48.13-.86.29-.36.14-.08,0-.43.17-.14.09-.14.05-.39.26-.29.24-.42.49-.42.78,0,.24.11.46.3.62l.3.26c1.21,1.13,2.45,2.3,3.86,3.63,1.27,1.2,2.6,2.45,3.96,3.72.18.16.41.27.7.35.24.07.51.1.79.11.29,0,.57-.02.84-.08Z"/>
  </svg>
);

// ============================================
// ARROW ICONS
// ============================================

/**
 * Arrow Right icon
 */
export const ArrowRight: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 12H19M19 12L12 5M19 12L12 19" />
  </svg>
);

// ============================================
// UI ICONS
// ============================================

/**
 * Check icon
 */
export const Check: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 6L9 17L4 12" />
  </svg>
);