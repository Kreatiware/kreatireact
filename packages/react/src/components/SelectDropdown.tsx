import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';

export interface SelectOption {
  /** Unique value */
  value: string | number;
  /** Display label */
  label: string;
  /** Option is disabled */
  disabled?: boolean;
  /** Group key this option belongs to */
  group?: string;
  /** Extra data passed to templates */
  data?: Record<string, unknown>;
}

export interface SelectGroup {
  /** Group key (matches SelectOption.group) */
  key: string;
  /** Display label for the group header */
  label: string;
}

export interface SelectDropdownProps {
  options: SelectOption[];
  groups?: SelectGroup[];
  value?: string | number | null;
  filterable?: boolean;
  filterPlaceholder?: string;
  focusedIndex: number;
  virtualScroll?: boolean;
  optionTemplate?: (option: SelectOption, state: { selected: boolean; focused: boolean; disabled: boolean }) => React.ReactNode;
  groupTemplate?: (group: SelectGroup) => React.ReactNode;
  emptyMessage?: string;
  onSelect: (option: SelectOption) => void;
  onMouseEnterOption: (index: number) => void;
  onFilterChange: (filter: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  dropdownId: string;
  autoFocusFilter?: boolean;
}

import { SEARCH_PATH } from './iconPaths';

const ITEM_HEIGHT = 36;

/**
 * Internal dropdown panel for the Select component.
 * Not exported from the package — used only by Select.
 */
export const SelectDropdown: React.FC<SelectDropdownProps> = ({
  options,
  groups,
  value,
  filterable,
  filterPlaceholder = 'Search...',
  focusedIndex,
  virtualScroll = false,
  optionTemplate,
  groupTemplate,
  emptyMessage = 'No results found',
  onSelect,
  onMouseEnterOption,
  onFilterChange,
  onKeyDown,
  dropdownId,
  autoFocusFilter = true,
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState('');
  const base = 'k-select';

  useEffect(() => {
    if (filterable && autoFocusFilter && filterRef.current) filterRef.current.focus();
  }, [filterable, autoFocusFilter]);

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFilter(val);
    onFilterChange(val);
  }, [onFilterChange]);

