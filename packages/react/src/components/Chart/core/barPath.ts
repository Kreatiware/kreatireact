/**
 * Generates an SVG path for a rectangle with selectively rounded corners.
 *
 * @description Used by BarChart to round only the top corners (positive values)
 * or bottom corners (negative values), avoiding the visual artifact of
 * SVG `<rect rx>` which rounds all four corners.
 */
export const roundedBarPath = (
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  position: "top" | "bottom" | "left" | "right"
): string => {
  const cr = Math.min(r, w / 2, h / 2);
  if (cr <= 0) return `M${x},${y}h${w}v${h}h${-w}Z`;

  switch (position) {
    case "top":
      return `M${x},${y + cr}Q${x},${y} ${x + cr},${y}h${w - cr * 2}Q${x + w},${y} ${x + w},${y + cr}v${h - cr}h${-w}Z`;
    case "bottom":
      return `M${x},${y}h${w}v${h - cr}Q${x + w},${y + h} ${x + w - cr},${y + h}h${-(w - cr * 2)}Q${x},${y + h} ${x},${y + h - cr}Z`;
    case "right":
      return `M${x},${y}h${w - cr}Q${x + w},${y} ${x + w},${y + cr}v${h - cr * 2}Q${x + w},${y + h} ${x + w - cr},${y + h}h${-(w - cr)}v${-h}Z`;
    case "left":
      return `M${x + cr},${y}h${w - cr}v${h}h${-(w - cr)}Q${x},${y + h} ${x},${y + h - cr}v${-(h - cr * 2)}Q${x},${y} ${x + cr},${y}Z`;
  }
};
