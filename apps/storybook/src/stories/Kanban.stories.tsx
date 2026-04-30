import React, { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Kanban, ToastContainer, Input, KreatiProvider } from "@kreatiware/react";
import type {
  KanbanCard,
  KanbanColumn,
  KanbanTag,
  KanbanAssignee,
  KanbanSwimlane,
  ToastContainerRef,
} from "@kreatiware/react";

const meta = {
  title: "Components/Kanban",
  component: Kanban,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof Kanban>;

export default meta;
type Story = StoryObj<typeof Kanban>;

// ─── Shared Data ──────────────────────────────────────────────────────────────

const tags: KanbanTag[] = [
  { id: "design", label: "Design", severity: "help" },
  { id: "foundation", label: "Foundation", severity: "primary" },
  { id: "component", label: "Component", severity: "info" },
  { id: "infra", label: "Infra", severity: "danger" },
  { id: "docs", label: "Docs", severity: "success" },
  { id: "a11y", label: "A11y", severity: "warning" },
  { id: "qa", label: "QA", severity: "secondary" },
];

const assignees: KanbanAssignee[] = [
  { id: "ab", label: "AB" },
  { id: "cd", label: "CD" },
  { id: "ef", label: "EF" },
  { id: "gh", label: "GH" },
  { id: "ij", label: "IJ" },
];

const columns: KanbanColumn[] = [
  { id: "backlog", title: "Backlog", severity: "secondary" },
  { id: "todo", title: "To Do", severity: "info" },
  { id: "doing", title: "In Progress", severity: "warning", maxCards: 3 },
  { id: "review", title: "Review", severity: "help" },
  { id: "done", title: "Done", severity: "success" },
];

const cards: KanbanCard[] = [
  { id: "1", title: "Design system tokens", description: "Define color, spacing, and typography tokens", tagIds: ["design", "foundation"], priority: "high", assigneeIds: ["ab", "cd"], dueDate: "2026-05-02", checklist: [{ id: "c1", label: "Color tokens", checked: true }, { id: "c2", label: "Spacing tokens", checked: true }, { id: "c3", label: "Typography tokens", checked: true }, { id: "c4", label: "Shadow tokens", checked: false }, { id: "c5", label: "Z-index tokens", checked: false }] },
  { id: "2", title: "Button component", description: "Create Button with all variants", tagIds: ["component"], priority: "medium", assigneeIds: ["cd"] },
  { id: "3", title: "Input component", tagIds: ["component"], priority: "medium", checklist: [{ id: "c6", label: "Text input", checked: true }, { id: "c7", label: "Password toggle", checked: true }, { id: "c8", label: "Number stepper", checked: true }] },
  { id: "4", title: "Set up CI/CD", description: "GitHub Actions", tagIds: ["infra"], priority: "critical", assigneeIds: ["ef"], dueDate: "2026-04-30" },
  { id: "5", title: "Write documentation", tagIds: ["docs"], priority: "low" },
  { id: "6", title: "Accessibility audit", description: "WCAG 2.1 AA check", tagIds: ["a11y", "qa"], priority: "high", assigneeIds: ["gh", "ij"] },
  { id: "7", title: "Theme system", tagIds: ["design"], priority: "medium" },
  { id: "8", title: "Storybook setup", tagIds: ["infra"], priority: "low", assigneeIds: ["ij"] },
];

const order: Record<string, string[]> = {
  backlog: ["5", "7", "8"],
  todo: ["3"],
  doing: ["1", "2", "4"],
  review: ["6"],
  done: [],
};

// ─── Stories ──────────────────────────────────────────────────────────────────

/** Full-featured uncontrolled board. Click card to view, pencil to edit, right-click for context menu. */
export const Default: Story = {
  render: () => (
    <Kanban
      defaultColumns={columns}
      defaultCards={cards}
      defaultCardOrder={order}
      availableTags={tags}
      availableAssignees={assignees}
    />
  ),
};

/** With backend sync — logs all operations to console */
export const WithCallbacks: Story = {
  render: () => (
    <Kanban
      defaultColumns={columns}
      defaultCards={cards}
      defaultCardOrder={order}
      availableTags={tags}
      availableAssignees={assignees}
      onCardMove={(e) => console.log("move", e)}
      onCardCreate={(card, colId) => console.log("create", card, colId)}
      onCardUpdate={(card) => console.log("update", card)}
      onCardDelete={(id, colId) => console.log("delete", id, colId)}
      onColumnCreate={(col) => console.log("col create", col)}
      onColumnUpdate={(col) => console.log("col update", col)}
      onColumnDelete={(id) => console.log("col delete", id)}
    />
  ),
};

/** WIP limit with Toast feedback */
export const WipLimitWithToast: Story = {
  render: () => {
    const toastRef = useRef<ToastContainerRef>(null);
    return (
      <>
        <ToastContainer ref={toastRef} position="top-right" />
        <Kanban
          defaultColumns={[
            { id: "todo", title: "To Do" },
            { id: "doing", title: "In Progress", severity: "warning", maxCards: 2 },
            { id: "done", title: "Done", severity: "success" },
          ]}
          defaultCards={[{ id: "a", title: "Task A" }, { id: "b", title: "Task B" }, { id: "c", title: "Task C" }, { id: "d", title: "Task D" }]}
          defaultCardOrder={{ todo: ["a", "d"], doing: ["b", "c"], done: [] }}
          onWipExceeded={(_colId, max) => {
            toastRef.current?.show({ severity: "warning", summary: "WIP limit reached", detail: `Limited to ${max} cards`, life: 3000, icon: true });
          }}
        />
      </>
    );
  },
};

/** Swimlanes — cards grouped by team */
export const Swimlanes: Story = {
  render: () => {
    const swimlanes: KanbanSwimlane[] = [
      { id: "frontend", title: "Frontend Team", severity: "info" },
      { id: "backend", title: "Backend Team", severity: "success" },
      { id: "devops", title: "DevOps", severity: "danger", collapsed: true },
    ];
    const swimCards: KanbanCard[] = [
      { id: "s1", title: "Button component", swimlaneId: "frontend", tagIds: ["component"], priority: "high", assigneeIds: ["ab"] },
      { id: "s2", title: "Input component", swimlaneId: "frontend", tagIds: ["component"], priority: "medium" },
      { id: "s3", title: "REST API", swimlaneId: "backend", tagIds: ["infra"], priority: "high", assigneeIds: ["ef"] },
      { id: "s4", title: "Database schema", swimlaneId: "backend", tagIds: ["infra"], priority: "critical" },
      { id: "s5", title: "CI pipeline", swimlaneId: "devops", tagIds: ["infra"], priority: "medium", assigneeIds: ["ij"] },
      { id: "s6", title: "Docker setup", swimlaneId: "devops", tagIds: ["infra"], priority: "low" },
    ];
    const cols: KanbanColumn[] = [
      { id: "todo", title: "To Do", severity: "info" },
      { id: "doing", title: "In Progress", severity: "warning" },
      { id: "done", title: "Done", severity: "success", collapsed: true },
    ];
    return (
      <Kanban
        defaultColumns={cols}
        defaultCards={swimCards}
        defaultCardOrder={{ todo: ["s1", "s3", "s5"], doing: ["s2", "s4"], done: ["s6"] }}
        swimlanes={swimlanes}
        availableTags={tags}
        availableAssignees={assignees}
      />
    );
  },
};

/** Collapsed columns — minimal view preserving severity colors */
export const CollapsedColumns: Story = {
  render: () => (
    <Kanban
      defaultColumns={[
        { id: "backlog", title: "Backlog", severity: "secondary", collapsed: true },
        { id: "todo", title: "To Do", severity: "info" },
        { id: "doing", title: "In Progress", severity: "warning" },
        { id: "done", title: "Done", severity: "success", collapsed: true },
      ]}
      defaultCards={[{ id: "a", title: "Task A" }, { id: "b", title: "Task B" }, { id: "c", title: "Task C" }]}
      defaultCardOrder={{ backlog: [], todo: ["a"], doing: ["b", "c"], done: [] }}
    />
  ),
};

/** Priority indicator on the left edge */
export const PriorityLeft: Story = {
  render: () => (
    <Kanban
      defaultColumns={[{ id: "col", title: "Priorities" }]}
      defaultCards={[
        { id: "1", title: "Low", priority: "low" },
        { id: "2", title: "Medium", priority: "medium" },
        { id: "3", title: "High", priority: "high" },
        { id: "4", title: "Critical", priority: "critical" },
      ]}
      defaultCardOrder={{ col: ["1", "2", "3", "4"] }}
      priorityIndicator="left"
      columnManagement={false}
    />
  ),
};

/** Cover images on cards */
export const WithCovers: Story = {
  render: () => (
    <Kanban
      defaultColumns={[
        { id: "design", title: "Design", severity: "help" },
        { id: "dev", title: "Development", severity: "info" },
      ]}
      defaultCards={[
        { id: "1", title: "Landing page", cover: "https://picsum.photos/seed/k1/400/200", tagIds: ["design"], assigneeIds: ["ab"] },
        { id: "2", title: "Dashboard", cover: "https://picsum.photos/seed/k2/400/200", tagIds: ["design"] },
        { id: "3", title: "API integration", tagIds: ["infra"], checklist: [{ id: "x1", label: "Auth", checked: true }, { id: "x2", label: "CRUD", checked: false }] },
      ]}
      defaultCardOrder={{ design: ["1", "2"], dev: ["3"] }}
      availableTags={tags}
      availableAssignees={assignees}
    />
  ),
};

/** Inline add with text input */
export const InlineAdd: Story = {
  render: () => (
    <Kanban
      defaultColumns={[{ id: "todo", title: "To Do" }, { id: "doing", title: "Doing" }, { id: "done", title: "Done" }]}
      defaultCards={[{ id: "1", title: "Existing task" }]}
      defaultCardOrder={{ todo: ["1"], doing: [], done: [] }}
      inlineAdd
    />
  ),
};

/** Custom slots — story points in card and form, suppressed checklist/dueDate */
export const CustomSlots: Story = {
  render: () => (
    <Kanban
      defaultColumns={[{ id: "todo", title: "To Do" }, { id: "done", title: "Done" }]}
      defaultCards={[
        { id: "1", title: "Task with custom data", data: { points: 5, sprint: "Sprint 3" }, tagIds: ["design"], priority: "high" },
        { id: "2", title: "Another task", data: { points: 13, sprint: "Sprint 3" }, tagIds: ["component"] },
        { id: "3", title: "Small fix", data: { points: 1, sprint: "Sprint 4" } },
      ]}
      defaultCardOrder={{ todo: ["1", "2"], done: ["3"] }}
      availableTags={tags}
      slots={{
        cardExtraSlot: (card) => (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--kreati-font-size-xxs)", color: "var(--kreati-text-muted)", borderTop: "1px solid var(--kreati-gray-200)", paddingTop: "var(--kreati-space-1)", marginTop: "var(--kreati-space-1)" }}>
            <span>{(card.data as Record<string, unknown>)?.sprint as string}</span>
            <span style={{ fontWeight: 600 }}>{(card.data as Record<string, unknown>)?.points as number} pts</span>
          </div>
        ),
        customSlot: (data, setData) => (
          <div style={{ display: "flex", gap: "var(--kreati-space-3)" }}>
            <Input
              label="Story Points"
              type="number"
              value={String(data.points ?? "")}
              onChange={(e) => setData({ ...data, points: Number((e as React.ChangeEvent<HTMLInputElement>).target.value) })}
              size="sm"
            />
            <Input
              label="Sprint"
              value={String(data.sprint ?? "")}
              onChange={(e) => setData({ ...data, sprint: (e as React.ChangeEvent<HTMLInputElement>).target.value })}
              size="sm"
            />
          </div>
        ),
        checklistSlot: () => null,
      }}
    />
  ),
};

