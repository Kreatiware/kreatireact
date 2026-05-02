import React, { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Barcode } from "../../../../packages/react/src/components/Barcode";
import type { BarcodeRef } from "../../../../packages/react/src/components/Barcode";

const meta = {
  title: "Components/Barcode",
  component: Barcode,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { value: "Hello World" },
} satisfies Meta<typeof Barcode>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ─── 1. Code128 ─────────────────────────────────────────────────────── */

export const Code128Default: Story = {
  name: "1.1 Code128 — Text",
  args: { value: "Hello World", format: "code128" },
};

export const Code128Numeric: Story = {
  name: "1.2 Code128 — Numeric (auto subset C)",
  args: { value: "1234567890", format: "code128" },
};

export const Code128URL: Story = {
  name: "1.3 Code128 — URL",
  args: { value: "https://kreatiware.com", format: "code128", width: 300 },
};

/* ─── 2. EAN-13 ──────────────────────────────────────────────────────── */

export const EAN13: Story = {
  name: "2.1 EAN-13",
  args: { value: "5901234123457", format: "ean13" },
};

export const EAN13AutoCheck: Story = {
  name: "2.2 EAN-13 (auto checksum)",
  args: { value: "590123412345", format: "ean13" },
};

/* ─── 3. EAN-8 ───────────────────────────────────────────────────────── */

export const EAN8: Story = {
  name: "3.1 EAN-8",
  args: { value: "96385074", format: "ean8" },
};

export const EAN8AutoCheck: Story = {
  name: "3.2 EAN-8 (auto checksum)",
  args: { value: "9638507", format: "ean8" },
};

/* ─── 4. UPC-A ───────────────────────────────────────────────────────── */

export const UPCA: Story = {
  name: "4.1 UPC-A",
  args: { value: "012345678905", format: "upca" },
};

export const UPCAAutoCheck: Story = {
  name: "4.2 UPC-A (auto checksum)",
  args: { value: "01234567890", format: "upca" },
};

/* ─── 5. Code39 ──────────────────────────────────────────────────────── */

export const Code39: Story = {
  name: "5.1 Code39",
  args: { value: "HELLO", format: "code39" },
};

export const Code39WithNumbers: Story = {
  name: "5.2 Code39 — Alphanumeric",
  args: { value: "ABC-123", format: "code39", width: 250 },
};

/* ─── 6. Customization ──────────────────────────────────────────────── */

export const NoText: Story = {
  name: "6.1 No Text",
  args: { value: "Hello World", showText: false },
};

export const CustomColors: Story = {
  name: "6.2 Custom Colors",
  render: () => (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      <Barcode value="KREATI" format="code39" fgColor="var(--kreati-primary-600)" />
      <Barcode value="KREATI" format="code39" fgColor="#0d4f3c" bgColor="#d4edda" />
      <div style={{ background: "#1a1a2e", padding: 8, borderRadius: 8, display: "inline-block" }}>
        <Barcode value="KREATI" format="code39" fgColor="#fff" bgColor="#1a1a2e" />
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  name: "6.3 Sizes",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
      <Barcode value="Hello" width={150} height={50} textSize={10} />
      <Barcode value="Hello" width={200} height={80} />
      <Barcode value="Hello" width={300} height={100} textSize={18} />
    </div>
  ),
};

export const QuietZones: Story = {
  name: "6.4 Quiet Zones",
  render: () => (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {[0, 5, 10, 20].map((q) => (
        <div key={q} style={{ textAlign: "center" }}>
          <div style={{ border: "1px solid var(--kreati-gray-300)", display: "inline-block" }}>
            <Barcode value="Hello" quietZone={q} />
          </div>
          <div style={{ marginTop: 4, fontFamily: "var(--kreati-font-family-body)", fontSize: 12 }}>
            quietZone: {q}
          </div>
        </div>
      ))}
    </div>
  ),
};

/* ─── 7. All Formats Comparison ──────────────────────────────────────── */

export const AllFormats: Story = {
  name: "7.1 All Formats",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {[
        { label: "Code128", value: "Hello World", format: "code128" as const, width: 250 },
        { label: "EAN-13", value: "5901234123457", format: "ean13" as const, width: 200 },
        { label: "EAN-8", value: "96385074", format: "ean8" as const, width: 150 },
        { label: "UPC-A", value: "012345678905", format: "upca" as const, width: 200 },
        { label: "Code39", value: "KREATI-123", format: "code39" as const, width: 280 },
      ].map(({ label, ...props }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ width: 80, fontFamily: "var(--kreati-font-family-body)", fontSize: 13, fontWeight: 600 }}>
            {label}
          </span>
          <Barcode {...props} />
        </div>
      ))}
    </div>
  ),
};

/* ─── 8. Export ───────────────────────────────────────────────────────── */

export const ExportAllFormats: Story = {
  name: "8.1 Export All Formats",
  render: () => {
    const refs = {
      code128: useRef<BarcodeRef>(null),
      ean13: useRef<BarcodeRef>(null),
      ean8: useRef<BarcodeRef>(null),
      upca: useRef<BarcodeRef>(null),
      code39: useRef<BarcodeRef>(null),
    };

    const handlePng = async (key: keyof typeof refs, name: string) => {
      const r = refs[key].current;
      if (!r) return;
      const url = await r.toDataURL("png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name}.png`;
      a.click();
    };

    const items: { key: keyof typeof refs; label: string; value: string; format: "code128" | "ean13" | "ean8" | "upca" | "code39"; width: number }[] = [
      { key: "code128", label: "Code128", value: "Hello World", format: "code128", width: 250 },
      { key: "ean13", label: "EAN-13", value: "5901234123457", format: "ean13", width: 200 },
      { key: "ean8", label: "EAN-8", value: "96385074", format: "ean8", width: 150 },
      { key: "upca", label: "UPC-A", value: "012345678905", format: "upca", width: 200 },
      { key: "code39", label: "Code39", value: "KREATI", format: "code39", width: 220 },
    ];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {items.map(({ key, label, value, format, width }) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Barcode ref={refs[key]} value={value} format={format} width={width} />
            <button
              onClick={() => handlePng(key, `${label}-${value}`)}
              style={{ padding: "6px 14px", cursor: "pointer", fontSize: 13 }}
            >
              PNG {label}
            </button>
          </div>
        ))}
      </div>
    );
  },
};
