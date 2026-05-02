// Components
export { AutoComplete } from "./components/AutoComplete";
export type {
  AutoCompleteProps,
  AutoCompleteItem,
} from "./components/AutoComplete";
export { Button } from "./components/Button";
export type { ButtonProps } from "./components/Button";
export { Badge } from "./components/Badge";
export type { BadgeProps } from "./components/Badge";
export { Chip } from "./components/Chip";
export type { ChipProps } from "./components/Chip";
export { NavigationBar } from "./components/NavigationBar";
export type { NavigationBarProps } from "./components/NavigationBar";
export { TabMenu } from "./components/TabMenu";
export type { TabMenuProps } from "./components/TabMenu";
export { Tabs, TabPanel } from "./components/Tabs";
export type { TabsProps, TabPanelProps } from "./components/Tabs";
export { SideMenu } from "./components/SideMenu";
export type { SideMenuProps } from "./components/SideMenu";
export { Breadcrumb } from "./components/Breadcrumb";
export type { BreadcrumbProps } from "./components/Breadcrumb";
export { ContextMenu } from "./components/ContextMenu";
export type { ContextMenuProps } from "./components/ContextMenu";
export { MenuBar } from "./components/MenuBar";
export type { MenuBarProps } from "./components/MenuBar";
export { DockMenu } from "./components/DockMenu";
export type { DockMenuProps } from "./components/DockMenu";
export { Card } from "./components/Card";
export type { CardProps } from "./components/Card";
export { Carousel } from "./components/Carousel";
export type { CarouselProps, CarouselItem } from "./components/Carousel";
export { Panel } from "./components/Panel";
export type { PanelProps } from "./components/Panel";
export { Accordion, AccordionTab } from "./components/Accordion";
export type { AccordionProps, AccordionTabProps } from "./components/Accordion";
export { Stepper, StepperPanel } from "./components/Stepper";
export type { StepperProps, StepperPanelProps } from "./components/Stepper";
export { Divider } from "./components/Divider";
export type { DividerProps } from "./components/Divider";
export { HeroSection } from "./components/HeroSection";
export type { HeroSectionProps } from "./components/HeroSection";
export { DynamicSvg } from "./components/DynamicSvg";
export type {
  DynamicSvgProps,
  SvgElementOverride,
  SvgElementStyle,
  SvgAnimation,
  SvgElementListeners,
} from "./components/DynamicSvg";
export { FieldWrapper } from "./components/FieldWrapper";
export type { FieldWrapperProps } from "./components/FieldWrapper";
export { Input } from "./components/Input";
export type { InputProps } from "./components/Input";
export { InputMask } from "./components/InputMask";
export type { InputMaskProps } from "./components/InputMask";
export { Textarea } from "./components/Textarea";
export type { TextareaProps } from "./components/Textarea";
export { ScrollBar } from "./components/ScrollBar";
export type { ScrollBarProps } from "./components/ScrollBar";
export { ScrollArea } from "./components/ScrollArea";
export type { ScrollAreaProps } from "./components/ScrollArea";
export { Tooltip } from "./components/Tooltip";
export type {
  TooltipProps,
  TooltipPosition,
  TooltipEvent,
} from "./components/Tooltip";
export { Popover } from "./components/Popover";
export type { PopoverProps, PopoverPosition } from "./components/Popover";
export { Calendar } from "./components/Calendar";
export type {
  CalendarProps,
  CalendarPreset,
  CalendarSelectionMode,
  CalendarView,
  CalendarWeekdayFormat,
  CalendarHourFormat,
} from "./components/Calendar";

export { List } from "./components/List";
export type { ListProps, ListItem } from "./components/List";

export { Slider } from "./components/Slider";
export type { SliderProps, SliderMark } from "./components/Slider";

export { useOverlayPosition } from "./components/useOverlayPosition";
export { useLayerZIndex } from "./components/LayerContext";
export { useMediaQuery } from "./components/useMediaQuery";
export { useLocalStorage } from "./components/useLocalStorage";

