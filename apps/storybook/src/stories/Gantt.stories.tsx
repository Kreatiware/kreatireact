import type { Meta, StoryObj } from "@storybook/react";
import { useRef, useState } from "react";
import {
  Gantt,
  Button,
  type GanttTask,
  type GanttRef,
  type GanttTaskChangeEvent,
  type GanttProgressChangeEvent,
} from "@kreatiware/react";

const meta: Meta<typeof Gantt> = {
  title: "Project Management/Gantt",
  component: Gantt,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Gantt>;

// ─── Sample Data ──────────────────────────────────────────────────────────────

const baseTasks: GanttTask[] = [
  {
    id: "1",
    title: "Project Planning",
    start: "2026-05-01",
    end: "2026-05-20",
    type: "summary",
    progress: 45,
  },
  {
    id: "1.1",
    title: "Requirements Analysis",
    start: "2026-05-01",
    end: "2026-05-07",
    parentId: "1",
    progress: 100,
    severity: "success",
  },
  {
    id: "1.2",
    title: "Architecture Design",
    start: "2026-05-05",
    end: "2026-05-12",
    parentId: "1",
    progress: 60,
    dependencies: ["1.1"],
  },
  {
    id: "1.3",
    title: "Design Review",
    start: "2026-05-12",
    end: "2026-05-12",
    parentId: "1",
    type: "milestone",
    dependencies: ["1.2"],
    severity: "warning",
  },
  {
    id: "2",
    title: "Development",
    start: "2026-05-13",
    end: "2026-06-10",
    type: "summary",
    progress: 20,
  },
  {
    id: "2.1",
    title: "Frontend Development",
    start: "2026-05-13",
    end: "2026-05-30",
    parentId: "2",
    progress: 30,
    dependencies: [{ taskId: "1.3", type: "FS" }],
    severity: "info",
  },
  {
    id: "2.2",
    title: "Backend Development",
    start: "2026-05-13",
    end: "2026-06-03",
    parentId: "2",
    progress: 15,
    dependencies: [{ taskId: "1.3", type: "FS" }],
    severity: "help",
  },
  {
    id: "2.3",
    title: "Integration",
    start: "2026-06-01",
    end: "2026-06-10",
    parentId: "2",
    progress: 0,
    dependencies: ["2.1", "2.2"],
    severity: "accent",
  },
  {
    id: "3",
    title: "Testing & QA",
    start: "2026-06-08",
    end: "2026-06-20",
    progress: 0,
    dependencies: ["2.3"],
    severity: "danger",
  },
  {
    id: "4",
    title: "Release",
    start: "2026-06-20",
    end: "2026-06-20",
    type: "milestone",
    dependencies: ["3"],
    severity: "success",
  },
];

// ─── 1. Default ───────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    defaultTasks: baseTasks,
  },
  render: (args) => (
    <div style={{ height: "500px" }}>
      <Gantt {...args} />
    </div>
  ),
};

// ─── 2. Week View ─────────────────────────────────────────────────────────────

export const WeekView: Story = {
  args: {
    defaultTasks: baseTasks,
    viewMode: "week",
  },
  render: (args) => (
    <div style={{ height: "500px" }}>
      <Gantt {...args} />
    </div>
  ),
};

// ─── 3. Month View ────────────────────────────────────────────────────────────

export const MonthView: Story = {
  args: {
    defaultTasks: baseTasks,
    viewMode: "month",
  },
  render: (args) => (
    <div style={{ height: "500px" }}>
      <Gantt {...args} />
    </div>
  ),
};

// ─── 4. Interactive (Drag & Resize) ───────────────────────────────────────────

export const Interactive: Story = {
  render: () => {
    const [tasks, setTasks] = useState<GanttTask[]>(baseTasks);

    const handleTaskChange = (event: GanttTaskChangeEvent) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === event.task.id
            ? { ...t, start: event.start, end: event.end }
            : t
        )
      );
    };

    const handleProgressChange = (event: GanttProgressChangeEvent) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === event.task.id ? { ...t, progress: event.progress } : t
        )
      );
    };

    return (
      <div style={{ height: "500px" }}>
        <Gantt
          tasks={tasks}
          onTaskChange={handleTaskChange}
          onProgressChange={handleProgressChange}
        />
      </div>
    );
  },
};

// ─── 5. Expand/Collapse ──────────────────────────────────────────────────────

