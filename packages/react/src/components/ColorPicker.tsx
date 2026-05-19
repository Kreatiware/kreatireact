import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useImperativeHandle,
  useId,
} from "react";
import { createPortal } from "react-dom";
import { FieldWrapper } from "./FieldWrapper";
import { useOverlayPosition } from "./useOverlayPosition";
import { useLayerZIndex } from "./LayerContext";
import { useKreatiLocale } from "../locale";
import { COPY_PATH, CHECK_PATH } from "./iconPaths";
import "./ColorPicker.css";

/* ── Color conversion helpers ── */

interface HSV {
  h: number;
  s: number;
  v: number;
}
interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const hsvToRgb = (
  h: number,
  s: number,
  v: number
): [number, number, number] => {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
};

const rgbToHsv = (r: number, g: number, b: number): HSV => {
  const r1 = r / 255,
    g1 = g / 255,
    b1 = b / 255;
  const max = Math.max(r1, g1, b1),
    min = Math.min(r1, g1, b1);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r1) h = 60 * (((g1 - b1) / d) % 6);
    else if (max === g1) h = 60 * ((b1 - r1) / d + 2);
    else h = 60 * ((r1 - g1) / d + 4);
  }
  if (h < 0) h += 360;
  return { h, s: max === 0 ? 0 : d / max, v: max };
};

const hexToRgba = (hex: string): RGBA => {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  const a = clean.length === 8 ? parseInt(clean.substring(6, 8), 16) / 255 : 1;
  return { r, g, b, a };
};

const rgbaToHex = (r: number, g: number, b: number, a: number): string => {
  const hex = `#${[r, g, b].map(c => c.toString(16).padStart(2, "0")).join("")}`;
  return a < 1
    ? hex +
        Math.round(a * 255)
          .toString(16)
          .padStart(2, "0")
    : hex;
};

const formatColor = (rgba: RGBA, format: ColorFormat): string => {
  const { r, g, b, a } = rgba;
  switch (format) {
    case "hex":
      return rgbaToHex(r, g, b, a);
    case "rgb":
      return `rgb(${r}, ${g}, ${b})`;
    case "rgba":
      return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
    case "cmyk": {
      const r1 = r / 255,
        g1 = g / 255,
        b1 = b / 255;
      const k = 1 - Math.max(r1, g1, b1);
      if (k === 1) return "cmyk(0%, 0%, 0%, 100%)";
      const c = Math.round(((1 - r1 - k) / (1 - k)) * 100);
      const m = Math.round(((1 - g1 - k) / (1 - k)) * 100);
      const y = Math.round(((1 - b1 - k) / (1 - k)) * 100);
      return `cmyk(${c}%, ${m}%, ${y}%, ${Math.round(k * 100)}%)`;
    }
  }
};

const parseColor = (color: string): RGBA => {
  if (color.startsWith("#")) return hexToRgba(color);
  const rgbaMatch = color.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/
  );
  if (rgbaMatch)
    return {
      r: +rgbaMatch[1],
      g: +rgbaMatch[2],
      b: +rgbaMatch[3],
      a: rgbaMatch[4] !== undefined ? +rgbaMatch[4] : 1,
    };
  const cmykMatch = color.match(
    /cmyk\(\s*(\d+)%?\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)/
  );
  if (cmykMatch) {
    const c = +cmykMatch[1] / 100,
      m = +cmykMatch[2] / 100,
      y = +cmykMatch[3] / 100,
      k = +cmykMatch[4] / 100;
    return {
      r: Math.round(255 * (1 - c) * (1 - k)),
      g: Math.round(255 * (1 - m) * (1 - k)),
      b: Math.round(255 * (1 - y) * (1 - k)),
      a: 1,
    };
  }
  return { r: 0, g: 0, b: 0, a: 1 };
};

type ColorFormat = "hex" | "rgb" | "rgba" | "cmyk";

/* ── Component ── */

export interface ColorPickerProps {
  /** Current color value (controlled) */
  value?: string;
  /** Default color (uncontrolled) */
  defaultValue?: string;
  /** Fires when color changes */
  onChange?: (color: string) => void;
  /** Output format */
  format?: ColorFormat;
  /** Show alpha slider */
  showAlpha?: boolean;
  /** Preset color swatches */
  presets?: string[];
  /** Disabled */
  disabled?: boolean;
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: React.ReactNode;
  /** Error state */
  error?: React.ReactNode | boolean;
  /** Success state */
  success?: boolean;
  /** Required */
  required?: boolean;
  /** Component size */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Full width */
  fullWidth?: boolean;
  /** HTML name */
  name?: string;
  /** Blur handler */
  onBlur?: (e: React.FocusEvent) => void;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

const base = "k-color-picker";

const DEFAULT_PRESETS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#ec4899",
];

