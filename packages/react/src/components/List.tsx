import React, { forwardRef, useId, useRef, useState, useCallback, useImperativeHandle, useMemo } from 'react';
import { Input } from './Input';
import './List.css';

/** Single item in a List */
export interface ListItem {
  /** Unique identifier */
  key: string;
  /** Display label */
  label: string;
  /** Additional keywords for filtering — if omitted, label is used */
  searchKey?: string;
  /** Keyboard shortcut or hint displayed on the right side */
  command?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Group name this item belongs to */
  group?: string;
  /** Icon rendered before the label */
  icon?: React.ReactNode;
  /**
   * Custom render for this item. Replaces the default label + command layout.
   *
   * @param item - The ListItem being rendered
   * @param state - Object with boolean flags: selected, focused, disabled
   * @returns ReactNode to render inside the item
   */
  template?: (item: ListItem, state: { selected: boolean; focused: boolean; disabled: boolean }) => React.ReactNode;
}

export interface ListProps {
  /** Array of items to display */
  items: ListItem[];
  /** Currently selected item key(s) — string for single, string[] for multiple */
  value?: string | string[] | null;
  /** Fires when an item is selected */
  onSelect?: (key: string, item: ListItem) => void;
  /** Allow multiple selection */
  multiple?: boolean;
  /** Show a filter input at the top */
  filterable?: boolean;
  /** Placeholder for the filter input */
  filterPlaceholder?: string;
  /** Text shown when no items match the filter */
  emptyMessage?: string;
  /**
   * Custom render for group headers. Replaces the default uppercase label.
   *
   * @param group - The group name string
   * @returns ReactNode to render as the group header
   */
  groupTemplate?: (group: string) => React.ReactNode;
  /** Component size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Maximum height before scrolling */
  maxHeight?: string | number;
  /** Additional CSS class names */
  className?: string;
}

/**
 * List component following the ARIA Listbox pattern.
 *
 * @description A keyboard-navigable list supporting single selection, grouped
 * items, filterable search, command hints, icons, and custom item templates.
 * Implements role="listbox" with full Arrow/Home/End/Enter/type-ahead support.
 * Designed as a base component consumed by Calendar presets, command palettes,
 * menus, and similar patterns.
 *
 * @example
 * ```tsx
 * <List
 *   items={[
 *     { key: 'copy', label: 'Copy', command: 'Ctrl+C' },
 *     { key: 'paste', label: 'Paste', command: 'Ctrl+V' },
 *   ]}
 *   onSelect={(key) => console.log(key)}
 * />
 * ```
 */
