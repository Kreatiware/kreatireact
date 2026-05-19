import React, { useState, useRef, useEffect, useCallback } from "react";
import "./SegmentedControl.css";

export interface SegmentedControlOption {
  /** Unique value */
  value: string | number;
  /** Text label */
  label?: string;
  /** Icon element */
  icon?: React.ReactNode;
  /** Disable this option */
  disabled?: boolean;
  /** Custom className per option */
  className?: string;
  /** Custom style per option */
  style?: React.CSSProperties;
}

export interface SegmentedControlProps {
  /** Options to display */
  options: SegmentedControlOption[];
  /** Controlled value */
  value?: string | number;
  /** Default value (uncontrolled) */
  defaultValue?: string | number;
  /** Fires when selection changes */
  onChange?: (value: string | number) => void;
  /** Visual variant. 'default' = severity-colored pill + white text, 'subtle' = white pill + colored text. Default: 'default' */
  variant?: "default" | "subtle";
  /** Size variant. Default: 'md' */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Severity color for the active indicator. Default: 'primary' */
  severity?:
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "help"
    | "danger"
    | "accent";
  /** Stretch to fill container width. Default: false */
  fullWidth?: boolean;
  /** Disable all options. Default: false */
  disabled?: boolean;
  /** Use fully rounded (pill) shape. Default: false */
  rounded?: boolean;
  /** Reduce vertical padding for compact layouts. Default: false */
  slim?: boolean;
  /** Hidden input name for form compatibility */
  name?: string;
  /** Custom render for the sliding pill indicator */
  pillTemplate?: (
    activeIndex: number,
    pillStyle: React.CSSProperties
  ) => React.ReactNode;
  /** Custom render for each option. Receives option, index, and active state. */
  optionTemplate?: (
    option: SegmentedControlOption,
    index: number,
    active: boolean
  ) => React.ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * SegmentedControl component for mutually exclusive option selection.
 * Features a sliding pill indicator that animates between options.
 *
 * @example
 * ```tsx
 * <SegmentedControl
 *   options={[
 *     { label: 'Grid', value: 'grid', icon: <Grid /> },
 *     { label: 'List', value: 'list', icon: <ListIcon /> },
 *   ]}
 *   value="grid"
 *   onChange={(v) => setValue(v)}
 * />
 * ```
 */
export const SegmentedControl = ({
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  variant = "default",
  size = "md",
  severity = "primary",
  fullWidth = false,
  disabled = false,
  rounded = false,
  slim = false,
  name,
  pillTemplate,
  optionTemplate,
  className,
  style,
  ref,
}: SegmentedControlProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? options[0]?.value
  );
  const activeValue = isControlled ? controlledValue : internalValue;

  const containerRef = useRef<HTMLDivElement>(null);
  const [pillStyle, setPillStyle] = useState<React.CSSProperties>({});

  const activeIndex = options.findIndex(o => o.value === activeValue);

  const updatePill = useCallback(() => {
    const container = containerRef.current;
    if (!container || activeIndex < 0) return;
    const btn = container.querySelectorAll<HTMLButtonElement>(
      ".k-segmented__option"
    )[activeIndex];
    if (!btn) return;
    setPillStyle({
      width: btn.offsetWidth,
      transform: `translateX(${btn.offsetLeft}px)`,
    });
  }, [activeIndex]);

  useEffect(() => {
    updatePill();
    const ro = new ResizeObserver(updatePill);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [updatePill]);

  const handleSelect = (opt: SegmentedControlOption) => {
    if (opt.disabled || disabled) return;
    if (!isControlled) setInternalValue(opt.value);
    onChange?.(opt.value);
  };

  return (
    <div
      ref={ref}
      className={[
        "k-segmented",
        `k-segmented--${size}`,
        `k-segmented--${severity}`,
        `k-segmented--${variant}`,
        fullWidth && "k-segmented--full-width",
        disabled && "k-segmented--disabled",
        rounded && "k-segmented--rounded",
        slim && "k-segmented--slim",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      role="radiogroup"
      aria-disabled={disabled || undefined}
    >
      <div className="k-segmented__track" ref={containerRef}>
        {activeIndex >= 0 &&
          (pillTemplate ? (
            pillTemplate(activeIndex, pillStyle)
          ) : (
            <div
              className="k-segmented__pill"
              style={pillStyle}
              aria-hidden="true"
            />
          ))}
        {options.map((opt, i) => {
          const isActive = opt.value === activeValue;
          return (
            <button
              key={opt.value}
              type="button"
              className={[
                "k-segmented__option",
                isActive && "k-segmented__option--active",
                opt.disabled && "k-segmented__option--disabled",
                opt.className,
              ]
                .filter(Boolean)
                .join(" ")}
              style={opt.style}
              role="radio"
              aria-checked={isActive}
              aria-disabled={opt.disabled || disabled || undefined}
              tabIndex={isActive ? 0 : -1}
              disabled={opt.disabled || disabled}
              onClick={() => handleSelect(opt)}
              onKeyDown={e => {
                const len = options.length;
                let next = -1;
                if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                  e.preventDefault();
                  for (let j = 1; j < len; j++) {
                    const idx = (activeIndex + j) % len;
                    if (!options[idx].disabled) {
                      next = idx;
                      break;
                    }
                  }
                } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                  e.preventDefault();
                  for (let j = 1; j < len; j++) {
                    const idx = (activeIndex - j + len) % len;
                    if (!options[idx].disabled) {
                      next = idx;
                      break;
                    }
                  }
                } else if (e.key === "Home") {
                  e.preventDefault();
                  next = options.findIndex(o => !o.disabled);
                } else if (e.key === "End") {
                  e.preventDefault();
                  for (let j = len - 1; j >= 0; j--) {
                    if (!options[j].disabled) {
                      next = j;
                      break;
                    }
                  }
                }
                if (next >= 0) {
                  handleSelect(options[next]);
                  const btns =
                    containerRef.current?.querySelectorAll<HTMLButtonElement>(
                      ".k-segmented__option"
                    );
                  btns?.[next]?.focus();
                }
              }}
            >
              {optionTemplate ? (
                optionTemplate(opt, i, isActive)
              ) : (
                <>
                  {opt.icon && (
                    <span className="k-segmented__icon" aria-hidden="true">
                      {opt.icon}
                    </span>
                  )}
                  {opt.label && (
                    <span className="k-segmented__label">{opt.label}</span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>
      {name && <input type="hidden" name={name} value={activeValue ?? ""} />}
    </div>
  );
};
