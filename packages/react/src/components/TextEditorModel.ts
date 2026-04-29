/* ─── TextEditor Document Model ────────────────────────────────────── */

/** Inline mark applied to a text span */
export interface EditorMark {
  type:
    | "bold"
    | "italic"
    | "underline"
    | "strikethrough"
    | "code"
    | "link"
    | "fontSize"
    | "fontFamily"
    | "textColor"
    | "bgColor";
  attrs?: Record<string, string>;
}

/** Leaf node — a run of text with zero or more marks */
export interface EditorTextNode {
  kind: "text";
  text: string;
  marks?: EditorMark[];
}

/** Block-level node */
export interface EditorBlockNode {
  kind: "block";
  type:
    | "paragraph"
    | "heading"
    | "blockquote"
    | "code-block"
    | "list"
    | "list-item";
  attrs?: Record<string, string>;
  children: EditorNode[];
}

/** Any node in the editor document tree */
export type EditorNode = EditorTextNode | EditorBlockNode;

/** The root document — an array of block-level nodes */
export type EditorDocument = EditorBlockNode[];

import { sanitizeUrl } from "./sanitizeUrl";

/* ─── Allowed tags (whitelist) ─────────────────────────────────────── */
const BLOCK_TAGS: Record<string, (el: HTMLElement) => EditorBlockNode> = {
  P: () => ({ kind: "block", type: "paragraph", children: [] }),
  H1: () => ({
    kind: "block",
    type: "heading",
    attrs: { level: "1" },
    children: [],
  }),
  H2: () => ({
    kind: "block",
    type: "heading",
    attrs: { level: "2" },
    children: [],
  }),
  H3: () => ({
    kind: "block",
    type: "heading",
    attrs: { level: "3" },
    children: [],
  }),
  BLOCKQUOTE: () => ({ kind: "block", type: "blockquote", children: [] }),
  PRE: () => ({ kind: "block", type: "code-block", children: [] }),
  UL: () => ({
    kind: "block",
    type: "list",
    attrs: { listType: "ul" },
    children: [],
  }),
  OL: () => ({
    kind: "block",
    type: "list",
    attrs: { listType: "ol" },
    children: [],
  }),
  LI: () => ({ kind: "block", type: "list-item", children: [] }),
};

const MARK_TAGS: Record<string, (el: HTMLElement) => EditorMark> = {
  STRONG: () => ({ type: "bold" }),
  B: () => ({ type: "bold" }),
  EM: () => ({ type: "italic" }),
  I: () => ({ type: "italic" }),
  U: () => ({ type: "underline" }),
  S: () => ({ type: "strikethrough" }),
  STRIKE: () => ({ type: "strikethrough" }),
  DEL: () => ({ type: "strikethrough" }),
  CODE: () => ({ type: "code" }),
  A: (el: HTMLElement) => {
    const href = sanitizeUrl(el.getAttribute("href") || "");
    return {
      type: "link" as const,
      attrs: href ? { href } : { href: "" },
    };
  },
};

/* ─── HTML → Document ──────────────────────────────────────────────── */

/** Extract inline style marks from an element */
const extractStyleMarks = (el: HTMLElement): EditorMark[] => {
  const marks: EditorMark[] = [];
  if (el.style.fontSize)
    marks.push({ type: "fontSize", attrs: { size: el.style.fontSize } });
  if (el.style.fontFamily)
    marks.push({
      type: "fontFamily",
      attrs: { family: el.style.fontFamily },
    });
  if (el.style.color)
    marks.push({ type: "textColor", attrs: { color: el.style.color } });
  if (el.style.backgroundColor)
    marks.push({
      type: "bgColor",
      attrs: { color: el.style.backgroundColor },
    });
  return marks;
};

/** Parse child nodes into EditorNode[], accumulating marks from inline wrappers */
const parseInline = (
  node: Node,
  inheritedMarks: EditorMark[]
): EditorNode[] => {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || "";
    if (!text) return [];
    return [
      {
        kind: "text",
        text,
        marks: inheritedMarks.length > 0 ? [...inheritedMarks] : undefined,
      },
    ];
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return [];
  const el = node as HTMLElement;

  // If it's a block tag inside inline context, parse as block (will be lifted)
  if (BLOCK_TAGS[el.tagName]) {
    return [parseElement(el)].filter(Boolean) as EditorNode[];
  }

  // Accumulate marks
  const marks = [...inheritedMarks];
  const markFactory = MARK_TAGS[el.tagName];
  if (markFactory) marks.push(markFactory(el));

  // Style-based marks from <span> or any element
  marks.push(...extractStyleMarks(el));

  // Recurse into children
  const result: EditorNode[] = [];
  el.childNodes.forEach(child => {
    result.push(...parseInline(child, marks));
  });
  return result;
};

