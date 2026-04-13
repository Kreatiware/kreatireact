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

/**
 * Filter icon — funnel shape for filtering data
 * @author ai — Pending designer review
 */
export const Filter: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M4.25,5.61C6.27,8.2,10,13,10,13v6c0,.55.45,1,1,1h2c.55,0,1-.45,1-1v-6s3.72-4.8,5.74-7.39c.51-.65.04-1.61-.79-1.61H5.04c-.83,0-1.3.95-.79,1.61Z" />
  </svg>
);

/**
 * Pencil icon — edit/modify indicator
 * @author ai — Pending designer review
 */
export const Pencil: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M3,17.25V21h3.75L17.81,9.94l-3.75-3.75L3,17.25ZM20.71,7.04c.39-.39.39-1.02,0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41,0l-1.83,1.83,3.75,3.75,1.83-1.83Z" />
  </svg>
);

/**
 * Trash icon — delete/remove indicator
 * @author ai — Pending designer review
 */
export const Trash: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M6,19c0,1.1.9,2,2,2h8c1.1,0,2-.9,2-2V7H6v12ZM19,4h-3.5l-1-1h-5l-1,1H5v2h14V4Z" />
  </svg>
);

/**
 * EllipsisV icon — vertical three dots menu
 * @author ai — Pending designer review
 */
export const EllipsisV: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M12,8c1.1,0,2-.9,2-2s-.9-2-2-2-2,.9-2,2,.9,2,2,2Zm0,2c-1.1,0-2,.9-2,2s.9,2,2,2,2-.9,2-2-.9-2-2-2Zm0,6c-1.1,0-2,.9-2,2s.9,2,2,2,2-.9,2-2-.9-2-2-2Z" />
  </svg>
);

/**
 * Download icon — file download indicator
 * @author ai — Pending designer review
 */
export const Download: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M5,20H19V18H5ZM19,9H15V3H9V9H5L12,16Z" />
  </svg>
);

/**
 * Copy icon — clipboard copy indicator
 * @author ai — Pending designer review
 */
export const Copy: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M16,1H4C2.9,1,2,1.9,2,3v14h2V3h12V1Zm3,4H8C6.9,5,6,5.9,6,7v14c0,1.1.9,2,2,2h11c1.1,0,2-.9,2-2V7c0-1.1-.9-2-2-2Zm0,16H8V7h11v14Z" />
  </svg>
);

/**
 * Print icon — printer indicator
 * @author ai — Pending designer review
 */
export const Print: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M19,8H5c-1.66,0-3,1.34-3,3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3Zm-3,11H8v-5h8v5Zm3-7c-.55,0-1-.45-1-1s.45-1,1-1,1,.45,1,1-.45,1-1,1ZM18,3H6v4h12V3Z" />
  </svg>
);

/**
 * GripVertical icon — drag handle for reordering
 * @author ai — Pending designer review
 */
export const GripVertical: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M8,6h2v12H8Zm6,0h2v12H14Z" />
  </svg>
);

/**
 * Eye icon — visibility/show indicator
 * @author ai — Pending designer review
 */
export const Eye: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M12,4.5C7,4.5,2.73,7.61,1,12c1.73,4.39,6,7.5,11,7.5s9.27-3.11,11-7.5C21.27,7.61,17,4.5,12,4.5Zm0,12.5c-2.76,0-5-2.24-5-5s2.24-5,5-5,5,2.24,5,5-2.24,5-5,5Zm0-8c-1.66,0-3,1.34-3,3s1.34,3,3,3,3-1.34,3-3-1.34-3-3-3Z" />
  </svg>
);

/**
 * EyeOff icon — hidden/hide indicator
 * @author ai — Pending designer review
 */
export const EyeOff: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M12,7c2.76,0,5,2.24,5,5,0,.65-.13,1.26-.36,1.83l2.92,2.92c1.51-1.26,2.7-2.89,3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4,0-2.74.25-3.98.7l2.16,2.16c.57-.23,1.18-.36,1.83-.36ZM2,4.27l2.28,2.28.46.46C3.08,8.3,1.78,10.02,1,12c1.73,4.39,6,7.5,11,7.5,1.55,0,3.03-.3,4.38-.84l.42.42L19.73,22,21,20.73,3.27,3,2,4.27ZM7.53,9.8l1.55,1.55c-.05.21-.08.43-.08.65,0,1.66,1.34,3,3,3,.22,0,.44-.03.65-.08l1.55,1.55c-.67.33-1.41.53-2.2.53-2.76,0-5-2.24-5-5,0-.79.2-1.53.53-2.2Zm4.31-.78l3.15,3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01Z" />
  </svg>
);

