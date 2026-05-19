import React, {
  useRef,
  useImperativeHandle,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";
import { DropdownButton } from "./DropdownButton";
import { Input } from "./Input";
import { Select } from "./Select";
import { Slider } from "./Slider";
import { SegmentedControl } from "./SegmentedControl";
import { Calendar } from "./Calendar";
import { MultiSelect } from "./MultiSelect";
import { Avatar } from "./Avatar";
import { AvatarGroup } from "./AvatarGroup";
import { Dial } from "./Dial";
import { Dialog } from "./Dialog";
import { ContextMenu } from "./ContextMenu";
import {
  CHEVRON_RIGHT_PATH,
  PENCIL_PATH,
  TRASH_PATH,
  UNDO_PATH,
  REDO_PATH,
  SEARCH_PATH,
} from "./iconPaths";
import { useKreatiLocale } from "../locale";
import type { MenuItem } from "../types/navigation";
import {
  parseDate,
  formatDate,
  addDays,
  diffDays,
  computeDateRange,
  generateCells,
  generateGroups,
  flattenTasks,
  resolveDependencies,
  dependencyPath,
  arrowHead,
  cellWidth as getCellWidth,
} from "./GanttUtils";
import type {
  GanttTask,
  GanttViewMode,
  GanttColumn,
  GanttColumnDef,
  GanttAssignee,
  GanttExportFormat,
  GanttDependencyType,
  GanttProps,
  GanttRef,
  GanttSeverity,
} from "./GanttTypes";
import "./Gantt.css";

export type {
  GanttSeverity,
  GanttTaskType,
  GanttDependencyType,
  GanttViewMode,
  GanttDependencyInput,
  GanttDependency,
  GanttTask,
  GanttColumn,
  GanttColumnDef,
  GanttPresetColumn,
  GanttAssignee,
  GanttEditSlots,
  GanttToolbarSlots,
  GanttExportFormat,
  GanttTaskChangeEvent,
  GanttProgressChangeEvent,
  GanttRef,
  GanttProps,
} from "./GanttTypes";

const DEFAULT_COLUMN_DEFS: GanttColumnDef[] = ["title"];

const SEVERITY_OPTIONS: GanttSeverity[] = [
  "primary",
  "secondary",
  "success",
  "info",
  "warning",
  "help",
  "danger",
  "accent",
];

const VIEW_MODES: GanttViewMode[] = ["day", "week", "month"];

/**
 * Gantt chart component for project scheduling and task management.
 *
 * @description Renders a hybrid HTML table (left) + SVG timeline (right) with
 * synchronized scrolling. Supports hierarchical tasks, 4 dependency types,
 * drag to move/resize bars, progress dragging, milestones, summary tasks,
 * and configurable time scales (day/week/month).
 *
 * Exposes imperative methods via ref: scrollToToday, scrollToTask,
 * expandAll, collapseAll, getVisibleDateRange.
 *
 * @example
 * ```tsx
 * const ganttRef = useRef<GanttRef>(null);
 * <Gantt
 *   ref={ganttRef}
 *   tasks={[
 *     { id: "1", title: "Design", start: "2026-05-01", end: "2026-05-10", progress: 60 },
 *     { id: "2", title: "Develop", start: "2026-05-08", end: "2026-05-20", dependencies: ["1"] },
 *   ]}
 * />
 * ```
 */
const Gantt = ({
  tasks: tasksProp,
  defaultTasks,
  availableAssignees = [],
  columns: columnDefs = DEFAULT_COLUMN_DEFS,
  viewMode: viewModeProp,
  showTodayMarker = true,
  showDependencies = true,
  draggable = true,
  readOnly = false,
  resizable = true,
  progressDraggable = true,
  tableWidth: tableWidthProp = 360,
  minTableWidth = 200,
  rowHeight = 40,
  barHeight: barHeightRatio = 0.5,
  tooltipTemplate,
  barTemplate,
  barLabelTemplate,
  barLabelPosition = "right",
  editSlots,
  toolbarSlots,
  exportFormats = [],
  showFilter = false,
  onFilterChange,
  showDateRange = false,
  showNavigator = true,
  navigatorVisibility = "auto",
  tableCollapsible = true,
  showCriticalPath = false,
  showBaseline = false,
  autoSchedule = false,
  onTaskCreate,
  editTemplate,
  onTaskChange,
  onProgressChange,
  onTaskClick,
  onTaskDoubleClick,
  onTaskEdit,
  onTaskDelete,
  onDependencyCreate,
  onDependencyDelete,
  onExpandChange,
  showRowContextMenu = true,
  showMilestoneFlags = false,
  contextMenuRender,
  className,
  style,
  width,
  height,
  maxHeight,
  maxWidth,
  ref,
}: GanttProps & { ref?: React.Ref<GanttRef> }) => {
  const locale = useKreatiLocale();
  const t = locale.gantt;
  const [readOnlyState, setReadOnlyState] = useState(readOnly);
  const editable = !readOnlyState;

  // Sync prop
  useEffect(() => {
    setReadOnlyState(readOnly);
  }, [readOnly]);

  // ─── Uncontrolled / Controlled ────────────────────────────────────────
  const isControlled = tasksProp !== undefined;
  const [internalTasks, setInternalTasksRaw] = useState<GanttTask[]>(
    defaultTasks ?? tasksProp ?? []
  );
  const tasks = isControlled ? tasksProp! : internalTasks;

  // ─── Undo / Redo ─────────────────────────────────────────────────────
  const undoStack = useRef<GanttTask[][]>([]);
  const redoStack = useRef<GanttTask[][]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const setInternalTasks = useCallback(
    (updater: GanttTask[] | ((prev: GanttTask[]) => GanttTask[])) => {
      setInternalTasksRaw(prev => {
        undoStack.current.push(prev);
        if (undoStack.current.length > 50) undoStack.current.shift();
        redoStack.current = [];
        setCanUndo(true);
        setCanRedo(false);
        return typeof updater === "function" ? updater(prev) : updater;
      });
    },
    []
  );

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    setInternalTasksRaw(prev => {
      redoStack.current.push(prev);
      const restored = undoStack.current.pop()!;
      setCanUndo(undoStack.current.length > 0);
      setCanRedo(true);
      return restored;
    });
  }, []);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    setInternalTasksRaw(prev => {
      undoStack.current.push(prev);
      const restored = redoStack.current.pop()!;
      setCanRedo(redoStack.current.length > 0);
      setCanUndo(true);
      return restored;
    });
  }, []);

  const updateTask = useCallback(
    (updated: GanttTask) => {
      if (!isControlled) {
        setInternalTasks(prev =>
          prev.map(tk => (tk.id === updated.id ? updated : tk))
        );
      }
      onTaskEdit?.(updated);
    },
    [isControlled, onTaskEdit]
  );

  const deleteTask = useCallback(
    (taskId: string) => {
      if (!isControlled) {
        setInternalTasks(prev =>
          prev.filter(tk => tk.id !== taskId && tk.parentId !== taskId)
        );
      }
      onTaskDelete?.(taskId);
    },
    [isControlled, onTaskDelete]
  );

  // ─── Resolve Preset Columns ───────────────────────────────────────────
  const columns: GanttColumn[] = useMemo(() => {
    return columnDefs
      .map((def): GanttColumn => {
        if (typeof def !== "string") return def;
        switch (def) {
          case "title":
            return { field: "title", header: t?.title ?? "Title", width: 0 };
          case "startDate":
            return {
              field: "start",
              header: t?.start ?? "Start",
              width: 110,
            };
          case "endDate":
            return { field: "end", header: t?.end ?? "End", width: 110 };
          case "duration":
            return {
              field: "_duration",
              header: t?.duration ?? "Duration",
              width: 85,
              template: task => {
                if (task.type === "milestone")
                  return <span className="k-gantt__preset-duration">—</span>;
                const d = diffDays(parseDate(task.start), parseDate(task.end));
                return <span className="k-gantt__preset-duration">{d}d</span>;
              },
            };
          case "progress":
            return {
              field: "_progress",
              header: t?.progress ?? "Progress",
              width: 75,
              template: task => {
                if (task.type === "milestone" || task.type === "summary")
                  return null;
                const p = task.progress ?? 0;
                const color =
                  p >= 100
                    ? "var(--kreati-severity-success)"
                    : p >= 60
                      ? "var(--kreati-severity-info)"
                      : p >= 30
                        ? "var(--kreati-severity-warning)"
                        : "var(--kreati-severity-danger)";
                return (
                  <Dial
                    value={p}
                    width={32}
                    height={32}
                    strokeWidth={10}
                    readOnly
                    valueColor={color}
                    className="k-gantt__preset-dial"
                  />
                );
              },
            };
          case "assignees":
            return {
              field: "_assignees",
              header: t?.assignees ?? "Assignees",
              width: 100,
              template: task => {
                if (!task.assigneeIds?.length) return null;
                const resolved = task.assigneeIds
                  .map(id => availableAssignees.find(a => a.id === id))
                  .filter(Boolean) as GanttAssignee[];
                if (resolved.length === 0) return null;
                if (resolved.length === 1) {
                  return (
                    <Avatar
                      label={resolved[0].label}
                      image={resolved[0].image}
                      size="xs"
                    />
                  );
                }
                return (
                  <AvatarGroup max={3} size="xs">
                    {resolved.map(a => (
                      <Avatar key={a.id} label={a.label} image={a.image} />
                    ))}
                  </AvatarGroup>
                );
              },
            };
          case "options":
            if (!editable) return null as unknown as GanttColumn;
            return {
              field: "_options",
              header: "",
              width: 60,
              template: task => (
                <div className="k-gantt__preset-options">
                  <button
                    className="k-gantt__opt-btn"
                    onClick={e => {
                      e.stopPropagation();
                      openEditDialog(task);
                    }}
                    aria-label={t?.edit ?? "Edit"}
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14">
                      <path d={PENCIL_PATH} fill="currentColor" />
                    </svg>
                  </button>
                  <button
                    className="k-gantt__opt-btn k-gantt__opt-btn--danger"
                    onClick={e => {
                      e.stopPropagation();
                      openDeleteConfirm(task);
                    }}
                    aria-label={t?.delete ?? "Delete"}
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14">
                      <path d={TRASH_PATH} fill="currentColor" />
                    </svg>
                  </button>
                </div>
              ),
            };
          default:
            return { field: def, header: def };
        }
      })
      .filter(Boolean) as GanttColumn[];
  }, [columnDefs, t, availableAssignees, editable]);

  // ─── Edit Dialog State ────────────────────────────────────────────────
  const [editingTask, setEditingTask] = useState<GanttTask | null>(null);
  const [editDraft, setEditDraft] = useState<GanttTask | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GanttTask | null>(null);
  const [pendingSuccessorChanges, setPendingSuccessorChanges] = useState<
    Array<{
      targetTaskId: string;
      action: "update" | "delete";
      fromId: string;
      type?: "FS" | "FF" | "SS" | "SF";
    }>
  >([]);

  const tasksRef = useRef<GanttTask[]>(tasks);
  tasksRef.current = tasks;

  const openEditDialog = useCallback((task: GanttTask) => {
    const current = tasksRef.current.find(tk => tk.id === task.id) ?? task;
    setEditingTask(current);
    setEditDraft({
      ...current,
      dependencies: current.dependencies ? [...current.dependencies] : [],
    });
    setPendingSuccessorChanges([]);
  }, []);

  const openDeleteConfirm = useCallback((task: GanttTask) => {
    setDeleteTarget(task);
  }, []);

  const editDraftRef = useRef<GanttTask | null>(null);
  editDraftRef.current = editDraft;

  const pendingRef = useRef(pendingSuccessorChanges);
  pendingRef.current = pendingSuccessorChanges;

  const cascadeRef = useRef<(list: GanttTask[], id: string) => GanttTask[]>(
    l => l
  );
  const autoScheduleRef = useRef(false);

  const handleEditSave = useCallback(() => {
    const draft = editDraftRef.current;
    if (!draft) return;
    updateTask(draft);
    if (!isControlled) {
      setInternalTasks(prev => {
        let next = prev.map(tk => (tk.id === draft.id ? draft : tk));
        // Apply pending successor changes
        for (const ch of pendingRef.current) {
          next = next.map(tk => {
            if (tk.id !== ch.targetTaskId) return tk;
            if (ch.action === "delete") {
              return {
                ...tk,
                dependencies: (tk.dependencies ?? []).filter(
                  d => (typeof d === "string" ? d : d.taskId) !== ch.fromId
                ),
              };
            }
            return {
              ...tk,
              dependencies: (tk.dependencies ?? []).map(d => {
                const id = typeof d === "string" ? d : d.taskId;
                if (id !== ch.fromId) return d;
                return { taskId: ch.fromId, type: ch.type! };
              }),
            };
          });
        }
        // Auto-schedule cascade
        if (autoScheduleRef.current) next = cascadeRef.current(next, draft.id);
        return next;
      });
    }
    setEditingTask(null);
    setEditDraft(null);
    setPendingSuccessorChanges([]);
  }, [updateTask, isControlled]);

  const handleEditClose = useCallback(() => {
    setEditingTask(null);
    setEditDraft(null);
    setPendingSuccessorChanges([]);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    deleteTask(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteTarget, deleteTask]);

  // ─── Component State ──────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<GanttViewMode>(
    viewModeProp ?? "day"
  );
  const [tblWidth, setTblWidth] = useState(tableWidthProp);
  const [tableCollapsed, setTableCollapsed] = useState(false);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterText, setFilterText] = useState("");
  const [dateRangeStart, setDateRangeStart] = useState<Date | undefined>(
    undefined
  );
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | undefined>(undefined);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => {
    const s = new Set<string>();
    for (const tk of tasks) {
      if (tk.collapsed) s.add(tk.id);
    }
    return s;
  });
  const [tooltipInfo, setTooltipInfo] = useState<{
    task: GanttTask;
    x: number;
    y: number;
  } | null>(null);

  // Refs
  const rootRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const chartScrollRef = useRef<HTMLDivElement>(null);
  const chartHeaderRef = useRef<HTMLDivElement>(null);
  const splitterActive = useRef(false);
  const syncingScroll = useRef<"table" | "chart" | null>(null);

  // Drag state
  const dragRef = useRef<{
    type: "move" | "resize-left" | "resize-right" | "progress";
    taskId: string;
    startX: number;
    origStart: string;
    origEnd: string;
    origProgress: number;
    barX: number;
    barWidth: number;
  } | null>(null);

  // Sync viewMode prop
  useEffect(() => {
    if (viewModeProp !== undefined) setViewMode(viewModeProp);
  }, [viewModeProp]);

  // Ctrl+Wheel zoom (native listener for passive: false)
  useEffect(() => {
    const el = chartScrollRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoomLevel(z => Math.min(5, Math.max(0.2, z * delta)));
      }
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  // Sync collapsed from props when tasks change
  useEffect(() => {
    setCollapsedIds(prev => {
      const next = new Set(prev);
      for (const t of tasks) {
        if (t.collapsed === true) next.add(t.id);
        else if (t.collapsed === false) next.delete(t.id);
      }
      return next;
    });
  }, [tasks]);

  // ─── Computed Data ────────────────────────────────────────────────────

  const today = useMemo(() => new Date(), []);
  const flatList = useMemo(
    () => flattenTasks(tasks, collapsedIds),
    [tasks, collapsedIds]
  );
  const visibleTasks = useMemo(() => {
    let list = flatList.filter(f => f.visible);
    if (filterText) {
      const lower = filterText.toLowerCase();
      list = list.filter(f => f.task.title.toLowerCase().includes(lower));
    }
    return list;
  }, [flatList, filterText]);
  const deps = useMemo(
    () => (showDependencies ? resolveDependencies(tasks) : []),
    [tasks, showDependencies]
  );

  const dateRange = useMemo(() => {
    const computed = computeDateRange(tasks, viewMode);
    if (dateRangeStart && dateRangeEnd) {
      return { start: dateRangeStart, end: dateRangeEnd };
    }
    return computed;
  }, [tasks, viewMode, dateRangeStart, dateRangeEnd]);
  const cells = useMemo(
    () => generateCells(dateRange.start, dateRange.end, viewMode, today),
    [dateRange, viewMode, today]
  );
  const groups = useMemo(
    () => generateGroups(cells, viewMode),
    [cells, viewMode]
  );

  const baseCw = getCellWidth(viewMode);
  const [zoomLevel, setZoomLevel] = useState(1);
  const cw = baseCw * zoomLevel;
  const totalWidth = cells.length * cw;
  const headerHeight = 52;

  const resetZoom = useCallback(() => setZoomLevel(1), []);
  const isZoomed = zoomLevel !== 1;

  // ─── Critical Path ────────────────────────────────────────────────────

  const [criticalPathEnabled, setCriticalPathEnabled] =
    useState(showCriticalPath);
  const criticalPathIds = useMemo(() => {
    if (!criticalPathEnabled) return new Set<string>();
    // Forward pass: earliest start/finish
    const es = new Map<string, number>();
    const ef = new Map<string, number>();
    const nonSummary = tasks.filter(tk => tk.type !== "summary");
    for (const tk of nonSummary) {
      es.set(tk.id, diffDays(dateRange.start, parseDate(tk.start)));
      ef.set(tk.id, diffDays(dateRange.start, parseDate(tk.end)));
    }
    // Resolve dependencies for earliest start
    let changed = true;
    let iter = 0;
    while (changed && iter < 100) {
      changed = false;
      iter++;
      for (const tk of nonSummary) {
        for (const dep of tk.dependencies ?? []) {
          const predId = typeof dep === "string" ? dep : dep.taskId;
          const predEf = ef.get(predId);
          if (predEf !== undefined && predEf > (es.get(tk.id) ?? 0)) {
            const dur = (ef.get(tk.id) ?? 0) - (es.get(tk.id) ?? 0);
            es.set(tk.id, predEf);
            ef.set(tk.id, predEf + dur);
            changed = true;
          }
        }
      }
    }
    // Find project end
    let projectEnd = 0;
    for (const v of ef.values()) if (v > projectEnd) projectEnd = v;
    // Backward pass: latest finish/start
    const lf = new Map<string, number>();
    const ls = new Map<string, number>();
    for (const tk of nonSummary) {
      lf.set(tk.id, projectEnd);
      ls.set(tk.id, projectEnd - ((ef.get(tk.id) ?? 0) - (es.get(tk.id) ?? 0)));
    }
    changed = true;
    iter = 0;
    while (changed && iter < 100) {
      changed = false;
      iter++;
      for (const tk of nonSummary) {
        // Find successors
        for (const succ of nonSummary) {
          for (const dep of succ.dependencies ?? []) {
            const predId = typeof dep === "string" ? dep : dep.taskId;
            if (predId === tk.id) {
              const succLs = ls.get(succ.id) ?? projectEnd;
              if (succLs < (lf.get(tk.id) ?? projectEnd)) {
                const dur = (ef.get(tk.id) ?? 0) - (es.get(tk.id) ?? 0);
                lf.set(tk.id, succLs);
                ls.set(tk.id, succLs - dur);
                changed = true;
              }
            }
          }
        }
      }
    }
    // Critical = zero float
    const ids = new Set<string>();
    for (const tk of nonSummary) {
      const float = (lf.get(tk.id) ?? 0) - (ef.get(tk.id) ?? 0);
      if (Math.abs(float) < 0.5) ids.add(tk.id);
    }
    return ids;
  }, [criticalPathEnabled, tasks, dateRange.start]);

  // ─── Auto-schedule ────────────────────────────────────────────────────

  const [autoScheduleEnabled, setAutoScheduleEnabled] = useState(autoSchedule);
  const [baselineEnabled, setBaselineEnabled] = useState(showBaseline);
  autoScheduleRef.current = autoScheduleEnabled;

  // ─── Position Helpers ─────────────────────────────────────────────────

  const dateToX = useCallback(
    (iso: string): number => {
      const d = parseDate(iso);
      const days = diffDays(dateRange.start, d);
      if (viewMode === "day") return days * cw;
      if (viewMode === "week") return (days / 7) * cw;
      const totalDays = diffDays(dateRange.start, dateRange.end);
      return totalDays > 0 ? (days / totalDays) * totalWidth : 0;
    },
    [dateRange, viewMode, cw, totalWidth]
  );

  const xToDate = useCallback(
    (x: number): Date => {
      if (viewMode === "day")
        return addDays(dateRange.start, Math.round(x / cw));
      if (viewMode === "week")
        return addDays(dateRange.start, Math.round((x / cw) * 7));
      const totalDays = diffDays(dateRange.start, dateRange.end);
      return addDays(dateRange.start, Math.round((x / totalWidth) * totalDays));
    },
    [dateRange, viewMode, cw, totalWidth]
  );

  // ─── Scroll Sync ─────────────────────────────────────────────────────

  const handleTableScroll = useCallback(() => {
    if (syncingScroll.current === "chart") return;
    syncingScroll.current = "table";
    if (chartScrollRef.current && tableScrollRef.current) {
      chartScrollRef.current.scrollTop = tableScrollRef.current.scrollTop;
    }
    requestAnimationFrame(() => {
      syncingScroll.current = null;
    });
  }, []);

  const navViewportRef = useRef<HTMLDivElement>(null);

  const handleChartScroll = useCallback(() => {
    if (syncingScroll.current === "table") return;
    syncingScroll.current = "chart";
    if (tableScrollRef.current && chartScrollRef.current) {
      tableScrollRef.current.scrollTop = chartScrollRef.current.scrollTop;
    }
    if (chartHeaderRef.current && chartScrollRef.current) {
      chartHeaderRef.current.scrollLeft = chartScrollRef.current.scrollLeft;
    }
    // Update navigator viewport via DOM (no re-render)
    if (navViewportRef.current && chartScrollRef.current) {
      const sl = chartScrollRef.current.scrollLeft;
      const cw = chartScrollRef.current.clientWidth;
      const tw = chartScrollRef.current.scrollWidth;
      navViewportRef.current.style.left = `${(sl / tw) * 100}%`;
      navViewportRef.current.style.width = `${(cw / tw) * 100}%`;
    }
    requestAnimationFrame(() => {
      syncingScroll.current = null;
    });
  }, []);

  // ─── Splitter ─────────────────────────────────────────────────────────

  const handleSplitterDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      splitterActive.current = true;
      const startX = e.clientX;
      const startWidth = tblWidth;
      const onMove = (ev: MouseEvent) => {
        setTblWidth(Math.max(minTableWidth, startWidth + ev.clientX - startX));
      };
      const onUp = () => {
        splitterActive.current = false;
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [tblWidth, minTableWidth]
  );

  // ─── Expand / Collapse ────────────────────────────────────────────────

  const toggleCollapse = useCallback(
    (taskId: string) => {
      setCollapsedIds(prev => {
        const next = new Set(prev);
        const nowCollapsed = !next.has(taskId);
        if (nowCollapsed) next.add(taskId);
        else next.delete(taskId);
        onExpandChange?.(taskId, nowCollapsed);
        return next;
      });
    },
    [onExpandChange]
  );

  const expandAll = useCallback(() => {
    setCollapsedIds(new Set());
  }, []);

  const collapseAll = useCallback(() => {
    const allParents = new Set<string>();
    const childSet = new Set(
      tasks.filter(t => t.parentId).map(t => t.parentId!)
    );
    for (const id of childSet) allParents.add(id);
    setCollapsedIds(allParents);
  }, [tasks]);

  // ─── Auto-schedule Cascade ──────────────────────────────────────────

  const cascadeSchedule = useCallback(
    (taskList: GanttTask[], movedId: string): GanttTask[] => {
      const result = [...taskList];
      const queue = [movedId];
      const visited = new Set<string>();
      while (queue.length > 0) {
        const id = queue.shift()!;
        if (visited.has(id)) continue;
        visited.add(id);
        const src = result.find(tk => tk.id === id);
        if (!src) continue;
        const srcStart = parseDate(src.start);
        const srcEnd = parseDate(src.end);
        for (let i = 0; i < result.length; i++) {
          const tk = result[i];
          for (const dep of tk.dependencies ?? []) {
            const predId = typeof dep === "string" ? dep : dep.taskId;
            const depType = typeof dep === "string" ? "FS" : (dep.type ?? "FS");
            if (predId !== id) continue;
            const tkStart = parseDate(tk.start);
            const tkEnd = parseDate(tk.end);
            const dur = diffDays(tkStart, tkEnd);
            let needsMove = false;
            let ns = tkStart;
            // FS: successor starts after predecessor finishes
            if (depType === "FS" && srcEnd > tkStart) {
              ns = srcEnd;
              needsMove = true;
            }
            // SS: successor starts when predecessor starts
            if (depType === "SS" && srcStart > tkStart) {
              ns = srcStart;
              needsMove = true;
            }
            // FF: successor finishes when predecessor finishes -> adjust start
            if (depType === "FF" && srcEnd > tkEnd) {
              ns = addDays(srcEnd, -dur);
              needsMove = true;
            }
            // SF: successor finishes when predecessor starts
            if (depType === "SF" && srcStart > tkEnd) {
              ns = addDays(srcStart, -dur);
              needsMove = true;
            }
            if (needsMove) {
              result[i] = {
                ...tk,
                start: formatDate(ns),
                end: formatDate(addDays(ns, dur)),
              };
              queue.push(tk.id);
            }
          }
        }
      }
      return result;
    },
    []
  );

  cascadeRef.current = cascadeSchedule;

  // ─── Bar Drag ─────────────────────────────────────────────────────────

  const handleBarMouseDown = useCallback(
    (
      e: React.MouseEvent,
      taskId: string,
      type: "move" | "resize-left" | "resize-right" | "progress"
    ) => {
      e.stopPropagation();
      e.preventDefault();
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      const barX = dateToX(task.start);
      const barEnd = dateToX(task.end);
      const startX = e.clientX;
      let dragging = false;

      dragRef.current = {
        type,
        taskId,
        startX,
        origStart: task.start,
        origEnd: task.end,
        origProgress: task.progress ?? 0,
        barX,
        barWidth: barEnd - barX,
      };

      const onMove = (ev: MouseEvent) => {
        if (!dragRef.current) return;
        const dx = ev.clientX - startX;
        if (!dragging) {
          if (Math.abs(dx) < 3) return;
          dragging = true;
          rootRef.current?.classList.add("k-gantt--dragging");
        }
        const dr = dragRef.current;

        if (dr.type === "move" && draggable) {
          const newStart = xToDate(dr.barX + dx);
          const origDays = diffDays(
            parseDate(dr.origStart),
            parseDate(dr.origEnd)
          );
          const newEnd = addDays(newStart, origDays);
          const s = formatDate(newStart);
          const e = formatDate(newEnd);
          if (!isControlled) {
            setInternalTasks(prev => {
              let next = prev.map(tk =>
                tk.id === task.id ? { ...tk, start: s, end: e } : tk
              );
              if (autoScheduleEnabled) next = cascadeSchedule(next, task.id);
              return next;
            });
          }
          onTaskChange?.({
            task: { ...task, start: s, end: e },
            start: s,
            end: e,
          });
        } else if (dr.type === "resize-left" && resizable) {
          const newStart = xToDate(dr.barX + dx);
          const s = formatDate(newStart);
          if (parseDate(s) < parseDate(dr.origEnd)) {
            if (!isControlled) {
              setInternalTasks(prev => {
                let next = prev.map(tk =>
                  tk.id === task.id ? { ...tk, start: s } : tk
                );
                if (autoScheduleEnabled) next = cascadeSchedule(next, task.id);
                return next;
              });
            }
            onTaskChange?.({
              task: { ...task, start: s },
              start: s,
              end: dr.origEnd,
            });
          }
        } else if (dr.type === "resize-right" && resizable) {
          const newEnd = xToDate(dr.barX + dr.barWidth + dx);
          const e = formatDate(newEnd);
          if (parseDate(e) > parseDate(dr.origStart)) {
            if (!isControlled) {
              setInternalTasks(prev => {
                let next = prev.map(tk =>
                  tk.id === task.id ? { ...tk, end: e } : tk
                );
                if (autoScheduleEnabled) next = cascadeSchedule(next, task.id);
                return next;
              });
            }
            onTaskChange?.({
              task: { ...task, end: e },
              start: dr.origStart,
              end: e,
            });
          }
        } else if (dr.type === "progress" && progressDraggable) {
          const pct = Math.min(
            100,
            Math.max(
              0,
              Math.round(
                ((dx + dr.barWidth * (dr.origProgress / 100)) / dr.barWidth) *
                  100
              )
            )
          );
          if (!isControlled)
            setInternalTasks(prev =>
              prev.map(tk =>
                tk.id === task.id ? { ...tk, progress: pct } : tk
              )
            );
          onProgressChange?.({
            task: { ...task, progress: pct },
            progress: pct,
          });
        }
      };

      const onUp = () => {
        dragRef.current = null;
        rootRef.current?.classList.remove("k-gantt--dragging");
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [
      tasks,
      dateToX,
      xToDate,
      draggable,
      resizable,
      progressDraggable,
      onTaskChange,
      onProgressChange,
    ]
  );

  // ─── Tooltip ──────────────────────────────────────────────────────────

  const handleBarEnter = useCallback((e: React.MouseEvent, task: GanttTask) => {
    setHoveredTaskId(task.id);
    setTooltipInfo({ task, x: e.clientX, y: e.clientY });
  }, []);
  const handleBarMove = useCallback((e: React.MouseEvent, task: GanttTask) => {
    setTooltipInfo({ task, x: e.clientX, y: e.clientY });
  }, []);
  const handleBarLeave = useCallback(() => {
    setHoveredTaskId(null);
    setTooltipInfo(null);
  }, []);

  // ─── Bar Geometry ─────────────────────────────────────────────────────

  // Per-row Y offset and height (supports individual rowHeight)
  const rowGeometry = useMemo(() => {
    const offsets: number[] = [];
    const heights: number[] = [];
    let y = 0;
    for (const ft of visibleTasks) {
      const h = ft.task.rowHeight ?? rowHeight;
      offsets.push(y);
      heights.push(h);
      y += h;
    }
    return { offsets, heights, totalH: y };
  }, [visibleTasks, rowHeight]);

  const totalHeight = rowGeometry.totalH;

  const getRowY = useCallback(
    (i: number) => rowGeometry.offsets[i] ?? 0,
    [rowGeometry]
  );
  const getRowH = useCallback(
    (i: number) => rowGeometry.heights[i] ?? rowHeight,
    [rowGeometry, rowHeight]
  );

  const getBarRect = useCallback(
    (task: GanttTask, rowIndex: number) => {
      const rh = getRowH(rowIndex);
      const bh = rh * barHeightRatio;
      const by = (rh - bh) / 2;
      const x = dateToX(task.start);
      const w = Math.max(dateToX(task.end) - x, 2);
      return { x, y: getRowY(rowIndex) + by, width: w, height: bh };
    },
    [dateToX, getRowY, getRowH, barHeightRatio]
  );

  const taskRowMap = useMemo(() => {
    const m = new Map<string, number>();
    visibleTasks.forEach((ft, i) => m.set(ft.task.id, i));
    return m;
  }, [visibleTasks]);

  // ─── Link Drag (Dependency Creation) ──────────────────────────────────

  const linkDragRef = useRef<{
    fromId: string;
    fromSide: "start" | "finish";
    startX: number;
    startY: number;
  } | null>(null);
  const [linkDragLine, setLinkDragLine] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null>(null);

  const getSvgCoords = useCallback((ev: MouseEvent | React.MouseEvent) => {
    const scroll = chartScrollRef.current;
    if (!scroll) return null;
    const r = scroll.getBoundingClientRect();
    return {
      x: ev.clientX - r.left + scroll.scrollLeft,
      y: ev.clientY - r.top + scroll.scrollTop,
    };
  }, []);

  const findNearestConnector = useCallback(
    (
      mx: number,
      my: number,
      excludeId: string
    ): {
      taskId: string;
      side: "start" | "finish";
      cx: number;
      cy: number;
    } | null => {
      let best: {
        taskId: string;
        side: "start" | "finish";
        cx: number;
        cy: number;
        dist: number;
      } | null = null;
      const snapDist = 30;
      for (let ri = 0; ri < visibleTasks.length; ri++) {
        const ft = visibleTasks[ri];
        if (ft.task.id === excludeId || ft.task.type === "summary") continue;
        const bx = dateToX(ft.task.start);
        const bw = Math.max(dateToX(ft.task.end) - bx, 2);
        const cy = getRowY(ri) + getRowH(ri) / 2;
        const isMilestone = ft.task.type === "milestone";
        const ms = rowHeight * 0.35;
        const connectors = isMilestone
          ? [
              { side: "start" as const, cx: bx - ms },
              { side: "finish" as const, cx: bx + ms },
            ]
          : [
              { side: "start" as const, cx: bx },
              { side: "finish" as const, cx: bx + bw },
            ];
        for (const s of connectors) {
          const d = Math.hypot(mx - s.cx, my - cy);
          if (d < snapDist && (!best || d < best.dist)) {
            best = {
              taskId: ft.task.id,
              side: s.side,
              cx: s.cx,
              cy,
              dist: d,
            };
          }
        }
      }
      return best
        ? { taskId: best.taskId, side: best.side, cx: best.cx, cy: best.cy }
        : null;
    },
    [visibleTasks, getRowY, getRowH, dateToX]
  );

  const handleConnectorDown = useCallback(
    (e: React.MouseEvent, taskId: string, side: "start" | "finish") => {
      e.stopPropagation();
      e.preventDefault();
      const coords = getSvgCoords(e);
      if (!coords) return;
      linkDragRef.current = {
        fromId: taskId,
        fromSide: side,
        startX: coords.x,
        startY: coords.y,
      };

      const onMove = (ev: MouseEvent) => {
        if (!linkDragRef.current) return;
        const c = getSvgCoords(ev);
        if (!c) return;
        const snap = findNearestConnector(c.x, c.y, linkDragRef.current.fromId);
        setLinkDragLine({
          x1: linkDragRef.current.startX,
          y1: linkDragRef.current.startY,
          x2: snap ? snap.cx : c.x,
          y2: snap ? snap.cy : c.y,
        });
      };

      const onUp = (ev: MouseEvent) => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        setLinkDragLine(null);
        if (!linkDragRef.current) return;
        const from = linkDragRef.current;
        linkDragRef.current = null;

        const c = getSvgCoords(ev);
        if (!c) return;
        const snap = findNearestConnector(c.x, c.y, from.fromId);
        if (!snap) return;

        const fromLetter = from.fromSide === "finish" ? "F" : "S";
        const toLetter = snap.side === "start" ? "S" : "F";
        const depType = `${fromLetter}${toLetter}` as "FS" | "FF" | "SS" | "SF";

        if (!isControlled) {
          setInternalTasks(prev =>
            prev.map(tk => {
              if (tk.id !== snap.taskId) return tk;
              const filtered = (tk.dependencies ?? []).filter(
                d => (typeof d === "string" ? d : d.taskId) !== from.fromId
              );
              return {
                ...tk,
                dependencies: [
                  ...filtered,
                  { taskId: from.fromId, type: depType },
                ],
              };
            })
          );
        }
        onDependencyCreate?.(from.fromId, snap.taskId, depType);
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [isControlled, onDependencyCreate, getSvgCoords, findNearestConnector]
  );

  // ─── Keyboard ─────────────────────────────────────────────────────────

  const [focusedRow, setFocusedRow] = useState(-1);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (!isControlled && editable) undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        if (!isControlled && editable) redo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault();
        resetZoom();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedRow(r => Math.min(r + 1, visibleTasks.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedRow(r => Math.max(r - 1, 0));
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const ft = visibleTasks[focusedRow];
        if (!ft) return;
        if (ft.hasChildren) toggleCollapse(ft.task.id);
        else onTaskClick?.(ft.task);
      }
    },
    [
      visibleTasks,
      focusedRow,
      toggleCollapse,
      onTaskClick,
      isControlled,
      undo,
      redo,
    ]
  );

  // ─── Row Drag & Drop (Reorder) ──────────────────────────────────────

  const [rowDragId, setRowDragId] = useState<string | null>(null);
  const [rowDropIndex, setRowDropIndex] = useState<number | null>(null);
  const [rowDropPosition, setRowDropPosition] = useState<
    "above" | "below" | "child"
  >("below");

  const handleRowDragStart = useCallback(
    (e: React.DragEvent, taskId: string) => {
      if (!editable) return;
      e.dataTransfer.effectAllowed = "move";
      // If dragging a selected task, drag all selected; otherwise just this one
      if (selectedIds.has(taskId) && selectedIds.size > 1) {
        e.dataTransfer.setData("text/plain", Array.from(selectedIds).join(","));
        setRowDragId(taskId);
      } else {
        e.dataTransfer.setData("text/plain", taskId);
        setRowDragId(taskId);
      }
    },
    [editable, selectedIds]
  );

  const handleRowDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const h = rect.height;
    if (y < h * 0.25) setRowDropPosition("above");
    else if (y > h * 0.75) setRowDropPosition("below");
    else setRowDropPosition("child");
    setRowDropIndex(index);
  }, []);

  const handleRowDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!rowDragId || rowDropIndex === null || !editable) {
        setRowDragId(null);
        setRowDropIndex(null);
        return;
      }
      const dropTask = visibleTasks[rowDropIndex]?.task;
      if (!dropTask) {
        setRowDragId(null);
        setRowDropIndex(null);
        return;
      }

      const dragIds =
        selectedIds.has(rowDragId) && selectedIds.size > 1
          ? Array.from(selectedIds)
          : [rowDragId];

      if (dragIds.includes(dropTask.id)) {
        setRowDragId(null);
        setRowDropIndex(null);
        return;
      }

      if (!isControlled) {
        setInternalTasks(prev => {
          const dragged = prev.filter(t2 => dragIds.includes(t2.id));
          const without = prev.filter(t2 => !dragIds.includes(t2.id));

          let newParentId: string | undefined;
          if (rowDropPosition === "child") {
            newParentId =
              dropTask.type === "summary" ? dropTask.id : dropTask.parentId;
          } else {
            newParentId = dropTask.parentId;
          }

          const dropIdx = without.findIndex(t2 => t2.id === dropTask.id);
          const insertIdx = rowDropPosition === "above" ? dropIdx : dropIdx + 1;
          const updated = dragged.map(t2 => ({
            ...t2,
            parentId: newParentId,
          }));
          without.splice(insertIdx, 0, ...updated);
          return without;
        });
      }
      setRowDragId(null);
      setRowDropIndex(null);
    },
    [
      rowDragId,
      rowDropIndex,
      rowDropPosition,
      editable,
      visibleTasks,
      isControlled,
      selectedIds,
    ]
  );

  // ─── Row Actions ────────────────────────────────────────────────────

  const handleTableRowClick = useCallback(
    (task: GanttTask, hasChildren: boolean, e?: React.MouseEvent) => {
      if (e && (e.ctrlKey || e.metaKey)) {
        setSelectedIds(prev => {
          const next = new Set(prev);
          if (next.has(task.id)) next.delete(task.id);
          else next.add(task.id);
          return next;
        });
      } else {
        setSelectedIds(new Set([task.id]));
      }
      onTaskClick?.(task);
      if (hasChildren) toggleCollapse(task.id);
    },
    [onTaskClick, toggleCollapse]
  );

  const handleBarClick = useCallback(
    (task: GanttTask, e?: React.MouseEvent) => {
      if (e && (e.ctrlKey || e.metaKey)) {
        setSelectedIds(prev => {
          const next = new Set(prev);
          if (next.has(task.id)) next.delete(task.id);
          else next.add(task.id);
          return next;
        });
      } else {
        setSelectedIds(new Set([task.id]));
      }
      onTaskClick?.(task);
    },
    [onTaskClick]
  );

  // ─── Context Menu ─────────────────────────────────────────────────────

  const ctxTaskRef = useRef<{ task: GanttTask; hasChildren: boolean } | null>(
    null
  );
  const [ctxPos, setCtxPos] = useState<{ x: number; y: number } | null>(null);

  const handleRowContext = useCallback(
    (e: React.MouseEvent<Element>, task: GanttTask, hasChildren: boolean) => {
      if (!showRowContextMenu) return;
      e.preventDefault();
      ctxTaskRef.current = { task, hasChildren };
      setCtxPos({ x: e.clientX, y: e.clientY });
    },
    [showRowContextMenu]
  );

  const buildCtxItems = useCallback((): MenuItem[] => {
    const ctx = ctxTaskRef.current;
    if (!ctx) return [];
    const { task, hasChildren } = ctx;
    const isCollapsed = collapsedIds.has(task.id);
    const items: MenuItem[] = [];

    items.push({
      key: "edit",
      label: t?.edit ?? "Edit",
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d={PENCIL_PATH} fill="currentColor" />
        </svg>
      ),
      command: () => {
        openEditDialog(task);
        setCtxPos(null);
      },
    });

    if (hasChildren) {
      items.push({
        key: "toggle",
        label: isCollapsed
          ? (t?.expand ?? "Expand")
          : (t?.collapse ?? "Collapse"),
        icon: (
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            style={{ transform: isCollapsed ? undefined : "rotate(90deg)" }}
          >
            <path d={CHEVRON_RIGHT_PATH} fill="currentColor" />
          </svg>
        ),
        command: () => {
          toggleCollapse(task.id);
          setCtxPos(null);
        },
      });
    }

    if (isZoomed) {
      items.push({
        key: "resetZoom",
        label: t?.resetZoom ?? "Reset Zoom",
        command: () => {
          resetZoom();
          setCtxPos(null);
        },
      });
    }

    items.push({ key: "sep", separator: true });

    items.push({
      key: "add",
      label: t?.addTask ?? "Add Task",
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path
            d="M12 5v14M5 12h14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
      command: () => {
        const newId = `new-${Date.now()}`;
        // Inherit parent: if clicked on summary, add as child. If clicked on child, add as sibling.
        const parentId = task.type === "summary" ? task.id : task.parentId;
        const newTask: GanttTask = {
          id: newId,
          title: t?.newTask ?? "New Task",
          start: task.start,
          end: task.end,
          progress: 0,
          parentId,
        };
        if (!isControlled) setInternalTasks(prev => [...prev, newTask]);
        onTaskCreate?.(newTask);
        setCtxPos(null);
        setTimeout(() => openEditDialog(newTask), 50);
      },
    });

    items.push({
      key: "delete",
      label: t?.delete ?? "Delete",
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d={TRASH_PATH} fill="currentColor" />
        </svg>
      ),
      command: () => {
        openDeleteConfirm(task);
        setCtxPos(null);
      },
      className: "k-gantt__ctx-delete",
    });

    if (contextMenuRender) return contextMenuRender(task, items);
    return items;
  }, [
    t,
    collapsedIds,
    openEditDialog,
    openDeleteConfirm,
    toggleCollapse,
    contextMenuRender,
    isControlled,
    onTaskCreate,
    isZoomed,
    resetZoom,
  ]);

  // ─── Imperative Handle ────────────────────────────────────────────────

  const scrollToTodayFn = useCallback(() => {
    if (!chartScrollRef.current) return;
    const tx = dateToX(formatDate(today));
    chartScrollRef.current.scrollLeft = Math.max(
      0,
      tx - chartScrollRef.current.clientWidth / 2
    );
  }, [dateToX, today]);

  const scrollToTaskFn = useCallback(
    (taskId: string) => {
      const rowIdx = taskRowMap.get(taskId);
      if (rowIdx === undefined) return;
      const task = visibleTasks[rowIdx].task;
      if (chartScrollRef.current) {
        const tx = dateToX(task.start);
        chartScrollRef.current.scrollLeft = Math.max(
          0,
          tx - chartScrollRef.current.clientWidth / 3
        );
      }
      if (tableScrollRef.current) {
        const top = rowIdx * rowHeight;
        tableScrollRef.current.scrollTop = Math.max(
          0,
          top - tableScrollRef.current.clientHeight / 3
        );
      }
    },
    [taskRowMap, visibleTasks, dateToX, rowHeight]
  );

  const getVisibleDateRangeFn = useCallback((): {
    start: string;
    end: string;
  } | null => {
    if (!chartScrollRef.current) return null;
    const sl = chartScrollRef.current.scrollLeft;
    const sw = chartScrollRef.current.clientWidth;
    return {
      start: formatDate(xToDate(sl)),
      end: formatDate(xToDate(sl + sw)),
    };
  }, [xToDate]);

  useImperativeHandle(
    ref,
    () => ({
      scrollToToday: scrollToTodayFn,
      scrollToTask: scrollToTaskFn,
      expandAll,
      collapseAll,
      getVisibleDateRange: getVisibleDateRangeFn,
      undo,
      redo,
      export: (format: GanttExportFormat) => handleExportRef.current(format),
      setReadOnly: (v: boolean) => setReadOnlyState(v),
      setCriticalPath: (v: boolean) => setCriticalPathEnabled(v),
      setAutoSchedule: (v: boolean) => setAutoScheduleEnabled(v),
      getTasks: () => tasksRef.current,
      resetZoom,
      setZoom: (level: number) =>
        setZoomLevel(Math.min(5, Math.max(0.2, level))),
    }),
    [
      scrollToTodayFn,
      scrollToTaskFn,
      expandAll,
      collapseAll,
      getVisibleDateRangeFn,
      undo,
      redo,
    ]
  );

  // ─── Export ────────────────────────────────────────────────────────────

  const headerH = 40;

  const addHeaderToSvg = useCallback(
    (clone: SVGSVGElement) => {
      const origH = Number(clone.getAttribute("height") || 0);
      const origW = Number(clone.getAttribute("width") || 0);
      clone.setAttribute("height", String(origH + headerH));
      clone.setAttribute(
        "viewBox",
        `0 ${-headerH} ${origW} ${origH + headerH}`
      );
      // Upper row: groups (months)
      const gUpper = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );
      let gx = 0;
      for (const g of groups) {
        const w = g.span * cw;
        const txt = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        txt.setAttribute("x", String(gx + w / 2));
        txt.setAttribute("y", String(-headerH + 14));
        txt.setAttribute("text-anchor", "middle");
        txt.setAttribute("font-size", "11");
        txt.setAttribute("fill", "#666");
        txt.setAttribute("font-family", "sans-serif");
        txt.textContent = g.label;
        gUpper.appendChild(txt);
        gx += w;
      }
      clone.appendChild(gUpper);
      // Lower row: cells (days/weeks)
      const gLower = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );
      cells.forEach((c, ci) => {
        if (c.isWeekend) {
          const r = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect"
          );
          r.setAttribute("x", String(ci * cw));
          r.setAttribute("y", String(-headerH / 2));
          r.setAttribute("width", String(cw));
          r.setAttribute("height", String(headerH / 2));
          r.setAttribute("fill", "rgba(0,0,0,0.04)");
          gLower.appendChild(r);
        }
        const txt = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        txt.setAttribute("x", String(ci * cw + cw / 2));
        txt.setAttribute("y", String(-6));
        txt.setAttribute("text-anchor", "middle");
        txt.setAttribute("font-size", "9");
        txt.setAttribute("fill", c.isToday ? "#3949ab" : "#999");
        txt.setAttribute("font-family", "sans-serif");
        txt.textContent = c.label;
        gLower.appendChild(txt);
      });
      // Separator line
      const sep = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      sep.setAttribute("x1", "0");
      sep.setAttribute("y1", String(-headerH / 2));
      sep.setAttribute("x2", String(origW));
      sep.setAttribute("y2", String(-headerH / 2));
      sep.setAttribute("stroke", "#ddd");
      sep.setAttribute("stroke-width", "1");
      gLower.appendChild(sep);
      clone.appendChild(gLower);
    },
    [groups, cells, cw]
  );

  const handleExportRef = useRef<(format: GanttExportFormat) => void>(() => {});

  const handleExport = useCallback(
    (format: GanttExportFormat) => {
      if (format === "csv") {
        const header =
          "ID;Title;Start;End;Progress;Type;Severity;ParentId;Dependencies;RequiredBy";
        const rows = tasks.map(tk => {
          const deps = (tk.dependencies ?? [])
            .map(d =>
              typeof d === "string"
                ? `${d}(FS)`
                : `${d.taskId}(${d.type ?? "FS"})`
            )
            .join(",");
          const reqBy = tasks
            .filter(t2 =>
              (t2.dependencies ?? []).some(
                d => (typeof d === "string" ? d : d.taskId) === tk.id
              )
            )
            .map(t2 => t2.id)
            .join(",");
          return `${tk.id};${tk.title};${tk.start};${tk.end};${tk.progress ?? 0};${tk.type ?? "task"};${tk.severity ?? "primary"};${tk.parentId ?? ""};${deps};${reqBy}`;
        });
        const blob = new Blob([header + "\n" + rows.join("\n")], {
          type: "text/csv",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "gantt.csv";
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === "json") {
        const blob = new Blob([JSON.stringify(tasks, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "gantt.json";
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === "svg" || format === "png") {
        const svgEl = rootRef.current?.querySelector(
          "svg.k-gantt__chart-svg"
        ) as SVGSVGElement | null;
        if (!svgEl) return;
        const clone = svgEl.cloneNode(true) as SVGSVGElement;
        const svgStr = new XMLSerializer().serializeToString(clone);
        if (format === "svg") {
          const cloneForSvg = svgEl.cloneNode(true) as SVGSVGElement;
          cloneForSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
          const bgRect = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect"
          );
          bgRect.setAttribute("width", "100%");
          bgRect.setAttribute("height", "100%");
          bgRect.setAttribute("fill", "#ffffff");
          cloneForSvg.insertBefore(bgRect, cloneForSvg.firstChild);
          // Remove interactive elements
          cloneForSvg
            .querySelectorAll(
              ".k-gantt__row-bg, .k-gantt__resize-handle, .k-gantt__link-connector, .k-gantt__dep-delete, .k-gantt__progress-handle, .k-gantt__dependency-hit"
            )
            .forEach(el => el.remove());
          addHeaderToSvg(cloneForSvg);
          const styles: string[] = [];
          for (const sheet of document.styleSheets) {
            try {
              for (const rule of sheet.cssRules) {
                if (
                  rule instanceof CSSStyleRule &&
                  rule.selectorText?.includes("k-gantt") &&
                  !rule.selectorText.includes(":hover") &&
                  !rule.selectorText.includes(":focus") &&
                  !rule.selectorText.includes(":active")
                )
                  styles.push(rule.cssText);
              }
            } catch {
              /* */
            }
          }
          const rootSt = getComputedStyle(document.documentElement);
          const vars: string[] = [];
          for (const p of [
            "--kreati-severity-primary",
            "--kreati-severity-secondary",
            "--kreati-severity-success",
            "--kreati-severity-info",
            "--kreati-severity-warning",
            "--kreati-severity-help",
            "--kreati-severity-danger",
            "--kreati-severity-accent",
            "--kreati-gray-100",
            "--kreati-gray-200",
            "--kreati-gray-400",
            "--kreati-gray-600",
            "--kreati-text-body",
            "--kreati-text-muted",
            "--kreati-text-on-primary",
            "--kreati-black-alpha-5",
            "--kreati-white",
          ]) {
            const v = rootSt.getPropertyValue(p);
            if (v) vars.push(`${p}:${v}`);
          }
          const stEl = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "style"
          );
          stEl.textContent = `:root{${vars.join(";")}} ${styles.join("\n")}`;
          cloneForSvg.insertBefore(stEl, cloneForSvg.firstChild);
          const blob = new Blob(
            [new XMLSerializer().serializeToString(cloneForSvg)],
            { type: "image/svg+xml" }
          );
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "gantt.svg";
          a.click();
          URL.revokeObjectURL(url);
        } else {
          // PNG: inject computed styles as inline + white background rect
          const cloneForPng = svgEl.cloneNode(true) as SVGSVGElement;
          cloneForPng.setAttribute("xmlns", "http://www.w3.org/2000/svg");
          // Add white background
          const bgRect = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect"
          );
          bgRect.setAttribute("width", "100%");
          bgRect.setAttribute("height", "100%");
          bgRect.setAttribute("fill", "#ffffff");
          cloneForPng.insertBefore(bgRect, cloneForPng.firstChild);
          cloneForPng
            .querySelectorAll(
              ".k-gantt__row-bg, .k-gantt__resize-handle, .k-gantt__link-connector, .k-gantt__dep-delete, .k-gantt__progress-handle, .k-gantt__dependency-hit"
            )
            .forEach(el => el.remove());
          addHeaderToSvg(cloneForPng);
          // Fix background to cover expanded viewBox
          bgRect.setAttribute("x", "0");
          bgRect.setAttribute("y", String(-headerH));
          bgRect.setAttribute("width", String(svgEl.getAttribute("width")));
          bgRect.setAttribute(
            "height",
            String(Number(svgEl.getAttribute("height") || 0) + headerH)
          );
          // Collect all CSS rules that match gantt classes
          const styles: string[] = [];
          for (const sheet of document.styleSheets) {
            try {
              for (const rule of sheet.cssRules) {
                if (
                  rule instanceof CSSStyleRule &&
                  rule.selectorText?.includes("k-gantt") &&
                  !rule.selectorText.includes(":hover") &&
                  !rule.selectorText.includes(":focus") &&
                  !rule.selectorText.includes(":active")
                ) {
                  styles.push(rule.cssText);
                }
              }
            } catch {
              /* cross-origin */
            }
          }
          // Also collect CSS variable values from root
          const rootStyles = getComputedStyle(document.documentElement);
          const varDefs: string[] = [];
          for (const prop of [
            "--kreati-severity-primary",
            "--kreati-severity-secondary",
            "--kreati-severity-success",
            "--kreati-severity-info",
            "--kreati-severity-warning",
            "--kreati-severity-help",
            "--kreati-severity-danger",
            "--kreati-severity-accent",
            "--kreati-gray-100",
            "--kreati-gray-200",
            "--kreati-gray-400",
            "--kreati-gray-600",
            "--kreati-text-body",
            "--kreati-text-muted",
            "--kreati-text-on-primary",
            "--kreati-black-alpha-5",
            "--kreati-white",
          ]) {
            const val = rootStyles.getPropertyValue(prop);
            if (val) varDefs.push(`${prop}:${val}`);
          }
          const styleEl = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "style"
          );
          styleEl.textContent = `:root{${varDefs.join(";")}} ${styles.join("\n")}`;
          cloneForPng.insertBefore(styleEl, cloneForPng.firstChild);

          const pngStr = new XMLSerializer().serializeToString(cloneForPng);
          const canvas = document.createElement("canvas");
          const img = new Image();
          img.onload = () => {
            canvas.width = img.width * 2;
            canvas.height = img.height * 2;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            ctx.scale(2, 2);
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(blob => {
              if (!blob) return;
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "gantt.png";
              a.click();
              URL.revokeObjectURL(url);
            });
          };
          img.src =
            "data:image/svg+xml;base64," +
            btoa(unescape(encodeURIComponent(pngStr)));
        }
      }
    },
    [tasks]
  );

  handleExportRef.current = handleExport;

  const exportItems = useMemo(
    () =>
      exportFormats.map(f => ({
        key: f,
        label: f.toUpperCase(),
        command: () => handleExport(f),
      })),
    [exportFormats, handleExport]
  );

  // ─── Render: Table Header ─────────────────────────────────────────────

  const tableHeader = (
    <div className="k-gantt__table-header">
      <div
        className="k-gantt__table-header-cols"
        style={
          { "--k-gantt-header-h": `${headerHeight}px` } as React.CSSProperties
        }
      >
        {columns.map(col => (
          <div
            key={col.field}
            className={`k-gantt__table-header-cell${!col.width ? " k-gantt__table-header-cell--flex" : ""}`}
            style={
              col.width
                ? ({
                    "--k-gantt-col-w": `${col.width}px`,
                  } as React.CSSProperties)
                : undefined
            }
          >
            {col.header}
          </div>
        ))}
      </div>
      {showMilestoneFlags && <div className="k-gantt__table-header-flags" />}
    </div>
  );

  // ─── Render: Table Rows ───────────────────────────────────────────────

  const tableRows = visibleTasks.map((ft, i) => {
    const indent = ft.depth * 20;
    const isCollapsed = collapsedIds.has(ft.task.id);
    return (
      <div
        key={ft.task.id}
        className={[
          "k-gantt__table-row",
          hoveredTaskId === ft.task.id ? "k-gantt__table-row--hover" : "",
          selectedIds.has(ft.task.id) || focusedRow === i
            ? "k-gantt__table-row--selected"
            : "",
          rowDragId === ft.task.id ? "k-gantt__table-row--dragging" : "",
          rowDropIndex === i
            ? `k-gantt__table-row--drop-${rowDropPosition}`
            : "",
          ft.task.className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={
          {
            "--k-gantt-row-h": `${ft.task.rowHeight ?? rowHeight}px`,
          } as React.CSSProperties
        }
        draggable={editable}
        onDragStart={e => handleRowDragStart(e, ft.task.id)}
        onDragOver={e => handleRowDragOver(e, i)}
        onDrop={handleRowDrop}
        onDragEnd={() => {
          setRowDragId(null);
          setRowDropIndex(null);
        }}
        onMouseEnter={() => setHoveredTaskId(ft.task.id)}
        onMouseLeave={() => setHoveredTaskId(null)}
        onClick={e => handleTableRowClick(ft.task, ft.hasChildren, e)}
        onDoubleClick={() => {
          editable && openEditDialog(ft.task);
          onTaskDoubleClick?.(ft.task);
        }}
        onContextMenu={e =>
          editable && handleRowContext(e, ft.task, ft.hasChildren)
        }
        role="row"
        aria-rowindex={i + 1}
        aria-selected={selectedIds.has(ft.task.id)}
      >
        {columns.map((col, ci) => (
          <div
            key={col.field}
            className={`k-gantt__table-cell${!col.width ? " k-gantt__table-cell--flex" : ""}`}
            style={
              col.width
                ? ({
                    "--k-gantt-col-w": `${col.width}px`,
                  } as React.CSSProperties)
                : undefined
            }
            role="gridcell"
          >
            {ci === 0 && (
              <>
                <span
                  className="k-gantt__task-indent"
                  style={
                    {
                      "--k-gantt-indent": `${indent}px`,
                    } as React.CSSProperties
                  }
                />
                {ft.hasChildren ? (
                  <button
                    className={[
                      "k-gantt__expand-btn",
                      !isCollapsed ? "k-gantt__expand-btn--expanded" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={e => {
                      e.stopPropagation();
                      toggleCollapse(ft.task.id);
                    }}
                    aria-label={
                      isCollapsed
                        ? (locale.gantt?.expand ?? "Expand")
                        : (locale.gantt?.collapse ?? "Collapse")
                    }
                    aria-expanded={!isCollapsed}
                  >
                    <svg viewBox="0 0 24 24">
                      <path d={CHEVRON_RIGHT_PATH} fill="currentColor" />
                    </svg>
                  </button>
                ) : (
                  <span className="k-gantt__expand-spacer" />
                )}
              </>
            )}
            {col.template ? (
              col.template(ft.task)
            ) : (
              <span className="k-gantt__cell-text">
                {((ft.task as unknown as Record<string, unknown>)[
                  col.field
                ] as React.ReactNode) ?? ""}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  });

  // ─── Render: Chart Header ─────────────────────────────────────────────

  const chartHeader = (
    <div
      className="k-gantt__chart-header"
      ref={chartHeaderRef}
      style={
        { "--k-gantt-header-h": `${headerHeight}px` } as React.CSSProperties
      }
    >
      <div className="k-gantt__chart-header-row k-gantt__chart-header-row--upper">
        {groups.map((g, i) => (
          <div
            key={i}
            className="k-gantt__chart-header-cell"
            style={
              {
                "--k-gantt-cell-w": `${g.span * cw}px`,
              } as React.CSSProperties
            }
          >
            {g.label}
          </div>
        ))}
      </div>
      <div className="k-gantt__chart-header-row">
        {cells.map((c, i) => (
          <div
            key={i}
            className={[
              "k-gantt__chart-header-cell",
              "k-gantt__chart-header-cell--lower",
              c.isWeekend ? "k-gantt__chart-header-cell--weekend" : "",
              c.isToday ? "k-gantt__chart-header-cell--today" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ "--k-gantt-cell-w": `${cw}px` } as React.CSSProperties}
          >
            {c.label}
          </div>
        ))}
      </div>
      {showMilestoneFlags && (
        <div className="k-gantt__chart-header-row k-gantt__chart-header-row--flags">
          <div className="k-gantt__flags-row" style={{ width: totalWidth }}>
            {visibleTasks.map(ft => {
              if (ft.task.type !== "milestone") return null;
              const fx = dateToX(ft.task.start);
              const severity = ft.task.severity ?? "primary";
              return (
                <div
                  key={`flag-${ft.task.id}`}
                  className={`k-gantt__flag-tag k-gantt__flag-tag--${severity}`}
                  style={{ left: fx }}
                >
                  {ft.task.title}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  // ─── Render: SVG ──────────────────────────────────────────────────────

  const todayX = showTodayMarker ? dateToX(formatDate(today)) : -1;

  const svgChart = (
    <svg
      className="k-gantt__chart-svg"
      width={totalWidth}
      height={totalHeight}
      role="figure"
      aria-label={locale.gantt?.chartLabel ?? "Gantt chart"}
    >
      {/* Weekend backgrounds (day view) */}
      {viewMode === "day" &&
        cells.map(
          (c, i) =>
            c.isWeekend && (
              <rect
                key={`we-${i}`}
                className="k-gantt__grid-line--weekend"
                x={i * cw}
                y={0}
                width={cw}
                height={totalHeight}
              />
            )
        )}

      {/* Vertical grid lines */}
      {cells.map((_, i) => (
        <line
          key={`vl-${i}`}
          className="k-gantt__grid-line"
          x1={i * cw}
          y1={0}
          x2={i * cw}
          y2={totalHeight}
        />
      ))}

      {/* Horizontal grid lines */}
      {visibleTasks.map((_, i) => (
        <line
          key={`hl-${i}`}
          className="k-gantt__grid-line"
          x1={0}
          y1={getRowY(i) + getRowH(i)}
          x2={totalWidth}
          y2={getRowY(i) + getRowH(i)}
        />
      ))}

      {/* Row hover rects */}
      {visibleTasks.map((ft, i) => (
        <rect
          key={`rb-${ft.task.id}`}
          className="k-gantt__row-bg"
          x={0}
          y={getRowY(i)}
          width={totalWidth}
          height={getRowH(i)}
          onMouseEnter={() => setHoveredTaskId(ft.task.id)}
          onMouseLeave={() => setHoveredTaskId(null)}
          onClick={e => handleBarClick(ft.task, e)}
          onDoubleClick={() => {
            editable && openEditDialog(ft.task);
            onTaskDoubleClick?.(ft.task);
          }}
          onContextMenu={e =>
            editable && handleRowContext(e, ft.task, ft.hasChildren)
          }
        />
      ))}

      {/* Dependency arrows */}
      {deps.map((dep, i) => {
        const fromRow = taskRowMap.get(dep.fromId);
        const toRow = taskRowMap.get(dep.toId);
        if (fromRow === undefined || toRow === undefined) return null;
        const fromRect = getBarRect(visibleTasks[fromRow].task, fromRow);
        const toRect = getBarRect(visibleTasks[toRow].task, toRow);
        const {
          path: depPath,
          arrowX,
          arrowY,
          arrowDir,
        } = dependencyPath(fromRect, toRect, dep.type);
        return (
          <g key={`dep-${i}`} className="k-gantt__dep-group">
            <path className="k-gantt__dependency" d={depPath} />
            <path className="k-gantt__dependency-hit" d={depPath} />
            <polygon
              className="k-gantt__dependency-arrow"
              points={arrowHead(arrowX, arrowY, arrowDir)}
            />
            {editable && (
              <g
                className="k-gantt__dep-delete"
                onClick={e => {
                  e.stopPropagation();
                  if (!isControlled) {
                    setInternalTasks(prev =>
                      prev.map(tk => {
                        if (tk.id !== dep.toId) return tk;
                        return {
                          ...tk,
                          dependencies: (tk.dependencies ?? []).filter(
                            d =>
                              (typeof d === "string" ? d : d.taskId) !==
                              dep.fromId
                          ),
                        };
                      })
                    );
                  }
                  onDependencyDelete?.(dep.fromId, dep.toId);
                }}
                ref={g => {
                  if (!g) return;
                  const p = g.parentElement?.querySelector<SVGPathElement>(
                    ".k-gantt__dependency"
                  );
                  if (!p) return;
                  try {
                    const len = p.getTotalLength();
                    const pt = p.getPointAtLength(len / 2);
                    const circle = g.querySelector("circle");
                    const lines = g.querySelectorAll("line");
                    if (circle) {
                      circle.setAttribute("cx", String(pt.x));
                      circle.setAttribute("cy", String(pt.y));
                    }
                    if (lines[0]) {
                      lines[0].setAttribute("x1", String(pt.x - 3));
                      lines[0].setAttribute("y1", String(pt.y - 3));
                      lines[0].setAttribute("x2", String(pt.x + 3));
                      lines[0].setAttribute("y2", String(pt.y + 3));
                    }
                    if (lines[1]) {
                      lines[1].setAttribute("x1", String(pt.x + 3));
                      lines[1].setAttribute("y1", String(pt.y - 3));
                      lines[1].setAttribute("x2", String(pt.x - 3));
                      lines[1].setAttribute("y2", String(pt.y + 3));
                    }
                  } catch {
                    /* ignore */
                  }
                }}
              >
                <circle
                  cx={0}
                  cy={0}
                  r={8}
                  className="k-gantt__dep-delete-bg"
                />
                <line
                  x1={-3}
                  y1={-3}
                  x2={3}
                  y2={3}
                  className="k-gantt__dep-delete-x"
                />
                <line
                  x1={3}
                  y1={-3}
                  x2={-3}
                  y2={3}
                  className="k-gantt__dep-delete-x"
                />
              </g>
            )}
          </g>
        );
      })}

      {/* Task bars */}
      {visibleTasks.map((ft, i) => {
        const task = ft.task;
        const severity = task.severity ?? "primary";

        // Milestone
        if (task.type === "milestone") {
          const cx = dateToX(task.start);
          const rh = getRowH(i);
          const cy = getRowY(i) + rh / 2;
          const ms = rh * 0.35;
          return (
            <g
              key={task.id}
              className="k-gantt__bar-group"
              tabIndex={0}
              role="listitem"
              aria-label={`${task.title} — ${locale.gantt?.milestone ?? "Milestone"}`}
              onMouseEnter={e => handleBarEnter(e, task)}
              onMouseMove={e => handleBarMove(e, task)}
              onMouseLeave={handleBarLeave}
              onClick={e => handleBarClick(task, e)}
              onDoubleClick={() => {
                editable && openEditDialog(task);
                onTaskDoubleClick?.(task);
              }}
              onContextMenu={e => editable && handleRowContext(e, task, false)}
              onMouseDown={e => {
                if (draggable && editable)
                  handleBarMouseDown(e, task.id, "move");
              }}
              style={{ cursor: draggable ? "grab" : undefined }}
            >
              <polygon
                className={`k-gantt__milestone k-gantt__milestone--${severity}`}
                points={`${cx},${cy - ms} ${cx + ms},${cy} ${cx},${cy + ms} ${cx - ms},${cy}`}
              />
              {editable && (
                <>
                  <circle
                    className="k-gantt__link-connector"
                    cx={cx - ms}
                    cy={cy}
                    r={5}
                    onMouseDown={e => handleConnectorDown(e, task.id, "start")}
                  />
                  <circle
                    className="k-gantt__link-connector"
                    cx={cx + ms}
                    cy={cy}
                    r={5}
                    onMouseDown={e => handleConnectorDown(e, task.id, "finish")}
                  />
                </>
              )}
            </g>
          );
        }

        const rect = getBarRect(task, i);
        const progress = Math.min(100, Math.max(0, task.progress ?? 0));
        const progressWidth = (rect.width * progress) / 100;

        // Summary
        if (task.type === "summary") {
          const cap = 10;
          return (
            <g
              key={task.id}
              className="k-gantt__bar-group"
              tabIndex={0}
              role="listitem"
              aria-label={`${task.title} — ${locale.gantt?.summary ?? "Summary"}`}
              onMouseEnter={e => handleBarEnter(e, task)}
              onMouseMove={e => handleBarMove(e, task)}
              onMouseLeave={handleBarLeave}
              onClick={e => handleBarClick(task, e)}
              onContextMenu={e =>
                editable && handleRowContext(e, task, ft.hasChildren)
              }
              onMouseDown={e => {
                if (draggable && editable)
                  handleBarMouseDown(e, task.id, "move");
              }}
            >
              <rect
                className={`k-gantt__summary k-gantt__summary--${severity}`}
                x={rect.x}
                y={rect.y + rect.height * 0.15}
                width={rect.width}
                height={rect.height * 0.35}
              />
              <polygon
                className={`k-gantt__summary-end k-gantt__summary-end--${severity}`}
                points={`${rect.x},${rect.y + rect.height * 0.15} ${rect.x},${rect.y + rect.height * 0.85} ${rect.x + cap},${rect.y + rect.height * 0.15}`}
              />
              <polygon
                className={`k-gantt__summary-end k-gantt__summary-end--${severity}`}
                points={`${rect.x + rect.width},${rect.y + rect.height * 0.15} ${rect.x + rect.width},${rect.y + rect.height * 0.85} ${rect.x + rect.width - cap},${rect.y + rect.height * 0.15}`}
              />
              {resizable && editable && (
                <>
                  <rect
                    className="k-gantt__resize-handle"
                    x={rect.x}
                    y={rect.y}
                    width={6}
                    height={rect.height}
                    onMouseDown={e =>
                      handleBarMouseDown(e, task.id, "resize-left")
                    }
                  />
                  <rect
                    className="k-gantt__resize-handle"
                    x={rect.x + rect.width - 6}
                    y={rect.y}
                    width={6}
                    height={rect.height}
                    onMouseDown={e =>
                      handleBarMouseDown(e, task.id, "resize-right")
                    }
                  />
                </>
              )}
              {editable && (
                <>
                  <circle
                    className="k-gantt__link-connector"
                    cx={rect.x}
                    cy={rect.y + rect.height / 2}
                    r={5}
                    onMouseDown={e => handleConnectorDown(e, task.id, "start")}
                  />
                  <circle
                    className="k-gantt__link-connector"
                    cx={rect.x + rect.width}
                    cy={rect.y + rect.height / 2}
                    r={5}
                    onMouseDown={e => handleConnectorDown(e, task.id, "finish")}
                  />
                </>
              )}
            </g>
          );
        }

        // Custom bar template
        if (barTemplate) {
          return (
            <g
              key={task.id}
              className="k-gantt__bar-group"
              tabIndex={0}
              role="listitem"
              aria-label={task.title}
              onMouseEnter={e => handleBarEnter(e, task)}
              onMouseMove={e => handleBarMove(e, task)}
              onMouseLeave={handleBarLeave}
            >
              {barTemplate(task, rect.x, rect.width, rect.height)}
            </g>
          );
        }

        // Normal task bar
        return (
          <g
            key={task.id}
            className="k-gantt__bar-group"
            tabIndex={0}
            role="listitem"
            aria-label={`${task.title}: ${task.start} — ${task.end}, ${progress}%`}
            onMouseEnter={e => handleBarEnter(e, task)}
            onMouseMove={e => handleBarMove(e, task)}
            onMouseLeave={handleBarLeave}
            onClick={e => handleBarClick(task, e)}
            onDoubleClick={() => {
              editable && openEditDialog(task);
              onTaskDoubleClick?.(task);
            }}
            onContextMenu={e => editable && handleRowContext(e, task, false)}
            onMouseDown={e => {
              if (draggable && editable) handleBarMouseDown(e, task.id, "move");
            }}
          >
            {/* Baseline bar */}
            {baselineEnabled && task.baselineStart && task.baselineEnd && (
              <rect
                className="k-gantt__bar-baseline"
                x={dateToX(task.baselineStart)}
                y={rect.y + rect.height - 4}
                width={Math.max(
                  dateToX(task.baselineEnd) - dateToX(task.baselineStart),
                  2
                )}
                height={4}
              />
            )}
            {/* Critical path highlight */}
            {criticalPathEnabled && criticalPathIds.has(task.id) && (
              <rect
                className="k-gantt__bar-critical"
                x={rect.x - 2}
                y={rect.y - 2}
                width={rect.width + 4}
                height={rect.height + 4}
              />
            )}
            <rect
              className={`k-gantt__bar k-gantt__bar--${severity}`}
              x={rect.x}
              y={rect.y}
              width={rect.width}
              height={rect.height}
              style={task.style}
            />
            {progress > 0 && (
              <rect
                className={`k-gantt__bar-progress k-gantt__bar-progress--${severity}`}
                x={rect.x}
                y={rect.y}
                width={progressWidth}
                height={rect.height}
              />
            )}
            {progressWidth > 30 && barLabelPosition !== "inside" && (
              <text
                className="k-gantt__bar-progress-label"
                x={rect.x + progressWidth - 4}
                y={rect.y + rect.height / 2}
                textAnchor="end"
                dominantBaseline="central"
              >
                {progress}%
              </text>
            )}
            {barLabelTemplate &&
              rect.width > 30 &&
              (() => {
                const lbl = barLabelTemplate(task);
                const cx = rect.x + rect.width / 2;
                const cy = rect.y + rect.height / 2;
                switch (barLabelPosition) {
                  case "left":
                    return (
                      <text
                        className="k-gantt__bar-label"
                        x={rect.x - 6}
                        y={cy}
                        textAnchor="end"
                      >
                        {lbl}
                      </text>
                    );
                  case "inside": {
                    const p = task.progress ?? 0;
                    const insideText = p > 0 ? `${lbl} (${p}%)` : lbl;
                    return (
                      <text
                        className="k-gantt__bar-label k-gantt__bar-label--inside"
                        x={cx}
                        y={cy}
                        textAnchor="middle"
                      >
                        {insideText}
                      </text>
                    );
                  }
                  case "top":
                    return (
                      <text
                        className="k-gantt__bar-label"
                        x={cx}
                        y={rect.y - 8}
                        textAnchor="middle"
                      >
                        {lbl}
                      </text>
                    );
                  case "bottom":
                    return (
                      <text
                        className="k-gantt__bar-label"
                        x={cx}
                        y={rect.y + rect.height + 12}
                        textAnchor="middle"
                      >
                        {lbl}
                      </text>
                    );
                  default:
                    return (
                      <text
                        className="k-gantt__bar-label"
                        x={rect.x + rect.width + 6}
                        y={cy}
                        textAnchor="start"
                      >
                        {lbl}
                      </text>
                    );
                }
              })()}
            {resizable && editable && (
              <>
                <rect
                  className="k-gantt__resize-handle"
                  x={rect.x}
                  y={rect.y}
                  width={6}
                  height={rect.height}
                  onMouseDown={e =>
                    handleBarMouseDown(e, task.id, "resize-left")
                  }
                />
                <rect
                  className="k-gantt__resize-handle"
                  x={rect.x + rect.width - 6}
                  y={rect.y}
                  width={6}
                  height={rect.height}
                  onMouseDown={e =>
                    handleBarMouseDown(e, task.id, "resize-right")
                  }
                />
              </>
            )}
            {progressDraggable && editable && (
              <circle
                className="k-gantt__progress-handle"
                cx={rect.x + progressWidth}
                cy={rect.y + rect.height}
                r={4}
                onMouseDown={e => handleBarMouseDown(e, task.id, "progress")}
              />
            )}
            {/* Link connectors */}
            {editable && (
              <>
                <circle
                  className="k-gantt__link-connector"
                  cx={rect.x}
                  cy={rect.y + rect.height / 2}
                  r={5}
                  onMouseDown={e => handleConnectorDown(e, task.id, "start")}
                />
                <circle
                  className="k-gantt__link-connector"
                  cx={rect.x + rect.width}
                  cy={rect.y + rect.height / 2}
                  r={5}
                  onMouseDown={e => handleConnectorDown(e, task.id, "finish")}
                />
              </>
            )}
          </g>
        );
      })}

      {/* Link drag line */}
      {linkDragLine && (
        <g>
          <defs>
            <marker
              id="k-gantt-link-arrow"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon
                points="0,0 8,3 0,6"
                fill="var(--kreati-severity-primary)"
              />
            </marker>
          </defs>
          <line
            className="k-gantt__link-drag-line"
            x1={linkDragLine.x1}
            y1={linkDragLine.y1}
            x2={linkDragLine.x2}
            y2={linkDragLine.y2}
            markerEnd="url(#k-gantt-link-arrow)"
          />
        </g>
      )}

      {/* Today marker */}
      {showTodayMarker && todayX >= 0 && todayX <= totalWidth && (
        <g>
          <line
            className="k-gantt__today-line"
            x1={todayX}
            y1={0}
            x2={todayX}
            y2={totalHeight}
          />
          <text
            className="k-gantt__today-label"
            x={todayX - 4}
            y={12}
            textAnchor="end"
          >
            {locale.gantt?.today ?? "Today"}
          </text>
        </g>
      )}

      {/* Milestone flags — lines only (labels rendered in header) */}
      {showMilestoneFlags &&
        visibleTasks.map((ft, i) => {
          if (ft.task.type !== "milestone") return null;
          const fx = dateToX(ft.task.start);
          const fy = getRowY(i) + getRowH(i) / 2;
          const severity = ft.task.severity ?? "primary";
          return (
            <line
              key={`flag-${ft.task.id}`}
              className={`k-gantt__flag-line k-gantt__flag-line--${severity}`}
              x1={fx}
              y1={0}
              x2={fx}
              y2={fy}
            />
          );
        })}
    </svg>
  );

  // ─── Render: Tooltip ──────────────────────────────────────────────────

  const tooltipPortal =
    tooltipInfo &&
    createPortal(
      <div
        className="k-gantt__tooltip"
        style={{ left: tooltipInfo.x + 12, top: tooltipInfo.y + 12 }}
      >
        {tooltipTemplate ? (
          tooltipTemplate(tooltipInfo.task)
        ) : (
          <>
            <div className="k-gantt__tooltip-title">
              {tooltipInfo.task.title}
            </div>
            <div className="k-gantt__tooltip-row">
              <span className="k-gantt__tooltip-label">
                {locale.gantt?.start ?? "Start"}:
              </span>
              <span>{tooltipInfo.task.start}</span>
            </div>
            <div className="k-gantt__tooltip-row">
              <span className="k-gantt__tooltip-label">
                {locale.gantt?.end ?? "End"}:
              </span>
              <span>{tooltipInfo.task.end}</span>
            </div>
            {(tooltipInfo.task.progress ?? 0) > 0 && (
              <div className="k-gantt__tooltip-row">
                <span className="k-gantt__tooltip-label">
                  {locale.gantt?.progress ?? "Progress"}:
                </span>
                <span>{tooltipInfo.task.progress}%</span>
              </div>
            )}
          </>
        )}
      </div>,
      document.body
    );

  // ─── Render: Layout ───────────────────────────────────────────────────

  return (
    <div
      ref={rootRef}
      className={["k-gantt", className].filter(Boolean).join(" ")}
      style={{ ...style, width, height, maxHeight, maxWidth }}
      role="treegrid"
      aria-label={locale.gantt?.ganttLabel ?? "Gantt chart"}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {(() => {
        const defaultToolbar = (
          <div className="k-gantt__toolbar">
            <div className="k-gantt__toolbar-left">
              {showDateRange && (
                <div className="k-gantt__toolbar-daterange">
                  <Calendar
                    selectionMode="range"
                    value={
                      dateRangeStart && dateRangeEnd
                        ? [dateRangeStart, dateRangeEnd]
                        : undefined
                    }
                    onChange={d => {
                      if (Array.isArray(d)) {
                        if (d.length === 2 && d[0] && d[1]) {
                          setDateRangeStart(d[0]);
                          setDateRangeEnd(d[1]);
                        } else {
                          setDateRangeStart(undefined);
                          setDateRangeEnd(undefined);
                        }
                      } else if (!d) {
                        setDateRangeStart(undefined);
                        setDateRangeEnd(undefined);
                      }
                    }}
                    size="sm"
                    placeholder={t?.date ?? "Date range"}
                    showButtonBar
                    presets={[
                      {
                        label: "This week",
                        value: () => {
                          const s = new Date();
                          s.setDate(s.getDate() - s.getDay());
                          const e = new Date(s);
                          e.setDate(e.getDate() + 6);
                          return [s, e];
                        },
                      },
                      {
                        label: "This month",
                        value: () => {
                          const s = new Date();
                          s.setDate(1);
                          const e = new Date(
                            s.getFullYear(),
                            s.getMonth() + 1,
                            0
                          );
                          return [s, e];
                        },
                      },
                      {
                        label: "Next 2 weeks",
                        value: () => {
                          const s = new Date();
                          const e = new Date();
                          e.setDate(e.getDate() + 14);
                          return [s, e];
                        },
                      },
                      {
                        label: "Next 30 days",
                        value: () => {
                          const s = new Date();
                          const e = new Date();
                          e.setDate(e.getDate() + 30);
                          return [s, e];
                        },
                      },
                      {
                        label: "Next 3 months",
                        value: () => {
                          const s = new Date();
                          const e = new Date();
                          e.setMonth(e.getMonth() + 3);
                          return [s, e];
                        },
                      },
                      {
                        label: "This quarter",
                        value: () => {
                          const s = new Date();
                          const q = Math.floor(s.getMonth() / 3);
                          s.setMonth(q * 3, 1);
                          const e = new Date(s.getFullYear(), q * 3 + 3, 0);
                          return [s, e];
                        },
                      },
                      {
                        label: "This year",
                        value: () => {
                          const y = new Date().getFullYear();
                          return [new Date(y, 0, 1), new Date(y, 11, 31)];
                        },
                      },
                    ]}
                  />
                  {dateRangeStart && (
                    <Button
                      size="sm"
                      severity="secondary"
                      buttonType="text"
                      ariaLabel="Clear range"
                      onClick={() => {
                        setDateRangeStart(undefined);
                        setDateRangeEnd(undefined);
                      }}
                      iconLeft={
                        <svg viewBox="0 0 24 24" width="14" height="14">
                          <path
                            d="M18 6L6 18M6 6l12 12"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      }
                    />
                  )}
                </div>
              )}
              <SegmentedControl
                options={VIEW_MODES.map(vm => ({
                  value: vm,
                  label:
                    vm === "day"
                      ? (t?.viewDay ?? "Day")
                      : vm === "week"
                        ? (t?.viewWeek ?? "Week")
                        : (t?.viewMonth ?? "Month"),
                }))}
                value={viewMode}
                onChange={v => {
                  setViewMode(v as GanttViewMode);
                  setZoomLevel(1);
                }}
                size="sm"
              />
              {showTodayMarker && (
                <Button
                  size="sm"
                  severity="secondary"
                  buttonType="text"
                  onClick={scrollToTodayFn}
                >
                  {t?.today ?? "Today"}
                </Button>
              )}
              {isZoomed && (
                <Button
                  size="sm"
                  severity="secondary"
                  buttonType="text"
                  onClick={resetZoom}
                >
                  {t?.resetZoom ?? "Reset Zoom"}
                </Button>
              )}
              {toolbarSlots?.leftSlot}
            </div>
            <div className="k-gantt__toolbar-right">
              {showCriticalPath && (
                <Button
                  size="sm"
                  label={t?.criticalPath ?? "Critical Path"}
                  severity={criticalPathEnabled ? "danger" : "secondary"}
                  buttonType={criticalPathEnabled ? "filled" : "outlined"}
                  onClick={() => setCriticalPathEnabled(p => !p)}
                />
              )}
              {showBaseline && (
                <Button
                  size="sm"
                  label={t?.baseline ?? "Baseline"}
                  severity={baselineEnabled ? "info" : "secondary"}
                  buttonType={baselineEnabled ? "filled" : "outlined"}
                  onClick={() => setBaselineEnabled(p => !p)}
                />
              )}
              {autoSchedule && (
                <Button
                  size="sm"
                  label={t?.autoSchedule ?? "Auto-schedule"}
                  severity={autoScheduleEnabled ? "warning" : "secondary"}
                  buttonType={autoScheduleEnabled ? "filled" : "outlined"}
                  onClick={() => setAutoScheduleEnabled(p => !p)}
                />
              )}
              {toolbarSlots?.rightSlot}
              {showFilter && (
                <Input
                  size="sm"
                  placeholder={t?.filter ?? "Filter tasks..."}
                  value={filterText}
                  onChange={e => {
                    const v = e.target.value;
                    setFilterText(v);
                    onFilterChange?.(v);
                  }}
                  iconLeft={
                    <svg viewBox="0 0 24 24" width="14" height="14">
                      <path d={SEARCH_PATH} fill="currentColor" />
                    </svg>
                  }
                  className="k-gantt__toolbar-filter"
                />
              )}
              {exportItems.length > 0 && (
                <DropdownButton
                  label={t?.export ?? "Export"}
                  items={exportItems}
                  size="sm"
                  severity="secondary"
                  buttonType="outlined"
                />
              )}
              {!isControlled && editable && (
                <>
                  <Button
                    size="sm"
                    severity="secondary"
                    buttonType="text"
                    disabled={!canUndo}
                    onClick={undo}
                    ariaLabel={t?.undo ?? "Undo"}
                    iconLeft={
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path d={UNDO_PATH} fill="currentColor" />
                      </svg>
                    }
                  />
                  <Button
                    size="sm"
                    severity="secondary"
                    buttonType="text"
                    disabled={!canRedo}
                    onClick={redo}
                    ariaLabel={t?.redo ?? "Redo"}
                    iconLeft={
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path d={REDO_PATH} fill="currentColor" />
                      </svg>
                    }
                  />
                </>
              )}
            </div>
          </div>
        );
        return toolbarSlots?.toolbarRender
          ? toolbarSlots.toolbarRender(defaultToolbar)
          : defaultToolbar;
      })()}

      <div className="k-gantt__body">
        <div
          className={`k-gantt__table-wrap${tableCollapsed ? " k-gantt__table-wrap--collapsed" : ""}`}
          style={
            tableCollapsed
              ? undefined
              : ({
                  "--k-gantt-table-w": `${tblWidth}px`,
                } as React.CSSProperties)
          }
        >
          {tableCollapsible && (
            <button
              className="k-gantt__table-toggle"
              onClick={() => setTableCollapsed(c => !c)}
              aria-label={
                tableCollapsed
                  ? (t?.expandTable ?? "Expand table")
                  : (t?.collapseTable ?? "Collapse table")
              }
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                style={{
                  transform: tableCollapsed ? undefined : "rotate(180deg)",
                }}
              >
                <path d={CHEVRON_RIGHT_PATH} fill="currentColor" />
              </svg>
            </button>
          )}
          {!tableCollapsed && (
            <>
              {tableHeader}
              <div
                className="k-gantt__table-scroll"
                ref={tableScrollRef}
                onScroll={handleTableScroll}
                role="rowgroup"
              >
                {tableRows}
                {!isControlled && editable && (
                  <button
                    className="k-gantt__add-row"
                    onClick={() => {
                      const td = formatDate(new Date());
                      const newId = `new-${Date.now()}`;
                      const newTask: GanttTask = {
                        id: newId,
                        title: t?.newGroup ?? "New Group",
                        start: td,
                        end: td,
                        type: "summary",
                      };
                      setInternalTasks(prev => [...prev, newTask]);
                      onTaskCreate?.(newTask);
                      setTimeout(() => openEditDialog(newTask), 50);
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14">
                      <path
                        d="M12 5v14M5 12h14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    {t?.addTask ?? "Add Task"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <div
          className={[
            "k-gantt__splitter",
            splitterActive.current ? "k-gantt__splitter--active" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onMouseDown={handleSplitterDown}
          role="separator"
          aria-orientation="vertical"
          aria-valuenow={tblWidth}
          aria-valuemin={minTableWidth}
        />

        <div className="k-gantt__chart-wrap">
          {chartHeader}
          <div
            className="k-gantt__chart-scroll"
            ref={chartScrollRef}
            onScroll={handleChartScroll}
          >
            {svgChart}
          </div>
          {/* Navigator minimap */}
          {showNavigator &&
            totalWidth > 0 &&
            (navigatorVisibility === "fixed" ||
              (navigatorVisibility === "zoom-fixed" && isZoomed) ||
              navigatorVisibility === "auto") && (
              <div
                className={`k-gantt__navigator${navigatorVisibility === "auto" ? " k-gantt__navigator--auto" : ""}`}
              >
                <svg
                  className="k-gantt__navigator-svg"
                  width="100%"
                  height={40}
                  viewBox={`0 0 ${totalWidth} ${totalHeight}`}
                  preserveAspectRatio="none"
                >
                  {visibleTasks.map((ft, i) => {
                    const task = ft.task;
                    if (task.type === "milestone") {
                      const cx = dateToX(task.start);
                      const cy = getRowY(i) + getRowH(i) / 2;
                      return (
                        <circle
                          key={task.id}
                          cx={cx}
                          cy={cy}
                          r={getRowH(i) * 0.2}
                          className="k-gantt__navigator-bar"
                        />
                      );
                    }
                    const r = getBarRect(task, i);
                    return (
                      <rect
                        key={task.id}
                        x={r.x}
                        y={r.y}
                        width={r.width}
                        height={r.height}
                        className={`k-gantt__navigator-bar${criticalPathEnabled && criticalPathIds.has(task.id) ? " k-gantt__navigator-bar--critical" : ""}`}
                      />
                    );
                  })}
                </svg>
                <div
                  ref={navViewportRef}
                  className="k-gantt__navigator-viewport"
                  style={{
                    left: `${chartScrollRef.current ? (chartScrollRef.current.scrollLeft / totalWidth) * 100 : 0}%`,
                    width: `${chartScrollRef.current ? (chartScrollRef.current.clientWidth / totalWidth) * 100 : 100}%`,
                  }}
                  onMouseDown={e => {
                    e.preventDefault();
                    const navRect = (
                      e.currentTarget.parentElement as HTMLElement
                    ).getBoundingClientRect();
                    const onMove = (ev: MouseEvent) => {
                      if (!chartScrollRef.current) return;
                      const pct = (ev.clientX - navRect.left) / navRect.width;
                      chartScrollRef.current.scrollLeft =
                        pct * totalWidth -
                        chartScrollRef.current.clientWidth / 2;
                    };
                    const onUp = () => {
                      document.removeEventListener("mousemove", onMove);
                      document.removeEventListener("mouseup", onUp);
                    };
                    onMove(e.nativeEvent);
                    document.addEventListener("mousemove", onMove);
                    document.addEventListener("mouseup", onUp);
                  }}
                />
              </div>
            )}
        </div>
      </div>

      {tooltipPortal}

      {ctxPos &&
        createPortal(
          <div
            className="k-gantt__ctx-backdrop"
            onClick={() => setCtxPos(null)}
            onContextMenu={e => {
              e.preventDefault();
              setCtxPos(null);
            }}
          >
            <ContextMenu
              items={buildCtxItems()}
              trigger="click"
              open={true}
              onOpenChange={o => {
                if (!o) setCtxPos(null);
              }}
              style={{ position: "fixed", left: ctxPos.x, top: ctxPos.y }}
            >
              <span />
            </ContextMenu>
          </div>,
          document.body
        )}

      {/* Edit Dialog */}
      <Dialog
        visible={editingTask !== null}
        onHide={handleEditClose}
        header={t?.editTask ?? "Edit Task"}
        size="sm"
      >
        {editDraft &&
          (editTemplate ? (
            editTemplate(editDraft, handleEditClose, saved => {
              updateTask(saved);
              setEditingTask(null);
              setEditDraft(null);
            })
          ) : (
            <div className="k-gantt__edit-form">
              <Input
                label={t?.title ?? "Title"}
                value={editDraft.title}
                onChange={e =>
                  setEditDraft(d => (d ? { ...d, title: e.target.value } : d))
                }
                size="sm"
                fullWidth
              />
              {editDraft.type === "milestone" ? (
                <Calendar
                  label={t?.date ?? "Date"}
                  value={
                    editDraft.start
                      ? new Date(editDraft.start + "T00:00:00")
                      : undefined
                  }
                  onChange={d =>
                    d instanceof Date &&
                    setEditDraft(prev => {
                      if (!prev) return prev;
                      const s = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                      return { ...prev, start: s, end: s };
                    })
                  }
                  size="sm"
                  fullWidth
                />
              ) : (
                <div className="k-gantt__edit-row">
                  <Calendar
                    label={t?.start ?? "Start"}
                    value={
                      editDraft.start
                        ? new Date(editDraft.start + "T00:00:00")
                        : undefined
                    }
                    onChange={d =>
                      d instanceof Date &&
                      setEditDraft(prev => {
                        if (!prev) return prev;
                        const s = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                        return { ...prev, start: s };
                      })
                    }
                    size="sm"
                    fullWidth
                  />
                  <Calendar
                    label={t?.end ?? "End"}
                    value={
                      editDraft.end
                        ? new Date(editDraft.end + "T00:00:00")
                        : undefined
                    }
                    onChange={d =>
                      d instanceof Date &&
                      setEditDraft(prev => {
                        if (!prev) return prev;
                        const s = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                        return { ...prev, end: s };
                      })
                    }
                    size="sm"
                    fullWidth
                  />
                </div>
              )}
              {editDraft.type !== "milestone" &&
                editDraft.type !== "summary" && (
                  <Slider
                    label={`${t?.progress ?? "Progress"}: ${editDraft.progress ?? 0}%`}
                    value={editDraft.progress ?? 0}
                    min={0}
                    max={100}
                    step={5}
                    onChange={v =>
                      setEditDraft(d =>
                        d ? { ...d, progress: v as number } : d
                      )
                    }
                  />
                )}
              <Select
                label={t?.severity ?? "Severity"}
                value={editDraft.severity ?? "primary"}
                options={[
                  { value: "", label: t?.none ?? "None" },
                  ...SEVERITY_OPTIONS.map(s => ({ value: s, label: s })),
                ]}
                onChange={v =>
                  setEditDraft(d =>
                    d
                      ? {
                          ...d,
                          severity: (v || undefined) as
                            | GanttSeverity
                            | undefined,
                        }
                      : d
                  )
                }
                size="sm"
              />
              {availableAssignees.length > 0 && (
                <MultiSelect
                  label={t?.assignees ?? "Assignees"}
                  value={editDraft.assigneeIds ?? []}
                  options={availableAssignees.map(a => ({
                    value: a.id,
                    label: a.label,
                  }))}
                  onChange={v =>
                    setEditDraft(d =>
                      d ? { ...d, assigneeIds: v as string[] } : d
                    )
                  }
                  chipDisplay
                  size="sm"
                />
              )}
              {/* Dependencies — Predecessors (editable) */}
              <div className="k-gantt__edit-deps">
                <label className="k-gantt__edit-deps-label">
                  {t?.dependsOn ?? "Depends on"}
                </label>
                {(editDraft.dependencies ?? []).map((dep, di) => {
                  const d =
                    typeof dep === "string"
                      ? { taskId: dep, type: "FS" as const }
                      : dep;
                  const depTask = tasks.find(tk => tk.id === d.taskId);
                  return (
                    <div key={di} className="k-gantt__edit-dep-row">
                      <span className="k-gantt__edit-dep-name">
                        {depTask?.title ?? d.taskId}
                      </span>
                      <Select
                        value={d.type ?? "FS"}
                        options={[
                          {
                            value: "FS",
                            label: t?.finishToStart ?? "Finish to Start",
                          },
                          {
                            value: "SS",
                            label: t?.startToStart ?? "Start to Start",
                          },
                          {
                            value: "FF",
                            label: t?.finishToFinish ?? "Finish to Finish",
                          },
                          {
                            value: "SF",
                            label: t?.startToFinish ?? "Start to Finish",
                          },
                        ]}
                        onChange={v =>
                          setEditDraft(prev => {
                            if (!prev) return prev;
                            const deps = [...(prev.dependencies ?? [])];
                            deps[di] = {
                              taskId: d.taskId,
                              type: v as "FS" | "FF" | "SS" | "SF",
                            };
                            return { ...prev, dependencies: deps };
                          })
                        }
                        size="sm"
                      />
                      <button
                        className="k-gantt__opt-btn k-gantt__opt-btn--danger"
                        onClick={() =>
                          setEditDraft(prev => {
                            if (!prev) return prev;
                            const deps = [...(prev.dependencies ?? [])];
                            deps.splice(di, 1);
                            return { ...prev, dependencies: deps };
                          })
                        }
                        aria-label="Remove"
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14">
                          <path d={TRASH_PATH} fill="currentColor" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
                <Select
                  placeholder={t?.addDependency ?? "Add dependency..."}
                  options={tasks
                    .filter(
                      tk =>
                        tk.id !== editDraft.id &&
                        tk.type !== "summary" &&
                        !(editDraft.dependencies ?? []).some(
                          d => (typeof d === "string" ? d : d.taskId) === tk.id
                        )
                    )
                    .map(tk => ({ value: tk.id, label: tk.title }))}
                  onChange={v => {
                    if (!v) return;
                    setEditDraft(prev => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        dependencies: [
                          ...(prev.dependencies ?? []),
                          { taskId: v as string, type: "FS" as const },
                        ],
                      };
                    });
                  }}
                  size="sm"
                  value=""
                />
              </div>
              {/* Successors — changes accumulated, applied on Save */}
              {(() => {
                const successors = tasks.filter(tk =>
                  (tk.dependencies ?? []).some(
                    d => (typeof d === "string" ? d : d.taskId) === editDraft.id
                  )
                );
                // Apply pending changes for display
                const displayed = successors
                  .filter(
                    tk =>
                      !pendingSuccessorChanges.some(
                        ch =>
                          ch.targetTaskId === tk.id && ch.action === "delete"
                      )
                  )
                  .map(tk => {
                    const pending = pendingSuccessorChanges.find(
                      ch => ch.targetTaskId === tk.id && ch.action === "update"
                    );
                    const dep = (tk.dependencies ?? []).find(
                      d =>
                        (typeof d === "string" ? d : d.taskId) === editDraft.id
                    );
                    const type =
                      pending?.type ??
                      (typeof dep === "string" ? "FS" : (dep?.type ?? "FS"));
                    return { ...tk, _depType: type };
                  });
                if (displayed.length === 0) return null;
                return (
                  <div className="k-gantt__edit-deps">
                    <label className="k-gantt__edit-deps-label">
                      {t?.requiredBy ?? "Required by"}
                    </label>
                    {displayed.map(tk => (
                      <div key={tk.id} className="k-gantt__edit-dep-row">
                        <span className="k-gantt__edit-dep-name">
                          {tk.title}
                        </span>
                        <Select
                          value={tk._depType}
                          options={[
                            {
                              value: "FS",
                              label: t?.finishToStart ?? "Finish to Start",
                            },
                            {
                              value: "SS",
                              label: t?.startToStart ?? "Start to Start",
                            },
                            {
                              value: "FF",
                              label: t?.finishToFinish ?? "Finish to Finish",
                            },
                            {
                              value: "SF",
                              label: t?.startToFinish ?? "Start to Finish",
                            },
                          ]}
                          onChange={v =>
                            setPendingSuccessorChanges(prev => [
                              ...prev.filter(
                                ch =>
                                  !(
                                    ch.targetTaskId === tk.id &&
                                    ch.action === "update"
                                  )
                              ),
                              {
                                targetTaskId: tk.id,
                                action: "update",
                                fromId: editDraft.id,
                                type: v as "FS" | "FF" | "SS" | "SF",
                              },
                            ])
                          }
                          size="sm"
                        />
                        <button
                          className="k-gantt__opt-btn k-gantt__opt-btn--danger"
                          onClick={() =>
                            setPendingSuccessorChanges(prev => [
                              ...prev.filter(ch => ch.targetTaskId !== tk.id),
                              {
                                targetTaskId: tk.id,
                                action: "delete",
                                fromId: editDraft.id,
                              },
                            ])
                          }
                          aria-label="Remove"
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14">
                            <path d={TRASH_PATH} fill="currentColor" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}
              {editSlots?.customSlot?.(editDraft, setEditDraft)}
              <div className="k-gantt__edit-actions">
                <Button
                  label={t?.cancel ?? "Cancel"}
                  buttonType="text"
                  severity="secondary"
                  size="sm"
                  onClick={handleEditClose}
                />
                <Button
                  label={t?.save ?? "Save"}
                  severity="primary"
                  size="sm"
                  onClick={handleEditSave}
                />
              </div>
            </div>
          ))}
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        visible={deleteTarget !== null}
        onHide={() => setDeleteTarget(null)}
        header={t?.delete ?? "Delete"}
        size="xs"
      >
        <div className="k-gantt__delete-confirm">
          <p>
            {t?.deleteConfirm ?? "Are you sure you want to delete this task?"}
          </p>
          <p className="k-gantt__delete-task-name">{deleteTarget?.title}</p>
          <div className="k-gantt__edit-actions">
            <Button
              label={t?.cancel ?? "Cancel"}
              buttonType="text"
              severity="secondary"
              size="sm"
              onClick={() => setDeleteTarget(null)}
            />
            <Button
              label={t?.delete ?? "Delete"}
              severity="danger"
              size="sm"
              onClick={handleDeleteConfirm}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};
export { Gantt };
