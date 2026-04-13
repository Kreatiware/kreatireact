import React, { forwardRef, useRef, useImperativeHandle, useState, useMemo, useCallback } from 'react';
import { Pagination } from '../Pagination';
import { Spinner } from '../Spinner';
import { Input } from '../Input';
import { Select } from '../Select';
import { Button } from '../Button';
import { ScrollBar } from '../ScrollBar';
import { useKreatiLocale } from '../../locale';
import { DataTableHeader } from './DataTableHeader';
import { DataTableBody } from './DataTableBody';
import { SEARCH_PATH } from '../iconPaths';
import { getFieldValue, matchFilter, generateCSV, downloadFile } from './utils';
import { DOWNLOAD_PATH, PRINT_PATH, COPY_PATH } from '../iconPaths';
import type {
  DataTableProps,
  DataTableRef,
  SortDirection,
  SortMeta,
  ColumnFilterMeta,
  FilterMatchMode,
  DataTableColumn,
} from './types';
import './DataTable.css';

/**
 * DataTable component for displaying, sorting, filtering, and editing tabular data.
 *
 * @description A full-featured data table with dynamic columns, pagination,
 * multi-sort, column/global filters, row selection (click or checkbox),
 * inline cell editing, column and row reordering via drag & drop,
 * frozen columns, column groups, action columns with presets,
 * lazy loading, CSV export, and full keyboard/ARIA support.
 *
 * @example
 * ```tsx
 * const columns = [
 *   { field: 'name', header: 'Name', sortable: true, filterable: true },
 *   { field: 'age', header: 'Age', sortable: true, align: 'right' },
 *   { field: 'actions', header: '', actionsPreset: ['edit', 'delete'], onEdit: handleEdit, onDelete: handleDelete },
 * ];
 *
 * <DataTable
 *   value={users}
 *   columns={columns}
 *   paginator
 *   rows={10}
 *   selectionMode="checkbox"
 *   selection={selected}
 *   onSelectionChange={setSelected}
 *   stripedRows
 * />
 * ```
 */
