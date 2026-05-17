import React from "react";

/** Sort direction */
export type SortDirection = "asc" | "desc" | null;

/** Sort meta for multi-sort */
export interface SortMeta {
  field: string;
  order: SortDirection;
}

/** Filter match mode */
export type FilterMatchMode =
  | "contains"
  | "startsWith"
  | "endsWith"
  | "equals"
  | "notEquals"
  | "gt"
  | "gte"
  | "lt"
  | "lte";

/** Column filter meta */
export interface ColumnFilterMeta {
  value: unknown;
  matchMode: FilterMatchMode;
}

/** Selection mode */
export type SelectionMode = "single" | "multiple" | "checkbox" | null;

/** Column frozen position */
export type FrozenPosition = "left" | "right";

/** Action preset type */
export type ActionPreset = "edit" | "delete" | "view" | "copy";

/** Column action item */
export interface DataTableActionItem {
  /** Unique key */
  key: string;
  /** Label text */
  label: string;
  /** Icon element */
  icon?: React.ReactNode;
  /** Callback */
  command?: (row: Record<string, unknown>, rowIndex: number) => void;
  /** Disabled state per row */
  disabled?: boolean | ((row: Record<string, unknown>) => boolean);
  /** Severity for styling */
  severity?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "help";
  /** Additional class */
  className?: string;
  /** Inline style */
  style?: React.CSSProperties;
}

/** Column definition */
export interface DataTableColumn<T = object> {
  /** Field key to access row data */
  field: string;
  /** Column header text */
  header?: string;
  /** Custom header template */
  headerTemplate?: (col: DataTableColumn<T>) => React.ReactNode;
  /** Custom body/cell template */
  bodyTemplate?: (
    row: T,
    col: DataTableColumn<T>,
    rowIndex: number
  ) => React.ReactNode;
  /** Custom footer template */
  footerTemplate?: (col: DataTableColumn<T>) => React.ReactNode;
  /** Footer text */
  footer?: string;
  /** Sortable */
  sortable?: boolean;
  /** Custom sort function */
  sortFunction?: (a: T, b: T, field: string, order: SortDirection) => number;
  /** Filterable */
  filterable?: boolean;
  /** Filter match mode */
  filterMatchMode?: FilterMatchMode;
  /** Filter panel direction (default: 'down', auto-flips if no space) */
  filterDirection?: "up" | "down";
  /** Custom filter template */
  filterTemplate?: (
    col: DataTableColumn<T>,
    value: unknown,
    onChange: (val: unknown) => void
  ) => React.ReactNode;
  /** Editable */
  editable?: boolean;
  /** Custom editor template */
  editorTemplate?: (
    row: T,
    col: DataTableColumn<T>,
    rowIndex: number,
    onSave: (val: unknown) => void,
    onCancel: () => void
  ) => React.ReactNode;
  /** Column width (CSS value) */
  width?: string | number;
  /** Min width */
  minWidth?: string | number;
  /** Max width */
  maxWidth?: string | number;
  /** Text alignment */
  align?: "left" | "center" | "right";
  /** Frozen column */
  frozen?: FrozenPosition;
  /** Hidden column */
  hidden?: boolean;
  /** Visible column (default true) — alternative to hidden */
  visible?: boolean;
  /** Reorderable */
  reorderable?: boolean;
  /** Resizable */
  resizable?: boolean;
  /** Column group header (for grouped columns) */
  columnGroup?: string;
  /** Actions preset */
  actionsPreset?: ActionPreset[];
  /** Custom actions */
  actions?: DataTableActionItem[];
  /** Actions template override */
  actionsTemplate?: (row: T, rowIndex: number) => React.ReactNode;
  /** Edit callback (for actionsPreset) */
  onEdit?: (row: T, rowIndex: number) => void;
  /** Delete callback (for actionsPreset) */
  onDelete?: (row: T, rowIndex: number) => void;
  /** View callback (for actionsPreset) */
  onView?: (row: T, rowIndex: number) => void;
  /** Text overflow behavior */
  textOverflow?: "wrap" | "ellipsis" | "clip";
  /** Additional class for the column cells */
  className?: string;
  /** Inline style for the column cells */
  style?: React.CSSProperties;
  /** Header class */
  headerClassName?: string;
  /** Header style */
  headerStyle?: React.CSSProperties;
}

/** Row class/style callback */
export type RowClassCallback<T = object> = (
  row: T,
  rowIndex: number
) => string | undefined;
export type RowStyleCallback<T = object> = (
  row: T,
  rowIndex: number
) => React.CSSProperties | undefined;

/** Lazy load event */
export interface DataTableLazyEvent {
  first: number;
  rows: number;
  sortField?: string;
  sortOrder?: SortDirection;
  multiSortMeta?: SortMeta[];
  filters?: Record<string, ColumnFilterMeta>;
  globalFilter?: string;
}

/** Row edit event */
export interface DataTableRowEditEvent<T = object> {
  row: T;
  rowIndex: number;
  field: string;
  newValue: unknown;
  originalValue: unknown;
}

/** Cell edit event */
export interface DataTableCellEditEvent<T = object> {
  row: T;
  rowIndex: number;
  field: string;
  newValue: unknown;
}

/** Export format */
export type ExportFormat = "csv";

/** Row expansion template */
export type RowExpansionTemplate<T = object> = (
  row: T,
  rowIndex: number
) => React.ReactNode;

