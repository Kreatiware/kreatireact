import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { HeatmapChart } from "@kreatiware/react";

const meta: Meta<typeof HeatmapChart> = {
  title: "Charts/HeatmapChart",
  component: HeatmapChart,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof HeatmapChart>;

// ─── Sample data generators ─────────────────────────────────────────────────

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = ["6am", "8am", "10am", "12pm", "2pm", "4pm", "6pm", "8pm"];

const activityData = weekdays.flatMap((_, x) =>
  hours.map((_, y) => ({
    x,
    y,
    value: Math.round(Math.random() * 100),
  }))
);

// ─── 1. Basics ──────────────────────────────────────────────────────────────

export const Default: Story = {
  name: "1.1 Default",
  args: {
    data: activityData,
    xCategories: weekdays,
    yCategories: hours,
    title: "Weekly Activity",
  },
};

export const WithValues: Story = {
  name: "1.2 Show Values",
  args: {
    data: activityData,
    xCategories: weekdays,
    yCategories: hours,
    showValues: true,
    title: "Weekly Activity",
  },
};

export const CustomFormat: Story = {
  name: "1.3 Custom Value Format",
  args: {
    data: activityData,
    xCategories: weekdays,
    yCategories: hours,
    showValues: true,
    valueFormat: (v: number) => `${v}%`,
    title: "Completion Rate",
  },
};

// ─── 2. Color Scales ────────────────────────────────────────────────────────

export const RedGreen: Story = {
  name: "2.1 Red to Green",
  args: {
    data: activityData,
    xCategories: weekdays,
    yCategories: hours,
    colorRange: ["#fecaca", "#166534"] as [string, string],
    title: "Performance Score",
  },
};

export const MultiStop: Story = {
  name: "2.2 Multi-Stop Gradient",
  args: {
    data: activityData,
    xCategories: weekdays,
    yCategories: hours,
    colorStops: [
      { at: 0, color: "#1e3a5f" },
      { at: 0.25, color: "#2563eb" },
      { at: 0.5, color: "#fbbf24" },
      { at: 0.75, color: "#f97316" },
      { at: 1, color: "#dc2626" },
    ],
    title: "Temperature Map",
    showValues: true,
    valueFormat: (v: number) => `${v}°`,
  },
};

export const SingleColor: Story = {
  name: "2.3 Single Color Intensity",
  args: {
    data: activityData,
    xCategories: weekdays,
    yCategories: hours,
    colorRange: ["#f0fdf4", "#15803d"] as [string, string],
    title: "Contribution Graph",
  },
};

// ─── 3. Styling ─────────────────────────────────────────────────────────────

export const RoundedCells: Story = {
  name: "3.1 Rounded Cells",
  args: {
    data: activityData,
    xCategories: weekdays,
    yCategories: hours,
    cellRadius: 4,
    cellGap: 3,
    title: "Rounded Heatmap",
  },
};

export const NoCellGap: Story = {
  name: "3.2 No Cell Gap",
  args: {
    data: activityData,
    xCategories: weekdays,
    yCategories: hours,
    cellGap: 0,
    title: "Continuous Heatmap",
  },
};

// ─── 4. Legend Positions ────────────────────────────────────────────────────

export const LegendBottom: Story = {
  name: "4.1 Legend Bottom",
  args: {
    data: activityData,
    xCategories: weekdays,
    yCategories: hours,
    legendPosition: "bottom",
    title: "Legend Bottom",
  },
};

export const LegendLeft: Story = {
  name: "4.2 Legend Left",
  args: {
    data: activityData,
    xCategories: weekdays,
    yCategories: hours,
    legendPosition: "left",
    title: "Legend Left",
  },
};

export const NoLegend: Story = {
  name: "4.3 No Legend",
  args: {
    data: activityData,
    xCategories: weekdays,
    yCategories: hours,
    showLegend: false,
    title: "No Legend",
  },
};

// ─── 5. Interaction ─────────────────────────────────────────────────────────

export const Clickable: Story = {
  name: "5.1 Cell Click",
  args: {
    data: activityData,
    xCategories: weekdays,
    yCategories: hours,
    title: "Click a Cell",
    onCellClick: (cell, xLabel, yLabel) =>
      alert(`${xLabel} ${yLabel}: ${cell.value}`),
  },
};

// ─── 6. Export ───────────────────────────────────────────────────────────────

export const WithExport: Story = {
  name: "6.1 Export PNG/SVG/CSV",
  args: {
    data: activityData,
    xCategories: weekdays,
    yCategories: hours,
    exportFormats: ["png", "svg", "csv"],
    title: "Exportable Heatmap",
  },
};

// ─── 7. Sizing ──────────────────────────────────────────────────────────────

export const FixedWidth: Story = {
  name: "7.1 Fixed Width",
  args: {
    data: activityData,
    xCategories: weekdays,
    yCategories: hours,
    width: 500,
    height: 300,
    title: "Fixed 500x300",
  },
};

export const Tall: Story = {
  name: "7.2 Tall Grid",
  render: () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
    const data = months.flatMap((_, x) =>
      days.map((_, y) => ({ x, y, value: Math.round(Math.random() * 50) }))
    );
    return (
      <HeatmapChart
        data={data}
        xCategories={months}
        yCategories={days}
        height={600}
        cellGap={1}
        colorRange={["#ede9fe", "#6d28d9"]}
        title="Monthly Activity (12x31)"
      />
    );
  },
};

// ─── 8. LIMS Use Case ──────────────────────────────────────────────────────

export const CorrelationMatrix: Story = {
  name: "8.1 Correlation Matrix",
  render: () => {
    const params = ["pH", "Temp", "DO", "BOD", "TSS"];
    const correlations = [
      1, 0.3, -0.5, 0.7, 0.2,
      0.3, 1, -0.8, 0.4, 0.1,
      -0.5, -0.8, 1, -0.6, -0.3,
      0.7, 0.4, -0.6, 1, 0.5,
      0.2, 0.1, -0.3, 0.5, 1,
    ];
    const data = params.flatMap((_, x) =>
      params.map((_, y) => ({ x, y, value: correlations[x * 5 + y] }))
    );
    return (
      <HeatmapChart
        data={data}
        xCategories={params}
        yCategories={params}
        min={-1}
        max={1}
        colorStops={[
          { at: 0, color: "#dc2626" },
          { at: 0.5, color: "#fefce8" },
          { at: 1, color: "#166534" },
        ]}
        showValues
        valueFormat={(v) => v.toFixed(1)}
        title="Parameter Correlation Matrix"
        subtitle="Water quality analysis"
        height={350}
        cellRadius={2}
      />
    );
  },
};
