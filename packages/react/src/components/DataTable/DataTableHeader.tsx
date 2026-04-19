import React, { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  SORT_ASC_PATH,
  SORT_DESC_PATH,
  SORT_BOTH_PATH,
  FILTER_PATH,
} from "../iconPaths";
import { Button } from "../Button";
import { Input } from "../Input";
import { Select } from "../Select";
import { Checkbox } from "../Checkbox";
import { useOverlayPosition } from "../useOverlayPosition";
import { useLayerZIndex, LayerContext, nextLayer } from "../LayerContext";
import type {
  DataTableColumn,
  SortDirection,
  SortMeta,
  ColumnFilterMeta,
  FilterMatchMode,
} from "./types";

const SortIcon = ({ direction }: { direction: SortDirection }) => {
  const path =
    direction === "asc"
      ? SORT_ASC_PATH
      : direction === "desc"
        ? SORT_DESC_PATH
        : SORT_BOTH_PATH;
  return (
    <svg
      className="k-datatable__sort-icon"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
};

const FILTER_MODE_OPTIONS = [
  { value: "contains", label: "Contains" },
  { value: "startsWith", label: "Starts with" },
  { value: "endsWith", label: "Ends with" },
  { value: "equals", label: "Equals" },
  { value: "notEquals", label: "Not equals" },
  { value: "gt", label: "Greater than" },
  { value: "lt", label: "Less than" },
];

interface FilterPanelProps {
  col: DataTableColumn;
  value: unknown;
  matchMode: FilterMatchMode;
  onApply: (value: unknown, matchMode: FilterMatchMode) => void;
  onClear: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  col,
  value,
  matchMode,
  onApply,
  onClear,
}) => {
  const [open, setOpen] = useState(false);
  const [localValue, setLocalValue] = useState<string>((value as string) || "");
  const [localMode, setLocalMode] = useState<FilterMatchMode>(matchMode);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hasValue = value !== undefined && value !== null && value !== "";
  const { child: zIndex } = useLayerZIndex();

  const { coords, positioned } = useOverlayPosition(
    triggerRef as React.RefObject<HTMLElement | null>,
    panelRef as React.RefObject<HTMLElement | null>,
    open,
    {
      position: col.filterDirection === "up" ? "top" : "bottom",
      offset: 8,
      matchTriggerWidth: false,
    }
  );

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Ignore clicks inside portaled overlays (Select dropdown, etc.)
      if (
        target.closest('[class*="dropdown-portal"]') ||
        target.closest('[class*="__dropdown"]')
      )
        return;
      if (target.closest(".k-datatable__filter-panel")) return;
      if (triggerRef.current && triggerRef.current.contains(target)) return;
      setOpen(false);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    // Use setTimeout to avoid catching the opening click
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    setLocalValue((value as string) || "");
    setLocalMode(matchMode);
  }, [value, matchMode]);

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(prev => !prev);
  }, []);

  const panel = open
    ? createPortal(
        <LayerContext.Provider value={nextLayer()}>
          <div
            ref={panelRef}
            className={`k-datatable__filter-panel${positioned ? " k-datatable__filter-panel--open" : ""}`}
            style={{ top: coords.top, left: coords.left, zIndex: zIndex + 10 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="k-datatable__filter-panel__label">
              Filter: {col.header || col.field}
            </div>
            {col.filterTemplate ? (
              col.filterTemplate(col, localValue, val => {
                setLocalValue(val as string);
                onApply(val, localMode);
                setOpen(false);
              })
            ) : (
              <>
                <Select
                  options={FILTER_MODE_OPTIONS}
                  value={localMode}
                  onChange={val => setLocalMode(val as FilterMatchMode)}
                  size="xs"
                  fullWidth
                />
                <div className="k-datatable__filter-panel__spacer" />
                <Input
                  value={localValue}
                  onChange={e => setLocalValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      onApply(localValue, localMode);
                      setOpen(false);
                    }
                  }}
                  placeholder="Value..."
                  size="xs"
                  fullWidth
                />
              </>
            )}
            <div className="k-datatable__filter-panel__actions">
              <Button
                label="Clear"
                size="xs"
                buttonType="text"
                severity="secondary"
                onClick={() => {
                  onClear();
                  setLocalValue("");
                  setOpen(false);
                }}
              />
              {!col.filterTemplate && (
                <Button
                  label="Apply"
                  size="xs"
                  severity="primary"
                  onClick={() => {
                    onApply(localValue, localMode);
                    setOpen(false);
                  }}
                />
              )}
            </div>
          </div>
        </LayerContext.Provider>,
        document.body
      )
    : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`k-datatable__filter-trigger${hasValue ? " k-datatable__filter-trigger--active" : ""}`}
        onClick={handleToggle}
        aria-label={`Filter ${col.header || col.field}`}
        aria-expanded={open}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d={FILTER_PATH} />
        </svg>
      </button>
      {panel}
    </>
  );
};

