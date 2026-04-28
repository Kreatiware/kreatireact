import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AreaChart } from "../../../../../packages/react/src/components/Chart/cartesian/AreaChart";
import type { ChartSeries } from "../../../../../packages/react/src/components/Chart/core/types";

const meta = {
  title: "Charts/AreaChart",
  component: AreaChart,
  parameters: { layout: "centered" },
  args: { series: [] },
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
} satisfies Meta<typeof AreaChart>;

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
    { x: 0, y: 25 },
    { x: 1, y: 30 },
    { x: 2, y: 35 },
    { x: 3, y: 28 },
    { x: 4, y: 40 },
    { x: 5, y: 38 },
  ],
};

const profit: ChartSeries = {
  id: "profit",
  name: "Profit",
  data: [
    { x: 0, y: 15 },
    { x: 1, y: 35 },
    { x: 2, y: 20 },
    { x: 3, y: 52 },
    { x: 4, y: 32 },
    { x: 5, y: 57 },
  ],
};

// ─── 1. Basics ──────────────────────────────────────────────────────────────

export const Default: Story = {
  name: "1.1 — Default (Single Series)",
  args: {
    series: [revenue],
    xAxis: { label: "Month", categories: months },
    yAxis: { label: "Amount ($K)" },
    height: 300,
  },
};

export const MultipleSeries: Story = {
  name: "1.2 — Multiple Series (Overlapping)",
  args: {
    series: [revenue, costs, profit],
    xAxis: { label: "Month", categories: months },
    yAxis: { label: "Amount ($K)" },
    height: 300,
  },
};

export const WithTitle: Story = {
  name: "1.3 — With Title & Subtitle",
  args: {
    series: [revenue, costs],
    xAxis: { label: "Month", categories: months },
    yAxis: { label: "Amount ($K)" },
    title: "Revenue vs Costs",
    subtitle: "First half of 2026",
    height: 300,
  },
};

// ─── 2. Curve Types ─────────────────────────────────────────────────────────

export const LinearCurve: Story = {
  name: "2.1 — Linear Interpolation",
  args: {
    series: [revenue, costs],
    xAxis: { categories: months },
    curve: "linear",
    height: 300,
  },
};

export const MonotoneCurve: Story = {
  name: "2.2 — Monotone Interpolation",
  args: {
    series: [revenue, costs],
    xAxis: { categories: months },
    curve: "monotone",
    height: 300,
  },
};

// ─── 3. Stacked Modes ──────────────────────────────────────────────────────

export const Stacked: Story = {
  name: "3.1 — Stacked",
  args: {
    series: [revenue, costs, profit],
    xAxis: { label: "Month", categories: months },
    yAxis: { label: "Total ($K)" },
    stackMode: "stacked",
    height: 300,
  },
};

export const Stacked100: Story = {
  name: "3.2 — Stacked 100%",
  args: {
    series: [revenue, costs, profit],
    xAxis: { label: "Month", categories: months },
    yAxis: { label: "%" },
    stackMode: "stacked-100",
    height: 300,
  },
};

export const StackedLinear: Story = {
  name: "3.3 — Stacked (Linear Curve)",
  args: {
    series: [revenue, costs, profit],
    xAxis: { categories: months },
    stackMode: "stacked",
    curve: "linear",
    height: 300,
  },
};

// ─── 4. Styling ─────────────────────────────────────────────────────────────

export const CustomOpacity: Story = {
  name: "4.1 — Custom Area Opacity",
  args: {
    series: [revenue, costs],
    xAxis: { categories: months },
    areaOpacity: 0.7,
    height: 300,
  },
};

export const NoLine: Story = {
  name: "4.2 — Area Only (No Line)",
  args: {
    series: [revenue, costs],
    xAxis: { categories: months },
    showLine: false,
    areaOpacity: 0.5,
    height: 300,
  },
};

export const SeverityColors: Story = {
  name: "4.3 — Severity Colors",
  args: {
    series: [
      { ...revenue, severity: "success" },
      { ...costs, severity: "danger" },
      { ...profit, severity: "info" },
    ],
    xAxis: { categories: months },
    height: 300,
  },
};

export const PatternFills: Story = {
  name: "4.4 — Pattern Fills",
  args: {
    series: [
      { ...revenue, fill: { pattern: "stripes" } },
      { ...costs, fill: { pattern: "dots" } },
      { ...profit, fill: { pattern: "crosshatch" } },
    ],
    xAxis: { categories: months },
    stackMode: "stacked",
    height: 300,
  },
};

export const DashStyles: Story = {
  name: "4.5 — Dash Styles",
  args: {
    series: [
      { ...revenue, dashStyle: "solid" },
      { ...costs, dashStyle: "dash" },
      { ...profit, dashStyle: "dot" },
    ],
    xAxis: { categories: months },
    height: 300,
  },
};

// ─── 5. Data Labels ─────────────────────────────────────────────────────────

export const WithDataLabels: Story = {
  name: "5.1 — Data Labels",
  args: {
    series: [revenue],
    xAxis: { categories: months },
    showDataLabels: true,
    height: 300,
  },
};

