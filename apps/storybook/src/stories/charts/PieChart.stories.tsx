import type { Meta, StoryObj } from "@storybook/react";
import { PieChart, DonutChart } from "@kreatiware/react";
import type { PieDataItem } from "@kreatiware/react";

const meta: Meta<typeof PieChart> = {
  title: "Charts/PieChart",
  component: PieChart,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 500, margin: "0 auto" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PieChart>;

// ─── Sample Data ────────────────────────────────────────────────────────────

const basicData: PieDataItem[] = [
  { id: "chrome", name: "Chrome", value: 65 },
  { id: "firefox", name: "Firefox", value: 12 },
  { id: "safari", name: "Safari", value: 10 },
  { id: "edge", name: "Edge", value: 8 },
  { id: "other", name: "Other", value: 5 },
];

const revenueData: PieDataItem[] = [
  { id: "product", name: "Product Sales", value: 45000 },
  { id: "services", name: "Services", value: 28000 },
  { id: "licensing", name: "Licensing", value: 15000 },
  { id: "support", name: "Support", value: 8000 },
  { id: "training", name: "Training", value: 4000 },
];

const severityData: PieDataItem[] = [
  { id: "success", name: "Passed", value: 42, severity: "success" },
  { id: "warning", name: "Warnings", value: 12, severity: "warning" },
  { id: "danger", name: "Failed", value: 6, severity: "danger" },
  { id: "info", name: "Skipped", value: 8, severity: "info" },
];

const patternData: PieDataItem[] = [
  { id: "a", name: "Category A", value: 40, fill: { pattern: "stripes" } },
  { id: "b", name: "Category B", value: 30, fill: { pattern: "dots" } },
  { id: "c", name: "Category C", value: 20, fill: { pattern: "crosshatch" } },
  { id: "d", name: "Category D", value: 10 },
];

const manySmallData: PieDataItem[] = [
  { id: "a", name: "Product A", value: 50 },
  { id: "b", name: "Product B", value: 30 },
  { id: "c", name: "Product C", value: 8 },
  { id: "d", name: "Product D", value: 4 },
  { id: "e", name: "Product E", value: 3 },
  { id: "f", name: "Product F", value: 2 },
  { id: "g", name: "Product G", value: 1.5 },
  { id: "h", name: "Product H", value: 1 },
  { id: "i", name: "Product I", value: 0.5 },
];

// ─── 1. Basics ──────────────────────────────────────────────────────────────

export const Default: Story = {
  name: "1.1 Default",
  args: { data: basicData, title: "Browser Market Share" },
};

export const WithSubtitle: Story = {
  name: "1.2 With Subtitle",
  args: { data: basicData, title: "Browser Market Share", subtitle: "Q1 2026 — Desktop only" },
};

export const TwoSlices: Story = {
  name: "1.3 Two Slices",
  args: {
    data: [
      { id: "yes", name: "Yes", value: 72 },
      { id: "no", name: "No", value: 28 },
    ],
    title: "Survey Results",
  },
};

export const SingleSlice: Story = {
  name: "1.4 Single Slice",
  args: {
    data: [{ id: "all", name: "Complete", value: 100 }],
    title: "Single Value",
  },
};

export const ManySlices: Story = {
  name: "1.5 Many Slices (12)",
  args: {
    data: Array.from({ length: 12 }, (_, i) => ({
      id: `item-${i}`,
      name: `Category ${String.fromCharCode(65 + i)}`,
      value: Math.round(Math.random() * 50 + 10),
    })),
    title: "12 Categories",
  },
};

// ─── 2. Donut ───────────────────────────────────────────────────────────────

export const DonutDefault: Story = {
  name: "2.1 Donut Default",
  render: () => (
    <DonutChart data={revenueData} title="Revenue Breakdown" subtitle="Annual 2025" />
  ),
};

export const DonutCenterLabel: Story = {
  name: "2.2 Donut — Center Label",
  render: () => (
    <DonutChart
      data={revenueData}
      title="Revenue"
      centerLabel={
        <div>
          <div className="k-donut-center__value">$100k</div>
          <div className="k-donut-center__label">Total</div>
        </div>
      }
    />
  ),
};

export const DonutCenterTemplate: Story = {
  name: "2.3 Donut — Center Template",
  render: () => (
    <DonutChart
      data={severityData}
      title="Test Results"
      centerTemplate={(total) => (
        <div>
          <div className="k-donut-center__value">{total}</div>
          <div className="k-donut-center__label">Total tests</div>
        </div>
      )}
    />
  ),
};

export const DonutThinRing: Story = {
  name: "2.4 Donut — Thin Ring",
  args: { data: basicData, innerRadius: 0.8, title: "Thin Donut" },
};

export const DonutWideRing: Story = {
  name: "2.5 Donut — Wide Ring",
  args: { data: basicData, innerRadius: 0.3, title: "Wide Donut" },
};

// ─── 3. Styling ─────────────────────────────────────────────────────────────

export const SeverityColors: Story = {
  name: "3.1 Severity Colors",
  args: { data: severityData, title: "Test Results" },
};

export const PatternFills: Story = {
  name: "3.2 Pattern Fills",
  args: { data: patternData, title: "Pattern Fills for Accessibility" },
};

export const PadAngle: Story = {
  name: "3.3 Pad Angle",
  args: { data: basicData, padAngle: 2, title: "With Gaps" },
};

export const CornerRadius: Story = {
  name: "3.4 Corner Radius",
  args: { data: basicData, padAngle: 3, cornerRadius: 6, title: "Rounded Corners" },
};

export const DonutCornerRadius: Story = {
  name: "3.5 Donut + Corner Radius",
  args: { data: basicData, innerRadius: 0.6, padAngle: 3, cornerRadius: 6, title: "Rounded Donut" },
};

// ─── 4. Labels ──────────────────────────────────────────────────────────────

export const OutsideLabels: Story = {
  name: "4.1 Outside Labels",
  args: { data: basicData, showLabels: true, labelPosition: "outside", title: "Outside Labels" },
};

export const InsideLabels: Story = {
  name: "4.2 Inside Labels",
  args: { data: basicData, showLabels: true, labelPosition: "inside", title: "Inside Labels" },
};

export const CustomLabelFormat: Story = {
  name: "4.3 Custom Label Format",
  args: {
    data: revenueData,
    showLabels: true,
    labelFormat: (item: PieDataItem) => `$${(item.value / 1000).toFixed(0)}k`,
    title: "Revenue with Custom Labels",
  },
};

export const LabelThreshold: Story = {
  name: "4.4 Label Threshold (10%)",
  args: {
    data: basicData,
    showLabels: true,
    labelThreshold: 10,
    title: "Labels Only on Large Slices",
  },
};

// ─── 5. Others Grouping ─────────────────────────────────────────────────────

export const OthersGrouping: Story = {
  name: "5.1 Others Threshold (5%)",
  args: {
    data: manySmallData,
    othersThreshold: 5,
    title: "Small Slices Grouped",
    subtitle: "Items below 5% grouped as Others",
  },
};

export const OthersGrouping10: Story = {
  name: "5.2 Others Threshold (10%)",
  args: {
    data: manySmallData,
    othersThreshold: 10,
    title: "Aggressive Grouping",
    subtitle: "Items below 10% grouped as Others",
  },
};

// ─── 6. Legend ───────────────────────────────────────────────────────────────

export const LegendTop: Story = {
  name: "6.1 Legend Top",
  args: { data: basicData, legendPosition: "top", title: "Legend on Top" },
};

export const LegendRight: Story = {
  name: "6.2 Legend Right",
  args: { data: basicData, legendPosition: "right", legendDirection: "vertical", title: "Legend on Right" },
};

export const LegendLeft: Story = {
  name: "6.3 Legend Left",
  args: { data: basicData, legendPosition: "left", legendDirection: "vertical", title: "Legend on Left" },
};

export const LegendHidden: Story = {
  name: "6.4 No Legend",
  args: { data: basicData, legendPosition: "none", title: "No Legend" },
};

// ─── 7. Tooltip ─────────────────────────────────────────────────────────────

export const TooltipDefault: Story = {
  name: "7.1 Default Tooltip",
  args: { data: basicData, title: "Hover for Tooltip" },
};

export const CustomTooltip: Story = {
  name: "7.2 Custom Tooltip",
  args: {
    data: revenueData,
    title: "Custom Tooltip",
    tooltipRender: (item: PieDataItem, pct: number) => (
      <div>
        <strong>{item.name}</strong>
        <br />
        ${item.value.toLocaleString()} ({pct.toFixed(1)}%)
      </div>
    ),
  },
};

// ─── 8. Interaction ─────────────────────────────────────────────────────────

export const ClickHandler: Story = {
  name: "8.1 Slice Click",
  args: {
    data: basicData,
    title: "Click a Slice (check console)",
    onSliceClick: (item: PieDataItem) => console.log("Clicked:", item.name),
  },
};

export const SortDescending: Story = {
  name: "8.2 Sorted Descending",
  args: { data: basicData, sortDescending: true, title: "Sorted by Value" },
};

// ─── 9. Angles ──────────────────────────────────────────────────────────────

export const Semicircle: Story = {
  name: "9.1 Semicircle",
  args: { data: basicData, startAngle: -90, endAngle: 90, title: "Semicircle", height: 200 },
};

export const ThreeQuarters: Story = {
  name: "9.2 Three Quarters",
  args: { data: basicData, startAngle: -90, endAngle: 180, innerRadius: 0.6, title: "Three Quarter Donut" },
};

// ─── 10. Sizing ─────────────────────────────────────────────────────────────

export const FixedWidth: Story = {
  name: "10.1 Fixed Width (400px)",
  args: { data: basicData, width: 400, height: 300, title: "Fixed 400x300" },
};

export const SmallChart: Story = {
  name: "10.2 Small (200px)",
  decorators: [(Story) => <div style={{ maxWidth: 200, margin: "0 auto" }}><Story /></div>],
  args: { data: basicData, width: 200, height: 200, legendPosition: "none" },
};

// ─── 11. Export ─────────────────────────────────────────────────────────────

export const WithExport: Story = {
  name: "11.1 Export (PNG, SVG, CSV)",
  args: {
    data: revenueData,
    title: "Revenue Breakdown",
    subtitle: "Right-click or use menu button",
    exportFormats: ["png", "svg", "csv"],
  },
};

// ─── 12. Combined ───────────────────────────────────────────────────────────

export const FullFeatured: Story = {
  name: "12.1 Full Featured",
  args: {
    data: revenueData,
    title: "Annual Revenue",
    subtitle: "Fiscal Year 2025",
    innerRadius: 0.55,
    padAngle: 2,
    cornerRadius: 4,
    showLabels: true,
    labelPosition: "outside",
    labelFormat: (item: PieDataItem, pct: number) => `${item.name}: ${pct.toFixed(0)}%`,
    legendPosition: "right",
    legendDirection: "vertical",
    exportFormats: ["png", "svg", "csv"],
    onSliceClick: (item: PieDataItem) => console.log("Clicked:", item.name),
  },
};

export const LIMSSampleDistribution: Story = {
  name: "12.2 LIMS — Sample Distribution",
  render: () => (
    <DonutChart
      data={[
        { id: "blood", name: "Blood", value: 340, severity: "danger" },
        { id: "urine", name: "Urine", value: 220, severity: "warning" },
        { id: "tissue", name: "Tissue", value: 85, severity: "info" },
        { id: "swab", name: "Swab", value: 55, severity: "success" },
        { id: "other", name: "Other", value: 30, severity: "help" },
      ]}
      title="Sample Type Distribution"
      subtitle="Laboratory — April 2026"
      padAngle={1}
      showLabels={true}
      exportFormats={["png", "csv"]}
      centerTemplate={(total) => (
        <div>
          <div className="k-donut-center__value">{total}</div>
          <div className="k-donut-center__label">Samples</div>
        </div>
      )}
    />
  ),
};
