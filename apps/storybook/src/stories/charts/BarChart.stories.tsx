import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { BarChart } from "../../../../../packages/react/src/components/Chart/cartesian/BarChart";
import { LineChart } from "../../../../../packages/react/src/components/Chart/cartesian/LineChart";
import { CartesianChart } from "../../../../../packages/react/src/components/Chart/cartesian/CartesianChart";
import { ChartTooltip } from "../../../../../packages/react/src/components/Chart/core/ChartTooltip";
import type { TooltipEntry } from "../../../../../packages/react/src/components/Chart/core/ChartTooltip";
import type { ChartSeries, ChartDataPoint } from "../../../../../packages/react/src/components/Chart/core/types";

const meta = {
  title: "Charts/BarChart",
  component: BarChart,
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
} satisfies Meta<typeof BarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Sample data ────────────────────────────────────────────────────────────

const quarters = ["Q1", "Q2", "Q3", "Q4"];

const salesData: ChartSeries = {
  id: "sales",
  name: "Sales",
  data: [
    { x: 0, y: 120 },
    { x: 1, y: 200 },
    { x: 2, y: 150 },
    { x: 3, y: 280 },
  ],
};

const expensesData: ChartSeries = {
  id: "expenses",
  name: "Expenses",
  data: [
    { x: 0, y: 90 },
    { x: 1, y: 130 },
    { x: 2, y: 110 },
    { x: 3, y: 170 },
  ],
};

const profitData: ChartSeries = {
  id: "profit",
  name: "Profit",
  data: [
    { x: 0, y: 30 },
    { x: 1, y: 70 },
    { x: 2, y: 40 },
    { x: 3, y: 110 },
  ],
};

// ─── 1. Basics ──────────────────────────────────────────────────────────────

export const Default: Story = {
  name: "1.1 — Default (Single Series)",
  args: {
    series: [salesData],
    xAxis: { label: "Quarter", categories: quarters },
    yAxis: { label: "Revenue ($K)" },
    title: "Quarterly Sales",
  },
};

export const MultipleSeries: Story = {
  name: "1.2 — Multiple Series (Grouped)",
  args: {
    series: [salesData, expensesData, profitData],
    xAxis: { label: "Quarter", categories: quarters },
    yAxis: { label: "Amount ($K)" },
    title: "Financial Overview",
  },
};

export const WithTitle: Story = {
  name: "1.3 — With Title & Subtitle",
  args: {
    series: [salesData],
    xAxis: { label: "Quarter", categories: quarters },
    yAxis: { label: "Revenue ($K)" },
    title: "Quarterly Sales",
    subtitle: "Fiscal Year 2026",
  },
};

// ─── 2. Orientation ─────────────────────────────────────────────────────────

export const Horizontal: Story = {
  name: "2.1 — Horizontal Bars",
  args: {
    series: [salesData],
    xAxis: { label: "Quarter", categories: quarters },
    yAxis: { label: "Revenue ($K)" },
    orientation: "horizontal",
    title: "Horizontal Bar Chart",
  },
};

export const HorizontalGrouped: Story = {
  name: "2.2 — Horizontal Grouped",
  args: {
    series: [salesData, expensesData],
    xAxis: { label: "Quarter", categories: quarters },
    yAxis: { label: "Amount ($K)" },
    orientation: "horizontal",
    title: "Horizontal Grouped",
  },
};

// ─── 3. Group Modes ─────────────────────────────────────────────────────────

export const Stacked: Story = {
  name: "3.1 — Stacked",
  args: {
    series: [salesData, expensesData, profitData],
    xAxis: { label: "Quarter", categories: quarters },
    yAxis: { label: "Total ($K)" },
    groupMode: "stacked",
    title: "Stacked Bar Chart",
  },
};

export const Stacked100: Story = {
  name: "3.2 — Stacked 100%",
  args: {
    series: [salesData, expensesData, profitData],
    xAxis: { label: "Quarter", categories: quarters },
    yAxis: { label: "Percentage (%)" },
    groupMode: "stacked-100",
    title: "Stacked 100% Bar Chart",
  },
};

