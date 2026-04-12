import React, { forwardRef, useState, useCallback, useRef, useEffect, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import { Input } from './Input';
import { Tree } from './Tree';
import type { TreeNode } from './Tree';
import { Chip } from './Chip';
import { useKreatiLocale } from '../locale';
import { useOverlayPosition } from './useOverlayPosition';
import { useLayerZIndex } from './LayerContext';
import { CHEVRON_DOWN_PATH, TIMES_PATH } from './iconPaths';
import './TreeSelect.css';

export type { TreeNode } from './Tree';

export interface TreeSelectProps {
  /** Tree data */
  nodes: TreeNode[];
  /** Selected key(s) — string for single, string[] for multiple (controlled) */
  value?: string | string[];
  /** Default selected key(s) (uncontrolled) */
  defaultValue?: string | string[];
  /** Fires when selection changes */
  onChange?: (value: string | string[], nodes: TreeNode[]) => void;
  /** Allow multiple selection */
  multiple?: boolean;
  /** Enable filter input in dropdown */
  filterable?: boolean;
  /** Placeholder for the filter input */
  filterPlaceholder?: string;
  /** Hide disabled nodes from filter results (default: false) */
  filterDisabled?: boolean;
  /** Visual variant */
  variant?: 'floating' | 'stacked';
  /** Component size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Label text */
  label?: string;
  /** Placeholder when nothing selected */
  placeholder?: string;
  /** Helper text */
  helperText?: React.ReactNode;
  /** Error state */
  error?: React.ReactNode | boolean;
  /** Success state */
  success?: boolean;
  /** Disabled */
  disabled?: boolean;
  /** Required indicator */
  required?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** HTML name */
  name?: string;
  /** Blur handler */
  onBlur?: () => void;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

const base = 'k-tree-select';

const flattenNodes = (nodes: TreeNode[]): TreeNode[] =>
  nodes.flatMap((n) => [n, ...(n.children ? flattenNodes(n.children) : [])]);

const filterTree = (nodes: TreeNode[], query: string, hideDisabled: boolean): TreeNode[] => {
  const q = query.toLowerCase();
  return nodes.reduce<TreeNode[]>((acc, node) => {
    if (hideDisabled && node.disabled) return acc;
    const childMatch = node.children ? filterTree(node.children, query, hideDisabled) : [];
    if (node.label.toLowerCase().includes(q) || childMatch.length > 0) {
      acc.push({ ...node, children: childMatch.length > 0 ? childMatch : node.children });
    }
    return acc;
  }, []);
};

/**
 * TreeSelect component — a dropdown that renders a Tree for selection.
 *
 * @description Combines a trigger input with a Tree dropdown. Supports
 * single and multiple selection, filtering, and all Tree features.
 * Compatible with Formik/RHF via name, value, onChange, onBlur, ref.
 *
 * @example
 * ```tsx
 * <TreeSelect label="Category" nodes={treeData} value={val} onChange={setVal} />
 * ```
 */
export const TreeSelect = forwardRef<HTMLDivElement, TreeSelectProps>(
  (
    {
      nodes,
      value: controlledValue,
      defaultValue,
      onChange,
      multiple = false,
      filterable = false,
      filterPlaceholder,
      filterDisabled = false,
      variant,
      size,
      label,
      placeholder,
      helperText,
      error,
      success,
      disabled,
      required,
      fullWidth,
      name,
      onBlur,
      className = '',
      style,
    },
    ref,
  ) => {
    const locale = useKreatiLocale();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLElement | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => wrapperRef.current as HTMLDivElement);

    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState<string[]>(
      defaultValue ? (Array.isArray(defaultValue) ? defaultValue : [defaultValue]) : [],
    );
    const selectedKeys = isControlled
      ? (Array.isArray(controlledValue) ? controlledValue : [controlledValue])
      : internalValue;

    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState('');

    const zIndex = useLayerZIndex();
    const { coords, positioned } = useOverlayPosition(triggerRef, panelRef, open);

    const allFlat = flattenNodes(nodes);
    const selectedNodes = selectedKeys.map((k) => allFlat.find((n) => n.key === k)).filter(Boolean) as TreeNode[];
    const displayLabel = selectedNodes.map((n) => n.label).join(', ');

    const handleSelect = useCallback(
      (keys: string[], node: TreeNode) => {
        const next = multiple ? keys : keys.slice(-1);
        if (!isControlled) setInternalValue(next);
        const matched = next.map((k) => allFlat.find((n) => n.key === k)).filter(Boolean) as TreeNode[];
        onChange?.(multiple ? next : next[0] ?? '', matched);
        if (!multiple) setOpen(false);
      },
      [multiple, isControlled, allFlat, onChange],
    );

    const toggleOpen = useCallback(() => {
      if (disabled) return;
      setOpen((p) => !p);
      setFilter('');
    }, [disabled]);

    useEffect(() => {
      if (!open) return;
      const handler = (e: MouseEvent) => {
        if (wrapperRef.current?.contains(e.target as Node) || panelRef.current?.contains(e.target as Node)) return;
        setOpen(false);
        onBlur?.();
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, [open, onBlur]);

    const visibleNodes = filter ? filterTree(nodes, filter, filterDisabled) : (filterDisabled ? filterTree(nodes, '', filterDisabled) : nodes);

    const collectKeys = (ns: TreeNode[]): string[] =>
      ns.flatMap((n) => [n.key, ...(n.children ? collectKeys(n.children) : [])]);
    const filterExpandedKeys = filter ? collectKeys(visibleNodes) : undefined;

    const dropdownIcon = (
      <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" aria-hidden="true" style={{ transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : undefined }}>
        <path d={CHEVRON_DOWN_PATH} />
      </svg>
    );

    const panel = open
      ? createPortal(
          <div
            ref={panelRef}
            className={`${base}__panel${positioned ? ` ${base}__panel--visible` : ''}`}
            style={{ top: coords.top, left: coords.left, minWidth: coords.minWidth, zIndex: zIndex.overlay }}
          >
            {filterable && (
              <div className={`${base}__filter`}>
                <input
                  type="text"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder={filterPlaceholder ?? locale.select.filterPlaceholder}
                  autoFocus
                />
              </div>
            )}
            {visibleNodes.length === 0 ? (
              <div className={`${base}__empty`}>{locale.select.emptyMessage}</div>
            ) : (
              <Tree
                nodes={visibleNodes}
                selectedKeys={selectedKeys}
                onSelect={handleSelect}
                multiple={multiple}
                {...(filterExpandedKeys ? { expandedKeys: filterExpandedKeys } : { defaultExpandedKeys: selectedKeys })}
              />
            )}
          </div>,
          document.body,
        )
      : null;

    const cls = [base, fullWidth && `${base}--full-width`, className].filter(Boolean).join(' ');

    return (
      <div ref={wrapperRef} className={cls} style={style}>
        <div ref={triggerRef as React.Ref<HTMLDivElement>} onClick={toggleOpen} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleOpen(); } }} tabIndex={disabled ? -1 : 0} role="combobox" aria-expanded={open} aria-haspopup="tree" style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}>
          <Input
            readOnly
            variant={variant}
            size={size}
            label={label}
            placeholder={placeholder}
            value={displayLabel}
            helperText={helperText}
            error={error}
            success={success}
            disabled={disabled}
            required={required}
            fullWidth={fullWidth}
            iconRight={dropdownIcon}
            className="k-tree-select__trigger"
          />
        </div>
        {name && selectedKeys.map((k) => <input key={k} type="hidden" name={name} value={k} />)}
        {panel}
      </div>
    );
  },
);

TreeSelect.displayName = 'TreeSelect';
