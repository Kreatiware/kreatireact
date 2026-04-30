import React, {
  forwardRef,
  useRef,
  useImperativeHandle,
  useState,
  useCallback,
} from "react";
import { Button } from "./Button";
import { Tag } from "./Tag";
import { Avatar } from "./Avatar";
import { AvatarGroup } from "./AvatarGroup";
import { ProgressBar } from "./ProgressBar";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { Select } from "./Select";
import { MultiSelect } from "./MultiSelect";
import { Checkbox } from "./Checkbox";
import { Calendar } from "./Calendar";
import { Dialog } from "./Dialog";
import { ContextMenu } from "./ContextMenu";
import {
  PLUS_PATH,
  TRASH_PATH,
  COPY_PATH,
  CHEVRON_RIGHT_PATH,
  CHEVRON_LEFT_PATH,
  CHEVRON_DOWN_PATH,
  CHEVRON_UP_PATH,
  PENCIL_PATH,
  TIMES_PATH,
} from "./iconPaths";
import { sanitizeUrl } from "./sanitizeUrl";
import { useKreatiLocale } from "../locale";
import "./Kanban.css";

export type {
  KanbanSeverity,
  KanbanAssignee,
  KanbanTag,
  KanbanChecklistItem,
  KanbanCard,
  KanbanColumn,
  KanbanSwimlane,
  KanbanMoveEvent,
  KanbanCardData,
  KanbanCardSlots,
  KanbanProps,
} from "./KanbanTypes";

import type {
  KanbanAssignee,
  KanbanTag,
  KanbanChecklistItem,
  KanbanCard,
  KanbanColumn,
  KanbanSwimlane,
  KanbanMoveEvent,
  KanbanCardData,
  KanbanProps,
} from "./KanbanTypes";

let kanbanCardCounter = 0;
const genId = () => `k-card-${++kanbanCardCounter}-${Date.now()}`;

/**
 * Kanban board component for task management and workflow visualization.
 *
 * @description Renders a horizontal board with draggable cards organized in columns.
 * Supports uncontrolled mode (manages its own state via defaultCards/defaultCardOrder)
 * and controlled mode (cards/cardOrder props). All mutations happen internally first,
 * then optional callbacks fire for backend sync. Uses internal Kreati components:
 * Tag, Avatar, AvatarGroup, ProgressBar, Input, Textarea, Select, MultiSelect,
 * Checkbox, Button, and Dialog.
 *
 * @example
 * ```tsx
 * // Uncontrolled — works out of the box
 * <Kanban
 *   columns={columns}
 *   defaultCards={cards}
 *   defaultCardOrder={order}
 *   availableTags={tags}
 *   availableAssignees={people}
 * />
 *
 * // With backend sync
 * <Kanban
 *   columns={columns}
 *   defaultCards={cards}
 *   defaultCardOrder={order}
 *   onCardUpdate={(card) => api.save(card)}
 *   onCardMove={(e) => api.move(e)}
 * />
 * ```
 */