export const StackedHorizontal: Story = {
  name: "3.3 — Stacked Horizontal",
  args: {
    series: [salesData, expensesData],
    xAxis: { label: "Quarter", categories: quarters },
    yAxis: { label: "Amount ($K)" },
    groupMode: "stacked",
    orientation: "horizontal",
    title: "Stacked Horizontal",
  },
};

// ─── 4. Styling ─────────────────────────────────────────────────────────────

export const RoundedBars: Story = {
  name: "4.1 — Rounded Bars",
  args: {
    series: [salesData],
    xAxis: { label: "Quarter", categories: quarters },
    yAxis: { label: "Revenue ($K)" },
    barRadius: 6,
    title: "Rounded Bars",
  },
};

export const SeverityColors: Story = {
  name: "4.2 — Severity Colors",
  args: {
    series: [
      { ...salesData, severity: "success" },
      { ...expensesData, severity: "danger" },
      { ...profitData, severity: "info" },
    ],
    xAxis: { label: "Quarter", categories: quarters },
    yAxis: { label: "Amount ($K)" },
    title: "Severity Colors",
  },
};

export const PatternFills: Story = {
  name: "4.3 — Pattern Fills",
  args: {
    series: [
      { ...salesData, fill: { pattern: "stripes" } },
      { ...expensesData, fill: { pattern: "dots" } },
      { ...profitData, fill: { pattern: "crosshatch" } },
    ],
    xAxis: { label: "Quarter", categories: quarters },
    yAxis: { label: "Amount ($K)" },
    title: "Pattern Fills (Accessibility)",
  },
};

export const CustomBarWidth: Story = {
  name: "4.4 — Custom Bar Width",
  args: {
    series: [salesData],
    xAxis: { label: "Quarter", categories: quarters },
    yAxis: { label: "Revenue ($K)" },
    barWidth: 30,
    title: "Custom Bar Width (30px)",
  },
};

const styledBarsData: ChartSeries = {
  id: "styled",
  name: "Revenue",
  data: [
    {
      x: 0,
      y: 120,
      color: "var(--kreati-severity-primary)",
      style: { filter: "drop-shadow(2px 2px 3px rgba(0,0,0,0.3))" },
    },
    {
      x: 1,
      y: 200,
      color: "var(--kreati-severity-success)",
      style: { opacity: 0.8 },
    },
    {
      x: 2,
      y: 150,
      color: "var(--kreati-severity-warning)",
      style: { stroke: "var(--kreati-severity-danger)", strokeWidth: 2 },
    },
    {
      x: 3,
      y: 280,
      color: "var(--kreati-severity-accent)",
      style: { filter: "brightness(1.2) drop-shadow(3px 3px 4px rgba(0,0,0,0.4))" },
    },
  ],
};

const widths = [20, 40, 15, 50];

export const PerBarStyles: Story = {
  name: "4.4b — Per-bar Width & Styles",
  args: {
    series: [styledBarsData],
    xAxis: {
      label: "Quarter",
      categories: quarters,
    },
    yAxis: { label: "Revenue ($K)" },
    barWidth: (_point: ChartDataPoint, _series: ChartSeries, index: number) =>
      widths[index] ?? 30,
    barRadius: 6,
    showDataLabels: true,
    showLegend: false,
    title: "Per-bar Width (20, 40, 15, 50) & Styles",
  },
};

export const CategoryDividers: Story = {
  name: "4.5 — Category Dividers",
  args: {
    series: [salesData, expensesData],
    xAxis: { label: "Quarter", categories: quarters },
    yAxis: { label: "Amount ($K)" },
    showCategoryDividers: true,
    title: "With Category Dividers",
  },
};

export const GridBothAxes: Story = {
  name: "4.6 — Grid on Both Axes",
  args: {
    series: [salesData, expensesData],
    xAxis: { label: "Quarter", categories: quarters, showGrid: true },
    yAxis: { label: "Amount ($K)" },
    showCategoryDividers: true,
    title: "Grid on Both Axes + Dividers",
  },
};

// ─── 5. Data Labels ─────────────────────────────────────────────────────────

