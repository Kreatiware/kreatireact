import React, { useState, useRef, useCallback } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { LineChart } from "../../../../../packages/react/src/components/Chart/cartesian/LineChart";
import { ChartToolbar } from "../../../../../packages/react/src/components/Chart/core/ChartToolbar";
import { ChartGroup } from "../../../../../packages/react/src/components/Chart/composition/ChartGroup";
import type { ChartGroupRef } from "../../../../../packages/react/src/components/Chart/composition/ChartGroup";
import { exportPng, exportSvg, exportCsv, exportJsonSeries } from "../../../../../packages/react/src/components/Chart/core/export";
import type { ZoomState } from "../../../../../packages/react/src/components/Chart/core/zoom";
import type { ChartConstant, ChartShadedArea, ChartAnnotation } from "../../../../../packages/react/src/components/Chart/core/types";

const meta = {
  title: "Charts/Showcase",
  parameters: { layout: "centered" },
  decorators: [
    (Story: React.FC) => (
      <div style={{ background: "#fff", padding: 24, borderRadius: 8, width: 950, maxWidth: "100%" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const tempData = {
  id: "temp",
  name: "Temperature",
  yAxisId: "temp",
  data: months.map((_, i) => ({ x: i, y: 18 + Math.sin(i / 1.8) * 12 })),
  fill: { pattern: "stripes" as const },
  trendline: { type: "linear" as const, label: "Temp trend" },
};

const humData = {
  id: "hum",
  name: "Humidity",
  yAxisId: "hum",
  data: months.map((_, i) => ({ x: i, y: 45 + Math.cos(i / 2.5) * 25 })),
  fill: { pattern: "dots" as const },
  dashStyle: "dash" as const,
};

const pressData = {
  id: "press",
  name: "Pressure",
  yAxisId: "press",
  data: months.map((_, i) => ({ x: i, y: 1005 + Math.sin(i / 1.2) * 20 })),
};

const constants: ChartConstant[] = [
  { id: "max-temp", label: "Max Temp", value: 28, color: "var(--kreati-severity-danger)", dashStyle: "dash", labelAlign: "above" },
  { id: "min-temp", label: "Min Temp", value: 8, color: "var(--kreati-severity-info)", dashStyle: "dot", labelAlign: "below" },
];

const shadedAreas: ChartShadedArea[] = [
  { id: "optimal", label: "Optimal Range", xStart: 3, xEnd: 8, color: "var(--kreati-severity-success)", fill: { opacity: 0.08 } },
];

const annotations: ChartAnnotation[] = [
  { id: "peak", x: 3, y: 28, content: "Peak", showArrow: true, offsetY: -20 },
  { id: "low", x: 9, y: 8, content: "Low point", showArrow: true, offsetY: 20 },
];

export const FullShowcase: Story = {
  name: "Full Showcase — All Features",
  render: () => {
    const allSeries = [tempData, humData, pressData];
    const [visibleIds, setVisibleIds] = useState(allSeries.map((s) => s.id));
    const [zoom, setZoom] = useState<ZoomState | null>(null);
    const chartRef = useRef<HTMLDivElement>(null);

    const filteredSeries = allSeries.map((s) => ({
      ...s,
      hidden: !visibleIds.includes(s.id),
    }));

    const handleExport = useCallback((fmt: string) => {
      const svg = chartRef.current?.querySelector("svg.k-chart") as SVGSVGElement | null;
      if (!svg) return;
      if (fmt === "png") exportPng(svg, "Sensor Dashboard", "Full showcase with all features");
      if (fmt === "svg") exportSvg(svg, "Sensor Dashboard", "Full showcase with all features");
      if (fmt === "csv") exportCsv(allSeries.filter((s) => visibleIds.includes(s.id)), months, "Month");
      if (fmt === "json-series") exportJsonSeries(allSeries.filter((s) => visibleIds.includes(s.id)));
    }, [visibleIds]);

    return (
      <div ref={chartRef}>
        <ChartToolbar
          series={allSeries.map((s) => ({ id: s.id, name: s.name }))}
          visibleIds={visibleIds}
          onVisibilityChange={setVisibleIds}
          hasZoom={zoom != null}
          onResetZoom={() => setZoom(null)}
          exportFormats={["png", "svg", "csv", "json-series"]}
          onExport={handleExport}
        />
        <LineChart
          series={filteredSeries}
          title="Sensor Dashboard"
          subtitle="Temperature, humidity, and pressure readings — 2026"
          xAxis={{
            categories: months,
            label: "Month",
            showGrid: true,
            alternatingBands: true,
            alternatingBandColor: ["var(--kreati-primary-alpha-4)", "transparent"],
            alternatingBandOpacity: 1,
          }}
          yAxis={[
            { id: "temp", label: "Temperature (°C)", side: "left" as const, alternatingBands: true },
            { id: "hum", label: "Humidity (%)", side: "right" as const },
            { id: "press", label: "Pressure (hPa)", side: "right" as const },
          ]}
          constants={constants}
          shadedAreas={shadedAreas}
          annotations={annotations}
          height={450}
          showArea
          areaOpacity={0.12}
          showCrosshair
          showLegend={false}
          zoomMode="both"
          zoomAxis="both"
          controlledZoom={zoom}
          onZoomChange={setZoom}
          showNavigator
          navigatorPosition="bottom"
          navigatorVisibility="fixed"
          navigatorHeight={35}
          exportFormats={["png", "svg", "csv"]}
          exportTitle
          csvSeparator=";"
          resizable="both"
          minHeight={250}
          maxHeight={700}
          minWidth={400}
          onPointClick={(point, series) => alert(`${series.name}: ${months[point.x]} = ${point.y.toFixed(1)}`)}
        />
      </div>
    );
  },
};

export const GroupShowcase: Story = {
  name: "Full Showcase — ChartGroup with Toolbar",
  render: () => {
    const allSeries = [tempData, humData, pressData];
    const seriesList = allSeries.map((s) => ({ id: s.id, name: s.name }));
    const [visibleIds, setVisibleIds] = useState(allSeries.map((s) => s.id));
    const [zoom, setZoom] = useState<ZoomState | null>(null);
    const groupRef = useRef<ChartGroupRef>(null);

    return (
      <>
        <ChartToolbar
          series={seriesList}
          visibleIds={visibleIds}
          onVisibilityChange={setVisibleIds}
          hasZoom={zoom != null}
          onResetZoom={() => setZoom(null)}
          exportFormats={["png", "svg", "csv"]}
          onExport={(fmt) => groupRef.current?.export(fmt)}
        />
        <ChartGroup
          ref={groupRef}
          panels={[
            {
              series: [{
                ...tempData,
                yAxisId: undefined,
                hidden: !visibleIds.includes("temp"),
              }],
              title: "Temperature",
              height: 220,
              yAxis: { label: "°C" },
              constants: [constants[0]],
              shadedAreas,
              annotations: [annotations[0]],
              showArea: true,
              showCrosshair: true,
            },
            {
              series: [{
                ...humData,
                yAxisId: undefined,
                hidden: !visibleIds.includes("hum"),
              }],
              title: "Humidity",
              height: 180,
              yAxis: { label: "%" },
              showArea: true,
            },
            {
              series: [{
                ...pressData,
                yAxisId: undefined,
                hidden: !visibleIds.includes("press"),
              }],
              title: "Pressure",
              height: 120,
              yAxis: { label: "hPa" },
              constants: [{ id: "normal", label: "Normal", value: 1013, color: "var(--kreati-severity-help)", dashStyle: "dot" as const }],
            },
          ]}
          xAxis={{
            categories: months,
            label: "Month",
            alternatingBands: true,
            alternatingBandOpacity: 0.06,
          }}
          zoomMode="both"
          showCrosshair
          controlledZoom={zoom}
          onZoomChange={setZoom}
          exportFormats={["png", "svg", "csv"]}
        />
      </>
    );
  },
};
