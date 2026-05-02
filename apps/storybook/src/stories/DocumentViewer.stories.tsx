import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DocumentViewer } from "../../../../packages/react/src/components/DocumentViewer";

const meta = {
  title: "Components/DocumentViewer",
  component: DocumentViewer,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { src: "" },
} satisfies Meta<typeof DocumentViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

const SAMPLE_TEXT = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calculate first 10 Fibonacci numbers
for (let i = 0; i < 10; i++) {
  console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}

// Output:
// F(0) = 0
// F(1) = 1
// F(2) = 1
// F(3) = 2
// F(4) = 3
// F(5) = 5
// F(6) = 8
// F(7) = 13
// F(8) = 21
// F(9) = 34`;

/* ─── 1. PDF ─────────────────────────────────────────────────────────── */

export const PDFViewer: Story = {
  name: "1.1 PDF",
  args: {
    src: "/sample.pdf",
    title: "Sample PDF Document",
    width: 700,
    height: 500,
  },
};

/* ─── 2. Image ───────────────────────────────────────────────────────── */

export const ImageViewer: Story = {
  name: "2.1 Image (SVG)",
  args: {
    src: "/sample.svg",
    title: "Sample Illustration",
    width: 600,
    height: 400,
  },
};

export const ImageZoomPan: Story = {
  name: "2.2 Image — Zoom & Pan",
  render: () => (
    <div>
      <p style={{ fontFamily: "var(--kreati-font-family-body)", fontSize: 13, marginBottom: 8, color: "var(--kreati-text-secondary)" }}>
        Use mouse wheel to zoom, drag to pan when zoomed in. Toolbar has zoom, rotate, and reset controls.
      </p>
      <DocumentViewer
        src="/sample.png"
        title="Gradient Image"
        width={600}
        height={400}
      />
    </div>
  ),
};

/* ─── 3. Text ────────────────────────────────────────────────────────── */

export const TextViewer: Story = {
  name: "3.1 Text",
  args: {
    type: "text" as const,
    src: "",
    textContent: SAMPLE_TEXT,
    title: "fibonacci.js",
    width: 600,
    height: 400,
  },
};

export const TextWithLineNumbers: Story = {
  name: "3.2 Text — Line Numbers",
  args: {
    type: "text" as const,
    src: "",
    textContent: SAMPLE_TEXT,
    title: "fibonacci.js",
    lineNumbers: true,
    width: 600,
    height: 400,
  },
};

/* ─── 4. Customization ──────────────────────────────────────────────── */

export const NoToolbar: Story = {
  name: "4.1 No Toolbar",
  args: {
    src: "/sample.svg",
    showToolbar: false,
    width: 400,
    height: 300,
  },
};

export const NoDownloadNoPrint: Story = {
  name: "4.2 No Download / No Print",
  args: {
    src: "/sample.svg",
    title: "View Only",
    allowDownload: false,
    allowPrint: false,
    width: 500,
    height: 350,
  },
};

export const CustomSize: Story = {
  name: "4.3 Custom Size",
  render: () => (
    <div style={{ display: "flex", gap: 16 }}>
      <DocumentViewer
        src="/sample.png"
        title="Small"
        width={250}
        height={200}
      />
      <DocumentViewer
        type="text"
        src=""
        textContent="Hello World"
        title="Tiny"
        width={200}
        height={150}
      />
    </div>
  ),
};

export const EmptyState: Story = {
  name: "4.4 Empty (no src)",
  args: {
    src: "",
    title: "No Document",
    width: 500,
    height: 300,
  },
};

/* ─── 5. Auto Detection ─────────────────────────────────────────────── */

export const AutoDetectPDF: Story = {
  name: "5.1 Auto-detect PDF",
  args: {
    src: "/sample.pdf",
    title: "Auto-detected as PDF",
    width: 600,
    height: 400,
  },
};

export const AutoDetectImage: Story = {
  name: "5.2 Auto-detect Image",
  args: {
    src: "/sample.png",
    title: "Auto-detected as PNG",
    width: 500,
    height: 350,
  },
};