export const ExpandCollapse: Story = {
  args: {
    defaultTasks: baseTasks,
  },
  render: (args) => (
    <div style={{ height: "500px" }}>
      <Gantt {...args} />
    </div>
  ),
};

// ─── 7. Severity Colors ──────────────────────────────────────────────────────

export const SeverityColors: Story = {
  args: {
    defaultTasks: [
      { id: "1", title: "Primary", start: "2026-05-01", end: "2026-05-10", severity: "primary", progress: 70 },
      { id: "2", title: "Secondary", start: "2026-05-03", end: "2026-05-12", severity: "secondary", progress: 50 },
      { id: "3", title: "Success", start: "2026-05-05", end: "2026-05-14", severity: "success", progress: 90 },
      { id: "4", title: "Info", start: "2026-05-07", end: "2026-05-16", severity: "info", progress: 40 },
      { id: "5", title: "Warning", start: "2026-05-09", end: "2026-05-18", severity: "warning", progress: 60 },
      { id: "6", title: "Help", start: "2026-05-11", end: "2026-05-20", severity: "help", progress: 30 },
      { id: "7", title: "Danger", start: "2026-05-13", end: "2026-05-22", severity: "danger", progress: 80 },
      { id: "8", title: "Accent", start: "2026-05-15", end: "2026-05-24", severity: "accent", progress: 55 },
    ],
  },
  render: (args) => (
    <div style={{ height: "450px" }}>
      <Gantt {...args} />
    </div>
  ),
};

// ─── 8. Dependency Types ─────────────────────────────────────────────────────

export const DependencyTypes: Story = {
  args: {
    defaultTasks: [
      { id: "a", title: "Task A", start: "2026-05-01", end: "2026-05-08" },
      { id: "b", title: "B (FS from A)", start: "2026-05-10", end: "2026-05-15", dependencies: [{ taskId: "a", type: "FS" }] },
      { id: "c", title: "C (SS from A)", start: "2026-05-03", end: "2026-05-12", dependencies: [{ taskId: "a", type: "SS" }], severity: "info" },
      { id: "d", title: "D (FF from A)", start: "2026-05-05", end: "2026-05-08", dependencies: [{ taskId: "a", type: "FF" }], severity: "warning" },
      { id: "e", title: "E (SF from A)", start: "2026-05-06", end: "2026-05-14", dependencies: [{ taskId: "a", type: "SF" }], severity: "help" },
    ],
  },
  render: (args) => (
    <div style={{ height: "400px" }}>
      <Gantt {...args} />
    </div>
  ),
};

// ─── 9. Read Only ─────────────────────────────────────────────────────────────

export const ReadOnly: Story = {
  args: {
    defaultTasks: baseTasks,
    columns: ["title", "startDate", "endDate", "progress", "options"],
    readOnly: true,
  },
  render: (args) => (
    <div style={{ height: "500px" }}>
      <Gantt {...args} />
    </div>
  ),
};

// ─── 10. Custom Tooltip ───────────────────────────────────────────────────────

export const CustomTooltip: Story = {
  args: {
    defaultTasks: baseTasks,
    tooltipTemplate: (task) => (
      <div>
        <strong>{task.title}</strong>
        <br />
        <span>{task.start} to {task.end}</span>
        {task.progress !== undefined && (
          <>
            <br />
            <span>Completed: {task.progress}%</span>
          </>
        )}
      </div>
    ),
  },
  render: (args) => (
    <div style={{ height: "500px" }}>
      <Gantt {...args} />
    </div>
  ),
};

// ─── 11. Narrow Table ─────────────────────────────────────────────────────────

export const NarrowTable: Story = {
  args: {
    defaultTasks: baseTasks,
    tableWidth: 180,
    columns: ["title"],
    tableCollapsible: false,
  },
  render: (args) => (
    <div style={{ height: "500px" }}>
      <Gantt {...args} />
    </div>
  ),
};

// ─── 12. Custom Row Height ────────────────────────────────────────────────────

export const CustomRowHeight: Story = {
  args: {
    defaultTasks: baseTasks.map(t => ({
      ...t,
      rowHeight: t.type === "summary" ? 28
        : t.type === "milestone" ? 32
        : t.id === "2.1" ? 80
        : t.id === "3" ? 60
        : undefined,
    })),
    columns: ["title", "startDate", "progress"],
    rowHeight: 40,
    barLabelTemplate: (task: GanttTask) => task.title,
  },
  render: (args) => (
    <div style={{ height: "650px" }}>
      <Gantt {...args} />
    </div>
  ),
};