  const filtered = useMemo(() => {
    if (!filterable || !filter) return options;
    const lower = filter.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(lower));
  }, [options, filter, filterable]);

  const flatItems = useMemo(() => {
    if (!groups || groups.length === 0) return filtered.map((o, i) => ({ type: 'option' as const, option: o, flatIndex: i }));

    const items: Array<{ type: 'group'; group: SelectGroup } | { type: 'option'; option: SelectOption; flatIndex: number }> = [];
    let idx = 0;
    for (const g of groups) {
      const groupOptions = filtered.filter((o) => o.group === g.key);
      if (groupOptions.length === 0) continue;
      items.push({ type: 'group', group: g });
      for (const o of groupOptions) {
        items.push({ type: 'option', option: o, flatIndex: idx++ });
      }
    }
    const ungrouped = filtered.filter((o) => !o.group);
    for (const o of ungrouped) {
      items.push({ type: 'option', option: o, flatIndex: idx++ });
    }
    return items;
  }, [filtered, groups]);

  const scrollToFocused = useCallback(() => {
    if (!listRef.current || focusedIndex < 0) return;
    const el = listRef.current.querySelector(`[data-index="${focusedIndex}"]`) as HTMLElement | null;
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [focusedIndex]);

  useEffect(() => {
    scrollToFocused();
  }, [scrollToFocused]);

  const filterBar = filterable ? (
    <div className={`${base}__filter`}>
      <svg className={`${base}__filter-icon`} width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d={SEARCH_PATH} />
      </svg>
      <input
        ref={filterRef}
        className={`${base}__filter-input`}
        type="text"
        value={filter}
        onChange={handleFilterChange}
        onKeyDown={onKeyDown}
        placeholder={filterPlaceholder}
        aria-label="Filter options"
        autoComplete="off"
      />
    </div>
  ) : null;

  const renderOptions = () => {
    if (filtered.length === 0) {
      return <div className={`${base}__empty`}>{emptyMessage}</div>;
    }

    if (virtualScroll && !groups) {
      const totalHeight = filtered.length * ITEM_HEIGHT;
      return (
        <div ref={listRef} className={`${base}__options ${base}__options--virtual`}>
          <div style={{ height: totalHeight, position: 'relative' }}>
            <VirtualItems
              options={filtered}
              value={value}
              focusedIndex={focusedIndex}
              optionTemplate={optionTemplate}
              onSelect={onSelect}
              onMouseEnterOption={onMouseEnterOption}
              containerRef={listRef}
              base={base}
            />
          </div>
        </div>
      );
    }

    return (
      <div ref={listRef} className={`${base}__options`}>
        {flatItems.map((item, i) => {
          if (item.type === 'group') {
            return (
              <div key={`g-${item.group.key}`} className={`${base}__group-header`} role="presentation" aria-hidden="true">
                {groupTemplate ? groupTemplate(item.group) : item.group.label}
              </div>
            );
          }

          const { option, flatIndex } = item;
          const selected = option.value === value;
          const focused = flatIndex === focusedIndex;

          return (
            <div
              key={option.value}
              className={[
                `${base}__option`,
                selected && `${base}__option--selected`,
                focused && `${base}__option--focused`,
                option.disabled && `${base}__option--disabled`,
              ].filter(Boolean).join(' ')}
              role="option"
              aria-selected={selected}
              aria-disabled={option.disabled || undefined}
              data-index={flatIndex}
              onClick={option.disabled ? undefined : () => onSelect(option)}
              onMouseEnter={() => onMouseEnterOption(flatIndex)}
            >
              {optionTemplate
                ? optionTemplate(option, { selected, focused, disabled: !!option.disabled })
                : option.label}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`${base}__dropdown`} role="listbox" id={dropdownId}>
      {filterBar}
      {renderOptions()}
    </div>
  );
};

interface VirtualItemsProps {
  options: SelectOption[];
  value?: string | number | null;
  focusedIndex: number;
  optionTemplate?: SelectDropdownProps['optionTemplate'];
  onSelect: (option: SelectOption) => void;
  onMouseEnterOption: (index: number) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  base: string;
}

const VirtualItems: React.FC<VirtualItemsProps> = ({
  options,
  value,
  focusedIndex,
  optionTemplate,
  onSelect,
  onMouseEnterOption,
  containerRef,
  base,
}) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  const [containerHeight, setContainerHeight] = React.useState(256);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setContainerHeight(el.clientHeight);
    const onScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [containerRef]);

  const startIdx = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - 2);
  const visibleCount = Math.ceil(containerHeight / ITEM_HEIGHT) + 4;
  const endIdx = Math.min(options.length, startIdx + visibleCount);

  const visible = [];
  for (let i = startIdx; i < endIdx; i++) {
    const option = options[i];
    const selected = option.value === value;
    const focused = i === focusedIndex;

    visible.push(
      <div
        key={option.value}
        className={[
          `${base}__option`,
          selected && `${base}__option--selected`,
          focused && `${base}__option--focused`,
          option.disabled && `${base}__option--disabled`,
        ].filter(Boolean).join(' ')}
        role="option"
        aria-selected={selected}
        aria-disabled={option.disabled || undefined}
        data-index={i}
        style={{ position: 'absolute', top: i * ITEM_HEIGHT, left: 0, right: 0, height: ITEM_HEIGHT }}
        onClick={option.disabled ? undefined : () => onSelect(option)}
        onMouseEnter={() => onMouseEnterOption(i)}
      >
        {optionTemplate
          ? optionTemplate(option, { selected, focused, disabled: !!option.disabled })
          : option.label}
      </div>,
    );
  }

  return <>{visible}</>;
};
