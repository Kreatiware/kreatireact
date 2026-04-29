import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TreemapChart } from "@kreatiware/react";

const meta: Meta<typeof TreemapChart> = {
  title: "Charts/TreemapChart",
  component: TreemapChart,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TreemapChart>;

const diskUsage = [
  { id: "photos", name: "Photos", value: 45 },
  { id: "videos", name: "Videos", value: 30 },
  { id: "docs", name: "Documents", value: 15 },
  { id: "music", name: "Music", value: 8 },
  { id: "apps", name: "Applications", value: 20 },
  { id: "system", name: "System", value: 12 },
  { id: "other", name: "Other", value: 5 },
];

// ─── 1. Basics ──────────────────────────────────────────────────────────────

export const Default: Story = {
  name: "1.1 Default",
  args: {
    data: diskUsage,
    title: "Disk Usage (GB)",
  },
};

export const WithValues: Story = {
  name: "1.2 Show Values",
  args: {
    data: diskUsage,
    showValues: true,
    title: "Disk Usage",
    valueFormat: (v: number) => `${v} GB`,
  },
};

export const NoLabels: Story = {
  name: "1.3 No Labels",
  args: {
    data: diskUsage,
    showLabels: false,
    title: "Tooltip Only",
  },
};

export const CenterLabels: Story = {
  name: "1.4 Center Labels",
  args: {
    data: diskUsage,
    labelAlign: "center",
    showValues: true,
    valueFormat: (v: number) => `${v} GB`,
    title: "Centered Labels",
  },
};

// ─── 2. Styling ─────────────────────────────────────────────────────────────

export const CustomColors: Story = {
  name: "2.1 Custom Colors",
  args: {
    data: [
      { id: "a", name: "React", value: 40, color: "#61dafb" },
      { id: "b", name: "Vue", value: 30, color: "#42b883" },
      { id: "c", name: "Angular", value: 25, color: "#dd0031" },
      { id: "d", name: "Svelte", value: 15, color: "#ff3e00" },
      { id: "e", name: "Solid", value: 8, color: "#4f88c6" },
    ],
    showValues: true,
    title: "Framework Popularity",
  },
};

export const SeverityColors: Story = {
  name: "2.2 Severity Colors",
  args: {
    data: [
      { id: "ok", name: "Passed", value: 85, severity: "success" as const },
      { id: "warn", name: "Warnings", value: 12, severity: "warning" as const },
      { id: "fail", name: "Failed", value: 3, severity: "danger" as const },
    ],
    showValues: true,
    title: "Test Results",
  },
};

export const RoundedCells: Story = {
  name: "2.3 Rounded Cells",
  args: {
    data: diskUsage,
    cellRadius: 6,
    cellGap: 4,
    title: "Rounded Treemap",
  },
};

export const NoCellGap: Story = {
  name: "2.4 No Gap",
  args: {
    data: diskUsage,
    cellGap: 0,
    cellRadius: 0,
    title: "Continuous Treemap",
  },
};

// ─── 3. Interaction ─────────────────────────────────────────────────────────

export const Clickable: Story = {
  name: "3.1 Node Click",
  args: {
    data: diskUsage,
    title: "Click a Node",
    onNodeClick: (node) => alert(`${node.name}: ${node.value}`),
  },
};

// ─── 4. Export ───────────────────────────────────────────────────────────────

export const WithExport: Story = {
  name: "4.1 Export PNG/SVG/CSV/JSON",
  args: {
    data: diskUsage,
    exportFormats: ["png", "svg", "csv", "json"],
    title: "Exportable Treemap",
  },
};

// ─── 5. Sizing ──────────────────────────────────────────────────────────────

export const FixedSize: Story = {
  name: "5.1 Fixed 500x300",
  args: {
    data: diskUsage,
    width: 500,
    height: 300,
    title: "Fixed Size",
  },
};

// ─── 6. Many Items ──────────────────────────────────────────────────────────

export const ManyItems: Story = {
  name: "6.1 Many Items",
  render: () => {
    const items = Array.from({ length: 30 }, (_, i) => ({
      id: `item-${i}`,
      name: `Item ${i + 1}`,
      value: Math.round(Math.random() * 100 + 5),
    }));
    return (
      <TreemapChart
        data={items}
        showValues
        title="30 Items"
        height={500}
      />
    );
  },
};

// ─── 7. LIMS Use Case ──────────────────────────────────────────────────────

export const SampleDistribution: Story = {
  name: "7.1 LIMS Sample Distribution",
  args: {
    data: [
      { id: "water", name: "Water Samples", value: 450, severity: "primary" as const },
      { id: "soil", name: "Soil Samples", value: 280, severity: "warning" as const },
      { id: "air", name: "Air Samples", value: 120, severity: "info" as const },
      { id: "food", name: "Food Samples", value: 95, severity: "success" as const },
      { id: "pharma", name: "Pharmaceutical", value: 180, severity: "help" as const },
      { id: "waste", name: "Waste Water", value: 320, severity: "danger" as const },
      { id: "bio", name: "Biological", value: 60, severity: "accent" as const },
    ],
    showValues: true,
    valueFormat: (v: number) => `${v} samples`,
    title: "Sample Distribution by Type",
    subtitle: "Q1 2026",
    height: 450,
  },
};
