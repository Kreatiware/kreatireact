import React, {
  useId,
  useRef,
  useState,
  useCallback,
  useEffect,
  useImperativeHandle,
} from "react";
import { createPortal } from "react-dom";
import { Input } from "./Input";
import { Chip } from "./Chip";
import { Tag } from "./Tag";
import { Spinner } from "./Spinner";
import { useKreatiLocale } from "../locale";
import { useOverlayPosition } from "./useOverlayPosition";
import { useLayerZIndex } from "./LayerContext";
import "./AutoComplete.css";

export interface AutoCompleteItem {
  /** Unique value */
  value: string;
  /** Display label */
  label: string;
  /** Disabled state */
  disabled?: boolean;
  /** Extra data passed to templates */
  data?: Record<string, unknown>;
  /** Per-item className */
  className?: string;
  /** Per-item style */
  style?: React.CSSProperties;
}

export interface AutoCompleteProps {
  /** Suggestion items to display in the dropdown */
  suggestions: AutoCompleteItem[];
  /**
   * Current value (controlled).
   * Single mode: string. Multiple mode: AutoCompleteItem[] so labels are always available.
   */
  value?: string | AutoCompleteItem[];
  /** Default value (uncontrolled). Same types as value. */
  defaultValue?: string | AutoCompleteItem[];
  /**
   * Fires when value changes.
   * Single mode: string. Multiple mode: AutoCompleteItem[].
   */
  onChange?: (value: string | AutoCompleteItem[]) => void;
  /** Fires when the user types — use for async fetching */
  onSearch?: (query: string) => void;
  /** Fires when a suggestion is selected */
  onSelect?: (item: AutoCompleteItem) => void;
  /** Fires when an item is removed in multiple mode */
  onRemove?: (item: AutoCompleteItem) => void;
  /** Fires on blur */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** Enable multiple selection mode */
  multiple?: boolean;
  /** Visual style for selected items in multiple mode (default: 'chip') */
  selectionDisplay?: "chip" | "tag";
  /** Custom render for each selected item in multiple mode */
  selectedItemTemplate?: (
    item: AutoCompleteItem,
    onRemove: () => void
  ) => React.ReactNode;
  /** Maximum items in multiple mode */
  maxItems?: number;
  /** Minimum characters before triggering search (default: 1) */
  minLength?: number;
  /** Debounce delay in ms before firing onSearch (default: 300) */
  delay?: number;
  /** Show loading spinner in dropdown */
  loading?: boolean;
  /** Message when no suggestions match */
  emptyMessage?: string;
  /** Custom render for each suggestion item */
  itemTemplate?: (
    item: AutoCompleteItem,
    state: { selected: boolean; focused: boolean }
  ) => React.ReactNode;
  /** Clears value on blur if no match (single mode only) */
  forceSelection?: boolean;
  /** Show the dropdown on focus even without typing */
  showOnFocus?: boolean;
  /** Visual variant */
  variant?: "floating" | "stacked";
  /** Component size */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Label text */
  label?: string;
  /** Placeholder */
  placeholder?: string;
  /** Icon on the left */
  iconLeft?: React.ReactNode;
  /** Icon on the right */
  iconRight?: React.ReactNode;
  /** Helper text */
  helperText?: React.ReactNode;
  /** Error state */
  error?: React.ReactNode | boolean;
  /** Success state */
  success?: boolean;
  /** Helper text severity color */
  helperSeverity?:
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "help"
    | "danger"
    | "accent";
  /** Disabled */
  disabled?: boolean;
  /** Read-only */
  readOnly?: boolean;
  /** Required indicator */
  required?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** HTML name */
  name?: string;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

const base = "k-autocomplete";

/**
 * AutoComplete component for text input with suggestion dropdown.
 *
 * @description Supports single and multiple selection. In multiple mode,
 * value is AutoCompleteItem[] so labels are always available. Selected
 * items render as Chips or Tags. Supports async search, debounce, custom
 * templates, force selection, and full keyboard navigation. Compatible
 * with Formik and React Hook Form via name, value, onChange, onBlur, ref.
 *
 * @example
 * ```tsx
 * // Single
 * <AutoComplete label="Country" suggestions={items} onSearch={search} />
 *
 * // Multiple with chips
 * <AutoComplete label="Tags" multiple value={selected} onChange={setSelected}
 *   suggestions={items} onSearch={search} />
 *
 * // Multiple with tags
 * <AutoComplete label="Skills" multiple selectionDisplay="tag"
 *   suggestions={items} onSearch={search} />
 * ```
 */
export const AutoComplete = ({
  suggestions,
  value: controlledValue,
  defaultValue,
  onChange,
  onSearch,
  onSelect,
  onRemove,
  onBlur,
  multiple = false,
  selectionDisplay = "chip",
  selectedItemTemplate,
  maxItems,
  minLength = 1,
  delay = 300,
  loading = false,
  emptyMessage,
  itemTemplate,
  forceSelection = false,
  showOnFocus = false,
  variant,
  size,
  label,
  placeholder,
  iconLeft,
  iconRight,
  helperText,
  error,
  success,
  helperSeverity,
  disabled,
  readOnly,
  required,
  fullWidth,
  name,
  className = "",
  style,
  ref,
}: AutoCompleteProps & { ref?: React.Ref<HTMLInputElement> }) => {
  const locale = useKreatiLocale();
  const uid = useId();
  const listId = `${uid}-list`;
  const isControlled = controlledValue !== undefined;

  // --- Single mode state ---
  const [internalSingle, setInternalSingle] = useState<string>(
    typeof defaultValue === "string" ? defaultValue : ""
  );
  const singleValue = isControlled
    ? (controlledValue as string)
    : internalSingle;

  // --- Multiple mode state ---
  const [internalMultiple, setInternalMultiple] = useState<AutoCompleteItem[]>(
    Array.isArray(defaultValue) ? defaultValue : []
  );
  const multiItems: AutoCompleteItem[] =
    isControlled && Array.isArray(controlledValue)
      ? controlledValue
      : internalMultiple;

  const [inputText, setInputText] = useState("");
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  const triggerCallbackRef = useCallback((el: HTMLDivElement | null) => {
    if (el) triggerRef.current = el;
  }, []);

  useEffect(() => {
    if (!multiple) {
      const el = wrapperRef.current?.querySelector(
        ".k-input__fieldset, .k-input__container"
      ) as HTMLElement | null;
      if (el) triggerRef.current = el;
    }
  });

  const zIndex = useLayerZIndex();
  const { coords, positioned } = useOverlayPosition(triggerRef, panelRef, open);
  const resolvedEmpty = emptyMessage ?? locale.select.emptyMessage;

  const openPanel = useCallback(() => {
    if (disabled || readOnly) return;
    setOpen(true);
    setFocusedIndex(-1);
  }, [disabled, readOnly]);

  const closePanel = useCallback(() => {
    setOpen(false);
    setFocusedIndex(-1);
  }, []);

  const triggerSearch = useCallback(
    (query: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onSearch?.(query), delay);
    },
    [delay, onSearch]
  );

