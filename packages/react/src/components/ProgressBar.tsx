import React, { forwardRef, useRef, useImperativeHandle } from "react";
import "./ProgressBar.css";

export interface ProgressBarProps {
  /** Current value (0-100) — omit for indeterminate */
  value?: number;
  /** Show value label */
  showValue?: boolean;
  /** Label position — inside the bar or outside to the right */
  labelPosition?: "inside" | "outside";
  /** Custom format for the label */
  valueTemplate?: (value: number) => React.ReactNode;
  /**
   * Custom render for the filled portion of the bar.
   *
   * @param props - Object with value (0-100) and severity
   * @returns ReactNode (rendered inside the fill div)
   */
  fillTemplate?: (props: {
    value: number;
    severity: string;
  }) => React.ReactNode;
  /** Visual severity */
  severity?:
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "help"
    | "danger"
    | "accent";
  /** Height — CSS value */
  height?: string | number;
  /** Accessible label for screen readers */
  ariaLabel?: string;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * ProgressBar component for displaying completion progress.
 *
 * @description A horizontal bar that fills based on a value from 0 to 100.
 * Supports determinate (with value) and indeterminate (without value) modes,
 * severity colors, custom height, label inside or outside the bar, and
 * custom fill/value templates. Uses GPU-accelerated transforms for the
 * indeterminate animation. Respects prefers-reduced-motion.
 *
 * @example
 * ```tsx
 * <ProgressBar value={60} showValue />
 * <ProgressBar value={80} showValue labelPosition="outside" />
 * <ProgressBar /> // indeterminate
 * ```
 */
export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      showValue = false,
      labelPosition = "outside",
      valueTemplate,
      fillTemplate,
      severity = "primary",
      height,
      ariaLabel,
      className = "",
      style,
    },
    ref
  ) => {
    const elRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => elRef.current as HTMLDivElement);

    const base = "k-progressbar";
    const indeterminate = value === undefined;
    const clamped = indeterminate ? 0 : Math.max(0, Math.min(100, value));
    const inside = labelPosition === "inside";

    const classes = [
      base,
      `${base}--${severity}`,
      indeterminate && `${base}--indeterminate`,
      inside && `${base}--label-inside`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const labelContent =
      showValue && !indeterminate
        ? valueTemplate
          ? valueTemplate(clamped)
          : `${clamped}%`
        : null;

    return (
      <div
        ref={elRef}
        className={classes}
        style={style}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
      >
        <div className={`${base}__track`} style={{ height }}>
          <div
            className={`${base}__fill`}
            style={indeterminate ? undefined : { width: `${clamped}%` }}
          >
            {fillTemplate && fillTemplate({ value: clamped, severity })}
            {inside && labelContent && (
              <span className={`${base}__label ${base}__label--inside`}>
                {labelContent}
              </span>
            )}
          </div>
        </div>
        {!inside && labelContent && (
          <span className={`${base}__label ${base}__label--outside`}>
            {labelContent}
          </span>
        )}
      </div>
    );
  }
);

ProgressBar.displayName = "ProgressBar";
