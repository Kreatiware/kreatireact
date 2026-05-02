import React, { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { QRCode } from "../../../../packages/react/src/components/QRCode";
import type { QRCodeRef } from "../../../../packages/react/src/components/QRCode";

const meta = {
  title: "Components/QRCode",
  component: QRCode,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { value: "https://kreatiware.com" },
} satisfies Meta<typeof QRCode>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ─── 1. Basics ──────────────────────────────────────────────────────── */

export const Default: Story = {
  name: "1.1 Default",
  args: { value: "https://kreatiware.com" },
};

export const ShortText: Story = {
  name: "1.2 Short Text",
  args: { value: "Hello" },
};

export const LongText: Story = {
  name: "1.3 Long Text",
  args: {
    value:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
  },
};

export const NumericOnly: Story = {
  name: "1.4 Numeric Only",
  args: { value: "1234567890123456" },
};

export const Alphanumeric: Story = {
  name: "1.5 Alphanumeric",
  args: { value: "HELLO WORLD 123" },
};

export const UTF8: Story = {
  name: "1.6 UTF-8 (Accents & Symbols)",
  args: { value: "Kreatiware: Desarrolla, Diseña, Crea" },
};

/* ─── 2. Error Correction Levels ─────────────────────────────────────── */

export const ErrorCorrectionLevels: Story = {
  name: "2.1 Error Correction Levels",
  render: () => (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      {(["L", "M", "Q", "H"] as const).map((level) => (
        <div key={level} style={{ textAlign: "center" }}>
          <QRCode value="https://kreatiware.com" ecLevel={level} size={150} />
          <div style={{ marginTop: 8, fontFamily: "var(--kreati-font-family-body)", fontSize: 13 }}>
            Level {level} ({level === "L" ? "7%" : level === "M" ? "15%" : level === "Q" ? "25%" : "30%"} recovery)
          </div>
        </div>
      ))}
    </div>
  ),
};

/* ─── 3. Sizes ───────────────────────────────────────────────────────── */

export const Sizes: Story = {
  name: "3.1 Sizes",
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
      {[64, 100, 150, 200, 300].map((s) => (
        <div key={s} style={{ textAlign: "center" }}>
          <QRCode value="https://kreatiware.com" size={s} />
          <div style={{ marginTop: 8, fontFamily: "var(--kreati-font-family-body)", fontSize: 13 }}>
            {s}px
          </div>
        </div>
      ))}
    </div>
  ),
};

/* ─── 4. Module Radius ───────────────────────────────────────────────── */

export const ModuleRadius: Story = {
  name: "4.1 Module Radius",
  render: () => (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      {[0, 0.1, 0.25, 0.4, 0.5].map((r) => (
        <div key={r} style={{ textAlign: "center" }}>
          <QRCode value="https://kreatiware.com" moduleRadius={r} size={150} />
          <div style={{ marginTop: 8, fontFamily: "var(--kreati-font-family-body)", fontSize: 13 }}>
            {r === 0 ? "Square" : r === 0.5 ? "Circle" : `Rounded (${r})`}
          </div>
        </div>
      ))}
    </div>
  ),
};

/* ─── 5. Colors ──────────────────────────────────────────────────────── */

export const CustomColors: Story = {
  name: "5.1 Custom Colors",
  render: () => (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      <div style={{ textAlign: "center" }}>
        <QRCode value="https://kreatiware.com" fgColor="var(--kreati-primary-600)" size={150} />
        <div style={{ marginTop: 8, fontFamily: "var(--kreati-font-family-body)", fontSize: 13 }}>Primary</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <QRCode value="https://kreatiware.com" fgColor="#1a1a2e" bgColor="#e6e6fa" size={150} />
        <div style={{ marginTop: 8, fontFamily: "var(--kreati-font-family-body)", fontSize: 13 }}>Lavender</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <QRCode value="https://kreatiware.com" fgColor="#0d4f3c" bgColor="#d4edda" moduleRadius={0.5} size={150} />
        <div style={{ marginTop: 8, fontFamily: "var(--kreati-font-family-body)", fontSize: 13 }}>Green + Circles</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <QRCode value="https://kreatiware.com" fgColor="#fff" bgColor="#1a1a2e" size={150} />
        <div style={{ marginTop: 8, fontFamily: "var(--kreati-font-family-body)", fontSize: 13 }}>Inverted</div>
      </div>
    </div>
  ),
};

