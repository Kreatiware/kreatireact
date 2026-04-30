import React, {
  forwardRef,
  useId,
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useImperativeHandle,
} from "react";
import { createPortal } from "react-dom";
import type { SelectOption, SelectGroup } from "./SelectDropdown";
import { FieldWrapper } from "./FieldWrapper";
import { useKreatiLocale } from "../locale";
import { useOverlayPosition } from "./useOverlayPosition";
import { useLayerZIndex } from "./LayerContext";
import {
  CHEVRON_DOWN_PATH,
  TIMES_PATH,
  CHECK_PATH,
  MINUS_PATH,
  SEARCH_PATH,
} from "./iconPaths";
import "./MultiSelect.css";

export interface MultiSelectProps {
  /** Array of selectable options */
  options: SelectOption[];
  /** Option groups with headers */
  groups?: SelectGroup[];
  /** Selected values (controlled) */
  value?: Array<string | number>;
  /** Default selected values (uncontrolled) */
  defaultValue?: Array<string | number>;
  /** Fires when selection changes */
  onChange?: (values: Array<string | number>, options: SelectOption[]) => void;
  /** Visual variant */
  variant?: "floating" | "stacked";
  /** Component size */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Label text */
  label?: string;
  /** Placeholder when nothing is selected */
  placeholder?: string;
  /** Filter options via search bar in dropdown */
  filterable?: boolean;
  /** Show clear all button */
  clearable?: boolean;
  /** Show "Select all" option at the top */
  selectAll?: boolean;
  /** Allow selecting/deselecting entire groups */
  selectGroup?: boolean;
  /** Maximum number of selections allowed */
  maxSelection?: number;
  /** Maximum labels shown before switching to "{count} selected" summary (default: 3) */
  maxSelectedLabels?: number;
  /** Show selected values as Chip components in the trigger */
  chipDisplay?: boolean;
  /** Checkbox position inside each option */
  checkboxPosition?: "left" | "right";
  /** Custom dropdown toggle icon */
  dropdownIcon?: React.ReactNode;
  /** Icon rendered on the left side of the trigger */
  iconLeft?: React.ReactNode;
  /** Custom render for each chip in the trigger */
  chipTemplate?: (
    option: SelectOption,
    onRemove: () => void
  ) => React.ReactNode;
  /** Custom render for the summary text — overrides maxSelectedLabels logic */
  selectedTemplate?: (
    options: SelectOption[],
    count: number
  ) => React.ReactNode;
  /** Custom render for each option row */
  optionTemplate?: (
    option: SelectOption,
    state: { selected: boolean; focused: boolean; disabled: boolean }
  ) => React.ReactNode;
  /** Custom render for group headers */
  groupTemplate?: (
    group: SelectGroup,
    state: { allSelected: boolean; someSelected: boolean }
  ) => React.ReactNode;
  /** Custom checked template for checkboxes */
  checkedTemplate?: React.ReactNode;
  /** Custom unchecked template for checkboxes */
  uncheckedTemplate?: React.ReactNode;
  /** Placeholder for the filter input */
  filterPlaceholder?: string;
  /** Message when filter yields no results */
  emptyMessage?: string;
  /** Helper text below */
  helperText?: React.ReactNode;
  /** Error message or boolean */
  error?: React.ReactNode | boolean;
  /** Success state */
  success?: boolean;
  /** Helper severity color */
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
  /** HTML name attribute */
  name?: string;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Fires when dropdown opens */
  onOpen?: () => void;
  /** Fires when dropdown closes */
  onClose?: () => void;
  /** Blur handler */
  onBlur?: () => void;
}

/**
 * MultiSelect component for selecting multiple values from a dropdown list.
 *
 * @description A fully custom multi-select with checkboxes, chip display,
 * select all, group selection, max selection limit, filterable, and custom
 * templates. Uses maxSelectedLabels to auto-switch between comma-separated
 * labels and "{count} selected" summary. Compatible with Formik via name,
 * value, onChange, onBlur, and ref.
 *
 * @example
 * ```tsx
 * <MultiSelect
 *   label="Countries"
 *   options={[{ value: 'us', label: 'United States' }, { value: 'mx', label: 'Mexico' }]}
 *   chipDisplay
 *   selectAll
 *   onChange={(values) => console.log(values)}
 * />
 * ```
 */
