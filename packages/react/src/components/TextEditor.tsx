import React, { useRef, useState, useCallback, useEffect, useId } from "react";
import "./TextEditor.css";
import { Tooltip } from "./Tooltip";
import { Popover } from "./Popover";
import { Input } from "./Input";
import { Button } from "./Button";
import { FieldWrapper } from "./FieldWrapper";
import { useKreatiLocale } from "../locale";
import {
  BOLD_PATH,
  ITALIC_PATH,
  UNDERLINE_PATH,
  STRIKETHROUGH_PATH,
  LIST_UNORDERED_PATH,
  LIST_ORDERED_PATH,
  LINK_PATH,
  CODE_PATH,
  BLOCKQUOTE_PATH,
  UNDO_PATH,
  REDO_PATH,
  TEXT_COLOR_PATH,
  BG_COLOR_PATH,
  FONT_FAMILY_PATH,
} from "./iconPaths";
import { sanitizeUrl } from "./sanitizeUrl";
import {
  htmlToDocument,
  documentToHtml,
  sanitizePastedHtml,
  documentCharCount,
  EditorDocument,
} from "./TextEditorModel";

export interface TextEditorProps {
  /** HTML content (controlled) */
  value?: string;
  /** Default HTML content (uncontrolled) */
  defaultValue?: string;
  /** Fires when content changes. Receives HTML string. */
  onChange?: (html: string) => void;
  /** Fires when the editor loses focus */
  onBlur?: () => void;
  /** Placeholder text when empty */
  placeholder?: string;
  /** Toolbar actions to show. Default: all */
  toolbar?: Array<
    | "bold"
    | "italic"
    | "underline"
    | "strikethrough"
    | "heading"
    | "fontSize"
    | "fontFamily"
    | "textColor"
    | "bgColor"
    | "ul"
    | "ol"
    | "link"
    | "code"
    | "blockquote"
    | "undo"
    | "redo"
    | "|"
  >;
  /** Show tooltips on toolbar buttons. Default: true */
  showTooltips?: boolean;
  /** Label text */
  label?: string;
  /** Read-only mode. Default: false */
  readOnly?: boolean;
  /** Disabled state. Default: false */
  disabled?: boolean;
  /** Error message or boolean */
  error?: React.ReactNode | boolean;
  /** Success state. Default: false */
  success?: boolean;
  /** Helper text below the editor */
  helperText?: React.ReactNode;
  /** Helper text severity color */
  helperSeverity?:
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "help"
    | "danger"
    | "accent";
  /** Required indicator */
  required?: boolean;
  /** Full width mode */
  fullWidth?: boolean;
  /** Max height for the editor area */
  maxHeight?: string;
  /** Min height for the editor area. Default: '10rem' */
  minHeight?: string;
  /** Allow resize. Default: false */
  resizable?: boolean;
  /** Show character count. Default: false */
  showCharCount?: boolean;
  /** Max character count (visual only) */
  maxChars?: number;
  /** Hidden input name for form compatibility */
  name?: string;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

const DEFAULT_TOOLBAR: TextEditorProps["toolbar"] = [
  "bold",
  "italic",
  "underline",
  "strikethrough",
  "|",
  "fontSize",
  "|",
  "textColor",
  "bgColor",
  "|",
  "ul",
  "ol",
  "|",
  "link",
  "code",
  "blockquote",
  "|",
  "undo",
  "redo",
];

const INLINE_ICONS: Record<string, string> = {
  bold: BOLD_PATH,
  italic: ITALIC_PATH,
  underline: UNDERLINE_PATH,
  strikethrough: STRIKETHROUGH_PATH,
  ul: LIST_UNORDERED_PATH,
  ol: LIST_ORDERED_PATH,
  link: LINK_PATH,
  code: CODE_PATH,
  blockquote: BLOCKQUOTE_PATH,
  undo: UNDO_PATH,
  redo: REDO_PATH,
};

const INLINE_TAGS: Record<string, string[]> = {
  bold: ["STRONG", "B"],
  italic: ["EM", "I"],
  underline: ["U"],
  strikethrough: ["S", "STRIKE", "DEL"],
  code: ["CODE"],
};

const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

const FONT_FAMILIES = [
  { label: "Inter", value: "var(--kreati-font-family-body)" },
  { label: "Raleway", value: "var(--kreati-font-family-display)" },
  { label: "JetBrains Mono", value: "var(--kreati-font-family-mono)" },
];

const COLOR_PALETTE = [
  "#000000",
  "#434343",
  "#666666",
  "#999999",
  "#cccccc",
  "#ffffff",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#0f78a5",
];

/** Remove a CSS property from all descendant spans, cleaning up empty wrappers */
const clearNestedStyle = (root: HTMLElement, styleProp: string) => {
  root.querySelectorAll("span").forEach(span => {
    if (span.style.getPropertyValue(styleProp)) {
      span.style.removeProperty(styleProp);
      // If span has no remaining styles, unwrap it
      if (!span.getAttribute("style")?.trim()) {
        const parent = span.parentNode;
        while (span.firstChild) parent?.insertBefore(span.firstChild, span);
        span.remove();
      }
    }
  });
};

/** Wrap selection in a styled span, or insert empty styled span if collapsed */
const wrapStyle = (styleProp: string, value: string, editorEl: HTMLElement) => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || !isInside(sel.anchorNode, editorEl))
    return;

  if (sel.isCollapsed) {
    // Insert zero-width span so next typed text gets the style
    const span = document.createElement("span");
    span.style.setProperty(styleProp, value);
    span.textContent = "\u200B";
    sel.getRangeAt(0).insertNode(span);
    const r = document.createRange();
    r.setStart(span.firstChild!, 1);
    r.collapse(true);
    sel.removeAllRanges();
    sel.addRange(r);
    return;
  }

  const range = sel.getRangeAt(0);
  const span = document.createElement("span");
  span.style.setProperty(styleProp, value);
  try {
    range.surroundContents(span);
  } catch {
    const frag = range.extractContents();
    span.appendChild(frag);
    range.insertNode(span);
  }
  // Remove conflicting inner styles so the new one takes effect
  clearNestedStyle(span, styleProp);
  sel.removeAllRanges();
  const r = document.createRange();
  r.selectNodeContents(span);
  sel.addRange(r);
};

