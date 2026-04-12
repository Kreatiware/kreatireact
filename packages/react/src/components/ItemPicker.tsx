import React, { forwardRef, useState, useMemo, useCallback, useRef, useImperativeHandle, useId } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { FieldWrapper } from './FieldWrapper';
import { CHECK_PATH, CHEVRON_RIGHT_PATH, CHEVRON_LEFT_PATH, CHEVRON_UP_PATH, CHEVRON_DOWN_PATH, DOUBLE_ARROW_RIGHT_PATH, DOUBLE_ARROW_LEFT_PATH } from './iconPaths';
import { useKreatiLocale } from '../locale';
import './ItemPicker.css';

/** Single item in an ItemPicker list */
export interface ItemPickerItem {
  /** Unique value identifier */
  value: string;
  /** Display label */
  label: string;
  /** Icon rendered before the label */
  icon?: React.ReactNode;
  /** Disabled — cannot be selected or moved */
  disabled?: boolean;
  /** Additional CSS class names for this item */
  className?: string;
  /** Inline styles for this item */
  style?: React.CSSProperties;
}

export interface ItemPickerProps {
  /** All available items (source of truth) */
  items: ItemPickerItem[];
  /** Values currently in the target list — order is preserved */
  value?: string[];
  /** Fires when the target list changes (values in current order) */
  onChange?: (targetValues: string[]) => void;
  /** Source panel header */
  sourceHeader?: React.ReactNode;
  /** Target panel header */
  targetHeader?: React.ReactNode;
  /** Show filter input on both panels */
  filterable?: boolean;
  /** Placeholder for filter inputs */
  filterPlaceholder?: string;
  /** Text shown when a panel has no items */
  emptyMessage?: string;
  /** Enable drag and drop between and within panels */
  dragDrop?: boolean;
  /** Show item count in headers */
  showCount?: boolean;
  /**
   * Custom render for each item.
   *
   * @param item - The ItemPickerItem being rendered
   * @param state - Object with boolean flags: selected, disabled
   * @returns ReactNode to render inside the item row
   */
  itemTemplate?: (item: ItemPickerItem, state: { selected: boolean; disabled: boolean }) => React.ReactNode;
  /** Maximum height of each list panel */
  listHeight?: string | number;
  /** Show reorder up/down buttons — 'source' | 'target' | 'both' | false */
  reorderable?: 'source' | 'target' | 'both' | false;
  /** Full width mode */
  fullWidth?: boolean;
  /** HTML name for hidden input (form compatibility) */
  name?: string;
  /** Blur handler — Formik compatible */
  onBlur?: () => void;
  /** Disabled state — disables all interactions */
  disabled?: boolean;
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: React.ReactNode;
  /** Error message or boolean */
  error?: React.ReactNode | boolean;
  /** Success state */
  success?: boolean;
  /** Required indicator */
  required?: boolean;
  /** Component size for FieldWrapper */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Helper severity */
  helperSeverity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'help' | 'danger';
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

const iconSvg = (path: string) => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d={path} />
  </svg>
);

/**
 * ItemPicker component for moving and reordering items between two lists.
 *
 * @description A dual-panel list with controls to move items between source
 * and target. Supports multiple selection via checkboxes, optional filtering,
 * drag and drop (between panels and within panels for reordering), reordering
 * with arrow buttons, custom item templates, FieldWrapper integration for
 * label/error/helper, and full keyboard navigation. Compatible with Formik
 * and React Hook Form via name, value, onChange, onBlur, and a hidden input.
 *
 * @example
 * ```tsx
 * <ItemPicker
 *   items={[
 *     { value: '1', label: 'Item 1' },
 *     { value: '2', label: 'Item 2' },
 *   ]}
 *   value={['2']}
 *   onChange={(vals) => console.log(vals)}
 *   filterable
 *   reorderable="both"
 *   label="Pick items"
 *   helperText="Drag to reorder"
 * />
 * ```
 */
