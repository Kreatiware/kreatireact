import React from "react";
import {
  CHEVRON_DOWN_PATH,
  CHEVRON_UP_PATH,
  CHEVRON_RIGHT_PATH,
  CHECK_PATH,
  MINUS_PATH,
  SEARCH_PATH,
  TIMES_PATH,
  CALENDAR_PATH,
  MAXIMIZE_PATH,
  RESTORE_PATH,
  HAMBURGER_RECTS,
} from "./iconPaths";

/** Map of icon names to their SVG path data */
const ICON_PATH_MAP: Record<string, string> = {
  "chevron-down": CHEVRON_DOWN_PATH,
  "chevron-up": CHEVRON_UP_PATH,
  "chevron-right": CHEVRON_RIGHT_PATH,
  check: CHECK_PATH,
  minus: MINUS_PATH,
  search: SEARCH_PATH,
  times: TIMES_PATH,
  calendar: CALENDAR_PATH,
  maximize: MAXIMIZE_PATH,
  restore: RESTORE_PATH,
};

/** Rect-based icons that use <rect> instead of <path> */
const ICON_RECT_MAP: Record<
  string,
  readonly { x: number; y: number; width: number; height: number }[]
> = {
  hamburger: HAMBURGER_RECTS,
};

/**
 * Resolves an icon name string to an inline SVG element.
 * Uses paths from iconPaths.ts for zero-dependency rendering.
 *
 * @param name - Icon name (e.g. "chevron-down", "check", "hamburger")
 * @param size - Icon size in pixels (default 16)
 * @returns SVG ReactNode or null if name not found
 */
export const resolveIcon = (name: string, size = 16): React.ReactNode => {
  const key = name.toLowerCase();

  const path = ICON_PATH_MAP[key];
  if (path) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d={path} />
      </svg>
    );
  }

  const rects = ICON_RECT_MAP[key];
  if (rects) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        {rects.map((r, i) => (
          <rect
            key={i}
            x={r.x}
            y={r.y}
            width={r.width}
            height={r.height}
            rx=".57"
            ry=".57"
          />
        ))}
      </svg>
    );
  }

  return null;
};

/**
 * Renders a MenuItem icon — resolves string names to SVG, passes ReactNode through.
 *
 * @param icon - Icon name string or ReactNode
 * @param size - Icon size when resolving from string (default 16)
 */
export const renderMenuIcon = (
  icon: React.ReactNode,
  size = 16
): React.ReactNode => {
  if (typeof icon === "string") return resolveIcon(icon, size);
  return icon;
};