export { Dialog } from "./components/Dialog";
export type { DialogProps, DialogPosition } from "./components/Dialog";
export { Drawer } from "./components/Drawer";
export type { DrawerProps, DrawerPosition } from "./components/Drawer";
export { EmptyState } from "./components/EmptyState";
export type { EmptyStateProps } from "./components/EmptyState";
export { SegmentedControl } from "./components/SegmentedControl";
export type {
  SegmentedControlProps,
  SegmentedControlOption,
} from "./components/SegmentedControl";
export { CodeBlock } from "./components/CodeBlock";
export type { CodeBlockProps, CodeLanguage } from "./components/CodeBlock";
export { TextEditor } from "./components/TextEditor";
export type { TextEditorProps } from "./components/TextEditor";
export {
  htmlToDocument,
  documentToHtml,
  sanitizePastedHtml,
  documentCharCount,
} from "./components/TextEditorModel";
export type {
  EditorDocument,
  EditorBlockNode,
  EditorTextNode,
  EditorNode,
  EditorMark,
} from "./components/TextEditorModel";
export { Select } from "./components/Select";
export type {
  SelectProps,
  SelectOption,
  SelectGroup,
} from "./components/Select";
export { MultiSelect } from "./components/MultiSelect";
export type { MultiSelectProps } from "./components/MultiSelect";
export { Checkbox } from "./components/Checkbox";
export type { CheckboxProps } from "./components/Checkbox";
export { CheckboxGroup } from "./components/CheckboxGroup";
export type {
  CheckboxGroupProps,
  CheckboxGroupOption,
} from "./components/CheckboxGroup";
export { Radio } from "./components/Radio";
export type { RadioProps } from "./components/Radio";
export { RadioGroup } from "./components/RadioGroup";
export type {
  RadioGroupProps,
  RadioGroupOption,
} from "./components/RadioGroup";
export { Rating } from "./components/Rating";
export type { RatingProps } from "./components/Rating";
export { Switch } from "./components/Switch";
export type { SwitchProps } from "./components/Switch";
export { ToggleButton } from "./components/ToggleButton";
export type { ToggleButtonProps } from "./components/ToggleButton";
export { ToggleButtonGroup } from "./components/ToggleButtonGroup";
export type {
  ToggleButtonGroupProps,
  ToggleButtonGroupOption,
} from "./components/ToggleButtonGroup";
export { ItemPicker, Transfer } from "./components/ItemPicker";
export type {
  ItemPickerProps,
  ItemPickerItem,
  TransferProps,
  TransferItem,
} from "./components/ItemPicker";
export { SpeedDial } from "./components/SpeedDial";
export type {
  SpeedDialProps,
  SpeedDialItem,
  SpeedDialDirection,
  SpeedDialLayout,
} from "./components/SpeedDial";
export { DropdownButton } from "./components/DropdownButton";
export type { DropdownButtonProps } from "./components/DropdownButton";
export { ButtonGroup } from "./components/ButtonGroup";
export type { ButtonGroupProps } from "./components/ButtonGroup";
export { InputGroup } from "./components/InputGroup";
export type { InputGroupProps } from "./components/InputGroup";
export { ColorPicker } from "./components/ColorPicker";
export type { ColorPickerProps } from "./components/ColorPicker";
export { Dial } from "./components/Dial";
export type { DialProps } from "./components/Dial";
export { Message } from "./components/Message";
export type { MessageProps, MessageSeverity } from "./components/Message";
export { MessageList } from "./components/MessageList";
export type {
  MessageListProps,
  MessageListItem,
  MessageListRef,
} from "./components/MessageList";
export { ToastContainer } from "./components/Toast";
export type {
  ToastContainerProps,
  ToastContainerRef,
  ToastItem,
  ToastSeverity,
  ToastPosition,
} from "./components/Toast";
export { Skeleton } from "./components/Skeleton";
export type {
  SkeletonProps,
  SkeletonShape,
  SkeletonAnimation,
} from "./components/Skeleton";
export { ProgressBar } from "./components/ProgressBar";
export type { ProgressBarProps } from "./components/ProgressBar";
export { Avatar } from "./components/Avatar";
export type { AvatarProps, AvatarShape } from "./components/Avatar";
export { AvatarGroup } from "./components/AvatarGroup";
export type { AvatarGroupProps } from "./components/AvatarGroup";
export { Tag } from "./components/Tag";
export type { TagProps } from "./components/Tag";
export { Spinner } from "./components/Spinner";
export type { SpinnerProps } from "./components/Spinner";
export { Pagination } from "./components/Pagination";
export type { PaginationProps } from "./components/Pagination";
export { Timeline } from "./components/Timeline";
export type { TimelineProps, TimelineEvent } from "./components/Timeline";
export { Tree } from "./components/Tree";
export type { TreeProps, TreeNode } from "./components/Tree";
export { TreeSelect } from "./components/TreeSelect";
export type { TreeSelectProps } from "./components/TreeSelect";
export { FileUpload } from "./components/FileUpload";
export type { FileUploadProps } from "./components/FileUpload";
export { Image } from "./components/Image";
export type { ImageProps } from "./components/Image";