export const WithDataLabels: Story = {
  name: "5.1 — Data Labels",
  args: {
    series: [salesData],
    xAxis: { label: "Quarter", categories: quarters },
    yAxis: { label: "Revenue ($K)" },
    showDataLabels: true,
    title: "With Data Labels",
  },
};

export const DataLabelsStacked: Story = {
  name: "5.2 — Data Labels (Stacked)",
  args: {
    series: [salesData, expensesData],
    xAxis: { label: "Quarter", categories: quarters },
    yAxis: { label: "Total ($K)" },
    groupMode: "stacked",
    showDataLabels: true,
    title: "Stacked with Data Labels",
  },
};

// ─── 6. Tooltip ─────────────────────────────────────────────────────────────

export const TooltipShared: Story = {
  name: "6.1 — Shared Tooltip",
  args: {
    series: [salesData, expensesData, profitData],
    xAxis: { label: "Quarter", categories: quarters },
    yAxis: { label: "Amount ($K)" },
    tooltipMode: "shared",
    title: "Shared Tooltip",
  },
};

export const TooltipCustom: Story = {
  name: "6.2 — Custom Tooltip",
  args: {
    series: [salesData],
    xAxis: { label: "Quarter", categories: quarters },
    yAxis: { label: "Revenue ($K)" },
    tooltipMode: "custom",
    tooltipRender: entries =>
      entries.map(e => (
        <div key={e.series.id} style={{ padding: 8 }}>
          <strong>{e.series.name}</strong>: ${e.point.y}K
        </div>
      )),
    title: "Custom Tooltip Render",
  },
};

// ─── 7. Negative Values ─────────────────────────────────────────────────────

const mixedData: ChartSeries = {
  id: "pnl",
  name: "P&L",
  data: [
    { x: 0, y: 50 },
    { x: 1, y: -30 },
    { x: 2, y: 80 },
    { x: 3, y: -10 },
    { x: 4, y: 60 },
  ],
};

export const NegativeValues: Story = {
  name: "7.1 — Negative Values",
  args: {
    series: [mixedData],
    xAxis: { label: "Month", categories: ["Jan", "Feb", "Mar", "Apr", "May"] },
    yAxis: { label: "P&L ($K)" },
    barRadius: 4,
    title: "Positive & Negative Bars",
  },
};

// ─── 8. Interaction ─────────────────────────────────────────────────────────

export const ClickHandler: Story = {
  name: "8.1 — Click on Bar",
  args: {
    series: [salesData],
    xAxis: { label: "Quarter", categories: quarters },
    yAxis: { label: "Revenue ($K)" },
    title: "Click a bar (see alert)",
    onPointClick: (point, series) =>
      alert(`${series.name} — ${quarters[point.x]}: $${point.y}K`),
  },
};

export const NegativeHorizontal: Story = {
  name: "7.2 — Negative Horizontal (Diverging)",
  args: {
    series: [mixedData],
    xAxis: { label: "Month", categories: ["Jan", "Feb", "Mar", "Apr", "May"] },
    yAxis: { label: "P&L ($K)" },
    orientation: "horizontal",
    barRadius: 4,
    showDataLabels: true,
    title: "Horizontal Positive & Negative",
  },
};

// ─── 9. Legend ───────────────────────────────────────────────────────────────

export const LegendTop: Story = {
  name: "9.1 — Legend Top",
  args: {
    series: [salesData, expensesData, profitData],
    xAxis: { label: "Quarter", categories: quarters },
    yAxis: { label: "Amount ($K)" },
    legendPosition: "top",
    title: "Legend Top",
  },
};

export const LegendRight: Story = {
  name: "9.2 — Legend Right",
  args: {
    series: [salesData, expensesData, profitData],
    xAxis: { label: "Quarter", categories: quarters },
    yAxis: { label: "Amount ($K)" },
    legendPosition: "right",
    title: "Legend Right",
  },
};

// ─── 10. Overlays ───────────────────────────────────────────────────────────