/**
 * Mail icon — email/envelope indicator
 * @author ai — Pending designer review
 */
export const Mail: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M20,4H4C2.9,4,2,4.9,2,6v12c0,1.1.9,2,2,2h16c1.1,0,2-.9,2-2V6c0-1.1-.9-2-2-2Zm0,4l-8,5L4,8V6l8,5,8-5v2Z" />
  </svg>
);

/**
 * Lock icon — security/locked indicator
 * @author ai — Pending designer review
 */
export const Lock: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M18,8h-1V6c0-2.76-2.24-5-5-5S7,3.24,7,6v2H6c-1.1,0-2,.9-2,2v10c0,1.1.9,2,2,2h12c1.1,0,2-.9,2-2V10c0-1.1-.9-2-2-2ZM12,17c-1.1,0-2-.9-2-2s.9-2,2-2,2,.9,2,2-.9,2-2,2ZM15.1,8H8.9V6c0-1.71,1.39-3.1,3.1-3.1s3.1,1.39,3.1,3.1v2Z" />
  </svg>
);

/**
 * Phone icon — telephone indicator
 * @author ai — Pending designer review
 */
export const Phone: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M6.62,10.79c1.44,2.83,3.76,5.14,6.59,6.59l2.2-2.2c.27-.27.67-.36,1.02-.24,1.12.37,2.33.57,3.57.57.55,0,1,.45,1,1V20c0,.55-.45,1-1,1-9.39,0-17-7.61-17-17,0-.55.45-1,1-1h3.5c.55,0,1,.45,1,1,0,1.25.2,2.45.57,3.57.11.35.03.74-.25,1.02l-2.2,2.2Z" />
  </svg>
);

/**
 * Clock icon — time indicator
 * @author ai — Pending designer review
 */
export const Clock: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M12,2C6.49,2,2,6.49,2,12s4.49,10,10,10,10-4.49,10-10S17.51,2,12,2Zm0,18c-4.41,0-8-3.59-8-8s3.59-8,8-8,8,3.59,8,8-3.59,8-8,8Zm.5-13H11v6l5.25,3.15.75-1.23-4.5-2.67V7Z" />
  </svg>
);

/**
 * Sort icon — sort indicator (both directions)
 * @author ai — Pending designer review
 */
export const Sort: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M3,18h6v-2H3v2ZM3,6v2h18V6H3Zm0,7h12v-2H3v2Z" />
  </svg>
);

/**
 * Bell icon — notification indicator
 * @author ai — Pending designer review
 */
export const Bell: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M12,22c1.1,0,2-.9,2-2h-4c0,1.1.9,2,2,2Zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5,1.5v.68C7.64,5.36,6,7.92,6,11v5l-2,2v1h16v-1l-2-2Z" />
  </svg>
);

/**
 * BellOff icon — muted notification indicator
 * @author ai — Pending designer review
 */
export const BellOff: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M12,22c1.1,0,2-.9,2-2h-4c0,1.1.9,2,2,2ZM18,16v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5,1.5v.68c-.44.12-.85.29-1.23.49L3.27,3,2,4.27l18.73,18.73L22,21.73,18,16Zm-8.27-2.73L6,9.73V11c0,3.07-1.63,5.64-4.5,6.32v.68h12.73l-4.5-4.73Z" />
  </svg>
);

/**
 * Refresh icon — reload/refresh indicator
 * @author ai — Pending designer review
 */
export const Refresh: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M17.65,6.35C16.2,4.9,14.21,4,12,4c-4.42,0-7.99,3.58-7.99,8s3.57,8,7.99,8c3.73,0,6.84-2.55,7.73-6h-2.08c-.82,2.33-3.04,4-5.65,4-3.31,0-6-2.69-6-6s2.69-6,6-6c1.66,0,3.14.69,4.22,1.78L13,11h7V4l-2.35,2.35Z" />
  </svg>
);

/**
 * ExternalLink icon — open in new window indicator
 * @author ai — Pending designer review
 */
