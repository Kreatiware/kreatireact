# Kreati

> A complete React UI ecosystem — 83+ components, 71 icons, 592 CSS utilities. Zero external dependencies.

Built AI-first with human review: every component was designed, coded, and tested using AI-assisted development, then reviewed and refined by the Kreatiware team. The result is a consistent, accessible, and secure component library ready for production.

## Packages

| Package | Description | Install |
|---------|-------------|---------|
| **@kreatiware/react** | 83+ React components with TypeScript, ARIA, 8 themes, locale system | `npm i @kreatiware/react` |
| **@kreatiware/icons** | 71 SVG icon components with name resolver | `npm i @kreatiware/icons` |
| **@kreatiware/layout** | 592 CSS utility classes (flex, grid, spacing, typography) | `npm i @kreatiware/layout` |

## Quick Start

```tsx
import { Button, DataTable, KreatiProvider, es } from '@kreatiware/react';
import { ArrowRight } from '@kreatiware/icons';
import '@kreatiware/react/dist/style.css';
import '@kreatiware/react/themes/dark.css';
import '@kreatiware/layout/dist/index.css';

const App = () => (
  <KreatiProvider locale={es} theme="auto">
    <Button label="Get started" severity="primary" iconRight={<ArrowRight size={16} />} />
  </KreatiProvider>
);
```

## Components

### Form (18)
Input, InputMask, InputGroup, Textarea, Select, MultiSelect, AutoComplete, Checkbox, CheckboxGroup, Radio, RadioGroup, Switch, Slider, Calendar, ColorPicker, FileUpload, Rating, Dial

### Feedback & Overlay (10)
Dialog, Drawer, Tooltip, Popover, Toast, Message, MessageList, Spinner, ProgressBar, Skeleton

### Layout & Data (22)
Card, Panel, Accordion, Tabs, TabMenu, Divider, Breadcrumb, Pagination, Avatar, AvatarGroup, Tag, Timeline, Tree, TreeSelect, Stepper, ScrollBar, ScrollArea, Image, List, Carousel, EmptyState, ItemPicker/Transfer

### Navigation (5)
NavigationBar, MenuBar, ContextMenu, DockMenu, SideMenu

### Buttons (6)
Button, ButtonGroup, DropdownButton, SpeedDial, ToggleButton, ToggleButtonGroup

### Rich Content (3)
TextEditor (WYSIWYG), CodeBlock, SegmentedControl

### Data (1)
DataTable — sorting, filtering, selection, inline editing, drag & drop, frozen columns, virtual scroll, tree mode, CSV/print/copy export, full keyboard navigation

### Charts (17)
LineChart, BarChart, AreaChart, ScatterChart, MixedChart, PieChart, DonutChart, RadarChart, PolarAreaChart, GaugeChart, HeatmapChart, FunnelChart, TreemapChart, SankeyChart, ChartGroup, ChartToolbar, CartesianChart

### Project Management (2)
**Kanban** — drag & drop, swimlanes, column management, card CRUD with Dialog, slots, uncontrolled/controlled

**Gantt** — task/milestone/summary bars, dependencies (FS/SS/FF/SF), critical path, baseline, auto-schedule, zoom, navigator, undo/redo, export

### Specialized (3)
**QRCode** — native Reed-Solomon SVG generation, error correction levels, logo support, export PNG/SVG

**Barcode** — Code128, EAN-13, EAN-8, UPC-A, Code39, export PNG/SVG

**DocumentViewer** — PDF (iframe), image (zoom/pan/rotate), text (line numbers)

### Foundation (4)
Badge, Chip, HeroSection, DynamicSvg

### Hooks (4)
useOverlayPosition, useLayerZIndex, useMediaQuery, useLocalStorage

## Themes

8 built-in themes. Import only what you need:

```tsx
// Auto dark mode (follows prefers-color-scheme)
<KreatiProvider theme="auto">

// Specific theme
<KreatiProvider theme="midnight">

// All themes at once
import '@kreatiware/react/themes/all.css';
```

| Theme | Style | Accent |
|-------|-------|--------|
| Light | Default | Amber |
| Dark | Dark | Orange |
| Midnight | Dark blue | Lavender |
| Abyss | OLED black | Emerald |
| Soft | Warm light | Gold |
| Arctic | Cool light | Teal |
| High Contrast | Accessibility | Orange |
| Kreati | Brand | Golden |

## Internationalization

Built-in English and Spanish. Add any language:

```tsx
import { KreatiProvider, es } from '@kreatiware/react';

<KreatiProvider locale={es}>
  <App />
</KreatiProvider>
```

25 locale namespaces covering all components with user-facing text, including ARIA labels.

## Design Principles

- **Zero dependencies** — React is the only peer dependency
- **TypeScript strict** — every prop typed with interfaces
- **Accessible** — WCAG 2.1 AA, ARIA, keyboard navigation, 4.5:1 contrast, prefers-reduced-motion
- **Secure** — URL sanitization, CSS injection prevention, no dangerouslySetInnerHTML/eval/innerHTML, defensive clipboard and storage handling
- **Themeable** — CSS variables only, never hardcoded values
- **Tree-shakeable** — import only what you use
- **SSR/RSC compatible** — "use client" directive via build banner
- **Form compatible** — works with Formik and React Hook Form out of the box

## Icons

71 SVG icons available as individual components or via name resolver:

```tsx
import { Search, ChevronDown } from '@kreatiware/icons';
import { Icon } from '@kreatiware/icons';

<Search size={20} color="currentColor" />
<Icon name="chevron-down" size={16} />
```

## Layout Utilities

592 CSS classes for rapid layout without writing custom CSS:

```html
<div class="k-flex k-justify-between k-items-center k-gap-4 k-p-4">
  <h1 class="k-text-2xl k-font-display k-font-bold">Title</h1>
  <span class="k-text-sm k-text-secondary">Subtitle</span>
</div>
```

Responsive breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px).

Custom prefix CLI: `npx kreati-layout --prefix="x" --output="./layout.css"`

## Development

```bash
npm install          # Install dependencies
npm run dev          # Development mode
npm run build        # Build all packages
npm run storybook    # Storybook (230+ stories)
npm run lint         # Lint packages
npm run format       # Prettier
npm run fix          # Lint + format combined
```

## AI-First Development

Kreati was built using AI-assisted development from the ground up. Every component — from the initial architecture to the final implementation — was designed and coded with AI, then reviewed and validated by the development team. This approach enabled:

- Consistent patterns across 83+ components
- Comprehensive ARIA and keyboard navigation on every interactive element
- Security hardening (URL sanitization, CSS injection prevention, SVG sanitization) applied systematically
- Full locale coverage with 25 namespaces
- 230+ Storybook stories for visual testing

The documentation serves as a knowledge base for the Kreati AI Agent — a subscription-based coding assistant specialized in the Kreati ecosystem.

## License

MIT — [Kreatiware](https://kreatiware.com)
