import React, { forwardRef, useState, useCallback, useRef, useImperativeHandle } from 'react';
import { CHEVRON_RIGHT_PATH } from './iconPaths';
import './Tree.css';

export interface TreeNode {
  /** Unique key */
  key: string;
  /** Display label */
  label: string;
  /** Icon before the label */
  icon?: React.ReactNode;
  /** Child nodes */
  children?: TreeNode[];
  /** Disabled state */
  disabled?: boolean;
  /** Extra data */
  data?: Record<string, unknown>;
  /** Per-node className */
  className?: string;
  /** Per-node style */
  style?: React.CSSProperties;
}

export interface TreeProps {
  /** Tree data */
  nodes: TreeNode[];
  /** Selected node key(s) — string for single, string[] for multiple (controlled) */
  selectedKeys?: string | string[];
  /** Default selected keys (uncontrolled) */
  defaultSelectedKeys?: string | string[];
  /** Fires when selection changes */
  onSelect?: (keys: string[], node: TreeNode) => void;
  /** Expanded node keys (controlled) */
  expandedKeys?: string[];
  /** Default expanded keys (uncontrolled) */
  defaultExpandedKeys?: string[];
  /** Fires when expand state changes */
  onToggle?: (keys: string[]) => void;
  /** Allow multiple selection */
  multiple?: boolean;
  /** Custom render for each node */
  nodeTemplate?: (node: TreeNode, state: { selected: boolean; expanded: boolean }) => React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

const base = 'k-tree';

const ToggleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" aria-hidden="true">
    <path d={CHEVRON_RIGHT_PATH} />
  </svg>
);

/**
 * Tree component for displaying hierarchical data.
 *
 * @description A collapsible tree view with single/multiple selection,
 * keyboard navigation, custom node templates, and icons. Supports
 * controlled and uncontrolled expand/select states.
 *
 * @example
 * ```tsx
 * <Tree nodes={[
 *   { key: '1', label: 'Documents', children: [
 *     { key: '1-1', label: 'Resume.pdf' },
 *   ]},
 * ]} onSelect={(keys) => console.log(keys)} />
 * ```
 */
export const Tree = forwardRef<HTMLUListElement, TreeProps>(
  (
    {
      nodes,
      selectedKeys: controlledSelected,
      defaultSelectedKeys,
      onSelect,
      expandedKeys: controlledExpanded,
      defaultExpandedKeys,
      onToggle,
      multiple = false,
      nodeTemplate,
      className = '',
      style,
    },
    ref,
  ) => {
    const elRef = useRef<HTMLUListElement>(null);
    useImperativeHandle(ref, () => elRef.current as HTMLUListElement);

    const isSelectedControlled = controlledSelected !== undefined;
    const isExpandedControlled = controlledExpanded !== undefined;

    const [internalSelected, setInternalSelected] = useState<string[]>(
      defaultSelectedKeys ? (Array.isArray(defaultSelectedKeys) ? defaultSelectedKeys : [defaultSelectedKeys]) : [],
    );
    const [internalExpanded, setInternalExpanded] = useState<string[]>(defaultExpandedKeys ?? []);

    const selected = new Set(
      isSelectedControlled
        ? (Array.isArray(controlledSelected) ? controlledSelected : [controlledSelected])
        : internalSelected,
    );
    const expanded = new Set(isExpandedControlled ? controlledExpanded : internalExpanded);

    const toggleExpand = useCallback(
      (key: string) => {
        const next = expanded.has(key)
          ? [...expanded].filter((k) => k !== key)
          : [...expanded, key];
        if (!isExpandedControlled) setInternalExpanded(next);
        onToggle?.(next);
      },
      [expanded, isExpandedControlled, onToggle],
    );

    const selectNode = useCallback(
      (node: TreeNode) => {
        if (node.disabled) return;
        let next: string[];
        if (multiple) {
          next = selected.has(node.key)
            ? [...selected].filter((k) => k !== node.key)
            : [...selected, node.key];
        } else {
          next = selected.has(node.key) ? [] : [node.key];
        }
        if (!isSelectedControlled) setInternalSelected(next);
        onSelect?.(next, node);
      },
      [selected, multiple, isSelectedControlled, onSelect],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent, node: TreeNode, hasChildren: boolean) => {
        switch (e.key) {
          case 'Enter':
          case ' ':
            e.preventDefault();
            if (hasChildren) toggleExpand(node.key);
            else selectNode(node);
            break;
          case 'ArrowRight':
            if (hasChildren && !expanded.has(node.key)) { e.preventDefault(); toggleExpand(node.key); }
            break;
          case 'ArrowLeft':
            if (hasChildren && expanded.has(node.key)) { e.preventDefault(); toggleExpand(node.key); }
            break;
        }
      },
      [selectNode, expanded, toggleExpand],
    );

    const renderNode = (node: TreeNode, level: number) => {
      const hasChildren = !!node.children?.length;
      const isExpanded = expanded.has(node.key);
      const isSelected = selected.has(node.key);

      const nodeCls = [
        `${base}__node`,
        isSelected && `${base}__node--selected`,
        node.disabled && `${base}__node--disabled`,
        node.className,
      ].filter(Boolean).join(' ');

      return (
        <li key={node.key} role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined} aria-selected={isSelected} aria-disabled={node.disabled || undefined}>
          <div
            className={nodeCls}
            style={node.style}
            tabIndex={node.disabled ? -1 : 0}
            onClick={() => { if (hasChildren) toggleExpand(node.key); if (!hasChildren) selectNode(node); }}
            onKeyDown={(e) => handleKeyDown(e, node, hasChildren)}
          >
            <span className={`${base}__toggle${isExpanded ? ` ${base}__toggle--expanded` : ''}${!hasChildren ? ` ${base}__toggle--leaf` : ''}`}>
              <ToggleIcon />
            </span>
            {node.icon && <span className={`${base}__icon`}>{node.icon}</span>}
            <span className={`${base}__label`}>
              {nodeTemplate ? nodeTemplate(node, { selected: isSelected, expanded: isExpanded }) : node.label}
            </span>
          </div>
          {hasChildren && isExpanded && (
            <ul className={`${base}__subtree`} role="group">
              {node.children!.map((child) => renderNode(child, level + 1))}
            </ul>
          )}
        </li>
      );
    };

    return (
      <ul ref={elRef} className={`${base} ${className}`} style={style} role="tree">
        {nodes.map((node) => renderNode(node, 0))}
      </ul>
    );
  },
);

Tree.displayName = 'Tree';
