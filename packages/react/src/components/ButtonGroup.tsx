import React, { forwardRef, useRef, useImperativeHandle } from "react";
import "./ButtonGroup.css";

export interface ButtonGroupProps {
  /** Orientation of the group */
  orientation?: "horizontal" | "vertical";
  /** Component size — overrides children via CSS variable */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Disabled state for all children */
  disabled?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Button or ToggleButton children */
  children: React.ReactNode;
}

const base = "k-btn-group";

/**
 * ButtonGroup component for grouping Buttons and ToggleButtons.
 *
 * @description Wraps Button and ToggleButton children, fusing their
 * borders and border-radius so they appear as a single connected unit.
 * Supports horizontal and vertical orientation. Works with any mix of
 * Button, ToggleButton, and DropdownButton.
 *
 * @example
 * ```tsx
 * <ButtonGroup>
 *   <Button>Left</Button>
 *   <Button>Center</Button>
 *   <Button>Right</Button>
 * </ButtonGroup>
 *
 * <ButtonGroup orientation="vertical">
 *   <ToggleButton value="a" checked>A</ToggleButton>
 *   <ToggleButton value="b">B</ToggleButton>
 * </ButtonGroup>
 * ```
 */
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  (
    {
      orientation = "horizontal",
      size,
      disabled,
      className = "",
      style,
      children,
    },
    ref
  ) => {
    const elRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => elRef.current as HTMLDivElement);

    const cls = [
      base,
      `${base}--${orientation}`,
      size && `${base}--${size}`,
      disabled && `${base}--disabled`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={elRef} className={cls} style={style} role="group">
        {children}
      </div>
    );
  }
);

ButtonGroup.displayName = "ButtonGroup";