/** Column management disabled */
export const ReadOnlyColumns: Story = {
  render: () => (
    <Kanban
      defaultColumns={columns.slice(0, 3)}
      defaultCards={cards.slice(0, 4)}
      defaultCardOrder={{ backlog: ["1"], todo: ["2", "3"], doing: ["4"] }}
      availableTags={tags}
      availableAssignees={assignees}
      columnManagement={false}
    />
  ),
};

/** Card management disabled — view only, no add/edit/delete/context menu */
export const ReadOnlyCards: Story = {
  render: () => (
    <Kanban
      defaultColumns={columns.slice(0, 3)}
      defaultCards={cards.slice(0, 4)}
      defaultCardOrder={{ backlog: ["1"], todo: ["2", "3"], doing: ["4"] }}
      availableTags={tags}
      availableAssignees={assignees}
      cardManagement={false}
    />
  ),
};

/** Card extra slot — renders custom content at the bottom of each card + custom form field */
export const CardExtraSlot: Story = {
  render: () => (
    <Kanban
      defaultColumns={[{ id: "todo", title: "To Do" }, { id: "done", title: "Done" }]}
      defaultCards={[
        { id: "1", title: "Design tokens", data: { points: 5, sprint: "Sprint 3" }, tagIds: ["design"], priority: "high", assigneeIds: ["ab"] },
        { id: "2", title: "Button component", data: { points: 8, sprint: "Sprint 3" }, tagIds: ["component"], checklist: [{ id: "c1", label: "Filled", checked: true }, { id: "c2", label: "Outlined", checked: false }] },
        { id: "3", title: "Write docs", data: { points: 2, sprint: "Sprint 4" }, tagIds: ["docs"], priority: "low", dueDate: "2026-05-15" },
      ]}
      defaultCardOrder={{ todo: ["1", "2"], done: ["3"] }}
      availableTags={tags}
      availableAssignees={assignees}
      slots={{
        cardExtraSlot: (card) => (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--kreati-font-size-xxs)", color: "var(--kreati-text-muted)", borderTop: "1px solid var(--kreati-gray-200)", paddingTop: "var(--kreati-space-1)", marginTop: "var(--kreati-space-1)" }}>
            <span>{(card.data as Record<string, unknown>)?.sprint as string}</span>
            <span style={{ fontWeight: 600 }}>{(card.data as Record<string, unknown>)?.points as number} pts</span>
          </div>
        ),
        customSlot: (data, setData) => (
          <div style={{ display: "flex", gap: "var(--kreati-space-3)" }}>
            <Input
              label="Story Points"
              type="number"
              value={String(data.points ?? "")}
              onChange={(e) => setData({ ...data, points: Number((e as React.ChangeEvent<HTMLInputElement>).target.value) })}
              size="sm"
            />
            <Input
              label="Sprint"
              value={String(data.sprint ?? "")}
              onChange={(e) => setData({ ...data, sprint: (e as React.ChangeEvent<HTMLInputElement>).target.value })}
              size="sm"
            />
          </div>
        ),
      }}
    />
  ),
};