export const MultiSelect = forwardRef<HTMLDivElement, MultiSelectProps>(
  (
    {
      options,
      groups,
      value: controlledValue,
      defaultValue,
      onChange,
      variant = "floating",
      size = "md",
      label,
      placeholder,
      filterable = false,
      clearable = false,
      selectAll = false,
      selectGroup = false,
      maxSelection,
      maxSelectedLabels = 3,
      chipDisplay = false,
      checkboxPosition = "left",
      dropdownIcon,
      iconLeft,
      chipTemplate,
      selectedTemplate,
      optionTemplate,
      groupTemplate,
      checkedTemplate,
      uncheckedTemplate,
      filterPlaceholder,
      emptyMessage,
      helperText,
      error,
      success = false,
      helperSeverity,
      disabled = false,
      readOnly = false,
      required = false,
      fullWidth = false,
      name,
      className = "",
      style,
      onOpen,
      onClose,
      onBlur,
    },
    ref
  ) => {
    const autoId = useId();
    const selectId = name || autoId;
    const dropdownId = `${selectId}-listbox`;
    const wrapperRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => wrapperRef.current as HTMLDivElement);

    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState<Array<string | number>>(
      defaultValue ?? []
    );
    const selected = isControlled ? controlledValue : internalValue;

    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState("");
    const [focusedIndex, setFocusedIndex] = useState(-1);

    const { coords: overlayCoords, positioned: overlayPositioned } =
      useOverlayPosition(
        triggerRef as React.RefObject<HTMLElement>,
        panelRef as React.RefObject<HTMLElement>,
        open
      );
    const { child: childZ } = useLayerZIndex();

    const locale = useKreatiLocale();
    const hasError = !!error;
    const errorMessage = typeof error === "boolean" ? undefined : error;
    const isFloating = variant === "floating";
    const hasLabel = !!label;
    const hasWrapper = !isFloating && !!(label || helperText || errorMessage);
    const base = "k-multiselect";

    const selectedOptions = useMemo(
      () => options.filter(o => selected.includes(o.value)),
      [options, selected]
    );
    const filteredOptions = useMemo(() => {
      if (!filterable || !filter) return options;
      const lower = filter.toLowerCase();
      return options.filter(o => o.label.toLowerCase().includes(lower));
    }, [options, filter, filterable]);
    const enabledFiltered = useMemo(
      () => filteredOptions.filter(o => !o.disabled),
      [filteredOptions]
    );
    const allSelected =
      enabledFiltered.length > 0 &&
      enabledFiltered.every(o => selected.includes(o.value));
    const someSelected =
      enabledFiltered.some(o => selected.includes(o.value)) && !allSelected;

    const helperId = `${selectId}-helper`;
    const errorId = `${selectId}-error`;
    const describedBy =
      [hasError && errorId, helperId].filter(Boolean).join(" ") || undefined;
    const hasValue = selected.length > 0;

    const updateValue = useCallback(
      (next: Array<string | number>) => {
        if (!isControlled) setInternalValue(next);
        onChange?.(
          next,
          options.filter(o => next.includes(o.value))
        );
      },
      [isControlled, options, onChange]
    );

    const toggleOption = useCallback(
      (optValue: string | number) => {
        const isSel = selected.includes(optValue);
        if (!isSel && maxSelection && selected.length >= maxSelection) return;
        updateValue(
          isSel ? selected.filter(v => v !== optValue) : [...selected, optValue]
        );
      },
      [selected, maxSelection, updateValue]
    );

    const toggleAll = useCallback(() => {
      if (allSelected) {
        updateValue(
          selected.filter(v => !enabledFiltered.some(o => o.value === v))
        );
      } else {
        const toAdd = enabledFiltered
          .filter(o => !selected.includes(o.value))
          .map(o => o.value);
        updateValue([
          ...selected,
          ...(maxSelection
            ? toAdd.slice(0, maxSelection - selected.length)
            : toAdd),
        ]);
      }
    }, [allSelected, selected, enabledFiltered, maxSelection, updateValue]);

    const toggleGroup = useCallback(
      (groupKey: string) => {
        const grpOpts = enabledFiltered.filter(o => o.group === groupKey);
        const allGrp = grpOpts.every(o => selected.includes(o.value));
        if (allGrp) {
          updateValue(selected.filter(v => !grpOpts.some(o => o.value === v)));
        } else {
          const toAdd = grpOpts
            .filter(o => !selected.includes(o.value))
            .map(o => o.value);
          updateValue([
            ...selected,
            ...(maxSelection
              ? toAdd.slice(0, maxSelection - selected.length)
              : toAdd),
          ]);
        }
      },
      [enabledFiltered, selected, maxSelection, updateValue]
    );

    const removeChip = useCallback(
      (v: string | number) => updateValue(selected.filter(x => x !== v)),
      [selected, updateValue]
    );
    const clearAll = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        updateValue([]);
        triggerRef.current?.focus();
      },
      [updateValue]
    );

    const openDropdown = useCallback(() => {
      if (disabled || readOnly || open) return;
      setOpen(true);
      setFocusedIndex(0);
      onOpen?.();
    }, [disabled, readOnly, open, onOpen]);
    const closeDropdown = useCallback(() => {
      if (!open) return;
      setOpen(false);
      setFilter("");
      setFocusedIndex(-1);
      onClose?.();
      onBlur?.();
    }, [open, onClose, onBlur]);
    const handleTriggerClick = useCallback(() => {
      if (open) closeDropdown();
      else openDropdown();
    }, [open, openDropdown, closeDropdown]);
    const handleFilterChange = useCallback((f: string) => {
      setFilter(f);
      setFocusedIndex(0);
    }, []);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (disabled || readOnly) return;
        switch (e.key) {
          case "ArrowDown": {
            e.preventDefault();
            if (!open) {
              openDropdown();
              return;
            }
            setFocusedIndex(p => {
              let n = p + 1;
              while (n < filteredOptions.length && filteredOptions[n].disabled)
                n++;
              return n < filteredOptions.length ? n : p;
            });
            break;
          }
          case "ArrowUp": {
            e.preventDefault();
            if (!open) {
              openDropdown();
              return;
            }
            setFocusedIndex(p => {
              let n = p - 1;
              while (n >= 0 && filteredOptions[n].disabled) n--;
              return n >= 0 ? n : p;
            });
            break;
          }
          case "Enter":
          case " ": {
            e.preventDefault();
            if (!open) {
              openDropdown();
              return;
            }
            if (focusedIndex >= 0 && focusedIndex < filteredOptions.length)
              toggleOption(filteredOptions[focusedIndex].value);
            break;
          }
          case "Escape": {
            e.preventDefault();
            closeDropdown();
            break;
          }
          case "Tab": {
            closeDropdown();
            break;
          }
          case "Home": {
            if (open) {
              e.preventDefault();
              setFocusedIndex(0);
            }
            break;
          }
          case "End": {
            if (open) {
              e.preventDefault();
              setFocusedIndex(filteredOptions.length - 1);
            }
            break;
          }
        }
      },
      [
        disabled,
        readOnly,
        open,
        focusedIndex,
        filteredOptions,
        openDropdown,
        closeDropdown,
        toggleOption,
      ]
    );

    useEffect(() => {
      if (!open) return;
      const handler = (e: MouseEvent) => {
        if (wrapperRef.current?.contains(e.target as Node)) return;
        if (panelRef.current?.contains(e.target as Node)) return;
        closeDropdown();
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, [open, closeDropdown]);

    const iconSz: Record<string, number> = {
      xs: 8,
      sm: 10,
      md: 12,
      lg: 14,
      xl: 16,
    };
    const checkSz = iconSz[size];

    const renderCheckbox = (checked: boolean, indeterminate = false) => {
      if (indeterminate)
        return (
          <svg
            width={checkSz}
            height={checkSz}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d={MINUS_PATH} />
          </svg>
        );
      if (checked)
        return (
          checkedTemplate ?? (
            <svg
              width={checkSz}
              height={checkSz}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d={CHECK_PATH} />
            </svg>
          )
        );
      return uncheckedTemplate ?? null;
    };

    const chevronIcon = dropdownIcon || (
      <svg
        width={14}
        height={14}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d={CHEVRON_DOWN_PATH} />
      </svg>
    );
    const clearIcon = (
      <svg
        width={12}
        height={12}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d={TIMES_PATH} />
      </svg>
    );
    const chipRemoveIcon = (
      <svg
        width={10}
        height={10}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d={TIMES_PATH} />
      </svg>
    );

    const displayText = useMemo(() => {
      if (!hasValue)
        return placeholder || (hasLabel && isFloating ? "\u00A0" : "");
      if (selectedTemplate)
        return selectedTemplate(selectedOptions, selected.length);
      if (selected.length <= maxSelectedLabels)
        return selectedOptions.map(o => o.label).join(", ");
      return locale.multiSelect.selectedCount.replace(
        "{count}",
        String(selected.length)
      );
    }, [
      hasValue,
      placeholder,
      hasLabel,
      isFloating,
      selectedTemplate,
      selectedOptions,
      selected.length,
      maxSelectedLabels,
      locale,
    ]);

    const triggerContent =
      chipDisplay && hasValue ? (
        <span className={`${base}__chips`}>
          {selectedOptions.slice(0, maxSelectedLabels).map(opt =>
            chipTemplate ? (
              chipTemplate(opt, () => removeChip(opt.value))
            ) : (
              <span
                key={opt.value}
                className={`${base}__chip ${base}__chip--${size}`}
              >
                <span className={`${base}__chip-label`}>{opt.label}</span>
                {!disabled && !readOnly && (
                  <button
                    type="button"
                    className={`${base}__chip-remove`}
                    onClick={e => {
                      e.stopPropagation();
                      removeChip(opt.value);
                    }}
                    tabIndex={-1}
                    aria-label={`Remove ${opt.label}`}
                  >
                    {chipRemoveIcon}
                  </button>
                )}
              </span>
            )
          )}
          {selectedOptions.length > maxSelectedLabels && (
            <span
              className={`${base}__chip ${base}__chip--${size} ${base}__chip--overflow`}
            >
              <span className={`${base}__chip-label`}>
                +{selectedOptions.length - maxSelectedLabels}
              </span>
            </span>
          )}
        </span>
      ) : (
        <span
          className={`${base}__value ${!hasValue ? `${base}__value--placeholder` : ""}`}
        >
          {displayText}
        </span>
      );

    const triggerClasses = [
      `${base}__trigger`,
      `${base}__trigger--${size}`,
      hasError && `${base}__trigger--error`,
      !hasError && success && `${base}__trigger--success`,
      disabled && `${base}__trigger--disabled`,
      readOnly && `${base}__trigger--readonly`,
      open && `${base}__trigger--open`,
      fullWidth && `${base}__trigger--full-width`,
      iconLeft && `${base}__trigger--has-icon-left`,
      chipDisplay && hasValue && `${base}__trigger--has-chips`,
    ]
      .filter(Boolean)
      .join(" ");

    const wrapperClasses = [
      base,
      `${base}--${variant}`,
      fullWidth && `${base}--full-width`,
      className,
    ]
      .filter(Boolean)
      .join(" ");
    const legendText = hasLabel ? `${label}${required ? " *" : ""}` : "";

    const flatItems = useMemo(() => {
      if (!groups || groups.length === 0)
        return filteredOptions.map((o, i) => ({
          type: "option" as const,
          option: o,
          flatIndex: i,
        }));
      const items: Array<
        | { type: "group"; group: SelectGroup; groupKey: string }
        | { type: "option"; option: SelectOption; flatIndex: number }
      > = [];
      let idx = 0;
      for (const g of groups) {
        const go = filteredOptions.filter(o => o.group === g.key);
        if (!go.length) continue;
        items.push({ type: "group", group: g, groupKey: g.key });
        for (const o of go)
          items.push({ type: "option", option: o, flatIndex: idx++ });
      }
      for (const o of filteredOptions.filter(o => !o.group))
        items.push({ type: "option", option: o, flatIndex: idx++ });
      return items;
    }, [filteredOptions, groups]);

    const dropdownPanel = open
      ? createPortal(
          <div
            ref={panelRef}
            className={`${base}__dropdown-portal ${overlayPositioned ? `${base}__dropdown-portal--visible` : ""}`}
            style={{
              position: "fixed",
              top: overlayCoords.top,
              left: overlayCoords.left,
              minWidth: overlayCoords.minWidth,
              zIndex: childZ,
            }}
          >
            <div
              className={`${base}__dropdown ${base}__container--${size}`}
              role="listbox"
              aria-multiselectable="true"
              id={dropdownId}
            >
              {filterable && (
                <div className={`${base}__filter`}>
                  <svg
                    className={`${base}__filter-icon`}
                    width={14}
                    height={14}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d={SEARCH_PATH} />
                  </svg>
                  <input
                    className={`${base}__filter-input`}
                    type="text"
                    value={filter}
                    onChange={e => handleFilterChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      filterPlaceholder || locale.multiSelect.filterPlaceholder
                    }
                    aria-label={locale.common.filterOptions}
                    autoComplete="off"
                    autoFocus
                  />
                </div>
              )}
              <div className={`${base}__options`}>
                {selectAll && filteredOptions.length > 0 && (
                  <div
                    className={`${base}__option ${base}__option--select-all`}
                    role="option"
                    aria-selected={allSelected}
                    onClick={toggleAll}
                  >
                    {checkboxPosition === "left" && (
                      <span
                        className={`${base}__checkbox ${allSelected ? `${base}__checkbox--active` : ""} ${someSelected ? `${base}__checkbox--indeterminate` : ""}`}
                      >
                        {renderCheckbox(allSelected, someSelected)}
                      </span>
                    )}
                    <span className={`${base}__option-label`}>
                      {locale.multiSelect.selectAll}
                    </span>
                    {checkboxPosition === "right" && (
                      <span
                        className={`${base}__checkbox ${allSelected ? `${base}__checkbox--active` : ""} ${someSelected ? `${base}__checkbox--indeterminate` : ""}`}
                      >
                        {renderCheckbox(allSelected, someSelected)}
                      </span>
                    )}
                  </div>
                )}
                {filteredOptions.length === 0 && (
                  <div className={`${base}__empty`}>
                    {emptyMessage || locale.multiSelect.emptyMessage}
                  </div>
                )}
                {flatItems.map(item => {
                  if (item.type === "group") {
                    const go = enabledFiltered.filter(
                      o => o.group === item.groupKey
                    );
                    const ag = go.every(o => selected.includes(o.value));
                    const sg = go.some(o => selected.includes(o.value)) && !ag;
                    return (
                      <div
                        key={`g-${item.groupKey}`}
                        className={`${base}__group-header ${selectGroup ? `${base}__group-header--clickable` : ""}`}
                        role="presentation"
                        onClick={
                          selectGroup
                            ? () => toggleGroup(item.groupKey)
                            : undefined
                        }
                      >
                        {selectGroup && checkboxPosition === "left" && (
                          <span
                            className={`${base}__checkbox ${ag ? `${base}__checkbox--active` : ""} ${sg ? `${base}__checkbox--indeterminate` : ""}`}
                          >
                            {renderCheckbox(ag, sg)}
                          </span>
                        )}
                        <span className={`${base}__group-label`}>
                          {groupTemplate
                            ? groupTemplate(item.group, {
                                allSelected: ag,
                                someSelected: sg,
                              })
                            : item.group.label}
                        </span>
                        {selectGroup && checkboxPosition === "right" && (
                          <span
                            className={`${base}__checkbox ${ag ? `${base}__checkbox--active` : ""} ${sg ? `${base}__checkbox--indeterminate` : ""}`}
                          >
                            {renderCheckbox(ag, sg)}
                          </span>
                        )}
                      </div>
                    );
                  }
                  const { option, flatIndex } = item;
                  const isSel = selected.includes(option.value);
                  const isFoc = flatIndex === focusedIndex;
                  const isDis =
                    !!option.disabled ||
                    (!isSel &&
                      !!maxSelection &&
                      selected.length >= maxSelection);
                  return (
                    <div
                      key={option.value}
                      className={[
                        `${base}__option`,
                        isSel && `${base}__option--selected`,
                        isFoc && `${base}__option--focused`,
                        isDis && `${base}__option--disabled`,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      role="option"
                      aria-selected={isSel}
                      aria-disabled={isDis || undefined}
                      data-index={flatIndex}
                      onClick={
                        isDis ? undefined : () => toggleOption(option.value)
                      }
                      onMouseEnter={() => setFocusedIndex(flatIndex)}
                    >
                      {checkboxPosition === "left" && (
                        <span
                          className={`${base}__checkbox ${isSel ? `${base}__checkbox--active` : ""}`}
                        >
                          {renderCheckbox(isSel)}
                        </span>
                      )}
                      <span className={`${base}__option-label`}>
                        {optionTemplate
                          ? optionTemplate(option, {
                              selected: isSel,
                              focused: isFoc,
                              disabled: isDis,
                            })
                          : option.label}
                      </span>
                      {checkboxPosition === "right" && (
                        <span
                          className={`${base}__checkbox ${isSel ? `${base}__checkbox--active` : ""}`}
                        >
                          {renderCheckbox(isSel)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

    const triggerInner = (
      <>
        {iconLeft && (
          <span
            className={`${base}__icon ${base}__icon--left`}
            aria-hidden="true"
          >
            {iconLeft}
          </span>
        )}
        {triggerContent}
        {clearable && hasValue && !disabled && !readOnly && (
          <button
            type="button"
            className={`${base}__clear`}
            onClick={clearAll}
            tabIndex={-1}
            aria-label={locale.multiSelect.clearLabel}
          >
            {clearIcon}
          </button>
        )}
        <span
          className={`${base}__chevron ${open ? `${base}__chevron--open` : ""}`}
          aria-hidden="true"
        >
          {chevronIcon}
        </span>
      </>
    );

    const triggerEl = isFloating ? (
      <fieldset
        ref={triggerRef as React.Ref<HTMLFieldSetElement>}
        className={triggerClasses}
        disabled={disabled}
        onClick={handleTriggerClick}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-owns={dropdownId}
        aria-controls={dropdownId}
        aria-disabled={disabled || undefined}
        aria-required={required || undefined}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
      >
        {hasLabel && (
          <legend className={`${base}__legend`}>
            <span className={`${base}__legend-text`}>{legendText}</span>
          </legend>
        )}
        <div className={`${base}__trigger-inner`}>{triggerInner}</div>
        {hasLabel && (
          <label
            className={`${base}__floating-label ${hasValue || open ? `${base}__floating-label--active` : ""}`}
          >
            {label}
            {required && (
              <span className={`${base}__floating-required`} aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
      </fieldset>
    ) : (
      <div
        ref={triggerRef as React.Ref<HTMLDivElement>}
        className={triggerClasses}
        onClick={handleTriggerClick}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-owns={dropdownId}
        aria-controls={dropdownId}
        aria-disabled={disabled || undefined}
        aria-required={required || undefined}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
      >
        {triggerInner}
      </div>
    );

    const containerEl = (
      <div className={`${base}__container ${base}__container--${size}`}>
        {triggerEl}
      </div>
    );
    const hiddenInputs = name
      ? selected.map(v => <input key={v} type="hidden" name={name} value={v} />)
      : null;

    if (isFloating) {
      return (
        <div ref={wrapperRef} className={wrapperClasses} style={style}>
          {containerEl}
          {dropdownPanel}
          {hasError && errorMessage && (
            <span className={`${base}__error`} id={errorId} role="alert">
              {errorMessage}
            </span>
          )}
          {helperText && (
            <span
              className={[
                `${base}__helper`,
                helperSeverity && `${base}__helper--${helperSeverity}`,
              ]
                .filter(Boolean)
                .join(" ")}
              id={helperId}
            >
              {helperText}
            </span>
          )}
          {hiddenInputs}
        </div>
      );
    }

    if (!hasWrapper)
      return (
        <div ref={wrapperRef} className={wrapperClasses}>
          {containerEl}
          {dropdownPanel}
          {hiddenInputs}
        </div>
      );

    return (
      <div ref={wrapperRef} className={wrapperClasses}>
        <FieldWrapper
          label={label}
          htmlFor={selectId}
          required={required}
          helperText={helperText}
          error={errorMessage}
          success={success}
          helperSeverity={helperSeverity}
          size={size}
          disabled={disabled}
          fullWidth={fullWidth}
        >
          {containerEl}
        </FieldWrapper>
        {dropdownPanel}
        {hiddenInputs}
      </div>
    );
  }
);

MultiSelect.displayName = "MultiSelect";
