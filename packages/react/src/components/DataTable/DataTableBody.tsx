import React, { useState, useCallback, useRef, useMemo } from "react";
import {
  PENCIL_PATH,
  TRASH_PATH,
  GRIP_VERTICAL_PATH,
  SEARCH_PATH,
  CHECK_PATH,
  TIMES_PATH,
  CHEVRON_RIGHT_PATH,
  CHEVRON_DOWN_PATH,
  COPY_PATH,
} from "../iconPaths";
import { Checkbox } from "../Checkbox";
import { Button } from "../Button";
import { Input } from "../Input";
import { getFieldValue } from "./utils";
import type { DataTableColumn, SelectionMode, ActionPreset } from "./types";

const ActionIcon: React.FC<{ path: string; size?: number }> = ({
  path,
  size = 16,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d={path} />
  </svg>
);

const PRESET_ICONS: Record<ActionPreset, string> = {
  edit: PENCIL_PATH,
  delete: TRASH_PATH,
  view: SEARCH_PATH,
  copy: COPY_PATH,
};

const PRESET_SEVERITY: Record<
  ActionPreset,
  "primary" | "secondary" | "danger"
> = {
  edit: "primary",
  delete: "danger",
  view: "secondary",
  copy: "secondary",
};

interface BodyProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  dataKey: string;
  size: "sm" | "md" | "lg";
  selectionMode: SelectionMode;
  selection: T[];
  onRowSelect: (
    row: T,
    rowIndex: number,
    event: React.MouseEvent | React.ChangeEvent
  ) => void;
  disabledRows?: (row: T, rowIndex: number) => boolean;
  rowClassName?: (row: T, rowIndex: number) => string | undefined;
  rowStyle?: (row: T, rowIndex: number) => React.CSSProperties | undefined;
  editMode: "cell" | "row" | null;
  onCellEdit?: (
    row: T,
    rowIndex: number,
    field: string,
    newValue: unknown
  ) => void;
  onRowEdit?: (
    row: T,
    rowIndex: number,
    newValues: Record<string, unknown>
  ) => void;
  reorderableRows?: boolean;
  onRowReorder?: (fromIndex: number, toIndex: number) => void;
  resizableRows?: boolean;
  startIndex: number;
  locale: {
    edit: string;
    delete: string;
    view: string;
    copy: string;
    noData: string;
  };
  rowExpansionTemplate?: (row: T, rowIndex: number) => React.ReactNode;
  expandedRows?: (string | number)[];
  onExpandedRowsChange?: (keys: (string | number)[]) => void;
  childrenField?: string;
  virtualScroll?: boolean;
  virtualScrollItemHeight?: number;
  scrollHeight?: string;
  groupByField?: string;
  groupHeaderTemplate?: (
    groupValue: unknown,
    rows: Record<string, unknown>[]
  ) => React.ReactNode;
  frozenLeftOffsets?: Record<string, number>;
  frozenRightOffsets?: Record<string, number>;
}