export const WithConstants: Story = {
  name: "10.1 — With Constant Lines",
  args: {
    series: [salesData],
    xAxis: { label: "Quarter", categories: quarters },
    yAxis: { label: "Revenue ($K)" },
    constants: [
      {
        id: "target",
        label: "Target",
        value: 180,
        color: "var(--kreati-severity-danger)",
        dashStyle: "dash",
      },
      {
        id: "avg",
        label: "Average",
        value: 187.5,
        color: "var(--kreati-severity-info)",
        dashStyle: "dot",
      },
    ],
    title: "With Constant Lines",
  },
};

// ─── 11. Sizing ─────────────────────────────────────────────────────────────

export const FixedWidth: Story = {
  name: "11.1 — Fixed Width",
  args: {
    series: [salesData, expensesData],
    xAxis: { label: "Quarter", categories: quarters },
    yAxis: { label: "Amount ($K)" },
    width: 500,
    height: 250,
    title: "Fixed 500x250",
  },
};

// ─── 12. Many Categories ────────────────────────────────────────────────────

const manyCategories = Array.from({ length: 12 }, (_, i) => ({
  x: i,
  y: Math.round(50 + Math.random() * 200),
}));

export const ManyCategories: Story = {
  name: "12.1 — Many Categories (12 months)",
  args: {
    series: [{ id: "monthly", name: "Monthly Sales", data: manyCategories }],
    xAxis: {
      label: "Month",
      categories: [
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
      ],
    },
    yAxis: { label: "Sales ($K)" },
    barRadius: 3,
    title: "12 Month Sales",
  },
};

// ─── 13. Per-bar Customization ──────────────────────────────────────────────

const customBarsData: ChartSeries = {
  id: "custom",
  name: "Performance",
  data: [
    { x: 0, y: 85, color: "var(--kreati-severity-success)" },
    { x: 1, y: 45, color: "var(--kreati-severity-warning)" },
    { x: 2, y: 92, color: "var(--kreati-severity-success)" },
    { x: 3, y: 28, color: "var(--kreati-severity-danger)" },
  ],
};

export const PerBarColor: Story = {
  name: "13.1 — Per-bar Color",
  args: {
    series: [customBarsData],
    xAxis: {
      label: "Department",
      categories: ["Engineering", "Marketing", "Sales", "Support"],
    },
    yAxis: { label: "Score" },
    barRadius: 4,
    showDataLabels: true,
    showLegend: false,
    title: "Per-bar Color Customization",
  },
};

// ─── 14. Zoom & Export ──────────────────────────────────────────────────────

export const WithZoom: Story = {
  name: "14.1 — Zoom & Pan (Value Axis)",
  args: {
    series: [
      { id: "monthly", name: "Monthly Sales", data: manyCategories },
    ],
    xAxis: {
      label: "Month",
      categories: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ],
    },
    yAxis: { label: "Sales ($K)" },
    zoomMode: "both",
    title: "Zoom & Pan (value axis only — default)",
  },
};

export const WithZoomBothAxes: Story = {
  name: "14.1b — Zoom Both Axes",
  args: {
    series: [
      { id: "monthly", name: "Monthly Sales", data: manyCategories },
    ],
    xAxis: {
      label: "Month",
      categories: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ],
    },
    yAxis: { label: "Sales ($K)" },
    zoomMode: "both",
    zoomAxis: "both",
    title: "Zoom Both Axes (Ctrl+drag or scroll)",
  },
};

export const WithExport: Story = {
  name: "14.2 — Export",
  args: {
    series: [salesData, expensesData],
    xAxis: { label: "Quarter", categories: quarters },
    yAxis: { label: "Amount ($K)" },
    exportFormats: ["png", "svg", "csv"],
    title: "Right-click to export",
  },
};

// ─── 15. Multi-chart layouts ────────────────────────────────────────────────

const BarAboveLine = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
    <BarChart
      series={[salesData, expensesData]}
      xAxis={{ categories: quarters }}
      yAxis={{ label: "Amount ($K)" }}
      height={200}
      title="Revenue vs Expenses (Bars)"
      margins={{ bottom: 10 }}
    />
    <LineChart
      series={[
        {
          id: "profit-line",
          name: "Profit",
          data: profitData.data,
          color: "var(--kreati-severity-success)",
        },
      ]}
      xAxis={{ label: "Quarter", categories: quarters }}
      yAxis={{ label: "Profit ($K)" }}
      height={180}
      showArea
      areaOpacity={0.1}
      title="Profit Trend (Line)"
    />
  </div>
);