/* ─── 6. Quiet Zone ──────────────────────────────────────────────────── */

export const QuietZone: Story = {
  name: "6.1 Quiet Zone",
  render: () => (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      {[0, 2, 4, 8].map((q) => (
        <div key={q} style={{ textAlign: "center" }}>
          <div style={{ border: "1px solid var(--kreati-gray-300)", display: "inline-block" }}>
            <QRCode value="https://kreatiware.com" quietZone={q} size={150} />
          </div>
          <div style={{ marginTop: 8, fontFamily: "var(--kreati-font-family-body)", fontSize: 13 }}>
            quietZone: {q}
          </div>
        </div>
      ))}
    </div>
  ),
};

/* ─── 7. Logo ────────────────────────────────────────────────────────── */

export const WithTextLogo: Story = {
  name: "7.1 Text Logo",
  render: () => (
    <QRCode
      value="https://kreatiware.com"
      ecLevel="H"
      size={250}
      logo={
        <div style={{
          width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--kreati-font-family-display)", fontWeight: 700, fontSize: 18,
          color: "var(--kreati-primary-600)",
        }}>
          K
        </div>
      }
      logoRadius={8}
    />
  ),
};

export const WithImageLogo: Story = {
  name: "7.2 Image Logo (logo prop)",
  render: () => (
    <QRCode
      value="https://kreatiware.com"
      ecLevel="H"
      size={250}
      logo={
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/120px-React-icon.svg.png"
          alt="React"
          style={{ width: "80%", height: "80%", objectFit: "contain" }}
        />
      }
      logoRadius={8}
    />
  ),
};

export const WithImageSrc: Story = {
  name: "7.2b Image Logo (imageSrc shortcut)",
  render: () => (
    <QRCode
      value="https://kreatiware.com"
      ecLevel="H"
      size={250}
      imageSrc="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/120px-React-icon.svg.png"
      imageAlt="React logo"
      logoRadius={8}
    />
  ),
};

