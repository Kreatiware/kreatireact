import type { GanttTask, GanttDependency, GanttViewMode } from "./GanttTypes";

// ─── Date Utilities ─────────────────────────────────────────────────────────

/** Parse ISO date string to Date at midnight UTC */
export const parseDate = (iso: string): Date => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

/** Format Date to ISO string YYYY-MM-DD */
export const formatDate = (date: Date): string => {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/** Add days to a Date (returns new Date) */
export const addDays = (date: Date, days: number): Date => {
  const r = new Date(date);
  r.setUTCDate(r.getUTCDate() + days);
  return r;
};

/** Difference in calendar days between two dates */
export const diffDays = (a: Date, b: Date): number =>
  Math.round((b.getTime() - a.getTime()) / 86400000);

/** Check if a date is Saturday or Sunday */
export const isWeekend = (date: Date): boolean => {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
};

/** Get the Monday of the week containing the given date */
export const startOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
};

/** Get the first day of the month */
export const startOfMonth = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));

/** Get the last day of the month */
export const endOfMonth = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));

/** Short month name */
const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Short day name */
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const monthShort = (date: Date): string =>
  MONTH_SHORT[date.getUTCMonth()];
export const dayShort = (date: Date): string => DAY_SHORT[date.getUTCDay()];

// ─── Timeline Generation ────────────────────────────────────────────────────

export interface TimelineCell {
  date: Date;
  label: string;
  isWeekend: boolean;
  isToday: boolean;
}

export interface TimelineGroup {
  label: string;
  span: number;
}

/** Compute the date range for the chart with padding */
export const computeDateRange = (
  tasks: GanttTask[],
  viewMode: GanttViewMode
): { start: Date; end: Date } => {
  if (tasks.length === 0) {
    const today = new Date();
    return {
      start: addDays(today, -7),
      end: addDays(today, 30),
    };
  }

  let minDate = Infinity;
  let maxDate = -Infinity;

  for (const t of tasks) {
    const s = parseDate(t.start).getTime();
    const e = parseDate(t.end).getTime();
    if (s < minDate) minDate = s;
    if (e > maxDate) maxDate = e;
  }

  let start = new Date(minDate);
  let end = new Date(maxDate);

  // Add padding based on view mode
  if (viewMode === "day") {
    start = addDays(start, -2);
    end = addDays(end, 5);
  } else if (viewMode === "week") {
    start = startOfWeek(addDays(start, -7));
    end = addDays(end, 14);
  } else {
    start = startOfMonth(addDays(start, -15));
    end = addDays(endOfMonth(end), 15);
  }

  return { start, end };
};

/** Generate lower-level cells (individual time units) */
export const generateCells = (
  rangeStart: Date,
  rangeEnd: Date,
  viewMode: GanttViewMode,
  today: Date
): TimelineCell[] => {
  const cells: TimelineCell[] = [];
  const todayStr = formatDate(today);

  if (viewMode === "day") {
    let d = new Date(rangeStart);
    while (d <= rangeEnd) {
      cells.push({
        date: new Date(d),
        label: `${d.getUTCDate()}`,
        isWeekend: isWeekend(d),
        isToday: formatDate(d) === todayStr,
      });
      d = addDays(d, 1);
    }
  } else if (viewMode === "week") {
    let d = startOfWeek(rangeStart);
    while (d <= rangeEnd) {
      cells.push({
        date: new Date(d),
        label: `${monthShort(d)} ${d.getUTCDate()}`,
        isWeekend: false,
        isToday: false,
      });
      d = addDays(d, 7);
    }
  } else {
    // month view — each cell is a month
    let d = startOfMonth(rangeStart);
    while (d <= rangeEnd) {
      cells.push({
        date: new Date(d),
        label: `${monthShort(d)} ${d.getUTCFullYear()}`,
        isWeekend: false,
        isToday: false,
      });
      d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
    }
  }

  return cells;
};

/** Generate upper-level groups (months for day view, quarters for week, years for month) */
export const generateGroups = (
  cells: TimelineCell[],
  viewMode: GanttViewMode
): TimelineGroup[] => {
  if (cells.length === 0) return [];
  const groups: TimelineGroup[] = [];

  if (viewMode === "day") {
    let currentLabel = "";
    let count = 0;
    for (const c of cells) {
      const label = `${monthShort(c.date)} ${c.date.getUTCFullYear()}`;
      if (label !== currentLabel) {
        if (currentLabel) groups.push({ label: currentLabel, span: count });
        currentLabel = label;
        count = 1;
      } else {
        count++;
      }
    }
    if (currentLabel) groups.push({ label: currentLabel, span: count });
  } else if (viewMode === "week") {
    let currentLabel = "";
    let count = 0;
    for (const c of cells) {
      const label = `${monthShort(c.date)} ${c.date.getUTCFullYear()}`;
      if (label !== currentLabel) {
        if (currentLabel) groups.push({ label: currentLabel, span: count });
        currentLabel = label;
        count = 1;
      } else {
        count++;
      }
    }
    if (currentLabel) groups.push({ label: currentLabel, span: count });
  } else {
    let currentLabel = "";
    let count = 0;
    for (const c of cells) {
      const label = `${c.date.getUTCFullYear()}`;
      if (label !== currentLabel) {
        if (currentLabel) groups.push({ label: currentLabel, span: count });
        currentLabel = label;
        count = 1;
      } else {
        count++;
      }
    }
    if (currentLabel) groups.push({ label: currentLabel, span: count });
  }

  return groups;
};

// ─── Task Hierarchy ─────────────────────────────────────────────────────────

