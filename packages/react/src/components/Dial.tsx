import React, {
  forwardRef,
  useId,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  useEffect,
} from "react";
import { useKreatiLocale } from "../locale";
import { FieldWrapper } from "./FieldWrapper";
import "./Dial.css";

export interface DialProps {
  /** Current value (controlled) */
  value?: number;
  /** Default value (uncontrolled) */
  defaultValue?: number;
  /** Fires when value changes */
  onChange?: (value: number) => void;
  /** Fires on interaction end */
  onChangeEnd?: (value: number) => void;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment — 0 for continuous */
  step?: number;
  /** SVG stroke width for the arc */
  strokeWidth?: number;
  /** Color of the value arc — CSS value or Kreati variable */
  valueColor?: string;
  /** Color of the range (background) arc */
  rangeColor?: string;
  /** Show the numeric value in the center */
  showValue?: boolean;
  /** Show min and max labels at the arc endpoints */
  showMinMax?: boolean;
  /** Allow mouse wheel / scroll to change value */
  scrollable?: boolean;
  /** Explicit width (CSS value, e.g. '200px', '100%') — overrides size */
  width?: string | number;
  /** Explicit height (CSS value) — overrides size */
  height?: string | number;
  /**
   * Custom render for the center area.
   * Receives current value, renders as HTML overlay centered on the dial.
   *
   * @param value - Current numeric value
   * @returns ReactNode displayed in the center of the dial
   */
  valueTemplate?: (value: number) => React.ReactNode;
  /**
   * Custom render for the track (replaces both range and value arcs).
   * Receives SVG geometry to build custom arcs, gradients, etc.
   *
   * @param props - Object with radius, strokeWidth, rangePath, valuePath, center, viewBox, percent
   * @returns ReactNode (SVG elements) to render as the track
   */
  trackTemplate?: (props: {
    radius: number;
    strokeWidth: number;
    rangePath: string;
    valuePath: string;
    center: number;
    viewBox: number;
    percent: number;
  }) => React.ReactNode;
  /**
   * Custom render for a thumb at the current value position.
   *
   * @param props - Object with x, y coordinates and current value
   * @returns ReactNode (SVG elements) to render as the thumb
   */
  thumbTemplate?: (props: {
    x: number;
    y: number;
    value: number;
  }) => React.ReactNode;
  /** Component size */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: React.ReactNode;
  /** Error message or boolean */
  error?: React.ReactNode | boolean;
  /** Success state */
  success?: boolean;
  /** Helper severity */
  helperSeverity?:
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "help"
    | "danger"
    | "accent";
  /** Disabled state */
  disabled?: boolean;
  /** Read-only state */
  readOnly?: boolean;
  /** Required indicator */
  required?: boolean;
  /** HTML name attribute — Formik compatible */
  name?: string;
  /** Blur handler — Formik compatible */
  onBlur?: () => void;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

const ARC_START = 135;
const ARC_SPAN = 270;
const VIEW = 100;
const CENTER = VIEW / 2;

const polarToXY = (angleDeg: number, r: number): [number, number] => {
  const rad = (angleDeg * Math.PI) / 180;
  return [CENTER + r * Math.cos(rad), CENTER + r * Math.sin(rad)];
};

const describeArc = (
  r: number,
  startAngle: number,
  endAngle: number
): string => {
  if (endAngle <= startAngle) return "";
  const [sx, sy] = polarToXY(startAngle, r);
  const [ex, ey] = polarToXY(endAngle, r);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey}`;
};

/**
 * Dial component for circular numeric value selection.
 *
 * @description A circular input rendered as an SVG arc. The user drags
 * around the arc or uses keyboard arrows to change the value. Supports
 * custom track/thumb/value templates, min/max labels, custom colors and
 * stroke width, explicit width/height or 5 preset sizes, FieldWrapper
 * integration, and full keyboard navigation. Compatible with Formik and
 * React Hook Form via name, value, onChange, onBlur.
 *
 * @example
 * ```tsx
 * <Dial label="Volume" min={0} max={100} />
 * <Dial value={75} showMinMax valueTemplate={(v) => <strong>{v}%</strong>} />
 * <Dial width="100%" min={20} max={50} />
 * ```
 */
export const Dial = forwardRef<HTMLDivElement, DialProps>(
  (
    {
      value: controlledValue,
      defaultValue = 0,
      onChange,
      onChangeEnd,
      min = 0,
      max = 100,
      step = 1,
      strokeWidth,
      valueColor,
      rangeColor,
      showValue = true,
      showMinMax = false,
      scrollable = false,
      width,
      height,
      valueTemplate,
      trackTemplate,
      thumbTemplate,
      size = "md",
      label,
      helperText,
      error,
      success = false,
      helperSeverity,
      disabled = false,
      readOnly = false,
      required = false,
      name,
      onBlur,
      className = "",
      style,
    },
    ref
  ) => {
    const autoId = useId();
    const dialId = name || autoId;
    const wrapperRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    useImperativeHandle(ref, () => wrapperRef.current as HTMLDivElement);

    const locale = useKreatiLocale();
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue);
    const val = isControlled ? controlledValue! : internalValue;
    const [dragging, setDragging] = useState(false);

    const hasError = !!error;
    const errorMessage = typeof error === "boolean" ? undefined : error;
    const base = "k-dial";
    const hasCustomSize = width !== undefined || height !== undefined;

    const resolvedStroke = strokeWidth ?? 10;
    const radius = (VIEW - resolvedStroke) / 2;
    const percent = max === min ? 0 : ((val - min) / (max - min)) * 100;

    const snap = useCallback(
      (v: number): number => {
        if (step <= 0) return Math.max(min, Math.min(max, v));
        const snapped = Math.round((v - min) / step) * step + min;
        return Math.max(min, Math.min(max, parseFloat(snapped.toFixed(10))));
      },
      [min, max, step]
    );

    const valueToAngle = useCallback(
      (v: number): number => {
        if (max === min) return ARC_START;
        return ARC_START + ((v - min) / (max - min)) * ARC_SPAN;
      },
      [min, max]
    );

    const angleToValue = useCallback(
      (angleDeg: number): number => {
        let a = angleDeg - ARC_START;
        if (a < 0) a += 360;
        if (a > ARC_SPAN)
          a = a > ARC_SPAN + (360 - ARC_SPAN) / 2 ? 0 : ARC_SPAN;
        return snap(min + (a / ARC_SPAN) * (max - min));
      },
      [min, max, snap]
    );

    const updateValue = useCallback(
      (next: number) => {
        if (readOnly) return;
        if (!isControlled) setInternalValue(next);
        onChange?.(next);
      },
      [isControlled, onChange, readOnly]
    );

    const getAngleFromEvent = useCallback(
      (clientX: number, clientY: number): number => {
        const svg = svgRef.current;
        if (!svg) return 0;
        const rect = svg.getBoundingClientRect();
        const dx = clientX - (rect.left + rect.width / 2);
        const dy = clientY - (rect.top + rect.height / 2);
        let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        if (angle < 0) angle += 360;
        return angle;
      },
      []
    );

    const handleInteraction = useCallback(
      (clientX: number, clientY: number) => {
        if (disabled || readOnly) return;
        updateValue(angleToValue(getAngleFromEvent(clientX, clientY)));
      },
      [disabled, readOnly, getAngleFromEvent, angleToValue, updateValue]
    );

    const handleMouseDown = useCallback(
      (e: React.MouseEvent) => {
        if (disabled || readOnly) return;
        e.preventDefault();
        setDragging(true);
        handleInteraction(e.clientX, e.clientY);
      },
      [disabled, readOnly, handleInteraction]
    );

    const handleTouchStart = useCallback(
      (e: React.TouchEvent) => {
        if (disabled || readOnly) return;
        e.preventDefault();
        setDragging(true);
        handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
      },
      [disabled, readOnly, handleInteraction]
    );

    const handleWheel = useCallback(
      (e: WheelEvent) => {
        if (disabled || readOnly || !scrollable) return;
        e.preventDefault();
        const s = step || 1;
        const direction = e.deltaY < 0 ? 1 : -1;
        updateValue(snap(val + direction * s));
      },
      [disabled, readOnly, scrollable, step, val, snap, updateValue]
    );

    useEffect(() => {
      if (!scrollable) return;
      const el = svgRef.current;
      if (!el) return;
      el.addEventListener("wheel", handleWheel, { passive: false });
      return () => el.removeEventListener("wheel", handleWheel);
    }, [scrollable, handleWheel]);

    useEffect(() => {
      if (!dragging) return;
      const handleMove = (e: MouseEvent | TouchEvent) => {
        const { clientX, clientY } = "touches" in e ? e.touches[0] : e;
        handleInteraction(clientX, clientY);
      };
      const handleUp = () => {
        setDragging(false);
        onChangeEnd?.(val);
        onBlur?.();
      };
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
      window.addEventListener("touchmove", handleMove, { passive: false });
      window.addEventListener("touchend", handleUp);
      return () => {
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", handleUp);
        window.removeEventListener("touchmove", handleMove);
        window.removeEventListener("touchend", handleUp);
      };
    }, [dragging, handleInteraction, onChangeEnd, onBlur, val]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (disabled || readOnly) return;
        const s = step || 1;
        const bigStep = (max - min) / 10;
        let next = val;
        switch (e.key) {
          case "ArrowRight":
          case "ArrowUp":
            e.preventDefault();
            next = snap(val + s);
            break;
          case "ArrowLeft":
          case "ArrowDown":
            e.preventDefault();
            next = snap(val - s);
            break;
          case "PageUp":
            e.preventDefault();
            next = snap(val + bigStep);
            break;
          case "PageDown":
            e.preventDefault();
            next = snap(val - bigStep);
            break;
          case "Home":
            e.preventDefault();
            next = min;
            break;
          case "End":
            e.preventDefault();
            next = max;
            break;
          default:
            return;
        }
        updateValue(next);
        onChangeEnd?.(next);
      },
      [disabled, readOnly, val, step, min, max, snap, updateValue, onChangeEnd]
    );

    // Arc geometry
    const endAngle = valueToAngle(val);
    const rangePath = describeArc(radius, ARC_START, ARC_START + ARC_SPAN);

    // Bidirectional: if range spans zero, value arc starts from zero point
    const hasZeroCrossing = min < 0 && max > 0;
    const zeroAngle = hasZeroCrossing ? valueToAngle(0) : ARC_START;
    const valuePath = hasZeroCrossing
      ? val >= 0
        ? describeArc(radius, zeroAngle, endAngle)
        : describeArc(radius, endAngle, zeroAngle)
      : describeArc(radius, ARC_START, endAngle);

    const [thumbX, thumbY] = polarToXY(endAngle, radius);

    // Min/max labels — fixed positions below arc endpoints
    const [minEX, minEY] = polarToXY(ARC_START, radius);
    const [maxEX, maxEY] = polarToXY(ARC_START + ARC_SPAN, radius);
    const minMaxYOffset = resolvedStroke / 2 + 8;

    const helperId = `${dialId}-helper`;
    const errorId = `${dialId}-error`;
    const describedBy =
      [hasError && errorId, helperText && helperId].filter(Boolean).join(" ") ||
      undefined;

    const displayText = valueTemplate ? undefined : String(val);
    const ariaText = valueTemplate ? String(val) : displayText;

    const containerClasses = [
      base,
      !hasCustomSize && `${base}--${size}`,
      disabled && `${base}--disabled`,
      hasError && `${base}--error`,
      !hasError && success && `${base}--success`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const containerStyle: React.CSSProperties | undefined = hasCustomSize
      ? { width, height: height ?? width }
      : undefined;

    const svgStyle =
      valueColor || rangeColor
        ? ({
            "--k-dial-value-color": valueColor,
            "--k-dial-range-color": rangeColor,
          } as React.CSSProperties)
        : undefined;

    const dialEl = (
      <div ref={wrapperRef} className={containerClasses} style={containerStyle}>
        <div className={`${base}__wrapper`}>
          <svg
            ref={svgRef}
            className={`${base}__svg`}
            viewBox={`0 0 ${VIEW} ${VIEW}`}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-valuenow={val}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuetext={ariaText}
            aria-label={label ?? locale.dial.ariaLabel}
            aria-disabled={disabled || undefined}
            aria-readonly={readOnly || undefined}
            aria-required={required || undefined}
            aria-describedby={describedBy}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onKeyDown={handleKeyDown}
            onBlur={!dragging ? onBlur : undefined}
            style={svgStyle}
          >
            {trackTemplate ? (
              trackTemplate({
                radius,
                strokeWidth: resolvedStroke,
                rangePath,
                valuePath,
                center: CENTER,
                viewBox: VIEW,
                percent,
              })
            ) : (
              <>
                <path
                  className={`${base}__range`}
                  d={rangePath}
                  fill="none"
                  strokeWidth={resolvedStroke}
                  strokeLinecap="round"
                />
                {valuePath && (
                  <path
                    className={`${base}__value`}
                    d={valuePath}
                    fill="none"
                    strokeWidth={resolvedStroke}
                    strokeLinecap="round"
                  />
                )}
              </>
            )}
            {thumbTemplate &&
              thumbTemplate({ x: thumbX, y: thumbY, value: val })}
            {showMinMax && (
              <>
                <text
                  className={`${base}__min-max`}
                  x={minEX}
                  y={minEY + minMaxYOffset}
                  textAnchor="start"
                >
                  {min}
                </text>
                <text
                  className={`${base}__min-max`}
                  x={maxEX}
                  y={maxEY + minMaxYOffset}
                  textAnchor="end"
                >
                  {max}
                </text>
              </>
            )}
            {showValue && !valueTemplate && (
              <text
                className={`${base}__text`}
                x={CENTER}
                y={CENTER}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {displayText}
              </text>
            )}
          </svg>
          {showValue && valueTemplate && (
            <div className={`${base}__center`}>{valueTemplate(val)}</div>
          )}
        </div>
        {name && <input type="hidden" name={name} value={val} />}
      </div>
    );

    if (!label && !helperText && !errorMessage) return dialEl;

    return (
      <FieldWrapper
        style={style}
        label={label}
        htmlFor={dialId}
        required={required}
        helperText={helperText}
        error={errorMessage}
        success={success}
        helperSeverity={helperSeverity}
        size={size}
        disabled={disabled}
      >
        {dialEl}
      </FieldWrapper>
    );
  }
);

Dial.displayName = "Dial";
