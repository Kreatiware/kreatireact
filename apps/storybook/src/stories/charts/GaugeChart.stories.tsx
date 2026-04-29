import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { GaugeChart } from "@kreatiware/react";

const meta: Meta<typeof GaugeChart> = {
  title: "Charts/GaugeChart",
  component: GaugeChart,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400, margin: "0 auto" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof GaugeChart>;

// ─── 1. Basics ──────────────────────────────────────────────────────────────

export const Default: Story = {
  name: "1.1 Default",
  args: { value: 72, unit: "%" },
};

export const WithLabel: Story = {
  name: "1.2 With Label",
  args: { value: 85, unit: "%", label: "Performance" },
};

export const WithTitle: Story = {
  name: "1.3 With Title",
  args: { value: 62, unit: "%", label: "CPU Usage", title: "Server Health" },
};

export const CenterValue: Story = {
  name: "1.4 Value in Center",
  args: { value: 78, unit: "%", valuePosition: "center", showNeedle: false },
};

// ─── 2. Needle Styles ──────────────────────────────────────────────────────

export const NeedleClassic: Story = {
  name: "2.1 Classic Needle",
  args: { value: 65, unit: "%", needleStyle: "classic" },
};

export const NeedleLine: Story = {
  name: "2.2 Line Needle",
  args: { value: 65, unit: "%", needleStyle: "line" },
};

export const NeedleArrow: Story = {
  name: "2.3 Arrow Needle",
  args: { value: 65, unit: "%", needleStyle: "arrow" },
};

export const NeedleCustom: Story = {
  name: "2.5 Custom Needle (JSX)",
  args: {
    value: 72,
    unit: "%",
    needleRender: (cx: number, cy: number, angle: number, outerR: number) => {
      const tipX = cx + outerR * Math.cos(angle);
      const tipY = cy + outerR * Math.sin(angle);
      return (
        <>
          <line x1={cx} y1={cy} x2={tipX} y2={tipY} stroke="var(--kreati-severity-danger)" strokeWidth={4} strokeLinecap="round" strokeDasharray="6 4" />
          <circle cx={tipX} cy={tipY} r={5} fill="var(--kreati-severity-danger)" />
        </>
      );
    },
  },
};

export const NoNeedle: Story = {
  name: "2.6 No Needle",
  args: { value: 65, unit: "%", showNeedle: false, valuePosition: "center" },
};

// ─── 3. Zones ───────────────────────────────────────────────────────────────

export const ColorZones: Story = {
  name: "3.1 Color Zones",
  args: {
    value: 72,
    unit: "%",
    label: "Efficiency",
    zones: [
      { from: 0, to: 40, severity: "danger" },
      { from: 40, to: 70, severity: "warning" },
      { from: 70, to: 100, severity: "success" },
    ],
  },
};

export const ZoneLabels: Story = {
  name: "3.2 Zone Labels",
  args: {
    value: 55,
    label: "Score",
    showZoneLabels: true,
    zones: [
      { from: 0, to: 40, severity: "danger", label: "Low" },
      { from: 40, to: 70, severity: "warning", label: "Mid" },
      { from: 70, to: 100, severity: "success", label: "High" },
    ],
  },
};

export const FiveZones: Story = {
  name: "3.3 Five Zones",
  args: {
    value: 78,
    zones: [
      { from: 0, to: 20, severity: "danger" },
      { from: 20, to: 40, severity: "warning" },
      { from: 40, to: 60, severity: "help" },
      { from: 60, to: 80, severity: "info" },
      { from: 80, to: 100, severity: "success" },
    ],
  },
};

// ─── 4. Needle Label ────────────────────────────────────────────────────────

export const WithNeedleLabel: Story = {
  name: "4.1 Needle Label",
  args: {
    value: 72,
    unit: "%",
    showNeedleLabel: true,
    zones: [
      { from: 0, to: 40, severity: "danger" },
      { from: 40, to: 70, severity: "warning" },
      { from: 70, to: 100, severity: "success" },
    ],
  },
};

export const NeedleLabelOnly: Story = {
  name: "4.2 Needle Label Only (no bottom value)",
  args: {
    value: 88,
    unit: "%",
    showNeedleLabel: true,
    showValue: false,
  },
};

// ─── 5. Customization ──────────────────────────────────────────────────────

export const CustomRange: Story = {
  name: "5.1 Custom Range (0-200)",
  args: { value: 140, min: 0, max: 200, unit: " km/h", label: "Speed" },
};

export const ThinArc: Story = {
  name: "5.2 Thin Arc (0.85)",
  args: { value: 80, unit: "%", innerRadius: 0.85, needleStyle: "line" },
};

export const ThickArc: Story = {
  name: "5.3 Thick Arc (0.4)",
  args: { value: 60, unit: "%", innerRadius: 0.4 },
};

export const CustomFormat: Story = {
  name: "5.4 Custom Value Format",
  args: {
    value: 3.7,
    min: 0,
    max: 5,
    valueFormat: (v: number) => v.toFixed(1),
    unit: " / 5",
    label: "Rating",
  },
};

// ─── 6. Arc Span ────────────────────────────────────────────────────────────

export const ThreeQuarterArc: Story = {
  name: "6.1 Three Quarter (270 degrees)",
  args: { value: 72, unit: "%", arcSpan: 270, height: 300, valuePosition: "center" },
};

export const NarrowArc: Story = {
  name: "6.2 Narrow Arc (120 degrees)",
  args: { value: 45, unit: "%", arcSpan: 120, height: 180 },
};

// ─── 7. Combined ────────────────────────────────────────────────────────────

export const FullFeatured: Story = {
  name: "7.1 Full Featured",
  args: {
    value: 78,
    unit: "%",
    label: "Overall Score",
    title: "System Health",
    subtitle: "Last 24 hours",
    needleStyle: "classic",
    showZoneLabels: true,
    zones: [
      { from: 0, to: 40, severity: "danger", label: "Critical" },
      { from: 40, to: 70, severity: "warning", label: "Warning" },
      { from: 70, to: 100, severity: "success", label: "Good" },
    ],
    exportFormats: ["png", "svg"],
  },
};

export const LIMSCalibration: Story = {
  name: "7.2 LIMS — Instrument Calibration",
  args: {
    value: 92.5,
    min: 80,
    max: 105,
    valueFormat: (v: number) => v.toFixed(1),
    unit: "%",
    label: "Calibration Accuracy",
    title: "Spectrophotometer",
    needleStyle: "arrow",
    showNeedleLabel: true,
    zones: [
      { from: 80, to: 85, severity: "danger" },
      { from: 85, to: 90, severity: "warning" },
      { from: 90, to: 100, severity: "success" },
      { from: 100, to: 105, severity: "warning" },
    ],
    exportFormats: ["png"],
  },
};

export const AllNeedleStyles: Story = {
  name: "7.3 All Needle Styles Comparison",
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
      {(["classic", "line", "arrow"] as const).map((ns) => (
        <div key={ns}>
          <GaugeChart
            value={65}
            unit="%"
            needleStyle={ns}
            height={160}
            zones={[
              { from: 0, to: 40, severity: "danger" },
              { from: 40, to: 70, severity: "warning" },
              { from: 70, to: 100, severity: "success" },
            ]}
          />
          <div style={{ textAlign: "center", fontSize: "0.75rem", marginTop: "0.25rem" }}>{ns}</div>
        </div>
      ))}
    </div>
  ),
};