// ─── 13. Imperative Ref ───────────────────────────────────────────────────────

export const ImperativeRef: Story = {
  render: () => {
    const ganttRef = useRef<GanttRef>(null);
    const [ro, setRo] = useState(false);

    return (
      <div style={{ height: "600px" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", padding: "0 0.75rem", flexWrap: "wrap" }}>
          <Button size="sm" compact onClick={() => ganttRef.current?.scrollToToday()}>
            Scroll to Today
          </Button>
          <Button size="sm" compact severity="info" onClick={() => ganttRef.current?.scrollToTask("3")}>
            Scroll to Testing
          </Button>
          <Button size="sm" compact severity="success" onClick={() => ganttRef.current?.expandAll()}>
            Expand All
          </Button>
          <Button size="sm" compact severity="warning" onClick={() => ganttRef.current?.collapseAll()}>
            Collapse All
          </Button>
          <Button size="sm" compact severity="secondary" onClick={() => {
            const range = ganttRef.current?.getVisibleDateRange();
            if (range) alert(`Visible: ${range.start} to ${range.end}`);
          }}>
            Visible Range
          </Button>
          <Button size="sm" compact severity="danger" onClick={() => { setRo(r => !r); ganttRef.current?.setReadOnly(!ro); }}>
            {ro ? "Enable Edit" : "Read Only"}
          </Button>
          <Button size="sm" compact severity="accent" onClick={() => ganttRef.current?.setCriticalPath(true)}>
            Critical Path On
          </Button>
          <Button size="sm" compact severity="help" onClick={() => ganttRef.current?.export("csv")}>
            Export CSV
          </Button>
          <Button size="sm" compact severity="help" onClick={() => ganttRef.current?.export("png")}>
            Export PNG
          </Button>
          <Button size="sm" compact severity="secondary" onClick={() => {
            const tasks = ganttRef.current?.getTasks();
            if (tasks) console.log("Tasks:", tasks);
          }}>
            Log Tasks
          </Button>
        </div>
        <Gantt ref={ganttRef} defaultTasks={baseTasks} showCriticalPath showNavigator />
      </div>
    );
  },
};

// ─── 14. Full Customized ──────────────────────────────────────────────────────

const fullTasks: GanttTask[] = [
  // ── Phase 1: Research ──
  {
    id: "p1",
    title: "Phase 1 — Research",
    start: "2026-05-01",
    end: "2026-05-16",
    type: "summary",
    progress: 85,
    severity: "info",
  },
  {
    id: "p1.1",
    title: "Market Analysis",
    start: "2026-05-01",
    end: "2026-05-07",
    parentId: "p1",
    progress: 100,
    severity: "success",
    data: { assignee: "Ana", team: "Research" },
  },
  {
    id: "p1.2",
    title: "Competitor Audit",
    start: "2026-05-05",
    end: "2026-05-12",
    parentId: "p1",
    progress: 90,
    severity: "info",
    dependencies: [{ taskId: "p1.1", type: "SS" }],
    data: { assignee: "Carlos", team: "Research" },
  },
  {
    id: "p1.3",
    title: "User Interviews",
    start: "2026-05-08",
    end: "2026-05-14",
    parentId: "p1",
    progress: 70,
    severity: "help",
    dependencies: ["p1.1"],
    data: { assignee: "Maria", team: "UX" },
  },
  {
    id: "p1.m",
    title: "Research Sign-off",
    start: "2026-05-16",
    end: "2026-05-16",
    parentId: "p1",
    type: "milestone",
    severity: "accent",
    dependencies: ["p1.2", "p1.3"],
    data: { assignee: "Director", team: "Management" },
  },

  // ── Phase 2: Design ──
  {
    id: "p2",
    title: "Phase 2 — Design",
    start: "2026-05-18",
    end: "2026-06-05",
    type: "summary",
    progress: 40,
    severity: "help",
  },
  {
    id: "p2.1",
    title: "Wireframes",
    start: "2026-05-18",
    end: "2026-05-23",
    parentId: "p2",
    progress: 80,
    severity: "help",
    dependencies: [{ taskId: "p1.m", type: "FS" }],
    data: { assignee: "Maria", team: "UX" },
  },
  {
    id: "p2.2",
    title: "Visual Design",
    start: "2026-05-22",
    end: "2026-05-30",
    parentId: "p2",
    progress: 35,
    severity: "accent",
    dependencies: [{ taskId: "p2.1", type: "SS" }],
    data: { assignee: "Luis", team: "Design" },
  },
  {
    id: "p2.3",
    title: "Prototype",
    start: "2026-05-28",
    end: "2026-06-03",
    parentId: "p2",
    progress: 10,
    severity: "warning",
    dependencies: ["p2.2"],
    data: { assignee: "Maria", team: "UX" },
  },
  {
    id: "p2.m",
    title: "Design Approval",
    start: "2026-06-05",
    end: "2026-06-05",
    parentId: "p2",
    type: "milestone",
    severity: "success",
    dependencies: ["p2.3"],
    data: { assignee: "Stakeholders", team: "Management" },
  },

  // ── Phase 3: Development ──
  {
    id: "p3",
    title: "Phase 3 — Development",
    start: "2026-06-06",
    end: "2026-07-10",
    type: "summary",
    progress: 15,
    severity: "primary",
  },
  {
    id: "p3.1",
    title: "Backend API",
    start: "2026-06-06",
    end: "2026-06-25",
    parentId: "p3",
    progress: 25,
    severity: "primary",
    dependencies: [{ taskId: "p2.m", type: "FS" }],
    data: { assignee: "Carlos", team: "Backend" },
  },
  {
    id: "p3.2",
    title: "Frontend UI",
    start: "2026-06-10",
    end: "2026-06-30",
    parentId: "p3",
    progress: 15,
    severity: "info",
    dependencies: [{ taskId: "p2.m", type: "FS" }],
    data: { assignee: "Ana", team: "Frontend" },
  },
  {
    id: "p3.3",
    title: "Database Schema",
    start: "2026-06-06",
    end: "2026-06-12",
    parentId: "p3",
    progress: 50,
    severity: "secondary",
    dependencies: [{ taskId: "p2.m", type: "FS" }],
    data: { assignee: "Carlos", team: "Backend" },
  },
  {
    id: "p3.4",
    title: "Integration",
    start: "2026-06-28",
    end: "2026-07-08",
    parentId: "p3",
    progress: 0,
    severity: "warning",
    dependencies: [
      { taskId: "p3.1", type: "FF" },
      { taskId: "p3.2", type: "FF" },
    ],
    data: { assignee: "Team", team: "Full Stack" },
  },
  {
    id: "p3.m",
    title: "Code Freeze",
    start: "2026-07-10",
    end: "2026-07-10",
    parentId: "p3",
    type: "milestone",
    severity: "danger",
    dependencies: ["p3.4"],
    data: { assignee: "Lead", team: "Engineering" },
  },

  // ── Phase 4: QA & Launch ──
  {
    id: "p4",
    title: "Phase 4 — QA & Launch",
    start: "2026-07-11",
    end: "2026-07-25",
    type: "summary",
    progress: 0,
    severity: "danger",
  },
  {
    id: "p4.1",
    title: "QA Testing",
    start: "2026-07-11",
    end: "2026-07-18",
    parentId: "p4",
    progress: 0,
    severity: "danger",
    dependencies: [{ taskId: "p3.m", type: "FS" }],
    data: { assignee: "QA Team", team: "Quality" },
  },
  {
    id: "p4.2",
    title: "Bug Fixes",
    start: "2026-07-16",
    end: "2026-07-22",
    parentId: "p4",
    progress: 0,
    severity: "warning",
    dependencies: [{ taskId: "p4.1", type: "SS" }],
    data: { assignee: "Dev Team", team: "Engineering" },
  },
  {
    id: "p4.3",
    title: "Staging Deploy",
    start: "2026-07-22",
    end: "2026-07-23",
    parentId: "p4",
    progress: 0,
    severity: "info",
    dependencies: ["p4.2"],
    data: { assignee: "DevOps", team: "Infrastructure" },
  },
  {
    id: "p4.m",
    title: "Production Launch",
    start: "2026-07-25",
    end: "2026-07-25",
    parentId: "p4",
    type: "milestone",
    severity: "success",
    dependencies: ["p4.3"],
    data: { assignee: "CTO", team: "Management" },
  },
];

const severityColors: Record<string, string> = {
  primary: "var(--kreati-severity-primary)",
  secondary: "var(--kreati-severity-secondary)",
  success: "var(--kreati-severity-success)",
  info: "var(--kreati-severity-info)",
  warning: "var(--kreati-severity-warning)",
  help: "var(--kreati-severity-help)",
  danger: "var(--kreati-severity-danger)",
  accent: "var(--kreati-severity-accent)",
};

export const FullCustomized: Story = {
  render: () => {
    const ganttRef = useRef<GanttRef>(null);
    const [tasks, setTasks] = useState<GanttTask[]>(fullTasks);

    const handleTaskChange = (event: GanttTaskChangeEvent) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === event.task.id
            ? { ...t, start: event.start, end: event.end }
            : t
        )
      );
    };

    const handleProgressChange = (event: GanttProgressChangeEvent) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === event.task.id ? { ...t, progress: event.progress } : t
        )
      );
    };

    return (
      <div style={{ height: "700px" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", padding: "0.5rem 0.75rem", flexWrap: "wrap" }}>
          <Button size="sm" compact onClick={() => ganttRef.current?.scrollToToday()}>
            Today
          </Button>
          <Button size="sm" compact severity="success" onClick={() => ganttRef.current?.expandAll()}>
            Expand All
          </Button>
          <Button size="sm" compact severity="warning" onClick={() => ganttRef.current?.collapseAll()}>
            Collapse All
          </Button>
          <Button size="sm" compact severity="info" onClick={() => ganttRef.current?.scrollToTask("p3.m")}>
            Go to Code Freeze
          </Button>
          <Button size="sm" compact severity="danger" onClick={() => ganttRef.current?.scrollToTask("p4.m")}>
            Go to Launch
          </Button>
        </div>
        <Gantt
          ref={ganttRef}
          tasks={tasks}
          onTaskChange={handleTaskChange}
          onProgressChange={handleProgressChange}
          onTaskClick={(task) => console.log("Clicked:", task.id, task.title)}
          onTaskDoubleClick={(task) => console.log("Double-clicked:", task.id)}
          onExpandChange={(id, collapsed) => console.log("Expand:", id, collapsed)}
          tableWidth={420}
          rowHeight={38}
          columns={[
            { field: "title", header: "Task", width: 200 },
            {
              field: "assignee",
              header: "Assignee",
              width: 90,
              template: (task) => (
                <span style={{
                  fontSize: "var(--kreati-font-size-xs)",
                  color: "var(--kreati-text-secondary)",
                }}>
                  {(task.data?.assignee as string) ?? "—"}
                </span>
              ),
            },
            {
              field: "progress",
              header: "%",
              width: 50,
              template: (task) => {
                if (task.type === "milestone") return <span style={{ fontSize: "var(--kreati-font-size-xxs)", color: "var(--kreati-text-muted)" }}>—</span>;
                const p = task.progress ?? 0;
                return (
                  <span style={{
                    fontSize: "var(--kreati-font-size-xs)",
                    fontWeight: p === 100 ? "var(--kreati-font-weight-semibold)" as unknown as number : undefined,
                    color: p === 100
                      ? "var(--kreati-severity-success)"
                      : p > 50
                        ? "var(--kreati-severity-info)"
                        : "var(--kreati-text-body)",
                  }}>
                    {p}%
                  </span>
                );
              },
            },
            {
              field: "dates",
              header: "Period",
              width: 80,
              template: (task) => {
                if (task.type === "milestone") {
                  return (
                    <span style={{ fontSize: "var(--kreati-font-size-xxs)", color: "var(--kreati-text-muted)" }}>
                      {task.start.slice(5)}
                    </span>
                  );
                }
                return (
                  <span style={{ fontSize: "var(--kreati-font-size-xxs)", color: "var(--kreati-text-muted)" }}>
                    {task.start.slice(5)} — {task.end.slice(5)}
                  </span>
                );
              },
            },
          ]}
          tooltipTemplate={(task) => (
            <div>
              <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{task.title}</div>
              {task.type !== "milestone" && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                    <span style={{ color: "var(--kreati-gray-400)" }}>Period</span>
                    <span>{task.start} — {task.end}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                    <span style={{ color: "var(--kreati-gray-400)" }}>Progress</span>
                    <span>{task.progress ?? 0}%</span>
                  </div>
                </>
              )}
              {task.type === "milestone" && (
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                  <span style={{ color: "var(--kreati-gray-400)" }}>Date</span>
                  <span>{task.start}</span>
                </div>
              )}
              {task.data?.assignee ? (
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                  <span style={{ color: "var(--kreati-gray-400)" }}>Assignee</span>
                  <span>{String(task.data.assignee)}</span>
                </div>
              ) : null}
              {task.data?.team ? (
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                  <span style={{ color: "var(--kreati-gray-400)" }}>Team</span>
                  <span>{String(task.data.team)}</span>
                </div>
              ) : null}
              {task.dependencies && task.dependencies.length > 0 && (
                <div style={{ marginTop: "0.25rem", fontSize: "var(--kreati-font-size-xxs)", color: "var(--kreati-gray-500)" }}>
                  Dependencies: {task.dependencies.map((d) => typeof d === "string" ? d : `${d.taskId} (${d.type})`).join(", ")}
                </div>
              )}
            </div>
          )}
        />
      </div>
    );
  },
};