export const ExternalLink: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M19,19H5V5h7V3H5C3.89,3,3,3.9,3,5v14c0,1.1.89,2,2,2h14c1.1,0,2-.9,2-2v-7h-2v7ZM14,3v2h3.59l-9.83,9.83,1.41,1.41L19,6.41V10h2V3h-7Z" />
  </svg>
);

/**
 * CheckCircle icon — success/confirmed indicator
 * @author ai — Pending designer review
 */
export const CheckCircle: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10,10-4.48,10-10S17.52,2,12,2Zm-2,15l-5-5,1.41-1.41L10,14.17l7.59-7.59L19,8l-9,9Z" />
  </svg>
);

/**
 * Home icon — home/dashboard indicator
 * @author ai — Pending designer review
 */
export const Home: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M10,20v-6h4v6h5v-8h3L12,3,2,12h3v8h5Z" />
  </svg>
);

/**
 * Settings icon — gear/configuration indicator
 * @author ai — Pending designer review
 */
export const Settings: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M19.14,12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24,0-.43.17-.47.41l-.36,2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47,0-.59.22L2.74,8.87c-.12.21-.08.47.12.61l2.03,1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03,1.58c-.18.14-.23.41-.12.61l1.92,3.32c.12.22.37.29.59.22l2.39-.96c.5.38,1.03.7,1.62.94l.36,2.54c.05.24.24.41.48.41h3.84c.24,0,.44-.17.47-.41l.36-2.54c.59-.24,1.13-.56,1.62-.94l2.39.96c.22.08.47,0,.59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58ZM12,15.6c-1.98,0-3.6-1.62-3.6-3.6s1.62-3.6,3.6-3.6,3.6,1.62,3.6,3.6-1.62,3.6-3.6,3.6Z" />
  </svg>
);

/**
 * Grid icon — grid view indicator
 * @author ai — Pending designer review
 */
export const Grid: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M4,4h4v4H4Zm6,0h4v4H10Zm6,0h4v4H16ZM4,10h4v4H4Zm6,0h4v4H10Zm6,0h4v4H16ZM4,16h4v4H4Zm6,0h4v4H10Zm6,0h4v4H16Z" />
  </svg>
);

/**
 * ListIcon icon — list view indicator
 * @author ai — Pending designer review
 */
export const ListIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M3,13h2v-2H3v2Zm0,4h2v-2H3v2Zm0-8h2V7H3v2Zm4,4h14v-2H7v2Zm0,4h14v-2H7v2ZM7,7v2h14V7H7Z" />
  </svg>
);

/**
 * ImageIcon icon — image/photo indicator
 * @author ai — Pending designer review
 */
export const ImageIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M21,19V5c0-1.1-.9-2-2-2H5c-1.1,0-2,.9-2,2v14c0,1.1.9,2,2,2h14c1.1,0,2-.9,2-2ZM8.5,13.5l2.5,3.01L14.5,12l4.5,6H5l3.5-4.5Z" />
  </svg>
);

/**
 * Folder icon — folder/directory indicator
 * @author ai — Pending designer review
 */
export const Folder: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M10,4H4c-1.1,0-2,.9-2,2v12c0,1.1.9,2,2,2h16c1.1,0,2-.9,2-2V8c0-1.1-.9-2-2-2h-8l-2-2Z" />
  </svg>
);

/**
 * File icon — document/file indicator
 * @author ai — Pending designer review
 */
export const File: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M14,2H6c-1.1,0-2,.9-2,2v16c0,1.1.9,2,2,2h12c1.1,0,2-.9,2-2V8l-6-6Zm2,16H8v-2h8v2Zm0-4H8v-2h8v2Zm-3-5V3.5L18.5,9H13Z" />
  </svg>
);

/**
 * Share icon — share/send indicator
 * @author ai — Pending designer review
 */
export const Share: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
    <path d="M18,16.08c-.76,0-1.44.3-1.96.77L8.91,12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5,1.25.81,2.04.81,1.66,0,3-1.34,3-3s-1.34-3-3-3-3,1.34-3,3c0,.24.04.47.09.7L8.04,9.81c-.54-.5-1.25-.81-2.04-.81-1.66,0-3,1.34-3,3s1.34,3,3,3c.79,0,1.5-.31,2.04-.81l7.12,4.16c-.05.21-.08.43-.08.65,0,1.61,1.31,2.92,2.92,2.92s2.92-1.31,2.92-2.92-1.31-2.92-2.92-2.92Z" />
  </svg>
);