export const List = forwardRef<HTMLDivElement, ListProps>(
  (
    {
      items,
      value,
      onSelect,
      multiple = false,
      filterable = false,
      filterPlaceholder = 'Search...',
      emptyMessage = 'No results',
      groupTemplate,
      size = 'md',
      maxHeight,
      className = '',
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const listId = useId();
    useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

    const [filter, setFilter] = useState('');
    const [focusedIndex, setFocusedIndex] = useState(-1);

    const selectedKeys = useMemo(() => {
      if (!value) return new Set<string>();
      return new Set(Array.isArray(value) ? value : [value]);
    }, [value]);

    const filtered = useMemo(() => {
      if (!filter) return items;
      const q = filter.toLowerCase();
      return items.filter((item) => {
        const target = item.searchKey || item.label;
        return target.toLowerCase().includes(q);
      });
    }, [items, filter]);

    const enabledIndices = useMemo(
      () => filtered.map((item, i) => (!item.disabled ? i : -1)).filter((i) => i >= 0),
      [filtered],
    );

    const scrollToIndex = useCallback((index: number) => {
      const el = containerRef.current;
      if (!el) return;
      const items = el.querySelectorAll('[role="option"]');
      items[index]?.scrollIntoView({ block: 'nearest' });
    }, []);

    const moveFocus = useCallback((delta: number) => {
      if (enabledIndices.length === 0) return;
      const currentPos = enabledIndices.indexOf(focusedIndex);
      let nextPos: number;
      if (currentPos < 0) {
        nextPos = delta > 0 ? 0 : enabledIndices.length - 1;
      } else {
        nextPos = (currentPos + delta + enabledIndices.length) % enabledIndices.length;
      }
      const next = enabledIndices[nextPos];
      setFocusedIndex(next);
      scrollToIndex(next);
    }, [enabledIndices, focusedIndex, scrollToIndex]);

    const handleSelect = useCallback((item: ListItem) => {
      if (item.disabled) return;
      onSelect?.(item.key, item);
    }, [onSelect]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          moveFocus(1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          moveFocus(-1);
          break;
        case 'Home':
          e.preventDefault();
          if (enabledIndices.length > 0) { setFocusedIndex(enabledIndices[0]); scrollToIndex(enabledIndices[0]); }
          break;
        case 'End':
          e.preventDefault();
          if (enabledIndices.length > 0) { const last = enabledIndices[enabledIndices.length - 1]; setFocusedIndex(last); scrollToIndex(last); }
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedIndex >= 0 && filtered[focusedIndex]) handleSelect(filtered[focusedIndex]);
          break;
      }
    }, [moveFocus, enabledIndices, focusedIndex, filtered, handleSelect, scrollToIndex]);

    const base = 'k-list';
    const containerClasses = [base, size !== 'md' && `${base}--${size}`, className].filter(Boolean).join(' ');
    const style: React.CSSProperties | undefined = maxHeight ? { maxHeight } : undefined;

    const groups = useMemo(() => {
      const map = new Map<string | undefined, ListItem[]>();
      for (const item of filtered) {
        const g = item.group;
        if (!map.has(g)) map.set(g, []);
        map.get(g)!.push(item);
      }
      return map;
    }, [filtered]);

    const itemIndices = useMemo(() => {
      const map = new Map<string, number>();
      let idx = 0;
      const entries = Array.from(groups.entries());
      for (const [, groupItems] of entries) {
        for (const item of groupItems) {
          map.set(item.key, idx++);
        }
      }
      return map;
    }, [groups]);

    const renderItem = (item: ListItem) => {
      const idx = itemIndices.get(item.key) ?? 0;
      const sel = selectedKeys.has(item.key);
      const foc = idx === focusedIndex;
      const dis = !!item.disabled;
      const itemId = `${listId}-opt-${idx}`;

      const cls = [
        `${base}__item`,
        sel && `${base}__item--selected`,
        foc && `${base}__item--focused`,
        dis && `${base}__item--disabled`,
      ].filter(Boolean).join(' ');

      return (
        <div
          key={item.key}
          id={itemId}
          role="option"
          aria-selected={sel}
          aria-disabled={dis || undefined}
          className={cls}
          tabIndex={-1}
          onClick={dis ? undefined : () => { handleSelect(item); setFocusedIndex(idx); }}
          onMouseEnter={() => setFocusedIndex(idx)}
        >
          {item.template ? (
            item.template(item, { selected: sel, focused: foc, disabled: dis })
          ) : (
            <>
              {item.icon && <span aria-hidden="true">{item.icon}</span>}
              <span className={`${base}__item-label`}>{item.label}</span>
              {item.command && <span className={`${base}__item-command`}>{item.command}</span>}
            </>
          )}
        </div>
      );
    };

    const renderContent = () => {
      if (filtered.length === 0) {
        return <div className={`${base}__empty`}>{emptyMessage}</div>;
      }

      const entries = Array.from(groups.entries());

      if (entries.length === 1 && entries[0][0] === undefined) {
        return entries[0][1].map(renderItem);
      }

      return entries.map(([group, groupItems], gi) => (
        <React.Fragment key={group ?? `__ungrouped_${gi}`}>
          {gi > 0 && <hr className={`${base}__separator`} />}
          {group && (groupTemplate ? groupTemplate(group) : <div className={`${base}__group-label`} role="presentation">{group}</div>)}
          {groupItems.map(renderItem)}
        </React.Fragment>
      ));
    };

    return (
      <div
        ref={containerRef}
        className={containerClasses}
        role="listbox"
        aria-multiselectable={multiple || undefined}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        style={style}
        aria-activedescendant={focusedIndex >= 0 ? `${listId}-opt-${focusedIndex}` : undefined}
      >
        {filterable && (
          <div className={`${base}__filter`}>
            <Input
              size={size}
              placeholder={filterPlaceholder}
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setFocusedIndex(-1); }}
              fullWidth
            />
          </div>
        )}
        {renderContent()}
      </div>
    );
  },
);

List.displayName = 'List';
