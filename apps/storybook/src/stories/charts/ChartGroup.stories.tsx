import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChartGroup } from "../../../../../packages/react/src/components/Chart/composition/ChartGroup";

const meta = {
  title: "Charts/ChartGroup",
  component: ChartGroup,
  parameters: { layout: "centered" },
  decorators: [
    (Story: React.FC) => (
      <div style={{ background: "#fff", padding: 24, borderRadius: 8, width: 800, maxWidth: "100%" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChartGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const tempData = {
  id: "temp",
  name: "Temperature",
  data: months.map((_, i) => ({ x: i, y: 15 + Math.sin(i / 2) * 10 })),
};

const humData = {
  id: "hum",
  name: "Humidity",
  data: months.map((_, i) => ({ x: i, y: 40 + Math.cos(i / 3) * 20 })),
};

const pressData = {
  id: "press",
  name: "Pressure",
  data: months.map((_, i) => ({ x: i, y: 1010 + Math.sin(i) * 15 })),
};

const flowData = {
  id: "flow",
  name: "Flow Rate",
  data: months.map((_, i) => ({ x: i, y: 100 + i * 8 + Math.random() * 10 })),
};

// ═══════════════════════════════════════════════════════════════════════════

export const Default: Story = {
  name: "1 — Two Panels (Synced Zoom + Crosshair)",
  args: {
    panels: [
      { series: [tempData], title: "Temperature", height: 200, yAxis: { label: "°C" } },
      { series: [humData], title: "Humidity", height: 200, yAxis: { label: "%" } },
    ],
    xAxis: { categories: months },
    showCrosshair: true,
    zoomMode: "both",
  },
};

export const ThreePanels: Story = {
  name: "2 — Three Panels",
  args: {
    panels: [
      { series: [tempData], title: "Temperature", height: 180, yAxis: { label: "°C" } },
      { series: [humData], title: "Humidity", height: 150, yAxis: { label: "%" } },
      { series: [pressData], title: "Pressure", height: 150, yAxis: { label: "hPa" } },
    ],
    xAxis: { categories: months },
    showCrosshair: true,
    zoomMode: "both",
  },
};

export const SharedSeries: Story = {
  name: "3 — Panel with Multiple Series (shared tooltip per panel)",
  args: {
    panels: [
      { series: [
        { ...tempData, yAxisId: "temp" },
        { ...humData, yAxisId: "hum" },
      ], title: "Environment", height: 250, yAxis: [
        { id: "temp", label: "°C", side: "left" as const },
        { id: "hum", label: "%", side: "right" as const },
      ] },
      { series: [pressData], title: "Pressure", height: 150, yAxis: { label: "hPa" } },
    ],
    xAxis: { categories: months },
    showCrosshair: true,
    tooltipMode: "shared",
  },
};

export const WithExport: Story = {
  name: "4 — With Export Buttons",
  args: {
    panels: [
      { series: [tempData], title: "Temperature", height: 200, yAxis: { label: "°C" } },
      { series: [flowData], title: "Flow Rate", height: 200, yAxis: { label: "L/h" } },
    ],
    xAxis: { categories: months },
    exportFormats: ["png", "svg", "csv", "json-series"],
    zoomMode: "both",
  },
};

export const LegendTop: Story = {
  name: "5 — Legend on Top",
  args: {
    panels: [
      { series: [tempData], title: "Temperature", height: 200 },
      { series: [humData], title: "Humidity", height: 200 },
    ],
    xAxis: { categories: months },
    legendPosition: "top",
    showCrosshair: true,
  },
};

export const NoSync: Story = {
  name: "6 — Independent (synchronized=false, own legend + export + zoom)",
  args: {
    panels: [
      { series: [tempData], title: "Temperature", height: 200, yAxis: { label: "°C" } },
      { series: [humData], title: "Humidity", height: 200, yAxis: { label: "%" } },
    ],
    xAxis: { categories: months },
    synchronized: false,
    zoomMode: "both",
    showCrosshair: true,
    exportFormats: ["png", "csv"],
  },
};

export const FourPanels: Story = {
  name: "7 — Four Panels (LIMS Dashboard, group tooltip)",
  args: {
    panels: [
      { series: [tempData], title: "Temperature", height: 150, yAxis: { label: "°C" } },
      { series: [humData], title: "Humidity", height: 150, yAxis: { label: "%" } },
      { series: [pressData], title: "Pressure", height: 150, yAxis: { label: "hPa" } },
      { series: [flowData], title: "Flow Rate", height: 150, yAxis: { label: "L/h" } },
    ],
    xAxis: { categories: months },
    showCrosshair: true,
    zoomMode: "both",
    tooltipMode: "group",
    exportFormats: ["png", "svg", "csv"],
  },
};
