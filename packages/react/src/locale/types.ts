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
  /** List component */
  list: {
    filterPlaceholder: string;
    emptyMessage: string;
  };
  /** Dialog / Popover confirm */
  dialog: {
    accept: string;
    reject: string;
    close: string;
    confirmation: string;
    maximize: string;
    restore: string;
  };
  /** Shared ARIA labels */
  common: {
    loading: string;
    close: string;
    search: string;
    filterOptions: string;
    increment: string;
    decrement: string;
    carousel: string;
    previous: string;
    next: string;
    page: string;
    copy: string;
    copied: string;
    code: string;
    showPassword: string;
    hidePassword: string;
    selectAll: string;
  };
  /** Message component */
  message: {
    close: string;
  };
  /** Toast component */
  toast: {
    close: string;
  };
  /** Dial component */
  dial: {
    ariaLabel: string;
  };
  /** EmptyState component */
  emptyState: {
    title: string;
    description: string;
  };
  /** TextEditor component */
  textEditor: {
    toolbar: string;
    bold: string;
    italic: string;
    underline: string;
    strikethrough: string;
    unorderedList: string;
    orderedList: string;
    link: string;
    code: string;
    blockquote: string;
    undo: string;
    redo: string;
    textStyle: string;
    fontSize: string;
    fontFamily: string;
    textColor: string;
    bgColor: string;
    paragraph: string;
    heading1: string;
    heading2: string;
    heading3: string;
    insertLink: string;
    removeLink: string;
    linkLabel: string;
    linkLabelPlaceholder: string;
  };
  /** Rating component */
  rating: {
    ariaLabel: string;
    clear: string;
  };
  /** ColorPicker component */
  colorPicker: {
    ariaLabel: string;
    saturation: string;
    hue: string;
    opacity: string;
    switchFormat: string;
  };
  /** FileUpload component */
  fileUpload: {
    clickToUpload: string;
    dragAndDrop: string;
    maxSize: string;
    removeFile: string;
  };
  /** Pagination component */
  pagination: {
    ariaLabel: string;
    first: string;
    previous: string;
    next: string;
    last: string;
    page: string;
  };
  /** ItemPicker component */
  itemPicker: {
    sourceHeader: string;
    targetHeader: string;
    moveAllToTarget: string;
    moveToTarget: string;
    moveToSource: string;
    moveAllToSource: string;
    filterPlaceholder: string;
    emptyMessage: string;
    itemCount: string;
    moveUp: string;
    moveDown: string;
  };
  /** DataTable component */
  dataTable: {
    ariaLabel: string;
    emptyMessage: string;
    filterPlaceholder: string;
    sortAscending: string;
    sortDescending: string;
    selectAll: string;
    selectRow: string;
    edit: string;
    delete: string;
    view: string;
    copy: string;
    print: string;
    rowsPerPage: string;
    pageInfo: string;
    exportCSV: string;
    reorderRow: string;
    reorderColumn: string;
  };
  /** AvatarGroup component */
  avatarGroup: {
    groupLabel: string;
    overflowLabel: string;
  };
  /** Kanban component */
  kanban: {
    boardLabel: string;
    cardLabel: string;
    cardCount: string;
    addCard: string;
    addCardPlaceholder: string;
    grabbed: string;
    dropped: string;
    cancelled: string;
    movedToColumn: string;
    movedPosition: string;
    cardDetail: string;
    createCard: string;
    editCard: string;
    title: string;
    description: string;
    priority: string;
    dueDate: string;
    save: string;
    cancel: string;
    create: string;
    deleteCard: string;
    confirmDelete: string;
    priorityLow: string;
    priorityMedium: string;
    priorityHigh: string;
    priorityCritical: string;
    noPriority: string;
    tags: string;
    tagsPlaceholder: string;
    assignees: string;
    assigneesPlaceholder: string;
    checklist: string;
    checklistAdd: string;
    descriptionPlaceholder: string;
    cover: string;
    coverPlaceholder: string;
    duplicate: string;
    moveToNext: string;
    addColumn: string;
    renameColumn: string;
    deleteColumn: string;
    moveColumnLeft: string;
    moveColumnRight: string;
    confirmDeleteColumn: string;
    newColumnTitle: string;
    editColumn: string;
    columnSeverity: string;
    columnMaxCards: string;
    severityNone: string;
    collapse: string;
    expand: string;
  };
  /** Chart components */
  chart: {
    resetZoom: string;
    exportPng: string;
    exportSvg: string;
    exportCsv: string;
    exportJsonTable: string;
    exportJsonSeries: string;
    menuLabel: string;
    filterPlaceholder: string;
    filterLabel: string;
    exportLabel: string;
    tooltipSingle: string;
    tooltipShared: string;
    othersLabel: string;
  };
  /** Gantt component */
  gantt: {
    ganttLabel: string;
    chartLabel: string;
    viewDay: string;
    viewWeek: string;
    viewMonth: string;
    today: string;
    start: string;
    end: string;
    progress: string;
    duration: string;
    assignees: string;
    milestone: string;
    summary: string;
    expand: string;
    collapse: string;
    edit: string;
    delete: string;
    editTask: string;
    deleteConfirm: string;
    save: string;
    cancel: string;
    title: string;
    severity: string;
    none: string;
    date: string;
    filter: string;
    export: string;
    criticalPath: string;
    baseline: string;
    autoSchedule: string;
    addTask: string;
    newTask: string;
    newGroup: string;
    resetZoom: string;
    undo: string;
    redo: string;
    addDependency: string;
    finishToStart: string;
    startToStart: string;
    finishToFinish: string;
    startToFinish: string;
    expandTable: string;
    collapseTable: string;
    dependsOn: string;
    requiredBy: string;
  };
}