// ─── 15. Context Menu (Edit & Delete) ─────────────────────────────────────────

export const ContextMenuEditDelete: Story = {
  render: () => {
    return (
      <div style={{ height: "550px" }}>
        <Gantt
          defaultTasks={baseTasks}
          columns={["title", "startDate", "endDate", "progress", "options"]}
          showFilter
          showDateRange
          exportFormats={["csv", "json", "svg", "png"]}
          onTaskEdit={(task) => console.log("Saved:", task)}
          onTaskDelete={(id) => console.log("Deleted:", id)}
        />
      </div>
    );
  },
};

// ─── 16. Preset Columns ───────────────────────────────────────────────────────

const assignees: import("@kreatiware/react").GanttAssignee[] = [
  { id: "ana", label: "AB" },
  { id: "carlos", label: "CD" },
  { id: "maria", label: "MR" },
];

const tasksWithAssignees: GanttTask[] = baseTasks.map((t) => ({
  ...t,
  assigneeIds: t.id === "1.1" ? ["ana"] : t.id === "2.1" ? ["carlos", "maria"] : t.id === "2.2" ? ["ana", "carlos"] : undefined,
}));

export const PresetColumns: Story = {
  render: () => (
    <div style={{ height: "550px" }}>
      <Gantt
        defaultTasks={tasksWithAssignees}
        availableAssignees={assignees}
        columns={["title", "assignees", "startDate", "endDate", "duration", "progress", "options"]}
        tableWidth={620}
      />
    </div>
  ),
};

