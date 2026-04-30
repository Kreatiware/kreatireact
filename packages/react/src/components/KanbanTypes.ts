import React from "react";

/** Severity type for column accent colors */
export type KanbanSeverity =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "help"
  | "danger"
  | "accent";

/** Assignee option for the board */
export interface KanbanAssignee {
  id: string;
  image?: string;
  label?: string;
  alt?: string;
}

/** Tag option for the board */
export interface KanbanTag {
  id: string;
  label: string;
  severity?: KanbanSeverity;
}

/** Single checklist item */
export interface KanbanChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

/** A single card in the Kanban board */
export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  tagIds?: string[];
  assigneeIds?: string[];
  priority?: "low" | "medium" | "high" | "critical";
  dueDate?: string;
  checklist?: KanbanChecklistItem[];
  cover?: string;
  /** Swimlane id this card belongs to (when swimlanes are enabled) */
  swimlaneId?: string;
  /** Arbitrary user data attached to the card */
  data?: Record<string, unknown>;
  className?: string;
  style?: React.CSSProperties;
}

/** A column in the Kanban board */
export interface KanbanColumn {
  id: string;
  title: string;
  severity?: KanbanSeverity;
  maxCards?: number;
  /** Whether the column is collapsed (minimal view) */
  collapsed?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** Event payload when a card is moved */
export interface KanbanMoveEvent {
  cardId: string;
  fromColumnId: string;
  toColumnId: string;
  newIndex: number;
}

/** Swimlane row for horizontal grouping */
export interface KanbanSwimlane {
  /** Unique identifier */
  id: string;
  /** Swimlane label */
  title: string;
  /** Severity color for the swimlane header */
  severity?: KanbanSeverity;
  /** Whether the swimlane is collapsed */
  collapsed?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** Full card data passed to callbacks */
export interface KanbanCardData {
  title: string;
  description: string;
  priority: string;
  tagIds: string[];
  assigneeIds: string[];
  dueDate: string;
  checklist: KanbanChecklistItem[];
  data: Record<string, unknown>;
}

/** Slot render props for card sections in the Dialog */
export interface KanbanCardSlots {
  tagsSlot?: (
    tagIds: string[],
    setTagIds: (ids: string[]) => void,
    availableTags: KanbanTag[]
  ) => React.ReactNode;
  assigneesSlot?: (
    assigneeIds: string[],
    setAssigneeIds: (ids: string[]) => void,
    availableAssignees: KanbanAssignee[]
  ) => React.ReactNode;
  checklistSlot?: (
    items: KanbanChecklistItem[],
    setItems: (items: KanbanChecklistItem[]) => void
  ) => React.ReactNode;
  dueDateSlot?: (
    dueDate: string,
    setDueDate: (d: string) => void
  ) => React.ReactNode;
  coverSlot?: (
    cover: string,
    setCover: (url: string) => void
  ) => React.ReactNode;
  /** Additional custom section in the Dialog form. Receives card data object and setter. */
  customSlot?: (
    data: Record<string, unknown>,
    setData: (data: Record<string, unknown>) => void
  ) => React.ReactNode;
  /** Additional content rendered at the bottom of the default card layout (not the Dialog) */
  cardExtraSlot?: (card: KanbanCard, columnId: string) => React.ReactNode;
}

export interface KanbanProps {
  // ─── Columns ────────────────────────────────────────────────────────
  /** Initial columns (uncontrolled). The Kanban manages its own state. */
  defaultColumns?: KanbanColumn[];
  /** Columns (controlled). You must update this in response to callbacks. */
  columns?: KanbanColumn[];

  // ─── Uncontrolled mode ──────────────────────────────────────────────
  /** Initial cards (uncontrolled). The Kanban manages its own state. */
  defaultCards?: KanbanCard[];
  /** Initial card order (uncontrolled). Map of column id to card id array. */
  defaultCardOrder?: Record<string, string[]>;

  // ─── Controlled mode ────────────────────────────────────────────────
  /** Cards (controlled). You must update this in response to callbacks. */
  cards?: KanbanCard[];
  /** Card order (controlled). You must update this in response to callbacks. */
  cardOrder?: Record<string, string[]>;

  // ─── Data sources ───────────────────────────────────────────────────
  /** Available tags for the MultiSelect in the Dialog */
  availableTags?: KanbanTag[];
  /** Available assignees for the MultiSelect in the Dialog */
  availableAssignees?: KanbanAssignee[];
  /** Swimlane definitions for horizontal grouping. Cards are grouped by swimlaneId. */
  swimlanes?: KanbanSwimlane[];

  // ─── Callbacks (optional — for syncing with backend) ────────────────
  /** Fires after a card is moved */
  onCardMove?: (event: KanbanMoveEvent) => void;
  /** Fires after a card is created via the built-in Dialog */
  onCardCreate?: (card: KanbanCard, columnId: string) => void;
  /** Fires after a card is updated via the built-in Dialog */
  onCardUpdate?: (card: KanbanCard) => void;
  /** Fires after a card is deleted */
  onCardDelete?: (cardId: string, columnId: string) => void;
  /** Fires when a card is clicked. Overrides the built-in Dialog. */
  onCardClick?: (card: KanbanCard, columnId: string) => void;
  /** Fires when a drop is rejected due to WIP limit */
  onWipExceeded?: (columnId: string, maxCards: number) => void;

  // ─── Column callbacks ───────────────────────────────────────────────
  /** Fires after a column is created */
  onColumnCreate?: (column: KanbanColumn) => void;
  /** Fires after a column is renamed */
  onColumnUpdate?: (column: KanbanColumn) => void;
  /** Fires after a column is deleted */
  onColumnDelete?: (columnId: string) => void;
  /** Fires after a column is reordered */
  onColumnMove?: (columnId: string, newIndex: number) => void;

  // ─── Visual options ─────────────────────────────────────────────────
  /** Enable column management: rename, add, delete, reorder (default: true) */
  columnManagement?: boolean;
  /** Enable card management: add, edit, delete, duplicate (default: true) */
  cardManagement?: boolean;
  /** Position of the priority indicator: "top" (default), "left", "none" */
  priorityIndicator?: "top" | "left" | "none";
  /** Show inline input for adding cards instead of opening the Dialog */
  inlineAdd?: boolean;

  // ─── Templates & Slots ──────────────────────────────────────────────
  /** Custom render for a card */
  cardTemplate?: (card: KanbanCard, columnId: string) => React.ReactNode;
  /** Custom render for a column header */
  columnHeaderTemplate?: (
    column: KanbanColumn,
    cardCount: number
  ) => React.ReactNode;
  /** Custom render for a column footer */
  columnFooterTemplate?: (
    column: KanbanColumn,
    cardCount: number
  ) => React.ReactNode;
  /** Custom render for the card detail Dialog content */
  cardDetailTemplate?: (
    card: KanbanCard,
    columnId: string,
    close: () => void
  ) => React.ReactNode;
  /** Custom render for the create card Dialog content */
  cardCreateTemplate?: (columnId: string, close: () => void) => React.ReactNode;
  /** Slot overrides for sections in the card Dialog form */
  slots?: KanbanCardSlots;

  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}