/** Full customized — all features combined */
export const FullCustomized: Story = {
  render: () => {
    const swimlanes: KanbanSwimlane[] = [
      { id: "frontend", title: "Frontend", severity: "info" },
      { id: "backend", title: "Backend", severity: "success" },
    ];
    const allCards: KanbanCard[] = [
      { id: "f1", title: "Button variants", swimlaneId: "frontend", tagIds: ["component"], priority: "high", assigneeIds: ["ab"], checklist: [{ id: "c1", label: "Filled", checked: true }, { id: "c2", label: "Outlined", checked: true }, { id: "c3", label: "Text", checked: false }], data: { points: 5 } },
      { id: "f2", title: "Input validation", swimlaneId: "frontend", tagIds: ["component", "a11y"], priority: "medium", assigneeIds: ["cd"], dueDate: "2026-05-10", data: { points: 8 } },
      { id: "f3", title: "Theme switcher", swimlaneId: "frontend", tagIds: ["design"], priority: "low", data: { points: 3 } },
      { id: "b1", title: "Auth API", swimlaneId: "backend", tagIds: ["infra"], priority: "critical", assigneeIds: ["ef"], dueDate: "2026-05-01", data: { points: 13 } },
      { id: "b2", title: "Database migration", swimlaneId: "backend", tagIds: ["infra"], priority: "high", assigneeIds: ["gh", "ij"], data: { points: 8 } },
    ];
    const cols: KanbanColumn[] = [
      { id: "todo", title: "To Do", severity: "info" },
      { id: "doing", title: "In Progress", severity: "warning", maxCards: 3 },
      { id: "review", title: "Review", severity: "help" },
      { id: "done", title: "Done", severity: "success", collapsed: true },
    ];
    return (
      <Kanban
        defaultColumns={cols}
        defaultCards={allCards}
        defaultCardOrder={{ todo: ["f1", "b1"], doing: ["f2", "b2"], review: ["f3"], done: [] }}
        swimlanes={swimlanes}
        availableTags={tags}
        availableAssignees={assignees}
        priorityIndicator="left"
        onCardMove={(e) => console.log("move", e)}
        onCardUpdate={(c) => console.log("update", c)}
        onCardCreate={(c, col) => console.log("create", c, col)}
        onCardDelete={(id, col) => console.log("delete", id, col)}
        onColumnCreate={(col) => console.log("col create", col)}
        onColumnUpdate={(col) => console.log("col update", col)}
        slots={{
          cardExtraSlot: (card) => (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--kreati-font-size-xxs)", color: "var(--kreati-text-muted)", borderTop: "1px solid var(--kreati-gray-200)", paddingTop: "var(--kreati-space-1)", marginTop: "var(--kreati-space-1)" }}>
              <span>Sprint 3</span>
              <span style={{ fontWeight: 600 }}>{(card.data as Record<string, unknown>)?.points as number} pts</span>
            </div>
          ),
          customSlot: (data, setData) => (
            <Input
              label="Story Points"
              type="number"
              value={String(data.points ?? "")}
              onChange={(e) => setData({ ...data, points: Number((e as React.ChangeEvent<HTMLInputElement>).target.value) })}
              size="sm"
            />
          ),
        }}
      />
    );
  },
};