// ─── 17. Custom Edit Slots ────────────────────────────────────────────────────

export const CustomEditSlots: Story = {
  render: () => (
    <div style={{ height: "550px" }}>
      <p style={{ padding: "0 0.75rem", fontSize: "var(--kreati-font-size-sm)", color: "var(--kreati-text-secondary)" }}>
        Edit dialog has a custom slot for a &quot;Notes&quot; field from task.data.
      </p>
      <Gantt
        defaultTasks={baseTasks.map(t => ({ ...t, data: { notes: "" } }))}
        columns={[
          "title", "progress", "options",
          { field: "notes", header: "Notes", width: 120, template: (task) => (
            <span style={{ fontSize: "var(--kreati-font-size-xxs)", color: "var(--kreati-text-muted)" }}>
              {(task.data?.notes as string) || "—"}
            </span>
          )},
        ]}
        editSlots={{
          customSlot: (task, setTask) => (
            <div>
              <label style={{ fontSize: "var(--kreati-font-size-xs)", color: "var(--kreati-text-secondary)", display: "block", marginBottom: "var(--kreati-space-1)" }}>Notes</label>
              <textarea
                value={(task.data?.notes as string) ?? ""}
                onChange={(e) => setTask({ ...task, data: { ...task.data, notes: e.target.value } })}
                rows={2}
                style={{ width: "100%", fontFamily: "var(--kreati-font-family-body)", fontSize: "var(--kreati-font-size-sm)", padding: "var(--kreati-space-2)", borderRadius: "var(--kreati-radius-sm)", border: "1px solid var(--kreati-gray-300)", background: "var(--kreati-surface)" }}
              />
            </div>
          ),
        }}
        onTaskEdit={(task) => console.log("Saved with notes:", task.data?.notes)}
      />
    </div>
  ),
};

