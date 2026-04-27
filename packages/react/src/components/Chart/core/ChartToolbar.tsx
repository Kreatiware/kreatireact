import React, { forwardRef, useMemo } from "react";
import { MultiSelect } from "../../MultiSelect";
import type { MultiSelectProps } from "../../MultiSelect";
import type { SelectOption } from "../../Select";
import { DropdownButton } from "../../DropdownButton";
import type { DropdownButtonProps } from "../../DropdownButton";
import { Button } from "../../Button";
import type { ButtonProps } from "../../Button";
import { DOWNLOAD_PATH } from "../../iconPaths";
import { useKreatiLocale } from "../../../locale/KreatiProvider";
import "../Chart.css";

/** Series item for the toolbar filter. */
export interface ChartToolbarSeries {
  id: string;
  name: string;
  color?: string;
  group?: string;
}

export interface ChartToolbarProps {
  /** Available series for filtering */
  series?: ChartToolbarSeries[];
  /** Currently visible series IDs */
  visibleIds?: string[];
  /** Callback when series visibility changes */
  onVisibilityChange?: (ids: string[]) => void;
  /** Whether zoom is currently active (shows reset button) */
  hasZoom?: boolean;
  /** Callback to reset zoom */
  onResetZoom?: () => void;
  /** Export formats to show */
  exportFormats?: ("png" | "svg" | "csv" | "json-table" | "json-series")[];
  /** Callback when an export format is selected */
  onExport?: (format: string) => void;
  /** Override props for the MultiSelect filter */
  filterProps?: Partial<MultiSelectProps>;
  /** Override props for the action DropdownButton */
  actionButtonProps?: Partial<DropdownButtonProps>;
  /** Override props for the reset zoom Button (only used in 'split' layout) */
  resetZoomProps?: Partial<ButtonProps>;
  /** Override props for the export DropdownButton (only used in 'split' layout) */
  exportButtonProps?: Partial<DropdownButtonProps>;
  /**
   * Layout of action controls.
   * - 'combined': single DropdownButton with reset zoom as main action and exports in dropdown (default)
   * - 'split': separate Button for reset zoom + separate DropdownButton for exports
   */
  layout?: "combined" | "split";
  /** Additional actions rendered after the built-in controls */
  actions?: React.ReactNode;
  /** Replaces the entire toolbar. Receives the default elements. */
  toolbarRender?: (elements: {
    filter: React.ReactNode;
    actionButton: React.ReactNode;
    resetZoom: React.ReactNode;
    exportButton: React.ReactNode;
    actions: React.ReactNode;
  }) => React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
    <path d={DOWNLOAD_PATH} fill="currentColor" />
  </svg>
);

/**
 * ChartToolbar — companion toolbar for chart interaction.
 *
 * @description Provides series filtering via MultiSelect, a reset zoom
 * button, and export options via DropdownButton. All elements are
 * customizable via override props or fully replaceable via toolbarRender.
 * Uses internal Kreati components (MultiSelect, Button, DropdownButton).
 */
export const ChartToolbar = forwardRef<HTMLDivElement, ChartToolbarProps>(
  (
    {
      series = [],
      visibleIds,
      onVisibilityChange,
      hasZoom = false,
      onResetZoom,
      exportFormats = [],
      onExport,
      filterProps,
      actionButtonProps,
      resetZoomProps,
      exportButtonProps,
      layout = "combined",
      actions,
      toolbarRender,
      className = "",
      style,
    },
    ref
  ) => {
    const t = useKreatiLocale().chart;

    // MultiSelect options from series
    const options: SelectOption[] = useMemo(
      () => series.map(s => ({ value: s.id, label: s.name })),
      [series]
    );

    const handleFilterChange = (values: Array<string | number>) => {
      if (onVisibilityChange) onVisibilityChange(values.map(String));
    };

    // Export menu items
    const exportItems = useMemo(
      () =>
        exportFormats.map(fmt => ({
          key: fmt,
          label:
            fmt === "png"
              ? t.exportPng
              : fmt === "svg"
                ? t.exportSvg
                : fmt === "csv"
                  ? t.exportCsv
                  : fmt === "json-table"
                    ? t.exportJsonTable
                    : t.exportJsonSeries,
        })),
      [exportFormats, t]
    );

    // Build elements
    const filterEl =
      series.length > 0 ? (
        <MultiSelect
          options={options}
          value={visibleIds}
          onChange={handleFilterChange}
          placeholder={t.filterPlaceholder}
          size="sm"
          chipDisplay
          filterable
          clearable
          fullWidth
          {...filterProps}
        />
      ) : null;

    // Combined: single DropdownButton with reset zoom as main + exports in dropdown
    const actionButtonEl =
      onResetZoom || exportFormats.length > 0 ? (
        <DropdownButton
          label={t.resetZoom}
          items={exportItems}
          onClick={hasZoom ? onResetZoom : undefined}
          onItemSelect={key => onExport?.(key)}
          size="sm"
          {...actionButtonProps}
        />
      ) : null;

    // Split: separate reset zoom button + export dropdown
    const resetZoomEl = onResetZoom ? (
      <Button
        label={t.resetZoom}
        size="sm"
        onClick={onResetZoom}
        disabled={!hasZoom}
        {...resetZoomProps}
      />
    ) : null;

    const exportButtonEl =
      exportFormats.length > 0 ? (
        <DropdownButton
          label={t.exportLabel}
          iconLeft={<DownloadIcon />}
          items={exportItems}
          onClick={() => onExport?.(exportFormats[0])}
          onItemSelect={key => onExport?.(key)}
          size="sm"
          {...exportButtonProps}
        />
      ) : null;

    const actionsEl = actions ?? null;

    if (toolbarRender) {
      return (
        <div ref={ref} className={`k-chart-toolbar ${className}`} style={style}>
          {toolbarRender({
            filter: filterEl,
            actionButton: actionButtonEl,
            resetZoom: resetZoomEl,
            exportButton: exportButtonEl,
            actions: actionsEl,
          })}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`k-chart-toolbar ${className}`}
        style={style}
        role="toolbar"
        aria-label="Chart toolbar"
      >
        {filterEl && (
          <div className="k-chart-toolbar__filter">
            <label className="k-chart-toolbar__label">{t.filterLabel}</label>
            {filterEl}
          </div>
        )}
        <div className="k-chart-toolbar__actions">
          {layout === "combined" ? (
            actionButtonEl
          ) : (
            <>
              {resetZoomEl}
              {exportButtonEl}
            </>
          )}
          {actionsEl}
        </div>
      </div>
    );
  }
);

ChartToolbar.displayName = "ChartToolbar";