const applyFontSize = (size: string, editorEl: HTMLElement) => {
  wrapStyle("font-size", size, editorEl);
};

const applyFontFamily = (family: string, editorEl: HTMLElement) => {
  wrapStyle("font-family", family, editorEl);
};

const applyColor = (
  color: string,
  prop: "color" | "background-color",
  editorEl: HTMLElement
) => {
  wrapStyle(prop, color, editorEl);
};

const iconSvg = (path: string) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d={path} />
  </svg>
);

/* ─── Selection helpers ────────────────────────────────────────────── */
const saveSelection = (): Range | null => {
  const sel = window.getSelection();
  return sel && sel.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null;
};

const restoreSelection = (range: Range | null) => {
  if (!range) return;
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
};

const isInside = (node: Node | null, editor: HTMLElement): boolean => {
  while (node) {
    if (node === editor) return true;
    node = node.parentNode;
  }
  return false;
};

const findAncestor = (
  node: Node | null,
  tags: string[],
  editor: HTMLElement
): HTMLElement | null => {
  let el = (
    node?.nodeType === Node.TEXT_NODE ? node.parentElement : node
  ) as HTMLElement | null;
  while (el && el !== editor) {
    if (tags.includes(el.tagName)) return el;
    el = el.parentElement;
  }
  return null;
};

const wrapInline = (
  tagName: string,
  matchTags: string[],
  editorEl: HTMLElement
) => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || !isInside(sel.anchorNode, editorEl))
    return;

  const range = sel.getRangeAt(0);

  // Check if already wrapped — unwrap
  const existing = findAncestor(
    range.commonAncestorContainer,
    matchTags,
    editorEl
  );
  if (existing) {
    if (sel.isCollapsed) {
      // Move cursor out of the wrapper
      const after = document.createRange();
      after.setStartAfter(existing);
      after.collapse(true);
      sel.removeAllRanges();
      sel.addRange(after);
      return;
    }
    const frag = document.createDocumentFragment();
    while (existing.firstChild) frag.appendChild(existing.firstChild);
    existing.parentNode?.replaceChild(frag, existing);
    return;
  }

  // Collapsed: insert empty wrapper and place cursor inside
  if (sel.isCollapsed) {
    const wrapper = document.createElement(tagName);
    wrapper.appendChild(document.createTextNode("\u200B"));
    range.insertNode(wrapper);
    const nr = document.createRange();
    nr.setStart(wrapper.firstChild!, 1);
    nr.collapse(true);
    sel.removeAllRanges();
    sel.addRange(nr);
    return;
  }

  const wrapper = document.createElement(tagName);
  try {
    range.surroundContents(wrapper);
  } catch {
    const frag = range.extractContents();
    wrapper.appendChild(frag);
    range.insertNode(wrapper);
  }
  sel.removeAllRanges();
  const nr = document.createRange();
  nr.selectNodeContents(wrapper);
  sel.addRange(nr);
};

const getBlockParent = (node: Node, editorEl: HTMLElement): HTMLElement => {
  let el = (
    node.nodeType === Node.TEXT_NODE ? node.parentElement : node
  ) as HTMLElement;
  while (el && el.parentElement && el.parentElement !== editorEl)
    el = el.parentElement;
  return el;
};

const setBlockTag = (tagName: string, editorEl: HTMLElement) => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || !isInside(sel.anchorNode, editorEl))
    return;

  // Find the block-level parent (direct child of editor)
  let block = sel.anchorNode as HTMLElement;
  if (block.nodeType === Node.TEXT_NODE) block = block.parentElement!;
  while (
    block &&
    block !== editorEl &&
    block.parentElement &&
    block.parentElement !== editorEl
  ) {
    block = block.parentElement;
  }
  // If cursor is on loose text directly in editor, wrap it first
  if (!block || block === editorEl) {
    const p = document.createElement("p");
    while (editorEl.firstChild) p.appendChild(editorEl.firstChild);
    editorEl.appendChild(p);
    block = p;
  }

  if (block.tagName === tagName) {
    // Toggle off: convert back to P
    const p = document.createElement("P");
    while (block.firstChild) p.appendChild(block.firstChild);
    block.parentNode?.replaceChild(p, block);
    return;
  }

  const nb = document.createElement(tagName);
  while (block.firstChild) nb.appendChild(block.firstChild);
  block.parentNode?.replaceChild(nb, block);
};