/** DataTable props */
export interface DataTableProps<T = object> {
  /** Data array */
  value: T[];
  /** Column definitions */
  columns: DataTableColumn<T>[];
  /** Component size */
  size?: "sm" | "md" | "lg";
  /** Striped rows */
  stripedRows?: boolean;
  /** Slim mode — reduces row padding to hug content tightly */
  slim?: boolean;
  /** Show row gridlines */
  showRowLines?: boolean;
  /** Show column gridlines */
  showColumnLines?: boolean;
  /** Hover highlight on rows */
  hoverRows?: boolean;
  /** Resizable table — allows dragging column borders to resize */
  resizable?: boolean;
  /** Row height resize — allows dragging row borders to resize height */
  resizableRows?: boolean;
  /** Selection mode */
  selectionMode?: SelectionMode;
  /** Selected rows (controlled) */
  selection?: T[];
  /** Selection change callback */
  onSelectionChange?: (selection: T[]) => void;
  /** Row key field for identification */
  dataKey?: string;
  /** Disabled rows (cannot be selected) */
  disabledRows?: (row: T, rowIndex: number) => boolean;
  /** Paginator */
  paginator?: boolean;
  /** Rows per page */
  rows?: number;
  /** Rows per page options */
  rowsPerPageOptions?: number[];
  /** Custom template for the paginator bar */
  paginatorTemplate?: (props: {
    page: number;
    totalPages: number;
    totalRecords: number;
    rows: number;
    onPageChange: (p: number) => void;
  }) => React.ReactNode;
  /** Current page (controlled, 1-based) */
  page?: number;
  /** Page change callback */
  onPageChange?: (page: number) => void;
  /** Total records (for lazy mode) */
  totalRecords?: number;
  /** Sort mode */
  sortMode?: "single" | "multiple";
  /** Current sort field (single mode, controlled) */
  sortField?: string;
  /** Current sort order (single mode, controlled) */
  sortOrder?: SortDirection;
  /** Multi sort meta (controlled) */
  multiSortMeta?: SortMeta[];
  /** Sort change callback */
  onSort?: (
    field: string,
    order: SortDirection,
    multiSortMeta?: SortMeta[]
  ) => void;
  /** Global filter value */
  globalFilter?: string;
  /** Global filter fields (which columns to search) */
  globalFilterFields?: string[];
  /** Column filters (controlled) */
  filters?: Record<string, ColumnFilterMeta>;
  /** Filter change callback */
  onFilter?: (filters: Record<string, ColumnFilterMeta>) => void;
  /** Lazy loading mode */
  lazy?: boolean;
  /** Lazy load callback */
  onLazyLoad?: (event: DataTableLazyEvent) => void;
  /** Loading state */
  loading?: boolean;
  /** Scrollable */
  scrollable?: boolean;
  /** Scroll height (CSS value) */
  scrollHeight?: string;
  /** Props forwarded to the internal ScrollBar component */
  scrollBarProps?: Record<string, unknown>;
  /** Sticky header (default true) */
  stickyHeader?: boolean;
  /** Reorderable columns (drag & drop) */
  reorderableColumns?: boolean;
  /** Column reorder callback */
  onColumnReorder?: (columns: DataTableColumn<T>[]) => void;
  /** Reorderable rows (drag & drop) */
  reorderableRows?: boolean;
  /** Row reorder callback */
  onRowReorder?: (value: T[]) => void;
  /** Cell edit mode */
  editMode?: "cell" | "row" | null;
  /** Cell edit complete callback */
  onCellEditComplete?: (event: DataTableCellEditEvent<T>) => void;
  /** Row edit complete callback */
  onRowEditComplete?: (event: DataTableRowEditEvent<T>) => void;
  /** Header template (above table) */
  headerTemplate?: React.ReactNode;
  /** Toolbar presets — renders pre-built toolbar items. Overridden by headerTemplate if both provided */
  toolbar?: ("search" | "export" | "print" | "copy")[];
  /** Footer template (below table) */
  footerTemplate?: React.ReactNode;
  /** Empty message when no data */
  emptyMessage?: React.ReactNode;
  /** Row expansion template — renders expanded content below the row */
  rowExpansionTemplate?: RowExpansionTemplate<T>;
  /** Expanded row keys (controlled) */
  expandedRows?: (string | number)[];
  /** Expanded rows change callback */
  onExpandedRowsChange?: (keys: (string | number)[]) => void;
  /** Field in data that contains children rows (tree mode) */
  childrenField?: string;
  /** Virtual scroll — only renders visible rows for large datasets */
  virtualScroll?: boolean;
  /** Virtual scroll item height in px (required for virtual scroll) */
  virtualScrollItemHeight?: number;
  /** Row class callback */
  rowClassName?: RowClassCallback<T>;
  /** Row style callback */
  rowStyle?: RowStyleCallback<T>;
  /** Row context menu items */
  contextMenuItems?: DataTableActionItem[];
  /** Export filename (without extension) */
  exportFilename?: string;
  /** Row grouping field — groups rows by this field value */
  groupByField?: string;
  /** Custom template for group header rows */
  groupHeaderTemplate?: (groupValue: unknown, rows: T[]) => React.ReactNode;
  /** Visible column fields (controlled) — hides columns not in this array */
  visibleColumns?: string[];
  /** Visible columns change callback */
  onVisibleColumnsChange?: (fields: string[]) => void;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/** Ref methods exposed by DataTable */
export interface DataTableRef {
  /** Export data to CSV */
  exportCSV: () => void;
  /** Print the table */
  print: () => void;
  /** Copy selected rows to clipboard as tab-separated text */
  copyToClipboard: () => void;
  /** Reset all sorts */
  resetSort: () => void;
  /** Reset all filters */
  resetFilters: () => void;
  /** Get the current processed (sorted/filtered) data */
  getProcessedData: () => Record<string, unknown>[];
}