// ─── 18. No Context Menu ──────────────────────────────────────────────────────

export const NoContextMenu: Story = {
  args: {
    defaultTasks: baseTasks,
    showRowContextMenu: false,
  },
  render: (args) => (
    <div style={{ height: "500px" }}>
      <p style={{ padding: "0 0.75rem", fontSize: "var(--kreati-font-size-sm)", color: "var(--kreati-text-secondary)" }}>
        Context menu disabled. Click summary rows still toggles expand/collapse.
      </p>
      <Gantt {...args} />
    </div>
  ),
};

// ─── 19. Bar Labels ───────────────────────────────────────────────────────────

export const BarLabels: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h4 style={{ padding: "0 0.75rem", color: "var(--kreati-text-secondary)" }}>Right (default)</h4>
        <div style={{ height: "180px" }}>
          <Gantt defaultTasks={baseTasks.slice(0, 4)} barLabelTemplate={(task) => task.title} />
        </div>
      </div>
      <div>
        <h4 style={{ padding: "0 0.75rem", color: "var(--kreati-text-secondary)" }}>Left</h4>
        <div style={{ height: "180px" }}>
          <Gantt defaultTasks={baseTasks.slice(0, 4)} barLabelTemplate={(task) => task.title} barLabelPosition="left" />
        </div>
      </div>
      <div>
        <h4 style={{ padding: "0 0.75rem", color: "var(--kreati-text-secondary)" }}>Inside (hides progress %)</h4>
        <div style={{ height: "180px" }}>
          <Gantt defaultTasks={baseTasks.slice(0, 4)} barLabelTemplate={(task) => task.title} barLabelPosition="inside" />
        </div>
      </div>
      <div>
        <h4 style={{ padding: "0 0.75rem", color: "var(--kreati-text-secondary)" }}>Top</h4>
        <div style={{ height: "220px" }}>
          <Gantt defaultTasks={baseTasks.slice(0, 4)} barLabelTemplate={(task) => task.title} barLabelPosition="top" rowHeight={50} />
        </div>
      </div>
      <div>
        <h4 style={{ padding: "0 0.75rem", color: "var(--kreati-text-secondary)" }}>Bottom</h4>
        <div style={{ height: "220px" }}>
          <Gantt defaultTasks={baseTasks.slice(0, 4)} barLabelTemplate={(task) => task.title} barLabelPosition="bottom" rowHeight={50} />
        </div>
      </div>
    </div>
  ),
};

