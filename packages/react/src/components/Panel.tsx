import React, { useState, useCallback, useId } from "react";
import "./Panel.css";
import { CHEVRON_DOWN_PATH } from "./iconPaths";

/**
 * Props for the Panel component
 */
export interface PanelProps {
  /** Panel header text */
  header?: string;
  /** Custom header template — receives collapsed state and toggle function */
  headerTemplate?: (collapsed: boolean, toggle: () => void) => React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Whether the panel can be collapsed/expanded */
  toggleable?: boolean;
  /** Controlled collapsed state */
  collapsed?: boolean;
  /** Default collapsed state for uncontrolled mode */
  defaultCollapsed?: boolean;
  /** Callback when collapsed state changes */
  onToggle?: (collapsed: boolean) => void;
  /** Panel body content */
  children?: React.ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * Panel is a content container with an optional collapsible header.
 *
 * @description Renders a bordered panel with header, body, and footer zones. When `toggleable`
 * is enabled, clicking the header collapses or expands the body and footer with an animated
 * transition. Supports controlled (`collapsed` + `onToggle`) and uncontrolled (`defaultCollapsed`)
 * modes. A `headerTemplate` prop allows full customization of the header while preserving
 * toggle behavior. Accessible with ARIA expanded/controls attributes and keyboard support.
 *
 * @example
 * ```tsx
 * <Panel header="Details" toggleable>
 *   <p>Collapsible content here.</p>
 * </Panel>
 * ```
 */
export const Panel = ({
  header,
  headerTemplate,
  footer,
  toggleable = false,
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onToggle,
  children,
  className = "",
  style,
  ref,
}: PanelProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const base = "k-panel";
  const contentId = useId();
  const headerId = useId();

  const isControlled = controlledCollapsed !== undefined;
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const collapsed = isControlled ? controlledCollapsed : internalCollapsed;

  const toggle = useCallback(() => {
    if (!toggleable) return;
    const next = !collapsed;
    if (!isControlled) setInternalCollapsed(next);
    onToggle?.(next);
  }, [toggleable, collapsed, isControlled, onToggle]);

  const classes = [base, collapsed && `${base}--collapsed`, className]
    .filter(Boolean)
    .join(" ");

  const headerContent = headerTemplate ? (
    headerTemplate(collapsed, toggle)
  ) : header ? (
    <div
      id={headerId}
      className={`${base}__header ${toggleable ? `${base}__header--toggleable` : ""}`}
      role={toggleable ? "button" : undefined}
      tabIndex={toggleable ? 0 : undefined}
      aria-expanded={toggleable ? !collapsed : undefined}
      aria-controls={toggleable ? contentId : undefined}
      onClick={toggleable ? toggle : undefined}
      onKeyDown={
        toggleable
          ? e => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggle();
              }
            }
          : undefined
      }
    >
      <span className={`${base}__title`}>{header}</span>
      {toggleable && (
        <span
          className={`${base}__chevron ${collapsed ? "" : `${base}__chevron--open`}`}
          aria-hidden="true"
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
            <path d={CHEVRON_DOWN_PATH} />
          </svg>
        </span>
      )}
    </div>
  ) : null;

  return (
    <div ref={ref} className={classes} style={style}>
      {headerContent}
      <div
        id={contentId}
        className={`${base}__content`}
        role="region"
        aria-labelledby={header ? headerId : undefined}
      >
        <div className={`${base}__content-inner`}>
          {children && <div className={`${base}__body`}>{children}</div>}
          {footer && <div className={`${base}__footer`}>{footer}</div>}
        </div>
      </div>
    </div>
  );
};