export { Kanban } from "./components/Kanban";
export type {
  KanbanProps,
  KanbanCard,
  KanbanColumn,
  KanbanSwimlane,
  KanbanTag,
  KanbanMoveEvent,
  KanbanSeverity,
  KanbanAssignee,
  KanbanChecklistItem,
  KanbanCardData,
  KanbanCardSlots,
} from "./components/KanbanTypes";

export { Gantt } from "./components/Gantt";
export type {
  GanttProps,
  GanttTask,
  GanttColumn,
  GanttColumnDef,
  GanttPresetColumn,
  GanttSeverity,
  GanttTaskType,
  GanttDependencyType,
  GanttViewMode,
  GanttDependency,
  GanttDependencyInput,
  GanttAssignee,
  GanttEditSlots,
  GanttToolbarSlots,
  GanttExportFormat,
  GanttTaskChangeEvent,
  GanttProgressChangeEvent,
  GanttRef,
} from "./components/GanttTypes";

export { DataTable } from "./components/DataTable";
export type {
  DataTableProps,
  DataTableRef,
  DataTableColumn,
  DataTableActionItem,
  DataTableLazyEvent,
  DataTableCellEditEvent,
  DataTableRowEditEvent,
  SortDirection,
  SortMeta,
  SelectionMode,
  FilterMatchMode,
  ColumnFilterMeta,
  ActionPreset,
  ExportFormat,
  FrozenPosition,
  RowClassCallback,
  RowStyleCallback,
} from "./components/DataTable";

// Types
export type { MenuItem, NavigationRouter } from "./types/navigation";
export { resolveIcon, renderMenuIcon } from "./components/resolveIcon";

// Locale
export {
  KreatiProvider,
  useKreatiLocale,
  useKreatiTheme,
  en,
  es,
} from "./locale";
export type { KreatiLocale, KreatiProviderProps, KreatiTheme } from "./locale";

