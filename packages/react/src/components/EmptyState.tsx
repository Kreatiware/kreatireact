import React, { forwardRef } from "react";
import "./EmptyState.css";
import { useKreatiLocale } from "../locale";

export interface EmptyStateProps {
  /** Icon or illustration to display */
  icon?: React.ReactNode;
  /** Title text. Defaults to locale value. */
  title?: string;
  /** Description text. Defaults to locale value. */
  description?: string;
  /** Action area — typically a Button */
  actions?: React.ReactNode;
  /** Size variant. Default: 'md' */
  size?: "sm" | "md" | "lg";
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * EmptyState component for displaying placeholder content when
 * a section has no data (empty tables, search results, inboxes).
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<Search size={48} />}
 *   title="No results found"
 *   description="Try adjusting your search or filters."
 *   actions={<Button label="Clear filters" />}
 * />
 * ```
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    { icon, title, description, actions, size = "md", className, style },
    ref
  ) => {
    const locale = useKreatiLocale();
    const resolvedTitle = title ?? locale?.emptyState?.title ?? "No data";
    const resolvedDesc =
      description ??
      locale?.emptyState?.description ??
      "There are no items to display.";

    return (
      <div
        ref={ref}
        className={`k-empty-state k-empty-state--${size} ${className || ""}`}
        style={style}
        role="status"
        aria-live="polite"
      >
        {icon && <div className="k-empty-state__icon">{icon}</div>}
        <h3 className="k-empty-state__title">{resolvedTitle}</h3>
        <p className="k-empty-state__description">{resolvedDesc}</p>
        {actions && <div className="k-empty-state__actions">{actions}</div>}
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";
