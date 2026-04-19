import { createContext, useContext } from "react";

/**
 * Global layer context for z-index stacking.
 *
 * Each Dialog gets a unique layer number via nextLayer().
 * The LayerContext propagates the current layer to children
 * so overlay components (Select, MultiSelect, Popover, Calendar)
 * can position their portals above the current dialog.
 *
 * z-index formula:
 * - Dialog overlay: 1000 + layer * 10
 * - Child overlays: 1000 + layer * 10 + 5
 * - No dialog (layer 0): base 1000, children 1005
 */

let counter = 0;

/** Get the next unique layer number */
export const nextLayer = (): number => ++counter;

/** React context holding the current layer depth */
export const LayerContext = createContext(0);

/** Hook to get z-index values for the current layer */
export const useLayerZIndex = (): { overlay: number; child: number } => {
  const layer = useContext(LayerContext);
  const base = 1000 + layer * 10;
  return { overlay: base, child: base + 5 };
};
