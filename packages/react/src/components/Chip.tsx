import React, { forwardRef } from "react";
import { TIMES_PATH } from "./iconPaths";
import { useKreatiLocale } from "../locale";
import "./Chip.css";

export interface ChipProps {
  /** Chip content */
  children: React.ReactNode;
  /** Visual variant */
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "outline";
  /** Chip size */
  size?: "sm" | "md" | "lg";
  /** Leading icon */
  icon?: React.ReactNode;
  /** Show remove button */
  removable?: boolean;
  /** Callback when remove is clicked */
  onRemove?: () => void;
  /** Raised shadow effect */
  raised?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * Chip component for displaying compact labels, tags, or status indicators.
 *
 * @description A small inline element with rounded pill shape, supporting
 * multiple color variants, optional leading icon, and removable functionality.
 * Useful for tags, categories, filters, and status badges.
 *
 * @example
 * ```tsx
 * <Chip variant="primary">React</Chip>
 * <Chip variant="success" icon={<Check size={12} />}>Active</Chip>
 * <Chip variant="outline" size="sm" removable onRemove={() => {}}>Draft</Chip>
 * ```
 */
export const Chip = forwardRef<HTMLSpanElement, ChipProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      icon,
      removable = false,
      onRemove,
      raised = false,
      className = "",
      style,
    },
    ref
  ) => {
    const locale = useKreatiLocale();
    const baseClass = "k-chip";
    const classes = [
      baseClass,
      `${baseClass}--${variant}`,
      `${baseClass}--${size}`,
      raised && `${baseClass}--raised`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <span ref={ref} className={classes} style={style} role="status">
        {icon && (
          <span className={`${baseClass}__icon`} aria-hidden="true">
            {icon}
          </span>
        )}
        <span className={`${baseClass}__text`}>{children}</span>
        {removable && (
          <button
            type="button"
            className={`${baseClass}__remove`}
            onClick={onRemove}
            aria-label={locale.common.close}
          >
            <svg
              width={10}
              height={10}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d={TIMES_PATH} />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

Chip.displayName = "Chip";