export interface FlatTask {
  task: GanttTask;
  depth: number;
  hasChildren: boolean;
  visible: boolean;
}

/** Flatten task hierarchy into ordered list with depth info */
export const flattenTasks = (
  tasks: GanttTask[],
  collapsedIds?: Set<string>
): FlatTask[] => {
  const childrenMap = new Map<string | undefined, GanttTask[]>();
  for (const t of tasks) {
    const pid = t.parentId ?? undefined;
    if (!childrenMap.has(pid)) childrenMap.set(pid, []);
    childrenMap.get(pid)!.push(t);
  }

  const collapsedSet = collapsedIds ?? new Set<string>();

  const result: FlatTask[] = [];

  const walk = (
    parentId: string | undefined,
    depth: number,
    parentVisible: boolean
  ) => {
    const children = childrenMap.get(parentId) ?? [];
    for (const t of children) {
      const hasChildren =
        childrenMap.has(t.id) && childrenMap.get(t.id)!.length > 0;
      result.push({ task: t, depth, hasChildren, visible: parentVisible });
      const childVisible = parentVisible && !collapsedSet.has(t.id);
      walk(t.id, depth + 1, childVisible);
    }
  };

  walk(undefined, 0, true);
  return result;
};

// ─── Dependency Resolution ──────────────────────────────────────────────────

export interface ResolvedDependency {
  fromId: string;
  toId: string;
  type: "FS" | "FF" | "SS" | "SF";
}

/** Normalize dependency inputs to resolved objects */
export const resolveDependencies = (
  tasks: GanttTask[]
): ResolvedDependency[] => {
  const deps: ResolvedDependency[] = [];
  const taskIds = new Set(tasks.map(t => t.id));

  for (const task of tasks) {
    if (!task.dependencies) continue;
    for (const dep of task.dependencies) {
      const resolved: GanttDependency =
        typeof dep === "string" ? { taskId: dep, type: "FS" } : dep;
      if (taskIds.has(resolved.taskId)) {
        deps.push({
          fromId: resolved.taskId,
          toId: task.id,
          type: resolved.type ?? "FS",
        });
      }
    }
  }

  return deps;
};

// ─── Dependency Arrow Path ──────────────────────────────────────────────────

interface BarRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Generate SVG path for a dependency arrow */
export const dependencyPath = (
  from: BarRect,
  to: BarRect,
  type: "FS" | "FF" | "SS" | "SF"
): {
  path: string;
  arrowX: number;
  arrowY: number;
  arrowDir: "left" | "right";
} => {
  const gap = 12;
  const radius = 4;

  let startX: number;
  let startY: number;
  let endX: number;
  let endY: number;
  let arrowDir: "left" | "right";

  // Determine start/end points based on dependency type
  if (type === "FS") {
    startX = from.x + from.width;
    startY = from.y + from.height / 2;
    endX = to.x;
    endY = to.y + to.height / 2;
    arrowDir = "right";
  } else if (type === "SS") {
    startX = from.x;
    startY = from.y + from.height / 2;
    endX = to.x;
    endY = to.y + to.height / 2;
    arrowDir = "right";
  } else if (type === "FF") {
    startX = from.x + from.width;
    startY = from.y + from.height / 2;
    endX = to.x + to.width;
    endY = to.y + to.height / 2;
    arrowDir = "left";
  } else {
    // SF
    startX = from.x;
    startY = from.y + from.height / 2;
    endX = to.x + to.width;
    endY = to.y + to.height / 2;
    arrowDir = "left";
  }

  // Build path with rounded corners
  const midY = endY;
  let d: string;

  if (type === "FS" || type === "SF") {
    const outX = type === "FS" ? startX + gap : startX - gap;
    const inX = type === "FS" ? endX - gap : endX + gap;

    if ((type === "FS" && outX < inX) || (type === "SF" && outX > inX)) {
      // Simple L-shape
      d = `M${startX},${startY} L${outX},${startY}`;
      if (Math.abs(startY - midY) > radius * 2) {
        const signY = midY > startY ? 1 : -1;
        d += ` L${outX},${midY - signY * radius}`;
        d += ` Q${outX},${midY} ${outX + (type === "FS" ? radius : -radius)},${midY}`;
        d += ` L${endX},${midY}`;
      } else {
        d += ` L${endX},${startY} L${endX},${midY}`;
      }
    } else {
      // S-shape: go out, down, across, down, in
      const halfY = startY + (midY - startY) / 2;
      d = `M${startX},${startY} L${outX},${startY} L${outX},${halfY} L${inX},${halfY} L${inX},${midY} L${endX},${midY}`;
    }
  } else {
    // SS or FF — go out from same side, then across
    const outX =
      type === "SS"
        ? Math.min(startX, endX) - gap
        : Math.max(startX, endX) + gap;

    d = `M${startX},${startY} L${outX},${startY} L${outX},${midY} L${endX},${midY}`;
  }

  return { path: d, arrowX: endX, arrowY: endY, arrowDir };
};

/** SVG polygon points for arrow head */
export const arrowHead = (
  x: number,
  y: number,
  dir: "left" | "right"
): string => {
  const size = 5;
  if (dir === "right") {
    return `${x},${y - size} ${x + size * 1.5},${y} ${x},${y + size}`;
  }
  return `${x},${y - size} ${x - size * 1.5},${y} ${x},${y + size}`;
};

// ─── Column Width per View Mode ─────────────────────────────────────────────

export const cellWidth = (viewMode: GanttViewMode): number => {
  if (viewMode === "day") return 36;
  if (viewMode === "week") return 80;
  return 120;
};
