import React, {
  forwardRef,
  useState,
  useCallback,
  Children,
  isValidElement,
} from "react";
import { Panel } from "./Panel";
import type { PanelProps } from "./Panel";
import { CHEVRON_RIGHT_PATH } from "./iconPaths";
import "./Accordion.css";

/**
 * Props for the AccordionTab component
 */
export interface AccordionTabProps {
  /** Unique key identifying this tab */
  tabKey: string;
  /** Header text */
  header?: string;
  /** Custom header template — receives collapsed state and toggle function */
  headerTemplate?: PanelProps["headerTemplate"];
  /** Tab content */
  children?: React.ReactNode;
  /** Whether this tab is disabled */
  disabled?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * AccordionTab defines a single collapsible section within an Accordion.
 *
 * @description Must be used as a direct child of Accordion. Each tab requires a unique
 * `tabKey` prop. The Accordion parent controls the collapsed state. Supports custom
 * header templates via `headerTemplate` and can be disabled individually.
 *
 * @example
 * ```tsx
 * <Accordion>
 *   <AccordionTab tabKey="a" header="Section 1">Content</AccordionTab>
 *   <AccordionTab tabKey="b" header="Section 2">Content</AccordionTab>
 * </Accordion>
 * ```
 */
export const AccordionTab = forwardRef<HTMLDivElement, AccordionTabProps>(
  (_props, _ref) => null
);

AccordionTab.displayName = "AccordionTab";

/**
 * Props for the Accordion component
 */
export interface AccordionProps {
  /** Whether multiple tabs can be open simultaneously */
  multiple?: boolean;
  /** Controlled active tab keys */
  activeKeys?: string[];
  /** Default active tab keys for uncontrolled mode */
  defaultActiveKeys?: string[];
  /** Callback when active tabs change */
  onToggle?: (activeKeys: string[]) => void;
  /** AccordionTab children */
  children: React.ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * Accordion coordinates multiple collapsible AccordionTab panels.
 *
 * @description Renders AccordionTab children as connected Panel components with shared
 * borders. In single mode (default), opening one tab closes the others. In `multiple`
 * mode, any number of tabs can be open. Supports controlled (`activeKeys` + `onToggle`)
 * and uncontrolled (`defaultActiveKeys`) modes. Disabled tabs show reduced opacity and
 * cannot be toggled. The chevron icon sits left of the title and rotates from right (>)
 * to down (v) when expanded.
 *
 * @example
 * ```tsx
 * <Accordion>
 *   <AccordionTab tabKey="a" header="Section 1"><p>Content 1</p></AccordionTab>
 *   <AccordionTab tabKey="b" header="Section 2"><p>Content 2</p></AccordionTab>
 * </Accordion>
 *
 * <Accordion multiple defaultActiveKeys={['a', 'b']}>
 *   <AccordionTab tabKey="a" header="First"><p>Open by default</p></AccordionTab>
 *   <AccordionTab tabKey="b" header="Second"><p>Also open</p></AccordionTab>
 * </Accordion>
 * ```
 */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      multiple = false,
      activeKeys: controlledKeys,
      defaultActiveKeys = [],
      onToggle,
      children,
      className = "",
      style,
    },
    ref
  ) => {
    const isControlled = controlledKeys !== undefined;
    const [internalKeys, setInternalKeys] =
      useState<string[]>(defaultActiveKeys);
    const activeKeys = isControlled ? controlledKeys : internalKeys;

    const handleToggle = useCallback(
      (key: string) => {
        const isOpen = activeKeys.includes(key);
        let next: string[];

        if (multiple) {
          next = isOpen
            ? activeKeys.filter(k => k !== key)
            : [...activeKeys, key];
        } else {
          next = isOpen ? [] : [key];
        }

        if (!isControlled) setInternalKeys(next);
        onToggle?.(next);
      },
      [activeKeys, multiple, isControlled, onToggle]
    );

    const tabs = Children.toArray(children).filter(
      (child): child is React.ReactElement<AccordionTabProps> =>
        isValidElement(child) &&
        (child.type as { displayName?: string }).displayName === "AccordionTab"
    );

    const classes = ["k-accordion", className].filter(Boolean).join(" ");

    return (
      <div ref={ref} className={classes} style={style}>
        {tabs.map(tab => {
          const {
            tabKey,
            header,
            headerTemplate,
            children: tabChildren,
            disabled,
            className: tabClass,
            style: tabStyle,
          } = tab.props;
          const isOpen = activeKeys.includes(tabKey);
          const toggle = () => !disabled && handleToggle(tabKey);

          const accordionHeader = headerTemplate ? (
            headerTemplate(!isOpen, toggle)
          ) : header ? (
            <div
              className={`k-accordion__header ${disabled ? "k-accordion__header--disabled" : ""}`}
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-expanded={!disabled ? isOpen : undefined}
              aria-disabled={disabled || undefined}
              onClick={toggle}
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle();
                }
              }}
            >
              <span
                className={`k-accordion__chevron ${isOpen ? "k-accordion__chevron--open" : ""}`}
                aria-hidden="true"
              >
                <svg
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d={CHEVRON_RIGHT_PATH} />
                </svg>
              </span>
              <span className="k-accordion__title">{header}</span>
            </div>
          ) : null;

          return (
            <Panel
              key={tabKey}
              headerTemplate={() => accordionHeader}
              toggleable
              collapsed={!isOpen}
              onToggle={toggle}
              className={tabClass}
              style={tabStyle}
            >
              {tabChildren}
            </Panel>
          );
        })}
      </div>
    );
  }
);

Accordion.displayName = "Accordion";
