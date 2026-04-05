import React, { forwardRef, useId, useRef, useState, useCallback, useEffect, useMemo, useImperativeHandle } from 'react';
import { useKreatiLocale } from '../locale';
import { CHEVRON_DOWN_PATH, TIMES_PATH, CALENDAR_PATH } from './iconPaths';
import { Popover } from './Popover';
import { FieldWrapper } from './FieldWrapper';
import { Input } from './Input';
import { Button } from './Button';
import { ToggleButtonGroup } from './ToggleButtonGroup';
import { List } from './List';
import type { ListItem } from './List';
import './Calendar.css';

export type CalendarSelectionMode = 'single' | 'multiple' | 'range';
export type CalendarView = 'date' | 'month' | 'year' | 'time';
export type CalendarWeekdayFormat = 'narrow' | 'short' | 'long';
export type CalendarHourFormat = '12' | '24';

/** Preset date option for quick selection */
export interface CalendarPreset {
  /** Display label */
  label: string;
  /** Value to apply — Date for single, [start, end] for range, or a function that returns either */
  value: Date | Date[] | (() => Date | Date[]);
}

export interface CalendarProps {
  /** Selected date(s) — Date for single, Date[] for multiple/range (controlled) */
  value?: Date | Date[] | null;
  /** Default selected date(s) (uncontrolled) */
  defaultValue?: Date | Date[] | null;
  /** Fires when selection changes */
  onChange?: (value: Date | Date[] | null) => void;
  /** Selection mode */
  selectionMode?: CalendarSelectionMode;
  /** Which view to show: date (default), month only, year only, time only */
  view?: CalendarView;
  /** Show the calendar inline without input trigger */
  inline?: boolean;
  /** BCP 47 locale string — defaults to browser locale */
  locale?: string;
  /** First day of the week: 0=Sun, 1=Mon, etc. — defaults to locale detection */
  firstDayOfWeek?: number;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Disable specific dates via array or function */
  disabledDates?: Date[] | ((date: Date) => boolean);
  /** Show week numbers column */
  showWeekNumbers?: boolean;
  /** Show time selector below the calendar */
  showTime?: boolean;
  /** Hour format for time selector */
  hourFormat?: CalendarHourFormat;
  /** Show seconds in time selector */
  showSeconds?: boolean;
  /** Show button bar with Today and Clear */
  showButtonBar?: boolean;
  /**
   * Custom render for the button bar. Replaces the default Today/Clear buttons.
   * Only rendered when `showButtonBar` is true.
   *
   * @param helpers - Object with utility functions:
   *   - `selectToday` — selects today's date
   *   - `clear` — clears the selection
   * @returns ReactNode to render inside the button bar area
   *
   * @example
   * ```tsx
   * <Calendar showButtonBar buttonBarTemplate={({ selectToday, clear }) => (
   *   <div style={{ display: 'flex', gap: 8 }}>
   *     <button onClick={selectToday}>Now</button>
   *     <button onClick={clear}>Reset</button>
   *   </div>
   * )} />
   * ```
   */
  buttonBarTemplate?: (helpers: { selectToday: () => void; clear: () => void }) => React.ReactNode;
  /** Number of months to display side by side */
  numberOfMonths?: number;
  /** Weekday header format */
  weekdayFormat?: CalendarWeekdayFormat;
  /** Date format string for the input display (e.g. 'dd/mm/yyyy') */
  dateFormat?: string;
  /** Touch-friendly modal mode for mobile */
  touchUI?: boolean;
  /** Use short labels (HH, MM, SS) for time inputs instead of full names (default: true) */
  timeLabelsShort?: boolean;
  /** Custom icon for the input trigger — defaults to CalendarIcon */
  icon?: React.ReactNode;
  /**
   * Custom render for each day cell.
   *
   * Receives the date and its state object. The returned ReactNode replaces
   * the default day number inside the cell button.
   *
   * By default, the calendar still applies its own visual styles (selected
   * background, today color, range highlight). Combine with `unstyledDays`
   * to take full visual control.
   *
   * @param date - The Date object for this cell
   * @param state - Object with boolean flags:
   *   - `selected` — true if this date is currently selected
   *   - `today` — true if this date is today
   *   - `disabled` — true if this date is disabled (minDate/maxDate/disabledDates)
   *   - `outside` — true if this date belongs to an adjacent month
   *   - `inRange` — true if this date falls between the two endpoints of a range selection
   * @returns ReactNode to render inside the day cell
   *
   * @example
   * ```tsx
   * // Add a dot indicator on specific days
   * <Calendar dayTemplate={(date, { selected }) => (
   *   <div>
   *     <span>{date.getDate()}</span>
   *     {events[date.getDate()] && <span className="dot" />}
   *   </div>
   * )} />
   *
   * // Full visual control — star icon replaces number on select
   * <Calendar unstyledDays dayTemplate={(date, { selected }) => (
   *   <span style={{ color: selected ? '#f59e0b' : undefined }}>
   *     {selected ? '\u2605' : date.getDate()}
   *   </span>
   * )} />
   * ```
   */
  dayTemplate?: (date: Date, state: { selected: boolean; today: boolean; disabled: boolean; outside: boolean; inRange: boolean }) => React.ReactNode;
  /**
   * Disables default visual styles (selected, today, hover, in-range) on day
   * cells, keeping only structural styles (size, cursor, focus outline,
   * disabled opacity). Use together with `dayTemplate` for full visual control.
   *
   * @default false
   */
  unstyledDays?: boolean;
  /**
   * Preset date options shown as a List alongside the calendar panel.
   * Each preset has a label and a value (Date, Date[], or a function returning either).
   * When true, uses built-in presets (Today, Yesterday, Last 7/14/30 days, etc.).
   * When an array, uses custom presets.
   *
   * @default false
   */
  presets?: boolean | CalendarPreset[];
  /** Visual variant for input mode */
  variant?: 'floating' | 'stacked';
  /** Component size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Label text */
  label?: string;
  /** Placeholder for the input */
  placeholder?: string;
  /** Helper text */
  helperText?: React.ReactNode;
  /** Error message or boolean */
  error?: React.ReactNode | boolean;
  /** Success state */
  success?: boolean;
  /** Helper severity */
  helperSeverity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'help' | 'danger';
  /** Disabled state */
  disabled?: boolean;
  /** Read-only state */
  readOnly?: boolean;
  /** Required indicator */
  required?: boolean;
  /** Full width mode */
  fullWidth?: boolean;
  /** HTML name attribute */
  name?: string;
  /** Change handler for input blur — Formik compatible */
  onBlur?: () => void;
  /** Additional CSS class names */
  className?: string;
}