interface HeaderCellProps {
  col: DataTableColumn;
  sortDirection: SortDirection;
  sortPriority?: number;
  onSort?: () => void;
  filterValue?: unknown;
  filterMatchMode?: FilterMatchMode;
  onFilterApply?: (value: unknown, matchMode: FilterMatchMode) => void;
  onFilterClear?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onDrop?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  isDragOver?: boolean;
  resizable?: boolean;
  onResize?: (field: string, width: number) => void;
  frozenOffset?: number;
}

export const DataTableHeaderCell: React.FC<HeaderCellProps> = ({
  col,
  sortDirection,
  sortPriority,
  onSort,
  filterValue,
  filterMatchMode = "contains",
  onFilterApply,
  onFilterClear,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  isDragging,
  isDragOver,
  resizable,
  onResize,
  frozenOffset,
}) => {
  const thRef = useRef<HTMLTableCellElement>(null);
  const [resizing, setResizing] = useState(false);
  const cls = [
    "k-datatable__th",
    col.sortable && "k-datatable__th--sortable",
    sortDirection && "k-datatable__th--sorted",
    col.align && `k-datatable__th--align-${col.align}`,
    isDragging && "k-datatable__th--dragging",
    isDragOver && "k-datatable__th--drag-over",
    col.resizable && "k-datatable__th--resizable",
    col.headerClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!thRef.current || !onResize) return;
      setResizing(true);
      const startX = e.clientX;
      const startWidth = thRef.current.getBoundingClientRect().width;

      const onMove = (ev: MouseEvent) => {
        ev.preventDefault();
        const delta = ev.clientX - startX;
        onResize(col.field, Math.max(40, Math.round(startWidth + delta)));
      };
      const onUp = () => {
        setResizing(false);
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [col.field, onResize]
  );

  const style: React.CSSProperties = {
    ...(col.width
      ? { width: typeof col.width === "number" ? `${col.width}px` : col.width }
      : {}),
    ...(col.minWidth
      ? {
          minWidth:
            typeof col.minWidth === "number"
              ? `${col.minWidth}px`
              : col.minWidth,
        }
      : {}),
    ...(col.maxWidth
      ? {
          maxWidth:
            typeof col.maxWidth === "number"
              ? `${col.maxWidth}px`
              : col.maxWidth,
        }
      : {}),
    ...(col.frozen === "left" && frozenOffset !== undefined
      ? { left: frozenOffset }
      : {}),
    ...(col.frozen === "right" && frozenOffset !== undefined
      ? { right: frozenOffset }
      : {}),
    ...col.headerStyle,
  };

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (resizing) {
        e.stopPropagation();
        return;
      }
      onSort?.();
    },
    [resizing, onSort]
  );

  return (
    <th
      ref={thRef}
      className={cls}
      style={style}
      role="columnheader"
      tabIndex={col.sortable ? 0 : undefined}
      onClick={col.sortable ? handleClick : undefined}
      onKeyDown={
        col.sortable
          ? (e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSort?.();
              }
            }
          : undefined
      }
      aria-sort={
        sortDirection === "asc"
          ? "ascending"
          : sortDirection === "desc"
            ? "descending"
            : undefined
      }
      draggable={col.reorderable !== false && !!onDragStart}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
    >
      <div className="k-datatable__th-content">
        {col.reorderable !== false && !!onDragStart && (
          <svg
            className="k-datatable__th-reorder-icon"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8,6h2v12H8Zm6,0h2v12H14Z" />
          </svg>
        )}
        {col.headerTemplate ? (
          col.headerTemplate(col)
        ) : (
          <span>{col.header || col.field}</span>
        )}
        {(col.sortable || col.filterable) && (
          <span className="k-datatable__th-icons">
            {col.filterable && onFilterApply && (
              <FilterPanel
                col={col}
                value={filterValue}
                matchMode={filterMatchMode}
                onApply={onFilterApply}
                onClear={onFilterClear!}
              />
            )}
            {col.sortable && <SortIcon direction={sortDirection} />}
            {sortPriority !== undefined && sortPriority > 0 && (
              <span className="k-datatable__sort-badge">{sortPriority}</span>
            )}
          </span>
        )}
      </div>
      {resizable && col.resizable !== false && (
        <div
          className={`k-datatable__resize-handle${resizing ? " k-datatable__resize-handle--active" : ""}`}
          onMouseDown={handleResizeStart}
        />
      )}
    </th>
  );
};