// ─── 20. Bar & Row Sizing ─────────────────────────────────────────────────────

export const BarAndRowSizing: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h4 style={{ padding: "0 0.75rem", color: "var(--kreati-text-secondary)" }}>Default (rowHeight=40, barHeight=0.5)</h4>
        <div style={{ height: "200px" }}>
          <Gantt defaultTasks={baseTasks.slice(0, 4)} barLabelTemplate={(t) => t.title} />
        </div>
      </div>
      <div>
        <h4 style={{ padding: "0 0.75rem", color: "var(--kreati-text-secondary)" }}>Tall rows (rowHeight=56, barHeight=0.6)</h4>
        <div style={{ height: "280px" }}>
          <Gantt defaultTasks={baseTasks.slice(0, 4)} rowHeight={56} barHeight={0.6} barLabelTemplate={(t) => t.title} />
        </div>
      </div>
      <div>
        <h4 style={{ padding: "0 0.75rem", color: "var(--kreati-text-secondary)" }}>Compact (rowHeight=28, barHeight=0.7)</h4>
        <div style={{ height: "160px" }}>
          <Gantt defaultTasks={baseTasks.slice(0, 4)} rowHeight={28} barHeight={0.7} barLabelTemplate={(t) => t.title} />
        </div>
      </div>
    </div>
  ),
};

// ─── 21. Toolbar — Full ───────────────────────────────────────────────────────

export const ToolbarFull: Story = {
  render: () => (
    <div style={{ height: "550px" }}>
      <Gantt
        defaultTasks={baseTasks}
        columns={["title", "startDate", "endDate", "progress", "options"]}
        showFilter
        showDateRange
        showNavigator
        showCriticalPath
        showBaseline
        autoSchedule
        exportFormats={["csv", "json", "svg", "png"]}
        onFilterChange={(text) => console.log("Filter:", text)}
      />
    </div>
  ),
};

// ─── 22. Toolbar — Custom Slots ───────────────────────────────────────────────

export const ToolbarCustomSlots: Story = {
  render: () => (
    <div style={{ height: "500px" }}>
      <Gantt
        defaultTasks={baseTasks}
        exportFormats={["csv"]}
        toolbarSlots={{
          leftSlot: <Button size="sm" compact severity="accent" label="+ Add Task" />,
          rightSlot: <Button size="sm" compact severity="info" buttonType="outlined" label="Settings" />,
        }}
      />
    </div>
  ),
};

// ─── 23. Navigator ────────────────────────────────────────────────────────────