export const ItemPicker = forwardRef<HTMLDivElement, ItemPickerProps>(
  (
    {
      items,
      value = [],
      onChange,
      sourceHeader,
      targetHeader,
      filterable = false,
      filterPlaceholder,
      emptyMessage,
      dragDrop = false,
      showCount = true,
      itemTemplate,
      listHeight = '300px',
      reorderable = false,
      fullWidth = false,
      name,
      onBlur,
      disabled = false,
      label,
      helperText,
      error,
      success = false,
      required = false,
      size = 'md',
      helperSeverity,
      className = '',
      style,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

    const baseId = useId();
    const locale = useKreatiLocale();
    const resolvedFilterPlaceholder = filterPlaceholder ?? locale.transfer.filterPlaceholder;
    const resolvedEmptyMessage = emptyMessage ?? locale.transfer.emptyMessage;
    const resolvedSourceHeader = sourceHeader ?? locale.transfer.sourceHeader;
    const resolvedTargetHeader = targetHeader ?? locale.transfer.targetHeader;

    const hasError = !!error;
    const errorMessage = typeof error === 'boolean' ? undefined : error;

    const targetSet = useMemo(() => new Set(value), [value]);

    const [sourceSelected, setSourceSelected] = useState<Set<string>>(new Set());
    const [targetSelected, setTargetSelected] = useState<Set<string>>(new Set());
    const [sourceFilter, setSourceFilter] = useState('');
    const [targetFilter, setTargetFilter] = useState('');
    const [dropIndicator, setDropIndicator] = useState<{ panel: 'source' | 'target'; index: number } | null>(null);
    const [sourceOrder, setSourceOrder] = useState<string[]>(() => items.map((i) => i.value));

    const itemMap = useMemo(() => new Map(items.map((i) => [i.value, i])), [items]);
    const prevItemKeys = useRef(new Set(items.map((i) => i.value)));
    useMemo(() => {
      const currentKeys = new Set(items.map((i) => i.value));
      const added = items.filter((i) => !prevItemKeys.current.has(i.value)).map((i) => i.value);
      if (added.length > 0) {
        setSourceOrder((prev) => [...prev.filter((v) => currentKeys.has(v)), ...added]);
      } else {
        setSourceOrder((prev) => prev.filter((v) => currentKeys.has(v)));
      }
      prevItemKeys.current = currentKeys;
    }, [items]);

    const sourceItems = useMemo(
      () => sourceOrder.filter((v) => !targetSet.has(v) && itemMap.has(v)).map((v) => itemMap.get(v)!),
      [sourceOrder, targetSet, itemMap],
    );
    const targetItems = useMemo(
      () => value.filter((v) => itemMap.has(v)).map((v) => itemMap.get(v)!),
      [value, itemMap],
    );

    const filterList = useCallback((list: ItemPickerItem[], query: string) => {
      if (!query) return list;
      const q = query.toLowerCase();
      return list.filter((i) => i.label.toLowerCase().includes(q));
    }, []);

    const filteredSource = useMemo(() => filterList(sourceItems, sourceFilter), [sourceItems, sourceFilter, filterList]);
    const filteredTarget = useMemo(() => filterList(targetItems, targetFilter), [targetItems, targetFilter, filterList]);

    const toggleSelection = useCallback((setFn: React.Dispatch<React.SetStateAction<Set<string>>>, val: string) => {
      setFn((prev) => {
        const next = new Set(prev);
        if (next.has(val)) next.delete(val); else next.add(val);
        return next;
      });
    }, []);

    const emit = useCallback((nextTarget: string[]) => {
      onChange?.(nextTarget);
    }, [onChange]);

    /* ── Move between panels ── */
    const moveToTarget = useCallback(() => {
      const toMove = [...sourceSelected].filter((v) => itemMap.has(v) && !targetSet.has(v));
      if (toMove.length === 0) return;
      emit([...value, ...toMove]);
      setSourceSelected(new Set());
    }, [sourceSelected, value, itemMap, targetSet, emit]);

    const moveToSource = useCallback(() => {
      const toRemove = new Set(
        [...targetSelected].filter((v) => itemMap.has(v) && targetSet.has(v)),
      );
      if (toRemove.size === 0) return;
      emit(value.filter((v) => !toRemove.has(v)));
      setTargetSelected(new Set());
    }, [targetSelected, value, itemMap, targetSet, emit]);

    const moveAllToTarget = useCallback(() => {
      const movable = sourceItems.map((i) => i.value);
      if (movable.length === 0) return;
      emit([...value, ...movable]);
      setSourceSelected(new Set());
    }, [sourceItems, value, emit]);

    const moveAllToSource = useCallback(() => {
      emit([]);
      setTargetSelected(new Set());
    }, [emit]);

    /* ── Reorder ── */
    const reorderUp = useCallback((arr: string[], sel: Set<string>): string[] => {
      const next = [...arr];
      for (let i = 1; i < next.length; i++) {
        if (sel.has(next[i])) {
          // Find nearest non-selected item above to swap with
          let j = i - 1;
          while (j >= 0 && sel.has(next[j])) j--;
          if (j >= 0) {
            const item = next.splice(i, 1)[0];
            next.splice(j, 0, item);
          }
        }
      }
      return next;
    }, []);

    const reorderDown = useCallback((arr: string[], sel: Set<string>): string[] => {
      const next = [...arr];
      for (let i = next.length - 2; i >= 0; i--) {
        if (sel.has(next[i])) {
          let j = i + 1;
          while (j < next.length && sel.has(next[j])) j++;
          if (j < next.length) {
            const item = next.splice(i, 1)[0];
            next.splice(j, 0, item);
          }
        }
      }
      return next;
    }, []);

    const moveSourceUp = useCallback(() => {
      setSourceOrder((prev) => {
        const sourceVals = prev.filter((v) => !targetSet.has(v));
        const reordered = reorderUp(sourceVals, sourceSelected);
        const result: string[] = [];
        let si = 0;
        for (const v of prev) {
          if (targetSet.has(v)) { result.push(v); } else { result.push(reordered[si++]); }
        }
        return result;
      });
    }, [targetSet, sourceSelected, reorderUp]);

    const moveSourceDown = useCallback(() => {
      setSourceOrder((prev) => {
        const sourceVals = prev.filter((v) => !targetSet.has(v));
        const reordered = reorderDown(sourceVals, sourceSelected);
        const result: string[] = [];
        let si = 0;
        for (const v of prev) {
          if (targetSet.has(v)) { result.push(v); } else { result.push(reordered[si++]); }
        }
        return result;
      });
    }, [targetSet, sourceSelected, reorderDown]);

    const moveTargetUp = useCallback(() => emit(reorderUp(value, targetSelected)), [value, targetSelected, reorderUp, emit]);
    const moveTargetDown = useCallback(() => emit(reorderDown(value, targetSelected)), [value, targetSelected, reorderDown, emit]);

    /* ── Drag & Drop ── */
    const dragData = useRef<{ from: 'source' | 'target'; values: string[] } | null>(null);

    const handleDragStart = useCallback((e: React.DragEvent, item: ItemPickerItem, from: 'source' | 'target') => {
      if (disabled) { e.preventDefault(); return; }
      const selected = from === 'source' ? sourceSelected : targetSelected;
      let dragValues: string[];
      if (selected.has(item.value)) {
        dragValues = [...selected];
      } else {
        dragValues = [item.value];
        if (from === 'source') setSourceSelected(new Set([item.value]));
        else setTargetSelected(new Set([item.value]));
      }
      dragData.current = { from, values: dragValues };
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', item.value);
    }, [disabled, sourceSelected, targetSelected]);

    const getDropValue = useCallback((e: React.DragEvent, panelEl: HTMLElement): string | null => {
      const listEl = panelEl.querySelector('[role="listbox"]');
      if (!listEl) return null;
      const options = Array.from(listEl.querySelectorAll<HTMLElement>('[role="option"]'));
      for (const opt of options) {
        const rect = opt.getBoundingClientRect();
        if (e.clientY < rect.top + rect.height / 2) return opt.dataset.value ?? null;
      }
      return null;
    }, []);

    const getVisualIndex = useCallback((e: React.DragEvent, panelEl: HTMLElement): number => {
      const listEl = panelEl.querySelector('[role="listbox"]');
      if (!listEl) return 0;
      const options = Array.from(listEl.querySelectorAll<HTMLElement>('[role="option"]'));
      for (let i = 0; i < options.length; i++) {
        const rect = options[i].getBoundingClientRect();
        if (e.clientY < rect.top + rect.height / 2) return i;
      }
      return options.length;
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, panel: 'source' | 'target') => {
      if (!dragData.current) return;
      const dd = dragData.current;
      // Allow same-panel drag only if that panel is reorderable
      if (dd.from === panel) {
        const canReorder = (panel === 'source' && (reorderable === 'source' || reorderable === 'both'))
          || (panel === 'target' && (reorderable === 'target' || reorderable === 'both'));
        if (!canReorder) return;
      }
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const panelEl = (e.currentTarget as HTMLElement);
      const idx = getVisualIndex(e, panelEl);
      setDropIndicator({ panel, index: idx });
    }, [reorderable, getVisualIndex]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      const panelEl = e.currentTarget as HTMLElement;
      if (!panelEl.contains(e.relatedTarget as Node)) {
        setDropIndicator(null);
      }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, panel: 'source' | 'target') => {
      e.preventDefault();
      const dd = dragData.current;
      if (!dd) { setDropIndicator(null); return; }
      const panelEl = (e.currentTarget as HTMLElement);
      const beforeValue = getDropValue(e, panelEl);
      const dragVals = dd.values;
      const dragSet = new Set(dragVals);

      const insertAt = (arr: string[], items: string[]): string[] => {
        const without = arr.filter((v) => !dragSet.has(v));
        if (!beforeValue) { without.push(...items); return without; }
        const idx = without.indexOf(beforeValue);
        if (idx === -1) { without.push(...items); return without; }
        without.splice(idx, 0, ...items);
        return without;
      };

      if (dd.from === panel) {
        if (panel === 'target') {
          emit(insertAt(value, value.filter((v) => dragSet.has(v))));
        } else {
          setSourceOrder((prev) => {
            const sourceVals = prev.filter((v) => !targetSet.has(v));
            const result = insertAt(sourceVals, sourceVals.filter((v) => dragSet.has(v)));
            const out: string[] = [];
            let si = 0;
            for (const v of prev) {
              if (targetSet.has(v)) out.push(v); else out.push(result[si++]);
            }
            return out;
          });
        }
      } else if (panel === 'target') {
        emit(insertAt(value, dragVals));
        setSourceSelected(new Set());
      } else {
        // Target -> Source: remove from target and insert at drop position in source
        emit(value.filter((v) => !dragSet.has(v)));
        setSourceOrder((prev) => {
          // Remove dragged items from their old position in sourceOrder
          const without = prev.filter((v) => !dragSet.has(v));
          // Find insert position based on beforeValue (which is a source item)
          if (!beforeValue) { return [...without, ...dragVals]; }
          const idx = without.indexOf(beforeValue);
          if (idx === -1) { return [...without, ...dragVals]; }
          const result = [...without];
          result.splice(idx, 0, ...dragVals);
          return result;
        });
        setTargetSelected(new Set());
      }

      dragData.current = null;
      setDropIndicator(null);
    }, [value, targetSet, emit, getDropValue]);

    const handleDragEnd = useCallback(() => { dragData.current = null; setDropIndicator(null); }, []);

    /* ── Keyboard ── */
    const handleListKeyDown = useCallback((e: React.KeyboardEvent, setSelected: React.Dispatch<React.SetStateAction<Set<string>>>) => {
      const target = e.target as HTMLElement;
      const listEl = target.closest('[role="listbox"]');
      if (!listEl) return;
      const options = Array.from(listEl.querySelectorAll<HTMLElement>('[role="option"]'));
      const idx = options.indexOf(target);
      if (idx < 0) return;
      let next = -1;
      switch (e.key) {
        case 'ArrowDown': e.preventDefault(); next = idx < options.length - 1 ? idx + 1 : 0; break;
        case 'ArrowUp': e.preventDefault(); next = idx > 0 ? idx - 1 : options.length - 1; break;
        case 'Home': e.preventDefault(); next = 0; break;
        case 'End': e.preventDefault(); next = options.length - 1; break;
        case ' ': case 'Enter': { e.preventDefault(); const v = target.dataset.value; if (v) toggleSelection(setSelected, v); return; }
        default: return;
      }
      if (next >= 0) options[next].focus();
    }, [toggleSelection]);

    /* ── Render ── */
    const base = 'k-itempicker';

    const renderItem = (item: ItemPickerItem, selected: Set<string>, setSelected: React.Dispatch<React.SetStateAction<Set<string>>>, from: 'source' | 'target', indexInList: number) => {
      const isSel = selected.has(item.value);
      const isDis = !!item.disabled || disabled;
      const isGlobalDis = disabled;
      const showDropLine = dropIndicator?.panel === from && dropIndicator.index === indexInList;
      const cls = [
        `${base}__item`,
        isSel && `${base}__item--selected`,
        isDis && `${base}__item--disabled`,
        showDropLine && `${base}__item--drop-before`,
        item.className,
      ].filter(Boolean).join(' ');

      return (
        <div
          key={item.value}
          className={cls}
          style={item.style}
          role="option"
          aria-selected={isSel}
          aria-disabled={isGlobalDis || undefined}
          data-value={item.value}
          tabIndex={isGlobalDis ? -1 : 0}
          draggable={dragDrop && !isDis}
          onDragStart={(e) => handleDragStart(e, item, from)}
          onDragEnd={handleDragEnd}
          onClick={isGlobalDis ? undefined : () => toggleSelection(setSelected, item.value)}
          onKeyDown={isGlobalDis ? undefined : (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleSelection(setSelected, item.value); } }}
        >
          <span className={`${base}__checkbox`} aria-hidden="true">
            {isSel && <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor"><path d={CHECK_PATH} /></svg>}
          </span>
          {itemTemplate ? itemTemplate(item, { selected: isSel, disabled: isDis }) : (
            <>
              {item.icon && <span className={`${base}__item-icon`} aria-hidden="true">{item.icon}</span>}
              <span className={`${base}__item-label`}>{item.label}</span>
            </>
          )}
        </div>
      );
    };

    const renderPanel = (
      panelItems: ItemPickerItem[],
      filteredItems: ItemPickerItem[],
      selected: Set<string>,
      setSelected: React.Dispatch<React.SetStateAction<Set<string>>>,
      header: React.ReactNode,
      filter: string,
      setFilter: React.Dispatch<React.SetStateAction<string>>,
      panelId: 'source' | 'target',
      onUp?: () => void,
      onDown?: () => void,
    ) => {
      const isDropTarget = dropIndicator?.panel === panelId;
      const panelCls = [`${base}__panel`, isDropTarget && `${base}__panel--drop-active`].filter(Boolean).join(' ');
      const headerId = `${baseId}-${panelId}-header`;
      const hasSel = selected.size > 0;
      const showDropEnd = isDropTarget && dropIndicator!.index === filteredItems.length;

      return (
        <div
          className={panelCls}
          onDragOver={dragDrop ? (e) => handleDragOver(e, panelId) : undefined}
          onDragLeave={dragDrop ? handleDragLeave : undefined}
          onDrop={dragDrop ? (e) => handleDrop(e, panelId) : undefined}
        >
          <div className={`${base}__header`} id={headerId}>
            <span className={`${base}__header-title`}>{header}</span>
            <span className={`${base}__header-actions`}>
              {onUp && onDown && (
                <>
                  <button type="button" className={`${base}__reorder-btn`} onClick={onUp} disabled={disabled || !hasSel} aria-label={locale.transfer.moveUp} title={locale.transfer.moveUp}>
                    {iconSvg(CHEVRON_UP_PATH)}
                  </button>
                  <button type="button" className={`${base}__reorder-btn`} onClick={onDown} disabled={disabled || !hasSel} aria-label={locale.transfer.moveDown} title={locale.transfer.moveDown}>
                    {iconSvg(CHEVRON_DOWN_PATH)}
                  </button>
                </>
              )}
              {showCount && (
                <span className={`${base}__header-count`}>
                  {locale.transfer.itemCount.replace('{count}', String(panelItems.length))}
                </span>
              )}
            </span>
          </div>
          {filterable && (
            <div className={`${base}__filter`}>
              <Input type="search" size="sm" placeholder={resolvedFilterPlaceholder} value={filter} onChange={(e) => setFilter(e.target.value)} fullWidth disabled={disabled} />
            </div>
          )}
          <div
            className={`${base}__list`}
            role="listbox"
            aria-multiselectable={true}
            aria-labelledby={headerId}
            style={{ maxHeight: listHeight }}
            onKeyDown={(e) => handleListKeyDown(e, setSelected)}
          >
            {filteredItems.length === 0
              ? <div className={`${base}__empty`} role="status">{resolvedEmptyMessage}</div>
              : (
                <>
                  {filteredItems.map((item, i) => renderItem(item, selected, setSelected, panelId, i))}
                  {showDropEnd && <div className={`${base}__drop-line`} />}
                </>
              )
            }
          </div>
        </div>
      );
    };

    const hasSourceSel = [...sourceSelected].some((v) => itemMap.has(v) && !targetSet.has(v));
    const hasTargetSel = [...targetSelected].some((v) => itemMap.has(v) && targetSet.has(v));
    const hasMovableSource = sourceItems.length > 0;
    const hasMovableTarget = targetItems.length > 0;

    const sourceReorder = reorderable === 'source' || reorderable === 'both';
    const targetReorder = reorderable === 'target' || reorderable === 'both';

    const pickerEl = (
      <div
        ref={containerRef}
        className={[base, hasError && `${base}--error`, !hasError && success && `${base}--success`, fullWidth && `${base}--full-width`, className].filter(Boolean).join(' ')}
        style={!label && !helperText && !errorMessage ? style : undefined}
        role="group"
        aria-roledescription="item picker"
        aria-label={typeof label === 'string' ? label : 'Item Picker'}
        onBlur={onBlur ? (e) => { if (!containerRef.current?.contains(e.relatedTarget as Node)) onBlur(); } : undefined}
      >
        {name && <input type="hidden" name={name} value={JSON.stringify(value)} />}

        {renderPanel(sourceItems, filteredSource, sourceSelected, setSourceSelected, resolvedSourceHeader, sourceFilter, setSourceFilter, 'source', sourceReorder ? moveSourceUp : undefined, sourceReorder ? moveSourceDown : undefined)}

        <div className={`${base}__controls`} role="toolbar" aria-label="Item picker controls">
          <Button buttonType="outlined" severity="secondary" size="sm" rounded ariaLabel={locale.transfer.moveAllToTarget} tooltip={locale.transfer.moveAllToTarget} disabled={disabled || !hasMovableSource} onClick={moveAllToTarget} iconLeft={iconSvg(DOUBLE_ARROW_RIGHT_PATH)} />
          <Button buttonType="outlined" severity="primary" size="sm" rounded ariaLabel={locale.transfer.moveToTarget} tooltip={locale.transfer.moveToTarget} disabled={disabled || !hasSourceSel} onClick={moveToTarget} iconLeft={iconSvg(CHEVRON_RIGHT_PATH)} />
          <Button buttonType="outlined" severity="primary" size="sm" rounded ariaLabel={locale.transfer.moveToSource} tooltip={locale.transfer.moveToSource} disabled={disabled || !hasTargetSel} onClick={moveToSource} iconLeft={iconSvg(CHEVRON_LEFT_PATH)} />
          <Button buttonType="outlined" severity="secondary" size="sm" rounded ariaLabel={locale.transfer.moveAllToSource} tooltip={locale.transfer.moveAllToSource} disabled={disabled || !hasMovableTarget} onClick={moveAllToSource} iconLeft={iconSvg(DOUBLE_ARROW_LEFT_PATH)} />
        </div>

        {renderPanel(targetItems, filteredTarget, targetSelected, setTargetSelected, resolvedTargetHeader, targetFilter, setTargetFilter, 'target', targetReorder ? moveTargetUp : undefined, targetReorder ? moveTargetDown : undefined)}
      </div>
    );

    if (!label && !helperText && !errorMessage) return pickerEl;

    return (
      <FieldWrapper
        style={style}
        label={label}
        htmlFor={baseId}
        required={required}
        helperText={helperText}
        error={errorMessage}
        success={success}
        helperSeverity={helperSeverity}
        size={size}
        disabled={disabled}
        fullWidth
      >
        {pickerEl}
      </FieldWrapper>
    );
  },
);

ItemPicker.displayName = 'ItemPicker';

/** @deprecated Use ItemPicker instead */
export const Transfer = ItemPicker;
/** @deprecated Use ItemPickerProps instead */
export type TransferProps = ItemPickerProps;
/** @deprecated Use ItemPickerItem instead */
export type TransferItem = ItemPickerItem;