export const LogoSizes: Story = {
  name: "7.3 Logo Sizes",
  render: () => (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      {[0.1, 0.15, 0.2, 0.25, 0.3].map((ls) => (
        <div key={ls} style={{ textAlign: "center" }}>
          <QRCode
            value="https://kreatiware.com"
            ecLevel="H"
            size={180}
            logoSize={ls}
            logo={
              <div style={{
                width: "100%", height: "100%", background: "var(--kreati-primary-600)", borderRadius: 4,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontFamily: "var(--kreati-font-family-display)",
              }}>
                K
              </div>
            }
          />
          <div style={{ marginTop: 8, fontFamily: "var(--kreati-font-family-body)", fontSize: 13 }}>
            logoSize: {ls}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const RoundedLogo: Story = {
  name: "7.4 Rounded Modules + Round Logo",
  render: () => (
    <QRCode
      value="https://kreatiware.com"
      ecLevel="H"
      size={250}
      moduleRadius={0.5}
      fgColor="var(--kreati-primary-700)"
      logo={
        <div style={{
          width: "100%", height: "100%", background: "var(--kreati-primary-600)", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 700, fontSize: 20, fontFamily: "var(--kreati-font-family-display)",
        }}>
          K
        </div>
      }
      logoRadius={999}
    />
  ),
};

export const LogoWithCustomBg: Story = {
  name: "7.5 Logo with Custom Background",
  render: () => (
    <QRCode
      value="https://kreatiware.com"
      ecLevel="H"
      size={250}
      logo={
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/120px-React-icon.svg.png"
          alt="React"
          style={{ width: "70%", height: "70%", objectFit: "contain" }}
        />
      }
      logoBgColor="#e0f2fe"
      logoRadius={12}
    />
  ),
};

/* ─── 8. Export ───────────────────────────────────────────────────────── */

export const ExportPng: Story = {
  name: "8.1 Export PNG",
  render: () => {
    const qrRef = useRef<QRCodeRef>(null);
    const handleExport = async () => {
      if (!qrRef.current) return;
      const url = await qrRef.current.toDataURL("png");
      const a = document.createElement("a");
      a.href = url;
      a.download = "qrcode.png";
      a.click();
    };
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <QRCode ref={qrRef} value="https://kreatiware.com" size={200} />
        <button onClick={handleExport} style={{ padding: "8px 16px", cursor: "pointer" }}>
          Download PNG (2x retina)
        </button>
      </div>
    );
  },
};

export const ExportSvg: Story = {
  name: "8.2 Export SVG",
  render: () => {
    const qrRef = useRef<QRCodeRef>(null);
    const handleExport = () => {
      if (!qrRef.current) return;
      const svg = qrRef.current.toSvgString();
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "qrcode.svg";
      a.click();
      URL.revokeObjectURL(url);
    };
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <QRCode ref={qrRef} value="https://kreatiware.com" ecLevel="H" moduleRadius={0.3} size={200} />
        <button onClick={handleExport} style={{ padding: "8px 16px", cursor: "pointer" }}>
          Download SVG
        </button>
      </div>
    );
  },
};

/* ─── 9. Styled Combinations ─────────────────────────────────────────── */

export const StyledCombinations: Story = {
  name: "9.1 Styled Combinations",
  render: () => (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      <div style={{ textAlign: "center" }}>
        <QRCode value="https://kreatiware.com" size={160} />
        <div style={{ marginTop: 8, fontFamily: "var(--kreati-font-family-body)", fontSize: 13 }}>Classic</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <QRCode value="https://kreatiware.com" size={160} moduleRadius={0.5} fgColor="#2d3436" />
        <div style={{ marginTop: 8, fontFamily: "var(--kreati-font-family-body)", fontSize: 13 }}>Modern</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <QRCode value="https://kreatiware.com" size={160} fgColor="var(--kreati-primary-600)" moduleRadius={0.25} />
        <div style={{ marginTop: 8, fontFamily: "var(--kreati-font-family-body)", fontSize: 13 }}>Brand</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ background: "#1a1a2e", padding: 8, borderRadius: 8, display: "inline-block" }}>
          <QRCode value="https://kreatiware.com" size={160} fgColor="#ffffff" bgColor="#1a1a2e" moduleRadius={0.3} />
        </div>
        <div style={{ marginTop: 8, fontFamily: "var(--kreati-font-family-body)", fontSize: 13 }}>Dark</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <QRCode
          value="https://kreatiware.com"
          size={160}
          ecLevel="H"
          moduleRadius={0.5}
          fgColor="var(--kreati-primary-700)"
          logo={
            <div style={{
              width: "100%", height: "100%", background: "var(--kreati-primary-600)", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: 16, fontFamily: "var(--kreati-font-family-display)",
            }}>
              K
            </div>
          }
          logoRadius={999}
        />
        <div style={{ marginTop: 8, fontFamily: "var(--kreati-font-family-body)", fontSize: 13 }}>Branded + Logo</div>
      </div>
    </div>
  ),
};

/* ─── 10. Use Cases ──────────────────────────────────────────────────── */

export const WiFiNetwork: Story = {
  name: "10.1 WiFi Network",
  args: {
    value: "WIFI:T:WPA;S:MyNetwork;P:MyPassword;;",
    size: 200,
    ecLevel: "M" as const,
  },
};

export const VCard: Story = {
  name: "10.2 vCard Contact",
  args: {
    value: "BEGIN:VCARD\nVERSION:3.0\nN:Doe;John\nTEL:+1234567890\nEMAIL:john@example.com\nEND:VCARD",
    size: 200,
    ecLevel: "M" as const,
  },
};

export const Email: Story = {
  name: "10.3 Email",
  args: {
    value: "mailto:info@kreatiware.com?subject=Hello",
    size: 200,
  },
};

export const GeoLocation: Story = {
  name: "10.4 Geo Location",
  args: {
    value: "geo:40.7128,-74.0060",
    size: 200,
  },
};
