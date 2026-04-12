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

/**
 * Search (magnifying glass) icon
 *
 * @description Magnifying glass with circular lens and angled handle.
 * Fill-based path with slightly widened lines and rounded ends
 * matching the designer's icon style.
 *
 * @author ai — Pending designer review
 */
export const Search: React.FC<IconProps> = ({
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
    <path d="M10.5,3C6.36,3,3,6.36,3,10.5S6.36,18,10.5,18c1.71,0,3.29-.58,4.56-1.55l4.74,4.74c.2.2.45.3.7.3s.51-.1.7-.3c.39-.39.39-1.02,0-1.41l-4.74-4.74c.97-1.27,1.55-2.85,1.55-4.56C18,6.36,14.64,3,10.5,3ZM10.5,15.5c-2.76,0-5-2.24-5-5s2.24-5,5-5,5,2.24,5,5-2.24,5-5,5Z"/>
  </svg>
);

/**
 * Minus icon (horizontal bar)
 *
 * @description Single horizontal bar used for indeterminate checkbox state
 * and decrement actions. Fill-based with rounded ends matching the
 * designer's icon style.
 *
 * @author ai — Pending designer review
 */
export const Minus: React.FC<IconProps> = ({
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
    <rect x="3" y="10.63" width="18" height="2.74" rx=".57" ry=".57" />
  </svg>
);

/**
 * Calendar icon
 *
 * @description Calendar page with grid dots. Fill-based with rounded
 * corners matching the designer's icon style.
 *
 * @author ai — Pending designer review
 */
export const CalendarIcon: React.FC<IconProps> = ({
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
    <path d="M19,4H18V3a1,1,0,0,0-2,0V4H8V3A1,1,0,0,0,6,3V4H5A3,3,0,0,0,2,7V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V7A3,3,0,0,0,19,4ZM20,19a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V10H20ZM20,8H4V7A1,1,0,0,1,5,6H19a1,1,0,0,1,1,1Z" />
    <rect x="7" y="12" width="2.5" height="2.5" rx=".4" />
    <rect x="10.75" y="12" width="2.5" height="2.5" rx=".4" />
    <rect x="14.5" y="12" width="2.5" height="2.5" rx=".4" />
    <rect x="7" y="16" width="2.5" height="2.5" rx=".4" />
    <rect x="10.75" y="16" width="2.5" height="2.5" rx=".4" />
  </svg>
);

/**
 * Arrow Left icon
 *
 * @description Horizontal bar connected to a ChevronLeft-style arrowhead.
 * Mirror of ArrowRight.
 *
 * @author ai — Pending designer review
 */
export const ArrowLeft: React.FC<IconProps> = ({
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
    <rect x="6" y="10.63" width="16" height="2.74" rx=".57" ry=".57" />
    <path d="M6.88,12.77h0c.07.34.21.62.41.83,1.27,1.36,2.52,2.69,3.71,3.95,1.19,1.26,2.41,2.56,3.62,3.85l.29.32.02.03c.17.16.37.24.6.24.27,0,.52-.14.75-.4.21-.24.18-.27.24-.4.21-.43.13-.29.24-.6.16-.39.16-.35.21-.56.05-.32.02-.6-.11-.85-.09-.17-.22-.34-.38-.52-1.84-1.83-6.17-6.02-6.45-6.47.11-.27,2.42-2.8,3.01-3.39.23-.23.44-.44.62-.63.93-.97,1.96-1.7,2.88-2.65.16-.18.29-.34.37-.51.13-.24.16-.53.11-.86-.04-.2-.13-.48-.29-.86-.14-.36,0-.08-.17-.43-.09-.14-.05-.14-.26-.39-.24-.29-.49-.42-.78-.42-.24,0-.46.11-.62.3l-.26.3c-1.13,1.21-2.3,2.45-3.63,3.86-1.2,1.27-2.45,2.6-3.72,3.96-.16.18-.27.41-.35.7-.07.24-.1.51-.11.79,0,.29.02.57.08.84Z"/>
  </svg>
);

/**
 * Double Arrow Right icon (move all right)
 *
 * @description Two chevron-right arrows side by side. Fill-based with
 * rounded ends matching the designer's icon style.
 *
 * @author ai — Pending designer review
 */
export const DoubleArrowRight: React.FC<IconProps> = ({
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
    <path d="M11.12,11.23c-.07-.34-.21-.62-.41-.83-1.27-1.36-2.52-2.69-3.71-3.95C5.81,5.19,4.59,3.89,3.38,2.6l-.29-.32L3.07,2.25c-.17-.16-.37-.24-.6-.24-.27,0-.52.14-.75.4-.21.24-.18.27-.24.4-.21.43-.13.29-.24.6-.16.39-.16.35-.21.56-.05.32-.02.6.11.85.09.17.22.34.38.52,1.84,1.83,6.17,6.02,6.45,6.47-.11.27-2.42,2.8-3.01,3.39-.23.23-.44.44-.62.63-.93.97-1.96,1.7-2.88,2.65-.16.18-.29.34-.37.51-.13.24-.16.53-.11.86.04.2.13.48.29.86.14.36,0,.08.17.43.09.14.05.14.26.39.24.29.49.42.78.42.24,0,.46-.11.62-.3l.26-.3c1.13-1.21,2.3-2.45,3.63-3.86,1.2-1.27,2.45-2.6,3.72-3.96.16-.18.27-.41.35-.7.07-.24.1-.51.11-.79,0-.29-.02-.57-.08-.84ZM22.12,11.23c-.07-.34-.21-.62-.41-.83-1.27-1.36-2.52-2.69-3.71-3.95-1.19-1.26-2.41-2.56-3.62-3.85l-.29-.32-.02-.03c-.17-.16-.37-.24-.6-.24-.27,0-.52.14-.75.4-.21.24-.18.27-.24.4-.21.43-.13.29-.24.6-.16.39-.16.35-.21.56-.05.32-.02.6.11.85.09.17.22.34.38.52,1.84,1.83,6.17,6.02,6.45,6.47-.11.27-2.42,2.8-3.01,3.39-.23.23-.44.44-.62.63-.93.97-1.96,1.7-2.88,2.65-.16.18-.29.34-.37.51-.13.24-.16.53-.11.86.04.2.13.48.29.86.14.36,0,.08.17.43.09.14.05.14.26.39.24.29.49.42.78.42.24,0,.46-.11.62-.3l.26-.3c1.13-1.21,2.3-2.45,3.63-3.86,1.2-1.27,2.45-2.6,3.72-3.96.16-.18.27-.41.35-.7.07-.24.1-.51.11-.79,0-.29-.02-.57-.08-.84Z"/>
  </svg>
);

/**
 * Double Arrow Left icon (move all left)
 *
 * @description Two chevron-left arrows side by side. Fill-based with
 * rounded ends matching the designer's icon style.
 *
 * @author ai — Pending designer review
 */
export const DoubleArrowLeft: React.FC<IconProps> = ({
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
    <path d="M12.88,12.77c.07.34.21.62.41.83,1.27,1.36,2.52,2.69,3.71,3.95,1.19,1.26,2.41,2.56,3.62,3.85l.29.32.02.03c.17.16.37.24.6.24.27,0,.52-.14.75-.4.21-.24.18-.27.24-.4.21-.43.13-.29.24-.6.16-.39.16-.35.21-.56.05-.32.02-.6-.11-.85-.09-.17-.22-.34-.38-.52-1.84-1.83-6.17-6.02-6.45-6.47.11-.27,2.42-2.8,3.01-3.39.23-.23.44-.44.62-.63.93-.97,1.96-1.7,2.88-2.65.16-.18.29-.34.37-.51.13-.24.16-.53.11-.86-.04-.2-.13-.48-.29-.86-.14-.36,0-.08-.17-.43-.09-.14-.05-.14-.26-.39-.24-.29-.49-.42-.78-.42-.24,0-.46.11-.62.3l-.26.3c-1.13,1.21-2.3,2.45-3.63,3.86-1.2,1.27-2.45,2.6-3.72,3.96-.16.18-.27.41-.35.7-.07.24-.1.51-.11.79,0,.29.02.57.08.84ZM1.88,12.77c.07.34.21.62.41.83,1.27,1.36,2.52,2.69,3.71,3.95,1.19,1.26,2.41,2.56,3.62,3.85l.29.32.02.03c.17.16.37.24.6.24.27,0,.52-.14.75-.4.21-.24.18-.27.24-.4.21-.43.13-.29.24-.6.16-.39.16-.35.21-.56.05-.32.02-.6-.11-.85-.09-.17-.22-.34-.38-.52-1.84-1.83-6.17-6.02-6.45-6.47.11-.27,2.42-2.8,3.01-3.39.23-.23.44-.44.62-.63.93-.97,1.96-1.7,2.88-2.65.16-.18.29-.34.37-.51.13-.24.16-.53.11-.86-.04-.2-.13-.48-.29-.86-.14-.36,0-.08-.17-.43-.09-.14-.05-.14-.26-.39-.24-.29-.49-.42-.78-.42-.24,0-.46.11-.62.3l-.26.3c-1.13,1.21-2.3,2.45-3.63,3.86-1.2,1.27-2.45,2.6-3.72,3.96-.16.18-.27.41-.35.7-.07.24-.1.51-.11.79,0,.29.02.57.08.84Z"/>
  </svg>
);

/**
 * Plus icon (addition / create)
 *
 * @description Cross-shaped plus sign. Fill-based with rounded ends
 * matching the designer's icon style.
 *
 * @author ai — Pending designer review
 */
export const Plus: React.FC<IconProps> = ({
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
    <path d="M21,10.63H13.37V3c0-.31-.26-.57-.57-.57h-1.6c-.31,0-.57.26-.57.57v7.63H3c-.31,0-.57.26-.57.57v1.6c0,.31.26.57.57.57h7.63V21c0,.31.26.57.57.57h1.6c.31,0,.57-.26.57-.57v-7.63H21c.31,0,.57-.26.57-.57v-1.6c0-.31-.26-.57-.57-.57Z" />
  </svg>
);

/**
 * Maximize icon (expand to full size)
 *
 * @description Single square outline representing a maximized window.
 * Fill-based path matching the designer's icon style.
 *
 * @author ai — Pending designer review
 */
export const Maximize: React.FC<IconProps> = ({
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
    <path d="M4,4h16v16H4V4Zm2,2v12h12V6H6Z" />
  </svg>
);

/**
 * Restore icon (restore from maximized)
 *
 * @description Two overlapping squares representing a restored window.
 * Fill-based path matching the designer's icon style.
 *
 * @author ai — Pending designer review
 */
export const Restore: React.FC<IconProps> = ({
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
    <path d="M8,2h12v12h-4v4H4V6h4V2Zm2,4h8V4H10v2ZM6,8v8h8v-2H10V8H6Z" />
  </svg>
);

/**
 * Info circle icon — information indicator
 * @author ai — Pending designer review
 */
export const InfoCircle: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10,10-4.48,10-10S17.52,2,12,2Zm0,18c-4.41,0-8-3.59-8-8S7.59,4,12,4s8,3.59,8,8-3.59,8-8,8Zm-1-11h2v6h-2v-6Zm0-3h2v2h-2v-2Z" />
  </svg>
);

/**
 * Exclamation triangle icon — warning indicator
 * @author ai — Pending designer review
 */
export const ExclamationTriangle: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M12,2.5L1.5,21h21L12,2.5Zm0,3.74L19.53,19.5H4.47L12,6.24Zm-1,5.76h2v4h-2v-4Zm0,5.5h2v2h-2v-2Z" />
  </svg>
);

/**
 * Help circle icon — help/question indicator
 * @author ai — Pending designer review
 */
export const HelpCircle: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10,10-4.48,10-10S17.52,2,12,2Zm0,18c-4.41,0-8-3.59-8-8S7.59,4,12,4s8,3.59,8,8-3.59,8-8,8Zm-1-3h2v2h-2v-2Zm1.61-9.96c-1.86-.37-3.48.89-3.58,2.76h1.97c.05-.72.62-1.3,1.36-1.3.79,0,1.43.64,1.43,1.43,0,.81-.88,1.12-1.54,1.88-.6.7-.68,1.42-.68,2.19h2c0-.62.08-.96.46-1.42.58-.7,1.76-1.07,1.76-2.65,0-1.52-1.31-2.59-3.18-2.89Z" />
  </svg>
);

/**
 * User icon — person/avatar placeholder
 * @author ai — Pending designer review
 */
export const User: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M12,12c2.76,0,5-2.24,5-5s-2.24-5-5-5-5,2.24-5,5,2.24,5,5,5Zm0,2c-3.33,0-10,1.67-10,5v2h20v-2c0-3.33-6.67-5-10-5Z" />
  </svg>
);

/**
 * Star icon — filled star for ratings
 * @author ai — Pending designer review
 */
export const Star: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M12,2l2.94,6.34L22,9.27l-5,5.18L18.18,22,12,18.27,5.82,22,7,14.45,2,9.27l7.06-.93L12,2Z" />
  </svg>
);

/**
 * StarHalf icon — half-filled star for ratings
 * @author ai — Pending designer review
 */
export const StarHalf: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M12,2l2.94,6.34L22,9.27l-5,5.18L18.18,22,12,18.27,5.82,22,7,14.45,2,9.27l7.06-.93L12,2Zm0,3.88V18.27l-3.71,2.24.71-4.26L5.37,12.7l4.24-.56L12,5.88Z" />
  </svg>
);

/**
 * TimesCircle icon — close/cancel in a circle
 * @author ai — Pending designer review
 */
export const TimesCircle: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10,10-4.48,10-10S17.52,2,12,2Zm5,13.59L15.59,17,12,13.41,8.41,17,7,15.59,10.59,12,7,8.41,8.41,7,12,10.59,15.59,7,17,8.41,13.41,12,17,15.59Z" />
  </svg>
);

/**
 * Heart icon — love/favorite indicator
 * @author ai — Pending designer review
 */
export const Heart: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5,2,5.42,4.42,3,7.5,3c1.74,0,3.41.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3,19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35Z" />
  </svg>
);

/**
 * Upload icon — file upload indicator
 * @author ai — Pending designer review
 */
export const Upload: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M5,4V6H19V4ZM5,14H9V20H15V14H19L12,7Z" />
  </svg>
);