export const BarAndLinePanels: Story = {
  name: "15.1 — Bar + Line (Independent Panels)",
  args: { series: [] },
  render: () => <BarAboveLine />,
};

// ─── 16. Side by Side Comparison ────────────────────────────────────────────

const SideBySide = () => {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <BarChart
        series={[salesData, expensesData]}
        xAxis={{ label: "Quarter", categories: quarters }}
        yAxis={{ label: "Amount ($K)" }}
        height={250}
        title="Grouped"
      />
      <BarChart
        series={[salesData, expensesData]}
        xAxis={{ label: "Quarter", categories: quarters }}
        yAxis={{ label: "Amount ($K)" }}
        groupMode="stacked"
        height={250}
        title="Stacked"
      />
    </div>
  );
};

export const GroupedVsStacked: Story = {
  name: "16.1 — Grouped vs Stacked (Side by Side)",
  args: { series: [] },
  render: () => <SideBySide />,
};

// ─── 17. Mixed: Bars + Line in same SVG ─────────────────────────────────────

const barSeries: ChartSeries[] = [
  {
    id: "revenue",
    name: "Revenue",
    data: [
      { x: 0, y: 120 },
      { x: 1, y: 200 },
      { x: 2, y: 150 },
      { x: 3, y: 280 },
    ],
  },
  {
    id: "costs",
    name: "Costs",
    data: [
      { x: 0, y: 90 },
      { x: 1, y: 130 },
      { x: 2, y: 110 },
      { x: 3, y: 170 },
    ],
  },
];

const lineSeries: ChartSeries = {
  id: "profit-trend",
  name: "Profit",
  data: [
    { x: 0, y: 30 },
    { x: 1, y: 70 },
    { x: 2, y: 40 },
    { x: 3, y: 110 },
  ],
  color: "var(--kreati-severity-success)",
};

const allMixedSeries = [...barSeries, lineSeries];

