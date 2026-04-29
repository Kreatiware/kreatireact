import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SankeyChart } from "@kreatiware/react";

const meta: Meta<typeof SankeyChart> = {
  title: "Charts/SankeyChart",
  component: SankeyChart,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SankeyChart>;

const energyNodes = [
  { id: "coal", name: "Coal" },
  { id: "gas", name: "Natural Gas" },
  { id: "oil", name: "Oil" },
  { id: "solar", name: "Solar" },
  { id: "wind", name: "Wind" },
  { id: "electricity", name: "Electricity" },
  { id: "heat", name: "Heat" },
  { id: "residential", name: "Residential" },
  { id: "commercial", name: "Commercial" },
  { id: "industrial", name: "Industrial" },
];

const energyLinks = [
  { source: "coal", target: "electricity", value: 25 },
  { source: "coal", target: "heat", value: 10 },
  { source: "gas", target: "electricity", value: 20 },
  { source: "gas", target: "heat", value: 15 },
  { source: "oil", target: "heat", value: 12 },
  { source: "oil", target: "industrial", value: 8 },
  { source: "solar", target: "electricity", value: 10 },
  { source: "wind", target: "electricity", value: 8 },
  { source: "electricity", target: "residential", value: 25 },
  { source: "electricity", target: "commercial", value: 20 },
  { source: "electricity", target: "industrial", value: 18 },
  { source: "heat", target: "residential", value: 15 },
  { source: "heat", target: "commercial", value: 12 },
  { source: "heat", target: "industrial", value: 10 },
];

// ─── 1. Basics ──────────────────────────────────────────────────────────────

export const Default: Story = {
  name: "1.1 Default",
  args: {
    nodes: energyNodes,
    links: energyLinks,
    title: "Energy Flow",
    height: 450,
  },
};

export const WithValues: Story = {
  name: "1.2 Show Values",
  args: {
    nodes: energyNodes,
    links: energyLinks,
    showValues: true,
    title: "Energy Flow",
    valueFormat: (v: number) => `${v} TWh`,
    height: 450,
  },
};

export const NoLabels: Story = {
  name: "1.3 No Labels",
  args: {
    nodes: energyNodes,
    links: energyLinks,
    showLabels: false,
    title: "Tooltip Only",
    height: 450,
  },
};

// ─── 2. Styling ─────────────────────────────────────────────────────────────

export const CustomColors: Story = {
  name: "2.1 Custom Node Colors",
  args: {
    nodes: [
      { id: "coal", name: "Coal", color: "#374151" },
      { id: "gas", name: "Natural Gas", color: "#f59e0b" },
      { id: "solar", name: "Solar", color: "#eab308" },
      { id: "wind", name: "Wind", color: "#06b6d4" },
      { id: "electricity", name: "Electricity", color: "#3b82f6" },
      { id: "residential", name: "Residential", color: "#22c55e" },
      { id: "industrial", name: "Industrial", color: "#ef4444" },
    ],
    links: [
      { source: "coal", target: "electricity", value: 30 },
      { source: "gas", target: "electricity", value: 25 },
      { source: "solar", target: "electricity", value: 15 },
      { source: "wind", target: "electricity", value: 10 },
      { source: "electricity", target: "residential", value: 40 },
      { source: "electricity", target: "industrial", value: 40 },
    ],
    title: "Custom Colors",
    height: 350,
  },
};

export const SeverityColors: Story = {
  name: "2.2 Severity Colors",
  args: {
    nodes: [
      { id: "input", name: "Input", severity: "primary" as const },
      { id: "process", name: "Processing", severity: "info" as const },
      { id: "ok", name: "Passed", severity: "success" as const },
      { id: "fail", name: "Failed", severity: "danger" as const },
    ],
    links: [
      { source: "input", target: "process", value: 100 },
      { source: "process", target: "ok", value: 85 },
      { source: "process", target: "fail", value: 15 },
    ],
    title: "QA Pipeline",
    height: 300,
  },
};

export const WideNodes: Story = {
  name: "2.3 Wide Nodes",
  args: {
    nodes: energyNodes.slice(0, 6),
    links: energyLinks.slice(0, 6),
    nodeWidth: 30,
    nodePadding: 15,
    title: "Wide Nodes",
    height: 350,
  },
};

export const HighOpacity: Story = {
  name: "2.4 High Link Opacity",
  args: {
    nodes: energyNodes.slice(0, 6),
    links: energyLinks.slice(0, 6),
    linkOpacity: 0.7,
    title: "High Opacity Links",
    height: 350,
  },
};

// ─── 3. Interaction ─────────────────────────────────────────────────────────

export const Clickable: Story = {
  name: "3.1 Node & Link Click",
  args: {
    nodes: energyNodes,
    links: energyLinks,
    title: "Click Nodes or Links",
    height: 450,
    onNodeClick: (node) => alert(`Node: ${node.name}`),
    onLinkClick: (link) => alert(`Link: ${link.source} → ${link.target}: ${link.value}`),
  },
};

// ─── 4. Export ───────────────────────────────────────────────────────────────

export const WithExport: Story = {
  name: "4.1 Export All Formats",
  args: {
    nodes: energyNodes,
    links: energyLinks,
    exportFormats: ["png", "svg", "csv", "json"],
    title: "Exportable Sankey",
    height: 450,
  },
};

// ─── 5. Simple ──────────────────────────────────────────────────────────────

export const Simple: Story = {
  name: "5.1 Simple 3-Node",
  args: {
    nodes: [
      { id: "a", name: "Source A" },
      { id: "b", name: "Source B" },
      { id: "c", name: "Target" },
    ],
    links: [
      { source: "a", target: "c", value: 60 },
      { source: "b", target: "c", value: 40 },
    ],
    showValues: true,
    title: "Simple Flow",
    height: 250,
  },
};

// ─── 6. LIMS Use Case ──────────────────────────────────────────────────────

export const SampleFlow: Story = {
  name: "6.1 LIMS Sample Flow",
  args: {
    nodes: [
      { id: "received", name: "Received", severity: "primary" as const },
      { id: "prep", name: "Preparation", severity: "info" as const },
      { id: "analysis", name: "Analysis", severity: "warning" as const },
      { id: "review", name: "Review", severity: "help" as const },
      { id: "approved", name: "Approved", severity: "success" as const },
      { id: "rejected", name: "Rejected", severity: "danger" as const },
      { id: "retest", name: "Retest", severity: "accent" as const },
    ],
    links: [
      { source: "received", target: "prep", value: 500 },
      { source: "prep", target: "analysis", value: 490 },
      { source: "analysis", target: "review", value: 480 },
      { source: "review", target: "approved", value: 420 },
      { source: "review", target: "rejected", value: 40 },
      { source: "review", target: "retest", value: 20 },
      { source: "retest", target: "analysis", value: 18 },
    ],
    showValues: true,
    title: "Sample Processing Flow",
    subtitle: "Q1 2026",
    height: 400,
  },
};