export const DataLabelsStacked: Story = {
  name: "5.2 — Data Labels (Stacked)",
  args: {
    series: [revenue, costs],
    xAxis: { categories: months },
    stackMode: "stacked",
    showDataLabels: true,
    height: 300,
  },
};

// ─── 6. Tooltip ─────────────────────────────────────────────────────────────

export const TooltipShared: Story = {
  name: "6.1 — Shared Tooltip",
  args: {
    series: [revenue, costs, profit],
    xAxis: { categories: months },
    tooltipMode: "shared",
    height: 300,
  },
};

// ─── 7. Legend ───────────────────────────────────────────────────────────────

export const LegendTop: Story = {
  name: "7.1 — Legend Top",
  args: {
    series: [revenue, costs, profit],
    xAxis: { categories: months },
    legendPosition: "top",
    height: 300,
  },
};

// ─── 8. Overlays ────────────────────────────────────────────────────────────

export const WithConstants: Story = {
  name: "8.1 — With Constant Lines",
  args: {
    series: [revenue],
    xAxis: { categories: months },
    constants: [
      {
        id: "target",
        label: "Target",
        value: 70,
        color: "var(--kreati-severity-danger)",
        dashStyle: "dash",
      },
    ],
    height: 300,
  },
};

// ─── 9. Zoom & Export ───────────────────────────────────────────────────────

export const WithZoom: Story = {
  name: "9.1 — Zoom & Pan",
  args: {
    series: [revenue, costs],
    xAxis: { categories: months },
    zoomMode: "both",
    height: 300,
  },
};

export const WithExport: Story = {
  name: "9.2 — Export",
  args: {
    series: [revenue, costs],
    xAxis: { categories: months },
    exportFormats: ["png", "svg", "csv"],
    height: 300,
  },
};

// ─── 10. Keyboard & Accessibility ───────────────────────────────────────────

export const KeyboardNavigation: Story = {
  name: "10.1 — Keyboard Navigation",
  args: {
    series: [revenue, costs],
    xAxis: { categories: months },
    height: 300,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Click the chart and use Arrow keys to navigate points, Up/Down to switch series.",
      },
    },
  },
};

// ─── 11. ChartGroup ─────────────────────────────────────────────────────────

import { ChartGroup } from "../../../../../packages/react/src/components/Chart/composition/ChartGroup";
import { MixedChart as MixedChartComponent } from "../../../../../packages/react/src/components/Chart/cartesian/MixedChart";

export const ChartGroupAreaPanels: Story = {
  name: "11.1 — ChartGroup: Area + Line + Bar",
  args: { series: [] },
  render: () => (
    <ChartGroup
      panels={[
        {
          type: "area",
          title: "Revenue & Costs (Stacked Area)",
          series: [revenue, costs],
          stackMode: "stacked",
          height: 200,
        },
        {
          type: "line",
          title: "Profit Trend (Line)",
          series: [profit],
          height: 180,
        },
        {
          type: "bar",
          title: "Revenue (Bar)",
          series: [revenue],
          height: 180,
        },
      ]}
      xAxis={{ label: "Month", categories: months }}
      zoomMode="both"
      zoomAxis="x"
      exportFormats={["png", "csv"]}
      synchronized
    />
  ),
};

export const ChartGroupAreaOnly: Story = {
  name: "11.2 — ChartGroup: Stacked vs Normal Area",
  args: { series: [] },
  render: () => (
    <ChartGroup
      panels={[
        {
          type: "area",
          title: "Stacked",
          series: [revenue, costs, profit],
          stackMode: "stacked",
          height: 220,
        },
        {
          type: "area",
          title: "Overlapping (Normal)",
          series: [revenue, costs, profit],
          height: 220,
        },
      ]}
      xAxis={{ label: "Month", categories: months }}
      synchronized
    />
  ),
};

// ─── 12. Mixed Chart (Same Axes) ────────────────────────────────────────────

export const MixedBarAreaLine: Story = {
  name: "12.1 — Mixed: Bar + Area + Line (Same Axes)",
  args: { series: [] },
  render: () => (
    <MixedChartComponent
      series={[
        { ...revenue, id: "bar-revenue", name: "Revenue (Bar)" },
        { ...costs, id: "area-costs", name: "Costs (Area)", color: "var(--kreati-chart-2)" },
        { ...profit, id: "line-profit", name: "Profit (Line)", color: "var(--kreati-chart-3)" },
      ]}
      layers={[
        { type: "bar", seriesIds: ["bar-revenue"], barRadius: 3 },
        { type: "area", seriesIds: ["area-costs"], areaOpacity: 0.3 },
        { type: "line", seriesIds: ["line-profit"], strokeWidth: 3 },
      ]}
      xAxis={{ label: "Month", categories: months }}
      yAxis={{ label: "Amount ($K)" }}
      height={350}
      title="Mixed: Bar + Area + Line"
      exportFormats={["png", "csv"]}
      zoomMode="both"
    />
  ),
};