const selectNodeContents = (node: Node) => {
  const sel = window.getSelection();
  if (!sel) return;
  const r = document.createRange();
  r.selectNodeContents(node);
  sel.removeAllRanges();
  sel.addRange(r);
};

const toggleList = (listTag: string, editorEl: HTMLElement) => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || !isInside(sel.anchorNode, editorEl))
    return;

  let node = sel.anchorNode as HTMLElement;
  if (node.nodeType === Node.TEXT_NODE) node = node.parentElement!;

  const existingList = node.closest("ul, ol") as HTMLElement | null;
  if (existingList && editorEl.contains(existingList)) {
    if (existingList.tagName === listTag) {
      const frag = document.createDocumentFragment();
      Array.from(existingList.children).forEach(child => {
        if (child.tagName === "LI") {
          const p = document.createElement("p");
          while (child.firstChild) p.appendChild(child.firstChild);
          frag.appendChild(p);
        }
      });
      const first = frag.firstChild;
      existingList.parentNode?.replaceChild(frag, existingList);
      if (first) selectNodeContents(first);
    } else {
      const newList = document.createElement(listTag);
      while (existingList.firstChild)
        newList.appendChild(existingList.firstChild);
      existingList.parentNode?.replaceChild(newList, existingList);
      if (newList.firstChild) selectNodeContents(newList.firstChild);
    }
    return;
  }

  const range = sel.getRangeAt(0);
  const blocks: HTMLElement[] = [];
  const walker = document.createTreeWalker(editorEl, NodeFilter.SHOW_ELEMENT, {
    acceptNode: n => {
      const el = n as HTMLElement;
      if (el.parentElement === editorEl && range.intersectsNode(el))
        return NodeFilter.FILTER_ACCEPT;
      return NodeFilter.FILTER_SKIP;
    },
  });
  let cur = walker.nextNode();
  while (cur) {
    blocks.push(cur as HTMLElement);
    cur = walker.nextNode();
  }
  if (blocks.length === 0) {
    const b = getBlockParent(sel.anchorNode!, editorEl);
    if (b && editorEl.contains(b)) blocks.push(b);
  }
  if (blocks.length === 0) return;

  const list = document.createElement(listTag);
  blocks.forEach(b => {
    const li = document.createElement("li");
    while (b.firstChild) li.appendChild(b.firstChild);
    list.appendChild(li);
  });
  blocks[0].parentNode?.replaceChild(list, blocks[0]);
  for (let i = 1; i < blocks.length; i++) blocks[i].remove();
  selectNodeContents(list);
};

/* ─── Undo/Redo history ────────────────────────────────────────────── */
const MAX_HISTORY = 100;

interface HistoryState {
  doc: EditorDocument;
}

/**
 * TextEditor component — a WYSIWYG rich text editor built with a JSON
 * document model for security. Uses contentEditable for input capture,
 * but the source of truth is a typed node tree. HTML is derived from
 * the model, never stored as raw innerHTML.
 *
 * @example
 * ```tsx
 * <TextEditor
 *   value={html}
 *   onChange={setHtml}
 *   placeholder="Write something..."
 * />
 * ```
 */