/**
 * ColorPicker component with saturation/brightness area, hue bar, alpha bar, and format input.
 *
 * @description A full-featured color picker with a 2D saturation/brightness
 * gradient, hue slider, optional alpha slider, hex/rgb/rgba input with
 * format switching, preset swatches, and FieldWrapper integration.
 * All gradients are rendered with CSS (no canvas). Compatible with
 * Formik and React Hook Form via name, value, onChange, onBlur, ref.
 *
 * @example
 * ```tsx
 * <ColorPicker label="Brand color" value={color} onChange={setColor} />
 * <ColorPicker label="With alpha" showAlpha format="rgba" />
 * ```
 */
export const ColorPicker = ({
  value: controlledValue,
  defaultValue = "#3b82f6",
  onChange,
  format: initialFormat = "hex",
  showAlpha = false,
  presets = DEFAULT_PRESETS,
  disabled = false,
  label,
  helperText,
  error,
  success,
  required,
  size,
  fullWidth,
  name,
  onBlur,
  className = "",
  style,
  ref,
}: ColorPickerProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const elRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const satAreaRef = useRef<HTMLDivElement>(null);
  const hueBarRef = useRef<HTMLDivElement>(null);
  const alphaBarRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => elRef.current as HTMLDivElement);
  const locale = useKreatiLocale();
  const uid = useId();

  const isControlled = controlledValue !== undefined;
  const initRgba = parseColor(isControlled ? controlledValue : defaultValue);
  const initHsv = rgbToHsv(initRgba.r, initRgba.g, initRgba.b);

  const [hsv, setHsv] = useState<HSV>(initHsv);
  const [alpha, setAlpha] = useState(initRgba.a);
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ColorFormat>(initialFormat);
  const [textInput, setTextInput] = useState("");
  const [copied, setCopied] = useState(false);
  const dragging = useRef<"sat" | "hue" | "alpha" | null>(null);

  const zIndex = useLayerZIndex();
  const { coords, positioned } = useOverlayPosition(triggerRef, panelRef, open);

  const [r, g, b] = hsvToRgb(hsv.h, hsv.s, hsv.v);
  const rgba: RGBA = { r, g, b, a: alpha };
  const colorStr = formatColor(rgba, format);
  const displayColor = rgbaToHex(r, g, b, alpha);

  const emitChange = useCallback(
    (newHsv: HSV, newAlpha: number) => {
      const [nr, ng, nb] = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
      onChange?.(formatColor({ r: nr, g: ng, b: nb, a: newAlpha }, format));
    },
    [format, onChange]
  );

  // Sync from controlled value
  useEffect(() => {
    if (!isControlled || !controlledValue) return;
    const parsed = parseColor(controlledValue);
    const newHsv = rgbToHsv(parsed.r, parsed.g, parsed.b);
    setHsv(newHsv);
    setAlpha(parsed.a);
  }, [controlledValue, isControlled]);

  /* ── Drag handlers ── */
  const handleSatMove = useCallback(
    (clientX: number, clientY: number) => {
      const rect = satAreaRef.current?.getBoundingClientRect();
      if (!rect) return;
      const s = clamp((clientX - rect.left) / rect.width, 0, 1);
      const v = clamp(1 - (clientY - rect.top) / rect.height, 0, 1);
      const next = { ...hsv, s, v };
      setHsv(next);
      emitChange(next, alpha);
    },
    [hsv, alpha, emitChange]
  );

  const handleHueMove = useCallback(
    (clientX: number) => {
      const rect = hueBarRef.current?.getBoundingClientRect();
      if (!rect) return;
      const h = clamp((clientX - rect.left) / rect.width, 0, 1) * 360;
      const next = { ...hsv, h };
      setHsv(next);
      emitChange(next, alpha);
    },
    [hsv, alpha, emitChange]
  );

  const handleAlphaMove = useCallback(
    (clientX: number) => {
      const rect = alphaBarRef.current?.getBoundingClientRect();
      if (!rect) return;
      const a = clamp((clientX - rect.left) / rect.width, 0, 1);
      setAlpha(a);
      emitChange(hsv, a);
    },
    [hsv, emitChange]
  );

  useEffect(() => {
    if (!open) return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      const cx = "touches" in e ? e.touches[0].clientX : e.clientX;
      const cy = "touches" in e ? e.touches[0].clientY : e.clientY;
      if (dragging.current === "sat") handleSatMove(cx, cy);
      else if (dragging.current === "hue") handleHueMove(cx);
      else if (dragging.current === "alpha") handleAlphaMove(cx);
    };
    const onUp = () => {
      dragging.current = null;
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchmove", onMove);
    document.addEventListener("touchend", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onUp);
    };
  }, [open, handleSatMove, handleHueMove, handleAlphaMove]);

  /* ── Text input ── */
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setTextInput(val);
      const isValid = val.startsWith("#")
        ? /^#[0-9a-fA-F]{6,8}$/.test(val)
        : /^(rgba?\(|cmyk\()/.test(val);
      if (isValid) {
        const parsed = parseColor(val);
        const newHsv = rgbToHsv(parsed.r, parsed.g, parsed.b);
        setHsv(newHsv);
        setAlpha(parsed.a);
        emitChange(newHsv, parsed.a);
      }
    },
    [emitChange]
  );

  /* ── Open/close ── */
  const toggleOpen = useCallback(() => {
    if (disabled) return;
    setOpen(p => {
      if (!p) setTextInput(colorStr);
      return !p;
    });
  }, [disabled, colorStr]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        elRef.current?.contains(e.target as Node) ||
        panelRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
      onBlur?.(e as unknown as React.FocusEvent);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onBlur]);

  const cycleFormat = useCallback(() => {
    const formats: ColorFormat[] = showAlpha
      ? ["hex", "rgb", "rgba", "cmyk"]
      : ["hex", "rgb", "cmyk"];
    const idx = (formats.indexOf(format) + 1) % formats.length;
    setFormat(formats[idx]);
  }, [format, showAlpha]);

  const handleCopy = useCallback(() => {
    navigator.clipboard
      .writeText(colorStr)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {
        /* clipboard unavailable */
      });
  }, [colorStr]);

  // Update text input when format or color changes (not during typing)
  useEffect(() => {
    if (!open) return;
    setTextInput(colorStr);
  }, [format, hsv.h, hsv.s, hsv.v, alpha]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasError = !!error;
  const errorMessage = typeof error === "boolean" ? undefined : error;

  const [hueR, hueG, hueB] = hsvToRgb(hsv.h, 1, 1);
  const hueColor = `rgb(${hueR},${hueG},${hueB})`;

  const trigger = (
    <div
      ref={triggerRef}
      className={`${base}__trigger${hasError ? ` ${base}__trigger--error` : ""}${!hasError && success ? ` ${base}__trigger--success` : ""}${disabled ? ` ${base}__trigger--disabled` : ""}`}
      onClick={toggleOpen}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleOpen();
        }
      }}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-expanded={open}
      aria-haspopup="true"
      aria-label={label ?? locale.colorPicker.ariaLabel}
      aria-disabled={disabled || undefined}
    >
      <span
        className={`${base}__swatch`}
        style={{ background: displayColor }}
      />
      <span className={`${base}__value`}>{colorStr}</span>
    </div>
  );

  const startDrag =
    (type: "sat" | "hue" | "alpha") =>
    (e: React.MouseEvent | React.TouchEvent) => {
      dragging.current = type;
      const cx = "touches" in e ? e.touches[0].clientX : e.clientX;
      const cy = "touches" in e ? e.touches[0].clientY : e.clientY;
      if (type === "sat") handleSatMove(cx, cy);
      else if (type === "hue") handleHueMove(cx);
      else handleAlphaMove(cx);
    };

  const panel = open
    ? createPortal(
        <div
          ref={panelRef}
          className={`${base}__panel${positioned ? ` ${base}__panel--visible` : ""}`}
          style={{
            top: coords.top,
            left: coords.left,
            zIndex: zIndex.overlay,
          }}
        >
          {/* Saturation/Brightness area */}
          <div
            ref={satAreaRef}
            className={`${base}__sat-area`}
            style={{ background: hueColor }}
            onMouseDown={startDrag("sat")}
            onTouchStart={startDrag("sat")}
            role="slider"
            aria-label={locale.colorPicker.saturation}
            aria-valuetext={`Saturation ${Math.round(hsv.s * 100)}%, Brightness ${Math.round(hsv.v * 100)}%`}
            tabIndex={0}
            onKeyDown={e => {
              const step = 0.02;
              let { s, v } = hsv;
              if (e.key === "ArrowRight") s = clamp(s + step, 0, 1);
              else if (e.key === "ArrowLeft") s = clamp(s - step, 0, 1);
              else if (e.key === "ArrowUp") v = clamp(v + step, 0, 1);
              else if (e.key === "ArrowDown") v = clamp(v - step, 0, 1);
              else return;
              e.preventDefault();
              const next = { ...hsv, s, v };
              setHsv(next);
              emitChange(next, alpha);
            }}
          >
            <div className={`${base}__sat-white`} />
            <div className={`${base}__sat-black`} />
            <div
              className={`${base}__sat-cursor`}
              style={{
                left: `${hsv.s * 100}%`,
                top: `${(1 - hsv.v) * 100}%`,
              }}
            />
          </div>

          {/* Hue bar */}
          <div
            ref={hueBarRef}
            className={`${base}__hue-bar`}
            onMouseDown={startDrag("hue")}
            onTouchStart={startDrag("hue")}
            role="slider"
            aria-label={locale.colorPicker.hue}
            aria-valuenow={Math.round(hsv.h)}
            aria-valuemin={0}
            aria-valuemax={360}
            tabIndex={0}
            onKeyDown={e => {
              let h = hsv.h;
              if (e.key === "ArrowRight") h = (h + 3) % 360;
              else if (e.key === "ArrowLeft") h = (h - 3 + 360) % 360;
              else return;
              e.preventDefault();
              const next = { ...hsv, h };
              setHsv(next);
              emitChange(next, alpha);
            }}
          >
            <div
              className={`${base}__bar-cursor`}
              style={{ left: `${(hsv.h / 360) * 100}%` }}
            />
          </div>

          {/* Alpha bar */}
          {showAlpha && (
            <div
              ref={alphaBarRef}
              className={`${base}__alpha-bar`}
              style={{ "--k-cp-alpha-color": hueColor } as React.CSSProperties}
              onMouseDown={startDrag("alpha")}
              onTouchStart={startDrag("alpha")}
              role="slider"
              aria-label={locale.colorPicker.opacity}
              aria-valuenow={Math.round(alpha * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              tabIndex={0}
              onKeyDown={e => {
                let a = alpha;
                if (e.key === "ArrowRight") a = clamp(a + 0.02, 0, 1);
                else if (e.key === "ArrowLeft") a = clamp(a - 0.02, 0, 1);
                else return;
                e.preventDefault();
                setAlpha(a);
                emitChange(hsv, a);
              }}
            >
              <div
                className={`${base}__bar-cursor`}
                style={{ left: `${alpha * 100}%` }}
              />
            </div>
          )}

          {/* Input row */}
          <div className={`${base}__input-row`}>
            <div
              className={`${base}__preview`}
              style={{ background: displayColor }}
            />
            <input
              className={`${base}__text-input`}
              type="text"
              value={textInput}
              onChange={handleTextChange}
              spellCheck={false}
            />
            <button
              type="button"
              className={`${base}__copy-btn`}
              onClick={handleCopy}
              aria-label={locale.common.copy}
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="14"
                height="14"
                aria-hidden="true"
              >
                <path d={copied ? CHECK_PATH : COPY_PATH} />
              </svg>
            </button>
            <button
              type="button"
              className={`${base}__format-btn`}
              onClick={cycleFormat}
              aria-label={locale.colorPicker.switchFormat}
            >
              {format.toUpperCase()}
            </button>
          </div>

          {/* Presets */}
          {presets.length > 0 && (
            <div className={`${base}__presets`}>
              {presets.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`${base}__preset${c.toLowerCase() === displayColor.toLowerCase() ? ` ${base}__preset--active` : ""}`}
                  style={{ background: c }}
                  onClick={() => {
                    const p = parseColor(c);
                    const h = rgbToHsv(p.r, p.g, p.b);
                    setHsv(h);
                    setAlpha(p.a);
                    emitChange(h, p.a);
                  }}
                  aria-label={c}
                />
              ))}
            </div>
          )}
        </div>,
        document.body
      )
    : null;

  const hasWrapper = !!(label || helperText || errorMessage || required);
  const content = (
    <>
      {trigger}
      {name && <input type="hidden" name={name} value={colorStr} />}
      {panel}
    </>
  );

  if (!hasWrapper) {
    return (
      <div ref={elRef} className={`${base} ${className}`} style={style}>
        {content}
      </div>
    );
  }

  return (
    <div
      ref={elRef}
      className={`${base}${fullWidth ? ` ${base}--full-width` : ""} ${className}`}
      style={style}
    >
      <FieldWrapper
        label={label}
        required={required}
        helperText={helperText}
        error={errorMessage}
        success={success}
        size={size}
        disabled={disabled}
        fullWidth={fullWidth}
      >
        {content}
      </FieldWrapper>
    </div>
  );
};
