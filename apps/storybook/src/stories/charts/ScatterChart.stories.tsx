import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ScatterChart } from "../../../../../packages/react/src/components/Chart/cartesian/ScatterChart";
import { MixedChart } from "../../../../../packages/react/src/components/Chart/cartesian/MixedChart";
import { ChartGroup } from "../../../../../packages/react/src/components/Chart/composition/ChartGroup";
import type { ChartSeries } from "../../../../../packages/react/src/components/Chart/core/types";

const meta = {
  title: "Charts/ScatterChart",
  component: ScatterChart,
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
} satisfies Meta<typeof ScatterChart>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Sample data ────────────────────────────────────────────────────────────

const sampleA: ChartSeries = {
  id: "a",
  name: "Group A",
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

const sampleB: ChartSeries = {
  id: "b",
  name: "Group B",
  data: [
    { x: 5, y: 20 },
    { x: 15, y: 40 },
    { x: 30, y: 35 },
    { x: 45, y: 55 },
    { x: 50, y: 48 },
    { x: 70, y: 65 },
    { x: 85, y: 80 },
    { x: 95, y: 70 },
  ],
};

const sampleC: ChartSeries = {
  id: "c",
  name: "Group C",
  data: [
    { x: 12, y: 60 },
    { x: 25, y: 75 },
    { x: 38, y: 55 },
    { x: 52, y: 90 },
    { x: 68, y: 45 },
    { x: 78, y: 70 },
    { x: 88, y: 85 },
  ],
};

const bubbleData: ChartSeries = {
  id: "bubble",
  name: "Experiments",
  data: [
    { x: 10, y: 30, z: 5 },
    { x: 20, y: 50, z: 15 },
    { x: 35, y: 45, z: 8 },
    { x: 40, y: 70, z: 25 },
    { x: 55, y: 60, z: 12 },
    { x: 65, y: 85, z: 30 },
    { x: 80, y: 75, z: 20 },
    { x: 90, y: 95, z: 10 },
  ],
};

const multiBubble: ChartSeries[] = [
  {
    id: "lab-a",
    name: "Lab A",
    data: [
      { x: 10, y: 30, z: 8 },
      { x: 25, y: 55, z: 20 },
      { x: 40, y: 45, z: 12 },
      { x: 60, y: 70, z: 28 },
      { x: 80, y: 85, z: 15 },
    ],
  },
  {
    id: "lab-b",
    name: "Lab B",
    data: [
      { x: 15, y: 40, z: 10 },
      { x: 30, y: 60, z: 5 },
      { x: 50, y: 50, z: 22 },
      { x: 70, y: 75, z: 18 },
      { x: 90, y: 65, z: 30 },
    ],
  },
];

// ─── 1. Basics ──────────────────────────────────────────────────────────────

/** 1.1 — Default scatter chart with a single series. */
export const Default: Story = {
  args: {
    series: [sampleA],
    xAxis: { label: "Concentration" },
    yAxis: { label: "Response" },
    height: 350,
  },
};

/** 1.2 — Multiple series with auto-assigned marker shapes. */
export const MultipleSeries: Story = {
  args: {
    series: [sampleA, sampleB, sampleC],
    xAxis: { label: "X" },
    yAxis: { label: "Y" },
    height: 350,
  },
};

/** 1.3 — With title and subtitle. */
export const WithTitle: Story = {
  args: {
    series: [sampleA, sampleB],
    title: "Sample Distribution",
    subtitle: "Concentration vs Response",
    xAxis: { label: "Concentration (mg/L)" },
    yAxis: { label: "Response (mV)" },
    height: 350,
  },
};

// ─── 2. Marker Shapes ──────────────────────────────────────────────────────

/** 2.1 — Explicit marker symbols per series. */
export const MarkerShapes: Story = {
  args: {
    series: [
      { ...sampleA, markerSymbol: "circle" },
      { ...sampleB, markerSymbol: "square" },
      { ...sampleC, markerSymbol: "diamond" },
    ],
    xAxis: { label: "X" },
    yAxis: { label: "Y" },
    height: 350,
  },
};

/** 2.2 — Custom marker sizes per series. */
export const CustomMarkerSize: Story = {
  args: {
    series: [
      { ...sampleA, markerSize: 4 },
      { ...sampleB, markerSize: 8 },
      { ...sampleC, markerSize: 12 },
    ],
    xAxis: { label: "X" },
    yAxis: { label: "Y" },
    height: 350,
  },
};

/** 2.3 — Triangle and triangle-down markers. */
export const TriangleMarkers: Story = {
  args: {
    series: [
      { ...sampleA, markerSymbol: "triangle", name: "Upward" },
      { ...sampleB, markerSymbol: "triangle-down", name: "Downward" },
    ],
    xAxis: { label: "X" },
    yAxis: { label: "Y" },
    height: 350,
  },
};

// ─── 3. Bubble Mode ─────────────────────────────────────────────────────────

/** 3.1 — Bubble chart with z-value controlling size. */
export const BubbleChart: Story = {
  args: {
    series: [bubbleData],
    bubbleMode: true,
    xAxis: { label: "Concentration" },
    yAxis: { label: "Response" },
    height: 400,
  },
};

/** 3.2 — Multiple series in bubble mode. */
export const MultiBubble: Story = {
  args: {
    series: multiBubble,
    bubbleMode: true,
    bubbleMin: 5,
    bubbleMax: 35,
    xAxis: { label: "Temperature" },
    yAxis: { label: "Yield" },
    height: 400,
  },
};

/** 3.3 — Custom bubble range. Uses extra margins to accommodate large bubbles at edges. */
export const BubbleCustomRange: Story = {
  args: {
    series: [bubbleData],
    bubbleMode: true,
    bubbleMin: 3,
    bubbleMax: 50,
    margins: { top: 30, right: 60, bottom: 50, left: 60 },
    xAxis: { label: "X" },
    yAxis: { label: "Y" },
    height: 400,
  },
};

// ─── 4. Connecting Lines ────────────────────────────────────────────────────

/** 4.1 — Points connected with lines. */
export const WithConnectingLine: Story = {
  args: {
    series: [sampleA, sampleB],
    showLine: true,
    xAxis: { label: "X" },
    yAxis: { label: "Y" },
    height: 350,
  },
};

/** 4.2 — Smooth connecting line. */
export const SmoothConnectingLine: Story = {
  args: {
    series: [sampleA],
    showLine: true,
    curve: "smooth",
    xAxis: { label: "X" },
    yAxis: { label: "Y" },
    height: 350,
  },
};

// ─── 5. Trendlines ──────────────────────────────────────────────────────────

/** 5.1 — Linear trendline. */
export const LinearTrendline: Story = {
  args: {
    series: [
      { ...sampleA, trendline: { type: "linear" } },
    ],
    xAxis: { label: "Concentration" },
    yAxis: { label: "Response" },
    height: 350,
  },
};

/** 5.2 — Polynomial trendline. */
export const PolynomialTrendline: Story = {
  args: {
    series: [
      { ...sampleA, trendline: { type: "polynomial", degree: 3 } },
    ],
    xAxis: { label: "X" },
    yAxis: { label: "Y" },
    height: 350,
  },
};

/** 5.3 — Multiple series with trendlines. */
export const MultipleTrendlines: Story = {
  args: {
    series: [
      { ...sampleA, trendline: { type: "linear", color: "var(--kreati-chart-1)" } },
      { ...sampleB, trendline: { type: "linear", color: "var(--kreati-chart-2)" } },
    ],
    xAxis: { label: "X" },
    yAxis: { label: "Y" },
    height: 350,
  },
};

// ─── 6. Data Labels ─────────────────────────────────────────────────────────

/** 6.1 — Show data labels on each point. */
export const DataLabels: Story = {
  args: {
    series: [sampleA],
    showDataLabels: true,
    xAxis: { label: "X" },
    yAxis: { label: "Y" },
    height: 350,
  },
};

/** 6.2 — Custom data label format. */
export const CustomDataLabels: Story = {
  args: {
    series: [
      {
        ...sampleA,
        showDataLabels: true,
        dataLabelFormat: (p) => `(${p.x}, ${p.y})`,
      },
    ],
    showDataLabels: true,
    xAxis: { label: "X" },
    yAxis: { label: "Y" },
    height: 350,
  },
};

// ─── 7. Tooltip ─────────────────────────────────────────────────────────────

/** 7.1 — Single tooltip mode (default, euclidean proximity). */
export const TooltipSingle: Story = {
  args: {
    series: [sampleA, sampleB],
    tooltipMode: "single",
    xAxis: { label: "X" },
    yAxis: { label: "Y" },
    height: 350,
  },
};

/** 7.2 — Shared tooltip mode. */
export const TooltipShared: Story = {
  args: {
    series: [sampleA, sampleB],
    tooltipMode: "shared",
    xAxis: { label: "X" },
    yAxis: { label: "Y" },
    height: 350,
  },
};

// ─── 8. Styling ─────────────────────────────────────────────────────────────

/** 8.1 — Severity colors. */
export const SeverityColors: Story = {
  args: {
    series: [
      { ...sampleA, severity: "success", name: "Pass" },
      { ...sampleB, severity: "danger", name: "Fail" },
      { ...sampleC, severity: "warning", name: "Review" },
    ],
    xAxis: { label: "X" },
    yAxis: { label: "Y" },
    height: 350,
  },
};

/** 8.2 — Pattern fills. */
export const PatternFills: Story = {
  args: {
    series: [
      { ...sampleA, fill: { pattern: "stripes" } },
      { ...sampleB, fill: { pattern: "dots" } },
      { ...sampleC, fill: { pattern: "crosshatch" } },
    ],
    markerSize: 10,
    xAxis: { label: "X" },
    yAxis: { label: "Y" },
    height: 350,
  },
};

/** 8.3 — Per-point custom colors. */
export const PerPointColors: Story = {
  args: {
    series: [
      {
        id: "custom",
        name: "Custom Colors",
        data: [
          { x: 10, y: 30, color: "var(--kreati-chart-1)" },
          { x: 20, y: 50, color: "var(--kreati-chart-2)" },
          { x: 35, y: 45, color: "var(--kreati-chart-3)" },
          { x: 40, y: 70, color: "var(--kreati-chart-4)" },
          { x: 55, y: 60, color: "var(--kreati-chart-5)" },
          { x: 65, y: 85, color: "var(--kreati-chart-6)" },
        ],
      },
    ],
    markerSize: 10,
    xAxis: { label: "X" },
    yAxis: { label: "Y" },
    height: 350,
  },
};

// ─── 9. Overlays ────────────────────────────────────────────────────────────

/** 9.1 — With constant lines. */
export const WithConstants: Story = {
  args: {
    series: [sampleA],
    constants: [
      { id: "threshold", label: "Threshold", value: 60, color: "var(--kreati-severity-danger)", dashStyle: "solid", width: 2 },
      { id: "target", label: "Target", value: 80, color: "var(--kreati-severity-success)", dashStyle: "dash", width: 2 },
    ],
    xAxis: { label: "X" },
    yAxis: { label: "Y" },
    height: 350,
  },
};

/** 9.2 — With shaded areas. */
export const WithShadedArea: Story = {
  args: {
    series: [sampleA, sampleB],
    shadedAreas: [
      { id: "zone", label: "Optimal Zone", xStart: 30, xEnd: 70, color: "var(--kreati-severity-success)" },
    ],
    xAxis: { label: "X" },
    yAxis: { label: "Y" },
    height: 350,
  },
};

/** 9.3 — With annotations. */
export const WithAnnotations: Story = {
  args: {
    series: [sampleA],
    annotations: [
      { id: "peak", x: 90, y: 95, content: "Peak", showArrow: true, offsetY: -20 },
      { id: "low", x: 10, y: 30, content: "Start", showArrow: true, offsetY: 20 },
    ],
    xAxis: { label: "X" },
    yAxis: { label: "Y" },
    height: 350,
  },
};

// ─── 10. Zoom & Interaction ─────────────────────────────────────────────────

/** 10.1 — Zoom enabled. */
export const WithZoom: Story = {
  args: {
    series: [sampleA, sampleB],
    zoomMode: "both",
    xAxis: { label: "X" },
    yAxis: { label: "Y" },
    height: 350,
  },
};

/** 10.2 — Point click handler. */
export const OnPointClick: Story = {
  args: {
    series: [sampleA, sampleB],
    onPointClick: (point, series) => alert(`${series.name}: (${point.x}, ${point.y})`),
    xAxis: { label: "X" },
    yAxis: { label: "Y" },
    height: 350,
  },
};

// ─── 11. Export ──────────────────────────────────────────────────────────────

/** 11.1 — With export options. */
export const WithExport: Story = {
  args: {
    series: [sampleA, sampleB],
    title: "Scatter Export",
    exportFormats: ["png", "svg", "csv"],
    xAxis: { label: "X" },
    yAxis: { label: "Y" },
    height: 350,
  },
};

// ─── 12. Multi-Axis ─────────────────────────────────────────────────────────

/** 12.1 — Dual Y axes. */
export const MultiAxis: Story = {
  args: {
    series: [
      { ...sampleA, yAxisId: "left", unit: "mV" },
      {
        id: "pressure",
        name: "Pressure",
        yAxisId: "right",
        unit: "kPa",
        markerSymbol: "diamond",
        data: [
          { x: 10, y: 100 },
          { x: 20, y: 180 },
          { x: 35, y: 150 },
          { x: 40, y: 220 },
          { x: 55, y: 200 },
          { x: 65, y: 280 },
          { x: 80, y: 250 },
          { x: 90, y: 310 },
        ],
      },
    ],
    yAxis: [
      { id: "left", label: "Response (mV)" },
      { id: "right", label: "Pressure (kPa)", side: "right" },
    ],
    xAxis: { label: "Concentration" },
    height: 350,
  },
};

// ─── 13. Legend ──────────────────────────────────────────────────────────────

/** 13.1 — Legend on top. */
export const LegendTop: Story = {
  args: {
    series: [sampleA, sampleB, sampleC],
    legendPosition: "top",
    xAxis: { label: "X" },
    yAxis: { label: "Y" },
    height: 350,
  },
};

/** 13.2 — Inside legend. */
export const LegendInside: Story = {
  args: {
    series: [sampleA, sampleB],
    legendPosition: "inside-top-right",
    xAxis: { label: "X" },
    yAxis: { label: "Y" },
    height: 350,
  },
};

// ─── 14. Keyboard & Accessibility ───────────────────────────────────────────

/** 14.1 — Click the chart and use arrow keys to navigate points. */
export const KeyboardNavigation: Story = {
  args: {
    series: [sampleA, sampleB],
    xAxis: { label: "X" },
    yAxis: { label: "Y" },
    ariaLabel: "Scatter chart with keyboard navigation",
    height: 350,
  },
};

// ─── 15. MixedChart Integration ─────────────────────────────────────────────

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

const mixedBar: ChartSeries = {
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

const mixedLine: ChartSeries = {
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

const mixedArea: ChartSeries = {
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

const mixedScatter: ChartSeries = {
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

/** 15.1 — Scatter + Line in MixedChart. */
export const MixedWithLine: StoryObj = {
  render: () => (
    <MixedChart
      series={[sampleA, { id: "trend", name: "Trend", data: [{ x: 10, y: 35 }, { x: 30, y: 50 }, { x: 50, y: 55 }, { x: 70, y: 70 }, { x: 90, y: 85 }] }]}
      layers={[
        { type: "scatter", seriesIds: ["a"], markerSize: 8 },
        { type: "line", seriesIds: ["trend"], strokeWidth: 2 },
      ]}
      xAxis={{ label: "X" }}
      yAxis={{ label: "Y" }}
      height={350}
    />
  ),
};

/** 15.2 — Scatter + Bar in MixedChart with categories. */
export const MixedWithBar: StoryObj = {
  render: () => (
    <MixedChart
      series={[mixedBar, mixedScatter]}
      layers={[
        { type: "bar", seriesIds: ["revenue"], barRadius: 4 },
        { type: "scatter", seriesIds: ["outliers"], markerSize: 8 },
      ]}
      xAxis={{ categories: months }}
      yAxis={{ label: "Value" }}
      height={350}
    />
  ),
};

/** 15.3 — All 4 chart types in a single MixedChart. */
export const MixedAllTypes: StoryObj = {
  render: () => (
    <MixedChart
      series={[mixedBar, mixedLine, mixedArea, mixedScatter]}
      layers={[
        { type: "area", seriesIds: ["costs"], areaOpacity: 0.3 },
        { type: "bar", seriesIds: ["revenue"], barRadius: 4 },
        { type: "line", seriesIds: ["target"], strokeWidth: 2 },
        { type: "scatter", seriesIds: ["outliers"], markerSize: 8 },
      ]}
      xAxis={{ categories: months }}
      yAxis={{ label: "Value" }}
      title="Mixed Chart — All Types"
      height={400}
      zoomMode="both"
      exportFormats={["png", "svg", "csv"]}
    />
  ),
};

// ─── 16. ChartGroup Integration ─────────────────────────────────────────────

/** 16.1 — ChartGroup with 4 panel types, synchronized. */
export const ChartGroupSynced: StoryObj = {
  render: () => (
    <ChartGroup
      panels={[
        {
          type: "bar",
          title: "Revenue (Bar)",
          series: [mixedBar],
          height: 180,
          barRadius: 4,
        },
        {
          type: "line",
          title: "Target (Line)",
          series: [mixedLine],
          height: 180,
        },
        {
          type: "area",
          title: "Costs (Area)",
          series: [mixedArea],
          height: 180,
          areaOpacity: 0.4,
        },
        {
          type: "scatter",
          title: "Outliers (Scatter)",
          series: [mixedScatter],
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

/** 16.2 — ChartGroup with 4 panel types, independent (not synchronized). */
export const ChartGroupIndependent: StoryObj = {
  render: () => (
    <ChartGroup
      panels={[
        {
          type: "bar",
          title: "Revenue (Bar)",
          series: [mixedBar],
          height: 180,
          barRadius: 4,
        },
        {
          type: "line",
          title: "Target (Line)",
          series: [mixedLine],
          height: 180,
        },
        {
          type: "area",
          title: "Costs (Area)",
          series: [mixedArea],
          height: 180,
          areaOpacity: 0.4,
        },
        {
          type: "scatter",
          title: "Outliers (Scatter)",
          series: [mixedScatter],
          height: 180,
        },
      ]}
      xAxis={{ categories: months }}
      synchronized={false}
    />
  ),
};

// ─── 17. Navigator ──────────────────────────────────────────────────────────

/** 17.1 — With range navigator. */
export const WithNavigator: Story = {
  args: {
    series: [sampleA, sampleB],
    showNavigator: true,
    navigatorPosition: "bottom",
    navigatorVisibility: "fixed",
    zoomMode: "both",
    xAxis: { label: "X" },
    yAxis: { label: "Y" },
    height: 350,
  },
};

// ─── 18. LIMS Use Case ─────────────────────────────────────────────────────

/** 18.1 — Calibration curve with trendline and threshold. */
export const CalibrationCurve: Story = {
  args: {
    series: [
      {
        id: "calibration",
        name: "Calibration Points",
        markerSymbol: "circle",
        data: [
          { x: 0, y: 0.02 },
          { x: 5, y: 0.15 },
          { x: 10, y: 0.31 },
          { x: 25, y: 0.78 },
          { x: 50, y: 1.52 },
          { x: 100, y: 3.05 },
          { x: 200, y: 6.1 },
        ],
        trendline: { type: "linear" },
      },
    ],
    constants: [
      { id: "loq", label: "LOQ", value: 0.15, color: "var(--kreati-severity-warning)", dashStyle: "dash" },
    ],
    title: "Calibration Curve",
    subtitle: "Analyte X — UV-Vis 254nm",
    xAxis: { label: "Concentration (mg/L)" },
    yAxis: { label: "Absorbance (AU)" },
    height: 400,
    showDataLabels: true,
  },
};