/** Minimal — no tags, no assignees, no extras */
export const Minimal: Story = {
  render: () => (
    <Kanban
      defaultColumns={[{ id: "todo", title: "To Do" }, { id: "doing", title: "Doing" }, { id: "done", title: "Done" }]}
      defaultCards={[{ id: "a", title: "Task A" }, { id: "b", title: "Task B" }, { id: "c", title: "Task C" }]}
      defaultCardOrder={{ todo: ["a", "b"], doing: ["c"], done: [] }}
      columnManagement={false}
    />
  ),
};

/** All severity colors */
export const SeverityColors: Story = {
  render: () => (
    <Kanban
      defaultColumns={["primary", "info", "success", "warning", "danger", "help", "accent"].map((s) => ({ id: s, title: s.charAt(0).toUpperCase() + s.slice(1), severity: s as KanbanColumn["severity"] }))}
      defaultCards={["a", "b", "c", "d", "e", "f", "g"].map((id) => ({ id, title: `Card ${id.toUpperCase()}` }))}
      defaultCardOrder={{ primary: ["a"], info: ["b"], success: ["c"], warning: ["d"], danger: ["e"], help: ["f"], accent: ["g"] }}
      columnManagement={false}
    />
  ),
};

/** Kreati theme — uses KreatiProvider so portals (Dialog) also get the theme */
export const KreatiTheme: Story = {
  render: () => (
    <KreatiProvider theme="kreati">
      <Kanban
        defaultColumns={columns}
        defaultCards={cards}
        defaultCardOrder={order}
        availableTags={tags}
        availableAssignees={assignees}
      />
    </KreatiProvider>
  ),
};
