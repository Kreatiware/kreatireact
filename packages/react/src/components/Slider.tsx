import React, {
  useId,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  useMemo,
  useEffect,
} from "react";
import { useKreatiLocale } from "../locale";
import { FieldWrapper } from "./FieldWrapper";
import "./Slider.css";

/** Mark position on the slider track */
export interface SliderMark {
  /** Numeric value where the mark appears */
  value: number;
  /** Optional label displayed below/beside the mark */
  label?: string;
}

export interface SliderProps {
  /** Current value — number for single, [number, number] for range (controlled) */
  value?: number | [number, number];
  /** Default value (uncontrolled) */
  defaultValue?: number | [number, number];
  /** Fires when value changes */
  onChange?: (value: number | [number, number]) => void;
  /** Fires on drag end — useful for expensive operations */
  onChangeEnd?: (value: number | [number, number]) => void;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment — 0 for continuous */
  step?: number;
  /** Enable range mode with two thumbs */
  range?: boolean;
  /** Orientation */
  orientation?: "horizontal" | "vertical";
  /** Mark positions on the track */
  marks?: SliderMark[];
  /** When to show the value tooltip */
  showTooltip?: "always" | "hover" | "never";
  /** Custom format for the tooltip value */
  tooltipFormat?: (value: number) => string;
  /**
   * Custom render for the thumb.
   *
   * @param value - Current value of this thumb
   * @param index - 0 for single/range-start, 1 for range-end
   * @returns ReactNode to render as the thumb
   */
  thumbTemplate?: (value: number, index: number) => React.ReactNode;
  /**
   * Custom render for a mark.
   *
   * @param mark - The SliderMark object
   * @param active - Whether this mark is within the active range
   * @returns ReactNode to render as the mark
   */
  markTemplate?: (mark: SliderMark, active: boolean) => React.ReactNode;
  /**
   * Custom render for the track fill (active range).
   *
   * @param percent - Start percentage, end percentage
   * @returns ReactNode to render inside the track
   */
  trackTemplate?: (startPercent: number, endPercent: number) => React.ReactNode;
  /** Visual variant for label/error/helper */
  variant?: "stacked";
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
  /** Full width mode */
  fullWidth?: boolean;
  /** Maximum width (CSS value, e.g. '400px', '80%') */
  maxWidth?: string | number;
  /** Minimum width (CSS value) */
  minWidth?: string | number;
  /** Explicit width (CSS value) */
  width?: string | number;
  /** Explicit height — useful for vertical orientation (CSS value) */
  height?: string | number;
  /** HTML name attribute — Formik compatible */
  name?: string;
  /** Blur handler — Formik compatible */
  onBlur?: () => void;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * Slider component for numeric value selection.
 *
 * @description A versatile slider supporting single and range selection,
 * horizontal and vertical orientations, marks with labels, value tooltips,
 * custom templates for thumb/mark/track, 5 sizes, error/success states,
 * and full keyboard navigation. Compatible with Formik via name, value,
 * onChange, onBlur. Implements ARIA slider pattern with aria-valuenow,
 * aria-valuemin, aria-valuemax, and aria-orientation.
 *
 * @example
 * ```tsx
 * <Slider label="Volume" min={0} max={100} />
 * <Slider range min={0} max={1000} step={50} marks={[{ value: 0, label: '0' }, { value: 1000, label: '1K' }]} />
 * <Slider orientation="vertical" showTooltip="always" />
 * ```
 */
export const Slider = ({
  value: controlledValue,
  defaultValue,
  onChange,
  onChangeEnd,
  min = 0,
  max = 100,
  step = 1,
  range = false,
  orientation = "horizontal",
  marks,
  showTooltip = "hover",
  tooltipFormat,
  thumbTemplate,
  markTemplate,
  trackTemplate,
  variant = "stacked",
  size = "md",
  label,
  helperText,
  error,
  success = false,
  helperSeverity,
  disabled = false,
  readOnly = false,
  required = false,
  fullWidth = false,
  maxWidth,
  minWidth,
  width,
  height,
  name,
  onBlur,
  className = "",
  style,
  ref,
}: SliderProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const autoId = useId();
  const sliderId = name || autoId;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => wrapperRef.current as HTMLDivElement);

  const kreatiLocale = useKreatiLocale();

  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<number | [number, number]>(
    defaultValue ?? (range ? [min, min] : min)
  );
  const val = isControlled ? controlledValue! : internalValue;

  const [dragging, setDragging] = useState<number | null>(null);
  const [hoveredThumb, setHoveredThumb] = useState<number | null>(null);

  const isHorizontal = orientation === "horizontal";
  const hasError = !!error;
  const errorMessage = typeof error === "boolean" ? undefined : error;
  const base = "k-slider";

  const helperId = `${sliderId}-helper`;
  const errorId = `${sliderId}-error`;
  const describedBy =
    [hasError && errorId, helperText && helperId].filter(Boolean).join(" ") ||
    undefined;

