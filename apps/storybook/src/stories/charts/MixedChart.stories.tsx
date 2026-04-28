import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { MixedChart } from "../../../../../packages/react/src/components/Chart/cartesian/MixedChart";
import { ChartGroup } from "../../../../../packages/react/src/components/Chart/composition/ChartGroup";
import type { ChartSeries } from "../../../../../packages/react/src/components/Chart/core/types";

const meta = {
  title: "Charts/MixedChart",
  component: MixedChart,
  parameters: { layout: "centered" },
  args: { series: [], layers: [] },
  decorators: [
    (Story: React.FC) => (
      <div
        style={{
          background: "#fff",
          padding: 32,
          borderRadius: 8,
          width: 700,
          maxWidth: "100%",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MixedChart>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Sample data ────────────────────────────────────────────────────────────

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

const revenue: ChartSeries = {
  id: "revenue",
  name: "Revenue",
  data: [
    { x: 0, y: 40 },
    { x: 1, y: 65 },
    { x: 2, y: 55 },
    { x: 3, y: 80 },
    { x: 4, y: 72 },
    { x: 5, y: 95 },
  ],
};

const costs: ChartSeries = {
  id: "costs",
  name: "Costs",
  data: [
    { x: 0, y: 20 },
    { x: 1, y: 30 },
    { x: 2, y: 25 },
    { x: 3, y: 35 },
    { x: 4, y: 32 },
    { x: 5, y: 40 },
  ],
};

const target: ChartSeries = {
  id: "target",
  name: "Target",
  data: [
    { x: 0, y: 50 },
    { x: 1, y: 55 },
    { x: 2, y: 60 },
    { x: 3, y: 65 },
    { x: 4, y: 70 },
    { x: 5, y: 75 },
  ],
};

const outliers: ChartSeries = {
  id: "outliers",
  name: "Outliers",
  markerSymbol: "diamond",
  data: [
    { x: 0, y: 45 },
    { x: 1, y: 70 },
    { x: 2, y: 48 },
    { x: 3, y: 90 },
    { x: 4, y: 60 },
    { x: 5, y: 85 },
  ],
};

const numericA: ChartSeries = {
  id: "a",
  name: "Series A",
  data: [
    { x: 10, y: 30 },
    { x: 20, y: 50 },
    { x: 35, y: 45 },
    { x: 40, y: 70 },
    { x: 55, y: 60 },
    { x: 65, y: 85 },
    { x: 80, y: 75 },
    { x: 90, y: 95 },
  ],
};

const numericB: ChartSeries = {
  id: "b",
  name: "Series B",
  data: [
    { x: 10, y: 20 },
    { x: 20, y: 35 },
    { x: 35, y: 40 },
    { x: 40, y: 55 },
    { x: 55, y: 50 },
    { x: 65, y: 70 },
    { x: 80, y: 65 },
    { x: 90, y: 80 },
  ],
};

// ─── 1. Basics ──────────────────────────────────────────────────────────────

/** 1.1 — Bar + Line (most common mixed chart). */
export const BarAndLine: Story = {
  args: {
    series: [revenue, target],
    layers: [
      { type: "bar", seriesIds: ["revenue"], barRadius: 4 },
      { type: "line", seriesIds: ["target"], strokeWidth: 2, curve: "smooth" },
    ],
    xAxis: { categories: months },
    yAxis: { label: "Value" },
    height: 350,
  },
};

/** 1.2 — Area + Line. */
export const AreaAndLine: Story = {
  args: {
    series: [costs, target],
    layers: [
      { type: "area", seriesIds: ["costs"], areaOpacity: 0.3, curve: "smooth" },
      { type: "line", seriesIds: ["target"], strokeWidth: 2 },
    ],
    xAxis: { categories: months },
    yAxis: { label: "Value" },
    height: 350,
  },
};

/** 1.3 — Scatter + Line (regression overlay). */
export const ScatterAndLine: Story = {
  args: {
    series: [numericA, { ...numericB, name: "Trend" }],
    layers: [
      { type: "scatter", seriesIds: ["a"], markerSize: 7 },
      { type: "line", seriesIds: ["b"], strokeWidth: 2, curve: "smooth" },
    ],
    xAxis: { label: "X" },
    yAxis: { label: "Y" },
    height: 350,
  },
};

/** 1.4 — All 4 types combined. */
export const AllFourTypes: Story = {
  args: {
    series: [revenue, costs, target, outliers],
    layers: [
      { type: "area", seriesIds: ["costs"], areaOpacity: 0.3 },
      { type: "bar", seriesIds: ["revenue"], barRadius: 4 },
      { type: "line", seriesIds: ["target"], strokeWidth: 2 },
      { type: "scatter", seriesIds: ["outliers"], markerSize: 8 },
    ],
    xAxis: { categories: months },
    yAxis: { label: "Value" },
    title: "All Chart Types",
    height: 400,
  },
};

// ─── 2. Data Labels ─────────────────────────────────────────────────────────

/** 2.1 — Data labels on bar layer. */
export const BarDataLabels: Story = {
  args: {
    series: [revenue, target],
    layers: [
      { type: "bar", seriesIds: ["revenue"], barRadius: 4, showDataLabels: true },
      { type: "line", seriesIds: ["target"], strokeWidth: 2 },
    ],
    xAxis: { categories: months },
    yAxis: { label: "Value" },
    height: 350,
  },
};

/** 2.2 — Data labels on line layer. */
export const LineDataLabels: Story = {
  args: {
    series: [revenue, target],
    layers: [
      { type: "bar", seriesIds: ["revenue"], barRadius: 4 },
      { type: "line", seriesIds: ["target"], strokeWidth: 2, showDataLabels: true },
    ],
    xAxis: { categories: months },
    yAxis: { label: "Value" },
    height: 350,
  },
};

/** 2.3 — Data labels on all layers. */
export const AllDataLabels: Story = {
  args: {
    series: [revenue, costs, target, outliers],
    layers: [
      { type: "area", seriesIds: ["costs"], areaOpacity: 0.3, showDataLabels: true },
      { type: "bar", seriesIds: ["revenue"], barRadius: 4, showDataLabels: true },
      { type: "line", seriesIds: ["target"], strokeWidth: 2, showDataLabels: true },
      { type: "scatter", seriesIds: ["outliers"], markerSize: 8, showDataLabels: true },
    ],
    xAxis: { categories: months },
    yAxis: { label: "Value" },
    height: 400,
  },
};

// ─── 3. Trendlines ──────────────────────────────────────────────────────────

/** 3.1 — Scatter with trendline in mixed context. */
export const ScatterTrendline: StoryObj = {
  render: () => (
    <MixedChart
      series={[
        { ...numericA, trendline: { type: "linear" } },
        numericB,
      ]}
      layers={[
        { type: "scatter", seriesIds: ["a"], markerSize: 7 },
        { type: "line", seriesIds: ["b"], strokeWidth: 2, curve: "smooth" },
      ]}
      xAxis={{ label: "X" }}
      yAxis={{ label: "Y" }}
      height={350}
    />
  ),
};

/** 3.2 — Area with trendline. */
export const AreaTrendline: StoryObj = {
  render: () => (
    <MixedChart
      series={[
        { ...costs, trendline: { type: "linear" } },
        target,
      ]}
      layers={[
        { type: "area", seriesIds: ["costs"], areaOpacity: 0.3 },
        { type: "line", seriesIds: ["target"], strokeWidth: 2 },
      ]}
      xAxis={{ categories: months }}
      yAxis={{ label: "Value" }}
      height={350}
    />
  ),
};

// ─── 4. Error Bars ──────────────────────────────────────────────────────────

/** 4.1 — Line layer with error bars. */
export const LineErrorBars: StoryObj = {
  render: () => (
    <MixedChart
      series={[
        revenue,
        {
          ...target,
          errorMargin: 5,
        },
      ]}
      layers={[
        { type: "bar", seriesIds: ["revenue"], barRadius: 4 },
        { type: "line", seriesIds: ["target"], strokeWidth: 2 },
      ]}
      xAxis={{ categories: months }}
      yAxis={{ label: "Value" }}
      height={350}
    />
  ),
};

// ─── 5. Color Zones ─────────────────────────────────────────────────────────

/** 5.1 — Line layer with color zones. */
export const LineColorZones: StoryObj = {
  render: () => (
    <MixedChart
      series={[
        revenue,
        {
          ...target,
          zones: [
            { value: 60, color: "var(--kreati-severity-danger)" },
            { value: 70, color: "var(--kreati-severity-warning)" },
          ],
        },
      ]}
      layers={[
        { type: "bar", seriesIds: ["revenue"], barRadius: 4 },
        { type: "line", seriesIds: ["target"], strokeWidth: 3 },
      ]}
      xAxis={{ categories: months }}
      yAxis={{ label: "Value" }}
      height={350}
    />
  ),
};

// ─── 6. Stacking ────────────────────────────────────────────────────────────

/** 6.1 — Stacked bars + line overlay. */
export const StackedBarsWithLine: Story = {
  args: {
    series: [revenue, costs, target],
    layers: [
      { type: "bar", seriesIds: ["revenue", "costs"], barRadius: 4, groupMode: "stacked" },
      { type: "line", seriesIds: ["target"], strokeWidth: 2 },
    ],
    xAxis: { categories: months },
    yAxis: { label: "Value" },
    height: 350,
  },
};

/** 6.2 — Stacked area + scatter overlay. */
export const StackedAreaWithScatter: Story = {
  args: {
    series: [revenue, costs, outliers],
    layers: [
      { type: "area", seriesIds: ["revenue", "costs"], stackMode: "stacked", areaOpacity: 0.4 },
      { type: "scatter", seriesIds: ["outliers"], markerSize: 8 },
    ],
    xAxis: { categories: months },
    yAxis: { label: "Value" },
    height: 350,
  },
};

// ─── 7. Pattern Fills ───────────────────────────────────────────────────────

/** 7.1 — Pattern fills on bar + area layers. */
export const PatternFills: StoryObj = {
  render: () => (
    <MixedChart
      series={[
        { ...revenue, fill: { pattern: "stripes" } },
        { ...costs, fill: { pattern: "dots" } },
        target,
      ]}
      layers={[
        { type: "area", seriesIds: ["costs"], areaOpacity: 0.5 },
        { type: "bar", seriesIds: ["revenue"], barRadius: 4 },
        { type: "line", seriesIds: ["target"], strokeWidth: 2 },
      ]}
      xAxis={{ categories: months }}
      yAxis={{ label: "Value" }}
      height={350}
    />
  ),
};

// ─── 8. Severity Colors ─────────────────────────────────────────────────────

/** 8.1 — Severity colors per series. */
export const SeverityColors: StoryObj = {
  render: () => (
    <MixedChart
      series={[
        { ...revenue, severity: "success" },
        { ...costs, severity: "danger" },
        { ...target, severity: "info" },
      ]}
      layers={[
        { type: "bar", seriesIds: ["revenue"], barRadius: 4 },
        { type: "area", seriesIds: ["costs"], areaOpacity: 0.3 },
        { type: "line", seriesIds: ["target"], strokeWidth: 2 },
      ]}
      xAxis={{ categories: months }}
      yAxis={{ label: "Value" }}
      height={350}
    />
  ),
};

// ─── 9. Zoom & Export ───────────────────────────────────────────────────────

/** 9.1 — Full featured with zoom and export. */
export const ZoomAndExport: Story = {
  args: {
    series: [revenue, costs, target, outliers],
    layers: [
      { type: "area", seriesIds: ["costs"], areaOpacity: 0.3 },
      { type: "bar", seriesIds: ["revenue"], barRadius: 4 },
      { type: "line", seriesIds: ["target"], strokeWidth: 2 },
      { type: "scatter", seriesIds: ["outliers"], markerSize: 8 },
    ],
    xAxis: { categories: months },
    yAxis: { label: "Value" },
    title: "Mixed Chart — Zoom & Export",
    height: 400,
    zoomMode: "both",
    exportFormats: ["png", "svg", "csv"],
  },
};

// ─── 9b. Tooltip Toggle ─────────────────────────────────────────────────────

/** 9b.1 — Toggle between single and shared tooltip modes. */
export const TooltipToggle: Story = {
  args: {
    series: [revenue, costs, target],
    layers: [
      { type: "bar", seriesIds: ["revenue"], barRadius: 4 },
      { type: "area", seriesIds: ["costs"], areaOpacity: 0.3 },
      { type: "line", seriesIds: ["target"], strokeWidth: 2 },
    ],
    xAxis: { categories: months },
    yAxis: { label: "Value" },
    tooltipToggle: true,
    height: 380,
  },
};

// ─── 10. Multi-Axis ─────────────────────────────────────────────────────────

/** 10.1 — Bar on left axis, line on right axis. */
export const MultiAxis: StoryObj = {
  render: () => (
    <MixedChart
      series={[
        { ...revenue, yAxisId: "left", unit: "$" },
        {
          id: "rate",
          name: "Growth Rate",
          yAxisId: "right",
          unit: "%",
          data: [
            { x: 0, y: 5 },
            { x: 1, y: 12 },
            { x: 2, y: -3 },
            { x: 3, y: 18 },
            { x: 4, y: 8 },
            { x: 5, y: 22 },
          ],
        },
      ]}
      layers={[
        { type: "bar", seriesIds: ["revenue"], barRadius: 4 },
        { type: "line", seriesIds: ["rate"], strokeWidth: 2, curve: "smooth" },
      ]}
      xAxis={{ categories: months }}
      yAxis={[
        { id: "left", label: "Revenue ($)" },
        { id: "right", label: "Growth (%)", side: "right" },
      ]}
      height={350}
    />
  ),
};

// ─── 11. Bubble in Mixed ────────────────────────────────────────────────────

/** 11.1 — Bar + bubble scatter. */
export const BarWithBubble: StoryObj = {
  render: () => (
    <MixedChart
      series={[
        revenue,
        {
          id: "impact",
          name: "Impact",
          data: [
            { x: 0, y: 45, z: 10 },
            { x: 1, y: 70, z: 25 },
            { x: 2, y: 48, z: 8 },
            { x: 3, y: 85, z: 30 },
            { x: 4, y: 60, z: 15 },
            { x: 5, y: 90, z: 20 },
          ],
        },
      ]}
      layers={[
        { type: "bar", seriesIds: ["revenue"], barRadius: 4 },
        { type: "scatter", seriesIds: ["impact"], bubbleMode: true, bubbleMin: 5, bubbleMax: 25 },
      ]}
      xAxis={{ categories: months }}
      yAxis={{ label: "Value" }}
      height={400}
    />
  ),
};

// ─── 12. Layer Order ────────────────────────────────────────────────────────

/** 12.1 — Layer order matters: area behind, bar middle, line + scatter on top. */
export const LayerOrder: Story = {
  args: {
    series: [revenue, costs, target, outliers],
    layers: [
      { type: "area", seriesIds: ["costs"], areaOpacity: 0.2 },
      { type: "bar", seriesIds: ["revenue"], barRadius: 4 },
      { type: "line", seriesIds: ["target"], strokeWidth: 2, curve: "smooth" },
      { type: "scatter", seriesIds: ["outliers"], markerSize: 7 },
    ],
    xAxis: { categories: months },
    yAxis: { label: "Value" },
    title: "Layer Order: Area < Bar < Line < Scatter",
    height: 400,
  },
};

// ─── 13. Constants & Overlays ───────────────────────────────────────────────

/** 13.1 — Mixed chart with constants and shaded areas. */
export const WithOverlays: Story = {
  args: {
    series: [revenue, target],
    layers: [
      { type: "bar", seriesIds: ["revenue"], barRadius: 4 },
      { type: "line", seriesIds: ["target"], strokeWidth: 2 },
    ],
    constants: [
      { id: "avg", label: "Average", value: 65, color: "var(--kreati-severity-info)", dashStyle: "dash" },
    ],
    shadedAreas: [
      { id: "goal", label: "Goal Zone", xStart: 3, xEnd: 5, color: "var(--kreati-severity-success)" },
    ],
    xAxis: { categories: months },
    yAxis: { label: "Value" },
    height: 350,
  },
};

// ─── 14. LIMS Dashboard ─────────────────────────────────────────────────────

/** 14.1 — Lab results: bar for measurements, line for spec limits, scatter for outliers. */
export const LabDashboard: StoryObj = {
  render: () => (
    <MixedChart
      series={[
        {
          id: "measurements",
          name: "Measurements",
          data: [
            { x: 0, y: 4.8 },
            { x: 1, y: 5.1 },
            { x: 2, y: 4.9 },
            { x: 3, y: 5.3 },
            { x: 4, y: 5.0 },
            { x: 5, y: 4.7 },
          ],
          severity: "primary",
        },
        {
          id: "upper",
          name: "Upper Spec",
          data: [
            { x: 0, y: 5.5 },
            { x: 1, y: 5.5 },
            { x: 2, y: 5.5 },
            { x: 3, y: 5.5 },
            { x: 4, y: 5.5 },
            { x: 5, y: 5.5 },
          ],
          severity: "danger",
          dashStyle: "dash",
        },
        {
          id: "lower",
          name: "Lower Spec",
          data: [
            { x: 0, y: 4.5 },
            { x: 1, y: 4.5 },
            { x: 2, y: 4.5 },
            { x: 3, y: 4.5 },
            { x: 4, y: 4.5 },
            { x: 5, y: 4.5 },
          ],
          severity: "danger",
          dashStyle: "dash",
        },
        {
          id: "oos",
          name: "Out of Spec",
          markerSymbol: "triangle",
          data: [
            { x: 3, y: 5.3 },
          ],
          severity: "danger",
        },
      ]}
      layers={[
        { type: "bar", seriesIds: ["measurements"], barRadius: 4, showDataLabels: true },
        { type: "line", seriesIds: ["upper", "lower"], strokeWidth: 1 },
        { type: "scatter", seriesIds: ["oos"], markerSize: 10 },
      ]}
      xAxis={{ categories: ["Batch 1", "Batch 2", "Batch 3", "Batch 4", "Batch 5", "Batch 6"] }}
      yAxis={{ label: "pH" }}
      title="pH Control Chart"
      subtitle="Spec: 4.5 - 5.5"
      height={400}
    />
  ),
};

// ─── 15. ChartGroup with Mixed Panels ───────────────────────────────────────

/** 15.1 — Three synchronized MixedChart panels. */
export const GroupThreeMixedPanels: StoryObj = {
  render: () => (
    <ChartGroup
      panels={[
        {
          type: "mixed",
          title: "Revenue & Costs",
          series: [revenue, costs],
          layers: [
            { type: "bar", seriesIds: ["revenue"], barRadius: 4 },
            { type: "area", seriesIds: ["costs"], areaOpacity: 0.3 },
          ],
          height: 180,
        },
        {
          type: "mixed",
          title: "Target & Outliers",
          series: [target, outliers],
          layers: [
            { type: "line", seriesIds: ["target"], strokeWidth: 2 },
            { type: "scatter", seriesIds: ["outliers"], markerSize: 8 },
          ],
          height: 180,
        },
        {
          type: "mixed",
          title: "All Combined",
          series: [revenue, costs, target],
          layers: [
            { type: "area", seriesIds: ["costs"], areaOpacity: 0.2 },
            { type: "bar", seriesIds: ["revenue"], barRadius: 4 },
            { type: "line", seriesIds: ["target"], strokeWidth: 2, showDataLabels: true },
          ],
          height: 180,
        },
      ]}
      xAxis={{ categories: months }}
      synchronized
      zoomMode="both"
      exportFormats={["png", "csv"]}
    />
  ),
};

/** 15.2 — Mixed panel types: mixed + bar + line + scatter. */
export const GroupMixedWithIndividuals: StoryObj = {
  render: () => (
    <ChartGroup
      panels={[
        {
          type: "mixed",
          title: "Revenue (Bar + Line Target)",
          series: [revenue, target],
          layers: [
            { type: "bar", seriesIds: ["revenue"], barRadius: 4 },
            { type: "line", seriesIds: ["target"], strokeWidth: 2 },
          ],
          height: 170,
        },
        {
          type: "bar",
          title: "Costs (Bar)",
          series: [costs],
          barRadius: 4,
          showDataLabels: true,
          height: 170,
        },
        {
          type: "line",
          title: "Target (Line)",
          series: [target],
          curve: "smooth",
          height: 170,
        },
        {
          type: "scatter",
          title: "Outliers (Scatter)",
          series: [outliers],
          height: 170,
        },
      ]}
      xAxis={{ categories: months }}
      synchronized
      zoomMode="both"
    />
  ),
};

/** 15.3 — Two mixed panels with different axis scales. */
export const GroupMixedDualContext: StoryObj = {
  render: () => (
    <ChartGroup
      panels={[
        {
          type: "mixed",
          title: "Financial Overview",
          series: [
            { ...revenue, severity: "success" },
            { ...costs, severity: "danger" },
          ],
          layers: [
            { type: "bar", seriesIds: ["revenue"], barRadius: 4 },
            { type: "bar", seriesIds: ["costs"], barRadius: 4 },
          ],
          height: 200,
        },
        {
          type: "mixed",
          title: "Performance Metrics",
          series: [
            {
              id: "efficiency",
              name: "Efficiency",
              severity: "info",
              data: [
                { x: 0, y: 78 },
                { x: 1, y: 82 },
                { x: 2, y: 75 },
                { x: 3, y: 88 },
                { x: 4, y: 85 },
                { x: 5, y: 92 },
              ],
            },
            {
              id: "defects",
              name: "Defects",
              severity: "danger",
              markerSymbol: "triangle",
              data: [
                { x: 0, y: 5 },
                { x: 1, y: 3 },
                { x: 2, y: 7 },
                { x: 3, y: 2 },
                { x: 4, y: 4 },
                { x: 5, y: 1 },
              ],
            },
          ],
          layers: [
            { type: "area", seriesIds: ["efficiency"], areaOpacity: 0.3 },
            { type: "scatter", seriesIds: ["defects"], markerSize: 9 },
          ],
          height: 200,
        },
      ]}
      xAxis={{ categories: months }}
      synchronized
      zoomMode="both"
      exportFormats={["png", "svg", "csv"]}
    />
  ),
};
