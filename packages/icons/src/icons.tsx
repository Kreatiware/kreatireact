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
 * @author designer
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
    aria-hidden="true"
  >
    <path d="M17.12,11.23h0c-.07-.34-.21-.62-.41-.83-1.27-1.36-2.52-2.69-3.71-3.95-1.19-1.26-2.41-2.56-3.62-3.85l-.29-.32-.02-.03c-.17-.16-.37-.24-.6-.24-.27,0-.52.14-.75.4-.21.24-.18.27-.24.4-.21.43-.13.29-.24.6-.16.39-.16.35-.21.56-.05.32-.02.6.11.85.09.17.22.34.38.52,1.84,1.83,6.17,6.02,6.45,6.47-.11.27-2.42,2.8-3.01,3.39-.23.23-.44.44-.62.63-.93.97-1.96,1.7-2.88,2.65-.16.18-.29.34-.37.51-.13.24-.16.53-.11.86.04.2.13.48.29.86.14.36,0,.08.17.43.09.14.05.14.26.39.24.29.49.42.78.42.24,0,.46-.11.62-.3l.26-.3c1.13-1.21,2.3-2.45,3.63-3.86,1.2-1.27,2.45-2.6,3.72-3.96.16-.18.27-.41.35-.7.07-.24.1-.51.11-.79,0-.29-.02-.57-.08-.84Z"/>
  </svg>
);

/**
 * Chevron Left icon
 *
 * @author designer
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
    aria-hidden="true"
  >
    <path d="M7.04,12.77h0c.07.34.21.62.41.83,1.27,1.36,2.52,2.69,3.71,3.95,1.19,1.26,2.41,2.56,3.62,3.85l.29.32.02.03c.17.16.37.24.6.24.27,0,.52-.14.75-.4.21-.24.18-.27.24-.4.21-.43.13-.29.24-.6.16-.39.16-.35.21-.56.05-.32.02-.6-.11-.85-.09-.17-.22-.34-.38-.52-1.84-1.83-6.17-6.02-6.45-6.47.11-.27,2.42-2.8,3.01-3.39.23-.23.44-.44.62-.63.93-.97,1.96-1.7,2.88-2.65.16-.18.29-.34.37-.51.13-.24.16-.53.11-.86-.04-.2-.13-.48-.29-.86-.14-.36,0-.08-.17-.43-.09-.14-.05-.14-.26-.39-.24-.29-.49-.42-.78-.42-.24,0-.46.11-.62.3l-.26.3c-1.13,1.21-2.3,2.45-3.63,3.86-1.2,1.27-2.45,2.6-3.72,3.96-.16.18-.27.41-.35.7-.07.24-.1.51-.11.79,0,.29.02.57.08.84Z"/>
  </svg>
);

/**
 * Chevron Up icon
 *
 * @author designer
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
    aria-hidden="true"
  >
    <path d="M11.31,6.96h0c-.34.07-.62.21-.83.41-1.36,1.27-2.69,2.52-3.95,3.71-1.26,1.19-2.56,2.41-3.85,3.62l-.32.29-.03.02c-.16.17-.24.37-.24.6,0,.27.14.52.4.75.24.21.27.18.4.24.43.21.29.13.6.24.39.16.35.16.56.21.32.05.6.02.85-.11.17-.09.34-.22.52-.38,1.83-1.84,6.02-6.17,6.47-6.45.27.11,2.8,2.42,3.39,3.01.23.23.44.44.63.62.97.93,1.7,1.96,2.65,2.88.18.16.34.29.51.37.24.13.53.16.86.11.2-.04.48-.13.86-.29.36-.14.08,0,.43-.17.14-.09.14-.05.39-.26.29-.24.42-.49.42-.78,0-.24-.11-.46-.3-.62l-.3-.26c-1.21-1.13-2.45-2.3-3.86-3.63-1.27-1.2-2.6-2.45-3.96-3.72-.18-.16-.41-.27-.7-.35-.24-.07-.51-.1-.79-.11-.29,0-.57.02-.84.08Z"/>
  </svg>
);

/**
 * Chevron Down icon
 *
 * @author designer
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
    aria-hidden="true"
  >
    <path d="M12.84,17.04h0c.34-.07.62-.21.83-.41,1.36-1.27,2.69-2.52,3.95-3.71,1.26-1.19,2.56-2.41,3.85-3.62l.32-.29.03-.02c.16-.17.24-.37.24-.6,0-.27-.14-.52-.4-.75-.24-.21-.27-.18-.4-.24-.43-.21-.29-.13-.6-.24-.39-.16-.35-.16-.56-.21-.32-.05-.6-.02-.85.11-.17.09-.34.22-.52.38-1.83,1.84-6.02,6.17-6.47,6.45-.27-.11-2.8-2.42-3.39-3.01-.23-.23-.44-.44-.63-.62-.97-.93-1.7-1.96-2.65-2.88-.18-.16-.34-.29-.51-.37-.24-.13-.53-.16-.86-.11-.2.04-.48.13-.86.29-.36.14-.08,0-.43.17-.14.09-.14.05-.39.26-.29.24-.42.49-.42.78,0,.24.11.46.3.62l.3.26c1.21,1.13,2.45,2.3,3.86,3.63,1.27,1.2,2.6,2.45,3.96,3.72.18.16.41.27.7.35.24.07.51.1.79.11.29,0,.57-.02.84-.08Z"/>
  </svg>
);

// ============================================
// ARROW ICONS
// ============================================

/**
 * Arrow Right icon
 *
 * @description Horizontal bar connected to a ChevronRight-style arrowhead.
 * Uses the designer's chevron path shifted right, with a bar that
 * overlaps into the chevron center for seamless connection.
 *
 * @author ai — Pending designer review
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
    fill={color}
    className={className}
    aria-hidden="true"
  >
    <rect x="2" y="10.63" width="16" height="2.74" rx=".57" ry=".57" />
    <path d="M21.12,11.23h0c-.07-.34-.21-.62-.41-.83-1.27-1.36-2.52-2.69-3.71-3.95-1.19-1.26-2.41-2.56-3.62-3.85l-.29-.32-.02-.03c-.17-.16-.37-.24-.6-.24-.27,0-.52.14-.75.4-.21.24-.18.27-.24.4-.21.43-.13.29-.24.6-.16.39-.16.35-.21.56-.05.32-.02.6.11.85.09.17.22.34.38.52,1.84,1.83,6.17,6.02,6.45,6.47-.11.27-2.42,2.8-3.01,3.39-.23.23-.44.44-.62.63-.93.97-1.96,1.7-2.88,2.65-.16.18-.29.34-.37.51-.13.24-.16.53-.11.86.04.2.13.48.29.86.14.36,0,.08.17.43.09.14.05.14.26.39.24.29.49.42.78.42.24,0,.46-.11.62-.3l.26-.3c1.13-1.21,2.3-2.45,3.63-3.86,1.2-1.27,2.45-2.6,3.72-3.96.16-.18.27-.41.35-.7.07-.24.1-.51.11-.79,0-.29-.02-.57-.08-.84Z"/>
  </svg>
);

// ============================================
// UI ICONS
// ============================================

/**
 * Check icon
 *
 * @description Checkmark (✓) as a single fill path with widened lines
 * and rounded ends matching the designer's icon style.
 * Short arm descending left to vertex, long arm ascending right.
 *
 * @author ai — Pending designer review
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
    fill={color}
    className={className}
    aria-hidden="true"
  >
    <path d="M9.86,18.21c-.28,0-.54-.12-.74-.33l-5.56-5.78c-.19-.2-.29-.47-.28-.75.01-.28.13-.54.33-.74.41-.39,1.07-.38,1.48.03l4.73,4.92L19.78,5.79c.38-.42,1.04-.46,1.47-.08.42.38.46,1.04.08,1.47L10.63,17.85c-.19.21-.46.34-.74.36h-.03Z"/>
  </svg>
);

/**
 * Hamburger menu icon (three horizontal lines)
 *
 * @author designer
 */
