import type { ChartSeries } from "./types";

/**
 * Chart export utilities.
 *
 * @description All export logic lives here — chart components never
 * handle file generation directly. Exports must not embed external
 * resources or execute scripts in generated files (security rule).
 */

/** Exports the chart SVG element as a PNG image. */
export const exportPng = (svgElement: SVGSVGElement, title?: string, subtitle?: string, filename = "chart.png"): void => {
  const svg = cloneForExport(svgElement, title, subtitle);
  const { width } = svgElement.getBoundingClientRect();
  const height = parseFloat(svg.getAttribute("height") || String(svgElement.getBoundingClientRect().height));

  const data = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const scale = 2;
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, width, height);
    URL.revokeObjectURL(url);
    canvas.toBlob((pngBlob) => {
      if (pngBlob) downloadBlob(pngBlob, filename);
    }, "image/png");
  };
  img.src = url;
};

/** Exports the chart SVG element as an SVG file. */
export const exportSvg = (svgElement: SVGSVGElement, title?: string, subtitle?: string, filename = "chart.svg"): void => {
  const svg = cloneForExport(svgElement, title, subtitle);
  const data = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
  downloadBlob(blob, filename);
};

/** Exports chart series data as CSV. */
export const exportCsv = (series: ChartSeries[], xCategories?: string[], xLabel?: string, separator = ";", filename = "chart.csv"): void => {
  const maxLen = Math.max(...series.map((s) => s.data.length), 0);
  const header = [xLabel || "X", ...series.map((s) => s.name)].join(separator);
  const rows: string[] = [header];

  for (let i = 0; i < maxLen; i++) {
    const xVal = series[0]?.data[i]?.x;
    const xLabel = xCategories?.[xVal ?? i] ?? String(xVal ?? i);
    const values = series.map((s) => s.data[i]?.y ?? "");
    rows.push([xLabel, ...values].join(separator));
  }

  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
  downloadBlob(blob, filename);
};

/** Exports chart data as flat JSON table (one object per data point). */
export const exportJsonTable = (series: ChartSeries[], xCategories?: string[], xLabel?: string, filename = "chart.json"): void => {
  const maxLen = Math.max(...series.map((s) => s.data.length), 0);
  const key = xLabel || "X";
  const rows: Record<string, string | number>[] = [];

  for (let i = 0; i < maxLen; i++) {
    const xVal = series[0]?.data[i]?.x;
    const row: Record<string, string | number> = {
      [key]: xCategories?.[xVal ?? i] ?? (xVal ?? i),
    };
    for (const s of series) {
      row[s.name] = s.data[i]?.y ?? "";
    }
    rows.push(row);
  }

  const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json;charset=utf-8" });
  downloadBlob(blob, filename);
};

/** Exports chart data as JSON grouped by series. */
export const exportJsonSeries = (series: ChartSeries[], filename = "chart.json"): void => {
  const data = series.map((s) => ({
    id: s.id,
    name: s.name,
    unit: s.unit,
    data: s.data.map((p) => ({ x: p.x, y: p.y, ...(p.label ? { label: p.label } : {}) })),
  }));
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  downloadBlob(blob, filename);
};

/** Clones SVG for export, removing interactive UI elements, optionally prepending title/subtitle. */
const cloneForExport = (svgElement: SVGSVGElement, title?: string, subtitle?: string): SVGSVGElement => {
  const svg = svgElement.cloneNode(true) as SVGSVGElement;
  svg.querySelectorAll(".k-chart-menu-btn, .k-chart-zoom-select, .k-chart-focus-ring").forEach((el) => el.remove());
  svg.querySelectorAll("[pointer-events]").forEach((el) => el.removeAttribute("pointer-events"));
  inlineStyles(svgElement, svg);

  const { width, height } = svgElement.getBoundingClientRect();
  const hasTitle = !!title;
  const hasSub = !!subtitle;

  if (hasTitle || hasSub) {
    const titleSize = 14;
    const subSize = 11;
    const lineGap = 4;
    const padBottom = 8;
    let headerH = 0;

    const container = svgElement.closest(".k-cartesian-chart");
    const computed = container ? window.getComputedStyle(container) : null;
    const textColor = computed?.getPropertyValue("color") || "#333";

    if (hasTitle) headerH += titleSize;
    if (hasSub) headerH += (hasTitle ? lineGap : 0) + subSize;
    headerH += padBottom;

    // Shift existing content down
    const wrapper = document.createElementNS("http://www.w3.org/2000/svg", "g");
    wrapper.setAttribute("transform", `translate(0,${headerH})`);
    while (svg.firstChild) wrapper.appendChild(svg.firstChild);
    svg.appendChild(wrapper);

    // Insert title text
    let yPos = 0;
    if (hasTitle) {
      yPos += titleSize;
      const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
      t.setAttribute("x", "8");
      t.setAttribute("y", String(yPos));
      t.setAttribute("fill", textColor);
      t.setAttribute("font-size", String(titleSize));
      t.setAttribute("font-weight", "600");
      t.setAttribute("font-family", "Inter, sans-serif");
      t.textContent = title;
      svg.insertBefore(t, wrapper);
    }
    if (hasSub) {
      yPos += (hasTitle ? lineGap : 0) + subSize;
      const s = document.createElementNS("http://www.w3.org/2000/svg", "text");
      s.setAttribute("x", "8");
      s.setAttribute("y", String(yPos));
      s.setAttribute("fill", textColor);
      s.setAttribute("font-size", String(subSize));
      s.setAttribute("font-family", "Inter, sans-serif");
      s.setAttribute("opacity", "0.65");
      s.textContent = subtitle!;
      svg.insertBefore(s, wrapper);
    }

    const totalH = height + headerH;
    svg.setAttribute("viewBox", `0 0 ${width} ${totalH}`);
    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(totalH));
  } else {
    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(height));
  }

  return svg;
};

/** Triggers a file download from a Blob. */
const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/** Copies computed styles from source to cloned SVG for accurate export. */
const inlineStyles = (source: Element, target: Element): void => {
  const computed = window.getComputedStyle(source);
  const targetEl = target as SVGElement | HTMLElement;
  const important = ["fill", "stroke", "stroke-width", "stroke-dasharray", "font-size", "font-family", "font-weight", "opacity", "color"];
  for (const prop of important) {
    const val = computed.getPropertyValue(prop);
    if (val) targetEl.style.setProperty(prop, val);
  }
  const sourceChildren = source.children;
  const targetChildren = target.children;
  for (let i = 0; i < sourceChildren.length && i < targetChildren.length; i++) {
    inlineStyles(sourceChildren[i], targetChildren[i]);
  }
};
