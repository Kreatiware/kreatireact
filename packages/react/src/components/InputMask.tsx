import React, {
  forwardRef,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { Input } from "./Input";
import type { InputProps } from "./Input";

export interface InputMaskProps extends Omit<
  InputProps,
  | "type"
  | "value"
  | "defaultValue"
  | "onChange"
  | "maxLength"
  | "hideSteppers"
  | "decimalSeparator"
> {
  /** Mask pattern: `9` = digit, `a` = letter, `*` = alphanumeric, any other char is literal */
  mask: string;
  /** Current raw value without mask literals (controlled mode) */
  value?: string;
  /** Default raw value without mask literals (uncontrolled mode) */
  defaultValue?: string;
  /** Fires with the raw value (no literals) and the formatted value */
  onChange?: (raw: string, formatted: string) => void;
  /** Whether to show the full mask as placeholder when empty (default: true) */
  showMaskPlaceholder?: boolean;
  /** Character used for unfilled mask positions (default: '_') */
  placeholderChar?: string;
}

const SLOT_REGEX: Record<string, RegExp> = {
  "9": /\d/,
  a: /[a-zA-Z]/,
  "*": /[a-zA-Z0-9]/,
};

const isSlot = (ch: string) => ch in SLOT_REGEX;

/**
 * InputMask component for formatted text input.
 *
 * @description Wraps the base Input component and applies automatic formatting
 * based on a mask pattern. Mask characters: `9` for digits, `a` for letters,
 * `*` for alphanumeric. All other characters in the mask are treated as
 * literals and inserted automatically.
 *
 * @example
 * ```tsx
 * // Phone number
 * <InputMask mask="+99 999 9999 99" label="Phone" />
 *
 * // Credit card
 * <InputMask mask="9999 9999 9999 9999" label="Card" />
 *
 * // Date
 * <InputMask mask="99/99/9999" label="Date" />
 *
 * // License plate (letters + digits)
 * <InputMask mask="aaa-9999" label="Plate" />
 * ```
 */
export const InputMask = forwardRef<HTMLInputElement, InputMaskProps>(
  (
    {
      mask,
      value: controlledValue,
      defaultValue,
      onChange,
      showMaskPlaceholder = true,
      placeholderChar = "_",
      placeholder,
      onKeyDown,
      ...inputProps
    },
    ref
  ) => {
    const isControlled = controlledValue !== undefined;
    const innerRef = useRef<HTMLInputElement>(null);

    const applyMask = useCallback(
      (raw: string): string => {
        let result = "";
        let rawIdx = 0;
        for (let i = 0; i < mask.length && rawIdx < raw.length; i++) {
          const maskCh = mask[i];
          if (isSlot(maskCh)) {
            const regex = SLOT_REGEX[maskCh];
            if (regex.test(raw[rawIdx])) {
              result += raw[rawIdx];
              rawIdx++;
            } else {
              rawIdx++;
              i--;
            }
          } else {
            result += maskCh;
            if (raw[rawIdx] === maskCh) rawIdx++;
          }
        }
        return result;
      },
      [mask]
    );

    const extractRaw = useCallback(
      (formatted: string): string => {
        let raw = "";
        for (let i = 0; i < formatted.length && i < mask.length; i++) {
          if (isSlot(mask[i])) raw += formatted[i];
        }
        return raw;
      },
      [mask]
    );

    const getMaskPlaceholder = useCallback((): string => {
      return mask
        .split("")
        .map(ch => (isSlot(ch) ? placeholderChar : ch))
        .join("");
    }, [mask, placeholderChar]);

    const initialFormatted = applyMask(defaultValue || controlledValue || "");
    const [internalValue, setInternalValue] = useState(initialFormatted);

    const displayValue = isControlled
      ? applyMask(controlledValue)
      : internalValue;

    const setCursorAfterFormat = useCallback(
      (el: HTMLInputElement, prevRaw: string, nextFormatted: string) => {
        const nextRaw = extractRaw(nextFormatted);
        const addedChars = nextRaw.length - prevRaw.length;
        let rawCount = 0;
        let cursorPos = 0;
        const targetRawPos = Math.max(0, prevRaw.length + addedChars);

        for (let i = 0; i < nextFormatted.length && i < mask.length; i++) {
          if (isSlot(mask[i])) {
            rawCount++;
            if (rawCount === targetRawPos) {
              cursorPos = i + 1;
              break;
            }
          }
        }

        if (rawCount < targetRawPos) cursorPos = nextFormatted.length;

        requestAnimationFrame(() => {
          el.setSelectionRange(cursorPos, cursorPos);
        });
      },
      [mask, extractRaw]
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputVal = e.target.value;
        const prevRaw = extractRaw(displayValue);
        const formatted = applyMask(inputVal);
        const raw = extractRaw(formatted);

        if (!isControlled) setInternalValue(formatted);
        onChange?.(raw, formatted);

        if (innerRef.current) {
          setCursorAfterFormat(innerRef.current, prevRaw, formatted);
        }
      },
      [
        applyMask,
        extractRaw,
        displayValue,
        isControlled,
        onChange,
        setCursorAfterFormat,
      ]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        onKeyDown?.(e);
      },
      [onKeyDown]
    );

    useEffect(() => {
      if (ref) {
        if (typeof ref === "function") ref(innerRef.current);
        else
          (ref as React.MutableRefObject<HTMLInputElement | null>).current =
            innerRef.current;
      }
    }, [ref]);

    return (
      <Input
        {...inputProps}
        ref={innerRef}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={
          placeholder ||
          (showMaskPlaceholder ? getMaskPlaceholder() : undefined)
        }
        maxLength={mask.length}
      />
    );
  }
);

InputMask.displayName = "InputMask";
