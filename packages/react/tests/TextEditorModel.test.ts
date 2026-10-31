import { describe, expect, it } from "vitest";
import {
  documentToHtml,
  type EditorDocument,
  type EditorMark,
} from "../src/components/TextEditorModel";

const paragraphWithMarks = (marks: EditorMark[]): EditorDocument => [
  {
    kind: "block",
    type: "paragraph",
    children: [{ kind: "text", text: "Content", marks }],
  },
];

describe("documentToHtml", () => {
  it("escapes text content", () => {
    const doc: EditorDocument = [
      {
        kind: "block",
        type: "paragraph",
        children: [{ kind: "text", text: '<img src=x onerror="alert(1)">' }],
      },
    ];

    expect(documentToHtml(doc)).toBe(
      "<p>&lt;img src=x onerror=&quot;alert(1)&quot;&gt;</p>"
    );
  });

  it("drops unsafe links from manually constructed documents", () => {
    expect(
      documentToHtml(
        paragraphWithMarks([
          { type: "link", attrs: { href: "javascript:alert(1)" } },
        ])
      )
    ).toBe("<p>Content</p>");
  });

  it("keeps safe links and escapes attribute entities", () => {
    expect(
      documentToHtml(
        paragraphWithMarks([
          { type: "link", attrs: { href: "https://example.com/?a=1&b=2" } },
        ])
      )
    ).toBe(
      '<p><a href="https://example.com/?a=1&amp;b=2" target="_blank" rel="noopener noreferrer">Content</a></p>'
    );
  });

  it("restricts heading levels to the supported set", () => {
    const doc: EditorDocument = [
      {
        kind: "block",
        type: "heading",
        attrs: { level: '1 onclick="alert(1)"' },
        children: [{ kind: "text", text: "Title" }],
      },
    ];

    expect(documentToHtml(doc)).toBe("<h1>Title</h1>");
  });

  it("drops style values that can inject additional declarations", () => {
    expect(
      documentToHtml(
        paragraphWithMarks([
          { type: "fontSize", attrs: { size: "16px;position:fixed" } },
          { type: "textColor", attrs: { color: "red;background:url(x)" } },
        ])
      )
    ).toBe("<p>Content</p>");
  });

  it("preserves supported editor styles", () => {
    expect(
      documentToHtml(
        paragraphWithMarks([
          { type: "fontSize", attrs: { size: "16px" } },
          {
            type: "fontFamily",
            attrs: { family: "var(--kreati-font-family-body)" },
          },
          { type: "textColor", attrs: { color: "#0f78a5" } },
        ])
      )
    ).toBe(
      '<p><span style="font-size:16px"><span style="font-family:var(--kreati-font-family-body)"><span style="color:#0f78a5">Content</span></span></span></p>'
    );
  });
});
