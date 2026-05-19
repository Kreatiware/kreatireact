import React, { useState, useCallback } from "react";
import { ToggleButton } from "./ToggleButton";
import type { ToggleButtonProps } from "./ToggleButton";

export interface ToggleButtonGroupOption {
  /** Unique value */
  value: string | number;
  /** Button label */
  label?: string;
  /** Left icon */
  iconLeft?: React.ReactNode;
  /** Right icon */
  iconRight?: React.ReactNode;
  /** Disabled */
  disabled?: boolean;
}

export interface ToggleButtonGroupProps {
  /** Options for dynamic button creation */
  options?: ToggleButtonGroupOption[];
  /** Selected value(s) — single value or array for multiple */
  value?: string | number | Array<string | number>;
  /** Default selected value(s) */
  defaultValue?: string | number | Array<string | number>;
  /** Fires when selection changes */
  onChange?: (value: string | number | Array<string | number>) => void;
  /** Allow multiple selection */
  multiple?: boolean;
  /** Layout direction */
  orientation?: "horizontal" | "vertical";
  /** Button size — passed to each ToggleButton */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Slim mode — passed to each ToggleButton */
  slim?: boolean;
  /** Compact mode — passed to each ToggleButton */
  compact?: boolean;
  /** Disabled state for all buttons */
  disabled?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Children ToggleButtons (alternative to options) */
  children?: React.ReactNode;
}

/**
 * ToggleButtonGroup for grouping ToggleButtons with connected borders.
 *
 * @description Groups ToggleButton components with shared borders, supporting
 * single or multiple selection. Can use options array or children ToggleButtons.
 *
 * @example
 * ```tsx
 * <ToggleButtonGroup
 *   options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }]}
 *   value="center"
 *   onChange={(v) => setAlign(v)}
 * />
 * ```
 */
export const ToggleButtonGroup = ({
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  multiple = false,
  orientation = "horizontal",
  size = "md",
  slim = false,
  compact = false,
  disabled = false,
  className = "",
  style,
  children,
  ref,
}: ToggleButtonGroupProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<
    string | number | Array<string | number>
  >(defaultValue ?? (multiple ? [] : ""));
  const selected = isControlled ? controlledValue : internalValue;

  const isActive = useCallback(
    (val: string | number): boolean => {
      if (Array.isArray(selected)) return selected.includes(val);
      return selected === val;
    },
    [selected]
  );

  const handleClick = useCallback(
    (val: string | number) => {
      let next: string | number | Array<string | number>;
      if (multiple) {
        const arr = Array.isArray(selected) ? selected : [];
        next = arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
      } else {
        next = selected === val ? "" : val;
      }
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    },
    [selected, multiple, isControlled, onChange]
  );

  const base = "k-toggle-group";
  const classes = [base, `${base}--${orientation}`, className]
    .filter(Boolean)
    .join(" ");

  if (children) {
    return (
      <div ref={ref} className={classes} style={style} role="group">
        {React.Children.map(children, child => {
          if (!React.isValidElement<ToggleButtonProps>(child)) return child;
          const val = child.props.value;
          if (val === undefined) return child;
          return React.cloneElement(child, {
            active: isActive(val),
            size,
            slim,
            compact,
            disabled: disabled || child.props.disabled,
            onClick: () => handleClick(val),
          });
        })}
      </div>
    );
  }

  return (
    <div ref={ref} className={classes} role="group">
      {options?.map(opt => (
        <ToggleButton
          key={opt.value}
          value={opt.value}
          label={opt.label}
          iconLeft={opt.iconLeft}
          iconRight={opt.iconRight}
          size={size}
          slim={slim}
          compact={compact}
          active={isActive(opt.value)}
          disabled={disabled || opt.disabled}
          onClick={() => handleClick(opt.value)}
        />
      ))}
    </div>
  );
};