export const Kanban = forwardRef<HTMLDivElement, KanbanProps>(
  (
    {
      defaultColumns,
      columns: controlledColumns,
      defaultCards,
      defaultCardOrder,
      cards: controlledCards,
      cardOrder: controlledOrder,
      availableTags = [],
      availableAssignees = [],
      swimlanes,
      onCardMove,
      onCardCreate,
      onCardUpdate,
      onCardDelete,
      onCardClick,
      onWipExceeded,
      onColumnCreate,
      onColumnUpdate,
      onColumnDelete,
      onColumnMove,
      columnManagement = true,
      cardManagement = true,
      priorityIndicator = "top",
      inlineAdd = false,
      cardTemplate,
      columnHeaderTemplate,
      columnFooterTemplate,
      cardDetailTemplate,
      cardCreateTemplate,
      slots = {},
      className = "",
      style,
    },
    ref
  ) => {
    const elRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => elRef.current as HTMLDivElement);
    const locale = useKreatiLocale();

    // ─── Controlled vs Uncontrolled — Columns ─────────────────────────
    const isColumnsControlled = controlledColumns !== undefined;
    const [internalColumns, setInternalColumns] = useState<KanbanColumn[]>(
      () => defaultColumns ?? []
    );
    const columns = isColumnsControlled ? controlledColumns! : internalColumns;

    const updateColumns = useCallback(
      (fn: (prev: KanbanColumn[]) => KanbanColumn[]) => {
        if (!isColumnsControlled) setInternalColumns(fn);
      },
      [isColumnsControlled]
    );

    // ─── Controlled vs Uncontrolled — Cards ───────────────────────────
    const isControlled = controlledCards !== undefined;
    const [internalCards, setInternalCards] = useState<KanbanCard[]>(
      () => defaultCards ?? []
    );
    const [internalOrder, setInternalOrder] = useState<
      Record<string, string[]>
    >(() => defaultCardOrder ?? {});

    const cards = isControlled ? controlledCards! : internalCards;
    const cardOrder = isControlled ? (controlledOrder ?? {}) : internalOrder;

    const cardMap = React.useMemo(() => {
      const m = new Map<string, KanbanCard>();
      for (const c of cards) m.set(c.id, c);
      return m;
    }, [cards]);

    // ─── Internal Mutators ──────────────────────────────────────────────
    const updateCards = useCallback(
      (fn: (prev: KanbanCard[]) => KanbanCard[]) => {
        if (!isControlled) setInternalCards(fn);
      },
      [isControlled]
    );

    const updateOrder = useCallback(
      (fn: (prev: Record<string, string[]>) => Record<string, string[]>) => {
        if (!isControlled) setInternalOrder(fn);
      },
      [isControlled]
    );

    // ─── Drag State ─────────────────────────────────────────────────────
    const [dragCardId, setDragCardId] = useState<string | null>(null);
    const [dragOverCol, setDragOverCol] = useState<string | null>(null);
    const [dropIndex, setDropIndex] = useState(-1);
    const dragSourceCol = useRef<string | null>(null);
    const didDrag = useRef(false);
    const dragColId = useRef<string | null>(null);

    // ─── Keyboard DnD ───────────────────────────────────────────────────
    const [grabbedCardId, setGrabbedCardId] = useState<string | null>(null);
    const [liveMessage, setLiveMessage] = useState("");

    // ─── Inline Add ─────────────────────────────────────────────────────
    const [addingInCol, setAddingInCol] = useState<string | null>(null);
    const [addTitle, setAddTitle] = useState("");
    const addInputRef = useRef<HTMLInputElement>(null);
    React.useEffect(() => {
      if (addingInCol) addInputRef.current?.focus();
    }, [addingInCol]);

    // ─── Dialog State ───────────────────────────────────────────────────
    const [detailCard, setDetailCard] = useState<{
      card: KanbanCard;
      columnId: string;
    } | null>(null);
    const [dialogEditing, setDialogEditing] = useState(false);
    const [createColumnId, setCreateColumnId] = useState<string | null>(null);
    const createSwimlaneId = useRef<string | undefined>(undefined);
    const [confirmDeleteCard, setConfirmDeleteCard] = useState<{
      cardId: string;
      columnId: string;
    } | null>(null);

    // Form fields
    const [formTitle, setFormTitle] = useState("");
    const [formDescription, setFormDescription] = useState("");
    const [formPriority, setFormPriority] = useState("");
    const [formTagIds, setFormTagIds] = useState<Array<string | number>>([]);
    const [formAssigneeIds, setFormAssigneeIds] = useState<
      Array<string | number>
    >([]);
    const [formDueDate, setFormDueDate] = useState("");
    const [formChecklist, setFormChecklist] = useState<KanbanChecklistItem[]>(
      []
    );
    const [newChecklistLabel, setNewChecklistLabel] = useState("");
    const [formData, setFormData] = useState<Record<string, unknown>>({});
    const [formCover, setFormCover] = useState("");

    const priorityOptions = React.useMemo(
      () => [
        { value: "", label: locale.kanban.noPriority },
        { value: "low", label: locale.kanban.priorityLow },
        { value: "medium", label: locale.kanban.priorityMedium },
        { value: "high", label: locale.kanban.priorityHigh },
        { value: "critical", label: locale.kanban.priorityCritical },
      ],
      [locale.kanban]
    );

    const tagOptions = React.useMemo(
      () => availableTags.map(t => ({ value: t.id, label: t.label })),
      [availableTags]
    );
    const assigneeOptions = React.useMemo(
      () =>
        availableAssignees.map(a => ({
          value: a.id,
          label: a.label || a.alt || a.id,
        })),
      [availableAssignees]
    );

    const buildCardFromForm = useCallback(
      (id: string): KanbanCard => ({
        id,
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        priority: (formPriority as KanbanCard["priority"]) || undefined,
        tagIds: (formTagIds as string[]).length
          ? (formTagIds as string[])
          : undefined,
        assigneeIds: (formAssigneeIds as string[]).length
          ? (formAssigneeIds as string[])
          : undefined,
        dueDate: formDueDate || undefined,
        checklist: formChecklist.length ? formChecklist : undefined,
        cover: sanitizeUrl(formCover) || undefined,
        data: Object.keys(formData).length ? formData : undefined,
      }),
      [
        formTitle,
        formDescription,
        formPriority,
        formTagIds,
        formAssigneeIds,
        formDueDate,
        formChecklist,
        formCover,
        formData,
      ]
    );

    // ─── WIP Check ──────────────────────────────────────────────────────
    const isAtWipLimit = useCallback(
      (columnId: string): boolean => {
        const col = columns.find(c => c.id === columnId);
        if (col?.maxCards == null) return false;
        return (cardOrder[columnId] ?? []).length >= col.maxCards;
      },
      [columns, cardOrder]
    );

    // ─── Move Card (internal + callback) ────────────────────────────────
    const moveCard = useCallback(
      (event: KanbanMoveEvent) => {
        updateOrder(prev => {
          const next = { ...prev };
          next[event.fromColumnId] = (next[event.fromColumnId] ?? []).filter(
            id => id !== event.cardId
          );
          const target = [...(next[event.toColumnId] ?? [])];
          target.splice(event.newIndex, 0, event.cardId);
          next[event.toColumnId] = target;
          return next;
        });
        onCardMove?.(event);
      },
      [updateOrder, onCardMove]
    );

    // ─── HTML5 Drag Handlers ────────────────────────────────────────────
    const handleDragStart = useCallback(
      (e: React.DragEvent, cardId: string, columnId: string) => {
        didDrag.current = true;
        setDragCardId(cardId);
        dragSourceCol.current = columnId;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", cardId);
      },
      []
    );

    const handleDragEnd = useCallback(() => {
      setDragCardId(null);
      setDragOverCol(null);
      setDropIndex(-1);
      dragSourceCol.current = null;
    }, []);

    const handleDragOver = useCallback(
      (e: React.DragEvent, columnId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOverCol(columnId);
        const colEl = (e.currentTarget as HTMLElement).querySelector(
          ".k-kanban-column__cards"
        );
        if (!colEl) return;
        const cardEls = colEl.querySelectorAll(
          ".k-kanban-card:not(.k-kanban-card--dragging)"
        );
        let idx = cardEls.length;
        for (let i = 0; i < cardEls.length; i++) {
          const rect = cardEls[i].getBoundingClientRect();
          if (e.clientY < rect.top + rect.height / 2) {
            idx = i;
            break;
          }
        }
        setDropIndex(idx);
      },
      []
    );

    const handleDragLeave = useCallback(
      (e: React.DragEvent, columnId: string) => {
        const related = e.relatedTarget as Node | null;
        if (related && (e.currentTarget as HTMLElement).contains(related))
          return;
        if (dragOverCol === columnId) {
          setDragOverCol(null);
          setDropIndex(-1);
        }
      },
      [dragOverCol]
    );

    const handleDrop = useCallback(
      (e: React.DragEvent, columnId: string) => {
        e.preventDefault();
        if (dragColId.current) return; // Column drag, not card drag
        const cardId = e.dataTransfer.getData("text/plain");
        const fromCol = dragSourceCol.current;
        if (cardId && fromCol) {
          if (fromCol !== columnId && isAtWipLimit(columnId)) {
            const col = columns.find(c => c.id === columnId);
            if (col?.maxCards != null) onWipExceeded?.(columnId, col.maxCards);
            handleDragEnd();
            return;
          }
          let idx = dropIndex;
          if (fromCol === columnId) {
            const srcIdx = (cardOrder[fromCol] ?? []).indexOf(cardId);
            if (srcIdx !== -1 && srcIdx < idx) idx--;
          }
          moveCard({
            cardId,
            fromColumnId: fromCol,
            toColumnId: columnId,
            newIndex: Math.max(0, idx),
          });
        }
        handleDragEnd();
      },
      [
        dropIndex,
        cardOrder,
        handleDragEnd,
        isAtWipLimit,
        columns,
        onWipExceeded,
        moveCard,
      ]
    );

    // ─── Keyboard Navigation ────────────────────────────────────────────
    const handleCardKeyDown = useCallback(
      (e: React.KeyboardEvent, cardId: string, columnId: string) => {
        const colCards = cardOrder[columnId] ?? [];
        const cardIdx = colCards.indexOf(cardId);
        const colIdx = columns.findIndex(c => c.id === columnId);
        const title = cardMap.get(cardId)?.title ?? cardId;

        if (grabbedCardId) {
          switch (e.key) {
            case "ArrowUp": {
              e.preventDefault();
              if (cardIdx > 0) {
                moveCard({
                  cardId,
                  fromColumnId: columnId,
                  toColumnId: columnId,
                  newIndex: cardIdx - 1,
                });
                setLiveMessage(
                  locale.kanban.movedPosition
                    .replace("{title}", title)
                    .replace("{position}", String(cardIdx))
                );
              }
              break;
            }
            case "ArrowDown": {
              e.preventDefault();
              if (cardIdx < colCards.length - 1) {
                moveCard({
                  cardId,
                  fromColumnId: columnId,
                  toColumnId: columnId,
                  newIndex: cardIdx + 1,
                });
                setLiveMessage(
                  locale.kanban.movedPosition
                    .replace("{title}", title)
                    .replace("{position}", String(cardIdx + 2))
                );
              }
              break;
            }
            case "ArrowLeft": {
              e.preventDefault();
              if (colIdx > 0) {
                const targetCol = columns[colIdx - 1];
                if (isAtWipLimit(targetCol.id)) {
                  if (targetCol.maxCards != null)
                    onWipExceeded?.(targetCol.id, targetCol.maxCards);
                  break;
                }
                moveCard({
                  cardId,
                  fromColumnId: columnId,
                  toColumnId: targetCol.id,
                  newIndex: (cardOrder[targetCol.id] ?? []).length,
                });
                setLiveMessage(
                  locale.kanban.movedToColumn
                    .replace("{title}", title)
                    .replace("{column}", targetCol.title)
                );
              }
              break;
            }
            case "ArrowRight": {
              e.preventDefault();
              if (colIdx < columns.length - 1) {
                const targetCol = columns[colIdx + 1];
                if (isAtWipLimit(targetCol.id)) {
                  if (targetCol.maxCards != null)
                    onWipExceeded?.(targetCol.id, targetCol.maxCards);
                  break;
                }
                moveCard({
                  cardId,
                  fromColumnId: columnId,
                  toColumnId: targetCol.id,
                  newIndex: (cardOrder[targetCol.id] ?? []).length,
                });
                setLiveMessage(
                  locale.kanban.movedToColumn
                    .replace("{title}", title)
                    .replace("{column}", targetCol.title)
                );
              }
              break;
            }
            case "Enter":
            case " ": {
              e.preventDefault();
              setGrabbedCardId(null);
              setLiveMessage(locale.kanban.dropped.replace("{title}", title));
              break;
            }
            case "Escape": {
              e.preventDefault();
              setGrabbedCardId(null);
              setLiveMessage(locale.kanban.cancelled);
              break;
            }
          }
        } else {
          switch (e.key) {
            case "Enter":
            case " ": {
              e.preventDefault();
              if (!cardManagement) break;
              setGrabbedCardId(cardId);
              setLiveMessage(locale.kanban.grabbed.replace("{title}", title));
              break;
            }
            case "ArrowUp": {
              e.preventDefault();
              if (cardIdx > 0) {
                (
                  elRef.current?.querySelector(
                    `[data-kanban-card="${colCards[cardIdx - 1]}"]`
                  ) as HTMLElement
                )?.focus();
              }
              break;
            }
            case "ArrowDown": {
              e.preventDefault();
              if (cardIdx < colCards.length - 1) {
                (
                  elRef.current?.querySelector(
                    `[data-kanban-card="${colCards[cardIdx + 1]}"]`
                  ) as HTMLElement
                )?.focus();
              }
              break;
            }
            case "ArrowLeft": {
              e.preventDefault();
              if (colIdx > 0) {
                const pc = cardOrder[columns[colIdx - 1].id] ?? [];
                if (pc.length)
                  (
                    elRef.current?.querySelector(
                      `[data-kanban-card="${pc[0]}"]`
                    ) as HTMLElement
                  )?.focus();
              }
              break;
            }
            case "ArrowRight": {
              e.preventDefault();
              if (colIdx < columns.length - 1) {
                const nc = cardOrder[columns[colIdx + 1].id] ?? [];
                if (nc.length)
                  (
                    elRef.current?.querySelector(
                      `[data-kanban-card="${nc[0]}"]`
                    ) as HTMLElement
                  )?.focus();
              }
              break;
            }
          }
        }
      },
      [
        grabbedCardId,
        cardOrder,
        columns,
        moveCard,
        cardMap,
        locale.kanban,
        isAtWipLimit,
        onWipExceeded,
      ]
    );

    // ─── Dialog Handlers ────────────────────────────────────────────────
    const resetForm = useCallback((card?: KanbanCard) => {
      setFormTitle(card?.title ?? "");
      setFormDescription(card?.description ?? "");
      setFormPriority(card?.priority ?? "");
      setFormTagIds(card?.tagIds ?? []);
      setFormAssigneeIds(card?.assigneeIds ?? []);
      setFormDueDate(card?.dueDate ?? "");
      setFormChecklist(
        card?.checklist ? card.checklist.map(i => ({ ...i })) : []
      );
      setNewChecklistLabel("");
      setFormData(card?.data ? { ...card.data } : {});
      setFormCover(card?.cover ?? "");
    }, []);

    const openDetail = useCallback(
      (card: KanbanCard, columnId: string) => {
        if (onCardClick) {
          onCardClick(card, columnId);
          return;
        }
        setDetailCard({ card, columnId });
        setDialogEditing(false);
        resetForm(card);
      },
      [onCardClick, resetForm]
    );

    const closeDetail = useCallback(() => setDetailCard(null), []);

    const openCreate = useCallback(
      (columnId: string, slId?: string) => {
        setCreateColumnId(columnId);
        createSwimlaneId.current = slId;
        resetForm();
      },
      [resetForm]
    );

    const closeCreate = useCallback(() => setCreateColumnId(null), []);

    const handleSaveDetail = useCallback(() => {
      if (!detailCard || !formTitle.trim()) return;
      const updated = buildCardFromForm(detailCard.card.id);
      // Preserve fields not in the form (cover, className, style)
      const merged: KanbanCard = { ...detailCard.card, ...updated };
      updateCards(prev => prev.map(c => (c.id === merged.id ? merged : c)));
      onCardUpdate?.(merged);
      closeDetail();
    }, [
      detailCard,
      formTitle,
      buildCardFromForm,
      updateCards,
      onCardUpdate,
      closeDetail,
    ]);

    const handleCreateSubmit = useCallback(() => {
      if (!createColumnId || !formTitle.trim()) return;
      const newCard = buildCardFromForm(genId());
      if (createSwimlaneId.current)
        newCard.swimlaneId = createSwimlaneId.current;
      updateCards(prev => [...prev, newCard]);
      updateOrder(prev => ({
        ...prev,
        [createColumnId]: [...(prev[createColumnId] ?? []), newCard.id],
      }));
      onCardCreate?.(newCard, createColumnId);
      closeCreate();
    }, [
      createColumnId,
      formTitle,
      buildCardFromForm,
      updateCards,
      updateOrder,
      onCardCreate,
      closeCreate,
    ]);

    const handleInlineAdd = useCallback(
      (columnId: string, slId?: string) => {
        const trimmed = addTitle.trim();
        if (!trimmed) return;
        const newCard: KanbanCard = {
          id: genId(),
          title: trimmed,
          swimlaneId: slId,
        };
        updateCards(prev => [...prev, newCard]);
        updateOrder(prev => ({
          ...prev,
          [columnId]: [...(prev[columnId] ?? []), newCard.id],
        }));
        onCardCreate?.(newCard, columnId);
        setAddTitle("");
        setAddingInCol(null);
      },
      [addTitle, updateCards, updateOrder, onCardCreate]
    );

    const handleDeleteConfirm = useCallback(() => {
      if (!confirmDeleteCard) return;
      const { cardId, columnId } = confirmDeleteCard;
      updateCards(prev => prev.filter(c => c.id !== cardId));
      updateOrder(prev => ({
        ...prev,
        [columnId]: (prev[columnId] ?? []).filter(id => id !== cardId),
      }));
      onCardDelete?.(cardId, columnId);
      setConfirmDeleteCard(null);
      closeDetail();
    }, [
      confirmDeleteCard,
      updateCards,
      updateOrder,
      onCardDelete,
      closeDetail,
    ]);

    const duplicateCard = useCallback(
      (cardId: string, columnId: string) => {
        const original = cardMap.get(cardId);
        if (!original) return;
        const newCard: KanbanCard = {
          ...original,
          id: genId(),
          data: original.data ? { ...original.data } : undefined,
          checklist: original.checklist?.map(i => ({ ...i, id: genId() })),
        };
        updateCards(prev => [...prev, newCard]);
        updateOrder(prev => {
          const col = prev[columnId] ?? [];
          const idx = col.indexOf(cardId);
          const next = [...col];
          next.splice(idx + 1, 0, newCard.id);
          return { ...prev, [columnId]: next };
        });
        onCardCreate?.(newCard, columnId);
      },
      [cardMap, updateCards, updateOrder, onCardCreate]
    );

    const advanceCard = useCallback(
      (cardId: string, columnId: string) => {
        const colIdx = columns.findIndex(c => c.id === columnId);
        if (colIdx < 0 || colIdx >= columns.length - 1) return;
        const nextCol = columns[colIdx + 1];
        if (isAtWipLimit(nextCol.id)) {
          if (nextCol.maxCards != null)
            onWipExceeded?.(nextCol.id, nextCol.maxCards);
          return;
        }
        const event: KanbanMoveEvent = {
          cardId,
          fromColumnId: columnId,
          toColumnId: nextCol.id,
          newIndex: (cardOrder[nextCol.id] ?? []).length,
        };
        moveCard(event);
      },
      [columns, cardOrder, isAtWipLimit, onWipExceeded, moveCard]
    );

    const makeCardMenuIcon = (path: string) => (
      <svg
        width={14}
        height={14}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d={path} />
      </svg>
    );

    const getCardContextItems = useCallback(
      (cardId: string, columnId: string) => {
        const colIdx = columns.findIndex(c => c.id === columnId);
        const isLast = colIdx >= columns.length - 1;
        const card = cardMap.get(cardId);
        return [
          {
            key: "edit",
            label: locale.kanban.editCard,
            icon: makeCardMenuIcon(PENCIL_PATH),
            command: () => {
              if (card) {
                openDetail(card, columnId);
                setDialogEditing(true);
              }
            },
          },
          {
            key: "duplicate",
            label: locale.kanban.duplicate,
            icon: makeCardMenuIcon(COPY_PATH),
            command: () => duplicateCard(cardId, columnId),
          },
          {
            key: "advance",
            label: locale.kanban.moveToNext,
            icon: makeCardMenuIcon(CHEVRON_RIGHT_PATH),
            disabled: isLast,
            command: () => advanceCard(cardId, columnId),
          },
          { key: "sep", separator: true },
          {
            key: "delete",
            label: locale.kanban.deleteCard,
            icon: makeCardMenuIcon(TRASH_PATH),
            command: () => setConfirmDeleteCard({ cardId, columnId }),
          },
        ];
      },
      [columns, locale.kanban, duplicateCard, advanceCard]
    );

    // ─── Column Management ──────────────────────────────────────────────
    const [editColumnId, setEditColumnId] = useState<string | null>(null);
    const [colFormTitle, setColFormTitle] = useState("");
    const [colFormSeverity, setColFormSeverity] = useState("");
    const [colFormMaxCards, setColFormMaxCards] = useState("");
    const [confirmDeleteCol, setConfirmDeleteCol] = useState<string | null>(
      null
    );

    const severityOptions = React.useMemo(
      () => [
        { value: "", label: locale.kanban.severityNone },
        { value: "primary", label: "Primary" },
        { value: "secondary", label: "Secondary" },
        { value: "success", label: "Success" },
        { value: "info", label: "Info" },
        { value: "warning", label: "Warning" },
        { value: "help", label: "Help" },
        { value: "danger", label: "Danger" },
        { value: "accent", label: "Accent" },
      ],
      [locale.kanban]
    );

    const openColumnEdit = useCallback(
      (colId: string) => {
        const col = columns.find(c => c.id === colId);
        if (!col) return;
        setEditColumnId(colId);
        setColFormTitle(col.title);
        setColFormSeverity(col.severity ?? "");
        setColFormMaxCards(col.maxCards != null ? String(col.maxCards) : "");
      },
      [columns]
    );

    const closeColumnEdit = useCallback(() => setEditColumnId(null), []);

    const saveColumnEdit = useCallback(() => {
      if (!editColumnId || !colFormTitle.trim()) return;
      const original = columns.find(c => c.id === editColumnId);
      if (!original) {
        closeColumnEdit();
        return;
      }
      const updated: KanbanColumn = {
        ...original,
        title: colFormTitle.trim(),
        severity: (colFormSeverity as KanbanColumn["severity"]) || undefined,
        maxCards: colFormMaxCards ? parseInt(colFormMaxCards, 10) : undefined,
      };
      updateColumns(prev => prev.map(c => (c.id === updated.id ? updated : c)));
      onColumnUpdate?.(updated);
      closeColumnEdit();
    }, [
      editColumnId,
      colFormTitle,
      colFormSeverity,
      colFormMaxCards,
      columns,
      updateColumns,
      onColumnUpdate,
      closeColumnEdit,
    ]);

    const addColumn = useCallback(() => {
      const col: KanbanColumn = {
        id: genId(),
        title: locale.kanban.newColumnTitle,
      };
      updateColumns(prev => [...prev, col]);
      updateOrder(prev => ({ ...prev, [col.id]: [] }));
      onColumnCreate?.(col);
      // Open edit dialog for the new column
      setTimeout(() => openColumnEdit(col.id), 0);
    }, [
      locale.kanban,
      updateColumns,
      updateOrder,
      onColumnCreate,
      openColumnEdit,
    ]);

    const deleteColumn = useCallback(
      (colId: string) => {
        const colCards = cardOrder[colId] ?? [];
        updateCards(prev => prev.filter(c => !colCards.includes(c.id)));
        updateColumns(prev => prev.filter(c => c.id !== colId));
        updateOrder(prev => {
          const next = { ...prev };
          delete next[colId];
          return next;
        });
        onColumnDelete?.(colId);
        setConfirmDeleteCol(null);
      },
      [cardOrder, updateCards, updateColumns, updateOrder, onColumnDelete]
    );

    const moveColumn = useCallback(
      (colId: string, direction: -1 | 1) => {
        const idx = columns.findIndex(c => c.id === colId);
        const newIdx = idx + direction;
        if (newIdx < 0 || newIdx >= columns.length) return;
        updateColumns(prev => {
          const next = [...prev];
          [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
          return next;
        });
        onColumnMove?.(colId, newIdx);
      },
      [columns, updateColumns, onColumnMove]
    );

    const toggleColumnCollapse = useCallback(
      (colId: string) => {
        updateColumns(prev =>
          prev.map(c =>
            c.id === colId ? { ...c, collapsed: !c.collapsed } : c
          )
        );
      },
      [updateColumns]
    );

    const getColumnContextItems = useCallback(
      (colId: string) => {
        const idx = columns.findIndex(c => c.id === colId);
        const col = columns[idx];
        return [
          {
            key: "edit",
            label: locale.kanban.editColumn,
            icon: makeCardMenuIcon(PENCIL_PATH),
            command: () => openColumnEdit(colId),
          },
          {
            key: "collapse",
            label: col?.collapsed
              ? locale.kanban.expand
              : locale.kanban.collapse,
            icon: makeCardMenuIcon(
              col?.collapsed ? CHEVRON_DOWN_PATH : CHEVRON_UP_PATH
            ),
            command: () => toggleColumnCollapse(colId),
          },
          { key: "sep1", separator: true },
          {
            key: "move-left",
            label: locale.kanban.moveColumnLeft,
            icon: makeCardMenuIcon(CHEVRON_LEFT_PATH),
            disabled: idx <= 0,
            command: () => moveColumn(colId, -1),
          },
          {
            key: "move-right",
            label: locale.kanban.moveColumnRight,
            icon: makeCardMenuIcon(CHEVRON_RIGHT_PATH),
            disabled: idx >= columns.length - 1,
            command: () => moveColumn(colId, 1),
          },
          { key: "sep2", separator: true },
          {
            key: "delete",
            label: locale.kanban.deleteColumn,
            icon: makeCardMenuIcon(TRASH_PATH),
            command: () => setConfirmDeleteCol(colId),
          },
        ];
      },
      [columns, locale.kanban, openColumnEdit, moveColumn, toggleColumnCollapse]
    );

    // ─── Render helpers ─────────────────────────────────────────────────
    const priClass =
      priorityIndicator === "left"
        ? "k-kanban--priority-left"
        : priorityIndicator === "none"
          ? "k-kanban--priority-none"
          : "";

    const renderForm = () => (
      <div className="k-kanban-dialog__form">
        <Input
          label={locale.kanban.title}
          value={formTitle}
          onChange={e =>
            setFormTitle(
              (e as React.ChangeEvent<HTMLInputElement>).target.value
            )
          }
          fullWidth
          size="sm"
          required
        />
        <Textarea
          label={locale.kanban.description}
          value={formDescription}
          onChange={e =>
            setFormDescription(
              (e as React.ChangeEvent<HTMLTextAreaElement>).target.value
            )
          }
          fullWidth
          size="sm"
          rows={3}
        />
        {/* Priority + Due Date */}
        <div className="k-kanban-dialog__row">
          <Select
            label={locale.kanban.priority}
            options={priorityOptions}
            value={formPriority}
            onChange={val => setFormPriority(String(val ?? ""))}
            size="sm"
            clearable
          />
          {slots.dueDateSlot ? (
            slots.dueDateSlot(formDueDate, setFormDueDate)
          ) : (
            <Calendar
              label={locale.kanban.dueDate}
              value={formDueDate ? new Date(formDueDate) : null}
              onChange={d =>
                setFormDueDate(
                  d instanceof Date ? d.toISOString().split("T")[0] : ""
                )
              }
              size="sm"
              showButtonBar
            />
          )}
        </div>
        {/* Tags + Assignees */}
        {(availableTags.length > 0 ||
          availableAssignees.length > 0 ||
          slots.tagsSlot ||
          slots.assigneesSlot) && (
          <div className="k-kanban-dialog__row">
            {slots.tagsSlot
              ? slots.tagsSlot(
                  formTagIds as string[],
                  ids => setFormTagIds(ids),
                  availableTags
                )
              : availableTags.length > 0 && (
                  <MultiSelect
                    label={locale.kanban.tags}
                    options={tagOptions}
                    value={formTagIds}
                    onChange={vals => setFormTagIds(vals)}
                    size="sm"
                    chipDisplay
                    maxSelectedLabels={1}
                    filterable
                    placeholder={locale.kanban.tagsPlaceholder}
                  />
                )}
            {slots.assigneesSlot
              ? slots.assigneesSlot(
                  formAssigneeIds as string[],
                  ids => setFormAssigneeIds(ids),
                  availableAssignees
                )
              : availableAssignees.length > 0 && (
                  <MultiSelect
                    label={locale.kanban.assignees}
                    options={assigneeOptions}
                    value={formAssigneeIds}
                    onChange={vals => setFormAssigneeIds(vals)}
                    size="sm"
                    chipDisplay
                    maxSelectedLabels={1}
                    filterable
                    placeholder={locale.kanban.assigneesPlaceholder}
                  />
                )}
          </div>
        )}
        {/* Checklist */}
        {slots.checklistSlot ? (
          slots.checklistSlot(formChecklist, setFormChecklist)
        ) : (
          <div className="k-kanban-dialog__checklist">
            <span className="k-kanban-dialog__checklist-title">
              {locale.kanban.checklist}
            </span>
            {formChecklist.map(item => (
              <Checkbox
                key={item.id}
                checked={item.checked}
                label={item.label}
                size="sm"
                onChange={() =>
                  setFormChecklist(prev =>
                    prev.map(i =>
                      i.id === item.id ? { ...i, checked: !i.checked } : i
                    )
                  )
                }
              />
            ))}
            <div className="k-kanban-dialog__checklist-add">
              <Input
                size="sm"
                placeholder={locale.kanban.checklistAdd}
                value={newChecklistLabel}
                onChange={e =>
                  setNewChecklistLabel(
                    (e as React.ChangeEvent<HTMLInputElement>).target.value
                  )
                }
                onKeyDown={e => {
                  if (
                    (e as React.KeyboardEvent).key === "Enter" &&
                    newChecklistLabel.trim()
                  ) {
                    (e as React.KeyboardEvent).preventDefault();
                    setFormChecklist(prev => [
                      ...prev,
                      {
                        id: genId(),
                        label: newChecklistLabel.trim(),
                        checked: false,
                      },
                    ]);
                    setNewChecklistLabel("");
                  }
                }}
                fullWidth
              />
            </div>
          </div>
        )}
        {/* Cover */}
        {slots.coverSlot ? (
          slots.coverSlot(formCover, setFormCover)
        ) : (
          <div className="k-kanban-dialog__cover">
            <Input
              label={locale.kanban.cover}
              value={formCover}
              onChange={e =>
                setFormCover(
                  (e as React.ChangeEvent<HTMLInputElement>).target.value
                )
              }
              fullWidth
              size="sm"
              placeholder={locale.kanban.coverPlaceholder}
            />
            {formCover && sanitizeUrl(formCover) && (
              <img
                className="k-kanban-dialog__cover-preview"
                src={sanitizeUrl(formCover)}
                alt=""
                onError={e => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
          </div>
        )}
        {slots.customSlot && slots.customSlot(formData, setFormData)}
      </div>
    );

    const renderView = (card: KanbanCard) => (
      <div className="k-kanban-dialog__view">
        {card.cover && sanitizeUrl(card.cover) && (
          <img
            className="k-kanban-dialog__cover-preview"
            src={sanitizeUrl(card.cover)}
            alt=""
          />
        )}
        {card.description && (
          <p className="k-kanban-dialog__view-description">
            {card.description}
          </p>
        )}
        {card.tagIds && card.tagIds.length > 0 && (
          <div className="k-kanban-card__tags">
            {card.tagIds.map(tid => {
              const tag = availableTags.find(t => t.id === tid);
              return tag ? (
                <Tag key={tid} severity={tag.severity ?? "secondary"} rounded>
                  {tag.label}
                </Tag>
              ) : null;
            })}
          </div>
        )}
        <div className="k-kanban-dialog__view-meta">
          {card.priority && (
            <div className="k-kanban-dialog__view-field">
              <span className="k-kanban-dialog__view-label">
                {locale.kanban.priority}
              </span>
              <Tag
                severity={
                  card.priority === "critical" || card.priority === "high"
                    ? "danger"
                    : card.priority === "medium"
                      ? "warning"
                      : "info"
                }
              >
                {priorityOptions.find(o => o.value === card.priority)?.label ??
                  card.priority}
              </Tag>
            </div>
          )}
          {card.dueDate && (
            <div className="k-kanban-dialog__view-field">
              <span className="k-kanban-dialog__view-label">
                {locale.kanban.dueDate}
              </span>
              <span>{card.dueDate}</span>
            </div>
          )}
        </div>
        {card.assigneeIds && card.assigneeIds.length > 0 && (
          <div className="k-kanban-dialog__view-field">
            <span className="k-kanban-dialog__view-label">
              {locale.kanban.assignees}
            </span>
            <AvatarGroup max={5} size="sm">
              {card.assigneeIds.map(aid => {
                const a = availableAssignees.find(x => x.id === aid);
                return a ? (
                  <Avatar
                    key={a.id}
                    image={a.image}
                    label={a.label}
                    alt={a.alt}
                    size="sm"
                  />
                ) : null;
              })}
            </AvatarGroup>
          </div>
        )}
        {card.checklist &&
          card.checklist.length > 0 &&
          (() => {
            const done = card.checklist!.filter(i => i.checked).length;
            const total = card.checklist!.length;
            return (
              <div className="k-kanban-dialog__view-field">
                <span className="k-kanban-dialog__view-label">
                  {locale.kanban.checklist} ({done}/{total})
                </span>
                <ProgressBar
                  value={Math.round((done / total) * 100)}
                  severity={done === total ? "success" : "primary"}
                  height="0.375rem"
                />
                <div className="k-kanban-dialog__view-checklist">
                  {card.checklist!.map(item => (
                    <div
                      key={item.id}
                      className={`k-kanban-dialog__view-check-item ${item.checked ? "k-kanban-dialog__view-check-item--done" : ""}`}
                    >
                      {item.checked ? "\u2713" : "\u25CB"} {item.label}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
      </div>
    );

    // ─── Swimlane state ───────────────────────────────────────────────
    const [collapsedSwimlanes, setCollapsedSwimlanes] = useState<Set<string>>(
      () => {
        const s = new Set<string>();
        swimlanes?.forEach(sl => {
          if (sl.collapsed) s.add(sl.id);
        });
        return s;
      }
    );

    const toggleSwimlane = useCallback((slId: string) => {
      setCollapsedSwimlanes(prev => {
        const next = new Set(prev);
        if (next.has(slId)) next.delete(slId);
        else next.add(slId);
        return next;
      });
    }, []);

    const filterOrderBySwimlane = useCallback(
      (swimlaneId: string): Record<string, string[]> => {
        const swimlaneCardIds = new Set(
          cards.filter(c => c.swimlaneId === swimlaneId).map(c => c.id)
        );
        const filtered: Record<string, string[]> = {};
        for (const col of columns) {
          filtered[col.id] = (cardOrder[col.id] ?? []).filter(id =>
            swimlaneCardIds.has(id)
          );
        }
        return filtered;
      },
      [cards, columns, cardOrder]
    );

    // ─── Column Render Helper ───────────────────────────────────────────
    const renderColumn = (
      column: KanbanColumn,
      filteredOrder: Record<string, string[]>,
      swimlaneId?: string
    ) => {
      const colCardIds = filteredOrder[column.id] ?? [];
      const cardCount = colCardIds.length;
      const isOverLimit =
        column.maxCards != null && cardCount > column.maxCards;
      const isDropTarget = dragOverCol === column.id;

      return (
        <div
          key={column.id}
          className={[
            "k-kanban-column",
            column.severity && `k-kanban-column--${column.severity}`,
            isDropTarget && "k-kanban-column--drop-target",
            isOverLimit && "k-kanban-column--over-limit",
            column.collapsed && "k-kanban-column--collapsed",
            column.className,
          ]
            .filter(Boolean)
            .join(" ")}
          style={column.style}
          onDragOver={e => handleDragOver(e, column.id)}
          onDragLeave={e => handleDragLeave(e, column.id)}
          onDrop={e => handleDrop(e, column.id)}
          role="group"
          aria-label={column.title}
        >
          {columnHeaderTemplate ? (
            columnHeaderTemplate(column, cardCount)
          ) : column.collapsed ? (
            <div
              className="k-kanban-column__header"
              onClick={() => toggleColumnCollapse(column.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === "Enter") toggleColumnCollapse(column.id);
              }}
              aria-label={`${column.title} (${cardCount}) — ${locale.kanban.expand}`}
            >
              <svg
                className="k-kanban-column__collapse-chevron"
                width={12}
                height={12}
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d={CHEVRON_RIGHT_PATH} />
              </svg>
              <span className="k-kanban-column__title">{column.title}</span>
              <span className="k-kanban-column__count">{cardCount}</span>
            </div>
          ) : columnManagement ? (
            <ContextMenu items={getColumnContextItems(column.id)}>
              <div
                className="k-kanban-column__header"
                draggable
                onDragStart={e => {
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/kanban-column", column.id);
                  dragColId.current = column.id;
                }}
                onDragEnd={() => {
                  dragColId.current = null;
                }}
                onDragOver={e => {
                  if (!dragColId.current) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={e => {
                  if (!dragColId.current || dragColId.current === column.id)
                    return;
                  e.preventDefault();
                  e.stopPropagation();
                  const fromIdx = columns.findIndex(
                    c => c.id === dragColId.current
                  );
                  const toIdx = columns.findIndex(c => c.id === column.id);
                  if (fromIdx >= 0 && toIdx >= 0) {
                    updateColumns(prev => {
                      const next = [...prev];
                      const [moved] = next.splice(fromIdx, 1);
                      next.splice(toIdx, 0, moved);
                      return next;
                    });
                    onColumnMove?.(dragColId.current!, toIdx);
                  }
                  dragColId.current = null;
                }}
              >
                <span className="k-kanban-column__title">{column.title}</span>
                <span
                  className="k-kanban-column__count-wrap"
                  onClick={e => {
                    e.stopPropagation();
                    openColumnEdit(column.id);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.stopPropagation();
                      openColumnEdit(column.id);
                    }
                  }}
                  aria-label={locale.kanban.editColumn}
                >
                  <span className="k-kanban-column__count">
                    {cardCount}
                    {column.maxCards != null && (
                      <span className="k-kanban-column__limit">
                        {" / "}
                        {column.maxCards}
                      </span>
                    )}
                  </span>
                  <svg
                    className="k-kanban-column__edit-icon"
                    width={12}
                    height={12}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d={PENCIL_PATH} />
                  </svg>
                </span>
              </div>
            </ContextMenu>
          ) : (
            <div className="k-kanban-column__header">
              <span className="k-kanban-column__title">{column.title}</span>
              <span
                className="k-kanban-column__count"
                aria-label={`${cardCount}${column.maxCards != null ? ` / ${column.maxCards}` : ""} ${locale.kanban.cardCount}`}
              >
                {cardCount}
                {column.maxCards != null && (
                  <span className="k-kanban-column__limit">
                    {" / "}
                    {column.maxCards}
                  </span>
                )}
              </span>
            </div>
          )}

          {!column.collapsed && (
            <div className="k-kanban-column__cards" role="list">
              {colCardIds.map((cid, idx) => {
                const card = cardMap.get(cid);
                if (!card) return null;
                const isDragging = dragCardId === cid;
                const isGrabbed = grabbedCardId === cid;
                const showIndicator =
                  isDropTarget && dropIndex === idx && !isDragging;

                return (
                  <React.Fragment key={card.id}>
                    {showIndicator && (
                      <div
                        className="k-kanban-card__drop-indicator"
                        aria-hidden="true"
                      />
                    )}
                    {cardManagement ? (
                      <ContextMenu
                        items={getCardContextItems(card.id, column.id)}
                      >
                        <div
                          className={[
                            "k-kanban-card",
                            isDragging && "k-kanban-card--dragging",
                            isGrabbed && "k-kanban-card--grabbed",
                            card.priority &&
                              `k-kanban-card--priority-${card.priority}`,
                            card.className,
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          style={card.style}
                          draggable={!grabbedCardId}
                          onDragStart={e =>
                            handleDragStart(e, card.id, column.id)
                          }
                          onDragEnd={handleDragEnd}
                          onClick={() => {
                            if (didDrag.current) {
                              didDrag.current = false;
                              return;
                            }
                            if (!dragCardId && !grabbedCardId)
                              openDetail(card, column.id);
                          }}
                          onKeyDown={e =>
                            handleCardKeyDown(e, card.id, column.id)
                          }
                          tabIndex={0}
                          role="listitem"
                          aria-roledescription={locale.kanban.cardLabel}
                          aria-grabbed={isGrabbed || undefined}
                          data-kanban-card={card.id}
                        >
                          {cardTemplate ? (
                            cardTemplate(card, column.id)
                          ) : (
                            <>
                              {card.priority &&
                                priorityIndicator !== "none" && (
                                  <div
                                    className="k-kanban-card__priority-bar"
                                    aria-label={card.priority}
                                  />
                                )}
                              {card.cover && sanitizeUrl(card.cover) && (
                                <img
                                  className="k-kanban-card__cover"
                                  src={sanitizeUrl(card.cover)}
                                  alt=""
                                  aria-hidden="true"
                                />
                              )}
                              <div className="k-kanban-card__body">
                                <div className="k-kanban-card__title">
                                  {card.title}
                                </div>
                                {card.description && (
                                  <div className="k-kanban-card__description">
                                    {card.description}
                                  </div>
                                )}
                                {card.tagIds && card.tagIds.length > 0 && (
                                  <div className="k-kanban-card__tags">
                                    {card.tagIds.map(tid => {
                                      const tag = availableTags.find(
                                        t => t.id === tid
                                      );
                                      return tag ? (
                                        <Tag
                                          key={tid}
                                          severity={tag.severity ?? "secondary"}
                                          rounded
                                        >
                                          {tag.label}
                                        </Tag>
                                      ) : null;
                                    })}
                                  </div>
                                )}
                                {card.checklist &&
                                  card.checklist.length > 0 &&
                                  (() => {
                                    const done = card.checklist!.filter(
                                      i => i.checked
                                    ).length;
                                    const total = card.checklist!.length;
                                    return (
                                      <div className="k-kanban-card__checklist">
                                        <ProgressBar
                                          value={Math.round(
                                            (done / total) * 100
                                          )}
                                          severity={
                                            done === total
                                              ? "success"
                                              : "primary"
                                          }
                                          height="0.25rem"
                                          ariaLabel={`${done}/${total}`}
                                        />
                                        <span className="k-kanban-card__checklist-label">
                                          {done}/{total}
                                        </span>
                                      </div>
                                    );
                                  })()}
                                {(card.assigneeIds?.length || card.dueDate) && (
                                  <div className="k-kanban-card__footer">
                                    {card.assigneeIds &&
                                      card.assigneeIds.length > 0 &&
                                      (() => {
                                        const resolved = card
                                          .assigneeIds!.map(aid =>
                                            availableAssignees.find(
                                              a => a.id === aid
                                            )
                                          )
                                          .filter(Boolean) as KanbanAssignee[];
                                        if (!resolved.length) return null;
                                        return resolved.length === 1 ? (
                                          <Avatar
                                            image={resolved[0].image}
                                            label={resolved[0].label}
                                            alt={resolved[0].alt}
                                            size="xs"
                                          />
                                        ) : (
                                          <AvatarGroup max={3} size="xs">
                                            {resolved.map(a => (
                                              <Avatar
                                                key={a.id}
                                                image={a.image}
                                                label={a.label}
                                                alt={a.alt}
                                                size="xs"
                                              />
                                            ))}
                                          </AvatarGroup>
                                        );
                                      })()}
                                    {card.dueDate && (
                                      <span className="k-kanban-card__due">
                                        {card.dueDate}
                                      </span>
                                    )}
                                  </div>
                                )}
                                {slots.cardExtraSlot &&
                                  slots.cardExtraSlot(card, column.id)}
                              </div>
                            </>
                          )}
                        </div>
                      </ContextMenu>
                    ) : (
                      <div
                        className={[
                          "k-kanban-card k-kanban-card--readonly",
                          card.priority &&
                            `k-kanban-card--priority-${card.priority}`,
                          card.className,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        style={card.style}
                        onClick={() => openDetail(card, column.id)}
                        tabIndex={0}
                        role="listitem"
                        aria-roledescription={locale.kanban.cardLabel}
                        data-kanban-card={card.id}
                      >
                        {cardTemplate ? (
                          cardTemplate(card, column.id)
                        ) : (
                          <>
                            {card.priority && priorityIndicator !== "none" && (
                              <div
                                className="k-kanban-card__priority-bar"
                                aria-label={card.priority}
                              />
                            )}
                            {card.cover && sanitizeUrl(card.cover) && (
                              <img
                                className="k-kanban-card__cover"
                                src={sanitizeUrl(card.cover)}
                                alt=""
                                aria-hidden="true"
                              />
                            )}
                            <div className="k-kanban-card__body">
                              <div className="k-kanban-card__title">
                                {card.title}
                              </div>
                              {card.description && (
                                <div className="k-kanban-card__description">
                                  {card.description}
                                </div>
                              )}
                              {card.tagIds && card.tagIds.length > 0 && (
                                <div className="k-kanban-card__tags">
                                  {card.tagIds.map(tid => {
                                    const tag = availableTags.find(
                                      t => t.id === tid
                                    );
                                    return tag ? (
                                      <Tag
                                        key={tid}
                                        severity={tag.severity ?? "secondary"}
                                        rounded
                                      >
                                        {tag.label}
                                      </Tag>
                                    ) : null;
                                  })}
                                </div>
                              )}
                              {card.checklist &&
                                card.checklist.length > 0 &&
                                (() => {
                                  const done = card.checklist!.filter(
                                    i => i.checked
                                  ).length;
                                  const total = card.checklist!.length;
                                  return (
                                    <div className="k-kanban-card__checklist">
                                      <ProgressBar
                                        value={Math.round((done / total) * 100)}
                                        severity={
                                          done === total ? "success" : "primary"
                                        }
                                        height="0.25rem"
                                        ariaLabel={`${done}/${total}`}
                                      />
                                      <span className="k-kanban-card__checklist-label">
                                        {done}/{total}
                                      </span>
                                    </div>
                                  );
                                })()}
                              {(card.assigneeIds?.length || card.dueDate) && (
                                <div className="k-kanban-card__footer">
                                  {card.assigneeIds &&
                                    card.assigneeIds.length > 0 &&
                                    (() => {
                                      const resolved = card
                                        .assigneeIds!.map(aid =>
                                          availableAssignees.find(
                                            a => a.id === aid
                                          )
                                        )
                                        .filter(Boolean) as KanbanAssignee[];
                                      if (!resolved.length) return null;
                                      return resolved.length === 1 ? (
                                        <Avatar
                                          image={resolved[0].image}
                                          label={resolved[0].label}
                                          alt={resolved[0].alt}
                                          size="xs"
                                        />
                                      ) : (
                                        <AvatarGroup max={3} size="xs">
                                          {resolved.map(a => (
                                            <Avatar
                                              key={a.id}
                                              image={a.image}
                                              label={a.label}
                                              alt={a.alt}
                                              size="xs"
                                            />
                                          ))}
                                        </AvatarGroup>
                                      );
                                    })()}
                                  {card.dueDate && (
                                    <span className="k-kanban-card__due">
                                      {card.dueDate}
                                    </span>
                                  )}
                                </div>
                              )}
                              {slots.cardExtraSlot &&
                                slots.cardExtraSlot(card, column.id)}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
              {isDropTarget && dropIndex === colCardIds.length && (
                <div
                  className="k-kanban-card__drop-indicator"
                  aria-hidden="true"
                />
              )}
            </div>
          )}

          {!column.collapsed &&
            cardManagement &&
            (columnFooterTemplate ? (
              columnFooterTemplate(column, cardCount)
            ) : (
              <div className="k-kanban-column__footer">
                {inlineAdd && addingInCol === column.id ? (
                  <div className="k-kanban-column__add-form">
                    <Input
                      ref={addInputRef}
                      size="sm"
                      placeholder={locale.kanban.addCardPlaceholder}
                      value={addTitle}
                      onChange={e =>
                        setAddTitle(
                          (e as React.ChangeEvent<HTMLInputElement>).target
                            .value
                        )
                      }
                      onKeyDown={e => {
                        if ((e as React.KeyboardEvent).key === "Enter") {
                          (e as React.KeyboardEvent).preventDefault();
                          handleInlineAdd(column.id, swimlaneId);
                        } else if (
                          (e as React.KeyboardEvent).key === "Escape"
                        ) {
                          setAddTitle("");
                          setAddingInCol(null);
                        }
                      }}
                      onBlur={() => {
                        if (!addTitle.trim()) {
                          setAddingInCol(null);
                          setAddTitle("");
                        }
                      }}
                      fullWidth
                    />
                  </div>
                ) : (
                  <Button
                    buttonType="text"
                    severity="secondary"
                    size="sm"
                    width="100%"
                    iconLeft={
                      <svg
                        width={14}
                        height={14}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d={PLUS_PATH} />
                      </svg>
                    }
                    onClick={() => {
                      if (inlineAdd) {
                        setAddingInCol(column.id);
                        setAddTitle("");
                      } else {
                        openCreate(column.id, swimlaneId);
                      }
                    }}
                    label={locale.kanban.addCard}
                  />
                )}
              </div>
            ))}
        </div>
      );
    };

    // ─── JSX ────────────────────────────────────────────────────────────
    return (
      <div
        ref={elRef}
        className={`k-kanban ${priClass} ${className}`.trim()}
        style={style}
        role="region"
        aria-label={locale.kanban.boardLabel}
      >
        <div
          className="k-kanban__live"
          role="status"
          aria-live="assertive"
          aria-atomic="true"
        >
          {liveMessage}
        </div>

        {swimlanes && swimlanes.length > 0 ? (
          <div className="k-kanban__swimlanes">
            {swimlanes.map(sl => {
              const slCollapsed = collapsedSwimlanes.has(sl.id);
              const slOrder = filterOrderBySwimlane(sl.id);
              return (
                <div
                  key={sl.id}
                  className={`k-kanban-swimlane ${sl.severity ? `k-kanban-swimlane--${sl.severity}` : ""} ${slCollapsed ? "k-kanban-swimlane--collapsed" : ""} ${sl.className ?? ""}`}
                  style={sl.style}
                >
                  <button
                    type="button"
                    className="k-kanban-swimlane__header"
                    onClick={() => toggleSwimlane(sl.id)}
                    aria-expanded={!slCollapsed}
                    aria-label={sl.title}
                  >
                    <svg
                      className={`k-kanban-swimlane__chevron ${slCollapsed ? "" : "k-kanban-swimlane__chevron--open"}`}
                      width={14}
                      height={14}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        d={slCollapsed ? CHEVRON_DOWN_PATH : CHEVRON_RIGHT_PATH}
                      />
                    </svg>
                    <span className="k-kanban-swimlane__title">{sl.title}</span>
                  </button>
                  {!slCollapsed && (
                    <div className="k-kanban__board">
                      {columns.map(col => renderColumn(col, slOrder, sl.id))}
                      {columnManagement && (
                        <button
                          type="button"
                          className="k-kanban-column k-kanban-column--add"
                          onClick={addColumn}
                          aria-label={locale.kanban.addColumn}
                        >
                          <svg
                            width={20}
                            height={20}
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d={PLUS_PATH} />
                          </svg>
                          <span>{locale.kanban.addColumn}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="k-kanban__board">
            {columns.map(col => renderColumn(col, cardOrder))}
            {columnManagement && (
              <button
                type="button"
                className="k-kanban-column k-kanban-column--add"
                onClick={addColumn}
                aria-label={locale.kanban.addColumn}
              >
                <svg
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d={PLUS_PATH} />
                </svg>
                <span>{locale.kanban.addColumn}</span>
              </button>
            )}
          </div>
        )}

        {/* Detail / Edit Dialog */}
        <Dialog
          visible={!!detailCard}
          onHide={closeDetail}
          size="sm"
          header={
            dialogEditing ? locale.kanban.editCard : locale.kanban.cardDetail
          }
          headerTemplate={
            detailCard && !cardDetailTemplate
              ? props => (
                  <div className="k-kanban-dialog__header-row">
                    <span className="k-kanban-dialog__header-title">
                      {typeof props.title === "string"
                        ? props.title
                        : locale.kanban.cardDetail}
                    </span>
                    <div className="k-kanban-dialog__header-actions">
                      {!dialogEditing && cardManagement && (
                        <button
                          type="button"
                          className="k-kanban-dialog__header-btn"
                          onClick={() => setDialogEditing(true)}
                          aria-label={locale.kanban.editCard}
                        >
                          <svg
                            width={16}
                            height={16}
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d={PENCIL_PATH} />
                          </svg>
                        </button>
                      )}
                      <button
                        type="button"
                        className="k-kanban-dialog__header-btn"
                        onClick={() => props.close()}
                        aria-label={locale.kanban.cancel}
                      >
                        <svg
                          width={16}
                          height={16}
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d={TIMES_PATH} />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              : undefined
          }
          footer={
            !cardDetailTemplate && detailCard && dialogEditing ? (
              <div className="k-kanban-dialog__footer">
                <Button
                  buttonType="text"
                  severity="danger"
                  size="sm"
                  label={locale.kanban.deleteCard}
                  iconLeft={
                    <svg
                      width={14}
                      height={14}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d={TRASH_PATH} />
                    </svg>
                  }
                  onClick={() =>
                    setConfirmDeleteCard({
                      cardId: detailCard.card.id,
                      columnId: detailCard.columnId,
                    })
                  }
                />
                <div className="k-kanban-dialog__footer-actions">
                  <Button
                    buttonType="text"
                    severity="secondary"
                    size="sm"
                    label={locale.kanban.cancel}
                    onClick={() => setDialogEditing(false)}
                  />
                  <Button
                    severity="primary"
                    size="sm"
                    label={locale.kanban.save}
                    onClick={handleSaveDetail}
                    disabled={!formTitle.trim()}
                  />
                </div>
              </div>
            ) : undefined
          }
        >
          {detailCard &&
            (cardDetailTemplate
              ? cardDetailTemplate(
                  detailCard.card,
                  detailCard.columnId,
                  closeDetail
                )
              : dialogEditing
                ? renderForm()
                : renderView(detailCard.card))}
        </Dialog>

        {/* Create Card Dialog */}
        <Dialog
          visible={!!createColumnId}
          onHide={closeCreate}
          header={locale.kanban.createCard}
          size="sm"
          footer={
            !cardCreateTemplate ? (
              <div className="k-kanban-dialog__footer">
                <div className="k-kanban-dialog__footer-actions">
                  <Button
                    buttonType="text"
                    severity="secondary"
                    size="sm"
                    label={locale.kanban.cancel}
                    onClick={closeCreate}
                  />
                  <Button
                    severity="primary"
                    size="sm"
                    label={locale.kanban.create}
                    onClick={handleCreateSubmit}
                    disabled={!formTitle.trim()}
                  />
                </div>
              </div>
            ) : undefined
          }
        >
          {createColumnId &&
            (cardCreateTemplate
              ? cardCreateTemplate(createColumnId, closeCreate)
              : renderForm())}
        </Dialog>

        {/* Delete Card Confirmation */}
        <Dialog
          visible={!!confirmDeleteCard}
          onHide={() => setConfirmDeleteCard(null)}
          variant="confirm"
          header={locale.kanban.deleteCard}
          message={locale.kanban.confirmDelete}
          acceptSeverity="danger"
          acceptLabel={locale.kanban.deleteCard}
          rejectLabel={locale.kanban.cancel}
          onAccept={handleDeleteConfirm}
          onReject={() => setConfirmDeleteCard(null)}
          size="xs"
        />

        {/* Delete Column Confirmation */}
        <Dialog
          visible={!!confirmDeleteCol}
          onHide={() => setConfirmDeleteCol(null)}
          variant="confirm"
          header={locale.kanban.deleteColumn}
          message={locale.kanban.confirmDeleteColumn}
          acceptSeverity="danger"
          acceptLabel={locale.kanban.deleteColumn}
          rejectLabel={locale.kanban.cancel}
          onAccept={() => {
            if (confirmDeleteCol) deleteColumn(confirmDeleteCol);
          }}
          onReject={() => setConfirmDeleteCol(null)}
          size="xs"
        />

        {/* Edit Column Dialog */}
        <Dialog
          visible={!!editColumnId}
          onHide={closeColumnEdit}
          header={locale.kanban.editColumn}
          size="xs"
          footer={
            <div className="k-kanban-dialog__footer">
              <div className="k-kanban-dialog__footer-actions">
                <Button
                  buttonType="text"
                  severity="secondary"
                  size="sm"
                  label={locale.kanban.cancel}
                  onClick={closeColumnEdit}
                />
                <Button
                  severity="primary"
                  size="sm"
                  label={locale.kanban.save}
                  onClick={saveColumnEdit}
                  disabled={!colFormTitle.trim()}
                />
              </div>
            </div>
          }
        >
          {editColumnId && (
            <div className="k-kanban-dialog__form">
              <Input
                label={locale.kanban.title}
                value={colFormTitle}
                onChange={e =>
                  setColFormTitle(
                    (e as React.ChangeEvent<HTMLInputElement>).target.value
                  )
                }
                fullWidth
                size="sm"
                required
              />
              <div className="k-kanban-dialog__row">
                <Select
                  label={locale.kanban.columnSeverity}
                  options={severityOptions}
                  value={colFormSeverity}
                  onChange={val => setColFormSeverity(String(val ?? ""))}
                  size="sm"
                  clearable
                />
                <Input
                  label={locale.kanban.columnMaxCards}
                  type="number"
                  value={colFormMaxCards}
                  onChange={e =>
                    setColFormMaxCards(
                      (e as React.ChangeEvent<HTMLInputElement>).target.value
                    )
                  }
                  size="sm"
                  min={0}
                />
              </div>
            </div>
          )}
        </Dialog>
      </div>
    );
  }
);

Kanban.displayName = "Kanban";
