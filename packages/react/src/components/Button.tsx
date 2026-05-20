import React from "react";
import { Spinner } from "./Spinner";
import { Tooltip } from "./Tooltip";
import type { TooltipPosition } from "./Tooltip";
import { useKreatiLocale } from "../locale";
import "./Button.css";

export interface ButtonSize {
  value: "xs" | "sm" | "md" | "lg" | "xl";
}

export interface ButtonProps {
  /** Button label text */
  label?: string;
  /** Left icon (JSX element) */
  iconLeft?: React.ReactNode;
  /** Right icon (JSX element) */
  iconRight?: React.ReactNode;
  /** Button size */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Button type style */
  buttonType?: "filled" | "outlined" | "text";
  /** Color severity */
  severity?:
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "help"
    | "danger"
    | "accent";
  /** Disabled state (keeps color, applies 40% opacity) */
  disabled?: boolean;
  /** Loading state — shows spinner, disables interaction */
  loading?: boolean;
  /** Accessible text announced while loading (defaults to locale common.loading) */
  loadingText?: string;
  /** Raised shadow effect */
  raised?: boolean;
  /** Extra rounded borders (pill shape / circle for icon-only) */
  rounded?: boolean;
  /** Slim mode — reduces vertical padding for a thinner button */
  slim?: boolean;
  /** Compact mode — minimal vertical padding, ultra-thin button */
  compact?: boolean;
  /** Badge content */
  badge?: React.ReactNode;
  /** Badge position using cardinal directions */
  badgePosition?: "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";
  /** Click handler */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** HTML button type attribute */
  type?: "button" | "submit" | "reset";
  /** Custom width (e.g. '100%', '200px', 'auto') */
  width?: string;
  /** Accessible label for icon-only buttons */
  ariaLabel?: string;
  /** Tooltip text displayed on hover/focus */
  tooltip?: string;
  /** Tooltip position relative to the button */
  tooltipPosition?: TooltipPosition;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Render custom content directly inside the button (template slot) */
  children?: React.ReactNode;
}

/**
 * Button component with multiple variants, sizes, and severity levels.
 *
 * @description A versatile button supporting filled, outlined, and text styles
 * with 7 severity colors. Includes icon slots, badge overlay, slim mode,
 * raised shadow, pill/circle shapes, and optional tooltip. Fully accessible
 * with ARIA support and keyboard navigation.
 *
 * @example
 * ```tsx
 * <Button label="Save" severity="primary" iconRight={<Check size={16} />} />
 * <Button label="Delete" severity="danger" buttonType="outlined" tooltip="Remove this item" />
 * <Button iconLeft={<Menu size={18} />} ariaLabel="Open menu" rounded tooltip="Menu" />
 * ```
 */
export const Button = ({
  label,
  iconLeft,
  iconRight,
  size = "md",
  buttonType = "filled",
  severity = "primary",
  disabled = false,
  loading = false,
  loadingText,
  raised = false,
  rounded = false,
  slim = false,
  compact = false,
  badge,
  badgePosition = "ne",
  onClick,
  type = "button",
  width,
  ariaLabel,
  tooltip,
  tooltipPosition = "top",
  className = "",
  style,
  children,
  ref,
}: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  const locale = useKreatiLocale();
  const isIconOnly = !label && !children && (iconLeft || iconRight);
  const base = "k-button";

  const classes = [
    base,
    `${base}--${size}`,
    `${base}--${buttonType}`,
    `${base}--${severity}`,
    isIconOnly && !loading && `${base}--icon-only`,
    raised && `${base}--raised`,
    rounded && `${base}--rounded`,
    slim && `${base}--slim`,
    compact && `${base}--compact`,
    (disabled || loading) && `${base}--disabled`,
    loading && `${base}--loading`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const spinnerSize = size === "xs" || size === "sm" ? "xs" : "sm";

  const buttonEl = (
    <button
      ref={ref}
      className={classes}
      style={{ ...style, ...(width ? { width } : undefined) }}
      disabled={disabled || loading}
      onClick={!loading ? onClick : undefined}
      type={type}
      aria-label={isIconOnly ? ariaLabel : undefined}
      aria-disabled={disabled || loading || undefined}
      aria-busy={loading || undefined}
    >
      {loading ? (
        <Spinner
          size={spinnerSize}
          color="currentColor"
          label={loadingText ?? locale.common.loading}
        />
      ) : children ? (
        children
      ) : (
        <>
          {iconLeft && (
            <span className={`${base}__icon ${base}__icon--left`}>
              {iconLeft}
            </span>
          )}
          {label && <span className={`${base}__label`}>{label}</span>}
          {iconRight && (
            <span className={`${base}__icon ${base}__icon--right`}>
              {iconRight}
            </span>
          )}
        </>
      )}
      {badge != null && (
        <span className={`${base}__badge ${base}__badge--${badgePosition}`}>
          {badge}
        </span>
      )}
    </button>
  );

  if (tooltip) {
    return (
      <Tooltip content={tooltip} position={tooltipPosition}>
        {buttonEl}
      </Tooltip>
    );
  }

  return buttonEl;
};

Button.displayName = "Button";
