import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { LineChart } from "../../../../../packages/react/src/components/Chart/cartesian/LineChart";
import { Dialog } from "../../../../../packages/react/src/components/Dialog";
import { Button } from "../../../../../packages/react/src/components/Button";
import { Tooltip } from "../../../../../packages/react/src/components/Tooltip";
import { KreatiProvider } from "../../../../../packages/react/src/locale/KreatiProvider";
import { es } from "../../../../../packages/react/src/locale/es";
import { ContextMenu } from "../../../../../packages/react/src/components/ContextMenu";
import type {
  ChartSeries,
  ChartConstant,
  ChartShadedArea,
} from "../../../../../packages/react/src/components/Chart/core/types";

const meta = {
  title: "Charts/LineChart",
  component: LineChart,
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
} satisfies Meta<typeof LineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Sample data ────────────────────────────────────────────────────────────

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const temperatureData: ChartSeries = {
  id: "temp",
  name: "Temperature",
  data: [
    { x: 0, y: 18 },
    { x: 1, y: 19 },
    { x: 2, y: 21 },
    { x: 3, y: 24 },
    { x: 4, y: 26 },
    { x: 5, y: 28 },
    { x: 6, y: 30 },
    { x: 7, y: 29 },
    { x: 8, y: 27 },
    { x: 9, y: 24 },
    { x: 10, y: 21 },
    { x: 11, y: 19 },
  ],
};

const humidityData: ChartSeries = {
  id: "humidity",
  name: "Humidity",
  data: [
    { x: 0, y: 65 },
    { x: 1, y: 62 },
    { x: 2, y: 58 },
    { x: 3, y: 52 },
    { x: 4, y: 48 },
    { x: 5, y: 45 },
    { x: 6, y: 42 },
    { x: 7, y: 44 },
    { x: 8, y: 50 },
    { x: 9, y: 55 },
    { x: 10, y: 60 },
    { x: 11, y: 64 },
  ],
  dashStyle: "dash",
};

const generateWave = (
  points: number,
  amp: number,
  offset: number,
  phase = 0
): ChartSeries["data"] =>
  Array.from({ length: points }, (_, i) => ({
    x: i,
    y: Math.sin((i / points) * Math.PI * 4 + phase) * amp + offset,
  }));

// ═══════════════════════════════════════════════════════════════════════════
// 1. BASICS
// ═══════════════════════════════════════════════════════════════════════════

export const Default: Story = {
  name: "1.1 — Default",
  args: {
    series: [temperatureData],
    xAxis: { label: "Month", categories: months },
    yAxis: { label: "Temperature (°C)" },
    height: 320,
  },
};

export const MultipleSeries: Story = {
  name: "1.2 — Multiple Series",
  args: {
    series: [temperatureData, humidityData],
    xAxis: { label: "Month", categories: months },
    yAxis: { label: "Value" },
    height: 320,
  },
};

export const ManySeries: Story = {
  name: "1.3 — Many Series (6)",
  args: {
    series: [
      { id: "s1", name: "Sensor 1", data: generateWave(20, 15, 80) },
      { id: "s2", name: "Sensor 2", data: generateWave(20, 15, 65, 0.5) },
      { id: "s3", name: "Sensor 3", data: generateWave(20, 15, 50, 1) },
      { id: "s4", name: "Sensor 4", data: generateWave(20, 15, 35, 1.5) },
      { id: "s5", name: "Sensor 5", data: generateWave(20, 15, 20, 2) },
      { id: "s6", name: "Sensor 6", data: generateWave(20, 10, 10, 2.5) },
    ],
    showPoints: false,
    height: 350,
  },
};

