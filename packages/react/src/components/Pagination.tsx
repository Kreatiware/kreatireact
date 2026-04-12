import React, { forwardRef, useCallback, useMemo, useRef, useImperativeHandle } from 'react';
import { CHEVRON_LEFT_PATH, CHEVRON_RIGHT_PATH, DOUBLE_ARROW_LEFT_PATH, DOUBLE_ARROW_RIGHT_PATH } from './iconPaths';
import { useKreatiLocale } from '../locale';
import './Pagination.css';

export interface PaginationProps {
  /** Total number of items */
  totalItems: number;
  /** Items per page */
  itemsPerPage?: number;
  /** Current page (1-based, controlled) */
  page?: number;
  /** Default page (uncontrolled) */
  defaultPage?: number;
  /** Fires when page changes */
  onPageChange?: (page: number) => void;
  /** Max page buttons visible before ellipsis (default: 5) */
  maxVisible?: number;
  /** Show first/last page buttons */
  showFirstLast?: boolean;
  /** Component size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Custom template for page buttons */
  pageTemplate?: (page: number, active: boolean) => React.ReactNode;
  /** Disabled state */
  disabled?: boolean;
  /** Full width centered */
  fullWidth?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

const base = 'k-pagination';

const NavIcon = ({ path }: { path: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" aria-hidden="true">
    <path d={path} />
  </svg>
);

/**
 * Pagination component for navigating paged data.
 *
 * @description Renders page buttons with prev/next navigation, ellipsis
 * for large page counts, and optional first/last buttons. Supports
 * controlled and uncontrolled modes, custom templates, and full
 * keyboard navigation.
 *
 * @example
 * ```tsx
 * <Pagination totalItems={100} itemsPerPage={10} page={page} onPageChange={setPage} />
 * ```
 */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  (
    {
      totalItems,
      itemsPerPage = 10,
      page: controlledPage,
      defaultPage = 1,
      onPageChange,
      maxVisible = 5,
      showFirstLast = false,
      size = 'md',
      pageTemplate,
      disabled = false,
      fullWidth = false,
      className = '',
      style,
    },
    ref,
  ) => {
    const elRef = useRef<HTMLElement>(null);
    useImperativeHandle(ref, () => elRef.current as HTMLElement);
    const locale = useKreatiLocale();

    const isControlled = controlledPage !== undefined;
    const [internalPage, setInternalPage] = React.useState(defaultPage);
    const current = isControlled ? controlledPage : internalPage;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    const goTo = useCallback(
      (p: number) => {
        const clamped = Math.max(1, Math.min(p, totalPages));
        if (!isControlled) setInternalPage(clamped);
        onPageChange?.(clamped);
      },
      [isControlled, totalPages, onPageChange],
    );

    const pages = useMemo(() => {
      const result: (number | 'ellipsis')[] = [];
      if (totalPages <= maxVisible + 2) {
        for (let i = 1; i <= totalPages; i++) result.push(i);
        return result;
      }
      const half = Math.floor(maxVisible / 2);
      let start = Math.max(2, current - half);
      let end = Math.min(totalPages - 1, current + half);
      if (current <= half + 1) end = maxVisible;
      if (current >= totalPages - half) start = totalPages - maxVisible + 1;
      result.push(1);
      if (start > 2) result.push('ellipsis');
      for (let i = start; i <= end; i++) result.push(i);
      if (end < totalPages - 1) result.push('ellipsis');
      result.push(totalPages);
      return result;
    }, [totalPages, maxVisible, current]);

    const cls = [base, `${base}--${size}`, fullWidth && `${base}--full-width`, className].filter(Boolean).join(' ');

    const btn = (key: string, label: string, onClick: () => void, isDisabled: boolean, children: React.ReactNode, active = false) => (
      <button
        key={key}
        type="button"
        className={`${base}__btn${active ? ` ${base}__btn--active` : ''}`}
        onClick={onClick}
        disabled={disabled || isDisabled}
        aria-label={label}
        aria-current={active ? 'page' : undefined}
      >
        {children}
      </button>
    );

    return (
      <nav ref={elRef} className={cls} style={style} role="navigation" aria-label={locale.pagination.ariaLabel}>
        {showFirstLast && btn('first', locale.pagination.first, () => goTo(1), current === 1, <NavIcon path={DOUBLE_ARROW_LEFT_PATH} />)}
        {btn('prev', locale.pagination.previous, () => goTo(current - 1), current === 1, <NavIcon path={CHEVRON_LEFT_PATH} />)}
        {pages.map((p, i) =>
          p === 'ellipsis'
            ? <span key={`e${i}`} className={`${base}__ellipsis`} aria-hidden="true">...</span>
            : btn(`p${p}`, `${locale.pagination.page} ${p}`, () => goTo(p), false, pageTemplate ? pageTemplate(p, p === current) : p, p === current),
        )}
        {btn('next', locale.pagination.next, () => goTo(current + 1), current === totalPages, <NavIcon path={CHEVRON_RIGHT_PATH} />)}
        {showFirstLast && btn('last', locale.pagination.last, () => goTo(totalPages), current === totalPages, <NavIcon path={DOUBLE_ARROW_RIGHT_PATH} />)}
      </nav>
    );
  },
);

Pagination.displayName = 'Pagination';
