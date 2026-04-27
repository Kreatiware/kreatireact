import React from "react";

/**
 * SVG pattern definitions for accessible chart fills.
 *
 * @description Generates `<pattern>` elements so series are
 * distinguishable without relying solely on color. Patterns
 * inherit the series color via the `color` prop.
 */

export type PatternType = "stripes" | "dots" | "crosshatch";

/** Returns a unique pattern ID for a given type + color combination. */
export const getPatternId = (type: PatternType, color: string): string => {
  const hash = color.replace(/[^a-zA-Z0-9]/g, "");
  return `k-pattern-${type}-${hash}`;
};

/** Returns the SVG `fill` url referencing a pattern. */
export const patternFill = (type: PatternType, color: string): string =>
  `url(#${getPatternId(type, color)})`;

/** Renders a single SVG `<pattern>` element. */
export const ChartPattern: React.FC<{ type: PatternType; color: string }> = ({ type, color }) => {
  const id = getPatternId(type, color);
  switch (type) {
    case "stripes":
      return (
        <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="3" height="6" fill={color} />
        </pattern>
      );
    case "dots":
      return (
        <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="2" fill={color} />
        </pattern>
      );
    case "crosshatch":
      return (
        <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M0,0 L8,8 M8,0 L0,8" stroke={color} strokeWidth={1.5} fill="none" />
        </pattern>
      );
  }
};