/** Parse a single element into a block node */
const parseElement = (el: HTMLElement): EditorBlockNode => {
  const factory = BLOCK_TAGS[el.tagName];
  if (factory) {
    const block = factory(el);
    el.childNodes.forEach(child => {
      if (
        child.nodeType === Node.ELEMENT_NODE &&
        BLOCK_TAGS[(child as HTMLElement).tagName]
      ) {
        block.children.push(parseElement(child as HTMLElement));
      } else {
        block.children.push(...parseInline(child, []));
      }
    });
    return block;
  }
  // Unknown element — treat as paragraph with inline content
  const p: EditorBlockNode = { kind: "block", type: "paragraph", children: [] };
  el.childNodes.forEach(child => {
    p.children.push(...parseInline(child, []));
  });
  return p;
};

/**
 * Parse an HTML string into an EditorDocument.
 * Only whitelisted tags are recognized — everything else becomes text.
 */
export const htmlToDocument = (html: string): EditorDocument => {
  if (!html || html === "<p><br></p>")
    return [{ kind: "block", type: "paragraph", children: [] }];

  const parsed = new DOMParser().parseFromString(html, "text/html");
  const container = parsed.body;

  const doc: EditorDocument = [];

  container.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        doc.push({
          kind: "block",
          type: "paragraph",
          children: [{ kind: "text", text }],
        });
      }
      return;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      doc.push(parseElement(node as HTMLElement));
    }
  });

  if (doc.length === 0) {
    doc.push({ kind: "block", type: "paragraph", children: [] });
  }

  return doc;
};

/* ─── Document → HTML ──────────────────────────────────────────────── */

/** Render marks as nested HTML open/close tags around text */
const renderMarks = (text: string, marks?: EditorMark[]): string => {
  if (!marks || marks.length === 0) return escapeHtml(text);

  let html = escapeHtml(text);

  // Apply marks inside-out (last mark is innermost)
  for (let i = marks.length - 1; i >= 0; i--) {
    const m = marks[i];
    switch (m.type) {
      case "bold":
        html = `<strong>${html}</strong>`;
        break;
      case "italic":
        html = `<em>${html}</em>`;
        break;
      case "underline":
        html = `<u>${html}</u>`;
        break;
      case "strikethrough":
        html = `<s>${html}</s>`;
        break;
      case "code":
        html = `<code>${html}</code>`;
        break;
      case "link":
        html = `<a href="${escapeAttr(m.attrs?.href || "")}" target="_blank" rel="noopener noreferrer">${html}</a>`;
        break;
      case "fontSize":
        html = `<span style="font-size:${escapeAttr(m.attrs?.size || "")}">${html}</span>`;
        break;
      case "fontFamily":
        html = `<span style="font-family:${escapeAttr(m.attrs?.family || "")}">${html}</span>`;
        break;
      case "textColor":
        html = `<span style="color:${escapeAttr(m.attrs?.color || "")}">${html}</span>`;
        break;
      case "bgColor":
        html = `<span style="background-color:${escapeAttr(m.attrs?.color || "")}">${html}</span>`;
        break;
    }
  }
  return html;
};

const renderNode = (node: EditorNode): string => {
  if (node.kind === "text") {
    let html = renderMarks(node.text, node.marks);
    // Preserve tab characters with white-space: pre
    if (node.text.includes("\t")) {
      html = `<span style="white-space:pre">${html}</span>`;
    }
    return html;
  }

  const children = node.children.map(renderNode).join("");

  switch (node.type) {
    case "paragraph":
      return `<p>${children || "<br>"}</p>`;
    case "heading": {
      const tag = `h${node.attrs?.level || "1"}`;
      return `<${tag}>${children}</${tag}>`;
    }
    case "blockquote":
      return `<blockquote>${children}</blockquote>`;
    case "code-block":
      return `<pre><code>${children}</code></pre>`;
    case "list": {
      const tag = node.attrs?.listType === "ol" ? "ol" : "ul";
      return `<${tag}>${children}</${tag}>`;
    }
    case "list-item":
      return `<li>${children}</li>`;
    default:
      return children;
  }
};

/**
 * Convert an EditorDocument to an HTML string.
 * Output is safe — all text is escaped, only whitelisted tags are generated.
 */
export const documentToHtml = (doc: EditorDocument): string => {
  return doc.map(renderNode).join("");
};

/* ─── Paste sanitization ───────────────────────────────────────────── */

/**
 * Sanitize pasted HTML by converting it through the document model.
 * Only whitelisted tags and marks survive — scripts, event handlers,
 * iframes, images, and unknown elements are stripped.
 */
export const sanitizePastedHtml = (html: string): string => {
  return documentToHtml(htmlToDocument(html));
};

/* ─── Utilities ────────────────────────────────────────────────────── */

const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const escapeAttr = (str: string): string =>
  str.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Count the total text characters in a document.
 */
export const documentCharCount = (doc: EditorDocument): number => {
  let count = 0;
  const walk = (nodes: EditorNode[]) => {
    for (const n of nodes) {
      if (n.kind === "text") {
        // Exclude zero-width spaces from count
        count += n.text.replace(/\u200B/g, "").length;
      } else {
        walk(n.children);
      }
    }
  };
  walk(doc);
  return count;
};