  // --- Single handlers ---
  const updateSingle = useCallback(
    (val: string) => {
      if (!isControlled) setInternalSingle(val);
      onChange?.(val);
    },
    [isControlled, onChange]
  );

  const handleSingleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      updateSingle(val);
      setSelectedValue(null);
      if (val.length >= minLength) {
        triggerSearch(val);
        openPanel();
      } else closePanel();
    },
    [updateSingle, minLength, triggerSearch, openPanel, closePanel]
  );

  const handleSingleSelect = useCallback(
    (item: AutoCompleteItem) => {
      if (item.disabled) return;
      updateSingle(item.label);
      setSelectedValue(item.value);
      onSelect?.(item);
      closePanel();
    },
    [updateSingle, onSelect, closePanel]
  );

  // --- Multiple handlers ---
  const updateMultiple = useCallback(
    (items: AutoCompleteItem[]) => {
      if (!isControlled) setInternalMultiple(items);
      onChange?.(items);
    },
    [isControlled, onChange]
  );

  const handleMultipleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInputText(val);
      if (val.length >= minLength) {
        triggerSearch(val);
        openPanel();
      } else closePanel();
    },
    [minLength, triggerSearch, openPanel, closePanel]
  );

  const handleMultipleSelect = useCallback(
    (item: AutoCompleteItem) => {
      if (item.disabled) return;
      if (multiItems.some(i => i.value === item.value)) return;
      if (maxItems && multiItems.length >= maxItems) return;
      updateMultiple([...multiItems, item]);
      onSelect?.(item);
      setInputText("");
      closePanel();
      inputRef.current?.focus();
    },
    [multiItems, maxItems, updateMultiple, onSelect, closePanel]
  );

  const handleRemoveItem = useCallback(
    (val: string) => {
      const removed = multiItems.find(i => i.value === val);
      updateMultiple(multiItems.filter(i => i.value !== val));
      if (removed) onRemove?.(removed);
      inputRef.current?.focus();
    },
    [multiItems, updateMultiple, onRemove]
  );

  // --- Shared ---
  const handleSelect = multiple ? handleMultipleSelect : handleSingleSelect;

  const handleFocus = useCallback(() => {
    if (showOnFocus) {
      const q = multiple ? inputText : singleValue;
      if (q.length >= minLength) {
        onSearch?.(q);
        openPanel();
      }
    }
  }, [
    showOnFocus,
    multiple,
    inputText,
    singleValue,
    minLength,
    onSearch,
    openPanel,
  ]);

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setTimeout(() => {
        if (panelRef.current?.contains(document.activeElement)) return;
        if (wrapperRef.current?.contains(document.activeElement)) return;
        if (!multiple && forceSelection && !selectedValue) {
          const match = suggestions.find(
            s => s.label.toLowerCase() === singleValue.toLowerCase()
          );
          if (match) handleSingleSelect(match);
          else {
            updateSingle("");
            setSelectedValue(null);
          }
        }
        if (multiple) setInputText("");
        closePanel();
        onBlur?.(e);
      }, 150);
    },
    [
      multiple,
      forceSelection,
      selectedValue,
      suggestions,
      singleValue,
      handleSingleSelect,
      updateSingle,
      closePanel,
      onBlur,
    ]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (
        multiple &&
        e.key === "Backspace" &&
        inputText === "" &&
        multiItems.length > 0
      ) {
        handleRemoveItem(multiItems[multiItems.length - 1].value);
        return;
      }
      if (!open) {
        const q = multiple ? inputText : singleValue;
        if (e.key === "ArrowDown" && q.length >= minLength) {
          openPanel();
          e.preventDefault();
        }
        return;
      }
      const sug = visibleSuggestions;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex(p => {
            let n = p + 1;
            while (n < sug.length && sug[n].disabled) n++;
            return n < sug.length ? n : p;
          });
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex(p => {
            let n = p - 1;
            while (n >= 0 && sug[n].disabled) n--;
            return n >= 0 ? n : p;
          });
          break;
        case "Enter":
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < sug.length)
            handleSelect(sug[focusedIndex]);
          break;
        case "Escape":
          closePanel();
          break;
      }
    },
    [
      open,
      multiple,
      inputText,
      singleValue,
      minLength,
      focusedIndex,
      multiItems,
      handleSelect,
      handleRemoveItem,
      openPanel,
      closePanel,
    ]
  );

  // --- Effects ---
  useEffect(() => {
    if (!open || focusedIndex < 0) return;
    const el = panelRef.current?.querySelector(`.${base}__list`)?.children[
      focusedIndex
    ] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [focusedIndex, open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current?.contains(e.target as Node) ||
        panelRef.current?.contains(e.target as Node)
      )
        return;
      closePanel();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, closePanel]);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.setAttribute("role", "combobox");
    el.setAttribute("aria-autocomplete", "list");
    el.setAttribute("aria-expanded", String(open));
    if (open) el.setAttribute("aria-controls", listId);
    else el.removeAttribute("aria-controls");
    if (open && focusedIndex >= 0)
      el.setAttribute("aria-activedescendant", `${uid}-item-${focusedIndex}`);
    else el.removeAttribute("aria-activedescendant");
  }, [open, focusedIndex, listId, uid]);

  // --- Visible suggestions ---
  const selectedValues = new Set(multiItems.map(i => i.value));
  const visibleSuggestions = multiple
    ? suggestions.filter(s => !selectedValues.has(s.value))
    : suggestions;
  const currentQuery = multiple ? inputText : singleValue;
  const showPanel =
    open &&
    (visibleSuggestions.length > 0 ||
      loading ||
      currentQuery.length >= minLength);

  // --- Dropdown ---
  const panel = showPanel
    ? createPortal(
        <div
          ref={panelRef}
          className={`${base}__panel${positioned ? ` ${base}__panel--visible` : ""}`}
          style={{
            top: coords.top,
            left: coords.left,
            minWidth: coords.minWidth,
            zIndex: zIndex.overlay,
          }}
          role="listbox"
          id={listId}
        >
          {loading ? (
            <div className={`${base}__loading`}>
              <Spinner size="sm" />
              {locale.common.loading}
            </div>
          ) : visibleSuggestions.length === 0 ? (
            <div className={`${base}__empty`}>{resolvedEmpty}</div>
          ) : (
            <div className={`${base}__list`}>
              {visibleSuggestions.map((item, i) => {
                const isFocused = i === focusedIndex;
                const isSelected = multiple
                  ? selectedValues.has(item.value)
                  : item.value === selectedValue;
                const cls = [
                  `${base}__item`,
                  isFocused && `${base}__item--focused`,
                  isSelected && `${base}__item--selected`,
                  item.disabled && `${base}__item--disabled`,
                  item.className,
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <div
                    key={item.value}
                    id={`${uid}-item-${i}`}
                    className={cls}
                    style={item.style}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={item.disabled || undefined}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setFocusedIndex(i)}
                  >
                    {itemTemplate
                      ? itemTemplate(item, {
                          selected: isSelected,
                          focused: isFocused,
                        })
                      : item.label}
                  </div>
                );
              })}
            </div>
          )}
        </div>,
        document.body
      )
    : null;

  // --- Multiple render ---
  if (multiple) {
    const atMax = !!maxItems && multiItems.length >= maxItems;
    const tokens = multiItems.map(item => {
      const remove = () => handleRemoveItem(item.value);
      if (selectedItemTemplate)
        return (
          <React.Fragment key={item.value}>
            {selectedItemTemplate(item, remove)}
          </React.Fragment>
        );
      if (selectionDisplay === "tag")
        return (
          <Tag key={item.value} severity="primary" removable onRemove={remove}>
            {item.label}
          </Tag>
        );
      return (
        <Chip
          key={item.value}
          variant="primary"
          size="sm"
          removable
          onRemove={remove}
        >
          {item.label}
        </Chip>
      );
    });

    const hasError = !!error;
    const errorMessage = typeof error === "boolean" ? undefined : error;
    const wrapperCls = [
      `${base}__tokens`,
      `${base}__tokens--${size || "md"}`,
      hasError && `${base}__tokens--error`,
      !hasError && success && `${base}__tokens--success`,
      disabled && `${base}__tokens--disabled`,
      fullWidth && `${base}__tokens--full-width`,
    ]
      .filter(Boolean)
      .join(" ");

    const inputId = `${uid}-input`;

    return (
      <div
        ref={wrapperRef}
        className={`${base}${fullWidth ? ` ${base}--full-width` : ""} ${className}`}
        style={style}
      >
        {variant === "stacked" && label && (
          <label htmlFor={inputId} className={`${base}__label`}>
            {label}
            {required && (
              <span className={`${base}__required`} aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <div
          ref={triggerCallbackRef}
          className={wrapperCls}
          onClick={() => inputRef.current?.focus()}
          aria-label={label}
        >
          {iconLeft && <span className={`${base}__icon-left`}>{iconLeft}</span>}
          {tokens}
          {!atMax && (
            <input
              ref={inputRef}
              id={inputId}
              className={`${base}__tokens-input`}
              type="text"
              value={inputText}
              onChange={handleMultipleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder={multiItems.length === 0 ? placeholder : undefined}
              disabled={disabled}
              readOnly={readOnly}
              aria-required={required || undefined}
              autoComplete="off"
            />
          )}
          {iconRight && (
            <span className={`${base}__icon-right`}>{iconRight}</span>
          )}
        </div>
        {hasError && errorMessage && (
          <span className={`${base}__error`} role="alert">
            {errorMessage}
          </span>
        )}
        {helperText && <span className={`${base}__helper`}>{helperText}</span>}
        {name &&
          multiItems.map(i => (
            <input key={i.value} type="hidden" name={name} value={i.value} />
          ))}
        {panel}
      </div>
    );
  }

  // --- Single render ---
  return (
    <div
      ref={wrapperRef}
      className={`${base}${fullWidth ? ` ${base}--full-width` : ""} ${className}`}
      style={style}
    >
      <Input
        ref={inputRef}
        type="text"
        name={name}
        value={singleValue}
        onChange={handleSingleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        variant={variant}
        size={size}
        label={label}
        placeholder={placeholder}
        iconLeft={iconLeft}
        iconRight={iconRight}
        helperText={helperText}
        error={error}
        success={success}
        helperSeverity={helperSeverity}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        fullWidth={fullWidth}
        autoComplete="off"
      />
      {panel}
    </div>
  );
};