const MixedBarLine = () => {
  const [tooltip, setTooltip] = React.useState<{
    entries: TooltipEntry[];
    x: number;
    y: number;
    visible: boolean;
    xLabel?: string;
  }>({ entries: [], x: 0, y: 0, visible: false });

  return (
    <>
      <CartesianChart
        series={allMixedSeries}
        xAxis={{ label: "Quarter", categories: quarters, type: "category" }}
        yAxis={{ label: "Amount ($K)", min: 0 }}
        title="Revenue & Costs (Bars) + Profit (Line)"
        height={350}
        zoomMode="both"
        exportFormats={["png", "svg", "csv"]}
        clipMargin={0}
      >
        {({ xScale, yScale, plotWidth, plotHeight, visibleSeries, getColor, focusedSeriesIndex, focusedPointIndex }) => {
          // Split series by type
          const bars = visibleSeries.filter(s => s.id !== "profit-trend");
          const lines = visibleSeries.filter(s => s.id === "profit-trend");

          // Bar geometry
          const catCount = 4;
          const catSize = plotWidth / catCount;
          const usable = catSize * 0.8;
          const barCount = bars.length;
          const gap = usable * 0.1;
          const bw = barCount > 0 ? (usable - gap * (barCount - 1)) / barCount : usable;

          // Spline path builder
          const buildPath = (data: ChartDataPoint[]) => {
            const pts = data.map(p => ({ x: xScale(p.x), y: yScale(p.y) }));
            if (pts.length < 3) return pts.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ");
            let d = `M${pts[0].x},${pts[0].y}`;
            for (let i = 0; i < pts.length - 1; i++) {
              const p0 = pts[Math.max(i - 1, 0)];
              const p1 = pts[i];
              const p2 = pts[i + 1];
              const p3 = pts[Math.min(i + 2, pts.length - 1)];
              const t = 1 / 6;
              d += ` C${p1.x + (p2.x - p0.x) * t},${p1.y + (p2.y - p0.y) * t} ${p2.x - (p3.x - p1.x) * t},${p2.y - (p3.y - p1.y) * t} ${p2.x},${p2.y}`;
            }
            return d;
          };

          return (
            <g
              onMouseMove={e => {
                const svg = (e.currentTarget as SVGGElement).ownerSVGElement;
                if (!svg) return;
                const rect = svg.getBoundingClientRect();
                const ml = 50;
                const mt = 20;
                const plotX = e.clientX - rect.left - ml;
                if (plotX < 0 || plotX > plotWidth) {
                  setTooltip(prev => ({ ...prev, visible: false }));
                  return;
                }
                // Find nearest category
                const catIdx = Math.round((plotX / plotWidth) * (catCount - 1));
                const entries: TooltipEntry[] = allMixedSeries
                  .filter(s => visibleSeries.some(vs => vs.id === s.id))
                  .map((s, i) => {
                    const p = s.data.find(d => d.x === catIdx);
                    return p ? { series: s, point: p, color: getColor(s, i) } : null;
                  })
                  .filter((e): e is TooltipEntry => e != null);
                setTooltip({
                  entries,
                  x: e.clientX,
                  y: e.clientY,
                  visible: entries.length > 0,
                  xLabel: quarters[catIdx],
                });
              }}
              onMouseLeave={() => setTooltip(prev => ({ ...prev, visible: false }))}
            >
              {/* Invisible hit area */}
              <rect x={0} y={0} width={plotWidth} height={plotHeight} fill="transparent" />

              {/* Bars */}
              {/* Bars */}
              {bars.map((series, si) => {
                const color = getColor(series, si);
                return (
                  <g key={series.id}>
                    {series.data.map((p, pi) => {
                      const cx = xScale(p.x);
                      const groupW = bw * barCount + gap * (barCount - 1);
                      const offset = -groupW / 2 + si * (bw + gap);
                      const barY = yScale(p.y);
                      const baseY = yScale(0);
                      const globalIdx = visibleSeries.indexOf(series);
                      const isFocused = focusedSeriesIndex === globalIdx && focusedPointIndex === pi;
                      return (
                        <rect
                          key={pi}
                          x={cx + offset}
                          y={Math.min(barY, baseY)}
                          width={bw}
                          height={Math.abs(baseY - barY)}
                          fill={color}
                          rx={3}
                          ry={3}
                          stroke={isFocused ? "var(--kreati-chart-text)" : undefined}
                          strokeWidth={isFocused ? 3 : undefined}
                        />
                      );
                    })}
                  </g>
                );
              })}

              {/* Line */}
              {lines.map((series, si) => {
                const color = getColor(series, barSeries.length + si);
                return (
                  <g key={series.id}>
                    <path
                      d={buildPath(series.data)}
                      fill="none"
                      stroke={color}
                      strokeWidth={3}
                      strokeLinecap="round"
                    />
                    {series.data.map((p, pi) => {
                      const globalIdx = visibleSeries.indexOf(series);
                      const isFocused = focusedSeriesIndex === globalIdx && focusedPointIndex === pi;
                      return (
                        <circle
                          key={pi}
                          cx={xScale(p.x)}
                          cy={yScale(p.y)}
                          r={isFocused ? 8 : 5}
                          fill={color}
                          stroke={isFocused ? "var(--kreati-chart-text)" : "var(--kreati-chart-bg)"}
                          strokeWidth={isFocused ? 3 : 2.5}
                        />
                      );
                    })}
                  </g>
                );
              })}
            </g>
          );
        }}
      </CartesianChart>
      <ChartTooltip
        entries={tooltip.entries}
        x={tooltip.x}
        y={tooltip.y}
        visible={tooltip.visible}
        xLabel={tooltip.xLabel}
      />
    </>
  );
};

export const MixedBarAndLine: Story = {
  name: "17.1 — Mixed: Bars + Line (Same Axes, Zoom, Export)",
  args: { series: [] },
  render: () => <MixedBarLine />,
};

// ─── 18. Keyboard Navigation ────────────────────────────────────────────────

