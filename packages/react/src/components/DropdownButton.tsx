import React, { useRef, useImperativeHandle } from "react";
import { Button } from "./Button";
import type { ButtonProps } from "./Button";
import { ContextMenu } from "./ContextMenu";
import type { MenuItem } from "../types/navigation";
import { CHEVRON_DOWN_PATH } from "./iconPaths";
import "./DropdownButton.css";

export interface DropdownButtonProps {
  /** Label for the main action button */
  label?: string;
  /** Left icon for the main action */
  iconLeft?: React.ReactNode;
  /** Right icon for the main action */
  iconRight?: React.ReactNode;
  /** Menu items for the dropdown — supports nested items for submenus */
  items: MenuItem[];
  /** Click handler for the main button */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Fires when a menu item is selected */
  onItemSelect?: (key: string, item: MenuItem) => void;
  /** Button size */
  size?: ButtonProps["size"];
  /** Button type style — applies to both main and toggle */
  buttonType?: ButtonProps["buttonType"];
  /** Color severity — applies to both main and toggle */
  severity?: ButtonProps["severity"];
  /** Raised shadow */
  raised?: boolean;
  /** Rounded borders */
  rounded?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Dropdown placement relative to the button */
  placement?: "bottom" | "top" | "left" | "right";
  /** Accessible label for the dropdown toggle */
  toggleAriaLabel?: string;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

const chevronIcon = (
  <svg
    width={12}
    height={12}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d={CHEVRON_DOWN_PATH} />
  </svg>
);

/**
 * DropdownButton — a split button with a primary action and a dropdown menu.
 *
 * @description Combines a main action Button with a toggle that opens a
 * ContextMenu. The dropdown supports nested submenus, icons, separators,
 * disabled items, and custom templates via the MenuItem interface.
 * Both halves share the same severity, size, and buttonType for visual
 * consistency. Fully accessible with ARIA attributes and keyboard support.
 *
 * @example
 * ```tsx
 * <DropdownButton
 *   label="Save"
 *   onClick={() => save()}
 *   items={[
 *     { key: 'draft', label: 'Save as Draft' },
 *     { key: 'publish', label: 'Save & Publish' },
 *   ]}
 *   onItemSelect={(key) => console.log(key)}
 * />
 * ```
 */
export const DropdownButton = ({
  label,
  iconLeft,
  iconRight,
  items,
  onClick,
  onItemSelect,
  size = "md",
  buttonType = "filled",
  severity = "primary",
  raised = false,
  rounded = false,
  disabled = false,
  placement = "bottom",
  toggleAriaLabel = "More options",
  className = "",
  style,
  ref,
}: DropdownButtonProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

  const base = "k-dropdownbutton";

  return (
    <div
      ref={containerRef}
      className={`${base} ${className}`.trim()}
      style={style}
      role="group"
    >
      <Button
        label={label}
        iconLeft={iconLeft}
        iconRight={iconRight}
        size={size}
        buttonType={buttonType}
        severity={severity}
        raised={raised}
        rounded={rounded}
        disabled={disabled}
        onClick={onClick}
        className={`${base}__main`}
      />
      <ContextMenu
        items={items}
        trigger="click"
        placement={placement}
        onItemSelect={onItemSelect}
        disabled={disabled}
      >
        <Button
          iconLeft={chevronIcon}
          size={size}
          buttonType={buttonType}
          severity={severity}
          raised={raised}
          rounded={rounded}
          disabled={disabled}
          ariaLabel={toggleAriaLabel}
          className={`${base}__toggle`}
          aria-haspopup="menu"
        />
      </ContextMenu>
    </div>
  );
};