export const TitleAndSubtitle: Story = {
  name: "1.4 — Title & Subtitle",
  args: {
    series: [temperatureData],
    title: "Monthly Temperature",
    subtitle: "Average readings for 2026",
    xAxis: { categories: months },
    yAxis: { label: "°C" },
    height: 320,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 2. LINE STYLES
// ═══════════════════════════════════════════════════════════════════════════

export const LinearCurve: Story = {
  name: "2.1 — Linear Interpolation",
  args: {
    series: [temperatureData],
    curve: "linear",
    xAxis: { categories: months },
    height: 300,
  },
};

export const MonotoneCurve: Story = {
  name: "2.1b — Monotone Interpolation",
  args: {
    series: [
      {
        id: "spike",
        name: "Spike Data",
        data: [
          { x: 0, y: 10 },
          { x: 1, y: 30 },
          { x: 2, y: 80 },
          { x: 3, y: 70 },
          { x: 4, y: 75 },
          { x: 5, y: 20 },
          { x: 6, y: 50 },
        ],
      },
    ],
    curve: "monotone",
    xAxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"] },
    title: "Monotone — no overshoot at peaks",
    height: 300,
  },
};

export const DashStyles: Story = {
  name: "2.2 — Dash Styles",
  args: {
    series: [
      { id: "solid", name: "Solid", data: generateWave(20, 12, 80), dashStyle: "solid" },
      { id: "dash", name: "Dash", data: generateWave(20, 12, 60), dashStyle: "dash" },
      { id: "dot", name: "Dot", data: generateWave(20, 12, 40), dashStyle: "dot" },
      {
        id: "dashdot",
        name: "Dash-Dot",
        data: generateWave(20, 12, 20),
        dashStyle: "dash-dot",
      },
    ],
    showPoints: false,
    height: 300,
  },
};

export const StrokeWidths: Story = {
  name: "2.3 — Stroke Widths",
  args: {
    series: [
      { id: "thin", name: "Thin (1px)", data: generateWave(20, 20, 70), lineWidth: 1 },
      { id: "normal", name: "Normal (3px)", data: generateWave(20, 20, 50) },
      { id: "thick", name: "Thick (5px)", data: generateWave(20, 20, 30), lineWidth: 5 },
    ],
    showPoints: false,
    height: 300,
  },
};

export const SeverityColors: Story = {
  name: "2.4 — Severity Colors",
  args: {
    series: [
      { id: "a", name: "Primary", data: generateWave(20, 25, 60), severity: "primary" },
      { id: "b", name: "Danger", data: generateWave(20, 20, 40, 0.5), severity: "danger" },
      { id: "c", name: "Success", data: generateWave(20, 15, 80, 1), severity: "success" },
      { id: "d", name: "Warning", data: generateWave(20, 15, 20, 2), severity: "warning" },
    ],
    showPoints: false,
    height: 300,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 3. AREA FILL
// ═══════════════════════════════════════════════════════════════════════════

export const AreaFill: Story = {
  name: "3.1 — Area Fill",
  args: {
    series: [temperatureData],
    showArea: true,
    xAxis: { categories: months },
    yAxis: { label: "°C" },
    height: 320,
  },
};

export const AreaFillMultipleSeries: Story = {
  name: "3.2 — Area Fill (Multiple Series)",
  args: {
    series: [
      { id: "a", name: "Revenue", data: generateWave(20, 30, 60) },
      { id: "b", name: "Costs", data: generateWave(20, 20, 35, 1) },
    ],
    showArea: true,
    areaOpacity: 0.1,
    height: 300,
  },
};

export const AreaCustomOpacity: Story = {
  name: "3.3 — Area Opacity 0.3",
  args: {
    series: [{ id: "s", name: "Signal", data: generateWave(30, 40, 50) }],
    showArea: true,
    areaOpacity: 0.3,
    height: 300,
  },
};

export const AreaWithConstants: Story = {
  name: "3.4 — Area + Reference Lines",
  args: {
    series: [temperatureData],
    showArea: true,
    constants: [
      {
        id: "limit",
        label: "Limit",
        value: 25,
        color: "var(--kreati-severity-danger)",
        dashStyle: "dash",
      },
    ] as ChartConstant[],
    xAxis: { categories: months },
    height: 320,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 4. DATA LABELS
// ═══════════════════════════════════════════════════════════════════════════

export const DataLabels: Story = {
  name: "4.1 — Data Labels",
  args: {
    series: [{ ...temperatureData, showDataLabels: true }],
    xAxis: { categories: months },
    yAxis: { label: "°C" },
    height: 320,
  },
};

export const DataLabelsCustomFormat: Story = {
  name: "4.2 — Data Labels (Custom Format)",
  args: {
    series: [
      {
        ...temperatureData,
        showDataLabels: true,
        dataLabelFormat: (p) => `${p.y}°`,
      },
    ],
    xAxis: { categories: months },
    yAxis: { label: "°C" },
    height: 320,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 5. MARKERS & INTERACTION
// ═══════════════════════════════════════════════════════════════════════════

export const MarkersDisabled: Story = {
  name: "5.1 — Markers Disabled",
  args: {
    series: [
      { id: "a", name: "Series A", data: generateWave(40, 30, 50) },
      { id: "b", name: "Series B", data: generateWave(40, 20, 40, 1) },
    ],
    showPoints: false,
    height: 300,
  },
};

export const WithCrosshair: Story = {
  name: "5.2 — Crosshair",
  args: {
    series: [temperatureData, humidityData],
    showCrosshair: true,
    xAxis: { categories: months },
    height: 320,
  },
};

export const HiddenSeries: Story = {
  name: "5.3 — Initially Hidden Series (click legend)",
  args: {
    series: [temperatureData, { ...humidityData, hidden: true }],
    xAxis: { categories: months },
    height: 300,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 6. TOOLTIP
// ═══════════════════════════════════════════════════════════════════════════

export const TooltipShared: Story = {
  name: "6.1 — Tooltip Shared",
  args: {
    series: [temperatureData, humidityData],
    tooltipMode: "shared" as const,
    xAxis: { categories: months },
    height: 320,
  },
};

export const TooltipSingle: Story = {
  name: "6.2 — Tooltip Single Mode (default)",
  args: {
    series: [temperatureData, humidityData],
    tooltipMode: "single" as const,
    xAxis: { categories: months },
    height: 320,
  },
};

export const TooltipCustom: Story = {
  name: "6.3 — Tooltip Custom Render",
  args: {
    series: [temperatureData],
    xAxis: { categories: months },
    tooltipMode: "custom" as const,
    tooltipRender: (entries) => (
      <div>
        {entries.map((e) => (
          <div key={e.series.id}>
            {e.series.name}: {e.point.y}°C
          </div>
        ))}
      </div>
    ),
    height: 320,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 7. LEGEND POSITIONS
// ═══════════════════════════════════════════════════════════════════════════

export const LegendTop: Story = {
  name: "7.1 — Legend Top",
  args: {
    series: [temperatureData, humidityData],
    legendPosition: "top",
    xAxis: { categories: months },
    height: 320,
  },
};

export const LegendRight: Story = {
  name: "7.2 — Legend Right",
  args: {
    series: [
      { id: "s1", name: "Sensor 1", data: generateWave(20, 15, 80) },
      { id: "s2", name: "Sensor 2", data: generateWave(20, 15, 60, 0.5) },
      { id: "s3", name: "Sensor 3", data: generateWave(20, 15, 40, 1) },
    ],
    legendPosition: "right" as const,
    showPoints: false,
    height: 300,
  },
};

export const LegendInsideTopRight: Story = {
  name: "7.3 — Legend Inside Top Right",
  args: {
    series: [temperatureData, humidityData],
    legendPosition: "inside-top-right" as const,
    xAxis: { categories: months },
    height: 320,
  },
};

export const LegendInsideTopLeft: Story = {
  name: "7.4 — Legend Inside Top Left",
  args: {
    series: [temperatureData, humidityData],
    legendPosition: "inside-top-left" as const,
    xAxis: { categories: months },
    height: 320,
  },
};

export const LegendHidden: Story = {
  name: "7.5 — Legend Hidden",
  args: {
    series: [temperatureData, humidityData],
    showLegend: false,
    xAxis: { categories: months },
    height: 300,
  },
};

export const LegendLeft: Story = {
  name: "7.6 — Legend Left",
  args: {
    series: [temperatureData, humidityData],
    legendPosition: "left" as const,
    xAxis: { categories: months },
    height: 320,
  },
};

export const LegendInsideVertical: Story = {
  name: "7.7 — Inside Top Right (Vertical)",
  args: {
    series: [
      { id: "s1", name: "Sensor 1", data: generateWave(20, 15, 80) },
      { id: "s2", name: "Sensor 2", data: generateWave(20, 15, 60, 0.5) },
      { id: "s3", name: "Sensor 3", data: generateWave(20, 15, 40, 1) },
    ],
    legendPosition: "inside-top-right" as const,
    legendDirection: "vertical" as const,
    showPoints: false,
    height: 320,
  },
};

export const LegendInsideLeftVertical: Story = {
  name: "7.8 — Inside Top Left (Vertical)",
  args: {
    series: [temperatureData, humidityData],
    legendPosition: "inside-top-left" as const,
    legendDirection: "vertical" as const,
    xAxis: { categories: months },
    height: 320,
  },
};

export const LegendTopVertical: Story = {
  name: "7.9 — Top (Forced Vertical)",
  args: {
    series: [temperatureData, humidityData],
    legendPosition: "top" as const,
    legendDirection: "vertical" as const,
    xAxis: { categories: months },
    height: 350,
  },
};

export const LegendBottomDefault: Story = {
  name: "7.10 — Bottom (Default)",
  args: {
    series: [temperatureData, humidityData],
    xAxis: { categories: months },
    height: 320,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 8. AXES & SCALES
// ═══════════════════════════════════════════════════════════════════════════

export const CategoryAxis: Story = {
  name: "8.1 — Category X Axis",
  args: {
    series: [temperatureData],
    xAxis: { label: "Month", categories: months },
    yAxis: { label: "°C" },
    height: 320,
  },
};

export const DatetimeAxis: Story = {
  name: "8.2 — Datetime X Axis",
  args: {
    series: [
      {
        id: "readings",
        name: "Readings",
        data: Array.from({ length: 30 }, (_, i) => ({
          x: new Date(2026, 0, i + 1).getTime(),
          y: Math.random() * 40 + 20,
        })),
      },
    ],
    xAxis: { type: "datetime" as const, label: "Date" },
    yAxis: { label: "Value" },
    height: 320,
  },
};

export const CustomTickFormat: Story = {
  name: "8.3 — Custom Tick Format",
  args: {
    series: [
      {
        id: "revenue",
        name: "Revenue",
        data: Array.from({ length: 12 }, (_, i) => ({
          x: i,
          y: Math.random() * 50000 + 10000,
        })),
      },
    ],
    xAxis: { categories: months, label: "Month" },
    yAxis: {
      label: "Revenue",
      tickFormat: (v: number) => `$${(v / 1000).toFixed(0)}k`,
    },
    height: 320,
  },
};

export const CustomTickCount: Story = {
  name: "8.4 — Custom Tick Count",
  args: {
    series: [temperatureData],
    xAxis: { categories: months },
    yAxis: { label: "°C", ticks: 10 },
    height: 320,
  },
};

export const InvertedYAxis: Story = {
  name: "8.5 — Inverted Y Axis",
  args: {
    series: [
      {
        id: "depth",
        name: "Depth",
        data: Array.from({ length: 10 }, (_, i) => ({ x: i, y: i * 10 + 5 })),
      },
    ],
    yAxis: { label: "Depth (m)", inverted: true },
    height: 300,
  },
};

export const MultipleYAxes: Story = {
  name: "8.6 — Two Y Axes (Left + Right)",
  args: {
    series: [
      { ...temperatureData, yAxisId: "temp" },
      { ...humidityData, yAxisId: "hum" },
    ],
    xAxis: { categories: months },
    yAxis: [
      { id: "temp", label: "Temperature (°C)", side: "left" as const },
      { id: "hum", label: "Humidity (%)", side: "right" as const },
    ],
    height: 350,
  },
};

export const MultipleYAxesThree: Story = {
  name: "8.7 — Three Y Axes",
  args: {
    series: [
      { id: "temp", name: "Temperature", data: months.map((_, i) => ({ x: i, y: 15 + Math.sin(i / 2) * 10 })), yAxisId: "temp" },
      { id: "hum", name: "Humidity", data: months.map((_, i) => ({ x: i, y: 40 + Math.cos(i / 3) * 20 })), yAxisId: "hum" },
      { id: "press", name: "Pressure", data: months.map((_, i) => ({ x: i, y: 1010 + Math.sin(i) * 15 })), yAxisId: "press" },
    ],
    xAxis: { categories: months },
    yAxis: [
      { id: "temp", label: "°C", side: "left" as const },
      { id: "hum", label: "%", side: "right" as const },
      { id: "press", label: "hPa", side: "right" as const },
    ],
    height: 400,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 9. OVERLAYS
export const MultipleYAxesThreeLeft: Story = {
  name: "8.8 — Three Left Axes",
  args: {
    series: [
      { id: "a", name: "Series A", data: months.map((_, i) => ({ x: i, y: 10 + i * 2 })), yAxisId: "a" },
      { id: "b", name: "Series B", data: months.map((_, i) => ({ x: i, y: 200 + i * 30 })), yAxisId: "b" },
      { id: "c", name: "Series C", data: months.map((_, i) => ({ x: i, y: 0.5 + Math.sin(i) * 0.3 })), yAxisId: "c" },
    ],
    xAxis: { categories: months },
    yAxis: [
      { id: "a", label: "Units", side: "left" as const },
      { id: "b", label: "Volume (mL)", side: "left" as const },
      { id: "c", label: "Ratio", side: "left" as const },
    ],
    height: 400,
  },
};

export const MultipleYAxesThreePerSide: Story = {
  name: "8.9 — Three Per Side (6 axes)",
  args: {
    series: [
      { id: "s1", name: "Temp", data: months.map((_, i) => ({ x: i, y: 15 + Math.sin(i / 2) * 10 })), yAxisId: "y1" },
      { id: "s2", name: "Flow", data: months.map((_, i) => ({ x: i, y: 100 + i * 8 })), yAxisId: "y2" },
      { id: "s3", name: "pH", data: months.map((_, i) => ({ x: i, y: 6.5 + Math.cos(i) * 0.8 })), yAxisId: "y3" },
      { id: "s4", name: "Humidity", data: months.map((_, i) => ({ x: i, y: 40 + Math.cos(i / 3) * 20 })), yAxisId: "y4" },
      { id: "s5", name: "Pressure", data: months.map((_, i) => ({ x: i, y: 1010 + Math.sin(i) * 15 })), yAxisId: "y5" },
      { id: "s6", name: "Conductivity", data: months.map((_, i) => ({ x: i, y: 500 + i * 40 })), yAxisId: "y6" },
    ],
    xAxis: { categories: months },
    yAxis: [
      { id: "y1", label: "°C", side: "left" as const },
      { id: "y2", label: "L/h", side: "left" as const },
      { id: "y3", label: "pH", side: "left" as const },
      { id: "y4", label: "%", side: "right" as const },
      { id: "y5", label: "hPa", side: "right" as const },
      { id: "y6", label: "µS/cm", side: "right" as const },
    ],
    height: 450,
    width: 900,
  },
};

export const MultipleYAxesVertical: Story = {
  name: "8.10 — Multiple Y Axes (Narrow / Vertical Layout)",
  decorators: [
    (Story: React.FC) => (
      <div style={{ width: 400, background: "#fff", padding: 16, borderRadius: 8 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    series: [
      { ...temperatureData, yAxisId: "temp" },
      { ...humidityData, yAxisId: "hum" },
    ],
    xAxis: { categories: months },
    yAxis: [
      { id: "temp", label: "°C", side: "left" as const },
      { id: "hum", label: "%", side: "right" as const },
    ],
    height: 500,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 9. OVERLAYS
// ═══════════════════════════════════════════════════════════════════════════

export const ReferenceLines: Story = {
  name: "9.1 — Reference Lines (Constants)",
  args: {
    series: [temperatureData],
    constants: [
      {
        id: "max",
        label: "Max Limit",
        value: 28,
        color: "var(--kreati-severity-danger)",
      },
      {
        id: "avg",
        label: "Average",
        value: 23,
        color: "var(--kreati-severity-info)",
        dashStyle: "dot",
      },
    ] as ChartConstant[],
    xAxis: { categories: months },
    yAxis: { label: "°C" },
    height: 320,
  },
};

export const ReferenceLinesLabelPositions: Story = {
  name: "9.1b — Constant Label Positions",
  args: {
    series: [temperatureData],
    constants: [
      {
        id: "end-above",
        label: "End / Above (default)",
        value: 30,
        color: "var(--kreati-severity-danger)",
      },
      {
        id: "end-below",
        label: "End / Below",
        value: 27,
        color: "var(--kreati-severity-warning)",
        labelAlign: "below",
      },
      {
        id: "start-above",
        label: "Start / Above",
        value: 20,
        color: "var(--kreati-severity-info)",
        labelPosition: "start",
      },
      {
        id: "center-below",
        label: "Center / Below",
        value: 17,
        color: "var(--kreati-severity-success)",
        labelPosition: "center",
        labelAlign: "below",
      },
    ] as ChartConstant[],
    xAxis: { categories: months },
    yAxis: { label: "°C" },
    title: "Label positions: start/center/end + above/below",
    height: 350,
  },
};

export const ShadedRegion: Story = {
  name: "9.2 — Shaded Region",
  args: {
    series: [temperatureData],
    shadedAreas: [
      {
        id: "summer",
        label: "Summer",
        xStart: 4,
        xEnd: 8,
        color: "var(--kreati-chart-4)",
      },
    ] as ChartShadedArea[],
    xAxis: { categories: months },
    height: 320,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 10. SIZING & LAYOUT
// ═══════════════════════════════════════════════════════════════════════════

export const FixedWidth: Story = {
  name: "10.1 — Fixed Width (500px)",
  args: {
    series: [temperatureData],
    width: 500,
    height: 250,
    xAxis: { categories: months },
  },
};

export const LargeDataset: Story = {
  name: "10.2 — Large Dataset (200 points)",
  args: {
    series: [
      {
        id: "large",
        name: "Sensor",
        data: Array.from({ length: 200 }, (_, i) => ({
          x: i,
          y: Math.random() * 80 + Math.sin(i / 10) * 20 + 10,
        })),
      },
    ],
    showPoints: false,
    height: 300,
    xAxis: { label: "Reading" },
    yAxis: { label: "Value" },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 11. ERROR BARS
// ═══════════════════════════════════════════════════════════════════════════

export const ErrorBarsSymmetric: Story = {
  name: "11.1 — Error Bars (Symmetric)",
  args: {
    series: [
      {
        ...temperatureData,
        errorMargin: 2,
      },
    ],
    xAxis: { categories: months },
    yAxis: { label: "°C" },
    height: 320,
  },
};

export const ErrorBarsPerPoint: Story = {
  name: "11.2 — Error Bars (Per Point)",
  args: {
    series: [
      {
        id: "measurement",
        name: "Measurement",
        data: [
          { x: 0, y: 20, error: 1.5 },
          { x: 1, y: 25, error: 3 },
          { x: 2, y: 22, error: 2 },
          { x: 3, y: 28, error: 4 },
          { x: 4, y: 24, error: 1 },
          { x: 5, y: 30, error: 2.5 },
        ],
      },
    ],
    xAxis: { label: "Sample" },
    yAxis: { label: "Value" },
    height: 320,
  },
};

export const ErrorBarsAsymmetric: Story = {
  name: "11.3 — Error Bars (Asymmetric)",
  args: {
    series: [
      {
        id: "lab",
        name: "Lab Results",
        data: [
          { x: 0, y: 50, errorHigh: 55, errorLow: 47 },
          { x: 1, y: 62, errorHigh: 68, errorLow: 58 },
          { x: 2, y: 45, errorHigh: 52, errorLow: 40 },
          { x: 3, y: 70, errorHigh: 78, errorLow: 65 },
          { x: 4, y: 55, errorHigh: 58, errorLow: 48 },
        ],
      },
    ],
    xAxis: { label: "Test" },
    yAxis: { label: "Concentration (mg/L)" },
    height: 320,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 12. TRENDLINES
// ═══════════════════════════════════════════════════════════════════════════

const noisyData: ChartSeries["data"] = Array.from({ length: 20 }, (_, i) => ({
  x: i,
  y: 10 + i * 2.5 + (Math.sin(i) * 8),
}));

export const TrendlineLinear: Story = {
  name: "12.1 — Trendline (Linear)",
  args: {
    series: [
      {
        id: "data",
        name: "Measurements",
        data: noisyData,
        trendline: { type: "linear" },
      },
    ],
    height: 320,
    xAxis: { label: "Sample" },
    yAxis: { label: "Value" },
  },
};

export const TrendlinePolynomial: Story = {
  name: "12.2 — Trendline (Polynomial degree 3)",
  args: {
    series: [
      {
        id: "data",
        name: "Measurements",
        data: noisyData,
        trendline: { type: "polynomial", degree: 3 },
      },
    ],
    height: 320,
    xAxis: { label: "Sample" },
    yAxis: { label: "Value" },
  },
};

export const TrendlineMovingAverage: Story = {
  name: "12.3 — Trendline (Moving Average)",
  args: {
    series: [
      {
        id: "data",
        name: "Sensor",
        data: Array.from({ length: 30 }, (_, i) => ({
          x: i,
          y: 50 + Math.random() * 20 - 10 + Math.sin(i / 3) * 10,
        })),
        trendline: { type: "moving-average", period: 5, dashStyle: "dot" },
      },
    ],
    showPoints: false,
    height: 320,
  },
};

export const TrendlineCustom: Story = {
  name: "12.4 — Trendline (Custom Function)",
  args: {
    series: [
      {
        id: "data",
        name: "Data",
        data: noisyData,
        trendline: {
          type: "custom",
          compute: (data) => {
            // Simple median smoothing
            return data.map((p, i, arr) => {
              const window = arr.slice(Math.max(0, i - 2), i + 3);
              const sorted = window.map((w) => w.y).sort((a, b) => a - b);
              return { x: p.x, y: sorted[Math.floor(sorted.length / 2)] };
            });
          },
          label: "Median smoothing",
          dashStyle: "dash-dot",
          color: "var(--kreati-severity-success)",
        },
      },
    ],
    height: 320,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 13. ANNOTATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const AnnotationBasic: Story = {
  name: "13.1 — Annotations",
  args: {
    series: [temperatureData],
    xAxis: { categories: months },
    yAxis: { label: "°C" },
    annotations: [
      { id: "peak", x: 6, y: 30, content: "Peak" },
      { id: "low", x: 0, y: 18, content: "Low", offsetY: 20 },
    ],
    height: 320,
  },
};

export const AnnotationNoArrow: Story = {
  name: "13.2 — Annotations (No Arrow)",
  args: {
    series: [temperatureData],
    xAxis: { categories: months },
    annotations: [
      { id: "note", x: 6, y: 30, content: "30°C", showArrow: false, offsetY: -16 },
    ],
    height: 320,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 14. COLOR ZONES
// ═══════════════════════════════════════════════════════════════════════════

export const ColorZones: Story = {
  name: "14.1 — Color Zones (Temperature Thresholds)",
  args: {
    series: [
      {
        ...temperatureData,
        zones: [
          { value: 22, color: "var(--kreati-severity-info)" },
          { value: 27, color: "var(--kreati-severity-warning)" },
        ],
        color: "var(--kreati-severity-danger)",
      },
    ],
    xAxis: { categories: months },
    yAxis: { label: "°C" },
    constants: [
      { id: "cold", label: "Cold", value: 22, color: "var(--kreati-severity-info)", dashStyle: "dot" },
      { id: "hot", label: "Hot", value: 27, color: "var(--kreati-severity-warning)", dashStyle: "dot" },
    ] as ChartConstant[],
    height: 320,
  },
};

export const ColorZonesWithDash: Story = {
  name: "14.2 — Color Zones with Dash Styles",
  args: {
    series: [
      {
        id: "signal",
        name: "Signal",
        data: Array.from({ length: 30 }, (_, i) => ({
          x: i,
          y: Math.sin(i / 3) * 40 + 50,
        })),
        zones: [
          { value: 30, color: "var(--kreati-severity-danger)", dashStyle: "dot" as const },
          { value: 70, color: "var(--kreati-severity-success)" },
        ],
        color: "var(--kreati-severity-warning)",
      },
    ],
    showPoints: false,
    height: 320,
  },
};

export const ColorZonesSmooth: Story = {
  name: "14.3 — Color Zones with Smooth Curve",
  args: {
    series: [
      {
        id: "temp",
        name: "Temperature",
        data: months.map((_, i) => ({ x: i, y: 15 + Math.sin(i / 1.5) * 14 })),
        zones: [
          { value: 15, color: "var(--kreati-severity-info)", dashStyle: "solid" as const },
          { value: 25, color: "var(--kreati-severity-warning)", dashStyle: "solid" as const },
        ],
      },
    ],
    xAxis: { categories: months },
    curve: "smooth" as const,
    height: 350,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 15. KEYBOARD NAVIGATION & ACCESSIBILITY
// ═══════════════════════════════════════════════════════════════════════════

export const KeyboardNavigation: Story = {
  name: "15.1 — Keyboard Navigation (Tab + Arrow keys)",
  args: {
    series: [temperatureData, humidityData],
    xAxis: { categories: months },
    yAxis: { label: "Value" },
    ariaLabel: "Temperature and humidity chart",
    height: 320,
  },
};

export const PointClick: Story = {
  name: "15.2 — Point Click / Enter",
  render: () => {
    const [clicked, setClicked] = React.useState("");
    return (
      <div>
        <LineChart
          series={[temperatureData]}
          xAxis={{ categories: months }}
          yAxis={{ label: "°C" }}
          onPointClick={(point, series) =>
            setClicked(`${series.name}: ${months[point.x]} = ${point.y}°C`)
          }
          height={300}
        />
        <p style={{ marginTop: 8, fontFamily: "var(--kreati-font-family-body)" }}>
          {clicked ? `Clicked: ${clicked}` : "Click a point or navigate with keyboard and press Enter"}
        </p>
      </div>
    );
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 16. ZOOM & PAN
// ═══════════════════════════════════════════════════════════════════════════

export const ZoomSelect: Story = {
  name: "16.1 — Zoom (Drag to Select, Ctrl+Drag to re-zoom)",
  args: {
    series: [
      {
        id: "sensor",
        name: "Sensor",
        data: Array.from({ length: 50 }, (_, i) => ({
          x: i,
          y: Math.sin(i / 5) * 30 + 50 + Math.random() * 10,
        })),
      },
    ],
    zoomMode: "select" as const,
    showPoints: false,
    height: 350,
    xAxis: { label: "Reading" },
    yAxis: { label: "Value" },
  },
};

export const ZoomWheel: Story = {
  name: "16.2 — Zoom (Scroll Wheel + Drag to Pan)",
  args: {
    series: [temperatureData, humidityData],
    zoomMode: "wheel" as const,
    xAxis: { categories: months },
    height: 350,
  },
};

export const ZoomBoth: Story = {
  name: "16.3 — Zoom (Both Modes)",
  args: {
    series: [
      {
        id: "data",
        name: "Data",
        data: Array.from({ length: 100 }, (_, i) => ({
          x: i,
          y: Math.sin(i / 8) * 40 + 50 + Math.random() * 15,
        })),
      },
    ],
    zoomMode: "both" as const,
    showPoints: false,
    height: 350,
    xAxis: { label: "Sample" },
    yAxis: { label: "Measurement" },
  },
};

export const ZoomXOnly: Story = {
  name: "16.4 — Zoom X Axis Only",
  args: {
    series: [
      {
        id: "data",
        name: "Readings",
        data: Array.from({ length: 200 }, (_, i) => ({
          x: i,
          y: Math.sin(i / 10) * 30 + 50 + Math.random() * 5,
        })),
      },
    ],
    zoomMode: "both" as const,
    zoomAxis: "x" as const,
    showPoints: false,
    height: 350,
    xAxis: { label: "Sample" },
    yAxis: { label: "Value" },
  },
};

export const ZoomYOnly: Story = {
  name: "16.5 — Zoom Y Axis Only",
  args: {
    series: [
      {
        id: "data",
        name: "Concentration",
        data: Array.from({ length: 30 }, (_, i) => ({
          x: i,
          y: Math.random() * 100,
        })),
      },
    ],
    zoomMode: "both" as const,
    zoomAxis: "y" as const,
    showPoints: false,
    height: 350,
    yAxis: { label: "mg/L" },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 17. OVERLAY INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════

export const ChartInDialog: Story = {
  name: "17.1 — Chart inside Dialog (overlay stacking)",
  render: () => {
    const [open, setOpen] = React.useState(false);
    const [detailOpen, setDetailOpen] = React.useState(false);
    return (
      <div>
        <Button onClick={() => setOpen(true)}>Open Chart Dialog</Button>
        <Dialog
          visible={open}
          onHide={() => setOpen(false)}
          header="Sensor Analysis"
        >
          <LineChart
            series={[
              {
                id: "sensor",
                name: "Sensor A",
                data: Array.from({ length: 30 }, (_, i) => ({
                  x: i,
                  y: Math.sin(i / 4) * 25 + 50 + Math.random() * 5,
                })),
              },
              {
                id: "sensor-b",
                name: "Sensor B",
                data: Array.from({ length: 30 }, (_, i) => ({
                  x: i,
                  y: Math.cos(i / 4) * 20 + 45 + Math.random() * 5,
                })),
                dashStyle: "dash",
              },
            ]}
            constants={[
              { id: "limit", label: "Upper Limit", value: 75, color: "var(--kreati-severity-danger)" },
            ] as ChartConstant[]}
            zoomMode="both"
            height={300}
            xAxis={{ label: "Reading" }}
            yAxis={{ label: "Value" }}
            onPointClick={() => setDetailOpen(true)}
          />
          <p style={{ marginTop: 8, fontSize: "var(--kreati-font-size-sm)", color: "var(--kreati-text-secondary)" }}>
            Click a point to open detail dialog. Right-click for zoom options.
          </p>
          <Dialog
            visible={detailOpen}
            onHide={() => setDetailOpen(false)}
            header="Point Detail"
          >
            <Tooltip content="This tooltip renders above both dialogs">
              <p>Detail view with nested dialog overlay. Tooltip, dialog, and chart context menu all coexist.</p>
            </Tooltip>
          </Dialog>
        </Dialog>
      </div>
    );
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 18. EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const ExportMenu: Story = {
  name: "18.1 — Export (right-click or menu button)",
  args: {
    series: [temperatureData, humidityData],
    xAxis: { categories: months, label: "Month" },
    yAxis: { label: "Value" },
    title: "Sensor Data",
    exportFormats: ["png", "svg", "csv", "json-table", "json-series"],
    height: 350,
  },
};

export const ExportWithZoom: Story = {
  name: "18.2 — Export + Zoom (menu shows both)",
  args: {
    series: [
      {
        id: "data",
        name: "Readings",
        data: Array.from({ length: 50 }, (_, i) => ({
          x: i,
          y: Math.sin(i / 5) * 30 + 50 + Math.random() * 10,
        })),
      },
    ],
    zoomMode: "both" as const,
    exportFormats: ["png", "csv"],
    showPoints: false,
    height: 350,
  },
};

export const NoMenuButton: Story = {
  name: "18.3 — Menu Button Hidden (showMenuButton=false)",
  args: {
    series: [temperatureData],
    xAxis: { categories: months },
    exportFormats: ["png", "csv"],
    showMenuButton: false,
    height: 320,
  },
};

export const ExportLocaleEs: Story = {
  name: "18.4 — Export Menu (Spanish Locale)",
  render: () => (
    <KreatiProvider locale={es}>
      <LineChart
        series={[temperatureData, humidityData]}
        xAxis={{ categories: months }}
        yAxis={{ label: "Valor" }}
        title="Datos del Sensor"
        subtitle="Menu contextual en espanol"
        exportFormats={["png", "svg", "csv", "json-table", "json-series"]}
        height={350}
      />
    </KreatiProvider>
  ),
};

export const ExportCsvSemicolon: Story = {
  name: "18.5 — CSV Export (Comma Separator Override)",
  args: {
    series: [temperatureData, humidityData],
    xAxis: { categories: months },
    title: "Comma CSV",
    exportFormats: ["csv"],
    csvSeparator: ",",
    height: 350,
  },
};

export const ExportCustomMenuItems: Story = {
  name: "18.6 — Custom Context Menu Items",
  render: () => (
    <LineChart
      series={[temperatureData, humidityData]}
      xAxis={{ categories: months }}
      title="Custom Menu Items"
      exportFormats={["png", "csv"]}
      height={350}
      contextMenuItems={[
        {
          key: "export-pdf",
          label: "Export as PDF",
          icon: (
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5zM8 13h2a1.5 1.5 0 0 1 0 3H9v2H8v-5zm6 0h1.5A1.5 1.5 0 0 1 17 14.5v2a1.5 1.5 0 0 1-1.5 1.5H14v-5z" fill="currentColor" />
            </svg>
          ),
          command: () => alert("PDF export triggered"),
        },
        {
          key: "share",
          label: "Share chart",
          command: () => alert("Share triggered"),
        },
      ]}
    />
  ),
};

export const ExportFullCustomMenu: Story = {
  name: "18.7 — Fully Custom Context Menu (contextMenuRender)",
  render: () => (
    <LineChart
      series={[temperatureData, humidityData]}
      xAxis={{ categories: months }}
      title="Full Custom Menu"
      exportFormats={["png", "csv"]}
      height={350}
      contextMenuRender={(defaultItems, onSelect, children) => (
        <ContextMenu
          items={[
            ...defaultItems,
            { key: "divider-x", separator: true },
            { key: "custom-action", label: "My Custom Action", command: () => alert("Custom!") },
          ]}
          trigger="contextmenu"
          onItemSelect={(key) => onSelect(key)}
        >
          {children}
        </ContextMenu>
      )}
    />
  ),
};

// ═══════════════════════════════════════════════════════════════════════════
// 19. NAVIGATOR
// ═══════════════════════════════════════════════════════════════════════════

export const Navigator: Story = {
  name: "19.1 — Navigator Inside (move mouse to bottom)",
  args: {
    series: [
      {
        id: "sensor",
        name: "Sensor",
        data: Array.from({ length: 200 }, (_, i) => ({
          x: i,
          y: Math.sin(i / 10) * 30 + 50 + Math.random() * 10,
        })),
      },
    ],
    showNavigator: true,
    zoomMode: "both" as const,
    zoomAxis: "x" as const,
    showPoints: false,
    height: 300,
    xAxis: { label: "Reading" },
    yAxis: { label: "Value" },
  },
};

export const NavigatorMultipleSeries: Story = {
  name: "19.2 — Navigator (Multiple Series)",
  args: {
    series: [
      {
        id: "a",
        name: "Temperature",
        data: Array.from({ length: 100 }, (_, i) => ({
          x: i,
          y: Math.sin(i / 8) * 15 + 25,
        })),
      },
      {
        id: "b",
        name: "Humidity",
        data: Array.from({ length: 100 }, (_, i) => ({
          x: i,
          y: Math.cos(i / 8) * 20 + 55,
        })),
        dashStyle: "dash",
      },
    ],
    showNavigator: true,
    zoomMode: "both" as const,
    showPoints: false,
    height: 320,
  },
};

export const NavigatorBottom: Story = {
  name: "19.3 — Navigator Bottom Position",
  args: {
    series: [
      {
        id: "sensor",
        name: "Sensor",
        data: Array.from({ length: 200 }, (_, i) => ({
          x: i,
          y: Math.sin(i / 10) * 30 + 50 + Math.random() * 10,
        })),
      },
    ],
    showNavigator: true,
    navigatorPosition: "bottom" as const,
    zoomMode: "both" as const,
    zoomAxis: "x" as const,
    showPoints: false,
    height: 300,
  },
};

export const NavigatorBottomMultiple: Story = {
  name: "19.4 — Navigator Bottom (Multiple Series)",
  args: {
    series: [
      {
        id: "a",
        name: "Temperature",
        data: Array.from({ length: 100 }, (_, i) => ({ x: i, y: Math.sin(i / 8) * 15 + 25 })),
      },
      {
        id: "b",
        name: "Humidity",
        data: Array.from({ length: 100 }, (_, i) => ({ x: i, y: Math.cos(i / 8) * 20 + 55 })),
        dashStyle: "dash",
      },
    ],
    showNavigator: true,
    navigatorPosition: "bottom" as const,
    zoomMode: "both" as const,
    showPoints: false,
    height: 320,
  },
};

export const NavigatorFixed: Story = {
  name: "19.5 — Navigator Fixed (always visible)",
  args: {
    series: [
      {
        id: "sensor",
        name: "Sensor",
        data: Array.from({ length: 200 }, (_, i) => ({ x: i, y: Math.sin(i / 10) * 30 + 50 + Math.random() * 10 })),
      },
    ],
    showNavigator: true,
    navigatorVisibility: "fixed" as const,
    zoomMode: "both" as const,
    zoomAxis: "x" as const,
    showPoints: false,
    height: 300,
  },
};

export const NavigatorZoomFixed: Story = {
  name: "19.6 — Navigator Zoom-Fixed (visible when zoomed)",
  args: {
    series: [
      {
        id: "sensor",
        name: "Sensor",
        data: Array.from({ length: 200 }, (_, i) => ({ x: i, y: Math.sin(i / 10) * 30 + 50 + Math.random() * 10 })),
      },
    ],
    showNavigator: true,
    navigatorVisibility: "zoom-fixed" as const,
    zoomMode: "both" as const,
    zoomAxis: "x" as const,
    showPoints: false,
    height: 300,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 20. PATTERN FILLS & ALTERNATING BANDS
// ═══════════════════════════════════════════════════════════════════════════

export const PatternFillStripes: Story = {
  name: "20.1 — Pattern Fill: Stripes",
  args: {
    series: [
      { ...temperatureData, fill: { pattern: "stripes" } },
      { ...humidityData, fill: { pattern: "dots" } },
    ],
    xAxis: { categories: months },
    showArea: true,
    height: 350,
  },
};

export const PatternFillCrosshatch: Story = {
  name: "20.2 — Pattern Fill: Crosshatch",
  args: {
    series: [
      { ...temperatureData, fill: { pattern: "crosshatch" } },
    ],
    xAxis: { categories: months },
    showArea: true,
    areaOpacity: 0.5,
    height: 350,
  },
};

export const PatternFillAllTypes: Story = {
  name: "20.3 — Pattern Fill: All Types Comparison",
  args: {
    series: [
      { id: "s1", name: "Stripes", data: temperatureData.data, fill: { pattern: "stripes" } },
      { id: "s2", name: "Dots", data: humidityData.data, fill: { pattern: "dots" } },
      { id: "s3", name: "Crosshatch", data: temperatureData.data.map((p) => ({ ...p, y: p.y - 5 })), fill: { pattern: "crosshatch" } },
    ],
    xAxis: { categories: months },
    showArea: true,
    height: 350,
  },
};

export const AlternatingBandsY: Story = {
  name: "20.4 — Alternating Bands (Y Axis)",
  args: {
    series: [temperatureData, humidityData],
    xAxis: { categories: months },
    yAxis: { label: "Value", alternatingBands: true },
    showGrid: true,
    height: 350,
  },
};

export const AlternatingBandsX: Story = {
  name: "20.5 — Alternating Bands (X Axis — Vertical)",
  args: {
    series: [temperatureData],
    xAxis: { categories: months, alternatingBands: true, alternatingBandOpacity: 0.12 },
    yAxis: { label: "°C" },
    height: 350,
  },
};

export const AlternatingBandsCustomColor: Story = {
  name: "20.6 — Alternating Bands (Two Colors)",
  args: {
    series: [temperatureData, humidityData],
    xAxis: { categories: months },
    yAxis: {
      label: "Value",
      alternatingBands: true,
      alternatingBandColor: ["var(--kreati-severity-info)", "var(--kreati-severity-success)"],
      alternatingBandOpacity: 0.08,
    },
    showGrid: true,
    height: 350,
  },
};

export const PatternFillWithBands: Story = {
  name: "20.7 — Pattern Fill + Alternating Bands",
  args: {
    series: [
      { ...temperatureData, fill: { pattern: "stripes" } },
      { ...humidityData, fill: { pattern: "dots" } },
    ],
    xAxis: { categories: months },
    yAxis: { label: "Value", alternatingBands: true },
    showArea: true,
    showGrid: true,
    height: 350,
  },
};

export const GridVerticalOnly: Story = {
  name: "20.8 — Grid: Vertical Lines Only",
  args: {
    series: [temperatureData, humidityData],
    xAxis: { categories: months, showGrid: true },
    yAxis: { label: "Value" },
    showGrid: false,
    height: 350,
  },
};

export const GridBoth: Story = {
  name: "20.9 — Grid: Both Horizontal + Vertical",
  args: {
    series: [temperatureData, humidityData],
    xAxis: { categories: months, showGrid: true },
    yAxis: { label: "Value" },
    showGrid: true,
    height: 350,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 21. RESPONSIVE
// ═══════════════════════════════════════════════════════════════════════════

export const ResponsiveSmall: Story = {
  name: "21.1 — Responsive (320px viewport)",
  decorators: [
    (Story: React.FC) => (
      <div style={{ width: 320, background: "#fff", padding: 8, borderRadius: 8 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    series: [temperatureData, humidityData],
    xAxis: { categories: months },
    yAxis: { label: "Value" },
    height: 250,
  },
};

export const ResponsiveTouchZoom: Story = {
  name: "21.2 — Touch Zoom (pinch + drag on mobile)",
  args: {
    series: [
      {
        id: "data",
        name: "Readings",
        data: Array.from({ length: 100 }, (_, i) => ({
          x: i,
          y: Math.sin(i / 8) * 30 + 50 + Math.random() * 10,
        })),
      },
    ],
    zoomMode: "both" as const,
    height: 300,
  },
};

export const ResponsiveHeight: Story = {
  name: "21.3 — Responsive Height (fills container)",
  render: () => {
    const ref = React.useRef<HTMLDivElement>(null);
    const [h, setH] = React.useState(300);
    React.useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const obs = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) setH(entry.contentRect.height);
      });
      obs.observe(el);
      setH(el.clientHeight);
      return () => obs.disconnect();
    }, []);
    return (
      <div ref={ref} style={{ height: "60vh", background: "#fff", padding: 16, borderRadius: 8 }}>
        <LineChart
          series={[temperatureData, humidityData]}
          xAxis={{ categories: months }}
          height={h - 32}
        />
      </div>
    );
  },
};

export const ResizableChart: Story = {
  name: "21.4 — Resizable Vertical (drag bottom edge)",
  args: {
    series: [temperatureData, humidityData],
    xAxis: { categories: months },
    yAxis: { label: "Value" },
    height: 300,
    resizable: "vertical",
    minHeight: 150,
    maxHeight: 600,
  },
};

export const ResizableHorizontal: Story = {
  name: "21.5 — Resizable Horizontal (drag right edge)",
  args: {
    series: [temperatureData, humidityData],
    xAxis: { categories: months },
    height: 300,
    resizable: "horizontal",
    minWidth: 300,
    maxWidth: 900,
  },
};

export const ResizableBoth: Story = {
  name: "21.6 — Resizable Both (drag edges or corner)",
  args: {
    series: [temperatureData, humidityData],
    xAxis: { categories: months },
    yAxis: { label: "Value" },
    height: 300,
    resizable: "both",
    minHeight: 150,
    maxHeight: 600,
    minWidth: 300,
    maxWidth: 900,
  },
};

export const ResizableWithZoom: Story = {
  name: "21.7 — Resizable + Zoom",
  args: {
    series: [temperatureData, humidityData],
    xAxis: { categories: months },
    height: 350,
    resizable: true,
    minHeight: 200,
    zoomMode: "both" as const,
    exportFormats: ["png", "csv"] as ("png" | "csv")[],
  },
};