export const KeyboardNavigation: Story = {
  name: "18.1 — Keyboard Navigation",
  args: {
    series: [salesData, expensesData],
    xAxis: { label: "Quarter", categories: quarters },
    yAxis: { label: "Amount ($K)" },
    title: "Click chart, then use Arrow keys. Enter to select.",
    onPointClick: (point, series) =>
      alert(`${series.name} — ${quarters[point.x]}: $${point.y}K`),
  },
};

// ─── 19. Navigator ──────────────────────────────────────────────────────────

export const WithNavigator: Story = {
  name: "19.1 — Navigator (Bottom)",
  args: {
    series: [
      { id: "monthly", name: "Monthly Sales", data: manyCategories },
    ],
    xAxis: {
      label: "Month",
      categories: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ],
    },
    yAxis: { label: "Sales ($K)" },
    zoomMode: "both",
    showNavigator: true,
    navigatorPosition: "bottom",
    navigatorVisibility: "fixed",
    title: "With Range Navigator",
  },
};

// ─── 20. Alternating Bands ──────────────────────────────────────────────────

export const AlternatingBands: Story = {
  name: "20.1 — Alternating Bands (Striped Ticks)",
  args: {
    series: [salesData, expensesData],
    xAxis: {
      label: "Quarter",
      categories: quarters,
      alternatingBands: true,
      alternatingBandOpacity: 0.1,
    },
    yAxis: { label: "Amount ($K)" },
    showCategoryDividers: true,
    title: "Alternating Bands + Category Dividers",
  },
};

export const AlternatingBandsHorizontal: Story = {
  name: "20.2 — Alternating Bands (Horizontal)",
  args: {
    series: [salesData],
    xAxis: { label: "Quarter", categories: quarters },
    yAxis: {
      label: "Revenue ($K)",
      alternatingBands: true,
      alternatingBandOpacity: 0.06,
    },
    orientation: "horizontal",
    barRadius: 4,
    title: "Horizontal with Alternating Bands",
  },
};

// ─── 21. Entry Animation ────────────────────────────────────────────────────

const AnimationDemo = () => {
  const [key, setKey] = React.useState(0);
  return (
    <div>
      <button
        onClick={() => setKey(k => k + 1)}
        style={{
          marginBottom: 12,
          padding: "6px 16px",
          cursor: "pointer",
          fontFamily: "var(--kreati-font-family-body)",
        }}
      >
        Replay animation
      </button>
      <BarChart
        key={key}
        series={[salesData, expensesData, profitData]}
        xAxis={{ label: "Quarter", categories: quarters }}
        yAxis={{ label: "Amount ($K)" }}
        barRadius={4}
        title="Staggered Entry Animation"
      />
    </div>
  );
};

export const EntryAnimation: Story = {
  name: "21.1 — Entry Animation",
  args: { series: [] },
  render: () => <AnimationDemo />,
};

// ─── 22. ChartGroup with BarChart + LineChart ───────────────────────────────

import { ChartGroup } from "../../../../../packages/react/src/components/Chart/composition/ChartGroup";

const GroupedPanels = () => (
  <ChartGroup
    panels={[
      {
        type: "bar",
        series: [salesData, expensesData],
        yAxis: { label: "Amount ($K)" },
        title: "Revenue vs Expenses",
        height: 220,
      },
      {
        type: "bar",
        series: [profitData],
        yAxis: { label: "Profit ($K)" },
        title: "Profit",
        barRadius: 4,
        height: 180,
      },
      {
        series: [
          {
            id: "margin",
            name: "Margin %",
            data: [
              { x: 0, y: 25 },
              { x: 1, y: 35 },
              { x: 2, y: 27 },
              { x: 3, y: 39 },
            ],
            color: "var(--kreati-severity-success)",
          },
        ],
        yAxis: { label: "Margin (%)" },
        title: "Profit Margin",
        showArea: true,
        areaOpacity: 0.1,
        height: 160,
      },
    ]}
    xAxis={{ label: "Quarter", categories: quarters, type: "category" }}
    zoomMode="both"
    zoomAxis="x"
    exportFormats={["png", "svg", "csv"]}
    tooltipMode="group"
  />
);

export const SynchronizedZoom: Story = {
  name: "22.1 — ChartGroup: 2 BarCharts + LineChart",
  args: { series: [] },
  render: () => <GroupedPanels />,
};