export const DataTable = forwardRef<DataTableRef, DataTableProps<Record<string, unknown>>>(
  (
    {
      value,
      columns: columnsProp,
      size = 'md',
      stripedRows = true,
      slim = false,
      showRowLines = true,
      showColumnLines = false,
      hoverRows = true,
      resizable = false,
      resizableRows = false,
      selectionMode = null,
      selection: controlledSelection,
      onSelectionChange,
      dataKey = 'id',
      disabledRows,
      paginator = false,
      rows = 10,
      rowsPerPageOptions,
      paginatorTemplate,
      page: controlledPage,
      onPageChange,
      totalRecords: totalRecordsProp,
      sortMode = 'single',
      sortField: controlledSortField,
      sortOrder: controlledSortOrder,
      multiSortMeta: controlledMultiSort,
      onSort,
      globalFilter,
      globalFilterFields,
      filters: controlledFilters,
      onFilter,
      lazy = false,
      onLazyLoad,
      loading = false,
      scrollable = false,
      scrollHeight,
      scrollBarProps: scrollBarPropsProp,
      stickyHeader = true,
      reorderableColumns = false,
      onColumnReorder,
      reorderableRows = false,
      onRowReorder,
      editMode = null,
      onCellEditComplete,
      onRowEditComplete,
      headerTemplate,
      toolbar,
      footerTemplate,
      emptyMessage,
      rowExpansionTemplate,
      expandedRows,
      onExpandedRowsChange,
      childrenField,
      virtualScroll = false,
      virtualScrollItemHeight,
      rowClassName,
      rowStyle,
      exportFilename = 'export',
      groupByField,
      groupHeaderTemplate,
      visibleColumns,
      onVisibleColumnsChange,
      className = '',
      style,
    },
    ref,
  ) => {
    const locale = useKreatiLocale();
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Internal state
    const [internalSelection, setInternalSelection] = useState<Record<string, unknown>[]>([]);
    const [internalPage, setInternalPage] = useState(1);
    const [internalRows, setInternalRows] = useState(rows);
    const [internalSortField, setInternalSortField] = useState<string | undefined>(undefined);
    const [internalSortOrder, setInternalSortOrder] = useState<SortDirection>(null);
    const [internalMultiSort, setInternalMultiSort] = useState<SortMeta[]>([]);
    const [internalFilters, setInternalFilters] = useState<Record<string, ColumnFilterMeta>>({});
    const [internalColumns, setInternalColumns] = useState<DataTableColumn[] | null>(null);
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
    const [toolbarFilter, setToolbarFilter] = useState('');

    // Resolved state
    const selection = controlledSelection ?? internalSelection;
    const currentPage = controlledPage ?? internalPage;
    const currentSortField = controlledSortField ?? internalSortField;
    const currentSortOrder = controlledSortOrder ?? internalSortOrder;
    const multiSortMeta = controlledMultiSort ?? internalMultiSort;
    const filters = controlledFilters ?? internalFilters;
    const columns = internalColumns ?? columnsProp;

    // Apply resize widths
    const resolvedColumns = useMemo(() => {
      let cols = columns;
      if (Object.keys(columnWidths).length > 0) {
        cols = cols.map(col => columnWidths[col.field] ? { ...col, width: `${columnWidths[col.field]}px` } : col);
      }
      // Apply visible prop and visibleColumns filter
      cols = cols.map(col => {
        let isHidden = col.hidden || col.visible === false;
        if (visibleColumns && !visibleColumns.includes(col.field)) isHidden = true;
        return isHidden !== col.hidden ? { ...col, hidden: isHidden } : col;
      });
      return cols;
    }, [columns, columnWidths, visibleColumns]);

    // Locale strings for body
    const bodyLocale = {
      edit: locale.dataTable?.edit ?? 'Edit',
      delete: locale.dataTable?.delete ?? 'Delete',
      view: locale.dataTable?.view ?? 'View',
      copy: locale.dataTable?.copy ?? 'Copy',
      noData: (emptyMessage as string) || locale.dataTable?.emptyMessage || 'No data available',
    };

    // ─── Sorting ─────────────────────────────────────────────────────
    const handleSort = useCallback((field: string) => {
      if (sortMode === 'single') {
        let newOrder: SortDirection;
        if (currentSortField === field) {
          newOrder = currentSortOrder === 'asc' ? 'desc' : currentSortOrder === 'desc' ? null : 'asc';
        } else {
          newOrder = 'asc';
        }
        if (!controlledSortField) {
          setInternalSortField(newOrder ? field : undefined);
          setInternalSortOrder(newOrder);
        }
        onSort?.(field, newOrder);
      } else {
        const existing = multiSortMeta.findIndex(m => m.field === field);
        let newMeta: SortMeta[];
        if (existing >= 0) {
          const current = multiSortMeta[existing];
          if (current.order === 'asc') {
            newMeta = multiSortMeta.map((m, i) => i === existing ? { ...m, order: 'desc' as SortDirection } : m);
          } else {
            newMeta = multiSortMeta.filter((_, i) => i !== existing);
          }
        } else {
          newMeta = [...multiSortMeta, { field, order: 'asc' }];
        }
        if (!controlledMultiSort) setInternalMultiSort(newMeta);
        onSort?.(field, newMeta.find(m => m.field === field)?.order ?? null, newMeta);
      }
    }, [sortMode, currentSortField, currentSortOrder, multiSortMeta, controlledSortField, controlledMultiSort, onSort]);

    // ─── Filtering ───────────────────────────────────────────────────
    const handleFilterApply = useCallback((field: string, value: unknown, matchMode: FilterMatchMode) => {
      const newFilters = { ...filters, [field]: { value, matchMode } };
      if (!controlledFilters) setInternalFilters(newFilters);
      onFilter?.(newFilters);
    }, [filters, controlledFilters, onFilter]);

    const handleFilterClear = useCallback((field: string) => {
      const newFilters = { ...filters };
      delete newFilters[field];
      if (!controlledFilters) setInternalFilters(newFilters);
      onFilter?.(newFilters);
    }, [filters, controlledFilters, onFilter]);

    // ─── Data Processing (non-lazy) ─────────────────────────────────
    const processedData = useMemo(() => {
      if (lazy) return value;
      let result = [...value];

      // Global filter
      const activeGlobalFilter = globalFilter || toolbarFilter;
      if (activeGlobalFilter) {
        const fields = globalFilterFields || columns.filter(c => !c.hidden).map(c => c.field);
        result = result.filter(row =>
          fields.some(f => matchFilter(getFieldValue(row, f), activeGlobalFilter, 'contains')),
        );
      }

      // Column filters
      const activeFilters = Object.entries(filters).filter(([, meta]) => meta.value !== '' && meta.value !== null && meta.value !== undefined);
      if (activeFilters.length > 0) {
        result = result.filter(row =>
          activeFilters.every(([field, meta]) => matchFilter(getFieldValue(row, field), meta.value, meta.matchMode)),
        );
      }

      // Sort
      if (sortMode === 'single' && currentSortField && currentSortOrder) {
        const col = columns.find(c => c.field === currentSortField);
        result.sort((a, b) => {
          if (col?.sortFunction) return col.sortFunction(a, b, currentSortField, currentSortOrder);
          const va = getFieldValue(a, currentSortField);
          const vb = getFieldValue(b, currentSortField);
          let cmp = 0;
          if (va === null || va === undefined) cmp = -1;
          else if (vb === null || vb === undefined) cmp = 1;
          else if (typeof va === 'number' && typeof vb === 'number') cmp = va - vb;
          else cmp = String(va).localeCompare(String(vb));
          return currentSortOrder === 'desc' ? -cmp : cmp;
        });
      } else if (sortMode === 'multiple' && multiSortMeta.length > 0) {
        result.sort((a, b) => {
          for (const meta of multiSortMeta) {
            const col = columns.find(c => c.field === meta.field);
            if (col?.sortFunction) {
              const r = col.sortFunction(a, b, meta.field, meta.order);
              if (r !== 0) return r;
              continue;
            }
            const va = getFieldValue(a, meta.field);
            const vb = getFieldValue(b, meta.field);
            let cmp = 0;
            if (va === null || va === undefined) cmp = -1;
            else if (vb === null || vb === undefined) cmp = 1;
            else if (typeof va === 'number' && typeof vb === 'number') cmp = va - vb;
            else cmp = String(va).localeCompare(String(vb));
            if (cmp !== 0) return meta.order === 'desc' ? -cmp : cmp;
          }
          return 0;
        });
      }

      // Group sort — group field takes priority, then other sorts apply within groups
      if (groupByField) {
        const stableResult = result.map((row, i) => ({ row, idx: i }));
        stableResult.sort((a, b) => {
          const ga = getFieldValue(a.row, groupByField);
          const gb = getFieldValue(b.row, groupByField);
          if (ga === gb) return a.idx - b.idx; // preserve within-group order from previous sorts
          if (ga === null || ga === undefined) return 1;
          if (gb === null || gb === undefined) return -1;
          return String(ga).localeCompare(String(gb));
        });
        result = stableResult.map(s => s.row);
      }

      return result;
    }, [value, lazy, globalFilter, toolbarFilter, globalFilterFields, filters, sortMode, currentSortField, currentSortOrder, multiSortMeta, columns, groupByField]);

    const totalRecords = totalRecordsProp ?? processedData.length;

    // ─── Pagination ──────────────────────────────────────────────────
    const paginatedData = useMemo(() => {
      if (!paginator || lazy) return processedData;
      const start = (currentPage - 1) * internalRows;
      return processedData.slice(start, start + internalRows);
    }, [processedData, paginator, lazy, currentPage, internalRows]);

    const startIndex = paginator ? (currentPage - 1) * internalRows : 0;

    const handlePageChange = useCallback((p: number) => {
      if (!controlledPage) setInternalPage(p);
      onPageChange?.(p);
    }, [controlledPage, onPageChange]);

    // ─── Selection ───────────────────────────────────────────────────
    const handleRowSelect = useCallback((row: Record<string, unknown>, _rowIndex: number, event: React.MouseEvent | React.ChangeEvent) => {
      let newSelection: Record<string, unknown>[];
      if (selectionMode === 'single') {
        newSelection = selection.some(s => s[dataKey] === row[dataKey]) ? [] : [row];
      } else {
        const exists = selection.some(s => s[dataKey] === row[dataKey]);
        if (exists) {
          newSelection = selection.filter(s => s[dataKey] !== row[dataKey]);
        } else {
          newSelection = [...selection, row];
        }
      }
      if (!controlledSelection) setInternalSelection(newSelection);
      onSelectionChange?.(newSelection);
    }, [selectionMode, selection, dataKey, controlledSelection, onSelectionChange]);

    const allSelected = useMemo(() => {
      if (!paginatedData.length) return false;
      const selectableRows = paginatedData.filter((r, i) => !disabledRows?.(r, startIndex + i));
      return selectableRows.length > 0 && selectableRows.every(r => selection.some(s => s[dataKey] === (r as Record<string, unknown>)[dataKey]));
    }, [paginatedData, selection, dataKey, disabledRows, startIndex]);

    const someSelected = useMemo(() => {
      return selection.length > 0 && !allSelected;
    }, [selection, allSelected]);

    const handleSelectAll = useCallback(() => {
      const selectableRows = paginatedData.filter((r, i) => !disabledRows?.(r, startIndex + i));
      let newSelection: Record<string, unknown>[];
      if (allSelected) {
        const pageKeys = new Set(selectableRows.map(r => (r as Record<string, unknown>)[dataKey]));
        newSelection = selection.filter(s => !pageKeys.has(s[dataKey]));
      } else {
        const existing = new Set(selection.map(s => s[dataKey]));
        const toAdd = selectableRows.filter(r => !existing.has((r as Record<string, unknown>)[dataKey]));
        newSelection = [...selection, ...toAdd];
      }
      if (!controlledSelection) setInternalSelection(newSelection);
      onSelectionChange?.(newSelection);
    }, [paginatedData, allSelected, selection, dataKey, disabledRows, startIndex, controlledSelection, onSelectionChange]);

    // ─── Column Reorder ──────────────────────────────────────────────
    const handleColumnReorder = useCallback((fromIndex: number, toIndex: number) => {
      const newCols = [...columns];
      const [moved] = newCols.splice(fromIndex, 1);
      newCols.splice(toIndex, 0, moved);
      setInternalColumns(newCols);
      onColumnReorder?.(newCols);
    }, [columns, onColumnReorder]);
    // ─── Frozen Offsets (computed from DOM) ─────────────────────────
    const [frozenLeftOffsets, setFrozenLeftOffsets] = useState<Record<string, number>>({});
    const [frozenRightOffsets, setFrozenRightOffsets] = useState<Record<string, number>>({});

    React.useLayoutEffect(() => {
      const table = wrapperRef.current?.querySelector('.k-datatable__table');
      if (!table) return;
      const headerRow = table.querySelector('.k-datatable__thead tr:last-child');
      if (!headerRow) return;
      const ths = Array.from(headerRow.querySelectorAll<HTMLTableCellElement>('.k-datatable__th'));

      const leftOffsets: Record<string, number> = {};
      const rightOffsets: Record<string, number> = {};
      const visibleCols = resolvedColumns.filter(c => !c.hidden);

      // Map th elements to columns (skip checkbox/expand/drag ths)
      let colIdx = 0;
      const colThs: { field: string; th: HTMLTableCellElement }[] = [];
      ths.forEach(th => {
        if (th.classList.contains('k-datatable__select-cell') || th.classList.contains('k-datatable__expand-cell') || th.classList.contains('k-datatable__drag-cell')) return;
        if (colIdx < visibleCols.length) {
          colThs.push({ field: visibleCols[colIdx].field, th });
          colIdx++;
        }
      });

      // Left frozen
      let left = 0;
      ths.forEach(th => {
        if (th.classList.contains('k-datatable__select-cell') || th.classList.contains('k-datatable__expand-cell') || th.classList.contains('k-datatable__drag-cell')) {
          left += th.getBoundingClientRect().width;
        }
      });
      colThs.filter(c => visibleCols.find(v => v.field === c.field)?.frozen === 'left').forEach(({ field, th }) => {
        leftOffsets[field] = Math.round(left);
        left += th.getBoundingClientRect().width;
      });

      // Right frozen
      let right = 0;
      [...colThs].reverse().filter(c => visibleCols.find(v => v.field === c.field)?.frozen === 'right').forEach(({ field, th }) => {
        rightOffsets[field] = Math.round(right);
        right += th.getBoundingClientRect().width;
      });

      setFrozenLeftOffsets(leftOffsets);
      setFrozenRightOffsets(rightOffsets);
    }, [resolvedColumns, selectionMode, rowExpansionTemplate, childrenField, reorderableRows]);

    // ─── Row Reorder ─────────────────────────────────────────────────
    const handleRowReorder = useCallback((fromIndex: number, toIndex: number) => {
      const newData = [...value];
      const [moved] = newData.splice(startIndex + fromIndex, 1);
      newData.splice(startIndex + toIndex, 0, moved);
      onRowReorder?.(newData);
    }, [value, startIndex, onRowReorder]);

    // ─── Cell Edit ───────────────────────────────────────────────────
    const handleCellEdit = useCallback((row: Record<string, unknown>, rowIndex: number, field: string, newValue: unknown) => {
      onCellEditComplete?.({ row, rowIndex, field, newValue });
    }, [onCellEditComplete]);

    // ─── Row Edit ────────────────────────────────────────────────────
    const handleRowEdit = useCallback((row: Record<string, unknown>, rowIndex: number, newValues: Record<string, unknown>) => {
      onRowEditComplete?.({ row, rowIndex, field: '', newValue: newValues, originalValue: row });
    }, [onRowEditComplete]);

    // ─── Column Resize ───────────────────────────────────────────────
    // Listen for cell-level resize events from body
    React.useEffect(() => {
      if (!resizable || !wrapperRef.current) return;
      const handler = (e: Event) => {
        const { field, width } = (e as CustomEvent).detail;
        handleColumnResize(field, width);
      };
      const el = wrapperRef.current;
      el.addEventListener('kreati-col-resize', handler);
      return () => el.removeEventListener('kreati-col-resize', handler);
    }, [resizable]);

    const handleColumnResize = useCallback((field: string, width: number) => {
      // On first resize, capture all current column widths to prevent layout jump
      setColumnWidths(prev => {
        if (Object.keys(prev).length === 0) {
          const table = wrapperRef.current?.querySelector('.k-datatable__table');
          if (table) {
            const ths = table.querySelectorAll<HTMLTableCellElement>('.k-datatable__thead tr:last-child .k-datatable__th');
            const initial: Record<string, number> = {};
            const visibleCols = (internalColumns ?? columnsProp).filter(c => !c.hidden);
            let colIdx = 0;
            ths.forEach(th => {
              // Skip non-data columns (checkbox, expand, drag)
              if (th.classList.contains('k-datatable__select-cell') || th.classList.contains('k-datatable__expand-cell') || th.classList.contains('k-datatable__drag-cell')) return;
              if (colIdx < visibleCols.length) {
                initial[visibleCols[colIdx].field] = Math.round(th.getBoundingClientRect().width);
                colIdx++;
              }
            });
            initial[field] = width;
            return initial;
          }
        }
        return { ...prev, [field]: width };
      });
    }, [columnsProp, internalColumns]);

    // ─── Column Groups ───────────────────────────────────────────────
    const columnGroups = useMemo(() => {
      const groups = new Map<string, DataTableColumn[]>();
      columns.filter(c => c.columnGroup && !c.hidden).forEach(col => {
        const existing = groups.get(col.columnGroup!) || [];
        existing.push(col);
        groups.set(col.columnGroup!, existing);
      });
      return groups.size > 0 ? groups : undefined;
    }, [columns]);

    // ─── Ref Methods ─────────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      exportCSV: () => {
        const csv = generateCSV(processedData, columns);
        downloadFile(csv, `${exportFilename}.csv`, 'text/csv;charset=utf-8;');
      },
      print: () => {
        const table = wrapperRef.current?.querySelector('.k-datatable__table');
        if (!table) return;
        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(`<html><head><title>${exportFilename}</title><style>table{border-collapse:collapse;width:100%;font-family:sans-serif}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#0f78a5;color:#fff}tr:nth-child(even){background:#f9fafb}</style></head><body>${table.outerHTML}</body></html>`);
        win.document.close();
        win.print();
      },
      copyToClipboard: () => {
        const visibleCols = columns.filter(c => !c.hidden && c.field && !c.field.startsWith('__'));
        const header = visibleCols.map(c => c.header || c.field).join('\t');
        const rows = (selection.length > 0 ? selection : processedData).map(row =>
          visibleCols.map(c => { const v = getFieldValue(row, c.field); return v === null || v === undefined ? '' : String(v); }).join('\t'),
        );
        navigator.clipboard?.writeText([header, ...rows].join('\n'));
      },
      resetSort: () => {
        setInternalSortField(undefined);
        setInternalSortOrder(null);
        setInternalMultiSort([]);
      },
      resetFilters: () => {
        setInternalFilters({});
      },
      getProcessedData: () => processedData,
    }));

    // ─── Classes ─────────────────────────────────────────────────────
    const wrapperCls = [
      'k-datatable',
      `k-datatable--${size}`,
      stripedRows && 'k-datatable--striped',
      slim && 'k-datatable--slim',
      hoverRows && 'k-datatable--hover',
      showRowLines && 'k-datatable--row-lines',
      showColumnLines && 'k-datatable--col-lines',
      stickyHeader && scrollable && 'k-datatable--sticky-header',
      resizable && 'k-datatable--resizable',
      resizableRows && 'k-datatable--resizable-rows',
      className,
    ].filter(Boolean).join(' ');

    // Page info text
    const pageStart = startIndex + 1;
    const pageEnd = Math.min(startIndex + internalRows, totalRecords);

    return (
      <div ref={wrapperRef} className={wrapperCls} style={style} role="grid" aria-busy={loading} aria-label={locale.dataTable?.ariaLabel || 'Data table'} aria-rowcount={totalRecords}>
        {(headerTemplate || toolbar) && (
          <div className="k-datatable__header">
            {headerTemplate || (
              <div className="k-datatable__toolbar">
                {toolbar?.includes('search') && (
                  <Input
                    value={toolbarFilter}
                    onChange={e => setToolbarFilter(e.target.value)}
                    placeholder={locale.common?.search || 'Search...'}
                    size="sm"
                    variant="floating"
                    label={locale.common?.search || 'Search'}
                    iconLeft={<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={SEARCH_PATH} /></svg>}
                    iconRight={toolbarFilter ? <button type="button" style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex' }} onClick={() => setToolbarFilter('')} aria-label="Clear search"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19,6.41L17.59,5,12,10.59,6.41,5,5,6.41,10.59,12,5,17.59,6.41,19,12,13.41,17.59,19,19,17.59,13.41,12Z" /></svg></button> : undefined}
                    className="k-datatable__toolbar-search"
                  />
                )}
                <div className="k-datatable__toolbar-actions">
                  {toolbar?.includes('copy') && (
                    <Button iconLeft={<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={COPY_PATH} /></svg>} size="xs" buttonType="outlined" severity="secondary" ariaLabel={locale.dataTable?.copy || 'Copy'} tooltip={locale.dataTable?.copy || 'Copy'} onClick={() => { const ref = wrapperRef.current; if (ref) (ref as unknown as { __ref?: DataTableRef }).__ref?.copyToClipboard?.(); }} />
                  )}
                  {toolbar?.includes('export') && (
                    <Button iconLeft={<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={DOWNLOAD_PATH} /></svg>} size="xs" buttonType="outlined" severity="secondary" ariaLabel={locale.dataTable?.exportCSV || 'Export'} tooltip={locale.dataTable?.exportCSV || 'Export'} onClick={() => { const csv = generateCSV(processedData, columns); downloadFile(csv, `${exportFilename}.csv`, 'text/csv;charset=utf-8;'); }} />
                  )}
                  {toolbar?.includes('print') && (
                    <Button iconLeft={<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={PRINT_PATH} /></svg>} size="xs" buttonType="outlined" severity="secondary" ariaLabel={locale.dataTable?.print || 'Print'} tooltip={locale.dataTable?.print || 'Print'} onClick={() => { const table = wrapperRef.current?.querySelector('.k-datatable__table'); if (!table) return; const win = window.open('', '_blank'); if (!win) return; win.document.write(`<html><head><title>${exportFilename}</title><style>table{border-collapse:collapse;width:100%;font-family:sans-serif}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#0f78a5;color:#fff}tr:nth-child(even){background:#f9fafb}</style></head><body>${table.outerHTML}</body></html>`); win.document.close(); win.print(); }} />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {(() => {
          const headerEl = (

            <DataTableHeader
              columns={resolvedColumns} sortMode={sortMode} sortField={currentSortField} sortOrder={currentSortOrder}
              multiSortMeta={multiSortMeta} onSort={handleSort} filters={filters} onFilterApply={handleFilterApply}
              onFilterClear={handleFilterClear} selectionMode={selectionMode} allSelected={allSelected}
              someSelected={someSelected} onSelectAll={handleSelectAll} reorderableColumns={reorderableColumns}
              onColumnReorder={handleColumnReorder} reorderableRows={reorderableRows}
              hasExpansion={!!rowExpansionTemplate || !!childrenField}
              resizable={resizable} onResize={handleColumnResize}
              frozenLeftOffsets={frozenLeftOffsets} frozenRightOffsets={frozenRightOffsets}
              columnGroups={columnGroups}
            />
          );
          const bodyEl = (
            <DataTableBody
              data={paginatedData} columns={resolvedColumns} dataKey={dataKey} size={size} selectionMode={selectionMode}
              selection={selection} onRowSelect={handleRowSelect} disabledRows={disabledRows} rowClassName={rowClassName}
              rowStyle={rowStyle} editMode={editMode} onCellEdit={handleCellEdit} onRowEdit={handleRowEdit}
              reorderableRows={reorderableRows} onRowReorder={handleRowReorder} resizableRows={resizableRows} startIndex={startIndex} locale={bodyLocale}
              rowExpansionTemplate={rowExpansionTemplate} expandedRows={expandedRows} onExpandedRowsChange={onExpandedRowsChange}
              childrenField={childrenField} virtualScroll={virtualScroll} virtualScrollItemHeight={virtualScrollItemHeight}
              scrollHeight={scrollHeight}
              groupByField={groupByField}
              groupHeaderTemplate={groupHeaderTemplate}
              frozenLeftOffsets={frozenLeftOffsets}
              frozenRightOffsets={frozenRightOffsets}
            />
          );
          const footerEl = columns.some(c => c.footer || c.footerTemplate) ? (
            <tfoot>
              <tr role="row">
                {selectionMode === 'checkbox' && <td className="k-datatable__td" />}
                {(!!rowExpansionTemplate || !!childrenField) && <td className="k-datatable__td" />}
                {reorderableRows && <td className="k-datatable__td" />}
                {columns.filter(c => !c.hidden).map((col, i) => (
                  <td key={col.field + i} className="k-datatable__td" role="gridcell">
                    {col.footerTemplate ? col.footerTemplate(col) : col.footer || ''}
                  </td>
                ))}
              </tr>
            </tfoot>
          ) : null;
          const tableEl = <table className="k-datatable__table">{headerEl}{bodyEl}{footerEl}</table>;

          if (scrollable && !virtualScroll) {
            return <ScrollBar orientation="both" maxHeight={scrollHeight || '400px'} variant="kreati" size="sm" {...(scrollBarPropsProp as object)}>{tableEl}</ScrollBar>;
          }
          if (virtualScroll) {
            return <div className="k-datatable__virtual-scroll" style={{ maxHeight: scrollHeight || '400px', overflow: 'auto' }}>{tableEl}</div>;
          }
          return <div className="k-datatable__scroll-container">{tableEl}</div>;
        })()}

        {loading && (
          <div className="k-datatable__loading" aria-live="polite">
            <Spinner size="lg" />
          </div>
        )}

        {paginator && (
          <div className="k-datatable__paginator-bar">
            {paginatorTemplate ? (
              paginatorTemplate({ page: currentPage, totalPages: Math.ceil(totalRecords / internalRows), totalRecords, rows: internalRows, onPageChange: handlePageChange })
            ) : (
              <>
                {rowsPerPageOptions && (
                  <div className="k-datatable__rows-per-page">
                    <Select
                      options={rowsPerPageOptions.map(opt => ({ value: opt, label: String(opt) }))}
                      value={internalRows}
                      onChange={(val) => { setInternalRows(Number(val)); if (!controlledPage) setInternalPage(1); onPageChange?.(1); }}
                      size="xs"
                      placeholder="Rows"
                    />
                  </div>
                )}
                <Pagination
                  totalItems={totalRecords}
                  itemsPerPage={internalRows}
                  page={currentPage}
                  onPageChange={handlePageChange}
                  size={size === 'lg' ? 'md' : 'sm'}
                />
                <span className="k-datatable__page-info">
                  {pageStart}-{pageEnd} / {totalRecords}
                </span>
              </>
            )}
          </div>
        )}

        {footerTemplate && <div className="k-datatable__footer">{footerTemplate}</div>}
      </div>
    );
  },
) as <T extends Record<string, unknown>>(
  props: DataTableProps<T> & { ref?: React.Ref<DataTableRef> }
) => React.ReactElement;

(DataTable as { displayName?: string }).displayName = 'DataTable';
