import React from "react";
import "./Breadcrumb.css";
import { MenuItem } from "../types/navigation";
import { renderMenuIcon } from "./resolveIcon";
import { CHEVRON_RIGHT_PATH } from "./iconPaths";
import { sanitizeUrl } from "./sanitizeUrl";

/**
 * Props for the Breadcrumb component
 */
export interface BreadcrumbProps {
  /** Array of menu items representing the breadcrumb path */
  items: MenuItem[];
  /** Separator between items — icon name string, ReactNode, or text (default: ChevronRight) */
  separator?: React.ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/** Default chevron separator */
const defaultSeparator = (
  <svg
    width={14}
    height={14}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d={CHEVRON_RIGHT_PATH} />
  </svg>
);

/**
 * Breadcrumb displays a navigation trail showing the current page location.
 *
 * @description A breadcrumb component that renders MenuItem items as a horizontal
 * path with configurable separators. The last item is rendered as the current page
 * (non-clickable). Supports icons (string or ReactNode), custom templates, disabled
 * states, and URL navigation. Fully accessible with ARIA breadcrumb navigation role.
 *
 * @example
 * ```tsx
 * <Breadcrumb items={[
 *   { key: 'home', label: 'Home', url: '/' },
 *   { key: 'products', label: 'Products', url: '/products' },
 *   { key: 'laptops', label: 'Laptops' },
 * ]} />
 * ```
 */
export const Breadcrumb = ({
  items,
  separator,
  className = "",
  style,
  ref,
}: BreadcrumbProps & { ref?: React.Ref<HTMLElement> }) => {
  const base = "k-breadcrumb";
  const visibleItems = items.filter(item => item.visible !== false);

  const resolvedSeparator = separator
    ? typeof separator === "string"
      ? renderMenuIcon(separator, 14) || <span>{separator}</span>
      : separator
    : defaultSeparator;

  const classes = [base, className].filter(Boolean).join(" ");

  const handleClick = (item: MenuItem, e: React.MouseEvent) => {
    if (item.disabled) {
      e.preventDefault();
      return;
    }
    if (item.command) {
      e.preventDefault();
      item.command(item);
    }
  };

  return (
    <nav ref={ref} className={classes} style={style} aria-label="Breadcrumb">
      <ol className={`${base}__list`}>
        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1;

          if (item.template) {
            return (
              <li key={item.key} className={`${base}__item`}>
                {item.template(item)}
                {!isLast && (
                  <span className={`${base}__separator`} aria-hidden="true">
                    {resolvedSeparator}
                  </span>
                )}
              </li>
            );
          }

          const isDisabled = item.disabled;
          const hasLink = item.url && !isLast && !isDisabled;

          const linkClasses = [
            `${base}__link`,
            isLast && `${base}__link--current`,
            isDisabled && `${base}__link--disabled`,
            item.className,
          ]
            .filter(Boolean)
            .join(" ");

          const content = (
            <>
              {item.icon && (
                <span className={`${base}__icon`} aria-hidden="true">
                  {renderMenuIcon(item.icon, 14)}
                </span>
              )}
              <span>{item.label}</span>
            </>
          );

          return (
            <li key={item.key} className={`${base}__item`}>
              {hasLink ? (
                <a
                  href={sanitizeUrl(item.url)}
                  target={item.target}
                  rel={
                    item.target === "_blank" ? "noopener noreferrer" : undefined
                  }
                  className={linkClasses}
                  style={item.style}
                  onClick={e => handleClick(item, e)}
                >
                  {content}
                </a>
              ) : (
                <span
                  className={linkClasses}
                  style={item.style}
                  aria-current={isLast ? "page" : undefined}
                >
                  {content}
                </span>
              )}
              {!isLast && (
                <span className={`${base}__separator`} aria-hidden="true">
                  {resolvedSeparator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
