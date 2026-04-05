/** All translatable strings used by Kreati components */
export interface KreatiLocale {
  /** Select component */
  select: {
    filterPlaceholder: string;
    emptyMessage: string;
    clearLabel: string;
  };
  /** MultiSelect component */
  multiSelect: {
    filterPlaceholder: string;
    emptyMessage: string;
    clearLabel: string;
    selectAll: string;
    selectedCount: string;
  };
  /** Calendar component */
  calendar: {
    previousMonth: string;
    nextMonth: string;
    previousYear: string;
    nextYear: string;
    calendarLabel: string;
    today: string;
    clear: string;
    hour: string;
    hourShort: string;
    minute: string;
    minuteShort: string;
    second: string;
    secondShort: string;
    presetToday: string;
    presetYesterday: string;
    presetLast7Days: string;
    presetLast14Days: string;
    presetLast30Days: string;
    presetThisWeek: string;
    presetThisMonth: string;
    presetLastMonth: string;
    presetThisYear: string;
  };
  /** Slider component */
  slider: {
    rangeMin: string;
    rangeMax: string;
  };
  /** General / shared */
  common: {
    loading: string;
    close: string;
    search: string;
  };
}