const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const isSameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

const detectFirstDay = (loc: string): number => {
  try { const l = new (Intl as any).Locale(loc); if (l.weekInfo?.firstDay !== undefined) return l.weekInfo.firstDay % 7; } catch { /* fallback */ }
  return 0;
};

const getWeekNumber = (d: Date): number => {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
};

const formatDate = (d: Date, fmt: string, loc: string): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return fmt
    .replace('dd', pad(d.getDate()))
    .replace('mm', pad(d.getMonth() + 1))
    .replace('yyyy', String(d.getFullYear()))
    .replace('yy', String(d.getFullYear()).slice(-2));
};

const formatTime = (d: Date, h12: boolean, showSec: boolean): string => {
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  if (h12) {
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m}${showSec ? ':' + s : ''} ${ampm}`;
  }
  return `${String(h).padStart(2, '0')}:${m}${showSec ? ':' + s : ''}`;
};

const displayValue = (val: Date | Date[] | null, mode: CalendarSelectionMode, view: CalendarView, fmt: string, loc: string, showTime: boolean, h12: boolean, showSec: boolean, monthNames: string[]): string => {
  if (!val) return '';
  if (view === 'time') {
    const d = Array.isArray(val) ? val[0] : val;
    if (!d) return '';
    return formatTime(d, h12, showSec);
  }
  if (view === 'month') {
    const d = Array.isArray(val) ? val[0] : val;
    if (!d) return '';
    return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  }
  if (view === 'year') {
    const d = Array.isArray(val) ? val[0] : val;
    if (!d) return '';
    return String(d.getFullYear());
  }
  if (Array.isArray(val)) {
    if (mode === 'range') return val.map((d) => formatDate(d, fmt, loc)).join(' - ');
    return val.map((d) => formatDate(d, fmt, loc)).join(', ');
  }
  const datePart = formatDate(val, fmt, loc);
  if (showTime) return `${datePart} ${formatTime(val, h12, showSec)}`;
  return datePart;
};

/**
 * Calendar component for date, time, and range selection.
 *
 * @description A versatile calendar supporting single, multiple, and range
 * date selection with optional time picker. Can render inline or as an
 * input with popover. Supports month-only, year-only, and time-only views,
 * multi-month display, touch UI, custom day templates, and full i18n via
 * browser locale. Compatible with Formik via name, value, onChange, onBlur.
 *
 * @example
 * ```tsx
 * <Calendar label="Date" onChange={(d) => console.log(d)} />
 * <Calendar inline selectionMode="range" numberOfMonths={2} />
 * <Calendar showTime hourFormat="12" showButtonBar />
 * ```
 */
export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(
  (
    {
      value: controlledValue, defaultValue, onChange,
      selectionMode = 'single', view: viewProp = 'date', inline = false,
      locale: localeProp, firstDayOfWeek: fdowProp,
      minDate, maxDate, disabledDates,
      showWeekNumbers = false, showTime = false, hourFormat = '24', showSeconds = false,
      showButtonBar = false, buttonBarTemplate, numberOfMonths = 1, weekdayFormat = 'narrow',
      dateFormat = 'dd/mm/yyyy', touchUI = false, timeLabelsShort = true, icon,
      dayTemplate, unstyledDays = false, presets = false, variant = 'floating', size = 'md',
      label, placeholder, helperText, error, success = false, helperSeverity,
      disabled = false, readOnly = false, required = false, fullWidth = false,
      name, onBlur, className = '',
    },
    ref,
  ) => {
    const autoId = useId();
    const calId = name || autoId;
    const wrapperRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => wrapperRef.current as HTMLDivElement);

    const kreatiLocale = useKreatiLocale();
    const resolvedLocale = localeProp || (typeof navigator !== 'undefined' ? navigator.language : 'en-US');
    const firstDayOfWeek = fdowProp ?? detectFirstDay(resolvedLocale);
    const is12h = hourFormat === '12';

    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState<Date | Date[] | null>(defaultValue ?? null);
    const selected = isControlled ? controlledValue : internalValue;

    const [popoverOpen, setPopoverOpen] = useState(false);
    const [currentView, setCurrentView] = useState<'days' | 'months' | 'years'>(viewProp === 'month' ? 'months' : viewProp === 'year' ? 'years' : 'days');
    const [viewDate, setViewDate] = useState(() => {
      const d = Array.isArray(selected) ? selected[0] : selected;
      return d || new Date();
    });
    const [yearRangeStart, setYearRangeStart] = useState(() => Math.floor(viewDate.getFullYear() / 12) * 12);
    const [rangeHover, setRangeHover] = useState<Date | null>(null);
    const [pendingTime, setPendingTime] = useState<{ h: number; m: number; s: number } | null>(null);
    const timeHourRef = useRef<HTMLDivElement>(null);
    const timeMinRef = useRef<HTMLDivElement>(null);
    const timeSecRef = useRef<HTMLDivElement>(null);

    const today = useMemo(() => new Date(), []);
    const hasError = !!error;
    const errorMessage = typeof error === 'boolean' ? undefined : error;
    const isFloating = variant === 'floating';
    const hasLabel = !!label;
    const hasWrapper = !isFloating && !!(label || helperText || errorMessage);
    const base = 'k-calendar';

    const helperId = `${calId}-helper`;
    const errorId = `${calId}-error`;
    const describedBy = [hasError && errorId, helperId].filter(Boolean).join(' ') || undefined;

    const updateValue = useCallback((next: Date | Date[] | null) => {
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    }, [isControlled, onChange]);

    const isDateDisabled = useCallback((d: Date): boolean => {
      if (minDate && d < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) return true;
      if (maxDate && d > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) return true;
      if (!disabledDates) return false;
      if (Array.isArray(disabledDates)) return disabledDates.some((dd) => isSameDay(dd, d));
      return disabledDates(d);
    }, [minDate, maxDate, disabledDates]);

    const isSelected = useCallback((d: Date): boolean => {
      if (!selected) return false;
      if (Array.isArray(selected)) return selected.some((s) => isSameDay(s, d));
      return isSameDay(selected, d);
    }, [selected]);

    const isInRange = useCallback((d: Date): boolean => {
      if (selectionMode !== 'range' || !Array.isArray(selected) || selected.length === 0) return false;
      const start = selected[0];
      const end = selected.length > 1 ? selected[1] : rangeHover;
      if (!start || !end) return false;
      const lo = start < end ? start : end;
      const hi = start < end ? end : start;
      return d > lo && d < hi;
    }, [selectionMode, selected, rangeHover]);

    const selectDate = useCallback((d: Date) => {
      if (isDateDisabled(d)) return;
      if (selectionMode === 'single') {
        const prev = selected && !Array.isArray(selected) ? selected : null;
        const fallbackTime = (showTime || viewProp === 'time') && !prev && !pendingTime
          ? { h: new Date().getHours(), m: new Date().getMinutes(), s: new Date().getSeconds() }
          : null;
        const timeSource = pendingTime || (prev ? { h: prev.getHours(), m: prev.getMinutes(), s: prev.getSeconds() } : fallbackTime);
        const next = timeSource
          ? new Date(d.getFullYear(), d.getMonth(), d.getDate(), timeSource.h, timeSource.m, timeSource.s)
          : d;
        updateValue(next);
        if (pendingTime) setPendingTime(null);
        if (!inline && !showTime) { setPopoverOpen(false); onBlur?.(); }
      } else if (selectionMode === 'multiple') {
        const arr = Array.isArray(selected) ? [...selected] : [];
        const idx = arr.findIndex((s) => isSameDay(s, d));
        if (idx >= 0) arr.splice(idx, 1); else arr.push(d);
        updateValue(arr);
      } else if (selectionMode === 'range') {
        const arr = Array.isArray(selected) ? selected : [];
        if (arr.length === 0 || arr.length === 2) {
          updateValue([d]);
        } else {
          const sorted = arr[0] <= d ? [arr[0], d] : [d, arr[0]];
          updateValue(sorted);
          if (!inline) { setPopoverOpen(false); onBlur?.(); }
        }
      }
    }, [selectionMode, selected, pendingTime, showTime, viewProp, inline, isDateDisabled, updateValue, onBlur]);

    const setTime = useCallback((h: number, m: number, s: number) => {
      if (!inline && popoverOpen) {
        setPendingTime({ h, m, s });
      } else {
        const base = selected && !Array.isArray(selected) ? selected : new Date();
        updateValue(new Date(base.getFullYear(), base.getMonth(), base.getDate(), h, m, s));
      }
    }, [selected, updateValue, inline, popoverOpen]);

    const commitPendingTime = useCallback(() => {
      if (!pendingTime) return;
      const base = selected && !Array.isArray(selected) ? selected : new Date();
      updateValue(new Date(base.getFullYear(), base.getMonth(), base.getDate(), pendingTime.h, pendingTime.m, pendingTime.s));
      setPendingTime(null);
    }, [pendingTime, selected, updateValue]);

    const navMonth = useCallback((delta: number) => setViewDate((p) => new Date(p.getFullYear(), p.getMonth() + delta, 1)), []);
    const navYear = useCallback((delta: number) => setViewDate((p) => new Date(p.getFullYear() + delta, p.getMonth(), 1)), []);

    const monthNames = useMemo(() => {
      const fmt = new Intl.DateTimeFormat(resolvedLocale, { month: 'long' });
      return Array.from({ length: 12 }, (_, i) => { const n = fmt.format(new Date(2024, i, 1)); return n.charAt(0).toUpperCase() + n.slice(1); });
    }, [resolvedLocale]);

    const shortMonthNames = useMemo(() => {
      const fmt = new Intl.DateTimeFormat(resolvedLocale, { month: 'short' });
      return Array.from({ length: 12 }, (_, i) => { const n = fmt.format(new Date(2024, i, 1)); return n.charAt(0).toUpperCase() + n.slice(1); });
    }, [resolvedLocale]);

    const weekdayNames = useMemo(() => {
      const fmt = new Intl.DateTimeFormat(resolvedLocale, { weekday: weekdayFormat });
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(2024, 0, 7 + ((i + firstDayOfWeek) % 7));
        const n = fmt.format(d);
        return weekdayFormat === 'narrow' ? n.charAt(0).toUpperCase() : n.charAt(0).toUpperCase() + n.slice(1);
      });
    }, [resolvedLocale, firstDayOfWeek, weekdayFormat]);

    const buildDaysGrid = useCallback((year: number, month: number) => {
      const firstOfMonth = new Date(year, month, 1);
      const startDay = (firstOfMonth.getDay() - firstDayOfWeek + 7) % 7;
      const cursor = new Date(year, month, 1 - startDay);
      const weeks: Date[][] = [];
      for (let w = 0; w < 6; w++) {
        const week: Date[] = [];
        for (let d = 0; d < 7; d++) { week.push(new Date(cursor)); cursor.setDate(cursor.getDate() + 1); }
        weeks.push(week);
      }
      return weeks;
    }, [firstDayOfWeek]);

    const chevronLeft = <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ transform: 'rotate(90deg)' }}><path d={CHEVRON_DOWN_PATH} /></svg>;
    const chevronRight = <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ transform: 'rotate(-90deg)' }}><path d={CHEVRON_DOWN_PATH} /></svg>;

    const renderDaysPanel = (monthOffset: number) => {
      const y = viewDate.getFullYear();
      const m = viewDate.getMonth() + monthOffset;
      const panelDate = new Date(y, m, 1);
      const weeks = buildDaysGrid(panelDate.getFullYear(), panelDate.getMonth());

      return (
        <div className={`${base}__panel`} key={monthOffset}>
          {numberOfMonths === 1 && (
            <div className={`${base}__header`}>
              <button type="button" className={`${base}__nav`} onClick={() => navMonth(-1)} aria-label={kreatiLocale.calendar.previousMonth}>{chevronLeft}</button>
              <button type="button" className={`${base}__title`} onClick={() => setCurrentView('months')}>
                {monthNames[panelDate.getMonth()]} {panelDate.getFullYear()}
              </button>
              <button type="button" className={`${base}__nav`} onClick={() => navMonth(1)} aria-label={kreatiLocale.calendar.nextMonth}>{chevronRight}</button>
            </div>
          )}
          {numberOfMonths > 1 && (
            <div className={`${base}__header`}>
              {monthOffset === 0 && <button type="button" className={`${base}__nav`} onClick={() => navMonth(-1)} aria-label={kreatiLocale.calendar.previousMonth}>{chevronLeft}</button>}
              {monthOffset !== 0 && <span className={`${base}__nav-spacer`} />}
              <span className={`${base}__title ${base}__title--static`}>{monthNames[panelDate.getMonth()]} {panelDate.getFullYear()}</span>
              {monthOffset === numberOfMonths - 1 && <button type="button" className={`${base}__nav`} onClick={() => navMonth(1)} aria-label={kreatiLocale.calendar.nextMonth}>{chevronRight}</button>}
              {monthOffset !== numberOfMonths - 1 && <span className={`${base}__nav-spacer`} />}
            </div>
          )}
          <div className={`${base}__grid`} role="grid">
            <div className={`${base}__weekdays`} role="row">
              {showWeekNumbers && <span className={`${base}__weekday ${base}__wk-header`} />}
              {weekdayNames.map((n, i) => <span key={i} className={`${base}__weekday`} role="columnheader">{n}</span>)}
            </div>
            {weeks.map((week, wi) => (
              <div key={wi} className={`${base}__week`} role="row">
                {showWeekNumbers && <span className={`${base}__wk`}>{getWeekNumber(week[0])}</span>}
                {week.map((day) => {
                  const sel = isSelected(day);
                  const tod = isSameDay(day, today);
                  const out = !isSameMonth(day, panelDate);
                  const dis = isDateDisabled(day);
                  const inR = isInRange(day);
                  const cls = [`${base}__day`, !unstyledDays && sel && `${base}__day--selected`, !unstyledDays && tod && `${base}__day--today`, out && `${base}__day--outside`, dis && `${base}__day--disabled`, !unstyledDays && inR && `${base}__day--in-range`].filter(Boolean).join(' ');
                  return (
                    <button key={day.toISOString()} type="button" className={cls} role="gridcell" aria-selected={sel} aria-disabled={dis || undefined} tabIndex={sel || (!selected && tod) ? 0 : -1}
                      onClick={dis ? undefined : () => { if (out) setViewDate(new Date(day.getFullYear(), day.getMonth(), 1)); selectDate(day); }}
                      onMouseEnter={selectionMode === 'range' ? () => setRangeHover(day) : undefined}
                    >
                      {dayTemplate ? dayTemplate(day, { selected: sel, today: tod, disabled: dis, outside: out, inRange: inR }) : day.getDate()}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      );
    };

    const renderMonthsView = () => (
      <>
        <div className={`${base}__header`}>
          <button type="button" className={`${base}__nav`} onClick={() => navYear(-1)} aria-label={kreatiLocale.calendar.previousYear}>{chevronLeft}</button>
          <button type="button" className={`${base}__title`} onClick={() => { setYearRangeStart(Math.floor(viewDate.getFullYear() / 12) * 12); setCurrentView('years'); }}>{viewDate.getFullYear()}</button>
          <button type="button" className={`${base}__nav`} onClick={() => navYear(1)} aria-label={kreatiLocale.calendar.nextYear}>{chevronRight}</button>
        </div>
        <div className={`${base}__months-grid`} role="grid">
          {shortMonthNames.map((n, i) => (
            <button key={i} type="button" role="gridcell" aria-selected={viewDate.getMonth() === i || undefined} className={[`${base}__cell`, viewDate.getMonth() === i && `${base}__cell--selected`].filter(Boolean).join(' ')}
              onClick={() => { setViewDate(new Date(viewDate.getFullYear(), i, 1)); if (viewProp === 'month') { updateValue(new Date(viewDate.getFullYear(), i, 1)); if (!inline) { setPopoverOpen(false); onBlur?.(); } } else setCurrentView('days'); }}>
              {n}
            </button>
          ))}
        </div>
      </>
    );

    const renderYearsView = () => {
      const years = Array.from({ length: 12 }, (_, i) => yearRangeStart + i);
      return (
        <>
          <div className={`${base}__header`}>
            <button type="button" className={`${base}__nav`} onClick={() => setYearRangeStart((p) => p - 12)} aria-label={kreatiLocale.calendar.previousYear}>{chevronLeft}</button>
            <span className={`${base}__title ${base}__title--static`}>{yearRangeStart} - {yearRangeStart + 11}</span>
            <button type="button" className={`${base}__nav`} onClick={() => setYearRangeStart((p) => p + 12)} aria-label={kreatiLocale.calendar.nextYear}>{chevronRight}</button>
          </div>
          <div className={`${base}__years-grid`} role="grid">
            {years.map((y) => (
              <button key={y} type="button" role="gridcell" aria-selected={viewDate.getFullYear() === y || undefined} className={[`${base}__cell`, viewDate.getFullYear() === y && `${base}__cell--selected`].filter(Boolean).join(' ')}
                onClick={() => { setViewDate(new Date(y, viewDate.getMonth(), 1)); if (viewProp === 'year') { updateValue(new Date(y, 0, 1)); if (!inline) { setPopoverOpen(false); onBlur?.(); } } else setCurrentView('months'); }}>
                {y}
              </button>
            ))}
          </div>
        </>
      );
    };

    const normalizeTime = useCallback((rawH: number, rawM: number, rawS: number): { h: number; m: number; s: number } => {
      let totalSec = rawH * 3600 + rawM * 60 + rawS;
      totalSec = ((totalSec % 86400) + 86400) % 86400;
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      return { h, m, s };
    }, []);

    const timeFieldsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const el = timeFieldsRef.current;
      if (!el) return;
      const handler = (e: WheelEvent) => { e.preventDefault(); };
      el.addEventListener('wheel', handler, { passive: false });
      return () => el.removeEventListener('wheel', handler);
    });

    const renderTimePicker = () => {
      const d = selected && !Array.isArray(selected) ? selected : new Date();
      const h = pendingTime ? pendingTime.h : d.getHours();
      const m = pendingTime ? pendingTime.m : d.getMinutes();
      const s = pendingTime ? pendingTime.s : d.getSeconds();
      const dispH = is12h ? (h % 12 || 12) : h;
      const isAM = h < 12;

      const applyTime = (rawH: number, rawM: number, rawS: number) => {
        const n = normalizeTime(rawH, rawM, rawS);
        setTime(n.h, n.m, n.s);
      };

      const onChangeH = (e: React.ChangeEvent<HTMLInputElement>) => {
        let v = parseInt(e.target.value, 10) || 0;
        if (is12h) {
          if (v > 12) v = 1; else if (v < 1) v = 12;
          const base24 = isAM ? (v === 12 ? 0 : v) : (v === 12 ? 12 : v + 12);
          applyTime(base24, m, s);
        } else {
          applyTime(v, m, s);
        }
      };
      const onChangeM = (e: React.ChangeEvent<HTMLInputElement>) => applyTime(h, parseInt(e.target.value, 10) || 0, s);
      const onChangeS = (e: React.ChangeEvent<HTMLInputElement>) => applyTime(h, m, parseInt(e.target.value, 10) || 0);

      const onWheelH = (e: React.WheelEvent) => {
        const delta = e.deltaY < 0 ? 1 : -1;
        applyTime(h + delta, m, s);
      };
      const onWheelM = (e: React.WheelEvent) => applyTime(h, m + (e.deltaY < 0 ? 1 : -1), s);
      const onWheelS = (e: React.WheelEvent) => applyTime(h, m, s + (e.deltaY < 0 ? 1 : -1));

      const hourLabel = timeLabelsShort ? kreatiLocale.calendar.hourShort : kreatiLocale.calendar.hour;
      const minuteLabel = timeLabelsShort ? kreatiLocale.calendar.minuteShort : kreatiLocale.calendar.minute;
      const secondLabel = timeLabelsShort ? kreatiLocale.calendar.secondShort : kreatiLocale.calendar.second;

      const isTimeOnly = viewProp === 'time';

      return (
        <div className={`${base}__time ${isTimeOnly ? `${base}__time--no-border` : ''}`}>
          {is12h && (
            <div className={`${base}__time-toggle`}>
              <ToggleButtonGroup
                options={[{ value: 'AM', label: 'AM' }, { value: 'PM', label: 'PM' }]}
                value={isAM ? 'AM' : 'PM'}
                onChange={(v) => { const toAM = v === 'AM'; if (toAM && !isAM) setTime(h - 12, m, s); else if (!toAM && isAM) setTime(h + 12, m, s); }}
                size={size}
              />
            </div>
          )}
          <div className={`${base}__time-fields`} ref={timeFieldsRef}>
            <div className={`${base}__time-field`} ref={timeHourRef} onWheel={onWheelH}>
              <Input type="number" size={size} label={hourLabel} value={String(dispH).padStart(2, '0')} onChange={onChangeH} step={1} fullWidth />
            </div>
            <span className={`${base}__time-sep`}>:</span>
            <div className={`${base}__time-field`} ref={timeMinRef} onWheel={onWheelM}>
              <Input type="number" size={size} label={minuteLabel} value={String(m).padStart(2, '0')} onChange={onChangeM} step={1} fullWidth />
            </div>
            {showSeconds && (
              <>
                <span className={`${base}__time-sep`}>:</span>
                <div className={`${base}__time-field`} ref={timeSecRef} onWheel={onWheelS}>
                  <Input type="number" size={size} label={secondLabel} value={String(s).padStart(2, '0')} onChange={onChangeS} step={1} fullWidth />
                </div>
              </>
            )}
          </div>
        </div>
      );
    };

    const timesIcon = <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={TIMES_PATH} /></svg>;

    const handleSelectToday = useCallback(() => selectDate(new Date()), [selectDate]);
    const handleClear = useCallback(() => { updateValue(null); if (!inline) { setPopoverOpen(false); onBlur?.(); } }, [updateValue, inline, onBlur]);

    const renderButtonBar = () => {
      if (buttonBarTemplate) {
        return (
          <div className={`${base}__button-bar`}>
            {buttonBarTemplate({ selectToday: handleSelectToday, clear: handleClear })}
          </div>
        );
      }
      return (
        <div className={`${base}__button-bar`}>
          <Button label={kreatiLocale.calendar.today} buttonType="text" size={size} onClick={handleSelectToday} />
          <Button iconLeft={timesIcon} buttonType="text" size={size} severity="secondary" ariaLabel={kreatiLocale.calendar.clear} onClick={handleClear} />
        </div>
      );
    };

    const builtInPresets = useMemo((): CalendarPreset[] => {
      const t = new Date();
      const startOfWeek = new Date(t);
      startOfWeek.setDate(t.getDate() - ((t.getDay() - (firstDayOfWeek) + 7) % 7));
      return [
        { label: kreatiLocale.calendar.presetToday, value: () => new Date() },
        { label: kreatiLocale.calendar.presetYesterday, value: () => { const d = new Date(); d.setDate(d.getDate() - 1); return d; } },
        { label: kreatiLocale.calendar.presetLast7Days, value: () => { const e = new Date(); const s = new Date(); s.setDate(e.getDate() - 6); return [s, e]; } },
        { label: kreatiLocale.calendar.presetLast14Days, value: () => { const e = new Date(); const s = new Date(); s.setDate(e.getDate() - 13); return [s, e]; } },
        { label: kreatiLocale.calendar.presetLast30Days, value: () => { const e = new Date(); const s = new Date(); s.setDate(e.getDate() - 29); return [s, e]; } },
        { label: kreatiLocale.calendar.presetThisWeek, value: () => [new Date(startOfWeek), new Date()] },
        { label: kreatiLocale.calendar.presetThisMonth, value: () => [new Date(t.getFullYear(), t.getMonth(), 1), new Date()] },
        { label: kreatiLocale.calendar.presetLastMonth, value: () => [new Date(t.getFullYear(), t.getMonth() - 1, 1), new Date(t.getFullYear(), t.getMonth(), 0)] },
        { label: kreatiLocale.calendar.presetThisYear, value: () => [new Date(t.getFullYear(), 0, 1), new Date()] },
      ];
    }, [kreatiLocale, firstDayOfWeek]);

    const resolvedPresets = presets === true ? builtInPresets : Array.isArray(presets) ? presets : null;

    const presetListItems = useMemo((): ListItem[] | null => {
      if (!resolvedPresets) return null;
      return resolvedPresets.map((p, i) => ({ key: `preset-${i}`, label: p.label }));
    }, [resolvedPresets]);

    const handlePresetSelect = useCallback((key: string) => {
      if (!resolvedPresets) return;
      const idx = parseInt(key.replace('preset-', ''), 10);
      const preset = resolvedPresets[idx];
      if (!preset) return;
      const val = typeof preset.value === 'function' ? preset.value() : preset.value;
      updateValue(val);
      if (Array.isArray(val) && val.length > 0) setViewDate(new Date(val[0].getFullYear(), val[0].getMonth(), 1));
      else if (!Array.isArray(val)) setViewDate(new Date(val.getFullYear(), val.getMonth(), 1));
      if (!inline) { setPopoverOpen(false); onBlur?.(); }
    }, [resolvedPresets, updateValue, inline, onBlur]);

    const calendarPanel = (
      <div className={`${base}__body ${base}__body--${size} ${numberOfMonths > 1 ? `${base}__body--multi` : ''} ${viewProp === 'time' ? `${base}__body--time-only` : ''} ${viewProp === 'time' && showSeconds ? `${base}__body--time-seconds` : ''}`}>
        {(showTime || viewProp === 'time') && renderTimePicker()}
        {(currentView === 'days' || viewProp === 'time') && (
          <div className={`${base}__panels`}>
            {viewProp !== 'time' && Array.from({ length: numberOfMonths }, (_, i) => renderDaysPanel(i))}
          </div>
        )}
        {currentView === 'months' && renderMonthsView()}
        {currentView === 'years' && renderYearsView()}
        {showButtonBar && renderButtonBar()}
      </div>
    );

    const calendarBody = presetListItems ? (
      <div className={`${base}__with-presets`}>
        <div className={`${base}__presets`}>
          <List items={presetListItems} onSelect={handlePresetSelect} size={size} />
        </div>
        {calendarPanel}
      </div>
    ) : calendarPanel;

    if (inline) {
      return (
        <div ref={wrapperRef} className={`${base} ${base}--inline ${className}`.trim()} role="group" aria-label={kreatiLocale.calendar.calendarLabel}>
          {calendarBody}
        </div>
      );
    }

    const inputDisplay = displayValue(selected, selectionMode, viewProp, dateFormat, resolvedLocale, showTime, is12h, showSeconds, monthNames);
    const hasValue = !!selected && (!Array.isArray(selected) || selected.length > 0);

    const calendarIcon = icon || (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={CALENDAR_PATH} /></svg>
    );

    const triggerClasses = [
      `${base}__trigger`, `${base}__trigger--${size}`,
      hasError && `${base}__trigger--error`,
      !hasError && success && `${base}__trigger--success`,
      disabled && `${base}__trigger--disabled`,
      readOnly && `${base}__trigger--readonly`,
      popoverOpen && `${base}__trigger--open`,
      fullWidth && `${base}__trigger--full-width`,
    ].filter(Boolean).join(' ');

    const wrapperClasses = [base, `${base}--${variant}`, fullWidth && `${base}--full-width`, className].filter(Boolean).join(' ');
    const legendText = hasLabel ? `${label}${required ? ' *' : ''}` : '';

    const triggerInner = (
      <>
        <span className={`${base}__input-text ${!hasValue ? `${base}__input-text--placeholder` : ''}`}>
          {hasValue ? inputDisplay : (placeholder || (hasLabel && isFloating ? '\u00A0' : ''))}
        </span>
        <span className={`${base}__input-icon`} aria-hidden="true">{calendarIcon}</span>
      </>
    );

    const triggerEl = isFloating ? (
      <fieldset className={triggerClasses} disabled={disabled} tabIndex={disabled ? -1 : 0} role="group" aria-describedby={describedBy}>
        {hasLabel && <legend className={`${base}__legend`}><span className={`${base}__legend-text`}>{legendText}</span></legend>}
        <div className={`${base}__trigger-inner`}>{triggerInner}</div>
        {hasLabel && <label className={`${base}__floating-label ${hasValue || popoverOpen ? `${base}__floating-label--active` : ''}`}>{label}{required && <span className={`${base}__floating-required`} aria-hidden="true">*</span>}</label>}
      </fieldset>
    ) : (
      <div className={triggerClasses} tabIndex={disabled ? -1 : 0} role="group" aria-describedby={describedBy}>
        {triggerInner}
      </div>
    );

    const popoverContent = (
      <div className={`${base}__popover-content ${touchUI ? `${base}__popover-content--touch` : ''}`}>
        {calendarBody}
      </div>
    );

    const isRangeIncomplete = selectionMode === 'range' && Array.isArray(selected) && selected.length === 1;

    const inputEl = (
      <Popover
        content={popoverContent}
        open={popoverOpen}
        onOpenChange={(o) => { if (disabled || readOnly) return; if (!o && isRangeIncomplete) return; if (!o) { commitPendingTime(); onBlur?.(); } setPopoverOpen(o); }}
        position="bottom"
        disabled={disabled || readOnly}
        matchTriggerWidth={false}
      >
        {triggerEl}
      </Popover>
    );

    const hiddenInput = name ? <input type="hidden" name={name} value={hasValue ? (Array.isArray(selected) ? selected.map((d) => d.toISOString()).join(',') : selected!.toISOString()) : ''} /> : null;

    if (isFloating) {
      return (
        <div ref={wrapperRef} className={wrapperClasses}>
          {inputEl}
          {hasError && errorMessage && <span className={`${base}__error`} id={errorId} role="alert">{errorMessage}</span>}
          {helperText && <span className={[`${base}__helper`, helperSeverity && `${base}__helper--${helperSeverity}`].filter(Boolean).join(' ')} id={helperId}>{helperText}</span>}
          {hiddenInput}
        </div>
      );
    }

    if (!hasWrapper) {
      return <div ref={wrapperRef} className={wrapperClasses}>{inputEl}{hiddenInput}</div>;
    }

    return (
      <div ref={wrapperRef} className={wrapperClasses}>
        <FieldWrapper label={label} htmlFor={calId} required={required} helperText={helperText} error={errorMessage} success={success} helperSeverity={helperSeverity} size={size} disabled={disabled} fullWidth={fullWidth}>
          {inputEl}
        </FieldWrapper>
        {hiddenInput}
      </div>
    );
  },
);

Calendar.displayName = 'Calendar';