export const Hamburger: React.FC<IconProps> = ({
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
    aria-hidden="true"
  >
    <rect x="2.28" y="5.32" width="19.43" height="2.74" rx=".57" ry=".57"/>
    <rect x="2.25" y="10.63" width="19.43" height="2.74" rx=".57" ry=".57"/>
    <rect x="2.28" y="15.94" width="19.43" height="2.74" rx=".57" ry=".57"/>
  </svg>
);

/** @deprecated Use Hamburger instead */
export const Menu = Hamburger;

/**
 * Times (close / X) icon
 *
 * @author designer
 */
export const Times: React.FC<IconProps> = ({
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
    aria-hidden="true"
  >
    <path d="M12,13.55c1.27,1.36,2.52,2.69,3.72,3.96,1.33,1.41,2.5,2.65,3.63,3.86l.26.3c.16.19.38.3.62.3.29,0,.54-.13.78-.42.21-.25.17-.25.26-.39.17-.35.03-.07.17-.43.16-.38.25-.66.29-.86.05-.33.02-.62-.11-.86-.08-.17-.21-.33-.37-.51-.92-.95-1.95-1.68-2.88-2.65-.18-.19-.39-.4-.62-.63-.59-.59-2.9-3.12-3.01-3.39.28-.45,4.61-4.64,6.45-6.47.16-.18.29-.35.38-.52.13-.25.16-.53.11-.85-.05-.21-.05-.17-.21-.56-.11-.31-.03-.17-.24-.6-.06-.13-.03-.16-.24-.4-.23-.26-.48-.4-.75-.4-.23,0-.43.08-.6.24l-.02.03-.29.32c-1.21,1.29-2.43,2.59-3.62,3.85-1.19,1.26-2.44,2.59-3.71,3.95-1.27-1.36-2.52-2.69-3.71-3.95-1.19-1.26-2.41-2.56-3.62-3.85l-.29-.32-.02-.03c-.17-.16-.37-.24-.6-.24-.27,0-.52.14-.75.4-.21.24-.18.27-.24.4-.21.43-.13.29-.24.6-.16.39-.16.35-.21.56-.05.32-.02.6.11.85.09.17.22.34.38.52,1.84,1.83,6.17,6.02,6.45,6.47-.11.27-2.42,2.8-3.01,3.39-.23.23-.44.44-.62.63-.93.97-1.96,1.7-2.88,2.65-.16.18-.29.34-.37.51-.13.24-.16.53-.11.86.04.2.13.48.29.86.14.36,0,.08.17.43.09.14.05.14.26.39.24.29.49.42.78.42.24,0,.46-.11.62-.3l.26-.3c1.13-1.21,2.3-2.45,3.63-3.86,1.2-1.27,2.45-2.6,3.72-3.96Z"/>
  </svg>
);