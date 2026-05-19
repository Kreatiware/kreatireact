import React from "react";
import { ScrollBar } from "./ScrollBar";
import type { ScrollBarProps } from "./ScrollBar";
import "./ScrollArea.css";

/**
 * Props for the ScrollArea component
 */
export interface ScrollAreaProps {
  /** Maximum height before vertical scroll activates */
  maxHeight?: string;
  /** Maximum width before horizontal scroll activates */
  maxWidth?: string;
  /** Scroll direction */
  orientation?: "vertical" | "horizontal" | "both";
  /** Props forwarded to the internal ScrollBar component */
  scrollBarProps?: Omit<
    ScrollBarProps,
    | "children"
    | "maxHeight"
    | "maxWidth"
    | "orientation"
    | "className"
    | "style"
  >;
  /** Custom ScrollBar element — replaces the internal ScrollBar entirely */
  scrollBar?: (children: React.ReactNode) => React.ReactNode;
  /** Content */
  children: React.ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * ScrollArea is a scrollable content container that uses ScrollBar internally.
 *
 * @description Wraps content in a scrollable region with a custom Kreati scrollbar by default.
 * Use `scrollBarProps` to customize the internal ScrollBar (variant, size, color, arrows, etc.)
 * or provide a `scrollBar` render function to replace it entirely with a custom implementation.
 * Supports vertical, horizontal, or both scroll directions.
 *
 * @example
 * ```tsx
 * <ScrollArea maxHeight="300px">
 *   <LongContent />
 * </ScrollArea>
 *
 * <ScrollArea maxHeight="400px" scrollBarProps={{ size: 'md', color: '#0f78a5', arrows: true }}>
 *   <LongContent />
 * </ScrollArea>
 * ```
 */
export const ScrollArea = ({
  maxHeight,
  maxWidth,
  orientation = "vertical",
  scrollBarProps,
  scrollBar,
  children,
  className = "",
  style,
  ref,
}: ScrollAreaProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const classes = ["k-scroll-area", className].filter(Boolean).join(" ");

  if (scrollBar) {
    return (
      <div
        ref={ref}
        className={classes}
        style={{ ...style, maxHeight, maxWidth }}
      >
        {scrollBar(children)}
      </div>
    );
  }

  return (
    <ScrollBar
      ref={ref}
      orientation={orientation}
      maxHeight={maxHeight}
      maxWidth={maxWidth}
      className={classes}
      style={style}
      {...scrollBarProps}
    >
      {children}
    </ScrollBar>
  );
};