// Styles
import "./styles/variables.css";
import "./styles/reset.css";
import "./components/Button.css";
import "./components/Badge.css";
import "./components/Chip.css";
import "./components/NavigationBar.css";
import "./components/TabMenu.css";
import "./components/Tabs.css";
import "./components/SideMenu.css";
import "./components/Breadcrumb.css";
import "./components/ContextMenu.css";
import "./components/MenuBar.css";
import "./components/DockMenu.css";
import "./components/Card.css";
import "./components/Carousel.css";
import "./components/Panel.css";
import "./components/Accordion.css";
import "./components/Stepper.css";
import "./components/Divider.css";
import "./components/HeroSection.css";
import "./components/DynamicSvg.css";
import "./components/FieldWrapper.css";
import "./components/Input.css";
import "./components/Textarea.css";
import "./components/ScrollBar.css";
import "./components/ScrollArea.css";
import "./styles/kreati-scroll.css";
import "./styles/utilities.css";
import "./components/Tooltip.css";
import "./components/Popover.css";
import "./components/Calendar.css";
import "./components/List.css";
import "./components/Slider.css";
import "./components/Dialog.css";
import "./components/Drawer.css";
import "./components/EmptyState.css";
import "./components/SegmentedControl.css";
import "./components/CodeBlock.css";
import "./components/TextEditor.css";
import "./components/Select.css";
import "./components/MultiSelect.css";
import "./components/Checkbox.css";
import "./components/CheckboxGroup.css";
import "./components/Radio.css";
import "./components/Switch.css";
import "./components/ToggleButton.css";
import "./components/ItemPicker.css";
import "./components/SpeedDial.css";
import "./components/DropdownButton.css";
import "./components/ButtonGroup.css";
import "./components/InputGroup.css";
import "./components/ColorPicker.css";
import "./components/Dial.css";
import "./components/Message.css";
import "./components/MessageList.css";
import "./components/Toast.css";
import "./components/Skeleton.css";
import "./components/ProgressBar.css";
import "./components/Avatar.css";
import "./components/AvatarGroup.css";
import "./components/Tag.css";
import "./components/Spinner.css";
import "./components/Pagination.css";
import "./components/Timeline.css";
import "./components/Tree.css";
import "./components/TreeSelect.css";
import "./components/FileUpload.css";
import "./components/Image.css";
import "./components/Kanban.css";
import "./components/Gantt.css";
import "./components/DataTable/DataTable.css";

// ─── Chart System ───────────────────────────────────────────────────────────
export {
  ChartCanvas,
  useChartCanvas,
  Axis,
  Legend,
  Crosshair,
  ConstantLine,
  ShadedArea,
  createLinearScale,
  createLogScale,
  createCategoryScale,
  createScale,
  niceDomain,
  invertLinear,
  resolveSeriesColor,
  getDefaultPalette,
  dashStyleToArray,
  CartesianChart,
  LineChart,
  BarChart,
  AreaChart,
  MixedChart,
  ScatterChart,
  PieChart,
  DonutChart,
  RadarChart,
  PolarAreaChart,
  GaugeChart,
  HeatmapChart,
  FunnelChart,
  TreemapChart,
  SankeyChart,
} from "./components/Chart";

export type {
  ChartDataPoint,
  ChartSeries,
  ChartFill,
  ChartConstant,
  ChartShadedArea,
  ChartAnnotation,
  ChartAxisConfig,
  ChartMargins,
  ChartSeverity,
  DashStyle,
  MarkerSymbol,
  AxisScaleType,
  ScaleFunction,
  ChartCanvasProps,
  AxisProps,
  LegendProps,
  CrosshairProps,
  ConstantLineProps,
  ShadedAreaProps,
  CartesianChartProps,
  CartesianContext,
  LineChartProps,
  BarChartProps,
  AreaChartProps,
  MixedChartProps,
  MixedChartLayer,
  ScatterChartProps,
  PieChartProps,
  PieDataItem,
  DonutChartProps,
  RadarChartProps,
  RadarSeries,
  PolarAreaChartProps,
  PolarDataItem,
  GaugeChartProps,
  GaugeZone,
  GaugeNeedleStyle,
  HeatmapChartProps,
  HeatmapCell,
  HeatmapColorStop,
  FunnelChartProps,
  FunnelStage,
  TreemapChartProps,
  TreemapNode,
  SankeyChartProps,
  SankeyNode,
  SankeyLink,
} from "./components/Chart";

import "./components/Chart/Chart.css";

export { sanitizeUrl, sanitizeCssValue } from "./components/sanitizeUrl";

export { QRCode } from "./components/QRCode";
export type { QRCodeProps, QRCodeRef } from "./components/QRCode";
export type { ECLevel } from "./components/qr/tables";
import "./components/QRCode.css";

export { Barcode } from "./components/Barcode";
export type {
  BarcodeProps,
  BarcodeRef,
  BarcodeFormat,
} from "./components/Barcode";
import "./components/Barcode.css";

export { DocumentViewer } from "./components/DocumentViewer";
export type {
  DocumentViewerProps,
  DocumentViewerRef,
  DocumentType,
} from "./components/DocumentViewer";
import "./components/DocumentViewer.css";
