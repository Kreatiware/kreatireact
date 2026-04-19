import React, {
  forwardRef,
  useState,
  useCallback,
  useRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Button } from "./Button";
import type { ButtonProps } from "./Button";
import { Tooltip } from "./Tooltip";
import { PLUS_PATH, TIMES_PATH } from "./iconPaths";
import "./SpeedDial.css";

/** Single action in the SpeedDial */
export interface SpeedDialItem {
  /** Unique key */
  key: string;
  /** Icon rendered inside the action button */
  icon: React.ReactNode;
  /** Tooltip label */
  label?: string;
  /** Click handler */
  command?: () => void;
  /** Nested SpeedDial items — renders a sub-dial on this action */
  items?: SpeedDialItem[];
  /** Direction for nested sub-dial */
  direction?: SpeedDialDirection;
  /** Disabled state */
  disabled?: boolean;
  /** Button severity */
  severity?: ButtonProps["severity"];
  /** Button type style */
  buttonType?: ButtonProps["buttonType"];
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

export type SpeedDialDirection = "up" | "down" | "left" | "right";
export type SpeedDialLayout =
  | "linear"
  | "quarter-up-right"
  | "quarter-up-left"
  | "quarter-down-right"
  | "quarter-down-left";

export interface SpeedDialProps {
  /** Action items */
  items: SpeedDialItem[];
  /** Expansion direction for linear layout */
  direction?: SpeedDialDirection;
  /** Layout mode — linear or quarter circle */
  layout?: SpeedDialLayout;
  /** Radius in px for quarter circle layout */
  radius?: number;
  /** Icon for the trigger button when closed */
  icon?: React.ReactNode;
  /** Icon for the trigger button when open — defaults to Times (X) */
  activeIcon?: React.ReactNode;
  /** Whether the trigger icon rotates 45deg instead of swapping icons */
  rotateAnimation?: boolean;
  /** Trigger button severity */
  severity?: ButtonProps["severity"];
  /** Trigger button type style */
  buttonType?: ButtonProps["buttonType"];
  /** Trigger button size */
  size?: ButtonProps["size"];
  /** Action button size */
  actionSize?: ButtonProps["size"];
  /** Show overlay mask when open */
  mask?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Fires when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Trigger mode */
  triggerOn?: "click" | "hover";
  /** Accessible label for the trigger */
  ariaLabel?: string;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

const defaultIcon = (path: string) => (
  <svg
    width={18}
    height={18}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d={path} />
  </svg>
);

/**
 * SpeedDial component — a floating action button that expands into multiple actions.
 *
 * @description Renders a trigger button that, on click or hover, reveals a set of
 * action buttons in a linear direction (up/down/left/right) or quarter-circle arc.
 * Items with nested `items` open a sub-level managed from the root state.
 * Closing the main dial closes everything. Fully accessible with ARIA menu roles.
 *
 * @example
 * ```tsx
 * <SpeedDial
 *   items={[
 *     { key: 'add', icon: <Plus size={16} />, label: 'Add', command: () => {} },
 *     { key: 'share', icon: <Share size={16} />, label: 'Share', items: [
 *       { key: 'email', icon: <Mail size={16} />, label: 'Email' },
 *     ]},
 *   ]}
 *   direction="up"
 * />
 * ```
 */
export const SpeedDial = forwardRef<HTMLDivElement, SpeedDialProps>(
  (
    {
      items,
      direction = "up",
      layout = "linear",
      radius = 80,
      icon,
      activeIcon,
      rotateAnimation = true,
      severity = "primary",
      buttonType = "filled",
      size = "lg",
      actionSize = "md",
      mask = false,
      disabled = false,
      open: controlledOpen,
      onOpenChange,
      triggerOn = "click",
      ariaLabel = "Quick actions",
      className = "",
      style,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

    const isControlled = controlledOpen !== undefined;
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = isControlled ? controlledOpen : internalOpen;

    // Track which sub-dial keys are expanded
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    const setOpen = useCallback(
      (next: boolean) => {
        if (!next) setExpanded(new Set()); // close all sub-levels
        if (!isControlled) setInternalOpen(next);
        onOpenChange?.(next);
      },
      [isControlled, onOpenChange]
    );

    const toggle = useCallback(() => {
      if (disabled) return;
      setOpen(!isOpen);
    }, [disabled, isOpen, setOpen]);

    const close = useCallback(() => setOpen(false), [setOpen]);

    const toggleSub = useCallback(
      (key: string) => {
        setExpanded(prev => {
          const next = new Set(prev);
          if (next.has(key)) {
            // Close this key and all its descendants
            const closeDescendants = (
              items: SpeedDialItem[],
              parentKey: string
            ) => {
              for (const item of items) {
                if (next.has(item.key)) next.delete(item.key);
                if (item.items) closeDescendants(item.items, item.key);
              }
            };
            next.delete(key);
            // Find the item and close its children
            const findAndClose = (list: SpeedDialItem[]) => {
              for (const item of list) {
                if (item.key === key && item.items)
                  closeDescendants(item.items, key);
                if (item.items) findAndClose(item.items);
              }
            };
            findAndClose(items);
          } else {
            next.add(key);
          }
          return next;
        });
      },
      [items]
    );

    // Escape and click-outside
    useEffect(() => {
      if (!isOpen) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          close();
        }
      };
      const onClick = (e: MouseEvent) => {
        if (!containerRef.current?.contains(e.target as Node)) close();
      };
      document.addEventListener("keydown", onKey);
      document.addEventListener("mousedown", onClick);
      return () => {
        document.removeEventListener("keydown", onKey);
        document.removeEventListener("mousedown", onClick);
      };
    }, [isOpen, close]);

    const base = "k-speeddial";
    const isQuarter = layout.startsWith("quarter");

    const getQuarterStyle = (
      index: number,
      total: number
    ): React.CSSProperties => {
      const angleMap: Record<string, { start: number; end: number }> = {
        "quarter-up-right": { start: 180, end: 270 },
        "quarter-up-left": { start: 270, end: 360 },
        "quarter-down-right": { start: 90, end: 180 },
        "quarter-down-left": { start: 0, end: 90 },
      };
      const range = angleMap[layout] || angleMap["quarter-up-right"];
      const step = total > 1 ? (range.end - range.start) / (total - 1) : 0;
      const angle = (range.start + step * index) * (Math.PI / 180);
      return {
        position: "absolute",
        left: `calc(50% + ${Math.cos(angle) * radius}px)`,
        top: `calc(50% + ${Math.sin(angle) * radius}px)`,
        transform: "translate(-50%, -50%)",
      };
    };

    const renderItems = (
      list: SpeedDialItem[],
      dir: SpeedDialDirection,
      parentVisible: boolean
    ) => {
      const visible = list.filter(i => i.key);
      const actionsCls = [
        `${base}__actions`,
        `${base}__actions--${dir}`,
        parentVisible && `${base}__actions--visible`,
      ]
        .filter(Boolean)
        .join(" ");

      return (
        <div className={actionsCls} role="menu">
          {visible.map((item, i) => {
            const stagger: React.CSSProperties = {
              "--k-dial-i": i,
              ...item.style,
            } as React.CSSProperties;

            const hasSub = item.items && item.items.length > 0;
            const isSubOpen = expanded.has(item.key);
            const isDis = item.disabled || disabled;

            if (hasSub) {
              const subDir = item.direction || dir;
              return (
                <div
                  key={item.key}
                  className={`${base}__action`}
                  role="menuitem"
                  style={stagger}
                >
                  <div className={base} style={{ position: "relative" }}>
                    <div
                      className={[
                        `${base}__trigger`,
                        isSubOpen && `${base}__trigger--open`,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {item.label ? (
                        <Tooltip
                          content={item.label}
                          position={
                            dir === "up" || dir === "down" ? "left" : "top"
                          }
                        >
                          <Button
                            iconLeft={item.icon}
                            severity={item.severity || "secondary"}
                            buttonType={item.buttonType || "filled"}
                            size={actionSize}
                            rounded
                            disabled={isDis}
                            onClick={() => !isDis && toggleSub(item.key)}
                            ariaLabel={item.label}
                            aria-expanded={isSubOpen}
                            aria-haspopup="menu"
                          />
                        </Tooltip>
                      ) : (
                        <Button
                          iconLeft={item.icon}
                          severity={item.severity || "secondary"}
                          buttonType={item.buttonType || "filled"}
                          size={actionSize}
                          rounded
                          disabled={isDis}
                          onClick={() => !isDis && toggleSub(item.key)}
                          ariaLabel={item.label}
                          aria-expanded={isSubOpen}
                          aria-haspopup="menu"
                        />
                      )}
                    </div>
                    {renderItems(item.items!, subDir, isSubOpen)}
                  </div>
                </div>
              );
            }

            const btn = (
              <Button
                iconLeft={item.icon}
                severity={item.severity || "secondary"}
                buttonType={item.buttonType || "filled"}
                size={actionSize}
                rounded
                disabled={isDis}
                onClick={() => {
                  item.command?.();
                  close();
                }}
                ariaLabel={item.label}
                className={item.className}
              />
            );

            return (
              <div
                key={item.key}
                className={`${base}__action`}
                role="menuitem"
                style={stagger}
              >
                {item.label ? (
                  <Tooltip
                    content={item.label}
                    position={dir === "up" || dir === "down" ? "left" : "top"}
                  >
                    {btn}
                  </Tooltip>
                ) : (
                  btn
                )}
              </div>
            );
          })}
        </div>
      );
    };

    const triggerIcon = (() => {
      if (isOpen && !rotateAnimation && activeIcon) return activeIcon;
      if (isOpen && !rotateAnimation) return defaultIcon(TIMES_PATH);
      return icon || defaultIcon(PLUS_PATH);
    })();

    const triggerCls = [
      `${base}__trigger`,
      isOpen && rotateAnimation && `${base}__trigger--open`,
    ]
      .filter(Boolean)
      .join(" ");

    const hoverProps =
      triggerOn === "hover"
        ? {
            onMouseEnter: () => !disabled && setOpen(true),
            onMouseLeave: () => setOpen(false),
          }
        : {};

    // Root level uses layout (quarter or linear)
    const rootActionsCls = [
      `${base}__actions`,
      isQuarter
        ? `${base}__actions--${layout}`
        : `${base}__actions--${direction}`,
      isOpen && `${base}__actions--visible`,
    ]
      .filter(Boolean)
      .join(" ");

    const rootVisible = items.filter(i => i.key);

    return (
      <div
        ref={containerRef}
        className={`${base} ${className}`.trim()}
        style={style}
        {...hoverProps}
      >
        <div className={triggerCls}>
          <Button
            iconLeft={triggerIcon}
            severity={severity}
            buttonType={buttonType}
            size={size}
            rounded
            disabled={disabled}
            onClick={triggerOn === "click" ? toggle : undefined}
            ariaLabel={ariaLabel}
            aria-expanded={isOpen}
            aria-haspopup="menu"
          />
        </div>

        <div className={rootActionsCls} role="menu" aria-label={ariaLabel}>
          {rootVisible.map((item, i) => {
            const stagger: React.CSSProperties = {
              "--k-dial-i": i,
              ...(isQuarter
                ? getQuarterStyle(i, rootVisible.length)
                : item.style),
            } as React.CSSProperties;

            const hasSub = item.items && item.items.length > 0;
            const isSubOpen = expanded.has(item.key);
            const isDis = item.disabled || disabled;

            if (hasSub) {
              const subDir = item.direction || direction;
              return (
                <div
                  key={item.key}
                  className={`${base}__action`}
                  role="menuitem"
                  style={stagger}
                >
                  <div className={base} style={{ position: "relative" }}>
                    <div
                      className={[
                        `${base}__trigger`,
                        isSubOpen && `${base}__trigger--open`,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {item.label ? (
                        <Tooltip
                          content={item.label}
                          position={
                            direction === "up" || direction === "down"
                              ? "left"
                              : "top"
                          }
                        >
                          <Button
                            iconLeft={item.icon}
                            severity={item.severity || "secondary"}
                            buttonType={item.buttonType || "filled"}
                            size={actionSize}
                            rounded
                            disabled={isDis}
                            onClick={() => !isDis && toggleSub(item.key)}
                            ariaLabel={item.label}
                            aria-expanded={isSubOpen}
                            aria-haspopup="menu"
                          />
                        </Tooltip>
                      ) : (
                        <Button
                          iconLeft={item.icon}
                          severity={item.severity || "secondary"}
                          buttonType={item.buttonType || "filled"}
                          size={actionSize}
                          rounded
                          disabled={isDis}
                          onClick={() => !isDis && toggleSub(item.key)}
                          ariaLabel={item.label}
                          aria-expanded={isSubOpen}
                          aria-haspopup="menu"
                        />
                      )}
                    </div>
                    {renderItems(item.items!, subDir, isSubOpen)}
                  </div>
                </div>
              );
            }

            const btn = (
              <Button
                iconLeft={item.icon}
                severity={item.severity || "secondary"}
                buttonType={item.buttonType || "filled"}
                size={actionSize}
                rounded
                disabled={isDis}
                onClick={() => {
                  item.command?.();
                  close();
                }}
                ariaLabel={item.label}
                className={item.className}
                style={isQuarter ? undefined : item.style}
              />
            );

            return (
              <div
                key={item.key}
                className={`${base}__action`}
                role="menuitem"
                style={stagger}
              >
                {item.label ? (
                  <Tooltip
                    content={item.label}
                    position={
                      direction === "up" || direction === "down"
                        ? "left"
                        : "top"
                    }
                  >
                    {btn}
                  </Tooltip>
                ) : (
                  btn
                )}
              </div>
            );
          })}
        </div>

        {mask && isOpen && (
          <div className={`${base}__mask`} aria-hidden="true" onClick={close} />
        )}
      </div>
    );
  }
);

SpeedDial.displayName = "SpeedDial";