export const Navigator: Story = {
  render: () => (
    <div style={{ height: "550px" }}>
      <Gantt defaultTasks={baseTasks} showNavigator />
    </div>
  ),
};

// ─── 24. Critical Path ────────────────────────────────────────────────────────

export const CriticalPath: Story = {
  render: () => (
    <div style={{ height: "550px" }}>
      <Gantt defaultTasks={baseTasks} showCriticalPath showNavigator />
    </div>
  ),
};

// ─── 25. Baseline Comparison ──────────────────────────────────────────────────

const baselineData: GanttTask[] = baseTasks.map(t => ({
  ...t,
  baselineStart: t.start,
  baselineEnd: t.end,
  // Simulate delays
  start: t.id === "2.1" ? "2026-05-15" : t.start,
  end: t.id === "2.1" ? "2026-06-02" : t.id === "2.2" ? "2026-06-06" : t.end,
}));

export const BaselineComparison: Story = {
  render: () => (
    <div style={{ height: "550px" }}>
      <Gantt defaultTasks={baselineData} showBaseline showNavigator />
    </div>
  ),
};

// ─── 26. Auto-schedule ────────────────────────────────────────────────────────

export const AutoSchedule: Story = {
  render: () => (
    <div style={{ height: "550px" }}>
      <p style={{ padding: "0 0.75rem", fontSize: "var(--kreati-font-size-sm)", color: "var(--kreati-text-secondary)" }}>
        Drag a task bar to see dependent tasks auto-adjust.
      </p>
      <Gantt defaultTasks={baseTasks} autoSchedule showNavigator />
    </div>
  ),
};

// ─── 27. Create Task & Collapsible Table ──────────────────────────────────────

export const CreateTaskAndCollapse: Story = {
  render: () => (
    <div style={{ height: "550px" }}>
      <p style={{ padding: "0 0.75rem", fontSize: "var(--kreati-font-size-sm)", color: "var(--kreati-text-secondary)" }}>
        Right-click for &quot;Add Task&quot;. Click &quot;+&quot; at bottom to add a group. Collapse table with the arrow button.
      </p>
      <Gantt
        defaultTasks={baseTasks}
        columns={["title", "startDate", "progress", "options"]}
        showNavigator
        onTaskCreate={(task) => console.log("Created:", task)}
      />
    </div>
  ),
};

// ─── 28. Full Featured ────────────────────────────────────────────────────────

export const FullFeatured: Story = {
  render: () => (
    <div style={{ height: "650px" }}>
      <Gantt
        defaultTasks={baselineData}
        columns={["title", "startDate", "endDate", "duration", "progress", "options"]}
        showNavigator
        showCriticalPath
        showBaseline
        autoSchedule
        showFilter
        barLabelTemplate={(task) => task.title}
        barLabelPosition="inside"
        showDateRange
        exportFormats={["csv", "json", "svg", "png"]}
        onTaskEdit={(task) => console.log("Saved:", task)}
        onTaskDelete={(id) => console.log("Deleted:", id)}
        onTaskCreate={(task) => console.log("Created:", task)}
      />
    </div>
  ),
};


// ─── 29. Vertical Scroll (Many Tasks) ────────────────────────────────────────

const manyTasks: GanttTask[] = Array.from({ length: 30 }, (_, i) => ({
  id: `t${i}`,
  title: `Task ${i + 1}`,
  start: `2026-05-${String(1 + (i % 20)).padStart(2, "0")}`,
  end: `2026-05-${String(5 + (i % 20)).padStart(2, "0")}`,
  progress: Math.round(Math.random() * 100),
  severity: (["primary", "success", "info", "warning", "danger", "accent", "help"] as const)[i % 7],
}));

export const VerticalScroll: Story = {
  render: () => (
    <Gantt
      defaultTasks={manyTasks}
      maxHeight="400px"
      columns={["title", "progress"]}
    />
  ),
};

// ─── 30. Fixed Dimensions ─────────────────────────────────────────────────────

export const FixedDimensions: Story = {
  render: () => (
      <Gantt
        defaultTasks={baseTasks}
        width="800px"
        height="350px"
        columns={["title", "startDate"]}
      />
  ),
};

// ─── 31. Milestone Flags ──────────────────────────────────────────────────────

export const MilestoneFlags: Story = {
  render: () => (
    <Gantt
      defaultTasks={baseTasks}
      showMilestoneFlags
      height="500px"
      columns={["title", "startDate", "progress"]}
    />
  ),
};