  const getValues = useCallback((): [number, number] => {
    if (range && Array.isArray(val)) return val as [number, number];
    const v = typeof val === "number" ? val : (val as [number, number])[0];
    return [min, v];
  }, [val, range, min]);

  const snap = useCallback(
    (v: number): number => {
      if (step <= 0) return Math.max(min, Math.min(max, v));
      const snapped = Math.round((v - min) / step) * step + min;
      return Math.max(min, Math.min(max, parseFloat(snapped.toFixed(10))));
    },
    [min, max, step]
  );

  const toPercent = useCallback(
    (v: number): number => {
      if (max === min) return 0;
      return ((v - min) / (max - min)) * 100;
    },
    [min, max]
  );

  const fromPosition = useCallback(
    (clientX: number, clientY: number): number => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) return min;
      let ratio: number;
      if (isHorizontal) {
        ratio = (clientX - rect.left) / rect.width;
      } else {
        ratio = 1 - (clientY - rect.top) / rect.height;
      }
      ratio = Math.max(0, Math.min(1, ratio));
      return snap(min + ratio * (max - min));
    },
    [min, max, isHorizontal, snap]
  );

  const updateValue = useCallback(
    (next: number | [number, number]) => {
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    },
    [isControlled, onChange]
  );

  const setThumbValue = useCallback(
    (thumbIndex: number, newVal: number) => {
      if (readOnly) return;
      if (range) {
        const [lo, hi] = getValues();
        if (thumbIndex === 0) {
          updateValue([Math.min(newVal, hi), hi]);
        } else {
          updateValue([lo, Math.max(newVal, lo)]);
        }
      } else {
        updateValue(newVal);
      }
    },
    [range, getValues, updateValue, readOnly]
  );

  const closestThumb = useCallback(
    (v: number): number => {
      if (!range) return 0;
      const [lo, hi] = getValues();
      return Math.abs(v - lo) <= Math.abs(v - hi) ? 0 : 1;
    },
    [range, getValues]
  );

  const handleTrackClick = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (disabled || readOnly) return;
      const { clientX, clientY } = "touches" in e ? e.touches[0] : e;
      const v = fromPosition(clientX, clientY);
      const idx = closestThumb(v);
      setThumbValue(idx, v);
      onChangeEnd?.(
        range ? (idx === 0 ? [v, getValues()[1]] : [getValues()[0], v]) : v
      );
    },
    [
      disabled,
      readOnly,
      fromPosition,
      closestThumb,
      setThumbValue,
      onChangeEnd,
      range,
      getValues,
    ]
  );

  const handleDragStart = useCallback(
    (thumbIndex: number) => (e: React.MouseEvent | React.TouchEvent) => {
      if (disabled || readOnly) return;
      e.preventDefault();
      setDragging(thumbIndex);
    },
    [disabled, readOnly]
  );

  useEffect(() => {
    if (dragging === null) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const { clientX, clientY } = "touches" in e ? e.touches[0] : e;
      const v = fromPosition(clientX, clientY);
      setThumbValue(dragging, v);
    };

    const handleUp = () => {
      setDragging(null);
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
  }, [dragging, fromPosition, setThumbValue, onChangeEnd, onBlur, val]);

  const handleKeyDown = useCallback(
    (thumbIndex: number) => (e: React.KeyboardEvent) => {
      if (disabled || readOnly) return;
      const [lo, hi] = getValues();
      const current =
        thumbIndex === 0 && range
          ? lo
          : range
            ? hi
            : typeof val === "number"
              ? val
              : lo;
      const s = step || 1;
      const bigStep = (max - min) / 10;
      let next = current;

      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
          e.preventDefault();
          next = snap(current + s);
          break;
        case "ArrowLeft":
        case "ArrowDown":
          e.preventDefault();
          next = snap(current - s);
          break;
        case "PageUp":
          e.preventDefault();
          next = snap(current + bigStep);
          break;
        case "PageDown":
          e.preventDefault();
          next = snap(current - bigStep);
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

      setThumbValue(thumbIndex, next);
      onChangeEnd?.(
        range ? (thumbIndex === 0 ? [next, hi] : [lo, next]) : next
      );
    },
    [
      disabled,
      readOnly,
      getValues,
      range,
      val,
      step,
      min,
      max,
      snap,
      setThumbValue,
      onChangeEnd,
    ]
  );

  const [lo, hi] = getValues();
  const loPercent = toPercent(range ? lo : min);
  const hiPercent = toPercent(range ? hi : typeof val === "number" ? val : hi);

  const formatValue = tooltipFormat || ((v: number) => String(v));

  const isTooltipVisible = (idx: number) => {
    if (showTooltip === "always") return true;
    if (showTooltip === "never") return false;
    return dragging === idx || hoveredThumb === idx;
  };

  const containerClasses = [
    base,
    `${base}--${orientation}`,
    `${base}--${size}`,
    disabled && `${base}--disabled`,
    hasError && `${base}--error`,
    !hasError && success && `${base}--success`,
    fullWidth && `${base}--full-width`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const containerStyle = useMemo((): React.CSSProperties | undefined => {
    const s: React.CSSProperties = {};
    if (maxWidth) s.maxWidth = maxWidth;
    if (minWidth) s.minWidth = minWidth;
    if (width) s.width = width;
    if (height) s.height = height;
    return Object.keys(s).length ? s : undefined;
  }, [maxWidth, minWidth, width, height]);

  const renderThumb = (
    thumbIndex: number,
    thumbValue: number,
    percent: number
  ) => {
    const posStyle: React.CSSProperties = isHorizontal
      ? { left: `${percent}%` }
      : { bottom: `${percent}%` };

    const tooltipVisible = isTooltipVisible(thumbIndex);

    return (
      <div
        key={thumbIndex}
        className={`${base}__thumb ${thumbTemplate ? `${base}__thumb--custom` : ""}`}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-valuenow={thumbValue}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={tooltipFormat ? formatValue(thumbValue) : undefined}
        aria-orientation={orientation}
        aria-disabled={disabled || undefined}
        aria-readonly={readOnly || undefined}
        aria-label={
          label
            ? `${label}${range ? ` ${thumbIndex === 0 ? kreatiLocale.slider.rangeMin : kreatiLocale.slider.rangeMax}` : ""}`
            : undefined
        }
        aria-describedby={describedBy}
        style={posStyle}
        onMouseDown={handleDragStart(thumbIndex)}
        onTouchStart={handleDragStart(thumbIndex)}
        onKeyDown={handleKeyDown(thumbIndex)}
        onMouseEnter={() => setHoveredThumb(thumbIndex)}
        onMouseLeave={() => setHoveredThumb(null)}
        onBlur={dragging === null ? onBlur : undefined}
      >
        {thumbTemplate ? thumbTemplate(thumbValue, thumbIndex) : null}
        {showTooltip !== "never" && (
          <div
            className={`${base}__tooltip ${tooltipVisible ? `${base}__tooltip--visible` : ""}`}
          >
            {formatValue(thumbValue)}
          </div>
        )}
      </div>
    );
  };

  const rangeStyle: React.CSSProperties = isHorizontal
    ? { left: `${loPercent}%`, width: `${hiPercent - loPercent}%` }
    : { bottom: `${loPercent}%`, height: `${hiPercent - loPercent}%` };

  const isMarkActive = (markValue: number): boolean => {
    if (range) return markValue >= lo && markValue <= hi;
    return markValue <= (typeof val === "number" ? val : hi);
  };

  const hasWrapper = !!(label || helperText || errorMessage);

  const hiddenInput = name ? (
    <input
      type="hidden"
      name={name}
      value={range ? `${lo},${hi}` : String(typeof val === "number" ? val : lo)}
    />
  ) : null;

  const sliderEl = (
    <div ref={wrapperRef} className={containerClasses} style={containerStyle}>
      <div
        ref={trackRef}
        className={`${base}__track-wrapper`}
        onClick={handleTrackClick}
      >
        <div className={`${base}__track`}>
          {trackTemplate ? (
            trackTemplate(loPercent, hiPercent)
          ) : (
            <div className={`${base}__range`} style={rangeStyle} />
          )}
        </div>
        {range && renderThumb(0, lo, loPercent)}
        {renderThumb(
          range ? 1 : 0,
          range ? hi : typeof val === "number" ? val : hi,
          hiPercent
        )}
      </div>
      {marks && marks.length > 0 && (
        <div className={`${base}__marks`}>
          {marks.map(mark => {
            const active = isMarkActive(mark.value);
            const pos = toPercent(mark.value);
            const posStyle: React.CSSProperties = isHorizontal
              ? { left: `${pos}%` }
              : { bottom: `${pos}%` };

            if (markTemplate) {
              return (
                <div
                  key={mark.value}
                  className={`${base}__mark`}
                  style={posStyle}
                >
                  {markTemplate(mark, active)}
                </div>
              );
            }

            return (
              <div
                key={mark.value}
                className={`${base}__mark`}
                style={posStyle}
              >
                <span
                  className={`${base}__mark-dot ${active ? `${base}__mark-dot--active` : ""}`}
                />
                {mark.label && (
                  <span className={`${base}__mark-label`}>{mark.label}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
      {hiddenInput}
    </div>
  );

  if (!hasWrapper) return sliderEl;

  return (
    <FieldWrapper
      style={style}
      label={label}
      htmlFor={sliderId}
      required={required}
      helperText={helperText}
      error={errorMessage}
      success={success}
      helperSeverity={helperSeverity}
      size={size}
      disabled={disabled}
      fullWidth={isHorizontal || fullWidth}
    >
      {sliderEl}
    </FieldWrapper>
  );
};