export const DataTableBody = <T extends Record<string, unknown>>({
  data,
  columns,
  dataKey,
  size,
  selectionMode,
  selection,
  onRowSelect,
  disabledRows,
  rowClassName,
  rowStyle,
  editMode,
  onCellEdit,
  onRowEdit,
  reorderableRows,
  onRowReorder,
  resizableRows,
  startIndex,
  locale,
  rowExpansionTemplate,
  expandedRows,
  onExpandedRowsChange,
  childrenField,
  virtualScroll,
  virtualScrollItemHeight = 40,
  scrollHeight,
  groupByField,
  groupHeaderTemplate,
  frozenLeftOffsets = {},
  frozenRightOffsets = {},
}: BodyProps<T>): React.ReactElement => {
  const [editingCell, setEditingCell] = useState<{
    row: number;
    field: string;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [rowEditValues, setRowEditValues] = useState<Record<string, unknown>>(
    {}
  );
  const [dragRowIndex, setDragRowIndex] = useState<number | null>(null);
  const [dragOverRowIndex, setDragOverRowIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const inputSize = size === "sm" ? "xs" : size === "md" ? "sm" : "md";
  const visibleCols = columns.filter(c => !c.hidden);
  const hasExpansion = !!rowExpansionTemplate || !!childrenField;

  // Expansion
  const toggleExpand = useCallback(
    (key: string | number) => {
      if (!onExpandedRowsChange) return;
      const current = expandedRows || [];
      onExpandedRowsChange(
        current.includes(key)
          ? current.filter(k => k !== key)
          : [...current, key]
      );
    },
    [expandedRows, onExpandedRowsChange]
  );

  const isExpanded = useCallback(
    (key: string | number) => {
      return (expandedRows || []).includes(key);
    },
    [expandedRows]
  );

  // Tree: flatten data with depth
  const flatData = useMemo(() => {
    if (!childrenField)
      return data.map((row, i) => ({ row, depth: 0, index: i }));
    const result: { row: T; depth: number; index: number }[] = [];
    const flatten = (items: T[], depth: number) => {
      items.forEach(item => {
        result.push({ row: item, depth, index: result.length });
        const children = (item as Record<string, unknown>)[childrenField] as
          | T[]
          | undefined;
        if (
          children?.length &&
          isExpanded(
            (item as Record<string, unknown>)[dataKey] as string | number
          )
        ) {
          flatten(children, depth + 1);
        }
      });
    };
    flatten(data, 0);
    return result;
  }, [data, childrenField, dataKey, isExpanded]);

  // Virtual scroll
  const [scrollTop, setScrollTop] = useState(0);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);

  React.useEffect(() => {
    if (!virtualScroll || !tbodyRef.current) return;
    const scrollParent =
      tbodyRef.current.closest(".k-datatable__virtual-scroll") ||
      tbodyRef.current.closest(".k-scrollbar__content");
    if (!scrollParent) return;
    const onScroll = () => setScrollTop(scrollParent.scrollTop);
    scrollParent.addEventListener("scroll", onScroll, { passive: true });
    return () => scrollParent.removeEventListener("scroll", onScroll);
  }, [virtualScroll]);

  const itemHeight = virtualScrollItemHeight;
  const containerHeight = scrollHeight ? parseInt(scrollHeight) : 400;
  const totalVirtualHeight = virtualScroll ? flatData.length * itemHeight : 0;
  const visibleCount = virtualScroll
    ? Math.ceil(containerHeight / itemHeight) + 4
    : flatData.length;
  const virtualStart = virtualScroll
    ? Math.max(0, Math.floor(scrollTop / itemHeight) - 2)
    : 0;
  const virtualEnd = Math.min(virtualStart + visibleCount, flatData.length);
  const virtualPaddingTop = virtualScroll ? virtualStart * itemHeight : 0;
  const virtualPaddingBottom = virtualScroll
    ? Math.max(0, totalVirtualHeight - virtualEnd * itemHeight)
    : 0;

  const isSelected = useCallback(
    (row: T) => {
      return selection.some(
        s =>
          (s as Record<string, unknown>)[dataKey] ===
          (row as Record<string, unknown>)[dataKey]
      );
    },
    [selection, dataKey]
  );

  const handleDoubleClick = useCallback(
    (rowIndex: number, field: string, value: unknown) => {
      if (editMode !== "cell") return;
      setEditingCell({ row: rowIndex, field });
      setEditValue(value === null || value === undefined ? "" : String(value));
      setTimeout(() => inputRef.current?.focus(), 0);
    },
    [editMode]
  );

  const commitEdit = useCallback(
    (rowIndex: number, field: string) => {
      if (editingCell) {
        onCellEdit?.(data[rowIndex], rowIndex + startIndex, field, editValue);
        setEditingCell(null);
      }
    },
    [editingCell, editValue, data, startIndex, onCellEdit]
  );

  const cancelEdit = useCallback(() => setEditingCell(null), []);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent, rowIndex: number, field: string) => {
      if (e.key === "Enter") commitEdit(rowIndex, field);
      else if (e.key === "Escape") cancelEdit();
    },
    [commitEdit, cancelEdit]
  );

  // Row edit
  const startRowEdit = useCallback(
    (rowIndex: number, row: T) => {
      setEditingRow(rowIndex);
      const values: Record<string, unknown> = {};
      columns
        .filter(c => c.editable)
        .forEach(col => {
          values[col.field] = getFieldValue(
            row as Record<string, unknown>,
            col.field
          );
        });
      setRowEditValues(values);
    },
    [columns]
  );

  const commitRowEdit = useCallback(
    (rowIndex: number) => {
      if (editingRow !== null) {
        onRowEdit?.(data[rowIndex], rowIndex + startIndex, rowEditValues);
        setEditingRow(null);
        setRowEditValues({});
      }
    },
    [editingRow, data, startIndex, rowEditValues, onRowEdit]
  );

  const cancelRowEdit = useCallback(() => {
    setEditingRow(null);
    setRowEditValues({});
  }, []);

  // Row drag
  const handleRowDragStart = useCallback(
    (idx: number) => (e: React.DragEvent) => {
      setDragRowIndex(idx);
      e.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const handleRowDragOver = useCallback(
    (idx: number) => (e: React.DragEvent) => {
      e.preventDefault();
      setDragOverRowIndex(idx);
    },
    []
  );

  const handleRowDrop = useCallback(
    (idx: number) => (e: React.DragEvent) => {
      e.preventDefault();
      if (dragRowIndex !== null && dragRowIndex !== idx) {
        onRowReorder?.(dragRowIndex, idx);
      }
      setDragRowIndex(null);
      setDragOverRowIndex(null);
    },
    [dragRowIndex, onRowReorder]
  );

  const handleRowDragEnd = useCallback(() => {
    setDragRowIndex(null);
    setDragOverRowIndex(null);
  }, []);

  // Cell-level resize (both column + row)
  const [rowHeights, setRowHeights] = useState<Record<number, number>>({});
  const handleCellResizeStart = useCallback(
    (rowIdx: number, field: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const td = (e.target as HTMLElement).closest("td");
      const tr = td?.closest("tr");
      if (!td || !tr) return;
      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = td.getBoundingClientRect().width;
      const startHeight = tr.getBoundingClientRect().height;
      const onMove = (ev: MouseEvent) => {
        ev.preventDefault();
        setRowHeights(prev => ({
          ...prev,
          [rowIdx]: Math.max(24, Math.round(startHeight + ev.clientY - startY)),
        }));
        // Column resize is handled by parent DataTable via onCellEdit won't work here
        // We dispatch a custom event the DataTable can listen to
        td.dispatchEvent(
          new CustomEvent("kreati-col-resize", {
            bubbles: true,
            detail: {
              field,
              width: Math.max(40, Math.round(startWidth + ev.clientX - startX)),
            },
          })
        );
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
      document.body.style.cursor = "nwse-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    []
  );
  const handleRowResizeStart = useCallback(
    (rowIdx: number) => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const tr = (e.target as HTMLElement).closest("tr");
      if (!tr) return;
      const startY = e.clientY;
      const startHeight = tr.getBoundingClientRect().height;
      const onMove = (ev: MouseEvent) => {
        ev.preventDefault();
        setRowHeights(prev => ({
          ...prev,
          [rowIdx]: Math.max(24, Math.round(startHeight + ev.clientY - startY)),
        }));
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
      document.body.style.cursor = "row-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    []
  );

  const renderActions = (col: DataTableColumn<T>, row: T, rowIndex: number) => {
    if (col.actionsTemplate)
      return col.actionsTemplate(row, rowIndex + startIndex);

    const items: React.ReactNode[] = [];

    // Row edit mode buttons
    if (editMode === "row" && editingRow === rowIndex) {
      return (
        <div className="k-datatable__actions">
          <Button
            key="save"
            iconLeft={<ActionIcon path={CHECK_PATH} />}
            size="xs"
            buttonType="text"
            severity="success"
            rounded
            onClick={e => {
              e.stopPropagation();
              commitRowEdit(rowIndex);
            }}
            ariaLabel="Save"
            tooltip="Save"
          />
          <Button
            key="cancel"
            iconLeft={<ActionIcon path={TIMES_PATH} />}
            size="xs"
            buttonType="text"
            severity="danger"
            rounded
            onClick={e => {
              e.stopPropagation();
              cancelRowEdit();
            }}
            ariaLabel="Cancel"
            tooltip="Cancel"
          />
        </div>
      );
    }

    if (col.actionsPreset) {
      col.actionsPreset.forEach(preset => {
        const handler =
          preset === "edit" && editMode === "row"
            ? () => startRowEdit(rowIndex, row)
            : preset === "edit"
              ? col.onEdit
              : preset === "delete"
                ? col.onDelete
                : preset === "copy"
                  ? (r: T) => {
                      navigator.clipboard
                        ?.writeText(JSON.stringify(r, null, 2))
                        .catch(() => {
                          /* clipboard unavailable */
                        });
                    }
                  : col.onView;
        items.push(
          <Button
            key={preset}
            iconLeft={<ActionIcon path={PRESET_ICONS[preset]} />}
            size="xs"
            buttonType="text"
            severity={PRESET_SEVERITY[preset]}
            rounded
            onClick={e => {
              e.stopPropagation();
              handler?.(row, rowIndex + startIndex);
            }}
            ariaLabel={locale[preset]}
            tooltip={locale[preset]}
          />
        );
      });
    }

    if (col.actions) {
      col.actions.forEach(action => {
        const disabled =
          typeof action.disabled === "function"
            ? action.disabled(row as Record<string, unknown>)
            : action.disabled;
        items.push(
          <Button
            key={action.key}
            iconLeft={action.icon as React.ReactNode}
            label={!action.icon ? action.label : undefined}
            size="xs"
            buttonType="text"
            severity={(action.severity as "primary") || "secondary"}
            rounded
            disabled={disabled}
            onClick={e => {
              e.stopPropagation();
              action.command?.(
                row as Record<string, unknown>,
                rowIndex + startIndex
              );
            }}
            ariaLabel={action.label}
            tooltip={action.label}
            className={action.className}
            style={action.style}
          />
        );
      });
    }

    return <div className="k-datatable__actions">{items}</div>;
  };

  if (data.length === 0) {
    const colSpan =
      visibleCols.length +
      (selectionMode === "checkbox" ? 1 : 0) +
      (reorderableRows ? 1 : 0) +
      (hasExpansion ? 1 : 0);
    return (
      <tbody className="k-datatable__tbody" role="rowgroup">
        <tr role="row">
          <td className="k-datatable__empty" colSpan={colSpan} role="gridcell">
            {locale.noData}
          </td>
        </tr>
      </tbody>
    );
  }

  const renderRow = (
    item: { row: T; depth: number; index: number },
    rowIdx: number
  ) => {
    const { row, depth } = item;
    const globalIdx = rowIdx + startIndex;
    const rowKey = (row as Record<string, unknown>)[dataKey] as string | number;
    const selected = isSelected(row);
    const disabled = disabledRows?.(row, globalIdx);
    const expanded = isExpanded(rowKey);
    const hasChildren =
      childrenField &&
      ((row as Record<string, unknown>)[childrenField] as unknown[] | undefined)
        ?.length;

    const rowCls = [
      "k-datatable__tr",
      selected && "k-datatable__tr--selected",
      disabled && "k-datatable__tr--disabled",
      dragOverRowIndex === rowIdx && "k-datatable__tr--drag-over",
      rowClassName?.(row, globalIdx),
    ]
      .filter(Boolean)
      .join(" ");

    const handleRowClick = (e: React.MouseEvent) => {
      if (disabled || !selectionMode || selectionMode === "checkbox") return;
      onRowSelect(row, globalIdx, e);
    };

    const handleRowKeyDown = (e: React.KeyboardEvent) => {
      if (disabled || !selectionMode || selectionMode === "checkbox") return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onRowSelect(row, globalIdx, e as unknown as React.MouseEvent);
      }
    };

    const rows: React.ReactNode[] = [];

    rows.push(
      <tr
        key={rowKey ?? rowIdx}
        className={rowCls}
        style={{
          ...rowStyle?.(row, globalIdx),
          ...(rowHeights[rowIdx] ? { height: rowHeights[rowIdx] } : {}),
        }}
        onClick={handleRowClick}
        onKeyDown={handleRowKeyDown}
        tabIndex={
          selectionMode && selectionMode !== "checkbox" && !disabled
            ? 0
            : undefined
        }
        role="row"
        aria-selected={selected || undefined}
        aria-rowindex={globalIdx + 1}
        aria-expanded={hasExpansion ? expanded : undefined}
        draggable={reorderableRows}
        onDragStart={reorderableRows ? handleRowDragStart(rowIdx) : undefined}
        onDragOver={reorderableRows ? handleRowDragOver(rowIdx) : undefined}
        onDrop={reorderableRows ? handleRowDrop(rowIdx) : undefined}
        onDragEnd={reorderableRows ? handleRowDragEnd : undefined}
      >
        {selectionMode === "checkbox" && (
          <td
            className="k-datatable__td k-datatable__select-cell"
            role="gridcell"
          >
            <Checkbox
              checked={selected}
              disabled={disabled}
              onChange={e => onRowSelect(row, globalIdx, e)}
              size="sm"
            />
          </td>
        )}
        {hasExpansion && (
          <td
            className="k-datatable__td k-datatable__expand-cell"
            role="gridcell"
            style={{ paddingLeft: depth * 20 + 4 }}
          >
            {(hasChildren || rowExpansionTemplate) && (
              <button
                type="button"
                className={`k-datatable__expand-btn${expanded ? " k-datatable__expand-btn--open" : ""}`}
                onClick={e => {
                  e.stopPropagation();
                  toggleExpand(rowKey);
                }}
                aria-label={expanded ? "Collapse row" : "Expand row"}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d={expanded ? CHEVRON_DOWN_PATH : CHEVRON_RIGHT_PATH} />
                </svg>
              </button>
            )}
          </td>
        )}
        {reorderableRows && (
          <td
            className="k-datatable__td k-datatable__drag-cell"
            aria-label="Drag to reorder row"
            role="gridcell"
          >
            <svg
              className="k-datatable__drag-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d={GRIP_VERTICAL_PATH} />
            </svg>
          </td>
        )}
        {visibleCols.map((col, colIdx) => {
          const value = getFieldValue(
            row as Record<string, unknown>,
            col.field
          );
          const isEditing =
            editingCell?.row === rowIdx && editingCell?.field === col.field;

          const tdCls = [
            "k-datatable__td",
            col.align && `k-datatable__td--align-${col.align}`,
            col.textOverflow &&
              col.textOverflow !== "wrap" &&
              `k-datatable__td--${col.textOverflow}`,
            (isEditing ||
              (editMode === "row" && editingRow === rowIdx && col.editable)) &&
              "k-datatable__td--editing",
            col.frozen === "left" && "k-datatable__td--frozen-left",
            col.frozen === "right" && "k-datatable__td--frozen-right",
            col.className,
          ]
            .filter(Boolean)
            .join(" ");

          const hasActions =
            col.actionsPreset || col.actions || col.actionsTemplate;
          let content: React.ReactNode;
          if (hasActions) {
            content = renderActions(col, row, rowIdx);
          } else if (
            editMode === "row" &&
            editingRow === rowIdx &&
            col.editable
          ) {
            const currentVal = rowEditValues[col.field];
            const editedRow = { ...row, ...rowEditValues } as T;
            content = col.editorTemplate ? (
              col.editorTemplate(
                editedRow,
                col,
                globalIdx,
                val => {
                  setRowEditValues(v => ({ ...v, [col.field]: val }));
                },
                cancelRowEdit
              )
            ) : (
              <Input
                value={String(currentVal ?? "")}
                onChange={e =>
                  setRowEditValues(v => ({ ...v, [col.field]: e.target.value }))
                }
                size={inputSize}
                fullWidth
              />
            );
          } else if (isEditing) {
            content = col.editorTemplate ? (
              col.editorTemplate(
                row,
                col,
                globalIdx,
                val => {
                  onCellEdit?.(row, globalIdx, col.field, val);
                  setEditingCell(null);
                },
                cancelEdit
              )
            ) : (
              <Input
                ref={inputRef}
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onBlur={() => commitEdit(rowIdx, col.field)}
                onKeyDown={e =>
                  handleEditKeyDown(
                    e as unknown as React.KeyboardEvent,
                    rowIdx,
                    col.field
                  )
                }
                size={inputSize}
                fullWidth
              />
            );
          } else if (col.bodyTemplate) {
            content = col.bodyTemplate(row, col, globalIdx);
          } else {
            content =
              value === null || value === undefined ? "" : String(value);
          }

          const frozenStyle: React.CSSProperties = {};
          if (
            col.frozen === "left" &&
            frozenLeftOffsets[col.field] !== undefined
          )
            frozenStyle.left = frozenLeftOffsets[col.field];
          if (
            col.frozen === "right" &&
            frozenRightOffsets[col.field] !== undefined
          )
            frozenStyle.right = frozenRightOffsets[col.field];

          return (
            <td
              key={col.field + colIdx}
              className={tdCls}
              style={{ ...col.style, ...frozenStyle }}
              role="gridcell"
              onDoubleClick={
                col.editable && editMode === "cell"
                  ? () => handleDoubleClick(rowIdx, col.field, value)
                  : undefined
              }
            >
              {content}
              {resizableRows && (
                <div
                  className="k-datatable__cell-resize-grip"
                  onMouseDown={handleCellResizeStart(rowIdx, col.field)}
                />
              )}
            </td>
          );
        })}
      </tr>
    );

    // Expansion row (non-tree mode)
    if (expanded && rowExpansionTemplate && !childrenField) {
      rows.push(
        <tr
          key={`${rowKey}-exp`}
          className="k-datatable__tr k-datatable__tr--expansion"
          role="row"
        >
          <td
            colSpan={
              visibleCols.length +
              (selectionMode === "checkbox" ? 1 : 0) +
              (reorderableRows ? 1 : 0) +
              1
            }
            className="k-datatable__td k-datatable__expansion-cell"
            role="gridcell"
          >
            {rowExpansionTemplate(row, globalIdx)}
          </td>
        </tr>
      );
    }

    return rows;
  };

  const visibleItems = flatData.slice(virtualStart, virtualEnd);
  const totalColSpan =
    visibleCols.length +
    (selectionMode === "checkbox" ? 1 : 0) +
    (reorderableRows ? 1 : 0) +
    (hasExpansion ? 1 : 0);

  // Track groups for group headers
  let lastGroupValue: unknown = Symbol("init");

  return (
    <tbody className="k-datatable__tbody" role="rowgroup" ref={tbodyRef}>
      {virtualScroll && virtualPaddingTop > 0 && (
        <tr style={{ height: virtualPaddingTop }} aria-hidden="true" />
      )}
      {visibleItems.map((item, i) => {
        const idx = virtualStart + i;
        const rows: React.ReactNode[] = [];

        // Group header
        if (groupByField) {
          const groupVal = getFieldValue(
            item.row as Record<string, unknown>,
            groupByField
          );
          if (groupVal !== lastGroupValue) {
            lastGroupValue = groupVal;
            const groupRows = flatData
              .filter(
                d =>
                  getFieldValue(
                    d.row as Record<string, unknown>,
                    groupByField
                  ) === groupVal
              )
              .map(d => d.row);
            rows.push(
              <tr
                key={`group-${String(groupVal)}`}
                className="k-datatable__tr k-datatable__tr--group-header"
                role="row"
              >
                <td
                  colSpan={totalColSpan}
                  className="k-datatable__td k-datatable__group-header-cell"
                  role="gridcell"
                >
                  {groupHeaderTemplate ? (
                    groupHeaderTemplate(
                      groupVal,
                      groupRows as Record<string, unknown>[]
                    )
                  ) : (
                    <strong>{String(groupVal)}</strong>
                  )}
                </td>
              </tr>
            );
          }
        }

        rows.push(...renderRow(item, idx));
        return rows;
      })}
      {virtualScroll && virtualPaddingBottom > 0 && (
        <tr style={{ height: virtualPaddingBottom }} aria-hidden="true" />
      )}
    </tbody>
  );
};
