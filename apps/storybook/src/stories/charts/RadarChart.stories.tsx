import type { Meta, StoryObj } from "@storybook/react";
import { RadarChart } from "@kreatiware/react";
import type { RadarSeries } from "@kreatiware/react";

const meta: Meta<typeof RadarChart> = {
  title: "Charts/RadarChart",
  component: RadarChart,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 550, margin: "0 auto" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RadarChart>;

// ─── Sample Data ────────────────────────────────────────────────────────────

const rpgAxes = ["Speed", "Power", "Defense", "Range", "Magic", "Stamina"];

const rpgSeries: RadarSeries[] = [
  { id: "warrior", name: "Warrior", values: [40, 90, 85, 30, 20, 70] },
  { id: "mage", name: "Mage", values: [50, 30, 25, 80, 95, 40] },
  { id: "rogue", name: "Rogue", values: [95, 50, 30, 60, 40, 65] },
];

const skillAxes = ["JavaScript", "TypeScript", "React", "CSS", "Node.js", "Testing", "DevOps"];

const skillSeries: RadarSeries[] = [
  { id: "senior", name: "Senior Dev", values: [90, 85, 95, 80, 75, 70, 60] },
  { id: "junior", name: "Junior Dev", values: [60, 40, 50, 45, 30, 25, 15] },
];

const limsAxes = ["Accuracy", "Precision", "Sensitivity", "Specificity", "Throughput"];

const limsSeries: RadarSeries[] = [
  { id: "method-a", name: "Method A", values: [92, 88, 95, 85, 60] },
  { id: "method-b", name: "Method B", values: [78, 92, 70, 95, 90] },
];

// ─── 1. Basics ──────────────────────────────────────────────────────────────

export const Default: Story = {
  name: "1.1 Default",
  args: {
    axes: rpgAxes,
    series: [rpgSeries[0]],
    title: "Character Stats",
  },
};

export const MultipleSeries: Story = {
  name: "1.2 Multiple Series",
  args: {
    axes: rpgAxes,
    series: rpgSeries,
    title: "Character Comparison",
  },
};

export const FiveAxes: Story = {
  name: "1.3 Five Axes",
  args: {
    axes: limsAxes,
    series: limsSeries,
    title: "Method Comparison",
  },
};

export const ManyAxes: Story = {
  name: "1.4 Many Axes (10)",
  args: {
    axes: Array.from({ length: 10 }, (_, i) => `Metric ${i + 1}`),
    series: [
      {
        id: "a",
        name: "Series A",
        values: Array.from({ length: 10 }, () => Math.round(Math.random() * 80 + 20)),
      },
    ],
    title: "10 Axes",
  },
};

// ─── 2. Grid ────────────────────────────────────────────────────────────────

export const CircleGrid: Story = {
  name: "2.1 Circle Grid",
  args: {
    axes: rpgAxes,
    series: rpgSeries,
    gridShape: "circle",
    title: "Circle Grid Shape",
  },
};

export const FewGridLevels: Story = {
  name: "2.2 Three Grid Levels",
  args: {
    axes: rpgAxes,
    series: [rpgSeries[0]],
    gridLevels: 3,
    title: "3 Grid Levels",
  },
};

export const ManyGridLevels: Story = {
  name: "2.3 Ten Grid Levels",
  args: {
    axes: rpgAxes,
    series: [rpgSeries[0]],
    gridLevels: 10,
    title: "10 Grid Levels",
  },
};

export const NoGridLabels: Story = {
  name: "2.4 No Grid Labels",
  args: {
    axes: rpgAxes,
    series: rpgSeries,
    showGridLabels: false,
    title: "Grid Labels Hidden",
  },
};

// ─── 3. Styling ─────────────────────────────────────────────────────────────

export const SeverityColors: Story = {
  name: "3.1 Severity Colors",
  args: {
    axes: limsAxes,
    series: [
      { id: "a", name: "Passed", values: [92, 88, 95, 85, 60], severity: "success" },
      { id: "b", name: "Failed", values: [40, 35, 50, 45, 30], severity: "danger" },
    ],
    title: "Severity Colors",
  },
};

export const PatternFills: Story = {
  name: "3.2 Pattern Fills",
  args: {
    axes: rpgAxes,
    series: [
      { ...rpgSeries[0], fill: { pattern: "stripes" } },
      { ...rpgSeries[1], fill: { pattern: "dots" } },
      { ...rpgSeries[2], fill: { pattern: "crosshatch" } },
    ],
    title: "Pattern Fills",
  },
};

export const CustomFillOpacity: Story = {
  name: "3.3 High Fill Opacity",
  args: {
    axes: rpgAxes,
    series: [rpgSeries[0]],
    fillOpacity: 0.5,
    title: "Fill Opacity 0.5",
  },
};

export const ThickLines: Story = {
  name: "3.4 Thick Lines",
  args: {
    axes: rpgAxes,
    series: rpgSeries.map((s) => ({ ...s, lineWidth: 4 })),
    title: "Line Width 4",
  },
};

export const NoMarkers: Story = {
  name: "3.5 No Markers",
  args: {
    axes: rpgAxes,
    series: rpgSeries,
    showMarkers: false,
    title: "Markers Hidden",
  },
};

export const LargeMarkers: Story = {
  name: "3.6 Large Markers",
  args: {
    axes: rpgAxes,
    series: [rpgSeries[0]],
    markerSize: 6,
    title: "Marker Size 6",
  },
};

// ─── 4. Scale ───────────────────────────────────────────────────────────────

export const CustomMax: Story = {
  name: "4.1 Custom Max (100)",
  args: {
    axes: rpgAxes,
    series: rpgSeries,
    max: 100,
    title: "Fixed Max: 100",
  },
};

export const CustomRange: Story = {
  name: "4.2 Custom Range (20-80)",
  args: {
    axes: rpgAxes,
    series: [{ id: "a", name: "Balanced", values: [50, 55, 45, 60, 50, 48] }],
    min: 20,
    max: 80,
    title: "Range 20-80",
  },
};

// ─── 5. Legend ───────────────────────────────────────────────────────────────

export const LegendTop: Story = {
  name: "5.1 Legend Top",
  args: { axes: rpgAxes, series: rpgSeries, legendPosition: "top", title: "Legend Top" },
};

export const LegendRight: Story = {
  name: "5.2 Legend Right",
  args: {
    axes: rpgAxes,
    series: rpgSeries,
    legendPosition: "right",
    legendDirection: "vertical",
    title: "Legend Right",
  },
};

export const LegendHidden: Story = {
  name: "5.3 No Legend",
  args: { axes: rpgAxes, series: rpgSeries, legendPosition: "none", title: "No Legend" },
};

// ─── 6. Tooltip ─────────────────────────────────────────────────────────────

export const TooltipDefault: Story = {
  name: "6.1 Default Tooltip",
  args: { axes: rpgAxes, series: rpgSeries, title: "Hover a Point" },
};

export const CustomTooltip: Story = {
  name: "6.2 Custom Tooltip",
  args: {
    axes: skillAxes,
    series: skillSeries,
    title: "Custom Tooltip",
    tooltipRender: (s: RadarSeries, axis: string, value: number) => (
      <div>
        <strong>{s.name}</strong>
        <br />
        {axis}: {value}/100
      </div>
    ),
  },
};

export const SharedTooltip: Story = {
  name: "6.3 Shared Tooltip",
  args: {
    axes: rpgAxes,
    series: rpgSeries,
    tooltipMode: "shared",
    title: "Shared Tooltip — All Series per Axis",
  },
};

export const SeriesTooltip: Story = {
  name: "6.4 Series Tooltip",
  args: {
    axes: rpgAxes,
    series: rpgSeries,
    tooltipMode: "series",
    title: "Series Tooltip — All Axes for Hovered Series",
  },
};

// ─── 7. Interaction ─────────────────────────────────────────────────────────

export const ClickHandler: Story = {
  name: "7.1 Point Click",
  args: {
    axes: rpgAxes,
    series: rpgSeries,
    title: "Click a Point (check console)",
    onPointClick: (s: RadarSeries, axisIndex: number, value: number) =>
      console.log("Clicked:", s.name, "Axis:", axisIndex, "Value:", value),
  },
};

// ─── 8. Export ──────────────────────────────────────────────────────────────

export const WithExport: Story = {
  name: "8.1 Export (PNG, SVG, CSV)",
  args: {
    axes: rpgAxes,
    series: rpgSeries,
    title: "Character Stats",
    subtitle: "Right-click or use menu button",
    exportFormats: ["png", "svg", "csv"],
  },
};

// ─── 9. Sizing ──────────────────────────────────────────────────────────────

export const SmallChart: Story = {
  name: "9.1 Small (250px)",
  decorators: [(Story) => <div style={{ maxWidth: 250, margin: "0 auto" }}><Story /></div>],
  args: {
    axes: rpgAxes,
    series: [rpgSeries[0]],
    width: 250,
    height: 250,
    legendPosition: "none",
    showGridLabels: false,
  },
};

export const FixedWidth: Story = {
  name: "9.2 Fixed Width (500px)",
  args: {
    axes: rpgAxes,
    series: rpgSeries,
    width: 500,
    height: 400,
    title: "Fixed 500x400",
  },
};

// ─── 10. Combined ───────────────────────────────────────────────────────────

export const FullFeatured: Story = {
  name: "10.1 Full Featured",
  args: {
    axes: skillAxes,
    series: skillSeries,
    title: "Developer Skills",
    subtitle: "Senior vs Junior comparison",
    max: 100,
    gridShape: "polygon",
    gridLevels: 5,
    fillOpacity: 0.2,
    legendPosition: "right",
    legendDirection: "vertical",
    exportFormats: ["png", "svg", "csv"],
    onPointClick: (s: RadarSeries, ai: number, v: number) =>
      console.log(s.name, ai, v),
  },
};

export const LIMSMethodValidation: Story = {
  name: "10.2 LIMS — Method Validation",
  args: {
    axes: limsAxes,
    series: limsSeries,
    title: "Analytical Method Comparison",
    subtitle: "Validation Parameters",
    max: 100,
    gridShape: "circle",
    fillOpacity: 0.15,
    exportFormats: ["png", "csv"],
  },
};