export const TextEditor = ({
  value,
  defaultValue,
  onChange,
  onBlur,
  placeholder,
  toolbar = DEFAULT_TOOLBAR,
  showTooltips = true,
  label,
  readOnly = false,
  disabled = false,
  error,
  success = false,
  helperText,
  helperSeverity,
  required = false,
  fullWidth = false,
  maxHeight,
  minHeight = "10rem",
  resizable = false,
  showCharCount = false,
  maxChars,
  name,
  className,
  style,
  ref,
}: TextEditorProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const autoId = useId();
  const locale = useKreatiLocale();
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const isControlled = value !== undefined;
  const hasError = !!error;
  const errorMessage = typeof error === "boolean" ? undefined : error;
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [currentFontSize, setCurrentFontSize] = useState("14px");
  const [currentFont, setCurrentFont] = useState("");
  const [currentTextColor, setCurrentTextColor] = useState("");
  const [currentBgColor, setCurrentBgColor] = useState("");
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkLabel, setLinkLabel] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  const [textColorOpen, setTextColorOpen] = useState(false);
  const [bgColorOpen, setBgColorOpen] = useState(false);
  const [headingOpen, setHeadingOpen] = useState(false);
  const [fontSizeOpen, setFontSizeOpen] = useState(false);
  const [fontFamilyOpen, setFontFamilyOpen] = useState(false);
  const [charCount, setCharCount] = useState(0);

  // Document model — source of truth
  const docRef = useRef<EditorDocument>([
    { kind: "block", type: "paragraph", children: [] },
  ]);

  // Undo/redo history
  const historyRef = useRef<HistoryState[]>([]);
  const historyIndexRef = useRef(-1);
  const isUndoRedoRef = useRef(false);

  /** Sync DOM → document model, push history, emit onChange */
  const syncFromDom = useCallback(() => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    docRef.current = htmlToDocument(html);
    return docRef.current;
  }, []);

  const pushHistory = useCallback(() => {
    if (!editorRef.current || isUndoRedoRef.current) return;
    const doc = syncFromDom();
    if (!doc) return;
    const idx = historyIndexRef.current;
    const docJson = JSON.stringify(doc);
    // Don't push if same as current
    if (idx >= 0 && JSON.stringify(historyRef.current[idx]?.doc) === docJson)
      return;
    // Truncate forward history
    historyRef.current = historyRef.current.slice(0, idx + 1);
    historyRef.current.push({ doc: JSON.parse(docJson) });
    if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
    historyIndexRef.current = historyRef.current.length - 1;
  }, [syncFromDom]);

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    isUndoRedoRef.current = true;
    historyIndexRef.current--;
    const state = historyRef.current[historyIndexRef.current];
    if (editorRef.current && state) {
      docRef.current = state.doc;
      const html = documentToHtml(state.doc);
      editorRef.current.innerHTML = html;
      setCharCount(documentCharCount(state.doc));
      onChange?.(html);
    }
    isUndoRedoRef.current = false;
  }, [onChange]);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    isUndoRedoRef.current = true;
    historyIndexRef.current++;
    const state = historyRef.current[historyIndexRef.current];
    if (editorRef.current && state) {
      docRef.current = state.doc;
      const html = documentToHtml(state.doc);
      editorRef.current.innerHTML = html;
      setCharCount(documentCharCount(state.doc));
      onChange?.(html);
    }
    isUndoRedoRef.current = false;
  }, [onChange]);

  useEffect(() => {
    if (isControlled && editorRef.current && value !== undefined) {
      // Compare against model output, not raw innerHTML
      const currentModelHtml = documentToHtml(docRef.current);
      if (currentModelHtml !== value) {
        docRef.current = htmlToDocument(value);
        const safeHtml = documentToHtml(docRef.current);
        editorRef.current.innerHTML = safeHtml;
      }
    }
  }, [value, isControlled]);

  useEffect(() => {
    if (editorRef.current) {
      const initial = isControlled ? value || "" : defaultValue || "";
      docRef.current = htmlToDocument(initial);
      const safeHtml = documentToHtml(docRef.current);
      editorRef.current.innerHTML = safeHtml;
      setCharCount(documentCharCount(docRef.current));
      // Initialize history
      pushHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emitChange = useCallback(() => {
    if (!editorRef.current) return;
    if (
      editorRef.current.innerHTML === "" ||
      editorRef.current.innerHTML === "<br>"
    ) {
      editorRef.current.innerHTML = "<p><br></p>";
    }
    // Clean empty block elements (leftover from heading/block changes)
    editorRef.current
      .querySelectorAll(":scope > h1, :scope > h2, :scope > h3, :scope > h4")
      .forEach(el => {
        const text = el.textContent?.trim();
        if (!text) el.remove();
      });
    // Sync DOM → document model → safe HTML
    docRef.current = htmlToDocument(editorRef.current.innerHTML);
    setCharCount(documentCharCount(docRef.current));
    pushHistory();
    onChange?.(documentToHtml(docRef.current));
  }, [onChange, pushHistory]);

  const updateActiveFormats = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      setActiveFormats(new Set());
      return;
    }
    const formats = new Set<string>();
    let node = sel.anchorNode as HTMLElement | null;
    if (node?.nodeType === Node.TEXT_NODE) node = node.parentElement;
    while (node && node !== editorRef.current) {
      const tag = node.tagName;
      if (tag === "STRONG" || tag === "B") formats.add("bold");
      if (tag === "EM" || tag === "I") formats.add("italic");
      if (tag === "U") formats.add("underline");
      if (tag === "S" || tag === "STRIKE" || tag === "DEL")
        formats.add("strikethrough");
      if (tag === "CODE") formats.add("code");
      if (tag === "H1" || tag === "H2" || tag === "H3")
        formats.add(tag.toLowerCase());
      if (tag === "UL") formats.add("ul");
      if (tag === "OL") formats.add("ol");
      if (tag === "BLOCKQUOTE") formats.add("blockquote");
      if (tag === "A") formats.add("link");
      node = node.parentElement;
    }
    setActiveFormats(formats);
    // Detect inline styles from cursor position
    let styleNode = sel.anchorNode as HTMLElement | null;
    if (styleNode?.nodeType === Node.TEXT_NODE)
      styleNode = styleNode.parentElement;
    let detectedFs = "";
    let detectedFont = "";
    let detectedColor = "";
    let detectedBg = "";
    while (styleNode && styleNode !== editorRef.current) {
      if (!detectedFs) {
        const fs = styleNode.style?.fontSize;
        if (fs) detectedFs = fs;
      }
      if (!detectedFont && styleNode.style?.fontFamily)
        detectedFont = styleNode.style.fontFamily;
      if (!detectedColor && styleNode.style?.color)
        detectedColor = styleNode.style.color;
      if (!detectedBg && styleNode.style?.backgroundColor)
        detectedBg = styleNode.style.backgroundColor;
      styleNode = styleNode.parentElement;
    }
    setCurrentFontSize(detectedFs || "14px");
    setCurrentFont(detectedFont);
    setCurrentTextColor(detectedColor);
    setCurrentBgColor(detectedBg);
  }, []);

  const handleAction = useCallback(
    (action: string) => {
      if (disabled || readOnly) return;
      ensureEditorFocus();

      if (action === "undo") {
        handleUndo();
        return;
      }
      if (action === "redo") {
        handleRedo();
        return;
      }

      if (INLINE_TAGS[action]) {
        wrapInline(
          INLINE_TAGS[action][0],
          INLINE_TAGS[action],
          editorRef.current!
        );
      } else if (action === "blockquote") {
        setBlockTag("BLOCKQUOTE", editorRef.current!);
      } else if (action === "ul") {
        toggleList("UL", editorRef.current!);
      } else if (action === "ol") {
        toggleList("OL", editorRef.current!);
      } else if (action.startsWith("h")) {
        setBlockTag(action.toUpperCase(), editorRef.current!);
      }

      emitChange();
      savedRange.current = saveSelection();
      updateActiveFormats();
    },
    [
      disabled,
      readOnly,
      emitChange,
      updateActiveFormats,
      handleUndo,
      handleRedo,
    ]
  );

  const handleLink = useCallback(() => {
    if (!linkUrl || linkUrl === "https://") {
      setLinkOpen(false);
      return;
    }
    ensureEditorFocus();

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      setLinkOpen(false);
      return;
    }
    const range = sel.getRangeAt(0);

    const a = document.createElement("a");
    const safeUrl = sanitizeUrl(linkUrl);
    if (!safeUrl) return;
    a.href = safeUrl;
    a.target = "_blank";
    a.rel = "noopener noreferrer";

    const text = linkLabel.trim() || range.toString() || linkUrl;

    if (sel.isCollapsed) {
      a.textContent = text;
      range.insertNode(a);
    } else {
      range.deleteContents();
      a.textContent = text;
      range.insertNode(a);
    }

    // Place cursor after the link
    const after = document.createRange();
    after.setStartAfter(a);
    after.collapse(true);
    sel.removeAllRanges();
    sel.addRange(after);

    setLinkOpen(false);
    setLinkUrl("https://");
    setLinkLabel("");
    emitChange();
  }, [linkUrl, linkLabel, emitChange]);

  const handleRemoveLink = useCallback(() => {
    ensureEditorFocus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      let n = sel.anchorNode as HTMLElement;
      if (n.nodeType === Node.TEXT_NODE) n = n.parentElement!;
      const a = n.closest("a");
      if (a && editorRef.current?.contains(a)) {
        const frag = document.createDocumentFragment();
        while (a.firstChild) frag.appendChild(a.firstChild);
        a.parentNode?.replaceChild(frag, a);
      }
    }
    setLinkOpen(false);
    emitChange();
  }, [emitChange]);

  const openLinkPopover = useCallback(() => {
    savedRange.current = saveSelection();
    const sel = window.getSelection();
    const selectedText = sel && !sel.isCollapsed ? sel.toString() : "";
    setLinkLabel(selectedText);
    setLinkUrl("https://");
    setLinkOpen(true);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const mod = e.ctrlKey || e.metaKey;

    // Escape: release focus from editor
    if (e.key === "Escape") {
      editorRef.current?.blur();
      return;
    }

    // Tab handling
    if (e.key === "Tab" && !mod) {
      e.preventDefault();
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || !editorRef.current) return;

      let node = sel.anchorNode as HTMLElement;
      if (node.nodeType === Node.TEXT_NODE) node = node.parentElement!;
      const li = node.closest("li") as HTMLElement | null;

      if (li && editorRef.current.contains(li)) {
        const list = li.parentElement;
        if (e.shiftKey) {
          // Outdent: move li out of nested list
          const parentLi = list?.parentElement?.closest("li");
          if (parentLi && list) {
            parentLi.after(li);
            if (list.children.length === 0) list.remove();
            selectNodeContents(li);
          }
        } else {
          // Indent: wrap li in a nested list inside previous sibling
          const prev = li.previousElementSibling;
          if (prev && list) {
            const tag = list.tagName;
            let nested = prev.querySelector(
              `:scope > ${tag.toLowerCase()}`
            ) as HTMLElement | null;
            if (!nested) {
              nested = document.createElement(tag);
              prev.appendChild(nested);
            }
            nested.appendChild(li);
            selectNodeContents(li);
          }
        }
        emitChange();
      } else if (!e.shiftKey) {
        // Outside list: insert tab as inline-block span
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const tab = document.createElement("span");
        tab.style.whiteSpace = "pre";
        tab.textContent = "\t";
        range.insertNode(tab);
        const r = document.createRange();
        r.setStartAfter(tab);
        r.collapse(true);
        sel.removeAllRanges();
        sel.addRange(r);
        emitChange();
      }
      return;
    }

    if (mod && e.key === "b") {
      e.preventDefault();
      handleAction("bold");
    } else if (mod && e.key === "i") {
      e.preventDefault();
      handleAction("italic");
    } else if (mod && e.key === "u") {
      e.preventDefault();
      handleAction("underline");
    } else if (mod && e.key === "k") {
      e.preventDefault();
      openLinkPopover();
    } else if (mod && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
    } else if (mod && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
      e.preventDefault();
      handleRedo();
    }
  };

  /** Sanitize pasted content through the document model */
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const html = e.clipboardData.getData("text/html");
      const text = e.clipboardData.getData("text/plain");

      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      range.deleteContents();

      if (html) {
        // Sanitize through document model — strips scripts, event handlers, etc.
        const safeHtml = sanitizePastedHtml(html);
        const parsed = new DOMParser().parseFromString(safeHtml, "text/html");
        const frag = document.createDocumentFragment();
        while (parsed.body.firstChild) frag.appendChild(parsed.body.firstChild);
        range.insertNode(frag);
      } else if (text) {
        range.insertNode(document.createTextNode(text));
      }

      sel.collapseToEnd();
      emitChange();
    },
    [emitChange]
  );

  const overLimit = maxChars !== undefined && charCount > maxChars;

  const LABELS: Record<string, string> = {
    bold: locale?.textEditor?.bold || "Bold (Ctrl+B)",
    italic: locale?.textEditor?.italic || "Italic (Ctrl+I)",
    underline: locale?.textEditor?.underline || "Underline (Ctrl+U)",
    strikethrough: locale?.textEditor?.strikethrough || "Strikethrough",
    ul: locale?.textEditor?.unorderedList || "Bullet list",
    ol: locale?.textEditor?.orderedList || "Numbered list",
    link: locale?.textEditor?.link || "Link (Ctrl+K)",
    code: locale?.textEditor?.code || "Code",
    blockquote: locale?.textEditor?.blockquote || "Blockquote",
    undo: locale?.textEditor?.undo || "Undo (Ctrl+Z)",
    redo: locale?.textEditor?.redo || "Redo (Ctrl+Y)",
  };

  const HEADING_OPTIONS = [
    { label: locale?.textEditor?.paragraph || "Paragraph", value: "p" },
    { label: locale?.textEditor?.heading1 || "Heading 1", value: "h1" },
    { label: locale?.textEditor?.heading2 || "Heading 2", value: "h2" },
    { label: locale?.textEditor?.heading3 || "Heading 3", value: "h3" },
  ];

  const currentHeading = activeFormats.has("h1")
    ? "h1"
    : activeFormats.has("h2")
      ? "h2"
      : activeFormats.has("h3")
        ? "h3"
        : "p";

  /** Ensure editor has focus and a valid selection/cursor */
  const ensureEditorFocus = useCallback(() => {
    editorRef.current?.focus();
    if (savedRange.current) {
      restoreSelection(savedRange.current);
    } else {
      // Place cursor at end of editor
      const sel = window.getSelection();
      if (sel && editorRef.current) {
        const r = document.createRange();
        r.selectNodeContents(editorRef.current);
        r.collapse(false);
        sel.removeAllRanges();
        sel.addRange(r);
        savedRange.current = r.cloneRange();
      }
    }
  }, []);

  const renderToolbarBtn = (
    action: string,
    iconPath: string,
    isActive: boolean
  ) => {
    const btn = (
      <button
        key={action}
        type="button"
        className={`k-te__btn ${isActive ? "k-te__btn--active" : ""}`}
        onClick={() => handleAction(action)}
        onMouseDown={e => e.preventDefault()}
        aria-label={LABELS[action] || action}
        aria-pressed={isActive}
        disabled={disabled}
      >
        {iconSvg(iconPath)}
      </button>
    );
    if (!showTooltips) return btn;
    return (
      <Tooltip key={action} content={LABELS[action] || action} position="top">
        {btn}
      </Tooltip>
    );
  };

  const editorContent = (
    <div
      className={[
        "k-te",
        disabled && "k-te--disabled",
        readOnly && "k-te--readonly",
        hasError && "k-te--error",
        !hasError && success && "k-te--success",
        resizable && "k-te--resizable",
        fullWidth && "k-te--full-width",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {!readOnly && (
        <div
          className="k-te__toolbar"
          role="toolbar"
          aria-label={locale?.textEditor?.toolbar || "Formatting"}
        >
          {(toolbar ?? DEFAULT_TOOLBAR).map((action, i) => {
            if (action === "|")
              return (
                <div
                  key={`sep-${i}`}
                  className="k-te__separator"
                  aria-hidden="true"
                />
              );

            if (action === "heading") {
              const headingLabel =
                HEADING_OPTIONS.find(o => o.value === currentHeading)?.label ||
                "Paragraph";
              return (
                <Popover
                  key="heading-pop"
                  open={headingOpen}
                  onOpenChange={setHeadingOpen}
                  position="bottom"
                  closeOnClickOutside
                  closeOnEscape
                  content={
                    <div className="k-te__dropdown">
                      {HEADING_OPTIONS.map(o => (
                        <button
                          key={o.value}
                          type="button"
                          className={`k-te__dropdown-item ${o.value === currentHeading ? "k-te__dropdown-item--active" : ""}`}
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => {
                            ensureEditorFocus();
                            const val = o.value;
                            if (val === "p") {
                              if (currentHeading !== "p")
                                setBlockTag(
                                  currentHeading.toUpperCase(),
                                  editorRef.current!
                                );
                            } else {
                              if (currentHeading !== "p")
                                setBlockTag(
                                  currentHeading.toUpperCase(),
                                  editorRef.current!
                                );
                              if (val !== currentHeading)
                                setBlockTag(
                                  val.toUpperCase(),
                                  editorRef.current!
                                );
                            }
                            emitChange();
                            savedRange.current = saveSelection();
                            updateActiveFormats();
                            setHeadingOpen(false);
                          }}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  }
                >
                  <button
                    type="button"
                    className="k-te__select-btn"
                    onClick={() => {
                      savedRange.current = saveSelection();
                      setHeadingOpen(p => !p);
                    }}
                    onMouseDown={e => e.preventDefault()}
                    disabled={disabled}
                    aria-label={locale?.textEditor?.textStyle || "Text style"}
                  >
                    <span className="k-te__select-label">{headingLabel}</span>
                    <svg
                      className="k-te__select-chevron"
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M1 1l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </Popover>
              );
            }

            if (action === "fontSize") {
              const fsLabel = currentFontSize
                ? currentFontSize.replace("px", "")
                : "14";
              return (
                <Popover
                  key="fontSize-pop"
                  open={fontSizeOpen}
                  onOpenChange={setFontSizeOpen}
                  position="bottom"
                  closeOnClickOutside
                  closeOnEscape
                  content={
                    <div className="k-te__dropdown k-te__dropdown--scroll">
                      {FONT_SIZES.map(s => (
                        <button
                          key={s}
                          type="button"
                          className={`k-te__dropdown-item ${currentFontSize === `${s}px` ? "k-te__dropdown-item--active" : ""}`}
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => {
                            ensureEditorFocus();
                            applyFontSize(`${s}px`, editorRef.current!);
                            emitChange();
                            savedRange.current = saveSelection();
                            updateActiveFormats();
                            setFontSizeOpen(false);
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  }
                >
                  <button
                    type="button"
                    className="k-te__select-btn"
                    onClick={() => {
                      savedRange.current = saveSelection();
                      setFontSizeOpen(p => !p);
                    }}
                    onMouseDown={e => e.preventDefault()}
                    disabled={disabled}
                    aria-label={locale?.textEditor?.fontSize || "Font size"}
                  >
                    <span className="k-te__select-label">{fsLabel}</span>
                    <svg
                      className="k-te__select-chevron"
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M1 1l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </Popover>
              );
            }

            if (action === "fontFamily") {
              const ffLabel =
                FONT_FAMILIES.find(f => f.value === currentFont)?.label ||
                "Inter";
              return (
                <Popover
                  key="fontFamily-pop"
                  open={fontFamilyOpen}
                  onOpenChange={setFontFamilyOpen}
                  position="bottom"
                  closeOnClickOutside
                  closeOnEscape
                  content={
                    <div className="k-te__dropdown">
                      {FONT_FAMILIES.map(f => (
                        <button
                          key={f.label}
                          type="button"
                          className={`k-te__dropdown-item ${currentFont === f.value ? "k-te__dropdown-item--active" : ""}`}
                          style={{ fontFamily: f.value }}
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => {
                            ensureEditorFocus();
                            applyFontFamily(f.value, editorRef.current!);
                            emitChange();
                            savedRange.current = saveSelection();
                            updateActiveFormats();
                            setFontFamilyOpen(false);
                          }}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  }
                >
                  <button
                    type="button"
                    className="k-te__select-btn"
                    onClick={() => {
                      savedRange.current = saveSelection();
                      setFontFamilyOpen(p => !p);
                    }}
                    onMouseDown={e => e.preventDefault()}
                    disabled={disabled}
                    aria-label={locale?.textEditor?.fontFamily || "Font family"}
                  >
                    <span className="k-te__select-label">{ffLabel}</span>
                    <svg
                      className="k-te__select-chevron"
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M1 1l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </Popover>
              );
            }

            if (action === "textColor") {
              const tcBtn = (
                <button
                  key="textColor"
                  type="button"
                  className="k-te__btn k-te__btn--color"
                  onClick={() => {
                    savedRange.current = saveSelection();
                    setTextColorOpen(p => !p);
                  }}
                  onMouseDown={e => e.preventDefault()}
                  aria-label={locale?.textEditor?.textColor || "Text color"}
                  disabled={disabled}
                >
                  {iconSvg(TEXT_COLOR_PATH)}
                  <span
                    className="k-te__color-bar"
                    style={{
                      backgroundColor:
                        currentTextColor || "var(--kreati-gray-900)",
                    }}
                  />
                </button>
              );
              const wrappedTc =
                showTooltips && !textColorOpen ? (
                  <Tooltip
                    key="tc-tip"
                    content={locale?.textEditor?.textColor || "Text color"}
                    position="top"
                  >
                    {tcBtn}
                  </Tooltip>
                ) : (
                  tcBtn
                );
              return (
                <Popover
                  key="tc-pop"
                  open={textColorOpen}
                  onOpenChange={setTextColorOpen}
                  position="bottom"
                  closeOnClickOutside
                  closeOnEscape
                  content={
                    <div className="k-te__color-palette">
                      {COLOR_PALETTE.map(c => (
                        <button
                          key={c}
                          type="button"
                          className="k-te__color-swatch"
                          style={{ backgroundColor: c }}
                          aria-label={c}
                          onClick={() => {
                            ensureEditorFocus();
                            applyColor(c, "color", editorRef.current!);
                            emitChange();
                            savedRange.current = saveSelection();
                            setTextColorOpen(false);
                          }}
                        />
                      ))}
                    </div>
                  }
                >
                  {wrappedTc}
                </Popover>
              );
            }

            if (action === "bgColor") {
              const bgBtn = (
                <button
                  key="bgColor"
                  type="button"
                  className="k-te__btn k-te__btn--color"
                  onClick={() => {
                    savedRange.current = saveSelection();
                    setBgColorOpen(p => !p);
                  }}
                  onMouseDown={e => e.preventDefault()}
                  aria-label={locale?.textEditor?.bgColor || "Highlight color"}
                  disabled={disabled}
                >
                  {iconSvg(BG_COLOR_PATH)}
                  <span
                    className="k-te__color-bar"
                    style={{
                      backgroundColor: currentBgColor || "transparent",
                    }}
                  />
                </button>
              );
              const wrappedBg =
                showTooltips && !bgColorOpen ? (
                  <Tooltip
                    key="bg-tip"
                    content={locale?.textEditor?.bgColor || "Highlight color"}
                    position="top"
                  >
                    {bgBtn}
                  </Tooltip>
                ) : (
                  bgBtn
                );
              return (
                <Popover
                  key="bg-pop"
                  open={bgColorOpen}
                  onOpenChange={setBgColorOpen}
                  position="bottom"
                  closeOnClickOutside
                  closeOnEscape
                  content={
                    <div className="k-te__color-palette">
                      {COLOR_PALETTE.map(c => (
                        <button
                          key={c}
                          type="button"
                          className="k-te__color-swatch"
                          style={{ backgroundColor: c }}
                          aria-label={c}
                          onClick={() => {
                            ensureEditorFocus();
                            applyColor(
                              c,
                              "background-color",
                              editorRef.current!
                            );
                            emitChange();
                            savedRange.current = saveSelection();
                            setBgColorOpen(false);
                          }}
                        />
                      ))}
                    </div>
                  }
                >
                  {wrappedBg}
                </Popover>
              );
            }

            if (action === "link") {
              const linkBtn = (
                <button
                  key="link"
                  type="button"
                  className={`k-te__btn ${activeFormats.has("link") ? "k-te__btn--active" : ""}`}
                  onClick={openLinkPopover}
                  onMouseDown={e => e.preventDefault()}
                  aria-label={LABELS.link}
                  aria-pressed={activeFormats.has("link")}
                  disabled={disabled}
                >
                  {iconSvg(LINK_PATH)}
                </button>
              );

              const wrappedBtn =
                showTooltips && !linkOpen ? (
                  <Tooltip key="link-tip" content={LABELS.link} position="top">
                    {linkBtn}
                  </Tooltip>
                ) : (
                  linkBtn
                );

              return (
                <Popover
                  key="link-pop"
                  open={linkOpen}
                  onOpenChange={setLinkOpen}
                  position="bottom"
                  closeOnClickOutside
                  closeOnEscape
                  content={
                    <div className="k-te__link-popover">
                      <Input
                        label={locale?.textEditor?.linkLabel || "Label"}
                        size="sm"
                        value={linkLabel}
                        onChange={e =>
                          setLinkLabel((e.target as HTMLInputElement).value)
                        }
                        fullWidth
                        placeholder={
                          locale?.textEditor?.linkLabelPlaceholder ||
                          "Display text (optional)"
                        }
                      />
                      <Input
                        label="URL"
                        size="sm"
                        value={linkUrl}
                        onChange={e =>
                          setLinkUrl((e.target as HTMLInputElement).value)
                        }
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleLink();
                          }
                        }}
                        fullWidth
                      />
                      <div className="k-te__link-actions">
                        <Button
                          label={locale?.textEditor?.insertLink || "Insert"}
                          size="sm"
                          buttonType="filled"
                          onClick={handleLink}
                        />
                        {activeFormats.has("link") && (
                          <Button
                            label={locale?.textEditor?.removeLink || "Remove"}
                            size="sm"
                            buttonType="outlined"
                            severity="danger"
                            onClick={handleRemoveLink}
                          />
                        )}
                      </div>
                    </div>
                  }
                >
                  {wrappedBtn}
                </Popover>
              );
            }

            return renderToolbarBtn(
              action,
              INLINE_ICONS[action],
              activeFormats.has(action)
            );
          })}
        </div>
      )}

      <div className="k-te__editor-wrapper" style={{ maxHeight, minHeight }}>
        <div
          ref={editorRef}
          className="k-te__editor"
          contentEditable={!disabled && !readOnly}
          role="textbox"
          aria-multiline="true"
          aria-readonly={readOnly || undefined}
          aria-disabled={disabled || undefined}
          aria-placeholder={placeholder}
          data-placeholder={placeholder}
          suppressContentEditableWarning
          onInput={emitChange}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          onSelect={() => {
            savedRange.current = saveSelection();
            updateActiveFormats();
          }}
          onBlur={() => {
            savedRange.current = saveSelection();
            onBlur?.();
          }}
        />
      </div>

      {(showCharCount || name) && (
        <div className="k-te__footer">
          {showCharCount && (
            <span
              className={`k-te__char-count ${overLimit ? "k-te__char-count--over" : ""}`}
            >
              {charCount}
              {maxChars !== undefined ? ` / ${maxChars}` : ""}
            </span>
          )}
          {name && (
            <input
              type="hidden"
              name={name}
              value={documentToHtml(docRef.current)}
            />
          )}
        </div>
      )}
    </div>
  );

  if (label || helperText || errorMessage) {
    return (
      <div ref={ref} className={className} style={style}>
        <FieldWrapper
          label={label}
          htmlFor={autoId}
          required={required}
          helperText={helperText}
          error={errorMessage}
          success={success}
          helperSeverity={helperSeverity}
          disabled={disabled}
          fullWidth={fullWidth}
        >
          {editorContent}
        </FieldWrapper>
      </div>
    );
  }

  return (
    <div ref={ref} className={className} style={style}>
      {editorContent}
    </div>
  );
};
