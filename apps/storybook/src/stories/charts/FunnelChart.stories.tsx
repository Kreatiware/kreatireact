import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FunnelChart } from "@kreatiware/react";

const meta: Meta<typeof FunnelChart> = {
  title: "Charts/FunnelChart",
  component: FunnelChart,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FunnelChart>;

const salesFunnel = [
  { id: "visits", name: "Website Visits", value: 12000 },
  { id: "signups", name: "Sign Ups", value: 5200 },
  { id: "trials", name: "Free Trials", value: 2800 },
  { id: "paid", name: "Paid Users", value: 1200 },
  { id: "enterprise", name: "Enterprise", value: 300 },
];

// ─── 1. Basics ──────────────────────────────────────────────────────────────

export const Default: Story = {
  name: "1.1 Default",
  args: {
    data: salesFunnel,
    title: "Sales Funnel",
  },
};

export const Pyramid: Story = {
  name: "1.2 Pyramid (direction up)",
  args: {
    data: salesFunnel,
    direction: "up",
    title: "Growth Pyramid",
  },
};

export const NoPercentage: Story = {
  name: "1.3 Without Percentage",
  args: {
    data: salesFunnel,
    showPercentage: false,
    title: "Values Only",
  },
};

// ─── 2. Labels ──────────────────────────────────────────────────────────────

export const LabelsRight: Story = {
  name: "2.1 Labels Right",
  args: {
    data: salesFunnel,
    labelPosition: "right",
    title: "Right Labels",
  },
};

export const LabelsLeft: Story = {
  name: "2.2 Labels Left",
  args: {
    data: salesFunnel,
    labelPosition: "left",
    title: "Left Labels",
  },
};

export const CustomFormat: Story = {
  name: "2.3 Custom Value Format",
  args: {
    data: salesFunnel,
    valueFormat: (v: number, pct: number) => `${(v / 1000).toFixed(1)}K — ${pct.toFixed(0)}%`,
    title: "Custom Format",
  },
};

// ─── 3. Styling ─────────────────────────────────────────────────────────────

export const SeverityColors: Story = {
  name: "3.1 Severity Colors",
  args: {
    data: [
      { id: "s1", name: "Awareness", value: 8000, severity: "primary" as const },
      { id: "s2", name: "Interest", value: 5000, severity: "info" as const },
      { id: "s3", name: "Decision", value: 2000, severity: "warning" as const },
      { id: "s4", name: "Action", value: 800, severity: "success" as const },
    ],
    title: "Severity Colors",
  },
};

export const CustomColors: Story = {
  name: "3.2 Custom Colors",
  args: {
    data: [
      { id: "a", name: "Step 1", value: 100, color: "#6366f1" },
      { id: "b", name: "Step 2", value: 75, color: "#8b5cf6" },
      { id: "c", name: "Step 3", value: 50, color: "#a855f7" },
      { id: "d", name: "Step 4", value: 25, color: "#d946ef" },
    ],
    title: "Purple Gradient",
  },
};

export const PatternFills: Story = {
  name: "3.3 Pattern Fills",
  args: {
    data: [
      { id: "a", name: "Phase 1", value: 500, fill: { pattern: "stripes" as const } },
      { id: "b", name: "Phase 2", value: 350, fill: { pattern: "dots" as const } },
      { id: "c", name: "Phase 3", value: 200, fill: { pattern: "crosshatch" as const } },
      { id: "d", name: "Phase 4", value: 80 },
    ],
    title: "Pattern Fills",
  },
};

export const WideNeck: Story = {
  name: "3.4 Wide Neck (0.5)",
  args: {
    data: salesFunnel,
    neckRatio: 0.5,
    title: "Wide Neck",
  },
};

export const NoGap: Story = {
  name: "3.5 No Gap",
  args: {
    data: salesFunnel,
    stageGap: 0,
    title: "Continuous Funnel",
  },
};

export const FlatEnd: Story = {
  name: "3.6 Flat End",
  args: {
    data: salesFunnel,
    flatEnd: true,
    title: "Flat Bottom Funnel",
  },
};

// ─── 4. Legend ───────────────────────────────────────────────────────────────

export const LegendRight: Story = {
  name: "4.1 Legend Right",
  args: {
    data: salesFunnel,
    legendPosition: "right",
    title: "Legend Right",
    subtitle: "With subtitle",
  },
};

export const LegendTop: Story = {
  name: "4.2 Legend Top",
  args: {
    data: salesFunnel,
    legendPosition: "top",
    title: "Legend Top",
  },
};

export const LegendLeft: Story = {
  name: "4.3 Legend Left",
  args: {
    data: salesFunnel,
    legendPosition: "left",
    title: "Legend Left",
  },
};

export const NoLegend: Story = {
  name: "4.4 No Legend",
  args: {
    data: salesFunnel,
    showLegend: false,
    title: "No Legend",
  },
};

// ─── 5. Interaction ─────────────────────────────────────────────────────────

export const Clickable: Story = {
  name: "5.1 Stage Click",
  args: {
    data: salesFunnel,
    title: "Click a Stage",
    onStageClick: (stage, idx) => alert(`${stage.name}: ${stage.value} (index ${idx})`),
  },
};

// ─── 6. Export ───────────────────────────────────────────────────────────────

export const WithExport: Story = {
  name: "6.1 Export PNG/SVG/CSV",
  args: {
    data: salesFunnel,
    exportFormats: ["png", "svg", "csv"],
    title: "Exportable Funnel",
  },
};

// ─── 7. LIMS Use Case ──────────────────────────────────────────────────────

export const SampleProcessing: Story = {
  name: "7.1 LIMS Sample Processing",
  args: {
    data: [
      { id: "received", name: "Samples Received", value: 1500, severity: "primary" as const },
      { id: "registered", name: "Registered", value: 1480, severity: "info" as const },
      { id: "analyzed", name: "Analyzed", value: 1350, severity: "warning" as const },
      { id: "reviewed", name: "Reviewed", value: 1200, severity: "help" as const },
      { id: "approved", name: "Approved", value: 1150, severity: "success" as const },
      { id: "reported", name: "Reported", value: 1100, severity: "accent" as const },
    ],
    title: "Sample Processing Pipeline",
    subtitle: "Q1 2026",
    labelPosition: "right",
  },
};
