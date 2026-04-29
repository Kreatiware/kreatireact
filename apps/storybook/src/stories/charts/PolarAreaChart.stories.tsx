import type { Meta, StoryObj } from "@storybook/react";
import { PolarAreaChart } from "@kreatiware/react";
import type { PolarDataItem } from "@kreatiware/react";

const meta: Meta<typeof PolarAreaChart> = {
  title: "Charts/PolarAreaChart",
  component: PolarAreaChart,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 550, margin: "0 auto" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PolarAreaChart>;

const basicData: PolarDataItem[] = [
  { id: "js", name: "JavaScript", value: 90 },
  { id: "ts", name: "TypeScript", value: 75 },
  { id: "react", name: "React", value: 85 },
  { id: "css", name: "CSS", value: 70 },
  { id: "node", name: "Node.js", value: 55 },
  { id: "test", name: "Testing", value: 40 },
];

const seasonData: PolarDataItem[] = [
  { id: "jan", name: "Jan", value: 30 },
  { id: "feb", name: "Feb", value: 35 },
  { id: "mar", name: "Mar", value: 50 },
  { id: "apr", name: "Apr", value: 65 },
  { id: "may", name: "May", value: 80 },
  { id: "jun", name: "Jun", value: 95 },
  { id: "jul", name: "Jul", value: 100 },
  { id: "aug", name: "Aug", value: 90 },
  { id: "sep", name: "Sep", value: 70 },
  { id: "oct", name: "Oct", value: 55 },
  { id: "nov", name: "Nov", value: 40 },
  { id: "dec", name: "Dec", value: 28 },
];

const severityData: PolarDataItem[] = [
  { id: "critical", name: "Critical", value: 12, severity: "danger" },
  { id: "high", name: "High", value: 28, severity: "warning" },
  { id: "medium", name: "Medium", value: 45, severity: "info" },
  { id: "low", name: "Low", value: 65, severity: "success" },
  { id: "none", name: "None", value: 80, severity: "help" },
];

// ─── 1. Basics ──────────────────────────────────────────────────────────────

export const Default: Story = {
  name: "1.1 Default",
  args: { data: basicData, title: "Skill Levels" },
};

export const MonthlyData: Story = {
  name: "1.2 Monthly (12 sectors)",
  args: { data: seasonData, title: "Monthly Temperature", max: 100 },
};

export const ThreeItems: Story = {
  name: "1.3 Three Items",
  args: {
    data: [
      { id: "a", name: "Design", value: 80 },
      { id: "b", name: "Code", value: 95 },
      { id: "c", name: "Test", value: 50 },
    ],
    title: "Project Phases",
  },
};

// ─── 2. Grid ────────────────────────────────────────────────────────────────

export const PolygonGrid: Story = {
  name: "2.1 Polygon Grid",
  args: { data: basicData, gridShape: "polygon", title: "Polygon Grid" },
};

export const ManyGridLevels: Story = {
  name: "2.2 Six Grid Levels",
  args: { data: basicData, gridLevels: 6, title: "6 Grid Levels" },
};

export const NoGridLabels: Story = {
  name: "2.3 No Grid Labels",
  args: { data: basicData, showGridLabels: false, title: "Grid Labels Hidden" },
};

// ─── 3. Styling ─────────────────────────────────────────────────────────────

export const SeverityColors: Story = {
  name: "3.1 Severity Colors",
  args: { data: severityData, title: "Issue Severity" },
};

export const PatternFills: Story = {
  name: "3.2 Pattern Fills",
  args: {
    data: [
      { id: "a", name: "Alpha", value: 80, fill: { pattern: "stripes" } },
      { id: "b", name: "Beta", value: 60, fill: { pattern: "dots" } },
      { id: "c", name: "Gamma", value: 45, fill: { pattern: "crosshatch" } },
      { id: "d", name: "Delta", value: 70 },
    ],
    title: "Pattern Fills",
  },
};

export const NoPadAngle: Story = {
  name: "3.3 No Gap",
  args: { data: basicData, padAngle: 0, title: "No Gap Between Sectors" },
};

export const WidePadAngle: Story = {
  name: "3.4 Wide Gap",
  args: { data: basicData, padAngle: 4, title: "Wide Gap (4 degrees)" },
};

// ─── 4. Legend ───────────────────────────────────────────────────────────────

export const LegendRight: Story = {
  name: "4.1 Legend Right",
  args: { data: basicData, legendPosition: "right", legendDirection: "vertical", title: "Legend Right" },
};

export const LegendHidden: Story = {
  name: "4.2 No Legend",
  args: { data: basicData, legendPosition: "none", title: "No Legend" },
};

// ─── 5. Export ──────────────────────────────────────────────────────────────

export const WithExport: Story = {
  name: "5.1 Export",
  args: {
    data: basicData,
    title: "Skill Levels",
    subtitle: "Right-click for options",
    exportFormats: ["png", "svg", "csv"],
  },
};

// ─── 6. Combined ────────────────────────────────────────────────────────────

export const FullFeatured: Story = {
  name: "6.1 Full Featured",
  args: {
    data: seasonData,
    title: "Monthly Rainfall",
    subtitle: "mm per month — 2025",
    max: 120,
    gridLevels: 4,
    gridShape: "circle",
    legendPosition: "right",
    legendDirection: "vertical",
    exportFormats: ["png", "csv"],
    onSliceClick: (item: PolarDataItem) => console.log("Clicked:", item.name),
  },
};

export const LIMSTestVolume: Story = {
  name: "6.2 LIMS — Test Volume by Department",
  args: {
    data: [
      { id: "hema", name: "Hematology", value: 450, severity: "danger" },
      { id: "chem", name: "Chemistry", value: 380, severity: "warning" },
      { id: "micro", name: "Microbiology", value: 220, severity: "info" },
      { id: "immuno", name: "Immunology", value: 180, severity: "success" },
      { id: "path", name: "Pathology", value: 95, severity: "help" },
    ],
    title: "Test Volume by Department",
    subtitle: "April 2026",
    gridShape: "circle",
    exportFormats: ["png", "csv"],
  },
};
