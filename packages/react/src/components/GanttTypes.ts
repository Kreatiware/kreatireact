import type React from "react";
import type { MenuItem } from "../types/navigation";

/** Severity type for task bar colors */
export type GanttSeverity =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "help"
  | "danger"
  | "accent";

/** Task type determines visual representation */
export type GanttTaskType = "task" | "milestone" | "summary";

/** Dependency relationship type between tasks */
export type GanttDependencyType = "FS" | "FF" | "SS" | "SF";

/** Time scale granularity */
export type GanttViewMode = "day" | "week" | "month";

/** Dependency definition — string (taskId, implies FS) or object */
export type GanttDependencyInput = string | GanttDependency;

/** Preset column names that the Gantt renders automatically */
export type GanttPresetColumn =
  | "title"
  | "startDate"
  | "endDate"
  | "duration"
  | "progress"
  | "assignees"
  | "options";

/** Column definition: preset string or custom object */
export type GanttColumnDef = GanttPresetColumn | GanttColumn;

/** Resolved dependency with explicit type */
export interface GanttDependency {
  /** ID of the predecessor task */
  taskId: string;
  /** Relationship type. Default: "FS" (Finish-to-Start) */
  type?: GanttDependencyType;
}

/** Assignee for display in the assignees preset column */
export interface GanttAssignee {
  /** Unique identifier */
  id: string;
  /** Display label (initials or name) */
  label: string;
  /** Avatar image URL */
  image?: string;
}

/** A single task in the Gantt chart */
export interface GanttTask {
  /** Unique identifier */
  id: string;
  /** Task name displayed in the table and tooltip */
  title: string;
  /** Start date as ISO string (YYYY-MM-DD) */
  start: string;
  /** End date as ISO string (YYYY-MM-DD) */
  end: string;
  /** Completion percentage (0–100). Default: 0 */
  progress?: number;
  /** Visual type: "task" (bar), "milestone" (diamond), "summary" (bracket). Default: "task" */
  type?: GanttTaskType;
  /** Parent task ID for hierarchy (subtask) */
  parentId?: string;
  /** Predecessor dependencies. String = taskId with FS type. */
  dependencies?: GanttDependencyInput[];
  /** Bar color severity. Default: "primary" */
  severity?: GanttSeverity;
  /** Whether children are collapsed (only for summary tasks) */
  collapsed?: boolean;
  /** Assignee IDs resolved from availableAssignees */
  assigneeIds?: string[];
  /** Baseline start date (original plan) for comparison. ISO string. */
  baselineStart?: string;
  /** Baseline end date (original plan) for comparison. ISO string. */
  baselineEnd?: string;
  /** Additional CSS class on the task row and bar */
  className?: string;
  /** Row height override for this task (pixels). Falls back to global rowHeight. */
  rowHeight?: number;
  /** Inline styles on the task bar */
  style?: React.CSSProperties;
  /** Arbitrary user data */
  data?: Record<string, unknown>;
}

/** Custom column definition for the left-side table */
export interface GanttColumn {
  /** Field key from GanttTask or custom */
  field: string;
  /** Column header label */
  header: string;
  /** Column width in pixels. Default: 150 */
  width?: number;
  /** Custom cell renderer */
  template?: (task: GanttTask) => React.ReactNode;
}

/** Slots for customizing the edit dialog */
export interface GanttEditSlots {
  /** Replace or add fields after the default form fields */
  customSlot?: (
    task: GanttTask,
    setTask: (task: GanttTask) => void
  ) => React.ReactNode;
}

/** Export format for Gantt data */
export type GanttExportFormat = "csv" | "json" | "svg" | "png";

/** Slots for customizing the toolbar */
export interface GanttToolbarSlots {
  /** Content inserted after the view mode buttons (left side) */
  leftSlot?: React.ReactNode;
  /** Content inserted before the export buttons (right side) */
  rightSlot?: React.ReactNode;
  /** Replace the entire toolbar */
  toolbarRender?: (defaultToolbar: React.ReactNode) => React.ReactNode;
}

/** Event payload when a task is moved or resized via drag */
export interface GanttTaskChangeEvent {
  /** The task that was modified */
  task: GanttTask;
  /** New start date */
  start: string;
  /** New end date */
  end: string;
}

/** Event payload when task progress is changed via drag */
export interface GanttProgressChangeEvent {
  /** The task that was modified */
  task: GanttTask;
  /** New progress value (0–100) */
  progress: number;
}

/** Props for the Gantt component */
export interface GanttProps {
  /** Array of tasks (controlled). When provided, component does not manage task state. */
  tasks?: GanttTask[];

  /** Default tasks (uncontrolled). Component manages state internally. */
  defaultTasks?: GanttTask[];

  /** Available assignees for the assignees column and edit dialog */
  availableAssignees?: GanttAssignee[];

  /** Column definitions. Mix of preset strings and custom objects. Default: ["title"] */
  columns?: GanttColumnDef[];

  /** Time scale granularity. Default: "day" */
  viewMode?: GanttViewMode;

  /** Show the today marker line. Default: true */
  showTodayMarker?: boolean;

  /** Show dependency arrows between tasks. Default: true */
  showDependencies?: boolean;

  /** Allow dragging bars to move tasks. Default: true */
  draggable?: boolean;

  /** Fully read-only mode. Disables all editing, context menu, connectors, undo/redo, add task. Default: false */
  readOnly?: boolean;

  /** Allow resizing bars to change duration. Default: true */
  resizable?: boolean;