interface HeaderProps {
  columns: DataTableColumn[];
  sortMode: "single" | "multiple";
  sortField?: string;
  sortOrder?: SortDirection;
  multiSortMeta?: SortMeta[];
  onSort: (field: string) => void;
  filters: Record<string, ColumnFilterMeta>;
  onFilterApply: (
    field: string,
    value: unknown,
    matchMode: FilterMatchMode
  ) => void;
  onFilterClear: (field: string) => void;
  selectionMode?: "single" | "multiple" | "checkbox" | null;
  allSelected?: boolean;
  someSelected?: boolean;
  onSelectAll?: () => void;
  reorderableColumns?: boolean;
  onColumnReorder?: (fromIndex: number, toIndex: number) => void;
  reorderableRows?: boolean;
  hasExpansion?: boolean;
  resizable?: boolean;
  onResize?: (field: string, width: number) => void;
  frozenLeftOffsets?: Record<string, number>;
  frozenRightOffsets?: Record<string, number>;
  columnGroups?: Map<string, DataTableColumn[]>;
}

export const DataTableHeader: React.FC<HeaderProps> = ({
  columns,
  sortMode,
  sortField,
  sortOrder,
  multiSortMeta = [],
  onSort,
  filters,
  onFilterApply,
  onFilterClear,
  selectionMode,
  allSelected,
  someSelected,
  onSelectAll,
  reorderableColumns,
  onColumnReorder,
  reorderableRows,
  hasExpansion,
  resizable: tableResizable,
  onResize,
  frozenLeftOffsets = {},
  frozenRightOffsets = {},
  columnGroups,
}) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const getSortDirection = (field: string): SortDirection => {
    if (sortMode === "single")
      return sortField === field ? (sortOrder ?? null) : null;
    const meta = multiSortMeta.find(m => m.field === field);
    return meta?.order ?? null;
  };

  const getSortPriority = (field: string): number | undefined => {
    if (sortMode !== "multiple") return undefined;
    const idx = multiSortMeta.findIndex(m => m.field === field);
    return idx >= 0 ? idx + 1 : undefined;
  };

  const handleDragStart = useCallback(
    (idx: number) => (e: React.DragEvent) => {
      setDragIndex(idx);
      e.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const handleDragOver = useCallback(
    (idx: number) => (e: React.DragEvent) => {
      e.preventDefault();
      setDragOverIndex(idx);
    },
    []
  );

  const handleDrop = useCallback(
    (idx: number) => (e: React.DragEvent) => {
      e.preventDefault();
      if (dragIndex !== null && dragIndex !== idx) {
        onColumnReorder?.(dragIndex, idx);
      }
      setDragIndex(null);
      setDragOverIndex(null);
    },
    [dragIndex, onColumnReorder]
  );

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDragOverIndex(null);
  }, []);

  // Column group header row
  const groupRow =
    columnGroups && columnGroups.size > 0
      ? (() => {
          const cells: React.ReactNode[] = [];
          if (selectionMode === "checkbox")
            cells.push(<th key="__sel-g" className="k-datatable__th" />);
          if (hasExpansion)
            cells.push(<th key="__exp-g" className="k-datatable__th" />);
          if (reorderableRows)
            cells.push(<th key="__drag-g" className="k-datatable__th" />);
          let currentGroup = "";
          let span = 0;
          const visibleCols = columns.filter(c => !c.hidden);
          visibleCols.forEach((col, i) => {
            const group = col.columnGroup || "";
            if (group === currentGroup) {
              span++;
            } else {
              if (span > 0)
                cells.push(
                  <th
                    key={`g-${i - span}`}
                    className="k-datatable__th"
                    colSpan={span}
                  >
                    {currentGroup}
                  </th>
                );
              currentGroup = group;
              span = 1;
            }
            if (i === visibleCols.length - 1) {
              cells.push(
                <th
                  key={`g-${i - span + 1}`}
                  className="k-datatable__th"
                  colSpan={span}
                >
                  {currentGroup}
                </th>
              );
            }
          });
          return <tr className="k-datatable__column-group-row">{cells}</tr>;
        })()
      : null;

  const visibleCols = columns.filter(c => !c.hidden);
  const selOffset = selectionMode === "checkbox" ? 1 : 0;
  const dragOffset = reorderableRows ? 1 : 0;

  return (
    <thead className="k-datatable__thead" role="rowgroup">
      {groupRow}
      <tr role="row">
        {selectionMode === "checkbox" && (
          <th className="k-datatable__th k-datatable__select-cell">
            <Checkbox
              checked={allSelected || false}
              indeterminate={!!someSelected && !allSelected}
              onChange={onSelectAll as () => void}
              size="sm"
            />
          </th>
        )}
        {reorderableRows && (
          <th
            className="k-datatable__th k-datatable__drag-cell"
            aria-label="Reorder"
          />
        )}
        {hasExpansion && (
          <th
            className="k-datatable__th k-datatable__expand-cell"
            aria-label="Expand"
          />
        )}
        {visibleCols.map((col, i) => (
          <DataTableHeaderCell
            key={col.field + i}
            col={col}
            sortDirection={getSortDirection(col.field)}
            sortPriority={getSortPriority(col.field)}
            onSort={() => onSort(col.field)}
            filterValue={filters[col.field]?.value}
            filterMatchMode={
              filters[col.field]?.matchMode || col.filterMatchMode || "contains"
            }
            onFilterApply={
              col.filterable
                ? (val, mode) => onFilterApply(col.field, val, mode)
                : undefined
            }
            onFilterClear={
              col.filterable ? () => onFilterClear(col.field) : undefined
            }
            onDragStart={
              reorderableColumns
                ? handleDragStart(i + selOffset + dragOffset)
                : undefined
            }
            onDragOver={reorderableColumns ? handleDragOver(i) : undefined}
            onDrop={reorderableColumns ? handleDrop(i) : undefined}
            onDragEnd={reorderableColumns ? handleDragEnd : undefined}
            isDragging={dragIndex === i + selOffset + dragOffset}
            isDragOver={dragOverIndex === i}
            resizable={tableResizable}
            onResize={onResize}
            frozenOffset={
              col.frozen === "left"
                ? frozenLeftOffsets[col.field]
                : col.frozen === "right"
                  ? frozenRightOffsets[col.field]
                  : undefined
            }
          />
        ))}
      </tr>
    </thead>
  );
};
