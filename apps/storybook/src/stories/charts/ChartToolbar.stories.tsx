import React, { useState, useRef, useCallback } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChartToolbar } from "../../../../../packages/react/src/components/Chart/core/ChartToolbar";
import { LineChart } from "../../../../../packages/react/src/components/Chart/cartesian/LineChart";
import { ChartGroup } from "../../../../../packages/react/src/components/Chart/composition/ChartGroup";
import type { ChartGroupRef } from "../../../../../packages/react/src/components/Chart/composition/ChartGroup";
import { Button } from "../../../../../packages/react/src/components/Button";
import { exportPng, exportSvg, exportCsv, exportJsonSeries } from "../../../../../packages/react/src/components/Chart/core/export";
import type { ZoomState } from "../../../../../packages/react/src/components/Chart/core/zoom";

const meta = {
  title: "Charts/ChartToolbar",
  component: ChartToolbar,
  parameters: { layout: "centered" },
  decorators: [
    (Story: React.FC) => (
      <div style={{ background: "#fff", padding: 24, borderRadius: 8, width: 900, maxWidth: "100%" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChartToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const allSeries = [
  { id: "temp", name: "Temperature", data: months.map((_, i) => ({ x: i, y: 15 + Math.sin(i / 2) * 10 })) },
  { id: "hum", name: "Humidity", data: months.map((_, i) => ({ x: i, y: 40 + Math.cos(i / 3) * 20 })) },
  { id: "press", name: "Pressure", data: months.map((_, i) => ({ x: i, y: 1010 + Math.sin(i) * 15 })) },
  { id: "flow", name: "Flow Rate", data: months.map((_, i) => ({ x: i, y: 100 + i * 8 })) },
  { id: "ph", name: "pH", data: months.map((_, i) => ({ x: i, y: 6.5 + Math.cos(i) * 0.8 })) },
];

// ═══════════════════════════════════════════════════════════════════════════

export const FullIntegration: Story = {
  name: "1 — Full Integration (zoom both axes)",
  render: () => {
    const [visibleIds, setVisibleIds] = useState(allSeries.map((s) => s.id));
    const [zoom, setZoom] = useState<ZoomState | null>(null);
    const chartRef = useRef<HTMLDivElement>(null);

    const handleExport = useCallback((fmt: string) => {
      const svg = chartRef.current?.querySelector("svg.k-chart") as SVGSVGElement | null;
      if (!svg) return;
      if (fmt === "png") exportPng(svg);
      if (fmt === "svg") exportSvg(svg);
      if (fmt === "csv") exportCsv(allSeries.filter((s) => visibleIds.includes(s.id)), months);
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
          series={allSeries.map((s) => ({ ...s, hidden: !visibleIds.includes(s.id) }))}
          xAxis={{ categories: months }}
          yAxis={{ label: "Value" }}
          height={350}
          zoomMode="both"
          zoomAxis="both"
          showLegend={false}
          controlledZoom={zoom}
          onZoomChange={setZoom}
        />
      </div>
    );
  },
};

export const MultiAxis: Story = {
  name: "2 — Multi Axis Chart",
  render: () => {
    const [visibleIds, setVisibleIds] = useState(["temp", "hum", "press"]);
    const [zoom, setZoom] = useState<ZoomState | null>(null);
    const chartRef = useRef<HTMLDivElement>(null);

    const handleExport = useCallback((fmt: string) => {
      const svg = chartRef.current?.querySelector("svg.k-chart") as SVGSVGElement | null;
      if (!svg) return;
      if (fmt === "png") exportPng(svg);
      if (fmt === "svg") exportSvg(svg);
    }, []);

    return (
      <div ref={chartRef}>
        <ChartToolbar
          series={[
            { id: "temp", name: "Temperature" },
            { id: "hum", name: "Humidity" },
            { id: "press", name: "Pressure" },
          ]}
          visibleIds={visibleIds}
          onVisibilityChange={setVisibleIds}
          hasZoom={zoom != null}
          onResetZoom={() => setZoom(null)}
          exportFormats={["png", "svg"]}
          onExport={handleExport}
        />
        <LineChart
          series={[
            { ...allSeries[0], yAxisId: "temp", hidden: !visibleIds.includes("temp") },
            { ...allSeries[1], yAxisId: "hum", hidden: !visibleIds.includes("hum") },
            { ...allSeries[2], yAxisId: "press", hidden: !visibleIds.includes("press") },
          ]}
          xAxis={{ categories: months }}
          yAxis={[
            { id: "temp", label: "°C", side: "left" as const },
            { id: "hum", label: "%", side: "right" as const },
            { id: "press", label: "hPa", side: "right" as const },
          ]}
          height={350}
          zoomMode="both"
          zoomAxis="both"
          showLegend={false}
          controlledZoom={zoom}
          onZoomChange={setZoom}
        />
      </div>
    );
  },
};

export const ZoomStates: Story = {
  name: "3 — Zoom States (disabled until zoomed)",
  render: () => {
    const [zoom, setZoom] = useState<ZoomState | null>(null);
    const chartRef = useRef<HTMLDivElement>(null);
    return (
      <div ref={chartRef}>
        <ChartToolbar
          hasZoom={zoom != null}
          onResetZoom={() => setZoom(null)}
          exportFormats={["png"]}
          onExport={() => {
            const svg = chartRef.current?.querySelector("svg.k-chart") as SVGSVGElement | null;
            if (svg) exportPng(svg);
          }}
        />
        <LineChart
          series={[allSeries[0], allSeries[1]]}
          xAxis={{ categories: months }}
          height={300}
          zoomMode="both"
          zoomAxis="both"
          controlledZoom={zoom}
          onZoomChange={setZoom}
        />
      </div>
    );
  },
};

export const AllPresets: Story = {
  name: "4 — All Presets (filter + zoom + export + actions)",
  render: () => {
    const [visibleIds, setVisibleIds] = useState(allSeries.map((s) => s.id));
    const [zoom, setZoom] = useState<ZoomState | null>(null);
    const chartRef = useRef<HTMLDivElement>(null);

    const handleExport = useCallback((fmt: string) => {
      const svg = chartRef.current?.querySelector("svg.k-chart") as SVGSVGElement | null;
      if (!svg) return;
      if (fmt === "png") exportPng(svg);
      if (fmt === "svg") exportSvg(svg);
      if (fmt === "csv") exportCsv(allSeries.filter((s) => visibleIds.includes(s.id)), months);
    }, [visibleIds]);

    return (
      <div ref={chartRef}>
        <ChartToolbar
          series={allSeries.map((s) => ({ id: s.id, name: s.name }))}
          visibleIds={visibleIds}
          onVisibilityChange={setVisibleIds}
          hasZoom={zoom != null}
          onResetZoom={() => setZoom(null)}
          exportFormats={["png", "svg", "csv"]}
          onExport={handleExport}
          actions={<Button label="Print" size="sm" severity="secondary" onClick={() => window.print()} />}
        />
        <LineChart
          series={allSeries.map((s) => ({ ...s, hidden: !visibleIds.includes(s.id) }))}
          xAxis={{ categories: months }}
          yAxis={{ label: "Value" }}
          height={350}
          zoomMode="both"
          zoomAxis="both"
          showLegend={false}
          controlledZoom={zoom}
          onZoomChange={setZoom}
        />
      </div>
    );
  },
};

export const CustomRender: Story = {
  name: "5 — Custom Toolbar Render",
  render: () => {
    const [visibleIds, setVisibleIds] = useState(allSeries.slice(0, 3).map((s) => s.id));
    const [zoom, setZoom] = useState<ZoomState | null>(null);

    return (
      <>
        <ChartToolbar
          series={allSeries.slice(0, 3).map((s) => ({ id: s.id, name: s.name }))}
          visibleIds={visibleIds}
          onVisibilityChange={setVisibleIds}
          hasZoom={zoom != null}
          onResetZoom={() => setZoom(null)}
          exportFormats={["png", "csv"]}
          onExport={(fmt) => alert(fmt)}
          toolbarRender={({ filter, actionButton, actions }) => (
            <div style={{ display: "flex", gap: 8, alignItems: "center", width: "100%" }}>
              <div style={{ flex: 1 }}>{filter}</div>
              <div style={{ display: "flex", gap: 8 }}>
                {actionButton}
                {actions}
              </div>
            </div>
          )}
        />
        <LineChart
          series={allSeries.slice(0, 3).map((s) => ({ ...s, hidden: !visibleIds.includes(s.id) }))}
          xAxis={{ categories: months }}
          height={300}
          zoomMode="both"
          showLegend={false}
          controlledZoom={zoom}
          onZoomChange={setZoom}
        />
      </>
    );
  },
};

export const WithChartGroup: Story = {
  name: "6 — Toolbar + ChartGroup (3 panels, last 100px)",
  render: () => {
    const seriesList = [
      { id: "temp", name: "Temperature" },
      { id: "hum", name: "Humidity" },
      { id: "press", name: "Pressure" },
    ];
    const [visibleIds, setVisibleIds] = useState(seriesList.map((s) => s.id));
    const [zoom, setZoom] = useState<ZoomState | null>(null);

    const groupRef = useRef<ChartGroupRef>(null);

    return (
      <>
        <ChartToolbar
          series={seriesList}
          visibleIds={visibleIds}
          onVisibilityChange={setVisibleIds}
          onResetZoom={() => setZoom(null)}
          hasZoom={zoom != null}
          exportFormats={["png", "svg", "csv"]}
          onExport={(fmt) => groupRef.current?.export(fmt)}
        />
        <ChartGroup
          ref={groupRef}
          panels={[
            {
              series: [{ ...allSeries[0], hidden: !visibleIds.includes("temp") }],
              title: "Temperature",
              height: 200,
              yAxis: { label: "°C" },
            },
            {
              series: [{ ...allSeries[1], hidden: !visibleIds.includes("hum") }],
              title: "Humidity",
              height: 200,
              yAxis: { label: "%" },
            },
            {
              series: [{ ...allSeries[2], hidden: !visibleIds.includes("press") }],
              title: "Pressure",
              height: 100,
              yAxis: { label: "hPa" },
            },
          ]}
          xAxis={{ categories: months }}
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

export const SplitLayout: Story = {
  name: "7 — Split Layout (separate reset + export)",
  render: () => {
    const [visibleIds, setVisibleIds] = useState(allSeries.slice(0, 3).map((s) => s.id));
    const [zoom, setZoom] = useState<ZoomState | null>(null);
    const chartRef = useRef<HTMLDivElement>(null);

    const handleExport = useCallback((fmt: string) => {
      const svg = chartRef.current?.querySelector("svg.k-chart") as SVGSVGElement | null;
      if (!svg) return;
      if (fmt === "png") exportPng(svg);
      if (fmt === "svg") exportSvg(svg);
      if (fmt === "csv") exportCsv(allSeries.filter((s) => visibleIds.includes(s.id)), months);
    }, [visibleIds]);

    return (
      <div ref={chartRef}>
        <ChartToolbar
          layout="split"
          series={allSeries.slice(0, 3).map((s) => ({ id: s.id, name: s.name }))}
          visibleIds={visibleIds}
          onVisibilityChange={setVisibleIds}
          hasZoom={zoom != null}
          onResetZoom={() => setZoom(null)}
          exportFormats={["png", "svg", "csv"]}
          onExport={handleExport}
        />
        <LineChart
          series={allSeries.slice(0, 3).map((s) => ({ ...s, hidden: !visibleIds.includes(s.id) }))}
          xAxis={{ categories: months }}
          height={300}
          zoomMode="both"
          zoomAxis="both"
          showLegend={false}
          controlledZoom={zoom}
          onZoomChange={setZoom}
        />
      </div>
    );
  },
};

export const CombinedLayout: Story = {
  name: "8 — Combined Layout (reset zoom + exports in one button)",
  render: () => {
    const [visibleIds, setVisibleIds] = useState(allSeries.slice(0, 3).map((s) => s.id));
    const [zoom, setZoom] = useState<ZoomState | null>(null);
    const chartRef = useRef<HTMLDivElement>(null);

    const handleExport = useCallback((fmt: string) => {
      const svg = chartRef.current?.querySelector("svg.k-chart") as SVGSVGElement | null;
      if (!svg) return;
      if (fmt === "png") exportPng(svg);
      if (fmt === "svg") exportSvg(svg);
      if (fmt === "csv") exportCsv(allSeries.filter((s) => visibleIds.includes(s.id)), months);
    }, [visibleIds]);

    return (
      <div ref={chartRef}>
        <ChartToolbar
          layout="combined"
          series={allSeries.slice(0, 3).map((s) => ({ id: s.id, name: s.name }))}
          visibleIds={visibleIds}
          onVisibilityChange={setVisibleIds}
          hasZoom={zoom != null}
          onResetZoom={() => setZoom(null)}
          exportFormats={["png", "svg", "csv"]}
          onExport={handleExport}
        />
        <LineChart
          series={allSeries.slice(0, 3).map((s) => ({ ...s, hidden: !visibleIds.includes(s.id) }))}
          xAxis={{ categories: months }}
          height={300}
          zoomMode="both"
          zoomAxis="both"
          showLegend={false}
          controlledZoom={zoom}
          onZoomChange={setZoom}
        />
      </div>
    );
  },
};