  /** Allow dragging the progress handle inside bars. Default: true */
  progressDraggable?: boolean;

  /** Initial width of the left table panel in pixels. Default: 360 */
  tableWidth?: number;

  /** Minimum width of the left table panel. Default: 200 */
  minTableWidth?: number;

  /** Row height in pixels. Default: 40 */
  rowHeight?: number;

  /** Bar height as fraction of rowHeight (0–1). Default: 0.5 */
  barHeight?: number;

  /** Custom tooltip renderer for task bars */
  tooltipTemplate?: (task: GanttTask) => React.ReactNode;

  /** Custom bar renderer (replaces default bar) */
  barTemplate?: (
    task: GanttTask,
    barX: number,
    barWidth: number,
    barHeight: number
  ) => React.ReactNode;

  /** Label rendered next to the bar. Hidden by default. Return a string to display. */
  barLabelTemplate?: (task: GanttTask) => React.ReactNode;

  /** Position of the bar label. Default: "right" */
  barLabelPosition?: "left" | "right" | "inside" | "top" | "bottom";

  /** Slots for customizing the edit dialog */
  editSlots?: GanttEditSlots;

  /** Slots for customizing the toolbar */
  toolbarSlots?: GanttToolbarSlots;

  /** Export formats to show in toolbar. Default: [] (hidden) */
  exportFormats?: GanttExportFormat[];

  /** Show filter input in toolbar. Default: false */
  showFilter?: boolean;

  /** Fires when filter text changes */
  onFilterChange?: (text: string) => void;

  /** Show date range selector in toolbar. Default: false */
  showDateRange?: boolean;

  /** Show mini navigator below the chart. Default: false */
  showNavigator?: boolean;

  /** Navigator visibility mode. Default: "fixed" */
  navigatorVisibility?: "fixed" | "auto" | "zoom-fixed";

  /** Allow collapsing the left table panel. Default: true */
  tableCollapsible?: boolean;

  /** Show critical path highlighting. Default: false */
  showCriticalPath?: boolean;

  /** Show baseline comparison bars. Requires baselineStart/baselineEnd on tasks. Default: false */
  showBaseline?: boolean;

  /** Auto-schedule dependent tasks when a task is moved. Default: false */
  autoSchedule?: boolean;

  /** Fires when a new task is created via context menu */
  onTaskCreate?: (task: GanttTask) => void;

  /** Replace the entire edit dialog content */
  editTemplate?: (
    task: GanttTask,
    close: () => void,
    save: (task: GanttTask) => void
  ) => React.ReactNode;

  /** Fires when a task is moved or resized via drag */
  onTaskChange?: (event: GanttTaskChangeEvent) => void;

  /** Fires when task progress is changed via drag */
  onProgressChange?: (event: GanttProgressChangeEvent) => void;

  /** Fires when a task row or bar is clicked */
  onTaskClick?: (task: GanttTask) => void;

  /** Fires when a task row or bar is double-clicked */
  onTaskDoubleClick?: (task: GanttTask) => void;

  /** Fires after a task is saved from the edit dialog */
  onTaskEdit?: (task: GanttTask) => void;

  /** Fires after a task is deleted (confirmed) */
  onTaskDelete?: (taskId: string) => void;

  /** Fires when a dependency link is created via drag */
  onDependencyCreate?: (
    fromId: string,
    toId: string,
    type: GanttDependencyType
  ) => void;

  /** Fires when a dependency is removed */
  onDependencyDelete?: (fromId: string, toId: string) => void;

  /** Fires when a summary task is expanded or collapsed */
  onExpandChange?: (taskId: string, collapsed: boolean) => void;

  /** Show context menu on right-click. Default: true */
  showRowContextMenu?: boolean;

  /** Show milestone flag markers with vertical lines and labels in the header. Default: false */
  showMilestoneFlags?: boolean;

  /** Customize context menu items */
  contextMenuRender?: (task: GanttTask, defaultItems: MenuItem[]) => MenuItem[];

  /** Additional CSS class names */
  className?: string;

  /** Inline styles */
  style?: React.CSSProperties;

  /** Component width (CSS value) */
  width?: string | number;

  /** Component height (CSS value) */
  height?: string | number;

  /** Maximum height (CSS value). Enables vertical scroll. */
  maxHeight?: string | number;

  /** Maximum width (CSS value) */
  maxWidth?: string | number;
}

/** Imperative handle exposed via ref */
export interface GanttRef {
  /** Scroll the chart to center on today's date */
  scrollToToday: () => void;
  /** Scroll the chart to center on a specific task */
  scrollToTask: (taskId: string) => void;
  /** Expand all summary tasks */
  expandAll: () => void;
  /** Collapse all summary tasks */
  collapseAll: () => void;
  /** Get the currently visible date range in the viewport */
  getVisibleDateRange: () => { start: string; end: string } | null;
  /** Undo the last action (uncontrolled mode only) */
  undo: () => void;
  /** Redo the last undone action (uncontrolled mode only) */
  redo: () => void;
  /** Export the chart in the specified format */
  export: (format: GanttExportFormat) => void;
  /** Toggle read-only mode */
  setReadOnly: (value: boolean) => void;
  /** Toggle critical path highlighting */
  setCriticalPath: (value: boolean) => void;
  /** Toggle auto-schedule */
  setAutoSchedule: (value: boolean) => void;
  /** Get current tasks array */
  getTasks: () => GanttTask[];
  /** Reset zoom to 1x */
  resetZoom: () => void;
  /** Set zoom level (0.2–5) */
  setZoom: (level: number) => void;
}
