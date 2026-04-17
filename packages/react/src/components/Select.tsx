import React, { forwardRef, useId, useRef, useState, useCallback, useEffect, useMemo, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import { SelectDropdown } from './SelectDropdown';
import type { SelectOption, SelectGroup } from './SelectDropdown';
import { FieldWrapper } from './FieldWrapper';
import { useKreatiLocale } from '../locale';
import { useOverlayPosition } from './useOverlayPosition';
import { useLayerZIndex } from './LayerContext';
import { CHEVRON_DOWN_PATH, TIMES_PATH } from './iconPaths';
import './Select.css';

export type { SelectOption, SelectGroup } from './SelectDropdown';

export interface SelectProps {
  /** Array of selectable options */
  options: SelectOption[];
  /** Option groups with headers */
  groups?: SelectGroup[];
  /** Selected value (controlled) */
  value?: string | number | null;
  /** Default selected value (uncontrolled) */
  defaultValue?: string | number | null;
  /** Fires when selection changes */
  onChange?: (value: string | number | null, option: SelectOption | null) => void;
  /** Visual variant: floating (label on border) or stacked (label above) */
  variant?: 'floating' | 'stacked';
  /** Component size — matches Input/Button sizes */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Label text */
  label?: string;
  /** Placeholder when no value is selected */
  placeholder?: string;
  /** Allow typing a custom value not in the options list */
  editable?: boolean;
  /** Filter options as the user types */
  filterable?: boolean;
  /** Show clear button (Times icon) when a value is selected */
  clearable?: boolean;
  /** Enable virtual scrolling for large option lists */
  virtualScroll?: boolean;
  /** Custom dropdown toggle icon — defaults to ChevronDown */
  dropdownIcon?: React.ReactNode;
  /** Icon rendered on the left side of the trigger */
  iconLeft?: React.ReactNode;
  /** Custom render for the selected value display */
  selectedTemplate?: (option: SelectOption) => React.ReactNode;
  /** Custom render for each option in the dropdown */
  optionTemplate?: (option: SelectOption, state: { selected: boolean; focused: boolean; disabled: boolean }) => React.ReactNode;
  /** Custom render for group headers */
  groupTemplate?: (group: SelectGroup) => React.ReactNode;
  /** Placeholder for the filter input inside the dropdown */
  filterPlaceholder?: string;
  /** Message shown when filter yields no results */
  emptyMessage?: string;
  /** Helper text below the select */
  helperText?: React.ReactNode;
  /** Error message or boolean */
  error?: React.ReactNode | boolean;
  /** Success state */
  success?: boolean;
  /** Helper text severity color */
  helperSeverity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'help' | 'danger' | 'accent';
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
  /** Fires when the dropdown opens */
  onOpen?: () => void;
  /** Fires when the dropdown closes */
  onClose?: () => void;
  /** Fires when the editable input value changes */
  onInputChange?: (value: string) => void;
  /** Blur handler — fires when focus leaves the select entirely */
  onBlur?: () => void;
}

/**
 * Select component for single-value selection from a dropdown list.
 *
 * @description A fully custom select with floating/stacked label variants,
 * keyboard navigation, ARIA combobox pattern, filterable/editable modes,
 * clearable, grouped options, virtual scroll, and custom templates.
 * Sizes and states match the Input component for visual consistency.
 *
 * @example
 * ```tsx
 * <Select
 *   label="Country"
 *   options={[
 *     { value: 'us', label: 'United States' },
 *     { value: 'mx', label: 'Mexico' },
 *   ]}
 *   onChange={(val, opt) => console.log(val, opt)}
 * />
 * ```
 */
export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      groups,
      value: controlledValue,
      defaultValue,
      onChange,
      variant = 'floating',
      size = 'md',
      label,
      placeholder,
      editable = false,
      filterable = false,
      clearable = false,
      virtualScroll = false,
      dropdownIcon,
      iconLeft,
      selectedTemplate,
      optionTemplate,
      groupTemplate,
      emptyMessage,
      filterPlaceholder,
      helperText,
      error,
      success = false,
      helperSeverity,
      disabled = false,
      readOnly = false,
      required = false,
      fullWidth = false,
      name,
      className = '',
      style,
      onOpen,
      onClose,
      onInputChange,
      onBlur,
    },
    ref,
  ) => {
    const autoId = useId();
    const selectId = name || autoId;
    const dropdownId = `${selectId}-listbox`;
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const triggerRef = useRef<HTMLElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => wrapperRef.current as HTMLDivElement);

    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState<string | number | null>(defaultValue ?? null);
    const selectedValue = isControlled ? controlledValue : internalValue;

    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState('');
    const [editableText, setEditableText] = useState('');
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [userNavigated, setUserNavigated] = useState(false);

    const { coords: overlayCoords, positioned: overlayPositioned } = useOverlayPosition(
      triggerRef as React.RefObject<HTMLElement>,
      panelRef as React.RefObject<HTMLElement>,
      open,
    );
    const { child: childZ } = useLayerZIndex();

    const locale = useKreatiLocale();
    const hasError = !!error;
    const errorMessage = typeof error === 'boolean' ? undefined : error;
    const isFloating = variant === 'floating';
    const hasLabel = !!label;
    const hasWrapper = !isFloating && !!(label || helperText || errorMessage);
    const base = 'k-select';

    const selectedOption = useMemo(
      () => options.find((o) => o.value === selectedValue) ?? null,
      [options, selectedValue],
    );

    const filteredOptions = useMemo(() => {
      if (!filterable || !filter) return options;
      const lower = filter.toLowerCase();
      return options.filter((o) => o.label.toLowerCase().includes(lower));
    }, [options, filter, filterable]);

    const handleFilterChange = useCallback((f: string) => {
      setFilter(f);
      setFocusedIndex(0);
    }, []);

    const helperId = `${selectId}-helper`;
    const errorId = `${selectId}-error`;
    const describedBy = [hasError && errorId, helperId].filter(Boolean).join(' ') || undefined;

    const hasValue = selectedValue !== null && selectedValue !== undefined && selectedValue !== '';
    const displayText = selectedOption ? selectedOption.label : (editable && hasValue ? String(selectedValue) : '');

    const openDropdown = useCallback(() => {
      if (disabled || readOnly || open) return;
      setOpen(true);
      setFocusedIndex(selectedOption ? filteredOptions.findIndex((o) => o.value === selectedValue) : 0);
      setUserNavigated(false);
      onOpen?.();
    }, [disabled, readOnly, open, selectedOption, filteredOptions, selectedValue, onOpen]);

    const closeDropdown = useCallback((commitEditable = true) => {
      if (!open) return;
      if (editable && commitEditable && editableText.trim()) {
        const match = options.find((o) => o.label.toLowerCase() === editableText.trim().toLowerCase());
        if (match) {
          if (!isControlled) setInternalValue(match.value);
          onChange?.(match.value, match);
        } else {
          if (!isControlled) setInternalValue(editableText.trim());
          onChange?.(editableText.trim(), null);
        }
      }
      setOpen(false);
      setFilter('');
      setFocusedIndex(-1);
      setEditableText('');
      setUserNavigated(false);
      onClose?.();
      onBlur?.();
    }, [open, editable, editableText, options, isControlled, onChange, onClose, onBlur]);

    const selectOption = useCallback((option: SelectOption) => {
      if (!isControlled) setInternalValue(option.value);
      onChange?.(option.value, option);
      setFilter('');
      closeDropdown(false);
      triggerRef.current?.focus();
    }, [isControlled, onChange, closeDropdown]);

    const clearValue = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isControlled) setInternalValue(null);
      onChange?.(null, null);
      setFilter('');
      setEditableText('');
      triggerRef.current?.focus();
    }, [isControlled, onChange]);

    const handleTriggerClick = useCallback(() => {
      if (open) closeDropdown(true);
      else openDropdown();
    }, [open, openDropdown, closeDropdown]);

    const handleEditableChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setEditableText(val);
      onInputChange?.(val);
      if (!open) openDropdown();
    }, [open, openDropdown, onInputChange]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (disabled || readOnly) return;

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          if (!open) { openDropdown(); return; }
          setUserNavigated(true);
          setFocusedIndex((prev) => {
            let next = prev + 1;
            while (next < filteredOptions.length && filteredOptions[next].disabled) next++;
            return next < filteredOptions.length ? next : prev;
          });
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          if (!open) { openDropdown(); return; }
          setUserNavigated(true);
          setFocusedIndex((prev) => {
            let next = prev - 1;
            while (next >= 0 && filteredOptions[next].disabled) next--;
            return next >= 0 ? next : prev;
          });
          break;
        }
        case 'Enter': {
          e.preventDefault();
          if (open && (!editable || userNavigated) && focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
            selectOption(filteredOptions[focusedIndex]);
          } else if (open && editable) {
            closeDropdown();
          } else if (!open) {
            openDropdown();
          }
          break;
        }
        case ' ': {
          if (!editable) {
            e.preventDefault();
            if (open && focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
              selectOption(filteredOptions[focusedIndex]);
            } else if (!open) {
              openDropdown();
            }
          }
          break;
        }
        case 'Escape': {
          e.preventDefault();
          closeDropdown();
          break;
        }
        case 'Tab': {
          closeDropdown();
          break;
        }
        case 'Home': {
          if (open) { e.preventDefault(); setFocusedIndex(0); }
          break;
        }
        case 'End': {
          if (open) { e.preventDefault(); setFocusedIndex(filteredOptions.length - 1); }
          break;
        }
      }
    }, [disabled, readOnly, open, focusedIndex, filteredOptions, editable, openDropdown, closeDropdown, selectOption]);

    useEffect(() => {
      if (!open) return;
      const onClickOutside = (e: MouseEvent) => {
        if (wrapperRef.current?.contains(e.target as Node)) return;
        if (panelRef.current?.contains(e.target as Node)) return;
        closeDropdown();
      };
      document.addEventListener('mousedown', onClickOutside);
      return () => document.removeEventListener('mousedown', onClickOutside);
    }, [open, closeDropdown]);

    useEffect(() => {
      if (open && editable && inputRef.current) inputRef.current.focus();
    }, [open, editable]);

    const chevronIcon = dropdownIcon || (
      <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d={CHEVRON_DOWN_PATH} />
      </svg>
    );

    const clearIcon = (
      <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d={TIMES_PATH} />
      </svg>
    );

    const triggerContent = editable ? (
      <input
        ref={inputRef}
        className={`${base}__input`}
        value={open ? editableText : displayText}
        placeholder={hasValue && !open ? undefined : (placeholder || (hasLabel && isFloating ? ' ' : undefined))}
        onChange={handleEditableChange}
        disabled={disabled}
        readOnly={readOnly}
        tabIndex={-1}
      />
    ) : (
      <span className={`${base}__value ${!hasValue ? `${base}__value--placeholder` : ''}`}>
        {hasValue && selectedOption
          ? (selectedTemplate ? selectedTemplate(selectedOption) : displayText)
          : (placeholder || (hasLabel && isFloating ? '\u00A0' : ''))}
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
    ].filter(Boolean).join(' ');

    const wrapperClasses = [
      base,
      `${base}--${variant}`,
      fullWidth && `${base}--full-width`,
      className,
    ].filter(Boolean).join(' ');

    const legendText = hasLabel ? `${label}${required ? ' *' : ''}` : '';

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
        aria-activedescendant={open && focusedIndex >= 0 ? `${dropdownId}-opt-${focusedIndex}` : undefined}
      >
        {hasLabel && (
          <legend className={`${base}__legend`}>
            <span className={`${base}__legend-text`}>{legendText}</span>
          </legend>
        )}
        <div className={`${base}__trigger-inner`}>
          {iconLeft && <span className={`${base}__icon ${base}__icon--left`} aria-hidden="true">{iconLeft}</span>}
          {triggerContent}
          {clearable && hasValue && !disabled && !readOnly && (
            <button type="button" className={`${base}__clear`} onClick={clearValue} tabIndex={-1} aria-label={locale.select.clearLabel}>
              {clearIcon}
            </button>
          )}
          <span className={`${base}__chevron ${open ? `${base}__chevron--open` : ''}`} aria-hidden="true">
            {chevronIcon}
          </span>
        </div>
        {hasLabel && (
          <label className={`${base}__floating-label ${hasValue || open ? `${base}__floating-label--active` : ''}`}>
            {label}
            {required && <span className={`${base}__floating-required`} aria-hidden="true">*</span>}
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
        aria-activedescendant={open && focusedIndex >= 0 ? `${dropdownId}-opt-${focusedIndex}` : undefined}
      >
        {iconLeft && <span className={`${base}__icon ${base}__icon--left`} aria-hidden="true">{iconLeft}</span>}
        {triggerContent}
        {clearable && hasValue && !disabled && !readOnly && (
          <button type="button" className={`${base}__clear`} onClick={clearValue} tabIndex={-1} aria-label={locale.select.clearLabel}>
            {clearIcon}
          </button>
        )}
        <span className={`${base}__chevron ${open ? `${base}__chevron--open` : ''}`} aria-hidden="true">
          {chevronIcon}
        </span>
      </div>
    );

    const dropdownPanel = open ? createPortal(
      <div
        ref={panelRef}
        className={`${base}__dropdown-portal ${overlayPositioned ? `${base}__dropdown-portal--visible` : ''}`}
        style={{ position: 'fixed', top: overlayCoords.top, left: overlayCoords.left, minWidth: overlayCoords.minWidth, zIndex: childZ }}
      >
        <SelectDropdown
          options={filteredOptions}
          groups={groups}
          value={selectedValue}
          filterable={filterable}
          filterPlaceholder={filterPlaceholder || locale.select.filterPlaceholder}
          focusedIndex={focusedIndex}
          virtualScroll={virtualScroll}
          optionTemplate={optionTemplate}
          groupTemplate={groupTemplate}
          emptyMessage={emptyMessage || locale.select.emptyMessage}
          onSelect={selectOption}
          onMouseEnterOption={setFocusedIndex}
          onFilterChange={handleFilterChange}
          onKeyDown={handleKeyDown}
          dropdownId={dropdownId}
        />
      </div>,
      document.body,
    ) : null;

    /* -- Floating variant -- */
    if (isFloating) {
      return (
        <div ref={wrapperRef} className={wrapperClasses} style={style}>
          <div className={`${base}__container ${base}__container--${size}`}>
            {triggerEl}
          </div>
          {dropdownPanel}
          {hasError && errorMessage && (
            <span className={`${base}__error`} id={errorId} role="alert">{errorMessage}</span>
          )}
          {helperText && (
            <span
              className={[
                `${base}__helper`,
                helperSeverity && `${base}__helper--${helperSeverity}`,
              ].filter(Boolean).join(' ')}
              id={helperId}
            >
              {helperText}
            </span>
          )}
          {name && <input type="hidden" name={name} value={selectedValue ?? ''} />}
        </div>
      );
    }

    /* -- Stacked variant -- */
    const containerEl = (
      <div className={`${base}__container ${base}__container--${size}`}>
        {triggerEl}
      </div>
    );

    if (!hasWrapper) {
      return (
        <div ref={wrapperRef} className={wrapperClasses}>
          {containerEl}
          {dropdownPanel}
          {name && <input type="hidden" name={name} value={selectedValue ?? ''} />}
        </div>
      );
    }

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
        {name && <input type="hidden" name={name} value={selectedValue ?? ''} />}
      </div>
    );
  },
);

Select.displayName = 'Select';
